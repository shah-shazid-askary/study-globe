const { Ollama } = require('ollama');
const supabase = require('../config/supabase');

// Initialize Ollama
const ollamaConfig = {};
if (process.env.OLLAMA_HOST) ollamaConfig.host = process.env.OLLAMA_HOST;
if (process.env.OLLAMA_API_KEY) {
  ollamaConfig.headers = { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` };
}
const ollama = new Ollama(ollamaConfig);

async function loadSupabaseData() {
  const fetchTableData = async (table, cols) => {
    const { data, error } = await supabase.from(table).select(cols.join(','));
    if (error || !data) return [];
    const header = cols.join(',');
    const rows = data.map(row => cols.map(c => {
      let val = row[c] !== null && row[c] !== undefined ? String(row[c]) : '';
      if (val.includes(',')) val = `"${val}"`;
      return val;
    }).join(','));
    return [header, ...rows];
  };

  return {
    countries: await fetchTableData('countries', ['id', 'name']),
    universities: await fetchTableData('universities', ['id', 'created_at', 'Name', 'country_id', 'city', 'type', 'website', 'description']),
    programs: await fetchTableData('programs', ['id', 'created_at', 'university_id', 'degree', 'field', 'duration_years', 'tuition_per_year', 'degree_level_id']),
    language_requirements: await fetchTableData('language_requirements', ['id', 'created_at', 'university_id', 'test_name', 'min_score']),
    scholarships: await fetchTableData('scholarship_eligibility', ['id', 'created_at', 'university_id', 'degree_level_id', 'eligibility_basis', 'minimum_gpa', 'additional_notes']),
    intakes: await fetchTableData('intakes', ['id', 'created_at', 'university_id', 'intake_name', 'start_month'])
  };
}

async function fetchContext(userMessage) {
  const data = await loadSupabaseData();
  const queryString = userMessage ? String(userMessage) : '';
  const stopWords = new Set(['tell', 'about', 'and', 'with', 'for', 'the', 'university', 'universities', 'college', 'what', 'how', 'why', 'where', 'when', 'who', 'this', 'that', 'there', 'their', 'some', 'any', 'could', 'would', 'should', 'can', 'please']);
  const queryWords = queryString.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  const context = {};

  if (!data.countries || !data.universities) return context;

  const parseRecord = (line) => {
    let parts = []; let current = ''; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') inQuotes = !inQuotes;
        else if (line[i] === ',' && !inQuotes) { parts.push(current); current = ''; } 
        else current += line[i];
    }
    parts.push(current);
    return parts;
  };

  const matchedCountries = [];
  const matchedCountryIds = new Set();
  data.countries.slice(1).forEach(line => {
    const lower = line.toLowerCase();
    if (queryWords.some(w => lower.includes(w))) {
      matchedCountries.push(line);
      const parts = parseRecord(line);
      if (parts[0]) matchedCountryIds.add(parts[0].trim());
    }
  });

  const scoredUniversities = [];
  const matchedUniIds = new Set();
  data.universities.slice(1).forEach(line => {
    const parts = parseRecord(line);
    const uniId = parts[0] ? parts[0].trim() : null;
    const countryId = parts[3] ? parts[3].trim() : null;
    const lower = line.toLowerCase();
    
    let score = 0;
    if (countryId && matchedCountryIds.has(countryId)) score += 20; // High priority for country match
    for (const w of queryWords) {
      if (lower.includes(w)) score += 2;
    }
    
    if (score > 0) {
      scoredUniversities.push({ line, score, uniId });
    }
  });

  scoredUniversities.sort((a, b) => b.score - a.score);
  
  const matchedUniversities = scoredUniversities.slice(0, 100).map(s => {
    if (s.uniId) matchedUniIds.add(s.uniId);
    return s.line;
  });

  const filterRelational = (lines, uniIdIndex, maxLines) => {
    if (!lines || lines.length <= 1) return [];
    const header = lines[0];
    const scored = lines.slice(1).map(line => {
      const parts = parseRecord(line);
      const uniId = parts[uniIdIndex] ? parts[uniIdIndex].trim() : null;
      const lower = line.toLowerCase();
      
      let score = 0;
      if (uniId && matchedUniIds.has(uniId)) score += 10;
      for (const w of queryWords) {
        if (lower.includes(w)) score += 1;
      }
      return { line, score };
    });

    const result = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxLines)
      .map(s => s.line);

    if (result.length > 0) return [header, ...result];
    return lines.slice(0, 10);
  };

  context.countries = matchedCountries.length > 0 ? [data.countries[0], ...matchedCountries.slice(0, 30)] : data.countries.slice(0, 10);
  context.universities = matchedUniversities.length > 0 ? [data.universities[0], ...matchedUniversities.slice(0, 100)] : data.universities.slice(0, 20);
  context.programs = filterRelational(data.programs, 2, 120);
  context.language_requirements = filterRelational(data.language_requirements, 2, 50);
  context.scholarships = filterRelational(data.scholarships, 2, 60);
  context.intakes = filterRelational(data.intakes, 2, 50);

  return context;
}

function buildContextString(context) {
  const parts = [];
  for (const [category, lines] of Object.entries(context)) {
    if (lines.length > 0) {
      parts.push(`=== ${category.toUpperCase()} DATABASE RECORDS ===\n` + lines.join('\n'));
    }
  }
  return parts.join('\n\n');
}

module.exports = {
  ollama,
  fetchContext,
  buildContextString
};

const { ollama } = require('../utils/ragHelper');

const reviewSop = async (req, res) => {
  const { sop_text, target_program, target_country } = req.body;

  if (!sop_text || !sop_text.trim()) {
    return res.status(400).json({ error: 'Statement of Purpose text is required' });
  }

  try {
    const systemPrompt = `You are a Senior Admissions Reviewer for elite global universities.
Your job is to analyze the student's Statement of Purpose (SOP) or Motivation Letter and return structured feedback.
The target program is: "${target_program || 'Any'}" and the target country is: "${target_country || 'Any'}".

Evaluate the statement and return your feedback in clean Markdown format with the following structure:

### 📊 Evaluation Scores (out of 10)
* **Grammar, Tone & Vocabulary:** [Score]/10
* **Structure & Logical Flow:** [Score]/10
* **Clarity of Motivation & Goals:** [Score]/10

### 💡 Key Strengths
* [Detail 1]
* [Detail 2]

### 🛠️ Actionable Improvements
* [Improvement 1]
* [Improvement 2]
* [Improvement 3]

Ensure your feedback is critical, constructive, and highly professional. Avoid generic praise. Limit the output to 250-300 words maximum.`;

    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || 'gemma4:31b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here is my Statement of Purpose to review:\n\n${sop_text}` }
      ]
    });

    const feedback = response.message.content;
    res.json({ feedback });

  } catch (err) {
    console.error('SOP review error:', err);
    res.status(500).json({ error: 'AI reviewer is currently busy. Please try again in a few moments.' });
  }
};

module.exports = { reviewSop };

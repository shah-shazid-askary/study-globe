function normalizeUrl(url) {
  if (!url) return null;
  const trimmed = url.replace(/\/$/, '');
  return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
}

function resolveFrontendUrl(reqOrigin) {
  const configured = normalizeUrl(process.env.FRONTEND_URL);
  if (configured && !configured.includes('localhost')) {
    return configured;
  }

  const vercelProduction = normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (vercelProduction) return vercelProduction;

  const vercelBranch = normalizeUrl(process.env.VERCEL_BRANCH_URL);
  if (vercelBranch) return vercelBranch;

  const vercelUrl = normalizeUrl(process.env.VERCEL_URL);
  if (vercelUrl) return vercelUrl;

  if (reqOrigin) return reqOrigin.replace(/\/$/, '');

  return configured || 'http://localhost:3000';
}

module.exports = { resolveFrontendUrl };

const serverless = require('serverless-http');
const app = require('../server');

const handler = serverless(app);

// Vercel expects the handler as the default export; Netlify expects `.handler`
module.exports = handler;
module.exports.handler = handler;

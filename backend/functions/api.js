const serverless = require('serverless-http');

let appHandler;

function getHandler() {
  if (!appHandler) {
    const app = require('../server');
    appHandler = serverless(app);
  }
  return appHandler;
}

exports.handler = async (event, context) => {
  try {
    return await getHandler()(event, context);
  } catch (error) {
    console.error('API function error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};

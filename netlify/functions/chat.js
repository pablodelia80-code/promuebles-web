const { chat } = require('./bot/gemini');
const { NOMBRES_BOT } = require('./bot/knowledge');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Falta configurar GEMINI_API_KEY en Netlify.' }) };
  }

  try {
    const { history, message, sessionName } = JSON.parse(event.body || '{}');
    const nombreBot = NOMBRES_BOT.includes(sessionName) ? sessionName : NOMBRES_BOT[0];
    const reply = await chat(history || [], message, nombreBot, apiKey);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No se pudo responder. Probá de nuevo en un momento.' }),
    };
  }
};

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');

const app = express();
const PORT = 5000;

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_API_OPEN, 
});


app.post('/api/preguntar', async (req, res) => {
    const { pregunta } = req.body;

    if (!pregunta) {
        return res.status(400).json({
            estado: false,
            mensaje: "La pregunta es obligatoria",
        });
    }

    try {
        const thread = await openai.beta.threads.create();
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: pregunta,
        });

        const respuesta = await openai.beta.threads.runs.get(thread.id, {
            assistant_id: 'asst_5GXSDHtngTANnspOjhSav8bm',
        });

        res.json({
            estado: true,
            mensaje: respuesta.messages[0]?.content || "No repsuetsa",
        });
    } catch (error) {
        console.error("Error al procesar:", error);
        res.status(500).json({
            estado: false,
            mensaje: "Error al procesar",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

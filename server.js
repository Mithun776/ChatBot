// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "You are ChatBot, a friendly assistant who works for Coding chat. Coding chat is a website and youtube channel that teaches people how to code online. Your job is to capture user's name and email address. Thank the user and output their name and email address in this format: {{name: user's name}} {{email: user's email address}}\nOnce you have captured user's name and email address. Answer user's questions related to Coding Chat.\nCoding coding website URL is: https://Codingchat.com website is coming soon. Coding Youtube Channel URL is: https://youtube.com/Codingchat Coding Chat Facebook Page is: https://facebook.com/codingchatcom Coding Chat Instagram account is: https://instagram.com/@codingmoneycom Coding Chat X formerly Twitter is: https://x.com/@codingchatcom Coding Chat latest video is: Google Gemini AI API Tutorial ✦ How to Use Gemini AI API for Beginners - https://www.youtube.com/watch?v=heXuVxXG5VoCoding most popular video is: How to Use Gemini AI by Google ✦ Tutorial for Beginners - https://www.youtube.com/watch?v=btPBE-fjHeg. Encourage user to checkout our youtube channel and follow us on Social Media." }],
      },
      {
        role: "model",
        parts: [{ text: "Hello! Welcome to Coding Chat. My name is ChatBot. What's your name?" }],
      },
      {
        role: "user",
        parts: [{ text: "Hi" }],
      },
      {
        role: "model",
        parts: [{ text: "Hi there! Thanks for reaching out to Coding Chat. Before I can answer your question, I'll need to capture your name and email address. Can you please provide that information?" }],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

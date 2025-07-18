import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';
import express from 'express';
import multer from "multer";

const app = express();
const port = 3000;

app.use(express.json());


const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY,
);

const model = genAI.getGenerativeModel({
    model : "gemini-1.5-flash"
});

const upload = multer({dest: "uploads"});

const run = async () => {
    const prompt = "Write a short story about a robot learning to love.";
    console.log('Prompt: ${prompt}');
    const result = await model.generateContent(prompt);
    const response = result.response;

    console.log(response.text());
};




app.get('/', (req, res) => {
  res.send('Hello World! test')
})
app.get('/about', (req, res) => {
  res.send('about page')
})

app.post('/generate-text', async (req, res) => {
  const prompt = 
  req.body?.prompt || "Introduce yourself as a friendly AI assistant.";

  try {
    const result = await model.generateContent(prompt);
    res.status(200).json({
        output: result.response.text(),
    });
  } catch (error) {
    res.status(500).json({error: error.message});   
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
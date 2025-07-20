import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';
import express from 'express';
import multer from "multer";
import fs from 'fs';

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



// prompt text
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


// image
const imageToGenerativePart = filePath => {
  const imageData = fs.readFileSync(filePath);
  return {
    inlineData: {
      mimeType: 'image/jpeg/png/jpg',
      data: Buffer.from(imageData).toString('base64'),
    },
  };
};
app.post('/generate-image', upload.single('image'), async (req, res) => {
  const prompt = req.body?.prompt || "Describe the image";

  try {
    const image = imageToGenerativePart(req.file?.path);
    const result = await model.generateContent([prompt, image]);
    res.status(200).json({
      output: result.response.text(),
      // image: result.response.image,
    });
  } catch (error) {
    res.status(500).json({error: error.message});   
  }
});


// dokument
app.post('/generate-document', upload.single('document'), async (req, res) => {
  const prompt = req.body?.prompt || "Rangkum dokumen ini";
  const filePath = req.file?.path;
  const buffer = fs.readFileSync(filePath);
  const base64Data = buffer.toString('base64');
  const mimeType = req.file?.mimetype;

  try {
    const documentPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };
    const result = await model.generateContent([prompt, documentPart]);
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
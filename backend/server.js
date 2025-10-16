import "dotenv/config"; // Loads .env variables
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { YoutubeTranscript } from "youtube-transcript";
import { getSubtitles } from "youtube-captions-scraper";
import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
// Configure Multer
const upload = multer({ dest: "uploads/" });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(cors({ origin: `${process.env.FRONTEND_URL}` }));
const port = 5122;

// const ai = new GoogleGenAI();

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// function extractVideoId(url) {
//   const regex = /(?:\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/;
//   const match = url.match(regex);
//   return match ? match[1] : null;
// }

app.get("/", (req, res) => {
  res.send("api success");
});
app.get("/ask", async (req, res) => {
  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain AI in a few words",
    });

    res.send({ answer: result.text });
  } catch (error) {
    console.error("Error calling Gemini:", error);
    res.status(500).send("Error calling Gemini");
  }
});

app.get("/transcript", (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("Missing URL");

  const scriptPath = path.join(__dirname, "get_transcript.py");

  execFile("python", [scriptPath, videoUrl], async (error, stdout, stderr) => {
    if (error) {
      console.error("Python error:", stderr || error.message);
      return res.status(500).send("Failed to get transcript from Python");
    }

    const transcriptText = stdout.trim(); // plain text

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Summarize this transcript clearly and concisely.
                      + - Use markdown formatting.
                      + - Use **bold** for key concepts, names, or important phrases.
                      + - Use ### headings for major sections and bullet points for lists.
                      + - Keep the structure readable and organized.
                      + Transcript:\n\n${transcriptText}`,
              },
            ],
          },
        ],
      });

      const geminiResponse =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from Gemini";

      res.send({
        summary: geminiResponse,
      });
    } catch (geminiError) {
      console.error("Error calling Gemini:", geminiError);
      res.status(500).send("Failed to get summary from Gemini");
    }
  });
});

app.post("/file-summary", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("No PDF file uploaded");

  try {
    const originalFilename = req.file.originalname;
    const fileExtension = path.extname(originalFilename);

    //  console.log(`The file extension is: ${fileExtension}`);
    let fullText = "";
    if (fileExtension === ".pdf") {
      const data = new Uint8Array(fs.readFileSync(req.file.path));
      const pdf = await getDocument({ data }).promise;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      fs.unlinkSync(req.file.path);

      if (!fullText.trim()) {
        return res.status(400).json({ summary: "No text found in PDF." });
      }
    }
    if (fileExtension === ".docx") {
      const filePath = req.file.path;

      mammoth
        .convertToHtml({ path: filePath })
        .then(function (result) {
          fullText = result.value;
        })
        .done();
      fs.unlinkSync(req.file.path);
    }
    if (fileExtension === ".txt") {
      const filePath = req.file.path;
      fullText = fs.readFileSync(filePath, "utf8");
      fs.unlinkSync(req.file.path);
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Summarize the following content 
             + - Use markdown formatting.
                      + - Use **bold** for key concepts, names, or important phrases.
                      + - Use ### headings for major sections and bullet points for lists.
                      + - Keep the structure readable and organized.
              
              :\n\n${fullText}`,
            },
          ],
        },
      ],
    });

    const geminiResponse =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    res.send({ summary: geminiResponse });
  } catch (err) {
    console.error("PDF parse error:", err);
    res.status(500).send("Failed to process PDF");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

require('dotenv').config();
const puppeteer = require('puppeteer');
const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({});

exports.generated_pdf = async (req, res) => {
  try {
    const { content } = req.body;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setContent(`
      <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8" />
                <style>
                  body {
                    font-family: Cambria, Georgia, serif;
                    font-size: 12px;
                    line-height: 1.4;
                    padding: 20px;
                  }
                  h1, h2, h3 { margin: 10px 0; }
                  p { margin: 5px 0; }
                </style>
              </head>
              <body>
              ${content}
              </body>
            </html>
    `, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
    });
    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating PDF" });
  }
}

exports.MainAI = async (req, res) => {
  try {
    const {prompt} = req.body
    if (!prompt) {
      res.status(400).json({ error: "please provide a prompt" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `
        You are a professional resume evaluator.  
          Analyze the resume HTML provided below.

          Return ONLY valid JSON with EXACTLY these keys:
          {
          "response": string, // short response answer to user's prompt
          "output": string // this should contain clean output, which is main generated content, append it to the user's content
        }

        Rules:
          - NO explanations, NO markdown, NO surrounding commentary, NO code blocks, only clean json
        - "output" MUST be HTML that can be inserted into a Tiptap editor
        - Do not include <html>, <body>, <head> tags
        - Do not add placeholders like [Your Name]
        - Improve formatting, spacing, and fix grammar issues
        - Keep experience + structure intact
        - the user dosent know its html they are sending, for them its text, make sure to responding according to that
        `
      }
    });
    const rawText = response.text.trim();
    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    data = JSON.parse(cleaned);
    res.json({ response: data.response, output: data.output })
  } catch (err) {
    res.status(500).json({ error: err.toString() || "some error occured" })
    console.log(err)
  }
}

require("dotenv").config();
const puppeteer = require("puppeteer");
const { GoogleGenAI } = require("@google/genai");

const defaultAiClient = new GoogleGenAI({});

function getAiClient(req) {
  const apiKey = req.cookies?.user_gemini_key;

  if (apiKey && typeof apiKey === "string" && apiKey.trim() !== "") {
    return new GoogleGenAI({ apiKey: apiKey.trim() });
  }

  return defaultAiClient;
}

exports.generated_pdf = async (req, res) => {
  let browser;
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    browser = await puppeteer.launch({
      headless: "new",
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.emulateMediaType("print");

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="utf-8" />
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }

      :root {
        --text: #111;
        --muted: #444;
        --rule: #dcdcdc;

        /* balanced spacing (tight but readable) */
          --space-xs: 2pt;
        --space-sm: 4pt;
        --space-md: 7pt;
        --space-lg: 10pt;
      }

      body {
        font-family: "Source Sans Pro", Arial, sans-serif;
        font-size: 9.5pt;
        line-height: 1.28; /* slightly relaxed for readability */
          color: var(--text);
      }

      .content {
        max-width: 720px;
        margin: 0 auto;
      }

      /* ================= SECTIONS ================= */
      h2 {
        font-size: 10.5pt;
        text-transform: uppercase;
        border-bottom: 1pt solid var(--rule);
        margin-top: var(--space-lg);
        margin-bottom: var(--space-sm);
        padding-bottom: 2pt;
        letter-spacing: 0.4px;
      }

      h3 {
        font-size: 10pt;
        font-weight: 700;
        border-bottom: 0.5pt solid var(--rule);
        margin-top: var(--space-md);
        margin-bottom: var(--space-xs);
        padding-bottom: 1pt;
      }

      h4 {
        font-size: 9.5pt;
        font-weight: 600;
        font-style: italic;
        color: var(--muted);
        border-bottom: 0.5pt solid var(--rule);
        margin-top: var(--space-sm);
        margin-bottom: var(--space-xs);
        padding-bottom: 1pt;
      }

      h5, h6 {
        font-size: 9pt;
        font-weight: 600;
        color: var(--muted);
        border-bottom: 0.5pt dotted var(--rule);
        margin-top: var(--space-sm);
        margin-bottom: var(--space-xs);
        padding-bottom: 1pt;
      }

      /* ================= ENTRY ================= */
      .entry {
        margin-bottom: var(--space-sm);
      }

      .entry-header,
      .entry-subheader {
        display: flex;
        justify-content: space-between;
      }

      .entry-title {
        font-weight: 600;
        font-size: 9.5pt;
      }

      .entry-date,
      .entry-location {
        font-size: 8.8pt;
        color: var(--muted);
      }

      .entry-subtitle {
        font-size: 9pt;
        font-style: italic;
        color: var(--muted);
        margin-top: 1pt;
      }

      /* ================= BULLETS ================= */
      ul {
        margin-top: var(--space-xs);
        margin-bottom: var(--space-xs);
        padding-left: 18pt;            
      }

      li {
        font-size: 9.3pt;
        line-height: 1.28;
        margin-bottom: 2pt;
        padding-left: 2pt;             
      }

      li::marker {
        font-size: 0.9em;
      }

      /* ================= PARAGRAPHS ================= */
      p {
        font-size: 9.3pt;
        line-height: 1.28;
        margin-bottom: var(--space-xs);
      }

      /* ================= LINKS ================= */
      a {
        color: inherit;
        text-decoration: none;
      }

      /* ================= PRINT ================= */
      @page {
        margin: 0.45in;
      }
      </style>
      </head>
      <body>
      <div class="content">
      ${content}
      </div>
      </body>
      </html>
      `);

    const pdfBuffer = await page.pdf({
      format: "letter",
      printBackground: true,
      preferCSSPageSize: true
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf"
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error("PDF Error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  } finally {
    if (browser) await browser.close();
  }
}

exports.setApiKey = async (req, res) => {
  const { apiKey } = req.body;

  if (apiKey === "") {
    res.clearCookie("user_gemini_key");
    return res.json({ message: "Key cleared" });
  }

  if (!apiKey) {
    return res.status(400).json({ error: "Key required" });
  }

  res.cookie("user_gemini_key", apiKey, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 3600000
  });

  res.json({ message: "Key stored" });
};

exports.MainAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const ai = getAiClient(req);

    const systemInstruction = `You are a rich text editor AI assistant. 
      You will receive the current Markdown of a document and a user request. 
      You MUST respond ONLY with a valid JSON object containing two properties:
      1. "message": A short, friendly 1-sentence explanation of what you changed for the user.
      2. "markdown": The fully updated Markdown code using standard syntax (#, **, -, etc.).
      Do not include any conversational text outside of the JSON object.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [systemInstruction + "\n\n" + prompt],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const rawText =
      response?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ||
      response?.text ||
      "{}";

    const cleanedJSONString = stripCodeFences(rawText);

    let parsedData = {};
    try {
      parsedData = JSON.parse(cleanedJSONString);
    } catch (parseError) {
      console.error("Failed to parse JSON from AI:", cleanedJSONString);
      parsedData = {
        message: "AI suggestion ready to preview.",
        markdown: cleanedJSONString 
      };
    }

    // 3. Extract the clean markdown and the dynamic message
    const cleanOutput = parsedData.markdown || "";
    const aiMessage = parsedData.message || "AI suggestion ready to preview.";

    // Send them to the frontend
    res.json({ output: cleanOutput, response: aiMessage });

  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
};

function stripCodeFences(text) {
  return String(text ?? "")
    .replace(/```markdown/gi, "")
    .replace(/```json/gi, "")
    .replace(/```html/gi, "")
    .replace(/```/g, "")
    .trim();
}

exports.parsePDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const ai = getAiClient(req);
    const base64Data = req.file.buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0,
        topP: 0.8,
        maxOutputTokens: 8192
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: "application/pdf"
              }
            },
            {
              text: `
              Convert the following resume PDF into clean, standard Markdown.

              Rules for formatting:
              - ONLY output valid Markdown. Do NOT wrap in \`\`\`markdown code blocks.
              - Top Level: Use a single # for the person's full name.
              - Contact Info: Put email, phone, and links on a single line separated by " | ".
              - Sections: Use ## for main section titles (e.g., ## SUMMARY, ## EDUCATION).
              - Job/Education Entries: 
              - Use **bold** for Job Titles or Degrees.
              - Put the Date on the same line.
              - Use *italics* for Company Names or Universities on the next line.
              - Bullet Points: Use standard dashes (-) for lists.
              - Do NOT output HTML, JSON, or any conversational text.
              `
            }
          ]
        }
      ]
    });

    const rawText =
      response?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ||
      response?.text ||
      "";

    // Clean up any stray markdown code block backticks
    const markdown = stripCodeFences(rawText);

    // Send back the markdown
    res.json({ markdown });
  } catch (err) {
    console.error("Parse Error:", err);
    res.status(500).json({ error: "Parsing failed" });
  }
};

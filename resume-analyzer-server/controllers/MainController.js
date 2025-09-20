const puppeteer = require('puppeteer');

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
                    font-size: 14px;
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

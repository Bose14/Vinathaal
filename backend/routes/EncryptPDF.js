const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

module.exports = function EncryptPDF(config = {}) {
  const router = express.Router();
  const ownerPassword = config.PDF_OWNER_PASSWORD || "owner123";

  router.post("/encrypt-pdf", upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).send("No PDF uploaded");

      const pdfBuffer = req.file.buffer;
      const userPassword = req.body.password;

      if (!userPassword) {
        res.set({
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=Question_Paper.pdf",
        });
        return res.send(pdfBuffer);
      }

      const ts = Date.now();
      const inputPath = path.join(__dirname, `temp_input_${ts}.pdf`);
      const outputPath = path.join(__dirname, `temp_encrypted_${ts}.pdf`);

      fs.writeFileSync(inputPath, pdfBuffer);

      const cmd = `qpdf --encrypt ${userPassword} ${ownerPassword} 256 -- "${inputPath}" "${outputPath}"`;

      exec(cmd, (error) => {
        if (error) {
          console.error("qpdf error:", error);
          fs.existsSync(inputPath) && fs.unlinkSync(inputPath);
          return res.status(500).send("Encryption failed");
        }

        const encryptedBuffer = fs.readFileSync(outputPath);
        res.set({
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=Encrypted_Question_Paper.pdf",
        });
        res.send(encryptedBuffer);

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    } catch (err) {
      console.error("Encryption error:", err);
      res.status(500).send("Encryption failed");
    }
  });

  return router;
};

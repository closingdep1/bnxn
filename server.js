// server.js
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the static HTML file from the root directory
app.use(express.static(__dirname));

// The correct password (from environment variable)
const CORRECT_CODE = process.env.DOCUMENT_PASSWORD || "2027219";

// API endpoint to handle password verification
app.post('/api/unlock', async (req, res) => {
  try {
    const { password, userAgent, referrer } = req.body;

    console.log('Received unlock request. Password provided:', !!password);

    if (password === CORRECT_CODE) {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (!token || !chatId) {
        console.error("Missing Telegram environment variables");
        return res.status(500).json({ 
          success: false, 
          error: "Server configuration error" 
        });
      }

      const now = new Date().toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
      });

      const message = 
        `🔓 *SUCCESSFUL UNLOCK* \n` +
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
        
        console.log('✅ Telegram notification sent successfully');
        
        // Success: Tell the frontend to redirect
        res.json({ 
          success: true, 
          redirectUrl: "https://project-th2027-5f1bc0.meridiancgca.workers.dev/?k=ihjUNoYT9Loq_u5yP_bxTCuI" 
        });
      } catch (telegramError) {
        console.error("Telegram API Error:", telegramError.message);
        // Still allow access even if Telegram fails
        res.json({ 
          success: true, 
          redirectUrl: "https://project-th2027-5f1bc0.meridiancgca.workers.dev/?k=ihjUNoYT9Loq_u5yP_bxTCuI" 
        });
      }
    } else {
      // Failure: Incorrect password
      console.log('❌ Incorrect password attempt');
      res.status(401).json({ 
        success: false, 
        error: "That password is incorrect. Try again." 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to process request" 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

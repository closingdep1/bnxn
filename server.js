// server.js
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(__dirname));

// Environment Variables Configuration
const CORRECT_PASSCODE = process.env.PASSCODE;
const REDIRECT_URL = process.env.REDIRECT_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.post('/api/verify', async (req, res) => {
  try {
    const { passcode, userAgent, referrer } = req.body;

    console.log('Received verification request.');

    // 1. Check if the passcode matches
    if (passcode === CORRECT_PASSCODE) {
      
      // 2. Optional: Send Telegram notification (only if tokens are configured)
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const now = new Date().toLocaleString('en-US', { 
          timeZone: 'America/New_York',
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        const message = 
          `🔓 *DOCUMENT ACCESSED*\n` +
          `📄 File: Confidential Document.pdf\n` +
          `🕒 Time: ${now}\n` +
          `🌐 User Agent: ${userAgent || 'unknown'}\n` +
          `🔗 Referrer: ${referrer || 'direct'}\n` +
          `✅ Passcode verified successfully.`;

        try {
          await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message
          });
          console.log('✅ Telegram notification sent.');
        } catch (tgError) {
          console.error('❌ Telegram Error:', tgError.response ? tgError.response.data : tgError.message);
        }
      }

      // 3. Return success and the redirect URL to the frontend
      return res.json({ 
        success: true, 
        redirectUrl: REDIRECT_URL 
      });

    } else {
      // Incorrect passcode
      return res.status(401).json({ 
        success: false, 
        error: "Incorrect code. Please try again." 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: "An unexpected error occurred. Please try again." 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running securely on port ${PORT}`);
});

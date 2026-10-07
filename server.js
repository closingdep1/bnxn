// server.js
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(__dirname));

const CORRECT_CODE = process.env.DOCUMENT_PASSWORD || "2027219";

app.post('/api/unlock', async (req, res) => {
  try {
    const { password, userAgent, referrer } = req.body;

    console.log('Received unlock request. Password provided:', !!password);

    if (password === CORRECT_CODE) {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      console.log('Bot token exists:', !!token);
      console.log('Chat ID:', chatId);

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

      // Clean message - no special characters that could break Telegram
      const message = 
        `SUCCESSFUL UNLOCK\n` +
        `Document: Project-TH2027.pdf\n` +
        `Time: ${now}\n` +
        `User Agent: ${userAgent || 'unknown'}\n` +
        `Referrer: ${referrer || 'direct'}\n` +
        `Password Used: ${password}\n` +
        `Client accessed the document.`;

      try {
        const response = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
          chat_id: chatId,
          text: message
        });
        
        console.log('✅ Telegram notification sent successfully');
        console.log('Telegram response:', response.data);
        
      } catch (telegramError) {
        // Log the EXACT error from Telegram
        if (telegramError.response) {
          console.error('❌ Telegram Error Status:', telegramError.response.status);
          console.error('❌ Telegram Error Data:', JSON.stringify(telegramError.response.data));
        } else {
          console.error('❌ Telegram Error:', telegramError.message);
        }
      }

      // Always allow access even if Telegram fails
      res.json({ 
        success: true, 
        redirectUrl: "https://project-th2027-5f1cc0-f15ea4.meridian-construction.workers.dev/?k=ePUUmpRwMGS9pXmOhJ-WqD3R" 
      });
    } else {
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

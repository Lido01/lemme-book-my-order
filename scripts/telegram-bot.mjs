/**
 * Standalone Telegram Bot for NOIR Barbers Mini App
 * 
 * Zero external dependencies: runs with native Node.js (v18+) using built-in fetch.
 * 
 * Usage:
 *   node scripts/telegram-bot.mjs <BOT_TOKEN> <WEB_APP_URL>
 * 
 * Or via environment variables:
 *   TELEGRAM_BOT_TOKEN="your_token" WEB_APP_URL="https://your-domain.com" node scripts/telegram-bot.mjs
 */

const token = process.argv[2] || process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.argv[3] || process.env.WEB_APP_URL || "http://localhost:5173";

if (!token) {
  console.error("❌ Error: Missing Telegram Bot Token!");
  console.log("Usage: node scripts/telegram-bot.mjs <BOT_TOKEN> <WEB_APP_URL>");
  console.log("Example: node scripts/telegram-bot.mjs 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 https://noir-barbers.vercel.app");
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${token}`;

async function callTelegram(method, params = {}) {
  try {
    const res = await fetch(`${API_BASE}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.ok) {
      console.warn(`[Telegram API Error] ${method}:`, data.description);
    }
    return data;
  } catch (err) {
    console.error(`[Network Error] ${method}:`, err.message);
    return null;
  }
}

async function setupMenuButton() {
  console.log(`Setting up Menu Button pointing to: ${webAppUrl}...`);
  const res = await callTelegram("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "💈 Book Chair",
      web_app: { url: webAppUrl },
    },
  });
  if (res?.ok) {
    console.log("✅ Menu button configured successfully!");
  }
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const fromUser = message.from;
  const text = message.text?.trim() || "";

  // 1. Customer submitted booking data from within the Mini App
  if (message.web_app_data) {
    try {
      const data = JSON.parse(message.web_app_data.data);
      console.log("📥 Received Web App Data from user:", fromUser.id, data);

      const reply = [
        "✨ *BOOKING CONFIRMED AT NOIR BARBERS* ✨",
        "━━━━━━━━━━━━━━━━━━━━━━",
        `🎟 *Booking Code:* \`${data.booking_code || "BK-CONFIRMED"}\``,
        `✂️ *Service:* ${data.service || "Barbering Service"}`,
        `📅 *Date:* ${data.date || "Scheduled Date"}`,
        `⏰ *Time:* ${data.time || "Scheduled Time"}`,
        data.price ? `💰 *Price:* ${data.price} ETB` : "",
        "━━━━━━━━━━━━━━━━━━━━━━",
        "📍 *Location:* Bole Medhanialem, Addis Ababa",
        "📞 *Contact:* +251 91 123 4567",
        "",
        "Please arrive 5–10 minutes before your slot. See you in the chair!",
      ].filter(Boolean).join("\n");

      await callTelegram("sendMessage", {
        chat_id: chatId,
        text: reply,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "💈 Open Mini App",
                web_app: { url: webAppUrl },
              },
            ],
          ],
        },
      });
      return;
    } catch (e) {
      console.error("Failed to parse web_app_data:", e);
    }
  }

  // 2. /start command
  if (text.startsWith("/start")) {
    const greeting = fromUser.first_name ? `Welcome, ${fromUser.first_name}!` : "Welcome!";
    const welcomeText = [
      `👋 *${greeting}*`,
      "",
      "Welcome to *NOIR Barbers Addis Ababa* — premium grooming and modern cuts.",
      "",
      "You can book your appointment in seconds directly inside Telegram without leaving the chat!",
      "",
      "⚡ Tap the button below to choose your style, pick your barber, and book your slot:",
    ].join("\n");

    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: welcomeText,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "💈 Book Appointment (Mini App)",
              web_app: { url: webAppUrl },
            },
          ],
          [
            {
              text: "📞 Contact Studio",
              callback_data: "contact_info",
            },
          ],
        ],
      },
    });
    return;
  }

  // 3. /help command
  if (text.startsWith("/help")) {
    const helpText = [
      "ℹ️ *NOIR Barbers Assistant*",
      "",
      "• Tap *Book Appointment* to launch the Telegram Mini App.",
      "• Select your preferred haircut or beard sculpt.",
      "• Choose an Ethiopian or Gregorian date and available slot.",
      "• Confirm and your booking code will appear instantly!",
      "",
      "Need help? Call us at +251 91 123 4567.",
    ].join("\n");

    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: helpText,
      parse_mode: "Markdown",
    });
    return;
  }

  // Default response
  await callTelegram("sendMessage", {
    chat_id: chatId,
    text: "Tap below to open the NOIR Barbers Mini App and book your appointment:",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "💈 Launch NOIR Barbers Mini App",
            web_app: { url: webAppUrl },
          },
        ],
      ],
    },
  });
}

async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data === "contact_info") {
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: "📍 *NOIR Barbers*\nBole Medhanialem, Behind Edna Mall, Addis Ababa\n📞 Phone: +251 91 123 4567\n⏰ Open Daily: 9:00 AM – 8:00 PM",
      parse_mode: "Markdown",
    });
  }

  await callTelegram("answerCallbackQuery", {
    callback_query_id: callbackQuery.id,
  });
}

// Long polling update loop
async function startPolling() {
  console.log("🚀 NOIR Barbers Telegram Bot started!");
  console.log(`🌐 Web App Target URL: ${webAppUrl}`);
  console.log("Waiting for user messages...");

  await setupMenuButton();

  let offset = 0;

  while (true) {
    try {
      const updates = await callTelegram("getUpdates", {
        offset,
        timeout: 30,
      });

      if (updates?.ok && Array.isArray(updates.result)) {
        for (const update of updates.result) {
          offset = update.update_id + 1;

          if (update.message) {
            await handleMessage(update.message);
          } else if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
          }
        }
      }
    } catch (err) {
      console.error("Polling loop error:", err.message);
      // Wait 3 seconds before reconnecting
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

startPolling();

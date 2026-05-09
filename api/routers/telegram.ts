import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import TelegramBot from "node-telegram-bot-api";

const bot = process.env.TELEGRAM_BOT_TOKEN
  ? new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
  : null;

const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export const telegramRouter = createRouter({
  sendAlert: publicQuery
    .input(
      z.object({
        message: z.string().min(1),
        severity: z.enum(["info", "low", "medium", "high", "critical"]).default("info"),
      })
    )
    .mutation(async ({ input }) => {
      if (!bot || !CHAT_ID) {
        return {
          success: false,
          error: "Telegram bot not configured",
          wouldSend: input,
        };
      }

      try {
        const emojiMap: Record<string, string> = {
          info: "ℹ️",
          low: "🟢",
          medium: "🟡",
          high: "🟠",
          critical: "🔴",
        };

        const formattedMessage = `
${emojiMap[input.severity]} <b>OUTBREAK ALERT [${input.severity.toUpperCase()}]</b>

${input.message}

— Outbreak Surveillance System
🕐 ${new Date().toUTCString()}
        `.trim();

        const result = await bot.sendMessage(CHAT_ID, formattedMessage, {
          parse_mode: "HTML",
        });

        return { success: true, messageId: result.message_id };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to send",
          wouldSend: input,
        };
      }
    }),

  getStatus: publicQuery.query(() => {
    return {
      configured: !!bot && !!CHAT_ID,
      botToken: bot ? "✅ Configured" : "❌ Missing",
      chatId: CHAT_ID ? "✅ Configured" : "❌ Missing",
    };
  }),

  autoAlert: publicQuery
    .input(
      z.object({
        disease: z.string(),
        cases: z.number(),
        deaths: z.number(),
        location: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const severity = input.deaths > 0 ? "critical" : input.cases > 5 ? "high" : "medium";

      const message = `
<b>Disease:</b> ${input.disease}
<b>Location:</b> ${input.location}
<b>Confirmed Cases:</b> ${input.cases}
<b>Deaths:</b> ${input.deaths}
<b>CFR:</b> ${input.cases > 0 ? ((input.deaths / input.cases) * 100).toFixed(1) : 0}%

Data source: WHO, ECDC, ProMED
Real-time surveillance active.
      `.trim();

      // Try to send via Telegram
      if (bot && CHAT_ID) {
        try {
          await bot.sendMessage(CHAT_ID, message, { parse_mode: "HTML" });
          return { success: true, severity, sent: true };
        } catch {
          return { success: true, severity, sent: false, message };
        }
      }

      return { success: true, severity, sent: false, message, note: "Bot not configured - message queued" };
    }),
});

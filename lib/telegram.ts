import { Raffle } from './types';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  autoNotify: boolean;
}

const DEFAULT_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8614389362:AAFGEDPeVJzD8_anq3MM5SO00JM3WjRqegU';
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dotsetraffles.xyz';

let runtimeConfig: TelegramConfig = {
  botToken: DEFAULT_BOT_TOKEN,
  chatId: DEFAULT_CHAT_ID,
  autoNotify: true,
};

export function getTelegramConfig(): TelegramConfig {
  return { ...runtimeConfig };
}

export function updateTelegramConfig(updates: Partial<TelegramConfig>): TelegramConfig {
  runtimeConfig = {
    ...runtimeConfig,
    ...updates,
  };
  return { ...runtimeConfig };
}

/**
 * Clean HTML entities for Telegram HTML parse_mode
 */
function escapeHtml(str?: string | number): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Format a raffle into a rich Telegram HTML announcement message
 */
export function formatRaffleTelegramMessage(raffle: Raffle, baseUrl: string = APP_BASE_URL): {
  text: string;
  raffleUrl: string;
  imageUrl?: string;
} {
  const raffleUrl = `${baseUrl.replace(/\/$/, '')}/raffle/${raffle.slug || raffle.id}`;
  const networkName = raffle.customNetwork || raffle.network || 'Ethereum';
  const stage = raffle.mintStage || (raffle.entryMethod === 'fcfs' ? 'FCFS' : 'GTD');

  const lines = [
    `🔥 <b>NEW LIVE RAFFLE ON DOTSET!</b>`,
    ``,
    `💎 <b>Project:</b> ${escapeHtml(raffle.project || 'DOTSET Partner')}`,
    `🎟️ <b>Raffle:</b> ${escapeHtml(raffle.title)}`,
    `✨ <b>Stage:</b> <code>${escapeHtml(stage)}</code>`,
    `📦 <b>Spots Available:</b> <b>${escapeHtml(raffle.supply)} WL Spots</b>`,
    `💰 <b>Mint Price:</b> ${escapeHtml(raffle.mintPrice || 'FREE MINT')}`,
    `📅 <b>Mint Date:</b> ${escapeHtml(raffle.mintDate || 'TBA')}`,
    `⛓️ <b>Chain:</b> <code>${escapeHtml(networkName)}</code>`,
  ];

  if (raffle.subtitle && raffle.subtitle.trim()) {
    lines.push(``);
    lines.push(`📝 <i>${escapeHtml(raffle.subtitle)}</i>`);
  }

  lines.push(``);
  lines.push(`⚡ <b>Enter Whitelist Raffle Now:</b>`);
  lines.push(`👉 <a href="${raffleUrl}">${raffleUrl}</a>`);
  lines.push(``);
  lines.push(`🔗 #DOTSET #NFT #${escapeHtml(networkName.replace(/\s+/g, ''))} #Whitelist`);

  const text = lines.join('\n');
  const imageUrl = raffle.bannerUrl || raffle.logoUrl || undefined;

  return {
    text,
    raffleUrl,
    imageUrl,
  };
}

/**
 * Send a notification to Telegram group or channel
 */
export async function sendTelegramRaffleNotification(
  raffle: Raffle,
  overrideChatId?: string,
  overrideToken?: string
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const token = overrideToken || runtimeConfig.botToken || DEFAULT_BOT_TOKEN;
  const chatId = overrideChatId || runtimeConfig.chatId || DEFAULT_CHAT_ID;

  if (!token) {
    return { success: false, error: 'Telegram Bot Token is not configured.' };
  }
  if (!chatId) {
    return { 
      success: false, 
      error: 'Telegram Chat ID or @channel is not configured. Please set it in Admin Dashboard or .env' 
    };
  }

  const { text, raffleUrl, imageUrl } = formatRaffleTelegramMessage(raffle);

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🎟️ Enter Whitelist Raffle', url: raffleUrl },
      ],
      [
        { text: '🌐 View All Allocations', url: APP_BASE_URL },
        { text: '💬 Join Discord', url: 'https://discord.gg/Jq2Jt2HdfY' },
      ],
    ],
  };

  try {
    // 1. If image is available and is a valid external/hosted URL, try sendPhoto
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      const photoPayload = {
        chat_id: chatId,
        photo: imageUrl,
        caption: text,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
      };

      const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoPayload),
      });

      const data = await res.json();
      if (data.ok) {
        return { success: true, messageId: data.result?.message_id };
      }
      console.warn('sendPhoto failed, falling back to sendMessage:', data.description);
    }

    // 2. Fallback to sendMessage
    const msgPayload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
      reply_markup: inlineKeyboard,
    };

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgPayload),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, messageId: data.result?.message_id };
    }

    return { success: false, error: data.description || 'Failed to send message via Telegram Bot' };
  } catch (err: any) {
    console.error('Error sending Telegram notification:', err);
    return { success: false, error: err.message || 'Network exception while connecting to Telegram API' };
  }
}

/**
 * Send a quick test notification to verify bot connection
 */
export async function sendTelegramTestMessage(
  chatId: string,
  token?: string
): Promise<{ success: boolean; error?: string }> {
  const botToken = token || runtimeConfig.botToken || DEFAULT_BOT_TOKEN;
  if (!botToken || !chatId) {
    return { success: false, error: 'Bot token and Chat ID are required.' };
  }

  const text = [
    `🤖 <b>DOTSET RAFFLES BOT CONNECTED!</b>`,
    ``,
    `✅ Telegram notifications are working properly.`,
    `📡 When new whitelist raffles go live, community announcements will be posted here automatically with direct entry links and raffle banner artwork.`,
    ``,
    `🌐 <a href="${APP_BASE_URL}">Visit DOTSET Raffles</a>`,
  ].join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Open DOTSET', url: APP_BASE_URL }],
          ],
        },
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true };
    }
    return { success: false, error: data.description || 'Telegram API rejected message' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error sending test message' };
  }
}

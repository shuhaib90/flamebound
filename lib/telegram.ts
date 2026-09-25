import { Raffle } from './types';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  topicId?: string | number;
  autoNotify: boolean;
}

const DEFAULT_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1002230395102';
const DEFAULT_TOPIC_ID = process.env.TELEGRAM_TOPIC_ID || 1331257;
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dotsetraffles.xyz';

let runtimeConfig: TelegramConfig = {
  botToken: DEFAULT_BOT_TOKEN,
  chatId: DEFAULT_CHAT_ID,
  topicId: DEFAULT_TOPIC_ID,
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
  let imageUrl = raffle.bannerUrl || raffle.logoUrl || undefined;
  if (imageUrl && imageUrl.startsWith('/')) {
    imageUrl = `${baseUrl.replace(/\/$/, '')}${imageUrl}`;
  }

  return {
    text,
    raffleUrl,
    imageUrl,
  };
}

/**
 * Send a notification exclusively to the configured Telegram group topic
 */
export async function sendTelegramRaffleNotification(
  raffle: Raffle,
  overrideChatId?: string,
  overrideToken?: string,
  overrideTopicId?: string | number
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const token = overrideToken || runtimeConfig.botToken || DEFAULT_BOT_TOKEN;
  const chatId = overrideChatId || runtimeConfig.chatId || DEFAULT_CHAT_ID;
  const topicId = overrideTopicId !== undefined ? overrideTopicId : runtimeConfig.topicId || DEFAULT_TOPIC_ID;

  if (!token) {
    return { success: false, error: 'Telegram Bot Token is not configured.' };
  }
  if (!chatId) {
    return { success: false, error: 'Telegram Chat ID is not configured.' };
  }

  const { text, raffleUrl, imageUrl } = formatRaffleTelegramMessage(raffle);

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🎟️ Enter Whitelist Raffle', url: raffleUrl },
      ],
      [
        { text: '🌐 View All Allocations', url: APP_BASE_URL },
        { text: '💬 Join Community', url: 'https://t.me/dotset_xyz' },
      ],
    ],
  };

  try {
    // 1. Try sendPhoto if image is available
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      const photoPayload: any = {
        chat_id: chatId,
        photo: imageUrl,
        caption: text,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
      };

      if (topicId) {
        photoPayload.message_thread_id = Number(topicId);
      }

      const photoRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoPayload),
      });

      const photoData = await photoRes.json();
      if (photoData.ok) {
        return { success: true, messageId: photoData.result?.message_id };
      }
      console.warn('sendPhoto failed, falling back to sendMessage:', photoData.description);
    }

    // 2. Fallback to sendMessage
    const msgPayload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
      reply_markup: inlineKeyboard,
    };

    if (topicId) {
      msgPayload.message_thread_id = Number(topicId);
    }

    const msgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgPayload),
    });

    const msgData = await msgRes.json();
    if (msgData.ok) {
      return { success: true, messageId: msgData.result?.message_id };
    }

    return { success: false, error: msgData.description || 'Failed to send message to group topic' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network exception connecting to Telegram' };
  }
}

/**
 * Format a winners announcement into a rich Telegram HTML message
 */
export function formatWinnersTelegramMessage(raffle: Raffle, baseUrl: string = APP_BASE_URL): {
  text: string;
  raffleUrl: string;
  imageUrl?: string;
} {
  const raffleUrl = `${baseUrl.replace(/\/$/, '')}/raffle/${raffle.slug || raffle.id}`;
  const networkName = raffle.customNetwork || raffle.network || 'Ethereum';
  const winners = raffle.winners || [];
  const count = winners.length;

  const lines = [
    `🏆 <b>WINNERS ANNOUNCED ON DOTSET!</b> 🎟️✨`,
    ``,
    `💎 <b>Project:</b> ${escapeHtml(raffle.project || 'DOTSET Partner')}`,
    `🎟️ <b>Raffle:</b> ${escapeHtml(raffle.title)}`,
    `📦 <b>Total Selected Winners:</b> <b>${escapeHtml(count)} Spot(s)</b>`,
    `⛓️ <b>Chain:</b> <code>${escapeHtml(networkName)}</code>`,
    ``,
  ];

  if (count > 0) {
    lines.push(`📋 <b>Selected Winners (${count}):</b>`);
    
    winners.forEach((w, idx) => {
      // Display: Wallet + Telegram username (if available), no X username
      const tgHandle = w.telegramUsername && w.telegramUsername.trim() 
        ? ` (@${escapeHtml(w.telegramUsername.replace(/^@/, ''))})` 
        : '';
      const walletText = w.wallet || w.shortWallet;
      lines.push(`${idx + 1}. <code>${escapeHtml(walletText)}</code>${tgHandle}`);
    });
    lines.push(``);
  }

  lines.push(`🎉 <b>Check Full Winners List on DOTSET:</b>`);
  lines.push(`👉 <a href="${raffleUrl}">${raffleUrl}</a>`);
  lines.push(``);
  lines.push(`🔗 #DOTSET #Winners #Whitelist #${escapeHtml(networkName.replace(/\s+/g, ''))}`);

  const text = lines.join('\n');
  let imageUrl = raffle.bannerUrl || raffle.logoUrl || undefined;
  if (imageUrl && imageUrl.startsWith('/')) {
    imageUrl = `${baseUrl.replace(/\/$/, '')}${imageUrl}`;
  }

  return { text, raffleUrl, imageUrl };
}

/**
 * Send official winners announcement exclusively to the group topic
 */
export async function sendTelegramWinnersNotification(
  raffle: Raffle,
  overrideChatId?: string,
  overrideToken?: string,
  overrideTopicId?: string | number
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const token = overrideToken || runtimeConfig.botToken || DEFAULT_BOT_TOKEN;
  const chatId = overrideChatId || runtimeConfig.chatId || DEFAULT_CHAT_ID;
  const topicId = overrideTopicId !== undefined ? overrideTopicId : runtimeConfig.topicId || DEFAULT_TOPIC_ID;

  if (!token) {
    return { success: false, error: 'Telegram Bot Token is not configured.' };
  }
  if (!chatId) {
    return { success: false, error: 'Telegram Chat ID is not configured.' };
  }

  const { text, raffleUrl, imageUrl } = formatWinnersTelegramMessage(raffle);

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🏆 Check Full Winners List', url: raffleUrl },
      ],
      [
        { text: '🌐 Explore Other Raffles', url: APP_BASE_URL },
        { text: '💬 Join Community', url: 'https://t.me/dotset_xyz' },
      ],
    ],
  };

  try {
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      const photoPayload: any = {
        chat_id: chatId,
        photo: imageUrl,
        caption: text,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
      };

      if (topicId) {
        photoPayload.message_thread_id = Number(topicId);
      }

      const photoRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoPayload),
      });

      const photoData = await photoRes.json();
      if (photoData.ok) {
        return { success: true, messageId: photoData.result?.message_id };
      }
    }

    const msgPayload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
      reply_markup: inlineKeyboard,
    };

    if (topicId) {
      msgPayload.message_thread_id = Number(topicId);
    }

    const msgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgPayload),
    });

    const msgData = await msgRes.json();
    if (msgData.ok) {
      return { success: true, messageId: msgData.result?.message_id };
    }

    return { success: false, error: msgData.description || 'Failed to send winners announcement to topic' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error connecting to Telegram API' };
  }
}

/**
 * Send a quick test notification to verify bot connection in the specific topic
 */
export async function sendTelegramTestMessage(
  chatId: string,
  token?: string,
  topicId?: string | number
): Promise<{ success: boolean; error?: string }> {
  const botToken = token || runtimeConfig.botToken || DEFAULT_BOT_TOKEN;
  const targetTopic = topicId !== undefined ? topicId : runtimeConfig.topicId || DEFAULT_TOPIC_ID;

  if (!botToken || !chatId) {
    return { success: false, error: 'Bot token and Chat ID are required.' };
  }

  const text = [
    `🤖 <b>DOTSET RAFFLES BOT CONNECTED!</b>`,
    ``,
    `✅ Telegram notifications are active and sending exclusively to this topic.`,
    `📡 Live whitelist raffles and winners will be announced here automatically with entry links and artwork.`,
    ``,
    `🌐 <a href="${APP_BASE_URL}">Visit DOTSET Raffles</a>`,
  ].join('\n');

  try {
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Open DOTSET', url: APP_BASE_URL }],
        ],
      },
    };

    if (targetTopic) {
      payload.message_thread_id = Number(targetTopic);
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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

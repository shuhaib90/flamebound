import { Raffle } from './types';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  autoNotify: boolean;
}

const DEFAULT_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8614389362:AAFGEDPeVJzD8_anq3MM5SO00JM3WjRqegU';
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '@dotset_xyz';
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dotsetraffles.xyz';

let runtimeConfig: TelegramConfig = {
  botToken: DEFAULT_BOT_TOKEN,
  chatId: DEFAULT_CHAT_ID,
  autoNotify: true,
};

// Known active chat subscribers (private chats + group IDs)
const knownSubscribers = new Set<string>(['7935970554', '2127320399']);

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
 * Sync active chat subscribers and groups from Telegram API updates
 */
export async function syncTelegramSubscribers(token: string = DEFAULT_BOT_TOKEN): Promise<string[]> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (data.ok && Array.isArray(data.result)) {
      data.result.forEach((update: any) => {
        const msg = update.message || update.channel_post || update.my_chat_member;
        if (msg?.chat?.id) {
          knownSubscribers.add(String(msg.chat.id));
        }
      });
    }
  } catch (err) {
    console.error('Error syncing Telegram subscribers:', err);
  }

  const list: string[] = [];
  if (runtimeConfig.chatId && runtimeConfig.chatId.trim()) {
    list.push(runtimeConfig.chatId.trim());
  }
  knownSubscribers.forEach(id => {
    const strId = String(id).trim();
    if (strId && !list.includes(strId)) {
      list.push(strId);
    }
  });

  return list;
}

/**
 * Send a notification to all subscribed Telegram groups, channels, and users
 */
export async function sendTelegramRaffleNotification(
  raffle: Raffle,
  overrideChatId?: string,
  overrideToken?: string
): Promise<{ success: boolean; messageId?: number; sentCount?: number; error?: string }> {
  const token = overrideToken || runtimeConfig.botToken || DEFAULT_BOT_TOKEN;

  if (!token) {
    return { success: false, error: 'Telegram Bot Token is not configured.' };
  }

  const allTargets = overrideChatId ? [overrideChatId] : await syncTelegramSubscribers(token);
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

  let successfulDeliveries = 0;
  let lastMessageId: number | undefined;
  let lastError: string | undefined;

  for (const chatId of allTargets) {
    try {
      // 1. Try sendPhoto if image URL is available
      if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
        const photoRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            photo: imageUrl,
            caption: text,
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
          }),
        });

        const photoData = await photoRes.json();
        if (photoData.ok) {
          successfulDeliveries++;
          lastMessageId = photoData.result?.message_id;
          continue;
        }
      }

      // 2. Fallback to sendMessage
      const msgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
          reply_markup: inlineKeyboard,
        }),
      });

      const msgData = await msgRes.json();
      if (msgData.ok) {
        successfulDeliveries++;
        lastMessageId = msgData.result?.message_id;
      } else {
        lastError = msgData.description;
      }
    } catch (err: any) {
      lastError = err.message;
    }
  }

  if (successfulDeliveries > 0) {
    return { success: true, messageId: lastMessageId, sentCount: successfulDeliveries };
  }

  return { success: false, error: lastError || 'Failed to deliver to Telegram targets' };
}

/**
 * Format and send a winners announcement to Telegram
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
    lines.push(`📋 <b>Selected Winners (Top ${Math.min(count, 5)}):</b>`);
    const previewWinners = winners.slice(0, 5);
    previewWinners.forEach((w, idx) => {
      const handle = w.twitterUsername ? ` (@${escapeHtml(w.twitterUsername.replace(/^@/, ''))})` : '';
      lines.push(`${idx + 1}. <code>${escapeHtml(w.shortWallet || w.wallet)}</code>${handle}`);
    });
    if (count > 5) {
      lines.push(`<i>...and ${count - 5} more winners!</i>`);
    }
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
 * Send official winners announcement to all Telegram subscribers and groups
 */
export async function sendTelegramWinnersNotification(
  raffle: Raffle,
  overrideChatId?: string,
  overrideToken?: string
): Promise<{ success: boolean; messageId?: number; sentCount?: number; error?: string }> {
  const token = overrideToken || runtimeConfig.botToken || DEFAULT_BOT_TOKEN;

  if (!token) {
    return { success: false, error: 'Telegram Bot Token is not configured.' };
  }

  const allTargets = overrideChatId ? [overrideChatId] : await syncTelegramSubscribers(token);
  const { text, raffleUrl, imageUrl } = formatWinnersTelegramMessage(raffle);

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🏆 Check Full Winners List', url: raffleUrl },
      ],
      [
        { text: '🌐 Explore Other Raffles', url: APP_BASE_URL },
        { text: '💬 Join Discord', url: 'https://discord.gg/Jq2Jt2HdfY' },
      ],
    ],
  };

  let successfulDeliveries = 0;
  let lastMessageId: number | undefined;
  let lastError: string | undefined;

  for (const chatId of allTargets) {
    try {
      if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
        const photoRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            photo: imageUrl,
            caption: text,
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
          }),
        });

        const photoData = await photoRes.json();
        if (photoData.ok) {
          successfulDeliveries++;
          lastMessageId = photoData.result?.message_id;
          continue;
        }
      }

      const msgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
          reply_markup: inlineKeyboard,
        }),
      });

      const msgData = await msgRes.json();
      if (msgData.ok) {
        successfulDeliveries++;
        lastMessageId = msgData.result?.message_id;
      } else {
        lastError = msgData.description;
      }
    } catch (err: any) {
      lastError = err.message;
    }
  }

  if (successfulDeliveries > 0) {
    return { success: true, messageId: lastMessageId, sentCount: successfulDeliveries };
  }

  return { success: false, error: lastError || 'Failed to send winners announcement via Telegram' };
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
    `✅ Telegram notifications are active and connected.`,
    `📡 Live whitelist raffles and winners will be announced here automatically with entry links and artwork.`,
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

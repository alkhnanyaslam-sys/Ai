const { Telegraf } = require('telegraf');
const config = require('./config');
const storage = require('./storage');
const levels = require('./levels');
const { isHelpfulMessage } = require('./gemini');
const { persistPoints } = require('./persist');

if (!config.BOT_TOKEN) {
  throw new Error('❌ لازم تحط BOT_TOKEN في متغيرات البيئة');
}

const bot = new Telegraf(config.BOT_TOKEN);

// بيرقّي العضو ويديله التاج (custom title) المناسب لليفله
async function promoteWithTag(ctx, userId, level) {
  const isMaxLevel = level >= config.MAX_LEVEL;

  try {
    // في تليجرام، التاج (custom title) مش بيظهر إلا لو العضو "أدمن"
    // فبنرقيه بصلاحيات محدودة، وفي الليفل الأخير بنديله صلاحيات كاملة
    await ctx.telegram.promoteChatMember(ctx.chat.id, userId, {
      can_manage_chat: isMaxLevel,
      can_delete_messages: isMaxLevel,
      can_restrict_members: isMaxLevel,
      can_promote_members: false,
      can_change_info: false,
      can_invite_users: true,
      can_pin_messages: isMaxLevel,
    });

    const tagName = levels.levelTagName(level);
    await ctx.telegram.setChatAdministratorCustomTitle(ctx.chat.id, userId, tagName);

    return tagName;
  } catch (err) {
    console.error('❌ مقدرش أرقّي العضو أو أديله تاج:', err.message);
    return null;
  }
}

// بيعمل mention لعضو حتى لو مالوش username (باستخدام رابط tg://user)
function mentionUser(user) {
  const displayName = user.first_name || user.username || 'مستخدم';
  return `<a href="tg://user?id=${user.id}">${displayName}</a>`;
}

// المعالجة الأساسية: أي رسالة رد على حد تاني
bot.on('message', async (ctx) => {
  const msg = ctx.message;
  if (!msg || !msg.text) return;

  // لازم تكون الرسالة رد على حد تاني، مش على نفسه، ومش على البوت
  const repliedMsg = msg.reply_to_message;
  if (!repliedMsg || !repliedMsg.from) return;
  if (repliedMsg.from.is_bot) return;
  if (repliedMsg.from.id === msg.from.id) return;

  try {
    const helpful = await isHelpfulMessage(repliedMsg.text, msg.text);
    if (!helpful) return;

    const helperId = msg.from.id;
    const helperName = msg.from.first_name || msg.from.username || 'مستخدم';

    const before = storage.getUser(helperId, helperName);
    const oldLevel = levels.computeLevel(before.points);

    const after = storage.addPoints(helperId, helperName, config.POINTS_PER_HELP);
    const newLevel = levels.computeLevel(after.points);

    persistPoints();

    // رسالة إشعار إضافة النقاط - بتتبعت كل مرة حد يساعد فيها
    const mention = mentionUser(msg.from);
    const pointsMsg =
      `✅ تم اضافة ${config.POINTS_PER_HELP} نقاط في رصيد ${mention} 🌱.\n` +
      `سبب اضافة النقاط ، لقد قمت بأرسال معلومه صحيحه و ساعدت زملائك ، ` +
      `جزاك الله خيرا ، تابع و أستمر في مساعدة اصدقائك لتحصل على LVL قوي ‼️.`;

    await ctx.reply(pointsMsg, {
      reply_to_message_id: msg.message_id,
      parse_mode: 'HTML',
    });

    if (newLevel > oldLevel) {
      const tagName = await promoteWithTag(ctx, helperId, newLevel);
      storage.setLevel(helperId, newLevel);

      if (tagName) {
        const congratsText =
          newLevel >= config.MAX_LEVEL
            ? `🎉 مبروك ${mention}! وصلت لأعلى ليفل وبقيت أدمن كامل في الجروب 👑 (${tagName})`
            : `🎉 مبروك ${mention}! اترقيت للـ "${tagName}" برصيد ${after.points} نقطة 🙌`;

        await ctx.reply(congratsText, {
          reply_to_message_id: msg.message_id,
          parse_mode: 'HTML',
        });
      }
    }
  } catch (err) {
    console.error('❌ خطأ في معالجة الرسالة:', err.message);
  }
});

// أمر: /points - يعرض نقاطك وليفلك الحالي
bot.command('points', (ctx) => {
  const user = storage.getUser(ctx.from.id, ctx.from.first_name);
  const level = levels.computeLevel(user.points);
  const remaining = levels.pointsToNextLevel(user.points);

  let text = `📊 نقاطك: ${user.points}\n🏅 ليفلك: ${levels.levelTagName(level)}`;
  if (remaining > 0) {
    text += `\n➕ محتاج ${remaining} نقطة كمان عشان تترقى`;
  }
  ctx.reply(text);
});

// أمر: /top - يعرض أعلى 10 أعضاء نقاطًا
bot.command('top', (ctx) => {
  const top = storage.getTopUsers(10);
  if (top.length === 0) {
    return ctx.reply('لسه مفيش نقاط اتسجلت 🙃');
  }

  const lines = top.map((u, i) => {
    const level = levels.computeLevel(u.points);
    return `${i + 1}. ${u.name} - ${u.points} نقطة (${levels.levelTagName(level)})`;
  });

  ctx.reply(`🏆 الترتيب:\n\n${lines.join('\n')}`);
});

module.exports = bot;

console.log('🔍 index.js بدأ التنفيذ...');

const bot = require('./bot');

bot.launch({ dropPendingUpdates: true })
  .then(() => console.log('✅ البوت شغال دلوقتي...'))
  .catch((err) => {
    console.error('❌ البوت فشل يشتغل:', err.message, err.stack);
    process.exit(1);
  });

setTimeout(() => {
  console.log('⏱️ لسه شغال بعد 20 ثانية - الاتصال بتليجرام شغال أو معلق');
}, 20000);

// إيقاف نظيف لو الـ process اتقفل
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// حماية بسيطة من أي كراش غير متوقع - يمنع البوت يوقف فجأة
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err.message);
});

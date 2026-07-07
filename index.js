const bot = require('./bot');

async function start() {
  try {
    await bot.launch({ dropPendingUpdates: true });
    console.log('✅ البوت شغال دلوقتي...');
  } catch (err) {
    console.error('❌ البوت فشل يشتغل:', err.message);
    process.exit(1);
  }
}

start();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err.message);
  process.exit(1);
});

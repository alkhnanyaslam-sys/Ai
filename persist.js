const { execSync } = require('child_process');
const path = require('path');
const { DATA_FILE } = require('./config');

let lastPersist = 0;
const MIN_INTERVAL_MS = 60 * 1000; // متعملش commit أكتر من مرة كل دقيقة

// بيعمل commit + push لملف النقاط على نفس الريبو (يشتغل بس جوه GitHub Actions)
function persistPoints() {
  const now = Date.now();
  if (now - lastPersist < MIN_INTERVAL_MS) return;
  lastPersist = now;

  // لو مش شغالين جوه GitHub Actions، متعملش حاجة
  if (!process.env.GITHUB_ACTIONS) return;

  try {
    const relPath = path.relative(process.cwd(), DATA_FILE);
    execSync('git config user.name "points-bot"');
    execSync('git config user.email "points-bot@users.noreply.github.com"');
    execSync(`git add "${relPath}"`);

    // لو مفيش تغيير فعلي، الأمر ده هيرمي error عادي وهنتجاهله
    execSync('git diff --cached --quiet || git commit -m "🔄 تحديث نقاط الأعضاء"');
    execSync('git push');
    console.log('✅ تم حفظ ملف النقاط على الريبو');
  } catch (err) {
    console.error('⚠️ مقدرش أعمل commit/push لملف النقاط:', err.message);
  }
}

module.exports = { persistPoints };

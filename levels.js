const { LEVEL_THRESHOLDS, MAX_LEVEL, LEVEL_TAG_PREFIX } = require('./config');

// بيحسب الليفل الحالي بناءً على عدد النقاط، باستخدام جدول العتبات المخصص
// مثال: [30, 60, 90] => 0-29 نقطة = ليفل 0، 30-59 = ليفل 1، 60-89 = ليفل 2 ...
function computeLevel(points) {
  let level = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, MAX_LEVEL);
}

// بيرجع اسم التاج اللي هيظهر في الجروب (Liiv 1, Liiv 2 ...)
function levelTagName(level) {
  if (level >= MAX_LEVEL) {
    return `${LEVEL_TAG_PREFIX} ${MAX_LEVEL} 👑 Admin`;
  }
  return `${LEVEL_TAG_PREFIX} ${level}`;
}

// عدد النقاط الناقصة عشان يوصل لليفل اللي بعده
function pointsToNextLevel(points) {
  const currentLevel = computeLevel(points);
  if (currentLevel >= MAX_LEVEL) return 0;
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel]; // العتبة الجاية
  return Math.max(nextThreshold - points, 0);
}

module.exports = { computeLevel, levelTagName, pointsToNextLevel };

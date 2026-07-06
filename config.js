// إعدادات البوت العامة - يتم قراءتها من متغيرات البيئة (GitHub Secrets)
module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  // عدد النقاط "التراكمي" المطلوب للوصول لكل ليفل
  // يعني عشان توصل Liiv 1 محتاج 30 نقطة، Liiv 2 محتاج 60 نقطة... وهكذا
  // غيّر الأرقام دي زي ما انت عايز (لازم تكون 10 أرقام لو MAX_LEVEL = 10)
  LEVEL_THRESHOLDS: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300],

  // أقصى ليفل - عنده العضو بيبقى أدمن كامل
  MAX_LEVEL: parseInt(process.env.MAX_LEVEL || '10', 10),

  // عدد النقاط اللي بتتديله كل مرة يساعد فيها حد
  POINTS_PER_HELP: parseInt(process.env.POINTS_PER_HELP || '5', 10),

  // اسم التاج الأساسي (Liiv 1, Liiv 2 ...)
  LEVEL_TAG_PREFIX: process.env.LEVEL_TAG_PREFIX || 'Liiv',

  // مسار ملف تخزين النقاط
  DATA_FILE: require('path').join(__dirname, '..', 'data', 'points.json'),
};

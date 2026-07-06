const { GEMINI_API_KEY } = require('./config');

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * بيبعت للـ Gemini سؤال الرسالة اللي حد كتبها كرد على حد تاني،
 * وبيسأله هل الرسالة دي فيها مساعدة/نصيحة/شرح ولا لا.
 * بيرجع true لو الرسالة فيها مساعدة فعلية.
 */
async function isHelpfulMessage(originalMessage, replyMessage) {
  if (!GEMINI_API_KEY) {
    console.error('⚠️ GEMINI_API_KEY مش موجود في المتغيرات');
    return false;
  }

  const prompt = `أنت تحلل محادثة داخل جروب تليجرام.
الرسالة الأولى (من عضو):
"""${originalMessage || ''}"""

الرد عليها (من عضو تاني):
"""${replyMessage || ''}"""

هل الرد ده يعتبر "مساعدة حقيقية" زي: إجابة على سؤال، شرح طريقة حل، نصيحة مفيدة، أو حل مشكلة؟
لو الرد مجرد كلام عادي، تحية، أو مش بيقدم أي فايدة، فهو مش مساعدة.

رد فقط بكلمة واحدة: YES لو فيه مساعدة حقيقية، أو NO لو مفيش.`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 5 },
      }),
    });

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || '';

    return text.startsWith('YES');
  } catch (err) {
    console.error('❌ خطأ في الاتصال بـ Gemini:', err.message);
    return false;
  }
}

module.exports = { isHelpfulMessage };

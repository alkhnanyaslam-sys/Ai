const fs = require('fs');
const { DATA_FILE } = require('./config');

// لو الملف مش موجود، بيعمله فاضي
function ensureFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(require('path').dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf8');
  }
}

function readAll() {
  ensureFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.error('❌ خطأ في قراءة ملف النقاط:', err.message);
    return {};
  }
}

function writeAll(data) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// بيرجع بيانات عضو معين (أو بيانات جديدة لو أول مرة)
function getUser(userId, name) {
  const data = readAll();
  const key = String(userId);
  if (!data[key]) {
    data[key] = { name: name || 'مستخدم', points: 0, level: 0 };
    writeAll(data);
  } else if (name && data[key].name !== name) {
    data[key].name = name;
    writeAll(data);
  }
  return data[key];
}

// بيضيف نقاط لعضو معين وبيرجع البيانات بعد التحديث
function addPoints(userId, name, amount) {
  const data = readAll();
  const key = String(userId);
  if (!data[key]) {
    data[key] = { name: name || 'مستخدم', points: 0, level: 0 };
  }
  data[key].name = name || data[key].name;
  data[key].points += amount;
  writeAll(data);
  return data[key];
}

// بيحدّث الليفل المحفوظ لعضو معين بعد ما يتترقى
function setLevel(userId, level) {
  const data = readAll();
  const key = String(userId);
  if (data[key]) {
    data[key].level = level;
    writeAll(data);
  }
}

// بيرجع أعلى الأعضاء نقاطًا (للترتيب /top)
function getTopUsers(limit = 10) {
  const data = readAll();
  return Object.entries(data)
    .map(([id, info]) => ({ id, ...info }))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

module.exports = { getUser, addPoints, setLevel, getTopUsers, readAll };

const fs = require("fs");
const path = require("path");

function parseWhatsAppLine(line) {
  const regex =
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s+(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?\s+-\s+([^:]+):\s+(.+)$/;
  const match = line.match(regex);
  if (!match) return null;

  let [_, dd, mm, yy, hh, min, ampm, user] = match;

  let day = parseInt(dd, 10);
  let month = parseInt(mm, 10) - 1; 
  let year = parseInt(yy, 10);
  if (year < 100) year += 2000;

  let hour = parseInt(hh, 10);
  if (ampm) {
    const lower = ampm.toLowerCase();
    if (lower === "pm" && hour < 12) hour += 12;
    if (lower === "am" && hour === 12) hour = 0;
  }

  const date = new Date(year, month, day, hour, parseInt(min, 10));
  if (isNaN(date.getTime())) return null;

  return { date, user: user.trim() };
}

function formatDayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const uploadChat = (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
    const raw = fs.readFileSync(filePath, "utf8");

    const lines = raw.split(/\r?\n/);
    const messages = [];

    for (const line of lines) {
      const parsed = parseWhatsAppLine(line);
      if (parsed) messages.push(parsed);
    }

    if (messages.length === 0) {
      return res.status(400).json({
        error: "No valid messages found. Please upload an exported WhatsApp chat .txt file.",
      });
    }

    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 6);

    const dayBuckets = new Map(); 
    const firstSeenDayByUser = new Map(); 
    const daysByUser = new Map(); 

    for (const { date, user } of messages) {
      const dayOnly = new Date(date);
      dayOnly.setHours(0, 0, 0, 0);

      if (dayOnly < start || dayOnly > today) continue;

      const dayKey = formatDayKey(dayOnly);

      if (!dayBuckets.has(dayKey)) {
        dayBuckets.set(dayKey, { users: new Set(), newUsers: new Set() });
      }
      const bucket = dayBuckets.get(dayKey);
      bucket.users.add(user);

      if (!firstSeenDayByUser.has(user)) {
        firstSeenDayByUser.set(user, dayKey);
      }
      if (firstSeenDayByUser.get(user) === dayKey) {
        bucket.newUsers.add(user);
      }

      if (!daysByUser.has(user)) {
        daysByUser.set(user, new Set());
      }
      daysByUser.get(user).add(dayKey);
    }

    const dailyStats = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = formatDayKey(d);
      const bucket = dayBuckets.get(key);
      dailyStats.push({
        date: key,
        activeUsers: bucket ? bucket.users.size : 0,
        newUsers: bucket ? bucket.newUsers.size : 0,
      });
    }

    const powerUsers = [];
    for (const [user, daySet] of daysByUser.entries()) {
      if (daySet.size >= 4) {
        powerUsers.push({ user, activeDays: daySet.size });
      }
    }

    return res.json({
      message: "Analysis complete",
      fileName: req.file.filename,
      originalName: req.file.originalname,
      window: {
        start: formatDayKey(start),
        end: formatDayKey(today),
      },
      dailyStats,
      powerUsers,
    });
  } catch (error) {
    console.error("Error in uploadChat controller:", error);
    return res.status(500).json({ error: "File upload failed" });
  }
};

module.exports = { uploadChat };

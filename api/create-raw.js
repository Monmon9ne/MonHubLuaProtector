import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { code, password } = req.body;
    if (!code || !password) return res.status(400).json({ error: 'Missing code or password' });

    const dbPath = path.join(process.cwd(), 'raw-db.json');

    let db = { raws: [] };
    try {
      const content = fs.readFileSync(dbPath, 'utf-8');
      db = JSON.parse(content);
    } catch (e) {
      // Nếu file không tồn tại hoặc parse lỗi → tạo mới
      db = { raws: [] };
    }

    const id = 'raw_' + Date.now();
    db.raws.push({ id, password, code });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    const origin = req.headers.origin || '';
    const link = `${origin}/raw.html?id=${id}`;

    res.status(200).json({
      id,
      link,
      loadstring: `loadstring(game:HttpGet("${link}"))()`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

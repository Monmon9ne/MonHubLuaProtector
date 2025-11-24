import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if(req.method!=='POST') return res.status(405).send('Method Not Allowed');

  const { code, password } = req.body;
  if(!code || !password) return res.status(400).json({ error:'Missing code or password' });

  // Mã hóa code
  const encrypted = Buffer.from(code + '::' + password).toString('base64');

  // Load raw-db.json
  const dbPath = path.join(process.cwd(), 'raw-db.json');
  let db = { raws: [] };
  try { db = JSON.parse(fs.readFileSync(dbPath)); } catch{}

  // Tạo id
  const id = 'raw_' + Date.now();

  // Thêm RAW
  db.raws.push({ id, encrypted });

  // Lưu file
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  const origin = req.headers.origin || 'https://mon-hub-protector.vercel.app/';
  const link = `${origin}/raw.html?id=${id}`;

  res.status(200).json({
    id,
    link,
    loadstring: `loadstring(game:HttpGet("${link}"))()`
  });
}

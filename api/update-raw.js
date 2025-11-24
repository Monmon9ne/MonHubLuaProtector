import fs from 'fs';
import path from 'path';

export default async function handler(req,res){
    if(req.method!=='POST') return res.status(405).json({error:'Method Not Allowed'});
    const { id, password, code } = req.body;
    if(!id || !password || !code) return res.status(400).json({error:'Missing parameters'});

    const dbPath = path.join(process.cwd(),'raw-db.json');
    let db = { raws: [] };
    try{
        db = JSON.parse(fs.readFileSync(dbPath,'utf-8'));
    } catch{}

    const raw = db.raws.find(r=>r.id===id);
    if(!raw) return res.status(404).json({error:'RAW not found'});
    if(raw.password!==password) return res.status(403).json({error:'Wrong password'});

    raw.code = code;
    fs.writeFileSync(dbPath, JSON.stringify(db,null,2));
    res.status(200).json({success:true});
}

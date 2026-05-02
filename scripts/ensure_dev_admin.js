#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const email = (argv.email || process.env.ADMIN_SEED_EMAIL || process.env.OPERATOR_EMAIL || 'admin@example.ch').toLowerCase();
const password = argv.password || process.env.ADMIN_SEED_PASSWORD || 'ChangeMe123!';
const outDir = path.join(process.cwd(),'dev_data');
const outFile = path.join(outDir,'admins.json');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir,{ recursive:true });
(async ()=>{
  const hash = await bcrypt.hash(password,10);
  let rows = [];
  if (fs.existsSync(outFile)) {
    try { rows = JSON.parse(fs.readFileSync(outFile,'utf8')); } catch(e){ rows = []; }
  }
  const exists = rows.find(r=>r.email===email);
  if (!exists) {
    const id = 'dev-'+Date.now();
    rows.push({ id, email, password_hash: hash, name: process.env.ADMIN_SEED_NAME||'Admin (dev)' });
    fs.writeFileSync(outFile, JSON.stringify(rows,null,2),'utf8');
    console.log('INSERTED_ADMIN', email);
  } else {
    console.log('ADMIN_EXISTS', email);
  }
  console.log('OUTFILE', outFile);
})().catch(e=>{ console.error('ERROR', e && e.message ? e.message : e); process.exit(1); });

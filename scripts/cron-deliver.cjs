#!/usr/bin/env node
// cron-deliver.cjs — clean + upload IMA in one deterministic pipeline
const fs = require('fs'), path = require('path'), crypto = require('crypto'), https = require('https'), {spawnSync} = require('child_process');

const reportFile = process.argv[2], taskKey = process.argv[3];
if (!reportFile || !taskKey) { console.error('Usage: node cron-deliver.cjs <report.md> <task-key>'); process.exit(1); }

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '.solo', 'cron-config.json'), 'utf8'));
const tc = config[taskKey];
if (!tc) { console.error('Unknown task-key:', taskKey); process.exit(1); }

const ci = fs.readFileSync(path.join(process.env.USERPROFILE, '.config', 'ima', 'client_id'), 'utf8').trim();
const ak = fs.readFileSync(path.join(process.env.USERPROFILE, '.config', 'ima', 'api_key'), 'utf8').trim();
const opts = JSON.stringify({clientId: ci, apiKey: ak});
const SKILL = 'C:/Users/shibi/.openclaw/skills/ima-skill';
function call(p,b) { var r=spawnSync('node',[path.join(SKILL,'ima_api.cjs'),p,JSON.stringify(b),opts],{encoding:'utf8',maxBuffer:10*1024*1024}); return r.status?null:JSON.parse(r.stdout); }
function hmac(k,d) { return crypto.createHmac('sha1',k).update(d).digest('hex'); }
function sha(d) { return crypto.createHash('sha1').update(d).digest('hex'); }

// ── Clean ──
var c = fs.readFileSync(reportFile, 'utf8'), orig = c;
c = c.split('\n').filter(function(l) { var t=l.trim(); if(!t) return true;
  for (var i=0,W=['babata','Tavily','web_fetch','配额','降级','信源说明','质量控制','**信源','IMA','media_id','code=','上传','📤','📁','☁️','知识库','G4.5','G3','G0','G1','G2','门禁','交付门禁','quality_gate','checkpoint','生成时间','搜索工具','信源状态']; i<W.length; i++) { if (t.includes(W[i])) return false; } return true;
}).join('\n');
c = c.replace(/\[S\d+\][^\]\n]*\]?/g, '').replace(/\*\*来源分析：\*\*.*/g, '').replace(/\*\*信源[：:].*/g, '').replace(/\n{3,}/g,'\n\n').trim()+'\n';
if (c !== orig) { fs.writeFileSync(reportFile, c, 'utf8'); console.log('✓ cleaned'); }

// ── Upload ──
var fn = path.basename(reportFile), sz = Buffer.byteLength(c, 'utf8');
var cr = call('openapi/wiki/v1/create_media', {file_name:fn,file_size:sz,content_type:'text/markdown',knowledge_base_id:tc.ima_kb_id,file_ext:'md'});
if (!cr||cr.code!==0) { console.error('✗ create_media'); process.exit(1); }
var d=cr.data,cred=d.cos_credential,ck=cred.cos_key,mi=d.media_id;
var h=cred.bucket_name+'.cos.'+cred.region+'.myqcloud.com',p='/'+ck;
var sh={'content-length':String(sz),host:h};
var kt=cred.start_time+';'+cred.expired_time,sk=hmac(cred.secret_key,kt);
var hl=Object.keys(sh).sort().map(function(k){return k.toLowerCase()+'='+encodeURIComponent(sh[k])}).join('&');
var hs='sha1\n'+kt+'\n'+sha('put\n'+p+'\n\n'+hl+'\n')+'\n';
var sig=hmac(sk,hs);
var au='q-sign-algorithm=sha1&q-ak='+cred.secret_id+'&q-sign-time='+kt+'&q-key-time='+kt+'&q-header-list='+Object.keys(sh).sort().map(function(k){return k.toLowerCase()}).join(';')+'&q-url-param-list=&q-signature='+sig;
var buf = Buffer.from(c, 'utf8');

var req = https.request({hostname:h,port:443,path:p,method:'PUT',headers:{'Content-Type':'text/markdown','Content-Length':buf.length,'Authorization':au,'x-cos-security-token':cred.token}}, function(res) {
  var b=''; res.on('data',function(x){b+=x}); res.on('end',function() {
    if (res.statusCode>=300) { console.error('✗ COS '+res.statusCode); process.exit(1); }
    var a=call('openapi/wiki/v1/add_knowledge',{media_type:7,media_id:mi,title:fn,knowledge_base_id:tc.ima_kb_id,file_info:{cos_key:ck,file_size:sz,file_name:fn}});
    if (a&&a.code===0) console.log('✓ uploaded '+tc.ima_kb_name);
    else { console.error('✗ add_knowledge'); process.exit(1); }
  });
});
req.on('error',function(e){console.error('✗ COS error:',e.message);process.exit(1);});
req.setTimeout(30000,function(){req.destroy();console.error('✗ timeout');process.exit(1);});
req.write(buf); req.end();

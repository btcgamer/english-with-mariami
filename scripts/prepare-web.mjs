import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'www');
const skip = new Set(['.git','.github','node_modules','android','www']);

function copyDir(src, dst){
  fs.mkdirSync(dst,{recursive:true});
  for(const entry of fs.readdirSync(src,{withFileTypes:true})){
    if(skip.has(entry.name)) continue;
    const from=path.join(src,entry.name);
    const to=path.join(dst,entry.name);
    if(entry.isDirectory()) copyDir(from,to);
    else if(entry.isFile()) fs.copyFileSync(from,to);
  }
}

fs.rmSync(out,{recursive:true,force:true});
copyDir(root,out);
console.log('Prepared web bundle:',out);

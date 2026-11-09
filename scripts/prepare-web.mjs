import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const privateCourses = process.env.PRIVATE_COURSES === '1';
const out = path.join(root, 'www');
const skip = new Set(['node_modules','android','www','scripts','qa','test-results','playwright-report','store-listing','supabase','setup-windows']);
const webExtensions = new Set(['.html','.js','.mjs','.css','.json','.webmanifest','.svg','.png','.jpg','.jpeg','.webp','.gif','.ico','.avif','.mp3','.wav','.ogg','.m4a','.mp4','.webm','.woff','.woff2','.ttf','.otf','.txt','.wasm','.glb','.gltf','.bin','.ktx','.ktx2']);
const buildOnlyFiles = new Set(['package.json','package-lock.json','tsconfig.json']);

function copyDir(src, dst){
  fs.mkdirSync(dst,{recursive:true});
  for(const entry of fs.readdirSync(src,{withFileTypes:true})){
    if(entry.name.startsWith('.') || skip.has(entry.name) || buildOnlyFiles.has(entry.name) || /\.(spec|test)\.[cm]?js$/.test(entry.name)) continue;
    const from=path.join(src,entry.name);
    const to=path.join(dst,entry.name);
    const relative=path.relative(root,from).split(path.sep).join('/');
    if(privateCourses && (
      /^grade([1-9]|1[0-2])(?:\/|\.html$)/.test(relative) ||
      /^shared\/mariami-grammar-listening\/grade-\d+\.js$/.test(relative) ||
      /^curriculum\/grade\d+-world\d+\.json$/.test(relative) ||
      ['shared/academy-grade-core.js','curriculum.js','lesson.html'].includes(relative)
    ))continue;
    if(entry.isDirectory()) copyDir(from,to);
    else if(entry.isFile() && webExtensions.has(path.extname(entry.name).toLowerCase())) fs.copyFileSync(from,to);
  }
}

fs.rmSync(out,{recursive:true,force:true});
copyDir(root,out);
if(privateCourses){
 const configPath=path.join(out,'config.js');
 fs.writeFileSync(configPath,'window.EWM_PRIVATE_COURSES=true;\n'+fs.readFileSync(configPath,'utf8'));
 function redirect(file,target){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,'<!doctype html><html lang="ka"><meta charset="utf-8"><title>აკადემია</title><script>const t=new URL('+JSON.stringify(target)+',location.href),p=new URLSearchParams(location.search),g=Number(p.get("grade"));if(!t.searchParams.has("grade")&&Number.isInteger(g)&&g>=1&&g<=12)t.searchParams.set("grade",g);if(p.get("lesson"))t.searchParams.set("lesson",p.get("lesson"));location.replace(t.href)</script><a href="'+target+'">გახსენი აკადემია</a></html>');
 }
 for(let n=1;n<=12;n++){
  redirect(path.join(out,'grade'+n,'index.html'),'../academy.html?grade='+n);
  redirect(path.join(out,'grade'+n+'.html'),'academy.html?grade='+n);
 }
 redirect(path.join(out,'lesson.html'),'academy.html');
 const advanced=path.join(out,'advanced-academy.html');
 fs.writeFileSync(advanced,fs.readFileSync(advanced,'utf8').replace('<head>','<head><script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="config.js"></script>'));
 const worker=path.join(out,'sw.js');
 fs.writeFileSync(worker,fs.readFileSync(worker,'utf8').replace('english-with-mariami-v29','english-with-mariami-private-v1'));
 fs.copyFileSync(path.join(root,'CNAME'),path.join(out,'CNAME'));
}
console.log('Prepared web bundle:',out,privateCourses?'(PRIVATE CONTENT; backend must be deployed)':'(existing public content)');

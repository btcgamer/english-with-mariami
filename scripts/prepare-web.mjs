import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
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
    if(entry.isDirectory()) copyDir(from,to);
    else if(entry.isFile() && webExtensions.has(path.extname(entry.name).toLowerCase())) fs.copyFileSync(from,to);
  }
}

fs.rmSync(out,{recursive:true,force:true});
copyDir(root,out);
console.log('Prepared web bundle:',out);

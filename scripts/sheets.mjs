#!/usr/bin/env node
// 下载视频（可选）并切成「拼图页」：每页 6 帧，供视觉阅读烧录字幕与画面。
// 用法: node sheets.mjs <mp4路径|http地址> <输出目录> [--interval 4] [--cols 2] [--rows 3] [--width 636] [--name note]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const fail = m => { console.log('FAIL ' + m); process.exit(1); };
const argv = process.argv.slice(2);
const src = argv.shift();
const outDir = argv.shift();
if (!src || !outDir) fail('缺少参数：需要 <视频源> 和 <输出目录>');

const opt = {};
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
}
const interval = Number(opt.interval || 4);
const cols = Number(opt.cols || 2);
const rows = Number(opt.rows || 3);
const width = Number(opt.width || 636);
const name = opt.name || 'note';

// ffmpeg：必须是 .exe。D:\dsh-tools\bin\ffmpeg.cmd 那个包装器和 package/ 下的 2016 版都不能用。
function findFfmpeg(bin) {
  const exe = bin + '.exe';
  let fallback = null;
  const roots = [
    path.join(os.homedir(), '.dsh', 'tools', 'ffmpeg'),
    'D:\\dsh-tools',
    'C:\\Program Files\\ffmpeg',
  ];
  const wanted = [];
  for (const root of roots) if (fs.existsSync(root)) wanted.push(root);
  for (const root of wanted) {
    const stack = [[root, 0]];
    while (stack.length) {
      const [dir, depth] = stack.pop();
      if (depth > 4) continue;
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) { if (!/[\\/]package[\\/]|node_modules/i.test(full)) stack.push([full, depth + 1]); continue; }
        if (e.name !== exe) continue;
        if (/[\\/]package[\\/]/i.test(full)) continue;
        if (/[\\/]gyan|[\\/]btbn|master/i.test(full)) return full;   // 首选当前构建
        if (!fallback) fallback = full;
      }
    }
  }
  return fallback;
}

const ffmpeg = findFfmpeg('ffmpeg') || fail('找不到 ffmpeg.exe');
const ffprobe = findFfmpeg('ffprobe') || ffmpeg.replace(/ffmpeg\.exe$/, 'ffprobe.exe');
fs.mkdirSync(outDir, { recursive: true });

let video = src;
if (/^https?:\/\//i.test(src)) {
  video = path.join(outDir, name + '.mp4');
  if (!fs.existsSync(video) || fs.statSync(video).size === 0) {
    const r = spawnSync('curl', ['-sS', '--fail', '--max-time', '300',
      '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
      '-o', video, src], { windowsHide: true });
    if (r.status !== 0) fail('下载失败：' + (r.stderr.toString().trim() || '签名可能已过期，回页面重新取 masterUrl'));
  }
}
if (!fs.existsSync(video)) fail('视频不存在：' + video);

const probe = spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration',
  '-of', 'default=nw=1:nk=1', video]);
const duration = Math.round(Number(probe.stdout.toString().trim()));
if (!Number.isFinite(duration) || duration <= 0) fail('读不到时长，文件可能不完整');

const per = interval * cols * rows;
const sheets = [];
for (let i = 0, t = 0; t < duration; i++, t += per) {
  const out = path.join(outDir, `sheet-${String(i + 1).padStart(2, '0')}.jpg`);
  const r = spawnSync(ffmpeg, ['-y', '-v', 'error', '-ss', String(t), '-i', video,
    '-t', String(per), '-vf',
    `fps=1/${interval},scale=${width}:-1,tile=${cols}x${rows}`,
    '-frames:v', '1', '-qscale:v', '2', out], { windowsHide: true });
  if (r.status !== 0 || !fs.existsSync(out)) fail('第 ' + (i + 1) + ' 页拼图失败：' + r.stderr.toString().trim());
  sheets.push(`${out}  [${t}s - ${Math.min(t + per, duration)}s]`);
}

console.log(`video   ${video}  ${duration}s  ${(fs.statSync(video).size / 1048576).toFixed(1)}MB`);
console.log(`ffmpeg  ${ffmpeg}`);
console.log(`sheets  ${sheets.length} 页 / 每页${cols * rows}帧 / 间隔${interval}s`);
for (const s of sheets) console.log('  ' + s);

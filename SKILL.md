---
name: xiaohongshu-video-research
description: 调研小红书视频/图文笔记：抓元数据（标题、正文、话题、章节、赞藏评享、发布时间与 IP）、下载视频源、抽帧拼图读出烧录字幕与画面里的工具、交叉核实笔记提到的产品/仓库/账号，最后输出结构化结论。Use when given a xiaohongshu.com/explore or xhslink.com link to 调研/看看/拆解/总结, or to批量梳理某账号或某话题的视频内容. 触发词：小红书、xhs、笔记、视频调研、这条讲的什么、扒一下、选题、拆解、评论区。
when_to_use: 用户丢来一条小红书链接要调研内容，或要梳理某博主/某话题下的视频笔记。
argument-hint: <小红书链接或 noteId>
---

# 拆条 · 小红书视频调研

把一条小红书笔记变成「可信的内容摘要 + 事实核查」，而不是只复述标题。

## 核心思路

小红书网页是 Vue SPA，**`WebFetch` 只会拿到 JS 外壳**（返回 "No note content found"），必须用内置浏览器（`browser-use`）真实渲染，再从 `window.__INITIAL_STATE__` 里取结构化数据。

关键收益：SSR 数据里有三样东西是截图和正文都给不出来的——

1. **`video.consumer.chapters`**：视频自带的章节轴（`{text, time}`，毫秒）。按章节抽帧，比均匀抽帧省一半阅读量。
2. **`video.media.stream`**：多码率源直链，能下载原视频，把烧录字幕和画面里的软件界面读出来。
3. **`interactInfo`**：赞/藏/评/享的原始计数，配合作者主页的粉丝量，才能判断这条内容的影响力量级。

流程固定为：**取数 → 下载 → 抽帧 → 读图 → 核实 → 出报告**。

## 工作流

### 1. 打开笔记

从链接里只保留 `noteId`、`xsec_token`、`xsec_source` 三个参数导航（其余 `shareRedId`、`track_code` 等是噪声）：

```
https://www.xiaohongshu.com/explore/<noteId>?xsec_token=<token>&xsec_source=app_share&type=video
```

- `xsec_token` **不能丢**，丢了直接跳登录墙、拿不到数据。它和 noteId 绑定且会过期，链接放久了要让用户从小红书 App 重新分享。
- `xhslink.com` 短链先用 `curl -sIL <url>` 看 `location` 拿到最终地址，别直接在浏览器里猜。
- 页面会弹「登录后推荐更懂你的笔记」遮罩。**不用管，不用登录**，数据已经在 `__INITIAL_STATE__` 里了。

### 2. 取数

把 [scripts/page-extract.js](scripts/page-extract.js) 的**函数体整份**作为 `evaluate_script` 的 `function` 参数传入（去掉首行注释）。它按 URL 自动识别笔记页 / 作者主页 / 信息流，返回紧凑 JSON。

笔记页返回：`title` `desc` `tags` `time` `ipLocation` `user` `interact{liked,collected,comment,share}` `chapters[]` `video{durationSec,masterUrl,backupUrls,resolution,format,allStreams}` `images[]`。

字段路径的三个坑（都实测过）：

- 几乎所有值都是 Vue ref，必须递归 unwrap（`'_value' in o ? o._value : o.raw`），否则拿到的全是 `{dep, __v_isRef}`。
- 视频源在 **`note.video.media.stream`**，不是 `note.media`。`stream` 下按编码族分桶（`EF4`/`EF5`…），要 `Object.values().flat()` 再按 `width` 排序。
- **`mediaV2` 是一个被按字符下标展开的 JSON 字符串**，直接序列化会吐几万个 `"0":"{"` 键把上下文炸掉，必须跳过。
- `noteDetailMap` 里除了笔记 id 还有一个空串 `""` 占位键，逐条找有真字段的，别取 `[0]`。

### 3. 下载 + 抽帧

```
node scripts/sheets.mjs "<masterUrl>" ./out --interval 6
```

脚本会下载（本地文件路径也行）、自动定位 ffmpeg `.exe`、按每页 6 帧输出 `sheet-01.jpg …` 并打印每页对应的时间区间。

- **拿到 `masterUrl` 就立刻下载**：URL 上的 `sign` / `t` 是时效签名，隔一阵就 403，得回页面重取。
- 多码率时优先取高分辨率：`fmp4 1920x1080` 抽出来的帧，软件界面里的小字能直接读；`mp4 1280x720` 就糊。两种容器 ffmpeg 都能直接解码，`fmp4` 不用额外处理。
- 拼图参数：竖屏/文字密集用 `--interval 6`（每页覆盖 36 秒）；画面变化快的先 `--interval 2 --cols 3 --rows 3`。

### 4. 读画面

逐页 `Read` 拼图。小红书教程类视频**字幕是烧进画面的**，拼图读完基本等于读完口播。

- 有 `chapters` 就先按章节边界抽帧，每个章节至少覆盖 2 帧。
- 界面小字读不清时单独裁，别硬看拼图：
  ```
  ffmpeg -ss <t> -i src.mp4 -frames:v 1 -vf "crop=W:H:X:Y,scale=2000:-1,unsharp=5:5:0.8" out.jpg
  ```
  先整帧看构图定坐标，再放大。笔记里出现的**提示词全文**往往就藏在这种小字里，是调研里最值钱的产出。
- 重点记录：提到的产品名/模型名/仓库地址、界面里的模型下拉选项、演示用的提示词、成片上的效果标注（工具名 + 版本号 + 是否仅为示意）。

### 5. 核实

**调研不等于转述。** 笔记提到的每个实体都要外部验证一遍，这一步决定结论有没有价值：

- 仓库/产品：`gh api repos/<owner>/<name>` 拿 star、描述、最近 push（比网页准）；官网类用 `WebSearch`。
- 作者：进主页跑同一个取数脚本，看 `stats.posts`（笔记数）、`interactions`（粉丝）、近期笔记点赞分布。**小红书未登录时粉丝显示 `10+` 这类模糊值**，靠「笔记数远大于粉丝数、点赞长期个位数」这种比例判断是小账号还是真垂类博主。
- 数据自洽性：`likedCount` 与画面里展示的「爆款截图」对不对得上；标题承诺的内容在不在正片里。

### 6. 出报告

```
一句话结论
├── 笔记是什么：标题 / 作者 / 发布(绝对时间+IP) / 时长 / 话题标签
├── 数据：赞 藏 评 享 + 账号体量，据此定位影响力量级
├── 内容结构：按 chapters 分段，每段一句「讲了什么 + 画面证据」
├── 可复用产出：提示词原文、工具链、模型选择
├── 核实结果：逐个实体 真/存疑/说错，附证据链接
└── 对你的意义：能直接做什么、坑在哪
```

时间一律换算成绝对日期（`time` 是毫秒时间戳，UTC，北京时间 +8），别写「昨天」。

## 常见坑

| 现象 | 原因 | 处理 |
|---|---|---|
| WebFetch 说 "No note content found" | SPA，只返回 JS 外壳 | 走 browser-use 渲染 |
| 跳登录墙、无数据 | 丢了 `xsec_token` 或 token 过期 | 补齐参数；让用户重新分享 |
| 字段全是 `{dep, __v_isRef}` | Vue ref 没拆 | 递归 unwrap |
| 输出被几万个 `"0":"{"` 淹没 | 序列化了 `mediaV2` | 跳过该键 |
| `masterUrl` 为 null | 取的是 `note.media` | 改取 `note.video.media.stream` |
| 拿到笔记空壳 | `noteDetailMap` 的空串占位键 | 遍历找有真字段的条目 |
| 下载 403 | `sign`/`t` 时效签名过期 | 回页面重取，立刻下载 |
| 评论数为空 | 未登录时 `commentCount` 返回 `""` | 别当 0；要评论得登录后重取 |
| 粉丝只有 `10+` | 未登录的模糊展示 | 用笔记数与点赞分布交叉判断量级 |
| 拼图里小字看不清 | 缩放过度 | 单帧 `crop` + `scale` + `unsharp` |
| ffmpeg 报奇怪的编码错 | 命中了 `package/` 下 2016 的 3.0.1 版 | 脚本只认 `btbn`/`gyan`/`master` 路径的 `.exe` |
| Node 跑不动 `ffmpeg.cmd` | `.cmd` 不能直接 `execFile` | 用 `.exe` 全路径 |

## 边界

- **只读**。不点赞、不收藏、不评论、不关注；脚本不做批量抓取账号，逐条走浏览器，避免触发风控。
- 需要评论区内容时明确告诉用户「未登录取不到评论」，让用户决定是否登录内置浏览器后重试。
- 图文笔记走同一条链路，`images[]` 直接给出原图地址，跳过抽帧。

## 清理

调研产物是中间品。收尾只留：视频源文件 + 报告里真正引用的那几张关键帧，删掉 `frames/`、其余拼图与临时裁剪。

## Resources

- [scripts/page-extract.js](scripts/page-extract.js) — 浏览器侧取数（自动识别笔记/主页/信息流，拆 Vue ref，绕开 `mediaV2`）
- [scripts/sheets.mjs](scripts/sheets.mjs) — 下载 + 抽帧拼图（自动定位 ffmpeg `.exe`，打印每页时间区间）

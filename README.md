<div align="center">

# 拆条 · xiaohongshu-video-research

**把一条小红书视频，变成可核对的调研结论**

不用登录 · 下载原视频抽帧读字幕 · 按章节定位重点 · 提到的工具逐个核实

[![version](https://img.shields.io/badge/version-0.1.0-111111?style=flat-square)](CHANGELOG.md)
[![license](https://img.shields.io/badge/license-MIT-2ea44f?style=flat-square)](LICENSE)
[![node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](#技术栈与依赖)
[![ffmpeg](https://img.shields.io/badge/ffmpeg-required-000000?style=flat-square)](#技术栈与依赖)
[![no-login](https://img.shields.io/badge/无需登录-E8A33D?style=flat-square)](#它解决什么)
[![stars](https://img.shields.io/github/stars/LiliLIN0324/xiaohongshu-video-research-skill?style=social)](https://github.com/LiliLIN0324/xiaohongshu-video-research-skill/stargazers)

[快速开始](#快速开始) · [实测数据](#实测数据) · [术语对照](#术语对照) · [技术栈](#技术栈与依赖) · [English](README.en.md)

</div>

---

## 它解决什么

丢过来一条小红书视频链接，想搞清楚它到底讲了什么、值不值得信，通常会卡在三件事上：

1. **抓不到内容。** 小红书网页属于「先给你一个空壳，再由浏览器当场把内容搭出来」的单页应用。普通抓取工具（`WebFetch`、`curl`）只能拿到那个空壳，正文一个字都没有；不登录又被弹窗挡住。
2. **重点全在画面里。** 教程类笔记真正的信息——软件名、选了哪个模型、提示词、参数——是烧在视频画面上的，文字简介往往只有一行话题标签。只看标题和简介等于没看。
3. **转述不等于调研。** 「这个模型做得跟某个几乎一模一样」这类话，是实测结论还是随口观感？不查它提到的工具、不查这个账号的底细，根本没法判断。

## 它是怎么干活的

一句话：**不去屏幕上抄，直接拿网页自己带着的那份数据。**

小红书加载页面时，会把整条笔记的资料随页面一起下发，放在一个叫 `window.__INITIAL_STATE__` 的变量里（细节见 [术语对照](#术语对照)）。我们从这里能拿到标题、正文、话题、发布时间、IP 归属、赞藏评享，还有两样**截图永远给不出的东西**：

- **视频自带的章节轴**——博主自己标的分段，每段带时间点。有了它就知道该重点看哪几秒，不必把整个视频平均切一遍。
- **原视频直链**——拿到链接就能下载原片，按章节抽帧拼成几张图，把画面上的字幕和小字读出来。

最后把画面里提到的每个产品、仓库、账号，拿到站外逐个核实，再回作者主页看这个账号到底有多少人看。

所以产出不是一句「这条视频讲了什么内容」，而是一条可核对的结论：它提到的软件是否真存在、什么量级，它声称的效果有没有依据，发这条的账号有多少人在看，以及这条能不能直接照着做。

## 实测数据

拿一条真实的教程笔记视频（72 秒）从头跑到尾，全程不登录。这条笔记本身的内容不在这里出现——它是别人的创作，本仓库只讲工具做了什么。

| | |
|---|---|
| 元数据 | 标题 / 正文 / 话题 / 发布绝对时间 + IP 归属 / 赞藏享全部取到（未登录时评论数是空值，不当成 0） |
| 章节轴 | 取到博主自标的分段与时间点，抽帧直接按它定位 |
| 视频源 | 从多个清晰度里自动选到最清晰的 1080p，10.9 MB，直链带时效所以立刻下载 |
| 抽帧 | 2 页拼图，每页 6 帧，覆盖全片 |
| 读画面 | 字幕逐句读出；界面里的下拉选项、参数、版本号也能读；藏在界面小字里的整段提示词需要单独裁剪 + 放大 + 锐化才读得清 |
| 站外核实 | 画面里提到的每个仓库 / 产品都能逐个查真伪与量级（本仓库不列具体条目） |
| 账号体量 | 同一段脚本换到作者主页就能出笔记数、粉丝量级、近期点赞分布，用来判断这条是干货还是引流 |
| 单条耗时 | 约 6 分钟 |

## 特点

| 能力 | 说明 |
|---|---|
| **绕开抓取难题，也绕开登录** | 数据来自页面自带的下发内容，不需要账号、不需要 Cookie、不碰任何风控接口 |
| **章节轴优先** | 视频常带博主自己标的分段，按它抽帧比均匀抽帧省一半看图量，也不会漏掉重点段 |
| **自动挑最清晰的源** | 同一条视频有好几个清晰度版本，脚本按分辨率排序、清晰度相同优先通用格式；1080p 抽出来的帧，界面小字能直接读 |
| **小字单独裁** | 拼图看不清时按坐标裁剪 + 放大 + 锐化，把提示词、参数、版本号这类最值钱的信息抠出来 |
| **强制核实环节** | 调研流程里「核实」是独立一步，不是可选动作：仓库查官方接口，产品做搜索，账号回主页跑同一个脚本 |
| **只写绝对日期** | 时间戳一律换算成带时区的具体日期，报告里不出现「昨天」这种过两天就看不懂的说法 |
| **只读** | 不点赞、不收藏、不评论、不关注，逐条走浏览器，不做批量抓取 |
| **装起来很轻** | 只要有 Node.js 和系统里的 ffmpeg，不额外安装任何包；ffmpeg 路径自动查找，并且明确避开假的包装器和十年前的老版本 |

## 术语对照

README 里出现的行话，对应的大白话：

| 术语 | 大白话 | 在这里干什么 |
|---|---|---|
| SPA / 单页应用 | 网页是个空壳，内容靠浏览器现场搭出来 | 所以老式抓取拿不到正文，必须真开一个浏览器 |
| SSR / 下发数据 | 服务器把数据随页面一起给过来 | 我们的数据来源，不用点来点去地凑 |
| `window.__INITIAL_STATE__` | 页面自带的那份「笔记资料包」 | 标题、互动数、章节轴、视频地址都在这 |
| Vue ref | 资料包里的值被包了一层包装 | 得逐层拆包装，否则读到的全是包装本身 |
| `mediaV2` | 一个被拆成几万个字符的巨型字段 | 必须跳过，不然一次就塞满 AI 的记忆 |
| 章节轴 `chapters` | 博主给视频写的分段目录 | 告诉该重点抽哪几秒的帧 |
| `masterUrl` + `sign` | 原视频下载地址 + 限时通行证 | 通行证会过期，所以拿到就下载 |
| `xsec_token` | 分享链接里的门牌号 | 丢了就被请去登录页，什么都拿不到 |
| 抽帧拼图 | 按固定间隔截图，拼成几张九宫格 | 让人（或 AI）一次看完整个视频的画面上字 |
| `unsharp` | 锐化，把糊掉的小字边缘掰清楚 | 配合裁剪放大，读界面里的提示词 |

## 快速开始

对 agent 说一句人话即可：

> 调研这条小红书视频 https://www.xiaohongshu.com/explore/xxxx?xsec_token=yyyy

装成技能后它会自动触发；没装技能时，让它先读 [`AGENTS.md`](AGENTS.md)。

手动跑的话，两步：

**1. 浏览器里取数。** 把 [`scripts/page-extract.js`](scripts/page-extract.js) 的函数体整份，作为页面 JS 执行（Qoder 里是 `evaluate_script` 的 `function` 参数）。它按网址自动识别是笔记页 / 作者主页 / 信息流，返回紧凑 JSON：

```json
{
  "page": "note",
  "title": "…",
  "time": "2026-10-22T09:50:38.000Z",
  "chapters": [{ "text": "<分段名>", "time": 44080 }],
  "video": {
    "durationSec": 72,
    "masterUrl": "http://sns-video-v2.xhscdn.com/stream/…?sign=…&t=…",
    "resolution": "1920x1080",
    "format": "fmp4",
    "allStreams": ["mp4 1280x720 type258", "fmp4 1280x720 type3090", "fmp4 1920x1080 type3091"]
  }
}
```

**2. 下载 + 抽帧。**

```bash
node scripts/sheets.mjs "<masterUrl>" ./out --interval 6
```

```
video   out\note.mp4  72s  10.9MB
ffmpeg  C:\Users\you\.dsh\tools\ffmpeg\btbn\…\bin\ffmpeg.exe
sheets  2 页 / 每页6帧 / 间隔6s
  out\sheet-01.jpg  [0s - 36s]
  out\sheet-02.jpg  [36s - 72s]
```

之后逐页看图读字幕，再核实、出报告。完整流程和判断标准在 [`SKILL.md`](SKILL.md)。

> ⏱ 视频地址上的 `sign` / `t` 是**限时通行证**，拿到就得下载，隔天再跑会 403。
> 🔑 打开链接时必须带上 `xsec_token`，丢了直接跳登录墙；它和笔记 id 绑定且会过期，链接放久了要请人重新分享。

## 工作方式

```
 分享链接 ──▶ 浏览器渲染（带 xsec_token）
                  │
                  ├─▶ __INITIAL_STATE__ ──▶ 元数据 + 章节轴 + 多清晰度直链
                  │                              │
                  │                              ▼
                  │                     sheets.mjs：下载 → 抽帧拼图
                  │                              │
                  │                              ▼
                  │                     逐页读字幕 / 裁剪放大读小字
                  │
                  └─▶ 作者主页 ──▶ 同一脚本 ──▶ 笔记数 / 粉丝 / 点赞分布
                                                 │
        画面里提到的仓库、产品、版本号 ────────────┤
                                                 ▼
                                    gh api / 搜索 逐个核实
                                                 │
                                                 ▼
                                    结论 + 数据 + 分段 + 核实 + 可用性
```

四个关键决定：

- **为什么不解析网页结构**：网页的界面标签会随前端改版变来变去，下发数据里的字段路径稳定得多；而且界面上根本没有章节轴和视频地址。
- **为什么必须逐层拆 Vue ref**：下发数据里几乎所有值都被包了一层，不拆拿到的全是包装。这一步漏了，后面全空。
- **为什么跳过 `mediaV2`**：它是一个被按字符位置展开的巨型字符串，直接读取会吐出几万个碎片键，一次调用就能把上下文撑爆。
- **为什么核实是硬步骤**：小红书上的 AI 教程大量引用刚发布、查不到的模型版本号，也有相当比例是引流内容。跳过核实，调研就退化成转述。

## 技术栈与依赖

| 层 | 用什么 | 为什么是它 |
|---|---|---|
| 运行环境 | Node.js 18+，只用内置模块 | 不装任何 npm 包，克隆下来就能跑；18+ 才自带全局 `fetch` |
| 取数 | 一段在页面里执行的原生 JS（`scripts/page-extract.js`） | 不引框架，不依赖小红书的前端代码，只做「拆包装 + 挑字段」 |
| 浏览器通道 | Qoder 内置 `browser-use`；换别的 agent 时可替成 Playwright / Puppeteer / Chrome DevTools MCP | 只要是能开页面并执行 JS 的通道就行，不绑死某一家 |
| 下载 | 系统 `curl` + 浏览器 UA | 视频站对无 UA 请求会拒绝，加一行头就行；无需再装 HTTP 库 |
| 视频处理 | 系统 ffmpeg / ffprobe（`.exe`） | 用它的 `fps` + `tile` 滤镜一条命令出拼图，比逐帧截图再排版少几十次调用 |
| 站外核实 | `gh api`（GitHub 官方接口）+ 联网搜索 | 仓库真伪和 star 数以官方接口为准，不采信视频里的说法 |
| 产出 | JSON（元数据）、JPG 拼图、Markdown 报告 | 三段产物各自给人看 / 给 AI 读，方便直接进笔记软件 |
| 平台 | Windows / macOS / Linux | ffmpeg 与 Node 跨平台；ffmpeg 路径自动扫描发现 |

**不需要**小红书账号，也不需要 `pip`/`npm install` 任何东西。

## 在任何 agent 里用

不绑定 Qoder。仓库根目录有 `AGENTS.md`（通用入口）和 `SKILL.md`（完整指南），任何能控制浏览器、能读写文件、能跑命令的 agent 都能照做：Codex、Claude Code、Gemini CLI、Grok CLI、DeepSeek harness、Cursor、Windsurf、Aider……

**最省事的方式**——克隆到任意位置，然后对 agent 说：

```bash
git clone https://github.com/LiliLIN0324/xiaohongshu-video-research-skill.git
```

> 读 `xiaohongshu-video-research-skill/AGENTS.md`，调研这条小红书视频：<链接>

**装成技能**（自动触发，不用每次指路）：

| Agent | 安装位置 |
|---|---|
| Qoder | `~/.qoder/skills/xiaohongshu-video-research` |
| Claude Code | `~/.claude/skills/xiaohongshu-video-research` |
| 其他 | 放进你的 agent 读取的规则/技能目录 |

```bash
# 以 Qoder 为例
mkdir -p ~/.qoder/skills
cp -r xiaohongshu-video-research-skill ~/.qoder/skills/xiaohongshu-video-research
```

```powershell
# Windows (PowerShell)
New-Item -ItemType Directory -Force "$HOME\.qoder\skills" | Out-Null
Copy-Item -Recurse xiaohongshu-video-research-skill "$HOME\.qoder\skills\xiaohongshu-video-research"
```

重开会话或执行 `/skills reload`，然后用 `/xiaohongshu-video-research` 调用。

**项目级**：把 `AGENTS.md`、`SKILL.md`、`scripts/` 放进你的项目，agent 打开项目就会读到。

## 目录

```
SKILL.md                    完整指南：取数字段路径、抽帧参数、读图技巧、核实清单、报告模板、坑位表
AGENTS.md                   通用入口：任何 agent 读这一份就能开工，含 7 条不可省略的硬规则
CLAUDE.md / GEMINI.md       指向 AGENTS.md（给只认固定文件名的 agent）
scripts/page-extract.js     浏览器侧取数：拆 Vue ref、识别页面类型、绕开 mediaV2、挑最清晰的源
scripts/sheets.mjs          下载 + 抽帧拼图：自动定位 ffmpeg.exe、按页输出并标注时间区间
CHANGELOG.md                版本记录
```

## 常见坑（完整版在 SKILL.md）

| 现象 | 原因 | 处理 |
|---|---|---|
| `WebFetch` 说没找到内容 | 网页是空壳，只返回 JS | 必须真实渲染浏览器 |
| 直接跳登录墙、无数据 | 丢了 `xsec_token`，或 token 过期 | 补齐参数；让用户重新分享 |
| 字段全是 `{dep, __v_isRef}` | Vue ref 没拆 | 递归 unwrap |
| 输出被几万个 `"0":"{"` 淹没 | 读取了 `mediaV2` | 跳过该键 |
| `masterUrl` 为 null | 取了 `note.media` | 视频源在 `note.video.media.stream` |
| 只拿到一条空壳笔记 | `noteDetailMap` 里有空串占位键 | 遍历找有真字段的条目 |
| 下载 403 | 限时签名过期 | 回页面重取，立刻下载 |
| 评论数是空的 | 未登录时 `commentCount` 返回 `""` | 别当成 0；要评论得登录后重取 |
| 粉丝只有 `10+` | 未登录的模糊展示 | 用笔记数与点赞分布交叉判断量级 |
| ffmpeg 报奇怪的编码错 | 命中了 2016 年的 3.0.1 老构建 | 只认 `btbn`/`gyan`/`master` 路径下的 `.exe` |

## 边界与注意

- **只读**：不点赞、不收藏、不评论、不关注。逐条走浏览器，不做批量抓取账号，避免触发风控。
- **这是个人调研工具**，不是数据采集方案。抓取行为受小红书用户协议与 robots 约束，请自行判断使用范围与频率，别拿去商用批量抓取。
- **转载他人内容要克制**：抽帧读到的提示词、脚本属于原作者创作，报告里应概述结构、注明出处，而不是整段搬运；拼图与关键帧是中间产物，不要随手公开传播（画面里有真人出镜）。

## 版本

当前 **0.1.0**：首个公开版本。取数脚本、抽帧脚本、7 条硬规则、核实环节与报告模板，均基于一条 72 秒真实视频端到端验证。

完整改动见 [CHANGELOG.md](CHANGELOG.md)。

## License

[MIT](LICENSE)

<div align="center">

如果这个 skill 帮你把"看个视频"变成"拿到能用的结论"，点个 Star 就是最好的支持。

</div>

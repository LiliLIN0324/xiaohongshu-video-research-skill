<div align="center">

# 拆条 · xiaohongshu-video-research

**把一条小红书视频，变成可核对的调研结论**

不登录取元数据 · 下载原视频抽帧读字幕 · 章节轴定位 · 提到的工具逐个核实

[![version](https://img.shields.io/badge/version-0.1.0-111111?style=flat-square)](CHANGELOG.md)
[![license](https://img.shields.io/badge/license-MIT-2ea44f?style=flat-square)](LICENSE)
[![node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](package.json)
[![ffmpeg](https://img.shields.io/badge/ffmpeg-required-000000?style=flat-square)](#依赖)
[![no-login](https://img.shields.io/badge/无需登录-E8A33D?style=flat-square)](#它解决什么)
[![stars](https://img.shields.io/github/stars/LiliLIN0324/xiaohongshu-video-research-skill?style=social)](https://github.com/LiliLIN0324/xiaohongshu-video-research-skill/stargazers)

[快速开始](#快速开始) · [实测效果](#实测效果) · [工作方式](#工作方式) · [English](README.en.md)

</div>

---

## 它解决什么

丢过来一条小红书视频链接，想搞清楚它到底讲了什么，通常会卡在三件事上：

1. **抓不到内容**——小红书是 Vue SPA，`WebFetch` / `curl` 只会拿回一坨 JS 外壳，正文一个字都没有；不登录又被弹层挡住。
2. **视频里才是正片**——教程类笔记的关键信息（软件名、模型选择、提示词、参数）全在**画面里**，正文只有一行话题标签。光看标题和简介等于没看。
3. **转述不等于调研**——"国产模型做得跟 Opus 几乎一模一样"这种话，到底是实测结论还是观感？不查工具和账号底细，根本没法判断这条值不值得信。

这个 skill 的做法是：**用真实浏览器渲染，然后从页面自带的数据里取，而不是从界面上读。**

小红书把整条笔记的元数据塞在 `window.__INITIAL_STATE__` 里随 SSR 一起下发——标题、正文、话题、发布时间、IP 归属、赞藏评享，以及两样截图永远给不出的东西：**视频自带的章节轴**（`{text, time}`）和**多码率源直链**。拿到直链就能下载原视频，按章节抽帧拼图，把烧录字幕和界面小字读出来。最后把画面里提到的每个产品、仓库、账号，拿到站外逐个核实。

所以产出不是"这条视频讲了 AI 做动效"，而是"它讲的 OpenDesign 是 103k star 的真实开源项目，但发这条的账号 212 篇笔记只有 10+ 粉丝、这条 3 个赞，所谓『跟 Opus 一样』没有对照实验"。

## 实测效果

一条 72 秒的 AI 动效教程视频，全程不登录。

| | |
|---|---|
| 取到元数据 | 标题 / 正文 / 话题 / 发布绝对时间 + IP / 赞 3 · 藏 2 · 享 1 |
| 章节轴 | 4 段（引言 / 特点 / 方法一 / 方法二），直接定位重点 |
| 视频源 | 自动选到 1080p，10.9 MB，签名直链立即下载 |
| 抽帧 | 2 页拼图，每页 6 帧，覆盖全片 |
| 读出内容 | 全部烧录字幕 + 界面里的模型下拉选项 + **藏在界面小字里的完整提示词**（单独裁剪放大才读得清） |
| 站外核实 | 2 个实体：开源仓库（真实，103k star，当天有提交）+ 某厂办公智能体（真实，已上线） |
| 账号底细 | 212 篇笔记 / 粉丝显示 10+ / 近 10 条点赞 1–21 → 判定为低流量教程号 |
| 单条耗时 | 约 6 分钟 |

提示词原文属于博主的创作，这里不复述；结构是「时长 + 主角动作 + 三段作品依次登场 + 统一风格 + 配色 + 质感与动作约束 + 少放文字用画面讲故事」——这个骨架本身可以直接套到任何作品介绍片上。

## 特点

| 能力 | 说明 |
|---|---|
| **绕开 SPA，不绕开登录** | 数据来自 SSR 自带的 `__INITIAL_STATE__`，不需要账号、不需要 Cookie、不碰任何风控接口 |
| **章节轴优先** | 小红书视频常带 `chapters`，按它抽帧比均匀抽帧省一半阅读量，也不会漏掉重点段 |
| **自动挑最高清源** | `mp4 1280×720` 和 `fmp4 1920×1080` 都在，脚本按分辨率排序、同分辨率优先 mp4；1080p 抽出来的帧，界面小字能直接读 |
| **小字单独裁** | 拼图看不清时按坐标裁剪 + 放大 + `unsharp`，把提示词、参数、版本号这类最值钱的信息抠出来 |
| **强制核实环节** | 调研流程里"核实"是独立一步，不是可选动作：仓库走 `gh api`，产品走搜索，账号回主页跑同一个脚本 |
| **绝对时间** | `time` 是毫秒时间戳（UTC），一律换算成带时区的绝对日期，报告里不出现"昨天" |
| **只读** | 不点赞、不收藏、不评论、不关注，逐条走浏览器，不做批量抓取 |
| **零依赖安装** | 只要 Node 18+ 和系统 ffmpeg；ffmpeg 路径自动发现，且**明确避开** `.cmd` 包装器和 2016 年的老构建 |

## 依赖

Node.js 18+、系统 ffmpeg（Windows / macOS / Linux 均可）。浏览器用 Qoder 内置的 `browser-use`；在其他 agent 里换成任意能执行 JS 的浏览器控制通道即可（Playwright / Puppeteer / Chrome DevTools MCP）。

**不需要**小红书账号，也不需要安装任何 npm 包。

## 快速开始

对 agent 说一句人话即可：

> 调研这条小红书视频 https://www.xiaohongshu.com/explore/xxxx?xsec_token=yyyy

装成技能后它会自动触发；没装技能时，让它先读 [`AGENTS.md`](AGENTS.md)。

手动跑的话，两步：

**1. 浏览器里取数。** 把 [`scripts/page-extract.js`](scripts/page-extract.js) 的函数体整份，作为页面 JS 执行（Qoder 里是 `evaluate_script` 的 `function` 参数）。它按 URL 自动识别笔记页 / 作者主页 / 信息流，返回紧凑 JSON：

```json
{
  "page": "note",
  "title": "…",
  "time": "2026-10-22T09:50:38.000Z",
  "chapters": [{ "text": "方法一", "time": 44080 }],
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

> ⏱ `masterUrl` 上的 `sign` / `t` 是**时效签名**，拿到就得下载，隔天再跑会 403。
> 🔑 导航时必须带上 `xsec_token`，丢了直接跳登录墙；它和笔记 id 绑定且会过期，链接放久了要重新分享。

## 工作方式

```
 分享链接 ──▶ 浏览器渲染（带 xsec_token）
                  │
                  ├─▶ __INITIAL_STATE__ ──▶ 元数据 + 章节轴 + 多码率直链
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

几个关键决定：

- **为什么不解析网页 DOM**：DOM 结构随前端版本变，`__INITIAL_STATE__` 的字段路径稳定得多，而且 DOM 上根本没有章节轴和源地址。
- **为什么必须递归拆 Vue ref**：`__INITIAL_STATE__` 里几乎所有值都被包成 ref，不拆拿到的全是 `{dep, __v_isRef}`。这一步漏了，后面全空。
- **为什么跳过 `mediaV2`**：它是一个被按字符下标展开的 JSON 字符串，直接序列化会吐出几万个 `"0":"{"` 键，一次调用就能把上下文撑爆。
- **为什么核实是硬步骤**：小红书上的 AI 教程大量引用刚发布、查不到的模型版本号，也有相当比例是引流内容。跳过核实，调研就退化成转述。

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
scripts/page-extract.js     浏览器侧取数：拆 Vue ref、识别页面类型、绕开 mediaV2、挑最高清源
scripts/sheets.mjs          下载 + 抽帧拼图：自动定位 ffmpeg.exe、按页输出并标注时间区间
CHANGELOG.md                版本记录
```

## 常见坑（完整版在 SKILL.md）

| 现象 | 原因 | 处理 |
|---|---|---|
| `WebFetch` 说没找到内容 | SPA，只返回 JS 外壳 | 必须真实渲染浏览器 |
| 直接跳登录墙、无数据 | 丢了 `xsec_token`，或 token 过期 | 补齐参数；让用户重新分享 |
| 字段全是 `{dep, __v_isRef}` | Vue ref 没拆 | 递归 unwrap |
| 输出被几万个 `"0":"{"` 淹没 | 序列化了 `mediaV2` | 跳过该键 |
| `masterUrl` 为 null | 取了 `note.media` | 视频源在 `note.video.media.stream` |
| 只拿到一条空壳笔记 | `noteDetailMap` 里有空串占位键 | 遍历找有真字段的条目 |
| 下载 403 | `sign` / `t` 时效签名过期 | 回页面重取，立刻下载 |
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

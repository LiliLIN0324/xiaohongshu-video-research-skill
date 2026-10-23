# 拆条 · xiaohongshu-video-research

把一条小红书视频笔记，变成「可核对的调研结论」：元数据 + 分段内容 + 站外核实 + 账号体量判断。

这份文件是**任何编码 agent** 的入口——Codex、Claude Code、Gemini CLI、Grok CLI、DeepSeek harness、Cursor、Windsurf、Aider 都按同样的方式用。Qoder 下的同名技能读 `SKILL.md`，内容一致。

## 何时使用

用户丢来一条小红书链接（`xiaohongshu.com/explore/…`、`xhslink.com/…`）要调研、看看、拆解、总结；或要梳理某博主 / 某话题下的视频内容。

## 开工前必读

1. 先读 `SKILL.md`（字段路径、抽帧参数、读图技巧、核实清单、报告模板、坑位表）。
2. 浏览器侧取数用 `scripts/page-extract.js`，整份函数体作为页面 JS 执行。
3. 下载与抽帧用 `scripts/sheets.mjs`，不要自己手写 ffmpeg 命令。

## 不可省略的 7 条

违反任意一条，这一步就会静默失败或得出错误结论：

1. **不要用 `WebFetch` / `curl` 抓正文** —— 小红书是 Vue SPA，只会返回 JS 外壳。必须真实渲染浏览器，再从 `window.__INITIAL_STATE__` 取数。
2. **导航时必须保留 `xsec_token`** —— 丢了直接跳登录墙、拿不到数据。它和 noteId 绑定且会过期，链接放久了要请用户从小红书 App 重新分享。登录弹层不用管，不用登录。
3. **必须递归 unwrap Vue ref**（`'_value' in o ? o._value : o.raw`）—— `__INITIAL_STATE__` 里几乎所有值都被包成 ref，不拆拿到的全是 `{dep, __v_isRef}`。
4. **必须跳过 `mediaV2`** —— 它是被按字符下标展开的 JSON 字符串，序列化一次就吐几万个 `"0":"{"` 键，把上下文撑爆。
5. **视频源在 `note.video.media.stream`，不是 `note.media`** —— `stream` 下按编码族分桶（`EF4`/`EF5`…），要 `Object.values().flat()` 再按 `width` 排序取最高清。`noteDetailMap` 里还有个空串占位键，要遍历找有真字段的条目。
6. **拿到 `masterUrl` 立刻下载** —— URL 上的 `sign` / `t` 是时效签名，隔一阵就 403，得回页面重取。
7. **核实是硬步骤，不是可选动作** —— 画面里提到的每个仓库 / 产品 / 版本号都要站外验证：仓库走 `gh api repos/<owner>/<name>`，产品走搜索，作者回主页跑同一个取数脚本看笔记数与点赞分布。**跳过核实，调研就退化成转述。**

## 流程

```bash
# 1. 浏览器打开（只保留 noteId / xsec_token / xsec_source）
#    https://www.xiaohongshu.com/explore/<noteId>?xsec_token=<token>&xsec_source=app_share

# 2. 执行 scripts/page-extract.js 的函数体 → 紧凑 JSON
#    重点看 chapters（视频自带章节轴）和 video.masterUrl

# 3. 下载 + 抽帧
node scripts/sheets.mjs "<masterUrl>" ./out --interval 6

# 4. 逐页 Read 拼图，读烧录字幕；小字读不清就单独裁
ffmpeg -ss <t> -i out/note.mp4 -frames:v 1 \
  -vf "crop=W:H:X:Y,scale=2000:-1,unsharp=5:5:0.8" key.jpg

# 5. 核实：gh api / WebSearch / 作者主页再跑一次 page-extract.js
```

有 `chapters` 就先按章节边界抽帧，每段至少覆盖 2 帧，比均匀抽帧省一半阅读量。

## 报告

```
一句话结论
├── 笔记是什么：标题 / 作者 / 发布(绝对时间+IP) / 时长 / 话题
├── 数据：赞 藏 评 享 + 账号体量 → 影响力量级定位
├── 内容结构：按 chapters 分段，每段一句「讲了什么 + 画面证据」
├── 可复用产出：提示词结构、工具链、模型选择
├── 核实结果：逐个实体 真 / 存疑 / 说错，附证据链接
└── 对用户的意义：能直接做什么、坑在哪
```

时间一律换算成绝对日期（`time` 是毫秒时间戳，UTC，北京时间 +8），报告里不要出现"昨天"。

## 边界

- **只读**：不点赞、不收藏、不评论、不关注；逐条走浏览器，不做批量抓取账号。
- 未登录时 `commentCount` 返回空串，**别当成 0**；要评论区内容得先让用户在浏览器里登录。
- 抽帧读到的提示词、脚本属于原作者创作：概述结构、注明出处，不要整段搬运；拼图与关键帧是中间产物，画面含真人出镜，不要随手公开传播。
- 收尾清理：只留视频源和报告真正引用的关键帧，删掉 `frames/`、其余拼图与临时裁剪。

## 文件

```
SKILL.md                    完整指南（必读）
AGENTS.md                   本文件：通用入口
scripts/page-extract.js     浏览器侧取数
scripts/sheets.mjs          下载 + 抽帧拼图
```

依赖：Node 18+、系统 ffmpeg（脚本自动定位 `.exe`，避开 `.cmd` 包装器与 2016 老构建）、任意可执行页面 JS 的浏览器通道。不需要小红书账号。

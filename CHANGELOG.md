# Changelog

## 0.1.0 — 2026-10-23

首个公开版本，基于一条 72 秒真实视频笔记端到端验证。

- **`scripts/page-extract.js`**：浏览器侧取数。递归 unwrap Vue ref、跳过会炸上下文的 `mediaV2`、按 URL 自动识别笔记页 / 作者主页 / 信息流、从 `note.video.media.stream` 的多码率分桶里挑最高清源（同分辨率优先 mp4），并输出视频自带的 `chapters` 章节轴。
- **`scripts/sheets.mjs`**：下载 + 抽帧拼图。自动定位 ffmpeg `.exe`（明确避开 `.cmd` 包装器与 2016 年的 3.0.1 老构建），按每页 6 帧输出并标注每页对应的时间区间；本地文件与直链两种输入都支持。
- **7 条不可省略的硬规则**（`AGENTS.md`）：SPA 不能直接抓、`xsec_token` 必须带、Vue ref 必须拆、`mediaV2` 必须跳过、视频源路径、时效签名要立即下载、核实是硬步骤。
- **核实环节写进流程**：仓库走 `gh api`、产品走搜索、作者回主页跑同一脚本看笔记数与点赞分布，用来判断「这条值不值得信」，而不是只转述它说了什么。
- **报告模板固定**：结论 / 数据 / 按章节分段 / 可复用产出 / 核实结果 / 对用户的意义；时间一律换算成绝对日期。
- **边界写明**：只读、不批量抓取、未登录取不到评论且不能把空值当 0；抽帧读到的提示词属于原作者创作，只概述结构不整段搬运。
- **多 agent 通用**：`AGENTS.md` 通用入口 + `CLAUDE.md` / `GEMINI.md` 指向，中英双版 README。

---

## 0.1.0 — 2026-10-23

First public release, validated end-to-end on a real 72-second video note.

- **`scripts/page-extract.js`**: in-page extractor. Recursively unwraps Vue refs, skips `mediaV2` (a JSON string expanded per character index that would blow up the context), detects note / profile / feed pages by URL, picks the highest-resolution stream from `note.video.media.stream`, and returns the note's built-in `chapters`.
- **`scripts/sheets.mjs`**: download + contact sheets. Auto-discovers the ffmpeg `.exe` (explicitly avoiding the `.cmd` wrapper and a 2016-era 3.0.1 build), emits 6 frames per page and prints the time range of each page.
- **Seven non-negotiable rules** in `AGENTS.md`, covering the SPA shell, the mandatory `xsec_token`, ref unwrapping, the correct video-stream path, expiring signed URLs, and verification as a required step.
- **Verification is part of the workflow**: repos via `gh api`, products via search, authors via the same extractor — so the output judges credibility instead of restating the note.
- **Fixed report template** with absolute timestamps, plus explicit boundaries: read-only, no bulk scraping, and do not republish the creator's prompt verbatim.
- **Agent-agnostic**: `AGENTS.md` entry point, `CLAUDE.md` / `GEMINI.md` pointers, bilingual README.

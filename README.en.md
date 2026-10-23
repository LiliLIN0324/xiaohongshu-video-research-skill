<div align="center">

# 拆条 · xiaohongshu-video-research

**Turn a Xiaohongshu video note into a verified research finding**

No-login metadata extraction · source download · frame tiling to read burned-in subtitles · every tool the note mentions gets checked

[![version](https://img.shields.io/badge/version-0.1.0-111111?style=flat-square)](CHANGELOG.md)
[![license](https://img.shields.io/badge/license-MIT-2ea44f?style=flat-square)](LICENSE)
[![node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](package.json)
[![no-login](https://img.shields.io/badge/no%20login%20needed-E8A33D?style=flat-square)](#what-it-solves)
[![stars](https://img.shields.io/github/stars/LiliLIN0324/xiaohongshu-video-research-skill?style=social)](https://github.com/LiliLIN0324/xiaohongshu-video-research-skill/stargazers)

[Quick start](#quick-start) · [Real case](#real-case) · [How it works](#how-it-works) · [中文](README.md)

</div>

---

<a id="what-it-solves"></a>

## What it solves

Hand an agent a Xiaohongshu video link and ask what it actually says, and three things break:

1. **Nothing is fetchable.** Xiaohongshu is a Vue SPA — `WebFetch`/`curl` return a JS shell with zero content, and a login modal sits on top of the page.
2. **The video is the article.** In tutorial notes the payload (tool names, model selection, the prompt, the parameters) lives **in the frames**; the caption is often one hashtag.
3. **Restating is not researching.** "The domestic model looks just like Opus" — measured claim or vibe? You cannot judge the note without checking the tools and the account behind it.

The approach: **render a real browser, then read the data the page already ships, instead of reading the UI.**

Xiaohongshu serializes the whole note into `window.__INITIAL_STATE__` during SSR — title, body, hashtags, publish time, IP region, like/collect/comment/share counts, plus two things a screenshot can never give you: the video's **built-in chapter markers** (`{text, time}`) and the **multi-bitrate source URLs**. With the source URL you download the video, tile frames along the chapter axis, and read the burned-in subtitles and on-screen text. Then every product, repo and version number visible in the frames gets verified outside the app.

So the output is not "this video is about making motion graphics with AI", but: "the OpenDesign it demos is a real 103k-star open-source project, while the account posting it has 212 notes and 10+ followers, this note has 3 likes, and 'just like Opus' has no controlled comparison behind it."

<a id="real-case"></a>

## Real case

One 72-second AI motion-graphics tutorial. No login at any point.

| | |
|---|---|
| Metadata | title / body / hashtags / absolute publish time + IP region / 3 likes · 2 saves · 1 share |
| Chapter axis | 4 segments, used to target frame extraction |
| Video source | auto-selected 1080p, 10.9 MB, downloaded before the signature expired |
| Frames | 2 contact sheets, 6 frames each, full coverage |
| Read out | all burned-in subtitles + the model dropdown in the UI + **the complete prompt hidden in small on-screen text** (needed a crop-and-sharpen pass) |
| Verified | 2 entities: an open-source repo (real, 103k stars, commits the same day) and a vendor's office agent (real, shipped) |
| Account | 212 notes / followers shown as 10+ / last 10 notes at 1–21 likes → low-reach tutorial account |
| Elapsed | ~6 minutes |

The prompt itself belongs to the creator and is not reproduced here. Its shape is: *duration + protagonist action + three works entering in sequence + one unified style + palette + texture/motion constraints + "show less text, tell it through action"* — a skeleton reusable for any portfolio film.

<a id="features"></a>

## Features

| | |
|---|---|
| **Bypasses the SPA, not the login** | Data comes from SSR-shipped `__INITIAL_STATE__`: no account, no cookies, no scraping endpoints |
| **Chapter-first sampling** | Many videos carry `chapters`; extracting along them halves the frame count and never misses a segment |
| **Best stream automatically** | Ranks `mp4 1280×720` vs `fmp4 1920×1080`, prefers mp4 on ties; 1080p frames make small UI text legible |
| **Crop for fine print** | When the sheet is not enough: crop by coordinates, upscale, `unsharp` — that is where prompts and version numbers hide |
| **Verification is mandatory** | A separate, required step: repos via `gh api`, products via search, author via the same extractor |
| **Absolute dates** | `time` is a UTC millisecond timestamp; reports never say "yesterday" |
| **Read-only** | No likes, saves, comments, follows; per-note browsing, no bulk account scraping |
| **Nothing to install** | Node 18+ and system ffmpeg; ffmpeg is auto-discovered and the `.cmd` wrapper / 2016 build are explicitly avoided |

<a id="quick-start"></a>

## Quick start

Dependencies: Node.js 18+ and system ffmpeg. The browser uses Qoder's built-in `browser-use`; swap in any channel that can execute page JS (Playwright, Puppeteer, Chrome DevTools MCP). **No Xiaohongshu account, no npm packages.**

Just tell an agent:

> Research this Xiaohongshu video https://www.xiaohongshu.com/explore/xxxx?xsec_token=yyyy

Manually, two steps:

**1. Extract in-page.** Run the function body of [`scripts/page-extract.js`](scripts/page-extract.js) as page JS. It detects note / profile / feed pages by URL and returns compact JSON:

```json
{
  "page": "note",
  "time": "2026-10-22T09:50:38.000Z",
  "chapters": [{ "text": "Method 1", "time": 44080 }],
  "video": {
    "durationSec": 72,
    "masterUrl": "http://sns-video-v2.xhscdn.com/stream/…?sign=…&t=…",
    "resolution": "1920x1080",
    "format": "fmp4",
    "allStreams": ["mp4 1280x720 type258", "fmp4 1280x720 type3090", "fmp4 1920x1080 type3091"]
  }
}
```

**2. Download and tile.**

```bash
node scripts/sheets.mjs "<masterUrl>" ./out --interval 6
```

Then read the sheets page by page, verify what the frames mention, and write the report. Full procedure and judgement calls in [`SKILL.md`](SKILL.md).

> ⏱ `sign` / `t` on `masterUrl` are expiring signatures — download immediately or you get a 403.
> 🔑 Keep `xsec_token` when navigating; without it you hit the login wall and get no data.

<a id="how-it-works"></a>

## How it works

```
 shared link ──▶ browser render (with xsec_token)
                  │
                  ├─▶ __INITIAL_STATE__ ──▶ metadata + chapters + stream URLs
                  │                              │
                  │                              ▼
                  │                     sheets.mjs: download → tile frames
                  │                              │
                  │                              ▼
                  │                     read subtitles / crop for fine print
                  │
                  └─▶ author profile ──▶ same script ──▶ notes / followers / like spread
                                                              │
        repos, products and version numbers seen in frames ────┤
                                                              ▼
                                              gh api / search, one by one
                                                              │
                                                              ▼
                                    finding + data + segments + checks + usability
```

Key decisions:

- **Why not parse the DOM** — markup changes with every frontend release; the `__INITIAL_STATE__` paths are far more stable, and the DOM never contains chapters or source URLs anyway.
- **Why unwrap refs recursively** — nearly every value in `__INITIAL_STATE__` is a Vue ref; skip this and you get `{dep, __v_isRef}` everywhere and an empty report.
- **Why skip `mediaV2`** — it is a JSON string expanded by character index; serializing it emits tens of thousands of `"0":"{"` keys and blows the context in one call.
- **Why verification is a hard step** — AI tutorial notes on the platform routinely cite brand-new, unverifiable model versions, and a meaningful share are funnel content. Skip verification and research degrades into restating.

## Use with any agent

Not Qoder-bound. The repo root carries `AGENTS.md` (generic entry) and `SKILL.md` (full guide), so any agent that can drive a browser, read files and run commands can follow it: Codex, Claude Code, Gemini CLI, Grok CLI, DeepSeek harness, Cursor, Windsurf, Aider…

```bash
git clone https://github.com/LiliLIN0324/xiaohongshu-video-research-skill.git
```

> Read `xiaohongshu-video-research-skill/AGENTS.md` and research this Xiaohongshu video: <link>

Install as a skill (auto-triggers, no signposting needed):

| Agent | Path |
|---|---|
| Qoder | `~/.qoder/skills/xiaohongshu-video-research` |
| Claude Code | `~/.claude/skills/xiaohongshu-video-research` |
| Others | whatever rules/skills directory your agent reads |

```bash
mkdir -p ~/.qoder/skills
cp -r xiaohongshu-video-research-skill ~/.qoder/skills/xiaohongshu-video-research
```

Reload sessions or run `/skills reload`, then invoke with `/xiaohongshu-video-research`.

**Project level**: drop `AGENTS.md`, `SKILL.md` and `scripts/` into your project and the agent picks them up on open.

## Layout

```
SKILL.md                    Full guide: field paths, frame params, reading tricks, verification checklist, report template, pitfalls
AGENTS.md                   Generic entry: 7 non-negotiable rules + shortest workflow
CLAUDE.md / GEMINI.md       Pointers for agents that only read fixed filenames
scripts/page-extract.js     In-page extractor: ref unwrapping, page-type detection, mediaV2 skip, best-stream pick
scripts/sheets.mjs          Download + contact sheets: ffmpeg discovery, per-page time ranges
CHANGELOG.md                Release notes
```

## Pitfalls (full list in SKILL.md)

| Symptom | Cause | Fix |
|---|---|---|
| `WebFetch` finds no content | SPA shell only | Render a real browser |
| Redirected to login, no data | `xsec_token` missing or expired | Restore it; ask the user to re-share |
| Fields are `{dep, __v_isRef}` | Refs not unwrapped | Recursive unwrap |
| Output drowned in `"0":"{"` | Serialized `mediaV2` | Skip that key |
| `masterUrl` is null | Read `note.media` | It is `note.video.media.stream` |
| Only an empty note shell | `noteDetailMap` has a `""` placeholder key | Scan for an entry with real fields |
| 403 on download | Expired `sign` / `t` | Re-extract, download immediately |
| Comment count empty | `commentCount` returns `""` when logged out | Do not treat as zero |
| Followers show `10+` | Fuzzy display when logged out | Cross-check note count and like spread |
| Odd ffmpeg encode errors | Hit the 2016 3.0.1 build | Only accept `.exe` under `btbn`/`gyan`/`master` |

## Boundaries

- **Read-only**: no likes, saves, comments or follows; per-note browsing, no bulk account scraping.
- **Personal research tool**, not a data-collection pipeline. Access is governed by Xiaohongshu's terms and robots; judge your own scope and rate, and do not use this for commercial bulk scraping.
- **Be restrained about other people's content**: prompts and scripts read from frames are the creator's work — summarize the structure and credit the source rather than republishing verbatim. Contact sheets are intermediates and contain real people on camera; do not circulate them casually.

## Version

Current **0.1.0**: first public release. Extractor, frame script, 7 hard rules, verification step and report template — all validated end-to-end on a real note.

See [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)

<div align="center">

# Breakdown · xiaohongshu-video-research

**Turn a Xiaohongshu video note into a verified research finding**

No login needed · download the video and read the text on screen · follow the creator's own chapter markers · check every tool the note mentions

[![version](https://img.shields.io/badge/version-0.1.1-111111?style=flat-square)](CHANGELOG.md)
[![license](https://img.shields.io/badge/license-MIT-2ea44f?style=flat-square)](LICENSE)
[![node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](#stack-and-requirements)
[![ffmpeg](https://img.shields.io/badge/ffmpeg-required-000000?style=flat-square)](#stack-and-requirements)
[![no-login](https://img.shields.io/badge/no%20login%20needed-E8A33D?style=flat-square)](#what-it-solves)
[![stars](https://img.shields.io/github/stars/LiliLIN0324/xiaohongshu-video-research-skill?style=social)](https://github.com/LiliLIN0324/xiaohongshu-video-research-skill/stargazers)

[Quick start](#quick-start) · [Measured run](#real-case) · [Glossary](#glossary) · [Stack](#stack-and-requirements) · [中文 · 拆条](README.md)

<a href="assets/demo.mp4"><img src="assets/demo.gif" alt="Demo: extract metadata → jump along the chapter axis → tile frames → crop for fine print → verify each entity → write the report" width="840"></a>

<sub>Click the image for the full clip (19 s · 1080p · 30fps). Everything on screen is <b>synthetic sample data</b> — no real note content. How it was recorded: [paired with web-demo-video](#paired-with-playback).</sub>

</div>

---

<a id="what-it-solves"></a>

## What it solves

Hand an agent a Xiaohongshu video link and ask what it actually says, and three things break:

1. **Nothing is fetchable.** The site ships an empty page shell and lets the browser assemble the content afterwards. Plain fetchers (`WebFetch`, `curl`) get that shell and zero text; not being logged in adds a modal on top.
2. **The video is the article.** In tutorial notes the real payload — tool names, model choice, the prompt, the parameters — is drawn **onto the picture**. The written caption is often a single hashtag, so reading the title tells you nothing.
3. **Restating is not researching.** "This model produces results almost identical to that one" — measured result, or a feeling? You cannot judge that without checking the tools it names and the account behind the post.

## How it does it

In one line: **don't copy from the screen — take the data the page already carries with it.**

When Xiaohongshu loads a note it hands the browser a package of that note's data, stored in a variable called `window.__INITIAL_STATE__` (plain meaning in the [glossary](#glossary)). From it we read the title, body, hashtags, publish time, IP region, and the like / save / comment / share counts, plus two things a screenshot can never give you:

- **The video's own chapter markers** — segments the creator labelled, each with a timestamp. They say which few seconds matter, so you don't have to sample the whole clip evenly.
- **Direct addresses of the original video** — with those you download the file, pull frames along the chapter axis, tile them into a couple of contact sheets, and read the subtitles and small print baked into the picture.

Then every product, repository and version number that appears on screen gets verified outside the app, and the author's own profile is measured the same way to see how much reach the note really has.

So the output is not a sentence like "this video is about X", but a checkable finding: whether the software it mentions really exists and at what scale, whether the effect it claims has any basis, how many people actually see this account, and whether the recipe can be reused as-is.

<a id="real-case"></a>

## Measured run

One real tutorial note (72 seconds), end to end, no login at any point. The note's own content does not appear here — it belongs to its creator; this repository documents only what the tool does.

| | |
|---|---|
| Metadata | title / body / hashtags / absolute publish time + IP region / likes, saves, shares all captured (comment count comes back empty when logged out — never read it as zero) |
| Chapters | the creator's own segments and timestamps, used to target frame extraction |
| Video source | sharpest of several renditions picked automatically: 1080p, 10.9 MB, downloaded before the signed link expired |
| Frames | 2 contact sheets, 6 frames each, full coverage |
| Reading the picture | every subtitle line; dropdown options, parameters and version numbers in the UI; a full prompt hidden in tiny on-screen text that only became legible after crop + upscale + sharpen |
| Verification | any repo, product or version shown on screen can be checked one by one outside the app (specific entries are not listed here) |
| Reach | the same script pointed at the author's profile yields note count, follower band and recent like spread — enough to tell a genuine tutorial from a funnel post |
| Elapsed | ~6 minutes |

<a id="features"></a>

## Features

| Capability | Notes |
|---|---|
| **Bypasses the fetch problem, and the login wall** | Data comes from what the page carries: no account, no cookies, no scraping endpoints |
| **Chapter-first sampling** | Many videos ship their own segments; sampling along them halves how much you have to look at and never misses a section |
| **Sharpest copy chosen for you** | One video exists in several resolutions; the script ranks them and prefers the widely compatible container when they tie. 1080p frames make small UI text legible |
| **Crop for fine print** | When the sheet is not enough: crop by coordinates, upscale, sharpen — that is where prompts and version numbers hide |
| **Verification is mandatory** | A separate, required step: repos via GitHub's official API, products via web search, the author via the same extractor on their profile |
| **Absolute dates** | Timestamps are converted to real dates with a timezone, so a report never says "yesterday" and goes stale |
| **Read-only** | No likes, saves, comments, follows; per-note browsing, no bulk account scraping |
| **Nothing to install** | Node.js and the system ffmpeg are enough; the ffmpeg path is found automatically, and the fake wrapper / decade-old build are explicitly avoided |

<a id="glossary"></a>

## Glossary

The jargon this README uses, in plain words:

| Term | Plain meaning | What it does here |
|---|---|---|
| SPA | A page that arrives empty and is assembled by the browser | Why plain fetchers get nothing; a real browser is required |
| SSR / shipped data | The server hands over the data along with the page | Our source of truth — no clicking around to reconstruct it |
| `window.__INITIAL_STATE__` | The data package the page arrives with | Holds title, engagement counts, chapters and video URLs |
| Vue ref | Each value in that package is wrapped in a casing | Must be unwrapped layer by layer, otherwise you read the casing |
| `mediaV2` | One enormous field that was split into tens of thousands of characters | Must be skipped or it floods the model's context in one call |
| Chapters | The creator's own table of contents for the video | Tells us which seconds deserve frames |
| `masterUrl` + `sign` | The download address plus a time-limited pass | The pass expires, so download immediately |
| `xsec_token` | The address slip inside a shared link | Drop it and you are sent to the login wall with no data |
| Contact sheet | Screenshots at fixed intervals, tiled into grids | Lets a person (or a model) read the whole video in two images |
| Sharpen / unsharp | Pushes the edges of blurry small text back into legibility | Paired with crop + upscale to read prompts off the UI |

<a id="quick-start"></a>

## Quick start

Just tell an agent:

> Research this Xiaohongshu video https://www.xiaohongshu.com/explore/xxxx?xsec_token=yyyy

Once installed as a skill it triggers on its own; if it is not installed, point the agent at [`AGENTS.md`](AGENTS.md).

Manually, two steps:

**1. Extract in-page.** Run the function body of [`scripts/page-extract.js`](scripts/page-extract.js) as page JS (in Qoder that is the `function` argument of `evaluate_script`). It detects note / profile / feed pages from the URL and returns compact JSON:

```json
{
  "page": "note",
  "time": "2026-10-22T09:50:38.000Z",
  "chapters": [{ "text": "<segment name>", "time": 44080 }],
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

```
video   out\note.mp4  72s  10.9MB
ffmpeg  C:\Users\you\.dsh\tools\ffmpeg\btbn\…\bin\ffmpeg.exe
sheets  2 pages / 6 frames each / every 6s
  out\sheet-01.jpg  [0s - 36s]
  out\sheet-02.jpg  [36s - 72s]
```

Then read the sheets page by page, verify what the frames mention, and write the report. Full procedure and judgement calls in [`SKILL.md`](SKILL.md).

> ⏱ `sign` / `t` on `masterUrl` are expiring passes — download immediately or you get a 403.
> 🔑 Keep `xsec_token` when navigating; without it you hit the login wall and get no data. It is tied to the note id and expires, so an old link must be re-shared.

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

Four key decisions:

- **Why not parse the page markup** — the markup changes with every frontend release; the field paths in the shipped data are far more stable, and the markup never contains chapters or source URLs anyway.
- **Why unwrap refs recursively** — nearly every value in the package is wrapped; skip this and you read wrappers instead of content, and the report comes out empty.
- **Why skip `mediaV2`** — it is a JSON string expanded character by character; reading it emits tens of thousands of fragments and blows the context in one call.
- **Why verification is a hard step** — AI tutorial notes on the platform routinely cite brand-new, unverifiable model versions, and a meaningful share are funnel content. Skip verification and research degrades into restating.

<a id="paired-with-playback"></a>

## Paired with web-demo-video

The clip at the top is not a mock-up animation. It was recorded frame by frame with its sibling skill [`web-demo-video`](https://github.com/LiliLIN0324/web-demo-video-skill): build a page that really works, drive a real cursor and real clicks through it, and screenshot every frame.

| Who does what | This skill | web-demo-video |
|---|---|---|
| Output | metadata, chapter axis, contact sheets, verification, report | any web demo turned into a 1080p/30fps clip |
| Method | render the page, read the data it ships, tile frames with ffmpeg | per-frame capture, clicks dispatched over CDP — no screen recorder |
| Hand-off | the report and sheets are artifacts meant to be shown | point the recorder at a page built from them and you get a shareable clip |

Numbers from this recording: **577 frames / 19.2 s / 7 real clicks / 1920×1080@30fps**, 743 KB MP4 and a 931 KB GIF preview. The demo page runs on synthetic sample data, and every button genuinely changes page state — nothing there is a decorative control.

The chain works the other way too: break a note down first, then record the finding as a short clip, so a viewer learns what the note claims and where it is shaky without reading a long report.

<a id="stack-and-requirements"></a>

## Stack and requirements

| Layer | What we use | Why this |
|---|---|---|
| Runtime | Node.js 18+, built-in modules only | Nothing to `npm install`; clone and run. 18+ is when `fetch` became built-in |
| Extraction | One plain-JS function executed inside the page (`scripts/page-extract.js`) | No framework, no dependency on Xiaohongshu's own frontend code — it only unwraps and picks fields |
| Browser channel | Qoder's built-in `browser-use`; swap in Playwright, Puppeteer or Chrome DevTools MCP elsewhere | Any channel that can open a page and run JS is enough; not locked to one vendor |
| Download | System `curl` with a browser user-agent | The video host rejects requests without one; a single header beats adding an HTTP library |
| Video work | System ffmpeg / ffprobe (the `.exe`, not a wrapper) | Its `fps` + `tile` filters build a contact sheet in one command, instead of dozens of separate screenshot calls |
| Verification | `gh api` (GitHub's official API) + web search | Repo existence and star counts come from the authoritative source, never from what the video claims |
| Output | JSON (metadata), JPG contact sheets, a Markdown report | Each artifact serves its reader: machine-readable, human-glanceable, note-taking-ready |
| Platforms | Windows / macOS / Linux | Node and ffmpeg are portable; the ffmpeg binary is located by a bounded directory scan |
| Demo clip | recorded frame by frame with [`web-demo-video`](https://github.com/LiliLIN0324/web-demo-video-skill) | the cursor, the clicks and the state changes really happen in the page — nothing is composited afterwards |

**Not required**: a Xiaohongshu account, cookies, or any package installation.

<a id="any-agent"></a>

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
assets/demo.mp4             The clip shown above (19 s, 1080p, synthetic sample data)
assets/demo.gif             GIF preview of the same clip, so the README can display it
CHANGELOG.md                Release notes
```

## Pitfalls (full list in SKILL.md)

| Symptom | Cause | Fix |
|---|---|---|
| `WebFetch` finds no content | Page shell only | Render a real browser |
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

Current **0.1.1**: documentation revision. The README now leads with plain language, gained a glossary and a stack table, dropped the researched note's own content, and added the demo clip plus the [pairing section](#paired-with-playback). Script behaviour is unchanged from 0.1.0: extractor, frame script, 7 hard rules, verification step and report template — all validated end-to-end on a real note.

See [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)

<div align="center">

If this turns "watch a video" into "a finding you can act on", a Star is the cheapest way to say so.

</div>

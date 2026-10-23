// 小红书网页侧取数脚本。整份内容作为 browser-use 的 evaluate_script 的 function 参数传入。
// 在笔记页 / 作者主页 / 搜索结果页都能用，自动判断当前是哪一类页面。
// 注意：小红书前端是 Vue，__INITIAL_STATE__ 里几乎所有值都被包成 ref，必须先 unwrap。
() => {
  const unwrap = (o, seen) => {
    if (!o || typeof o !== 'object') return o;
    seen = seen || new WeakSet();
    if (seen.has(o)) return '[circular]';
    seen.add(o);
    if ('__v_isRef' in o) return unwrap('_value' in o ? o._value : o.raw, seen);
    if (Array.isArray(o)) return o.map(v => unwrap(v, seen));
    const r = {};
    for (const k in o) {
      // mediaV2 是按字符下标展开的 JSON 字符串，展开会炸掉上下文，直接跳过。
      if (k === 'mediaV2') { r.mediaV2 = '[skipped]'; continue; }
      r[k] = unwrap(o[k], seen);
    }
    return r;
  };
  const S = unwrap(window.__INITIAL_STATE__ || {});
  const route = location.pathname;
  const onProfile = /\/user\/profile/.test(route);

  const pick = (m) => {
    // noteDetailMap 里除了笔记 id 还会有一个空串键（占位空壳），逐条挑有真字段的。
    const entry = (m ? Object.values(m) : []).find(e => e && e.note &&
      (e.note.title || e.note.desc || e.note.video || (e.note.imageList || []).length));
    const note = entry ? entry.note : null;
    if (!note) return null;
    const v = note.video || {};
    // 视频源在 note.video.media.stream 下（不是 note.media），按编码族 EF4/EF5… 分组。
    const st = (((v.media || note.media || {}).stream) || {});
    const streams = Object.values(st).flat().filter(Boolean);
    // 同分辨率下优先 mp4：.m4s 是分片容器，个别构建解码会缺音频。
    const rank = s => (s.width || 0) * 10 + (String(s.format).toLowerCase() === 'mp4' ? 9 : 0);
    const best = streams.slice().sort((a, b) => rank(b) - rank(a))[0] || {};
    return {
      page: 'note',
      id: note.noteId || note.id,
      title: note.title,
      desc: note.desc,
      type: note.type,
      time: note.time ? new Date(note.time).toISOString() : null,
      ipLocation: note.ipLocation,
      user: note.user && { nickname: note.user.nickname, userId: note.user.userId, xsecToken: note.user.xsecToken },
      interact: note.interactInfo && {
        liked: note.interactInfo.likedCount, collected: note.interactInfo.collectedCount,
        comment: note.interactInfo.commentCount, share: note.interactInfo.shareCount,
        nice: note.interactInfo.niceCount,
      },
      tags: (note.hashTag || []).map(t => t.title || t.name).filter(Boolean),
      chapters: ((v.consumer || {}).chapters) || [],
      video: v.capa ? {
        durationSec: (v.capa.duration || 0),
        cover: ((v.image || {}).thumbnailFileid) || null,
        masterUrl: best.masterUrl || null,
        backupUrls: best.backupUrls || [],
        resolution: best.width ? best.width + 'x' + best.height : null,
        format: best.format || null, streamType: best.streamType || null,
        codec: best.videoCodec || null, fps: best.fps || null, sizeMB: best.size ? +(best.size / 1048576).toFixed(1) : null,
        allStreams: streams.map(s => (s.format || '?') + ' ' + s.width + 'x' + s.height + ' type' + s.streamType),
      } : null,
      images: (note.imageList || []).map(i => i.urlDefault || i.url).filter(Boolean),
    };
  };

  const u = S.user || {};
  const noteHit = pick(S.note && S.note.noteDetailMap);
  if (u.userPageData && (onProfile || !noteHit)) {
    const p = u.userPageData;
    const cards = (Array.isArray(u.notes) ? u.notes.flat() : []).filter(Boolean);
    return JSON.stringify({
      page: 'profile',
      basic: p.basicInfo,
      stats: { posts: p.posted, likes: p.liked, collects: p.collected },
      interactions: p.interactions,
      // 未登录时列表项包在 noteCard 里，且 id/noteId 是空串，只能靠 xsecToken + time 定位。
      notes: cards.map(c => {
        const n = c.noteCard || c;
        return {
          title: n.displayTitle, type: n.type,
          liked: (n.interactInfo || {}).likedCount,
          time: n.time ? new Date(n.time).toISOString().slice(0, 10) : null,
          xsecToken: n.xsecToken || c.xsecToken,
        };
      }),
    }, null, 1);
  }
  if (noteHit) return JSON.stringify(noteHit, null, 1);

  if (S.feed && S.feed.feeds) {
    return JSON.stringify({
      page: 'feed',
      items: S.feed.feeds.filter(f => f && f.noteCard).map(f => ({
        id: f.id, xsecToken: f.xsecToken,
        title: f.noteCard.displayTitle, type: f.noteCard.type,
        liked: (f.noteCard.interactInfo || {}).likedCount,
        user: (f.noteCard.user || {}).nickname,
      })),
    }, null, 1);
  }

  // 结构对不上时，只回顶层键名，别把整棵树打出来。
  return JSON.stringify({ page: 'unrecognized', stateKeys: Object.keys(S), hint: '登录后字段路径可能变化，先打印 Object.keys 再定位' });
};

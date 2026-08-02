/** Procedural BGM + SFX via Web Audio (no external audio files). */

const AudioBus = (() => {
  let ctx = null;
  let master = null;
  let musicGain = null;
  let sfxGain = null;
  let musicNodes = [];
  let currentTrack = null;
  let unlocked = false;
  let stepFlip = false;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.28;
    musicGain.connect(master);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.55;
    sfxGain.connect(master);
    return ctx;
  }

  async function unlock() {
    const c = ensure();
    if (!c) return;
    if (c.state === "suspended") {
      try { await c.resume(); } catch (_) { /* ignore */ }
    }
    unlocked = c.state === "running";
  }

  function stopMusic() {
    for (const n of musicNodes) {
      try { n.stop?.(); } catch (_) { /* ignore */ }
      try { n.disconnect?.(); } catch (_) { /* ignore */ }
    }
    musicNodes = [];
    currentTrack = null;
  }

  function tone(freq, type, t0, dur, gain = 0.08, dest = sfxGain) {
    const c = ensure();
    if (!c || !dest) return null;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(dest);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
    return o;
  }

  function noiseBurst(t0, dur, gain = 0.04) {
    const c = ensure();
    if (!c || !sfxGain) return;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1200;
    src.buffer = buf;
    g.gain.value = gain;
    src.connect(f);
    f.connect(g);
    g.connect(sfxGain);
    src.start(t0);
    src.stop(t0 + dur);
  }

  const TRACKS = {
    town: { tempo: 0.55, root: 196, mode: [0, 3, 5, 7, 10, 12], wave: "triangle", pad: 0.04 },
    route: { tempo: 0.42, root: 220, mode: [0, 2, 4, 7, 9, 12], wave: "sine", pad: 0.035 },
    grove: { tempo: 0.7, root: 164.81, mode: [0, 3, 5, 7, 10, 14], wave: "sine", pad: 0.05 },
    shore: { tempo: 0.5, root: 146.83, mode: [0, 2, 5, 7, 9, 12], wave: "triangle", pad: 0.045 },
    pen: { tempo: 0.6, root: 185, mode: [0, 4, 7, 11, 12], wave: "triangle", pad: 0.04 },
    battle: { tempo: 0.28, root: 246.94, mode: [0, 3, 6, 7, 10, 12], wave: "square", pad: 0.03 },
    title: { tempo: 0.65, root: 207.65, mode: [0, 2, 3, 7, 10, 12], wave: "sine", pad: 0.05 },
  };

  function startLoop(id) {
    const c = ensure();
    if (!c || !musicGain || !unlocked) return;
    if (currentTrack === id && musicNodes.length) return;
    stopMusic();
    currentTrack = id;
    const conf = TRACKS[id] || TRACKS.town;
    const now = c.currentTime + 0.05;

    // soft pad drone
    const pad = c.createOscillator();
    const pg = c.createGain();
    pad.type = "sine";
    pad.frequency.value = conf.root / 2;
    pg.gain.value = conf.pad;
    pad.connect(pg);
    pg.connect(musicGain);
    pad.start(now);
    musicNodes.push(pad);

    // gentle fifth
    const pad2 = c.createOscillator();
    const pg2 = c.createGain();
    pad2.type = "sine";
    pad2.frequency.value = (conf.root / 2) * 1.5;
    pg2.gain.value = conf.pad * 0.55;
    pad2.connect(pg2);
    pg2.connect(musicGain);
    pad2.start(now);
    musicNodes.push(pad2);

    // melodic pattern via repeating scheduled notes
    const beat = conf.tempo;
    const pattern = conf.mode;
    let step = 0;
    const sched = () => {
      if (currentTrack !== id) return;
      const t0 = c.currentTime + 0.05;
      for (let i = 0; i < 8; i++) {
        const deg = pattern[(step + i) % pattern.length];
        const freq = conf.root * Math.pow(2, deg / 12);
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = conf.wave;
        o.frequency.value = freq;
        const start = t0 + i * beat * 0.5;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.045, start + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, start + beat * 0.45);
        o.connect(g);
        g.connect(musicGain);
        o.start(start);
        o.stop(start + beat * 0.5);
        musicNodes.push(o);
      }
      // shore/grove ambient sparkle
      if (id === "shore" || id === "grove") {
        const spark = c.createOscillator();
        const sg = c.createGain();
        spark.type = "sine";
        spark.frequency.value = conf.root * 2 * Math.pow(2, pattern[step % pattern.length] / 12);
        const st = t0 + beat;
        sg.gain.setValueAtTime(0.0001, st);
        sg.gain.exponentialRampToValueAtTime(0.03, st + 0.02);
        sg.gain.exponentialRampToValueAtTime(0.0001, st + 0.35);
        spark.connect(sg);
        sg.connect(musicGain);
        spark.start(st);
        spark.stop(st + 0.4);
        musicNodes.push(spark);
      }
      step += 3;
      const handle = setTimeout(sched, beat * 8 * 500);
      musicNodes.push({ stop() { clearTimeout(handle); }, disconnect() {} });
    };
    sched();
  }

  function playBgm(id) {
    unlock().then(() => startLoop(id));
  }

  function sfx(kind, detail) {
    unlock().then(() => {
      const c = ensure();
      if (!c || !sfxGain) return;
      const t = c.currentTime;
      if (kind === "walk") {
        stepFlip = !stepFlip;
        tone(stepFlip ? 180 : 150, "triangle", t, 0.06, 0.03);
        noiseBurst(t, 0.04, 0.015);
      } else if (kind === "warp") {
        tone(330, "sine", t, 0.12, 0.06);
        tone(440, "sine", t + 0.08, 0.14, 0.05);
        tone(550, "triangle", t + 0.16, 0.18, 0.04);
      } else if (kind === "hit") {
        tone(140, "square", t, 0.08, 0.05);
        noiseBurst(t, 0.08, 0.05);
      } else if (kind === "catch") {
        tone(392, "sine", t, 0.1, 0.05);
        tone(523, "sine", t + 0.1, 0.12, 0.05);
        tone(659, "triangle", t + 0.22, 0.2, 0.06);
      } else if (kind === "miss") {
        tone(220, "triangle", t, 0.08, 0.04);
        tone(180, "triangle", t + 0.08, 0.12, 0.03);
      } else if (kind === "heal") {
        tone(523, "sine", t, 0.1, 0.04);
        tone(659, "sine", t + 0.08, 0.12, 0.04);
        tone(784, "sine", t + 0.16, 0.16, 0.035);
      } else if (kind === "ui") {
        tone(520, "sine", t, 0.05, 0.03);
      } else if (kind === "status") {
        tone(300, "triangle", t, 0.1, 0.04);
        tone(360, "triangle", t + 0.08, 0.12, 0.03);
      } else if (kind === "cry") {
        const base = detail?.freq || 420;
        tone(base, "square", t, 0.08, 0.035);
        tone(base * 1.25, "triangle", t + 0.06, 0.12, 0.04);
        tone(base * 0.9, "sine", t + 0.14, 0.1, 0.03);
      } else if (kind === "win") {
        [523, 659, 784, 1046].forEach((f, i) => tone(f, "triangle", t + i * 0.09, 0.14, 0.045));
      }
    });
  }

  const CRY_FREQ = {
    Fairy: 520, Water: 360, Grass: 400, Electric: 640, Rock: 220,
    Ghost: 280, Dark: 240, Ice: 560, Fire: 480, Psychic: 600,
  };

  function creatureCry(type) {
    sfx("cry", { freq: CRY_FREQ[type] || 420 });
  }

  return { unlock, playBgm, stopMusic, sfx, creatureCry };
})();

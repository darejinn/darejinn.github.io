// Layer 3 대시보드 — analysis_code 파이프라인을 브라우저로 포팅
//
// 지원 입력:
//   1) CSV (analysis_code 산출물): relationship,timestamp,sender,is_me,text,text_length[,level]
//      - 01_parse_kakaotalk.py 의 messages.csv
//      - 02_level_classifier.py 의 messages_labeled.csv (level 컬럼 있으면 그대로 사용)
//   2) TXT (카톡 원본 내보내기): 모바일·PC 양 포맷 자동 감지
//
// 처리 단계 (analysis_code 1:1 대응):
//   파싱 → L1~L5 분류 (level 없을 때만) → 관계별 metrics → 3축 점수
//
// 모든 처리는 클라이언트에서 수행. 파일은 브라우저 밖으로 나가지 않음.

(function () {
  "use strict";

  // ── 팔레트 ──
  const C = {
    ink: "#0A0A0A", muted: "#71717A", faint: "#A1A1AA",
    indigo: "#4F46E5", indigoDark: "#312E81", red: "#DC2626",
    line: "#E5E5E5",
    levelColors: ["#A1A1AA", "#71717A", "#4F46E5", "#312E81", "#DC2626"], // L1~L5
  };

  // ── 발표 본인 데이터 (demo) ──
  const DEMO_DATA = {
    source: "발표 본인 데이터",
    messages: 31122,
    period: "2023.4 – 2026.4 · 3년",
    relationshipCount: "3개 관계",
    axes: { structural: 7.7, functional: 7.5, quality: 4.6, sci: 6.58 },
    depth: { me: 7.9, reference: 30 },
    levels: [56, 23, 13, 5, 3], // L1~L5 % (발표값 근사)
    relationships: [
      { name: "가족톡",  total: 8430, sci: 7.1, reciprocity: 0.42 },
      { name: "단톡 A", total: 14260, sci: 6.4, reciprocity: 0.35 },
      { name: "단톡 B", total: 8432, sci: 6.5, reciprocity: 0.38 },
    ],
    reciprocity: { me: 38, others: 62 },
    hourly: [12, 8, 6, 4, 2, 1, 1, 2, 5, 7, 9, 11, 12, 11, 10, 9, 9, 10, 11, 12, 13, 14, 13, 11], // 24h normalized %
    takeaway: "종합 6.6/10은 \"중간\"으로 보이지만, 그 평균은 Quality 축의 단독 함몰(4.6)을 가립니다.",
  };

  // ===== Pipeline (analysis_code 포팅) =====

  // ── 02_level_classifier 포팅 ──
  // 우선순위: L5 > L4 > L1(단답) > L3 > L2
  const LEVEL_PATTERNS = {
    L5_emotion: /(사랑|보고\s?싶|그리워|외로|슬프|우울|힘들|지쳤|괴로|두려워|무서워|불안|고민|걱정|털어놓|진심으로|덕분에|정말\s?고마)/,
    L4_opinion: /(내\s?생각|개인적으로|솔직히|좋다|나쁘다|별로|괜찮|이상해|문제|동의|반대|하지만|그러나|오히려|사실은|근데)/,
    L1_single: /^(ㅇㅇ|ㅇㅋ|ㄱㄱ|ㄴㄴ|응|넵|네|예|아니|오케|오키|굿|굳|ㅇㅇㅇ)$/,
    L1_emoji: /^[ㅋㅎㅜㅠ\s!?.]+$/,
    L1_transaction: /(주문|결제|송금|입금|예약|취소|영수증|배송|도착|픽업|몇\s?시|어디서|언제|시간\s?돼|약속)/,
    L3_url: /https?:\/\/|www\./,
    L3_question: /\?(?!\?)/,
    L3_info: /(참고|자료|논문|시험|수업|과제|공부|왜냐하면|그래서|이유|때문에)/,
    L2_chitchat: /(안녕|굿모닝|잘\s?자|굿나잇|날씨|뭐\s?먹|점심|저녁|아침|배고프|맛있|ㅋㅋㅋ|ㅎㅎ|뭐해|심심)/,
  };
  const SYSTEM_MSG = /^(사진|동영상|이모티콘|파일:|음성메시지)/;

  function classifyLevel(text) {
    if (!text || !text.trim()) return 1;
    const t = text.trim();
    if (SYSTEM_MSG.test(t)) return 1;
    if (LEVEL_PATTERNS.L5_emotion.test(t)) return 5;
    if (LEVEL_PATTERNS.L4_opinion.test(t)) {
      if (t.length < 10 && LEVEL_PATTERNS.L1_single.test(t)) return 1;
      return 4;
    }
    if (t.length < 15 && (LEVEL_PATTERNS.L1_single.test(t) || LEVEL_PATTERNS.L1_emoji.test(t))) return 1;
    if (LEVEL_PATTERNS.L1_transaction.test(t)) return 1;
    if (LEVEL_PATTERNS.L3_url.test(t) || LEVEL_PATTERNS.L3_question.test(t) || LEVEL_PATTERNS.L3_info.test(t)) return 3;
    if (LEVEL_PATTERNS.L2_chitchat.test(t)) return 2;
    if (t.length > 80) return 3;
    return 2;
  }

  // ── 03_metrics_per_relationship 포팅 ──
  function metricsOne(msgs) {
    if (msgs.length === 0) return null;
    const sorted = msgs.slice().sort(function (a, b) { return a.ts - b.ts; });
    const total = sorted.length;
    const myCount = sorted.filter(function (m) { return m.is_me; }).length;
    const reciprocity = myCount / total;

    // 응답 시간 (분)
    const respTimes = [];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].is_me && !sorted[i - 1].is_me) {
        const gap = (sorted[i].ts - sorted[i - 1].ts) / (1000 * 60);
        if (gap > 0 && gap < 60 * 24) respTimes.push(gap);
      }
    }
    respTimes.sort(function (a, b) { return a - b; });
    const respMedian = respTimes.length
      ? respTimes[Math.floor(respTimes.length / 2)]
      : null;

    // L4+L5 비율
    const deepCount = sorted.filter(function (m) { return m.level === 4 || m.level === 5; }).length;
    const deepPct = (deepCount / total) * 100;

    // 심야 (23, 0, 1, 2시)
    const nightHours = new Set([23, 0, 1, 2]);
    const nightCount = sorted.filter(function (m) { return nightHours.has(m.ts.getHours()); }).length;
    const nightPct = (nightCount / total) * 100;

    // 활성일 비율 + 일 평균
    const dateSet = new Set();
    sorted.forEach(function (m) {
      dateSet.add(m.ts.toISOString().slice(0, 10));
    });
    const firstDay = sorted[0].ts;
    const lastDay = sorted[sorted.length - 1].ts;
    const totalDays = Math.max(1, Math.round((lastDay - firstDay) / (1000 * 60 * 60 * 24)) + 1);
    const activeDays = dateSet.size;
    const activeDayPct = (activeDays / totalDays) * 100;
    const dailyMean = total / totalDays;

    return {
      total: total,
      reciprocity: reciprocity,
      respMedian: respMedian,
      deepPct: deepPct,
      nightPct: nightPct,
      activeDayPct: activeDayPct,
      dailyMean: dailyMean,
      totalDays: totalDays,
    };
  }

  // ── 04_three_axis_scoring 포팅 ──
  const BENCHMARKS = {
    daily_mean: 50, active_day_pct: 80,
    reciprocity: 0.5, response_speed: 5,
    deep_ratio_pct: 30, night_penalty_cutoff: 15,
  };
  const W = {
    Structural: { daily: 0.5, active: 0.5 },
    Functional: { recip: 0.5, resp: 0.5 },
    Quality:    { deep: 0.7, night: 0.3 },
  };

  function linearScore(value, benchmark, reverse) {
    if (value === null || value === undefined || isNaN(value)) return 5.0;
    if (reverse) {
      if (value <= 0) return 10.0;
      return Math.min(10, benchmark / (benchmark + value) * 10);
    }
    return Math.min(10, Math.max(0, value / benchmark * 10));
  }

  function score3Axis(m) {
    const sDaily = linearScore(m.dailyMean, BENCHMARKS.daily_mean);
    const sActive = linearScore(m.activeDayPct, BENCHMARKS.active_day_pct);
    const structural = W.Structural.daily * sDaily + W.Structural.active * sActive;

    const fRecip = linearScore(m.reciprocity, BENCHMARKS.reciprocity);
    const fResp = linearScore(m.respMedian, BENCHMARKS.response_speed, true);
    const functional = W.Functional.recip * fRecip + W.Functional.resp * fResp;

    const qDeep = linearScore(m.deepPct, BENCHMARKS.deep_ratio_pct);
    const night = m.nightPct || 0;
    const cutoff = BENCHMARKS.night_penalty_cutoff;
    const nightMul = night <= cutoff ? 1.0 : Math.max(0.5, 1 - (night - cutoff) / 50);
    const quality = (W.Quality.deep * qDeep * nightMul + W.Quality.night * qDeep) /
                    (W.Quality.deep + W.Quality.night);

    const sci = (structural + functional + quality) / 3;
    return {
      Structural: Math.round(structural * 10) / 10,
      Functional: Math.round(functional * 10) / 10,
      Quality: Math.round(quality * 10) / 10,
      SCI: Math.round(sci * 100) / 100,
    };
  }

  // ===== CSV parser (analysis_code messages.csv 호환) =====
  function parseCSV(text) {
    // RFC 4180-ish parser w/ quoted fields & CR\LF tolerance
    const rows = [];
    let row = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cur += '"'; i++; }
          else inQuotes = false;
        } else cur += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ",") { row.push(cur); cur = ""; }
        else if (ch === "\n" || ch === "\r") {
          if (cur !== "" || row.length > 0) { row.push(cur); rows.push(row); row = []; cur = ""; }
          if (ch === "\r" && text[i + 1] === "\n") i++;
        } else cur += ch;
      }
    }
    if (cur !== "" || row.length > 0) { row.push(cur); rows.push(row); }
    return rows;
  }

  function csvToRecords(rows) {
    if (rows.length < 2) throw new Error("CSV에 데이터 행이 없습니다.");
    // BOM strip
    const header = rows[0].map(function (h, i) {
      let s = h.trim();
      if (i === 0 && s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
      return s;
    });
    const required = ["relationship", "timestamp", "sender", "is_me", "text"];
    const missing = required.filter(function (c) { return header.indexOf(c) < 0; });
    if (missing.length) {
      throw new Error("필수 컬럼 누락: " + missing.join(", ") +
        " (필요 컬럼: " + required.join(", ") + " [, level])");
    }
    const idx = {};
    header.forEach(function (h, i) { idx[h] = i; });

    const out = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (row.length === 1 && row[0] === "") continue; // empty
      const ts = new Date(row[idx.timestamp]);
      if (isNaN(ts.getTime())) continue;
      const isMeRaw = String(row[idx.is_me]).toLowerCase().trim();
      const is_me = (isMeRaw === "true" || isMeRaw === "1" || isMeRaw === "t");
      out.push({
        relationship: row[idx.relationship],
        ts: ts,
        sender: row[idx.sender],
        is_me: is_me,
        text: row[idx.text] || "",
        level: idx.level !== undefined && row[idx.level] !== ""
                 ? parseInt(row[idx.level], 10) : null,
      });
    }
    return out;
  }

  // ===== TXT parser (카카오톡 원본) =====
  // 기존 파서 유지 — 단순화
  const MOBILE_RX = /^\[([^\]]+)\]\s+\[(?:오전|오후)\s+(\d{1,2}):(\d{2})\]\s+(.+)$/;
  const PC_DATE_RX = /^-+\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일.*-+\s*$/;
  const PC_MSG_RX = /^\[([^\]]+)\]\s*\[(오전|오후)\s*(\d{1,2}):(\d{2})\]\s*(.*)$/;

  function parseTxt(text, filename, myName) {
    const lines = text.split(/\r?\n/);
    const out = [];
    let curDate = null;
    const rel = filename.replace(/\.[^.]+$/, "").replace(/^KakaoTalk[_\-\s]*/i, "") || "단일대화";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const dm = line.match(PC_DATE_RX) || line.match(/(\d{4})[년.\s]+(\d{1,2})[월.\s]+(\d{1,2})/);
      if (dm) {
        curDate = new Date(parseInt(dm[1]), parseInt(dm[2]) - 1, parseInt(dm[3]));
        continue;
      }
      const m = line.match(PC_MSG_RX) || line.match(MOBILE_RX);
      if (m && curDate) {
        const sender = m[1].trim();
        const ampm = m[2];
        let h = parseInt(m[3], 10);
        const mm = parseInt(m[4], 10);
        if (ampm === "오후" && h !== 12) h += 12;
        if (ampm === "오전" && h === 12) h = 0;
        const ts = new Date(curDate);
        ts.setHours(h, mm, 0, 0);
        out.push({
          relationship: rel,
          ts: ts,
          sender: sender,
          is_me: (sender === myName),
          text: m[5] || "",
          level: null,
        });
      }
    }
    return out;
  }

  // ===== Aggregate to dashboard data =====
  function buildDashboardData(records, sourceLabel) {
    if (records.length === 0) throw new Error("메시지가 0개입니다.");

    // Auto-classify level if missing
    records.forEach(function (r) {
      if (r.level === null || isNaN(r.level)) r.level = classifyLevel(r.text);
    });

    // Group by relationship
    const byRel = {};
    records.forEach(function (r) {
      (byRel[r.relationship] = byRel[r.relationship] || []).push(r);
    });

    const relNames = Object.keys(byRel);
    const relMetrics = relNames.map(function (rel) {
      const m = metricsOne(byRel[rel]);
      const s = score3Axis(m);
      return Object.assign({ name: rel }, m, s);
    });

    // Weighted aggregate
    const totalMsgs = relMetrics.reduce(function (a, r) { return a + r.total; }, 0);
    function w(field) {
      return relMetrics.reduce(function (a, r) { return a + r[field] * r.total; }, 0) / totalMsgs;
    }
    const axesAgg = { structural: w("Structural"), functional: w("Functional"), quality: w("Quality"), sci: w("SCI") };

    // Level distribution (overall %)
    const levelCounts = [0, 0, 0, 0, 0];
    records.forEach(function (r) {
      const lv = Math.max(1, Math.min(5, r.level));
      levelCounts[lv - 1]++;
    });
    const levelPcts = levelCounts.map(function (c) { return Math.round((c / totalMsgs) * 1000) / 10; });

    // Hourly histogram (% of total)
    const hourly = new Array(24).fill(0);
    records.forEach(function (r) { hourly[r.ts.getHours()]++; });
    const hourlyPct = hourly.map(function (c) { return Math.round((c / totalMsgs) * 10000) / 100; });

    // Reciprocity (overall)
    const myCount = records.filter(function (r) { return r.is_me; }).length;
    const recipPct = Math.round((myCount / totalMsgs) * 1000) / 10;

    // Period
    const tsAll = records.map(function (r) { return r.ts; });
    const firstD = new Date(Math.min.apply(null, tsAll));
    const lastD = new Date(Math.max.apply(null, tsAll));
    const days = Math.round((lastD - firstD) / (1000 * 60 * 60 * 24)) + 1;
    const period = firstD.getFullYear() + "." + (firstD.getMonth() + 1) +
                   " – " + lastD.getFullYear() + "." + (lastD.getMonth() + 1) +
                   " · " + days + "일";

    // Takeaway
    const lowestAxis = ["Structural", "Functional", "Quality"]
      .map(function (k) { return [k, axesAgg[k.toLowerCase()]]; })
      .sort(function (a, b) { return a[1] - b[1]; })[0];
    let takeaway;
    if (lowestAxis[0] === "Quality" && lowestAxis[1] < 6) {
      takeaway = "Quality 축이 " + lowestAxis[1].toFixed(1) + " — 평균(" + axesAgg.sci.toFixed(1) +
        ")이 가린 단독 함몰. L4+L5 깊은 대화 비율 " + ((levelPcts[3] + levelPcts[4]).toFixed(1)) +
        "% (Mehl 30% 기준 미달).";
    } else {
      takeaway = lowestAxis[0] + " 축이 " + lowestAxis[1].toFixed(1) + "로 가장 낮음. " +
        "관계별 SCI 분포를 확인하세요.";
    }

    return {
      source: sourceLabel,
      messages: totalMsgs,
      period: period,
      relationshipCount: relNames.length + "개 관계",
      axes: { structural: axesAgg.structural, functional: axesAgg.functional, quality: axesAgg.quality, sci: axesAgg.sci },
      depth: { me: Math.round((levelPcts[3] + levelPcts[4]) * 10) / 10, reference: 30 },
      levels: levelPcts,
      relationships: relMetrics.map(function (r) {
        return { name: r.name, total: r.total, sci: r.SCI,
                 reciprocity: r.reciprocity, respMedian: r.respMedian,
                 deepPct: r.deepPct, nightPct: r.nightPct };
      }),
      reciprocity: { me: recipPct, others: Math.round((100 - recipPct) * 10) / 10 },
      hourly: hourlyPct,
      takeaway: takeaway,
    };
  }

  // ===== Charts =====
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.font.size = 11;
  Chart.defaults.color = C.muted;
  Chart.defaults.plugins.legend.display = false;

  const charts = {};

  function commonOpts(extra) {
    return Object.assign({
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: C.ink, padding: 8 },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: C.ink, font: { size: 9 } } },
        y: { grid: { color: C.line }, ticks: { color: C.muted, font: { size: 9 } } },
      },
    }, extra || {});
  }

  function dataLabelPlugin(suffix) {
    return {
      id: "dataLabel",
      afterDatasetsDraw: function (chart) {
        const ctx = chart.ctx;
        chart.data.datasets.forEach(function (ds, di) {
          const meta = chart.getDatasetMeta(di);
          if (meta.hidden) return;
          meta.data.forEach(function (bar, i) {
            const v = ds.data[i];
            if (v == null) return;
            const sfx = suffix !== undefined ? suffix : (ds.suffix || "");
            const lbl = (Number.isInteger(v) ? v : v.toFixed(1)) + sfx;
            ctx.save();
            ctx.fillStyle = C.ink;
            ctx.font = "700 11px " + Chart.defaults.font.family;
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(lbl, bar.x, bar.y - 4);
            ctx.restore();
          });
        });
      },
    };
  }

  function renderAll(d) {
    document.getElementById("meta-source").textContent = d.source;
    document.getElementById("meta-messages").textContent = d.messages.toLocaleString();
    document.getElementById("meta-period").textContent = d.period;
    document.getElementById("meta-relationships").textContent = d.relationshipCount;
    document.getElementById("main-takeaway").textContent = d.takeaway;

    Object.keys(charts).forEach(function (k) { if (charts[k]) charts[k].destroy(); });

    // 1. 3축 점수
    charts.axes = new Chart(document.getElementById("chart-axes"), {
      type: "bar",
      data: {
        labels: ["Struct", "Func", "Qual"],
        datasets: [{
          data: [d.axes.structural, d.axes.functional, d.axes.quality],
          backgroundColor: [C.indigoDark, C.indigo, C.red],
          borderRadius: 2,
        }],
      },
      options: commonOpts({ scales: { x: { grid: { display: false } }, y: { max: 10, ticks: { stepSize: 2 } } } }),
      plugins: [dataLabelPlugin("")],
    });

    // 2. 깊은 대화 비율
    charts.depth = new Chart(document.getElementById("chart-depth"), {
      type: "bar",
      data: {
        labels: ["나", "Mehl 기준"],
        datasets: [{
          data: [d.depth.me, d.depth.reference],
          backgroundColor: [C.red, C.faint],
          borderRadius: 2,
        }],
      },
      options: commonOpts({ scales: { x: { grid: { display: false } }, y: { max: 40, ticks: { stepSize: 10 } } } }),
      plugins: [dataLabelPlugin("%")],
    });

    // 3. Level 분포 (L1~L5)
    charts.levels = new Chart(document.getElementById("chart-levels"), {
      type: "bar",
      data: {
        labels: ["L1", "L2", "L3", "L4", "L5"],
        datasets: [{
          data: d.levels,
          backgroundColor: C.levelColors,
          borderRadius: 2,
        }],
      },
      options: commonOpts({ scales: { x: { grid: { display: false } }, y: { max: 70, ticks: { stepSize: 20 } } } }),
      plugins: [dataLabelPlugin("%")],
    });

    // 4. 관계별 SCI
    charts.rels = new Chart(document.getElementById("chart-rels"), {
      type: "bar",
      data: {
        labels: d.relationships.map(function (r) { return r.name; }),
        datasets: [{
          data: d.relationships.map(function (r) { return r.sci; }),
          backgroundColor: d.relationships.map(function (r) {
            return r.sci < 5 ? C.red : (r.sci < 7 ? C.indigo : C.indigoDark);
          }),
          borderRadius: 2,
        }],
      },
      options: commonOpts({ scales: { x: { grid: { display: false } }, y: { max: 10, ticks: { stepSize: 2 } } } }),
      plugins: [dataLabelPlugin("")],
    });

    // 5. 상호성 (도넛)
    charts.recip = new Chart(document.getElementById("chart-recip"), {
      type: "doughnut",
      data: {
        labels: ["내 발신", "상대 발신"],
        datasets: [{
          data: [d.reciprocity.me, d.reciprocity.others],
          backgroundColor: [C.indigo, C.faint],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "55%",
        plugins: {
          legend: { display: true, position: "bottom",
            labels: { font: { size: 10 }, color: C.ink, padding: 8, boxWidth: 10 } },
        },
      },
      plugins: [{
        id: "centerLabel",
        afterDatasetsDraw: function (chart) {
          const ctx = chart.ctx;
          const cx = (chart.chartArea.left + chart.chartArea.right) / 2;
          const cy = (chart.chartArea.top + chart.chartArea.bottom) / 2;
          ctx.save();
          ctx.fillStyle = C.ink;
          ctx.font = "700 18px " + Chart.defaults.font.family;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(d.reciprocity.me + "%", cx, cy);
          ctx.restore();
        },
      }],
    });

    // 6. 시간대 분포 (24h line)
    charts.time = new Chart(document.getElementById("chart-time"), {
      type: "line",
      data: {
        labels: Array.from({length: 24}, function (_, i) { return i; }),
        datasets: [{
          data: d.hourly,
          borderColor: C.indigo,
          backgroundColor: "rgba(79,70,229,0.1)",
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        }],
      },
      options: commonOpts({
        scales: {
          x: { grid: { display: false }, ticks: { stepSize: 6, callback: function (v) { return v + "시"; } } },
          y: { grid: { color: C.line }, ticks: { font: { size: 9 } } },
        },
      }),
    });

    // ── Per-relationship table ──
    const tbody = document.getElementById("rel-tbody");
    tbody.innerHTML = "";
    d.relationships.forEach(function (r) {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--line)";
      const rec = (r.reciprocity * 100).toFixed(0) + "%";
      const resp = r.respMedian !== null && r.respMedian !== undefined ? r.respMedian.toFixed(1) : "—";
      const deep = (r.deepPct !== undefined ? r.deepPct.toFixed(1) : "—") + "%";
      const night = (r.nightPct !== undefined ? r.nightPct.toFixed(1) : "—") + "%";
      const sciColor = r.sci < 5 ? "var(--red)" : (r.sci < 7 ? "var(--indigo)" : "var(--indigo-dark)");
      tr.innerHTML =
        "<td style='padding: 8px 10px; font-weight: 600;'>" + r.name + "</td>" +
        "<td style='padding: 8px 10px; text-align: right;'>" + r.total.toLocaleString() + "</td>" +
        "<td style='padding: 8px 10px; text-align: right;'>" + rec + "</td>" +
        "<td style='padding: 8px 10px; text-align: right;'>" + resp + "</td>" +
        "<td style='padding: 8px 10px; text-align: right;'>" + deep + "</td>" +
        "<td style='padding: 8px 10px; text-align: right;'>" + night + "</td>" +
        "<td style='padding: 8px 10px; text-align: right; color: " + sciColor + "; font-weight: 700;'>" + r.sci.toFixed(2) + "</td>";
      tbody.appendChild(tr);
    });
  }

  // ===== UI wiring =====
  let mode = "csv"; // 'csv' | 'txt'
  const modeCsvBtn = document.getElementById("mode-csv");
  const modeTxtBtn = document.getElementById("mode-txt");
  const headlineEl = document.getElementById("upload-headline");
  const helpEl = document.getElementById("upload-help");
  const fileInput = document.getElementById("file-input");

  function setMode(m) {
    mode = m;
    modeCsvBtn.classList.toggle("active", m === "csv");
    modeTxtBtn.classList.toggle("active", m === "txt");
    if (m === "csv") {
      headlineEl.textContent = "📊 messages.csv 또는 messages_labeled.csv를 올려 시작하세요";
      helpEl.innerHTML = "<strong>컬럼:</strong> relationship, timestamp, sender, is_me, text, text_length [, level]<br>" +
        "analysis_code/01_parse_kakaotalk.py · 02_level_classifier.py 산출물 그대로 호환 · " +
        "여러 관계가 한 파일에 섞여 있어도 자동으로 분리해 분석합니다.";
      fileInput.accept = ".csv";
    } else {
      headlineEl.textContent = "📎 카톡 .txt 대화 내보내기를 올려 시작하세요";
      helpEl.innerHTML = "카카오톡 채팅방 → 우측 상단 메뉴 → 설정 → \"대화 내용 내보내기\" (텍스트만)<br>" +
        "받은 .txt 파일을 여기로 드래그하거나 클릭해서 선택. 파일명이 관계 이름으로 사용됩니다.";
      fileInput.accept = ".txt";
    }
  }
  modeCsvBtn.addEventListener("click", function () { setMode("csv"); });
  modeTxtBtn.addEventListener("click", function () { setMode("txt"); });

  function showDashboard() {
    document.getElementById("dash-grid").style.display = "grid";
    document.getElementById("meta-info").style.display = "block";
    document.getElementById("main-takeaway").style.display = "block";
    document.getElementById("rel-table-wrap").style.display = "block";
  }

  document.getElementById("show-demo").addEventListener("click", function (e) {
    e.preventDefault();
    showDashboard();
    renderAll(DEMO_DATA);
    e.target.textContent = "← 예시를 보는 중 (CSV/TXT 올리면 내 데이터로 바뀝니다)";
  });

  // File input
  const dropzone = document.getElementById("dropzone");
  const statusEl = document.getElementById("upload-status");

  fileInput.addEventListener("change", function (e) {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  });
  dropzone.addEventListener("dragover", function (e) {
    e.preventDefault(); dropzone.classList.add("drag");
  });
  dropzone.addEventListener("dragleave", function () { dropzone.classList.remove("drag"); });
  dropzone.addEventListener("drop", function (e) {
    e.preventDefault(); dropzone.classList.remove("drag");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  });

  function processFile(file) {
    statusEl.style.color = "var(--muted)";
    statusEl.textContent = "파일 읽는 중... (" + file.name + ")";
    const reader = new FileReader();
    const isCsv = file.name.toLowerCase().endsWith(".csv") || mode === "csv";

    reader.onload = function (ev) {
      try {
        let records;
        if (isCsv) {
          const rows = parseCSV(ev.target.result);
          records = csvToRecords(rows);
          if (records.length === 0) throw new Error("CSV 파싱 후 0개 메시지. timestamp 형식을 확인해주세요.");
        } else {
          // TXT mode — ask for myName via prompt (simple UX)
          const myName = window.prompt(
            "카톡 .txt에서 본인 닉네임을 정확히 입력하세요 (대소문자·공백·특수문자 일치 필수)",
            "조윤진"
          );
          if (!myName) { statusEl.textContent = "취소됨"; return; }
          records = parseTxt(ev.target.result, file.name, myName);
          if (records.length === 0) throw new Error("메시지를 하나도 찾지 못했습니다. 카톡 \"대화 내보내기\" 형식인지 확인해주세요.");
        }
        const data = buildDashboardData(records, file.name + " (" + (isCsv ? "CSV" : "TXT") + ")");
        showDashboard();
        renderAll(data);
        statusEl.innerHTML = "✓ 분석 완료 · " + data.messages.toLocaleString() +
          "개 메시지 · " + data.relationshipCount +
          " · 파일은 브라우저 밖으로 나가지 않았습니다";
        statusEl.style.color = "var(--indigo)";
      } catch (err) {
        statusEl.textContent = "✗ 분석 실패: " + err.message;
        statusEl.style.color = "var(--red)";
      }
    };
    reader.onerror = function () {
      statusEl.textContent = "✗ 파일 읽기 실패";
      statusEl.style.color = "var(--red)";
    };
    reader.readAsText(file, "UTF-8");
  }

  // Initial state
  setMode("csv");
})();

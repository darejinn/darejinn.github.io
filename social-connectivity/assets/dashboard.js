// Layer 3 대시보드 — 발표 본인 데이터 기본 + 카톡 txt 업로드 분석
// 발표 Slide 15 (6개 차트)와 같은 레이아웃

(function () {
  "use strict";

  // ── 팔레트 (발표와 동일) ──
  const C = {
    ink: "#0A0A0A",
    muted: "#71717A",
    faint: "#A1A1AA",
    indigo: "#4F46E5",
    indigoDark: "#312E81",
    red: "#DC2626",
    line: "#E5E5E5",
  };

  // ── 발표 본인 데이터 (demo) ──
  const DEMO_DATA = {
    source: "발표 본인 데이터",
    messages: 31122,
    period: "2023.4 – 2026.4 · 3년",
    axes: { structural: 7.7, functional: 7.5, quality: 4.6 },
    depth: { me: 8, reference: 20 },
    meals: { me: 4, recommended: 8 },
    dunbar5: { me: 10, recommended: 100 },
    direction: { oneway: 92, twoway: 8 },
    time: { weekday: 72, weekend: 300 },
    takeaway: "종합 6.6/10은 \"중간\"으로 보이지만, 그 평균은 Quality 축의 단독 함몰(4.6)을 가립니다.",
  };

  // Global chart registry for destroy/rebuild
  const charts = {};

  // ── Chart defaults ──
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.font.size = 11;
  Chart.defaults.color = C.muted;
  Chart.defaults.plugins.legend.display = false;

  // ── Helpers ──
  function commonOptions(extra) {
    return Object.assign({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: C.ink,
          titleFont: { size: 11 },
          bodyFont: { size: 11 },
          padding: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { color: C.ink, font: { size: 10 } },
        },
        y: {
          grid: { color: C.line, drawBorder: false },
          ticks: { color: C.muted, font: { size: 9 } },
        },
      },
    }, extra || {});
  }

  function dataLabelPlugin() {
    // 막대 끝에 숫자 표시
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
            const suffix = ds.suffix || "";
            const label = (Number.isInteger(v) ? v : v.toFixed(1)) + suffix;
            ctx.save();
            ctx.fillStyle = C.ink;
            ctx.font = "700 11px " + Chart.defaults.font.family;
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(label, bar.x, bar.y - 4);
            ctx.restore();
          });
        });
      },
    };
  }

  function doughnutLabelPlugin() {
    return {
      id: "doughnutLabel",
      afterDatasetsDraw: function (chart) {
        if (chart.config.type !== "doughnut") return;
        const ctx = chart.ctx;
        const ds = chart.data.datasets[0];
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach(function (arc, i) {
          const v = ds.data[i];
          if (v == null || v < 5) return; // skip small slices
          const pos = arc.getCenterPoint();
          ctx.save();
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "700 13px " + Chart.defaults.font.family;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(v + "%", pos.x, pos.y);
          ctx.restore();
        });
      },
    };
  }

  // ── Render all 6 charts from data ──
  function renderAll(d) {
    // Meta
    document.getElementById("meta-source").textContent = d.source;
    document.getElementById("meta-messages").textContent = d.messages.toLocaleString();
    document.getElementById("meta-period").textContent = d.period;
    document.getElementById("main-takeaway").textContent = d.takeaway;

    // Destroy existing
    Object.keys(charts).forEach(function (k) {
      if (charts[k]) charts[k].destroy();
    });

    // 1. 3축 점수
    charts.axes = new Chart(document.getElementById("chart-axes"), {
      type: "bar",
      data: {
        labels: ["Struct", "Func", "Qual"],
        datasets: [{
          data: [d.axes.structural, d.axes.functional, d.axes.quality],
          backgroundColor: [C.indigoDark, C.indigo, C.red],
          borderRadius: 2,
          suffix: "",
        }],
      },
      options: commonOptions({ scales: { x: { grid: { display: false } }, y: { max: 10, ticks: { stepSize: 2 } } } }),
      plugins: [dataLabelPlugin()],
    });

    // 2. L4+L5 깊은 대화
    charts.depth = new Chart(document.getElementById("chart-depth"), {
      type: "bar",
      data: {
        labels: ["나", "참조"],
        datasets: [{
          data: [d.depth.me, d.depth.reference],
          backgroundColor: [C.red, C.faint],
          borderRadius: 2,
          suffix: "%",
        }],
      },
      options: commonOptions({ scales: { x: { grid: { display: false } }, y: { max: 30, ticks: { stepSize: 10 } } } }),
      plugins: [dataLabelPlugin()],
    });

    // 3. 주간 함께 식사
    charts.meals = new Chart(document.getElementById("chart-meals"), {
      type: "bar",
      data: {
        labels: ["나", "권장"],
        datasets: [{
          data: [d.meals.me, d.meals.recommended],
          backgroundColor: [C.red, C.faint],
          borderRadius: 2,
          suffix: "회",
        }],
      },
      options: commonOptions({ scales: { x: { grid: { display: false } }, y: { max: 12, ticks: { stepSize: 4 } } } }),
      plugins: [dataLabelPlugin()],
    });

    // 4. Dunbar 5 (horizontal)
    charts.dunbar = new Chart(document.getElementById("chart-dunbar"), {
      type: "bar",
      data: {
        labels: ["내 채널", "권장"],
        datasets: [{
          data: [d.dunbar5.me, d.dunbar5.recommended],
          backgroundColor: [C.red, C.faint],
          borderRadius: 2,
          suffix: "%",
        }],
      },
      options: commonOptions({
        indexAxis: "y",
        layout: { padding: { right: 40 } },
        scales: {
          x: { max: 110, grid: { color: C.line }, ticks: { stepSize: 25, callback: function(v){ return v<=100 ? v : ""; } } },
          y: { grid: { display: false } }
        },
      }),
      plugins: [{
        id: "horizontalLabel",
        afterDatasetsDraw: function (chart) {
          const ctx = chart.ctx;
          const ds = chart.data.datasets[0];
          const meta = chart.getDatasetMeta(0);
          const chartArea = chart.chartArea;
          meta.data.forEach(function (bar, i) {
            const val = ds.data[i];
            const label = val + "%";
            ctx.save();
            ctx.font = "700 11px " + Chart.defaults.font.family;
            const labelWidth = ctx.measureText(label).width;
            // If label would overflow, put it inside the bar (end-aligned)
            const outsideX = bar.x + 6;
            const willOverflow = outsideX + labelWidth > chartArea.right;
            if (willOverflow) {
              ctx.fillStyle = "#FFFFFF";
              ctx.textAlign = "right";
              ctx.fillText(label, bar.x - 6, bar.y);
            } else {
              ctx.fillStyle = C.ink;
              ctx.textAlign = "left";
              ctx.fillText(label, outsideX, bar.y);
            }
            ctx.textBaseline = "middle";
            ctx.restore();
          });
        },
      }],
    });

    // 5. 커뮤니케이션 방향 (도넛)
    charts.direction = new Chart(document.getElementById("chart-direction"), {
      type: "doughnut",
      data: {
        labels: ["일방향", "쌍방향"],
        datasets: [{
          data: [d.direction.oneway, d.direction.twoway],
          backgroundColor: [C.red, C.indigo],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "45%",
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: { font: { size: 10 }, color: C.ink, padding: 8, boxWidth: 10 },
          },
        },
      },
      plugins: [doughnutLabelPlugin()],
    });

    // 6. 사회적 시간 평일/주말
    charts.time = new Chart(document.getElementById("chart-time"), {
      type: "bar",
      data: {
        labels: ["평일", "주말"],
        datasets: [{
          data: [d.time.weekday, d.time.weekend],
          backgroundColor: [C.red, C.indigo],
          borderRadius: 2,
          suffix: "분",
        }],
      },
      options: commonOptions({ scales: { x: { grid: { display: false } }, y: { max: 400, ticks: { stepSize: 100 } } } }),
      plugins: [dataLabelPlugin()],
    });
  }

  // ── Mode toggle / Demo link ──
  const showDemoLink = document.getElementById("show-demo");
  const dashGrid = document.getElementById("dash-grid");
  const metaInfo = document.getElementById("meta-info");
  const mainTakeaway = document.getElementById("main-takeaway");

  function showDashboard() {
    dashGrid.style.display = "grid";
    metaInfo.style.display = "block";
    mainTakeaway.style.display = "block";
  }

  if (showDemoLink) {
    showDemoLink.addEventListener("click", function (e) {
      e.preventDefault();
      showDashboard();
      renderAll(DEMO_DATA);
      showDemoLink.textContent = "← 예시를 보는 중 (파일 올리면 내 데이터로 바뀝니다)";
    });
  }

  // ── File upload + parser ──
  const fileInput = document.getElementById("file-input");
  const dropzone = document.getElementById("dropzone");
  const statusEl = document.getElementById("upload-status");

  fileInput.addEventListener("change", function (e) {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  });

  dropzone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropzone.classList.add("drag");
  });
  dropzone.addEventListener("dragleave", function () {
    dropzone.classList.remove("drag");
  });
  dropzone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropzone.classList.remove("drag");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  });

  function processFile(file) {
    statusEl.textContent = "파일 읽는 중...";
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const analyzed = analyzeKakaoText(ev.target.result, file.name);
        showDashboard();
        renderAll(analyzed);
        statusEl.innerHTML = "✓ 분석 완료 · " + analyzed.messages.toLocaleString() + "개 메시지 · 파일은 브라우저 밖으로 나가지 않았습니다";
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

  // ── KakaoTalk txt 간이 파서 ──
  // 두 가지 포맷 지원: 모바일 내보내기, PC 내보내기
  function analyzeKakaoText(text, filename) {
    const lines = text.split(/\r?\n/);

    // 메시지 패턴 (모바일 기준): "[이름] [오전/오후 H:MM] 메시지"
    // PC: "이름, 날짜 오전 H:MM : 메시지"
    const mobileRx = /^\[([^\]]+)\]\s+\[(?:오전|오후)\s+(\d{1,2}):(\d{2})\]\s+(.+)$/;
    const pcRx = /^(?:\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.\s*)?(.+?),\s*(?:오전|오후)\s+(\d{1,2}):(\d{2})\s*:\s*(.+)$/;

    const msgs = [];
    let firstDate = null, lastDate = null;
    let currentDate = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Date header detection (e.g., "2024년 3월 15일 금요일" or "--------- 2024년 3월 15일 ---------")
      const dateMatch = line.match(/(\d{4})[년.\s]+(\d{1,2})[월.\s]+(\d{1,2})/);
      if (dateMatch) {
        currentDate = new Date(
          parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3])
        );
        if (!firstDate) firstDate = currentDate;
        lastDate = currentDate;
      }

      // Message detection
      let m = line.match(mobileRx);
      let speaker, hour, min, content;
      if (m) {
        speaker = m[1]; hour = parseInt(m[2], 10); min = parseInt(m[3], 10); content = m[4];
        if (/오후/.test(line) && hour < 12) hour += 12;
        if (/오전/.test(line) && hour === 12) hour = 0;
      } else if ((m = line.match(pcRx))) {
        speaker = m[1]; hour = parseInt(m[2], 10); min = parseInt(m[3], 10); content = m[4];
        if (/오후/.test(line) && hour < 12) hour += 12;
        if (/오전/.test(line) && hour === 12) hour = 0;
      } else {
        continue;
      }

      msgs.push({ speaker: speaker, hour: hour, content: content });
    }

    if (msgs.length === 0) {
      throw new Error("메시지를 하나도 찾지 못했습니다. 카톡에서 \"대화 내용 내보내기\"로 받은 txt인지 확인해주세요.");
    }

    // ── 간이 L1–L5 분류 (규칙 기반) ──
    // L1 거래: "네", "응", "ㅇㅇ", "ㅋ" 등 짧은 동의/반응
    // L2 잡담: 일상 (밥, 날씨, 시간 등)
    // L3 정보: 사실 공유, 링크, 계획
    // L4 의견: "~같아", "~라고 생각해" 등 주관 표현
    // L5 감정: "행복", "힘들어", "고마워", 감정 단어
    const emotionWords = /(사랑|고마|미안|힘들|행복|슬프|우울|외롭|기쁘|고민|걱정|무섭|화나|두렵|지쳤)/;
    const opinionWords = /(같아|같은데|생각|느낌|아닐까|의견|내 생각|그런 거|아닌가)/;
    const infoWords = /(http|정보|소식|알림|계획|어디|언제|몇 시|몇시)/;
    const chitchatWords = /(밥|점심|저녁|먹|날씨|피곤|자|잔|학교|강의)/;

    let l1 = 0, l2 = 0, l3 = 0, l4 = 0, l5 = 0;
    const hourBuckets = new Array(24).fill(0);
    const speakerCounts = {};

    msgs.forEach(function (m) {
      const c = m.content;
      // hour bucket
      hourBuckets[m.hour]++;
      // speaker
      speakerCounts[m.speaker] = (speakerCounts[m.speaker] || 0) + 1;

      // level classification (priority: L5 > L4 > L3 > L2 > L1)
      if (emotionWords.test(c)) l5++;
      else if (opinionWords.test(c)) l4++;
      else if (infoWords.test(c)) l3++;
      else if (c.length <= 5 || /^(ㅇ|ㅋ|ㅠ|ㅎ|네|응|예|오케|ok|ㅇㅋ)/i.test(c)) l1++;
      else if (chitchatWords.test(c) || c.length < 15) l2++;
      else l3++;
    });

    const total = msgs.length;
    const pct = function (n) { return Math.round((n / total) * 100); };
    const depthPct = pct(l4 + l5);

    // 결과 객체
    const days = firstDate && lastDate
      ? Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)))
      : 0;
    const period = firstDate && lastDate
      ? firstDate.getFullYear() + "." + (firstDate.getMonth() + 1) +
        " – " + lastDate.getFullYear() + "." + (lastDate.getMonth() + 1) +
        " · " + days + "일"
      : "기간 정보 없음";

    // Structural: 일별 메시지 수 (정규화)
    const msgsPerDay = days > 0 ? total / days : total;
    const structural = Math.min(10, (msgsPerDay / 30) * 10); // 30개/일 = 10점 기준

    // Functional: 응답률 근사 (서로 다른 화자 교대 빈도)
    const uniqueSpeakers = Object.keys(speakerCounts).length;
    const functional = Math.min(10, uniqueSpeakers >= 2 ? 7.5 : 3.0); // 단순 근사

    // Quality: L4+L5 비율 → 10점 환산 (20%면 10점)
    const quality = Math.min(10, (depthPct / 20) * 10);

    const overall = (structural * 0.25 + functional * 0.25 + quality * 0.5); // Quality 가중

    return {
      source: filename + " (내 카톡)",
      messages: total,
      period: period,
      axes: {
        structural: Math.round(structural * 10) / 10,
        functional: Math.round(functional * 10) / 10,
        quality: Math.round(quality * 10) / 10,
      },
      depth: { me: depthPct, reference: 20 },
      meals: { me: "—", recommended: 8 }, // 카톡에서는 불가
      dunbar5: {
        me: Math.min(100, Math.round((uniqueSpeakers / 5) * 100)),
        recommended: 100,
      },
      direction: { oneway: 0, twoway: 100 }, // 카톡은 쌍방향
      time: {
        weekday: Math.round(hourBuckets.slice(9, 18).reduce(function (a, b) { return a + b; }, 0) / days || 0),
        weekend: Math.round((hourBuckets[20] + hourBuckets[21] + hourBuckets[22]) / days || 0),
      },
      takeaway: depthPct < 15
        ? "L4+L5 깊은 대화가 " + depthPct + "% — 참조값 20%보다 낮습니다. Quality 축 개선 여지."
        : "L4+L5 깊은 대화 " + depthPct + "% — 건강한 Quality 비율입니다.",
    };
  }

  // ── Initial state: grid hidden, waiting for upload or demo click ──
  // (nothing to render yet)
})();

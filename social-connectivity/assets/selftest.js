// Layer 1 자가진단 — 4개 표준 척도 + Holt-Lunstad 3축 환산
// 발표 Slide 11 (Layer 1) 동형 로직.
//
// 척도 (가이드 문서 기반):
//   1) UCLA-3 (Hughes 2004)         → Functional 축 입력
//   2) Berkman-SNI (1979)           → Structural 축 (청년 보정 적용)
//   3) De Jong Gierveld 6-item       → Quality (Emotional) + Structural (Social)
//   4) Dunbar L1 명목 vs 기능적       → Quality 축 입력
//
// 환산 공식 (가이드 문서 종합 섹션):
//   Structural (0-10) = SNI × 3.33 (청년 보정: 영역 1 제외, 최대 3점)
//   Functional (0-10) = (1 - UCLA-3 정규화) × 5 + (1 - DJG-Total/6) × 5
//                       (가이드의 MSPSS 자리에 DJG-S를 보조로 사용)
//   Quality    (0-10) = (1 - DJG-E/3) × 5 + (Dunbar L1 기능/5) × 5
//
// Layer 3 비교값 (발표 Slide 15):
//   Structural 7.7 · Functional 7.5 · Quality 4.6

(function () {
  "use strict";

  // ── Layer 3 (카톡 분석) 발표값 — 비교 대상 ──
  const L3 = { structural: 7.7, functional: 7.5, quality: 4.6 };

  const state = {
    ucla: { q1: null, q2: null, q3: null },
    sni: { married: null, friends: null, religious: null, groups: null },
    djg: { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null },
    dunbar: { L5_nominal: null, L5_functional: null, L15: null },
  };

  // ── Option button handlers ──
  document.querySelectorAll(".options").forEach(function (group) {
    group.addEventListener("click", function (e) {
      const btn = e.target.closest(".option");
      if (!btn) return;
      const q = group.closest(".q");
      const scale = q.dataset.scale;
      const qid = q.dataset.q;
      const val = parseInt(btn.dataset.v, 10);

      group.querySelectorAll(".option").forEach(function (b) {
        b.classList.remove("selected");
      });
      btn.classList.add("selected");

      state[scale][qid] = val;
      computeAll();
    });
  });

  // ── Numeric input handlers (Dunbar) ──
  document.querySelectorAll(".num-input").forEach(function (input) {
    input.addEventListener("input", function () {
      const q = input.closest(".q");
      const scale = q.dataset.scale;
      const qid = q.dataset.q;
      const raw = input.value.trim();
      state[scale][qid] = raw === "" ? null : Math.max(0, parseInt(raw, 10) || 0);
      computeAll();
    });
  });

  // ── Scoring functions ──
  function scoreUCLA() {
    const v = state.ucla;
    if (v.q1 === null || v.q2 === null || v.q3 === null) return null;
    return v.q1 + v.q2 + v.q3; // 3-9
  }

  function scoreSNI() {
    const v = state.sni;
    if (v.married === null || v.friends === null || v.religious === null || v.groups === null) return null;
    return { total: v.married + v.friends + v.religious + v.groups,
             youth: v.friends + v.religious + v.groups }; // 청년 보정 (혼인 제외)
  }

  function scoreDJG() {
    const v = state.djg;
    const required = ["q1", "q2", "q3", "q4", "q5", "q6"];
    if (required.some(function (k) { return v[k] === null; })) return null;
    const emotional = v.q1 + v.q2 + v.q3; // 0-3
    const social = v.q4 + v.q5 + v.q6;    // 0-3
    return { emotional: emotional, social: social, total: emotional + social };
  }

  function scoreDunbar() {
    const v = state.dunbar;
    if (v.L5_functional === null) return null; // 핵심 지표
    return {
      nominal: v.L5_nominal || 0,
      functional: v.L5_functional,
      gap: (v.L5_nominal || 0) - v.L5_functional,
      pct: Math.min(100, Math.round((v.L5_functional / 5) * 100)),
    };
  }

  // ── Interpretation ──
  function interpUCLA(score) {
    if (score <= 4) return { text: "외로움 신호 거의 없음.", warn: false };
    if (score <= 5) return { text: "경계선. 가끔 외로움이 느껴지는 정도.", warn: false };
    if (score <= 7) return { text: "외로움이 잦음 (6–7점). Steptoe 2013에서 사망률 위험이 올라가기 시작하는 구간.", warn: true };
    return { text: "외로움이 매우 잦음 (8–9점). Holt-Lunstad 메타분석 기준 사망 위험 약 1.29배 구간.", warn: true };
  }

  function interpSNI(s) {
    const t = s.total, y = s.youth;
    const note = "20대 보정 점수(영역 1 제외)는 " + y + "/3.";
    if (t >= 3) return { text: "네트워크가 충분히 두텁다. " + note, warn: false };
    if (t >= 2) return { text: "평균 정도. 한두 영역에 더 들어가면 더 안정적이다. " + note, warn: false };
    if (t >= 1) return { text: "다소 좁은 편. 결혼 영역이 비는 20대는 친구·정기 그룹·자원봉사 중 하나로 보충하면 좋다. " + note, warn: t === 0 };
    return { text: "사회적 고립 (0점). Berkman 1979에서 9년 사망률이 약 2배 높았던 군. " + note, warn: true };
  }

  function interpDJG(s) {
    const e = s.emotional, soc = s.social, t = s.total;
    let typeText;
    if (e >= 2 && soc <= 1) typeText = "★ 정서가 더 비어 있는 쪽. 친구는 있는데 속을 나눌 사람이 부족하다는 뜻 — 본 발표가 말하는 \"가면 고립\"에 해당.";
    else if (e <= 1 && soc >= 2) typeText = "사회 쪽이 더 비어 있는 쪽. 가까운 한 사람은 있지만 무리가 부족하다.";
    else if (e >= 2 && soc >= 2) typeText = "정서·사회 둘 다 비어 있다. 한 축씩 차근차근 채울 필요가 있다.";
    else typeText = "두 축 모두 양호.";
    return {
      text: "정서 " + e + "/3 · 사회 " + soc + "/3 · 합 " + t + "/6 — " + typeText,
      warn: e >= 2 || t >= 3,
    };
  }

  function interpDunbar(d) {
    const gap = d.gap;
    let text;
    if (d.functional >= 5) text = "절친 5명이 실제로 작동 중 (" + d.functional + "명).";
    else if (d.functional >= 3) text = "절친 " + d.functional + "명이 실제로 작동. 명목 명단과는 " + gap + "명 차이.";
    else if (d.functional >= 1) text = "실제로 작동하는 절친은 " + d.functional + "명, 머릿속 명단은 " + d.nominal + "명 (차이 " + gap + "명). 이름은 떠오르는데 정작 연락은 안 되는 상태.";
    else text = "실제로 작동하는 절친 0명. 머릿속에는 " + d.nominal + "명이지만 지난 2주간 1:1 연락은 없었다는 뜻.";
    return { text: text, warn: d.functional < 3 };
  }

  // ── 3축 환산 ──
  function compute3Axis(ucla, sni, djg, dunbar) {
    // Structural — Berkman-SNI 청년 보정 (영역 1 제외, 최대 3점)
    const structural = Math.min(10, sni.youth * 3.33);

    // Functional — UCLA-3 + DJG-Total 결합 (가이드 MSPSS 자리에 DJG-Total 사용)
    const uclaNorm = (ucla - 3) / 6;            // 0-1, 높을수록 외로움
    const djgTotalNorm = djg.total / 6;          // 0-1, 높을수록 외로움
    const functional = (1 - uclaNorm) * 5 + (1 - djgTotalNorm) * 5;

    // Quality — DJG-Emotional + Dunbar L1 기능 결합
    const djgENorm = djg.emotional / 3;          // 0-1
    const dunbarFunc = Math.min(1, dunbar.functional / 5); // 0-1
    const quality = (1 - djgENorm) * 5 + dunbarFunc * 5;

    return {
      structural: Math.round(structural * 10) / 10,
      functional: Math.round(functional * 10) / 10,
      quality: Math.round(quality * 10) / 10,
    };
  }

  // ── Render ──
  function render(scaleId, label, interp) {
    const box = document.getElementById("result-" + scaleId);
    const scoreEl = document.getElementById(scaleId + "-score");
    const interpEl = document.getElementById(scaleId + "-interp");

    if (label === null) {
      box.style.display = "none";
      return;
    }
    box.style.display = "block";
    scoreEl.textContent = label;
    scoreEl.classList.toggle("warn", interp.warn);
    interpEl.textContent = interp.text;
  }

  function renderSummary(ucla, sni, djg, dunbar) {
    // ── 진행률 pill 갱신 (항상) ──
    const states = { ucla: ucla !== null, sni: sni !== null, djg: djg !== null, dunbar: dunbar !== null };
    const done = Object.values(states).filter(Boolean).length;
    document.getElementById("progress-count").textContent = done;

    Object.keys(states).forEach(function (key) {
      const pill = document.getElementById("prog-" + key);
      if (!pill) return;
      if (states[key]) {
        pill.style.background = "#4F46E5";
        pill.style.color = "#FFFFFF";
      } else {
        pill.style.background = "#2F2F40";
        pill.style.color = "#71717A";
      }
    });

    const allDone = done === 4;
    const detail = document.getElementById("progress-detail");
    const headline = document.getElementById("summary-headline");
    const desc = document.getElementById("summary-desc");

    if (!allDone) {
      // 부분 응답 — 무엇을 더 채워야 하는지 안내
      const remaining = [];
      if (!states.ucla) remaining.push("UCLA-3 (3문항)");
      if (!states.sni) remaining.push("Berkman-SNI (4문항)");
      if (!states.djg) remaining.push("De Jong (6문항)");
      if (!states.dunbar) remaining.push("Dunbar (② 기능적 인원)");
      detail.textContent = "남은 항목: " + remaining.join(" · ");
      headline.textContent = done === 0
        ? "응답을 시작하면 결과가 여기에 표시됩니다"
        : "결과 산출까지 " + (4 - done) + "개 척도 남음";
      desc.textContent = "모두 응답되면 즉시 3축 환산값과 Layer 3 비교가 표시됩니다 — 별도의 \"제출\" 버튼은 없습니다.";

      // 결과 영역 placeholder 유지
      document.getElementById("axis-s-l1").textContent = "—";
      document.getElementById("axis-f-l1").textContent = "—";
      document.getElementById("axis-q-l1").textContent = "—";
      return;
    }
    detail.textContent = "✓ 모든 응답 완료 · 결과는 아래.";

    const ax = compute3Axis(ucla, sni, djg, dunbar);

    document.getElementById("axis-s-l1").textContent = ax.structural.toFixed(1);
    document.getElementById("axis-f-l1").textContent = ax.functional.toFixed(1);
    document.getElementById("axis-q-l1").textContent = ax.quality.toFixed(1);

    // ── Convergence diagnosis ──
    const sDiff = Math.abs(ax.structural - L3.structural);
    const fDiff = Math.abs(ax.functional - L3.functional);
    const qDiff = Math.abs(ax.quality - L3.quality);

    // Find lowest axis in each layer
    const l1Axes = [["Structural", ax.structural], ["Functional", ax.functional], ["Quality", ax.quality]];
    const l3Axes = [["Structural", L3.structural], ["Functional", L3.functional], ["Quality", L3.quality]];
    l1Axes.sort(function (a, b) { return a[1] - b[1]; });
    l3Axes.sort(function (a, b) { return a[1] - b[1]; });

    const sameLowest = l1Axes[0][0] === l3Axes[0][0];

    const conv = document.getElementById("convergence");
    const axisKor = { Structural: "네트워크 크기", Functional: "일상 작동", Quality: "관계의 깊이" };

    if (sameLowest && l1Axes[0][0] === "Quality") {
      conv.innerHTML = "<strong style='color:#F87171;'>두 점수 모두에서 \"관계의 깊이\"가 가장 낮게 나왔다.</strong> " +
        "직접 답한 자가척도(" + ax.quality.toFixed(1) + ")와 카톡에서 뽑은 점수(" + L3.quality.toFixed(1) +
        ")가 같은 곳을 가리킨다. 방식이 전혀 다른 두 측정이 같은 결론을 내는 거라, 친구 수가 아니라 \"속을 나눌 사람\"이 모자라다는 진단을 그대로 받아들이면 된다.";
      headline.textContent = "두 점수가 같은 약점을 가리킨다 — \"관계의 깊이\"";
    } else if (sameLowest) {
      conv.innerHTML = "두 점수 모두 <strong>" + axisKor[l1Axes[0][0]] + "</strong> 쪽이 제일 낮다. " +
        "자가척도 " + l1Axes[0][1].toFixed(1) + " · 카톡 " + l3Axes[0][1].toFixed(1) +
        ". 방식이 다른 두 측정이 같은 답을 내고 있으니, 이 약점은 그대로 받아들여도 무리가 없다.";
      headline.textContent = "두 점수가 같은 약점을 가리킨다 — \"" + axisKor[l1Axes[0][0]] + "\"";
    } else {
      conv.innerHTML = "자가척도에서는 <strong>" + axisKor[l1Axes[0][0]] + "</strong>가, " +
        "카톡 분석에서는 <strong>" + axisKor[l3Axes[0][0]] + "</strong>가 가장 낮게 나왔다. " +
        "둘이 다를 때는 자기 보고가 보정되기 쉬운 만큼, 행동 기록(카톡) 쪽을 약간 더 무겁게 본다.";
      headline.textContent = "두 점수가 다른 곳을 가리킨다 — 다시 보기";
    }

    headline.classList.toggle("red", l1Axes[0][1] < 5);

    // ── Next step prescription ──
    const lowestAxis = l1Axes[0][0];
    let rx = "";
    if (lowestAxis === "Quality") {
      rx = "<strong>관계의 깊이부터 채운다.</strong> 머릿속 절친 명단과 실제로 연락이 되는 사람 사이에 차이가 큰 게 문제다. " +
           "이번 주 안에 가장 친한 친구 한 명에게 먼저 1:1로 메시지를 보내고, 다음 달까지 1:1 약속(통화 30분이든 밥 한 끼든)을 한 번 잡아본다.";
    } else if (lowestAxis === "Structural") {
      rx = "<strong>정기 모임 하나를 일정에 박아 넣는다.</strong> 네트워크의 양 자체가 좁다. 주 1회 같은 시간에 가는 활동(동아리·운동·스터디 무엇이든) 하나를 고정해 본다. " +
           "20대는 결혼 영역이 거의 비어 있기 때문에 친구·정기 그룹·자원봉사 중에서 보충해 주는 게 자연스럽다.";
    } else {
      rx = "<strong>응답에 한 문장만 더 붙여 본다.</strong> 응답 속도나 주고받음 같은 일상 작동이 약하다. \"응\", \"ㅇㅇ\" 같은 단답을 줄이고, " +
           "의견이나 감정이 담긴 한 줄을 덧붙이는 것부터 시작한다.";
    }
    document.getElementById("next-step").innerHTML = rx;

    // ── 카드 하단 노트: 자연어로, 어떤 입력이 어떤 점수가 됐는지 ──
    document.getElementById("axis-s-note").textContent =
      "Berkman-SNI " + sni.total + "/4점 (20대 보정 " + sni.youth + "/3점)을 10점 만점으로 환산하면 " + ax.structural.toFixed(1) + "점.";
    document.getElementById("axis-f-note").textContent =
      "UCLA 외로움 " + ucla + "/9점과 De Jong 합계 " + djg.total + "/6점을 합쳐서 " + ax.functional.toFixed(1) + "점.";
    document.getElementById("axis-q-note").textContent =
      "정서 외로움 " + djg.emotional + "/3점과 실제로 연락 되는 절친 " + dunbar.functional + "명을 합쳐서 " + ax.quality.toFixed(1) + "점.";
  }

  function computeAll() {
    const ucla = scoreUCLA();
    const sni = scoreSNI();
    const djg = scoreDJG();
    const dunbar = scoreDunbar();

    if (ucla !== null) {
      const i = interpUCLA(ucla);
      render("ucla", ucla + " / 9", i);
    }
    if (sni !== null) {
      const i = interpSNI(sni);
      render("sni", sni.total + " / 4 (보정 " + sni.youth + "/3)", i);
    }
    if (djg !== null) {
      const i = interpDJG(djg);
      render("djg", djg.emotional + " · " + djg.social + " · " + djg.total, i);
    }
    if (dunbar !== null) {
      const i = interpDunbar(dunbar);
      render("dunbar", dunbar.functional + " 기능 / " + dunbar.nominal + " 명목", i);
    }

    renderSummary(ucla, sni, djg, dunbar);
  }
})();

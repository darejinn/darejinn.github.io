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
    if (score <= 4) return { text: "정상 범위 · 외로움 위험 낮음", warn: false };
    if (score <= 5) return { text: "경계선 — 일부 외로움 신호", warn: false };
    if (score <= 7) return { text: "외로움군 (6–7점) — Steptoe 2013 사망률 위험 시작점", warn: true };
    return { text: "심각한 외로움 (8–9점) — Holt-Lunstad HR 1.29 범주", warn: true };
  }

  function interpSNI(s) {
    const t = s.total, y = s.youth;
    const note = "청년 보정 (영역 1 제외, 최대 3): " + y + "/3";
    if (t >= 3) return { text: "사회적 통합 · 사망률 위험 최소. " + note, warn: false };
    if (t >= 2) return { text: "중간 네트워크 · 평균 위험. " + note, warn: false };
    if (t >= 1) return { text: "낮은 네트워크 — 청년에서는 영역 1 손실 보정 필요. " + note, warn: t === 0 };
    return { text: "사회적 고립 (0점) — 9년 사망률 2배 군. " + note, warn: true };
  }

  function interpDJG(s) {
    const e = s.emotional, soc = s.social, t = s.total;
    let typeText;
    if (e >= 2 && soc <= 1) typeText = "★ 정서 우세형 — 발표의 \"가면 고립\" 가장 가능성 높은 유형";
    else if (e <= 1 && soc >= 2) typeText = "사회 우세형 — 한 사람과는 깊지만 무리가 없음";
    else if (e >= 2 && soc >= 2) typeText = "전반적 외로움 — 두 차원 모두 결손";
    else typeText = "건강한 상태 — 두 차원 모두 충분";
    return {
      text: "Emotional " + e + "/3 · Social " + soc + "/3 · Total " + t + "/6 — " + typeText,
      warn: e >= 2 || t >= 3,
    };
  }

  function interpDunbar(d) {
    const gap = d.gap;
    let text;
    if (d.functional >= 5) text = "L5 충족 (기능적 " + d.functional + "명) · 절친 구조 건강";
    else if (d.functional >= 3) text = "L5 부분 충족 (기능적 " + d.functional + "명) · 명목과 갭 " + gap + "명";
    else if (d.functional >= 1) text = "L5 결손 신호 (기능적 " + d.functional + "명, 명목 " + d.nominal + "명) · 갭 " + gap + " — 발표의 \"기능적 공백\" 패턴";
    else text = "L5 심각한 공백 (기능적 0명) · 명목 " + d.nominal + "명 → 갭 " + gap;
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
    const allDone = ucla !== null && sni !== null && djg !== null && dunbar !== null;
    const summary = document.getElementById("summary");

    if (!allDone) {
      summary.style.display = "none";
      return;
    }
    summary.style.display = "block";

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
    const headline = document.getElementById("summary-headline");

    if (sameLowest && l1Axes[0][0] === "Quality") {
      conv.innerHTML = "✓ <strong style='color:#F87171;'>Quality 축이 두 측정에서 모두 가장 낮음</strong> — \"가면 고립\" 진단이 견고합니다 (자가척도와 행동 데이터가 독립적으로 같은 결론). " +
        "Layer 1 = " + ax.quality.toFixed(1) + ", Layer 3 = " + L3.quality.toFixed(1);
      headline.textContent = "두 측정 모두 Quality 함몰";
    } else if (sameLowest) {
      conv.innerHTML = "두 측정 모두 <strong>" + l1Axes[0][0] + "</strong> 축이 가장 낮음 — 진단 일치. " +
        "Layer 1 = " + l1Axes[0][1].toFixed(1) + ", Layer 3 = " + l3Axes[0][1].toFixed(1);
      headline.textContent = "두 측정 일치 — " + l1Axes[0][0] + " 약점";
    } else {
      conv.innerHTML = "Layer 1은 <strong>" + l1Axes[0][0] + "</strong> 축이 가장 낮고, Layer 3는 <strong>" + l3Axes[0][0] + "</strong> 축이 가장 낮음. " +
        "두 결과가 일치하지 않을 때는 자기 보고의 왜곡 가능성을 의심하고 행동 데이터(Layer 3)를 우선합니다.";
      headline.textContent = "두 측정 불일치 — 재해석 필요";
    }

    headline.classList.toggle("red", l1Axes[0][1] < 5);

    // ── Next step prescription ──
    const lowestAxis = l1Axes[0][0];
    let rx = "";
    if (lowestAxis === "Quality") {
      rx = "<strong>Rx-3 · Dunbar 5 부활</strong> — 명목상 절친 5명 중 \"기능적 0명\"이 핵심 문제. " +
           "이번 주 안에 가장 친한 친구 1명에게 먼저 1:1 메시지로 연락하기. " +
           "다음 달까지 1:1 약속(통화 30분 또는 식사 1회) 잡기.";
    } else if (lowestAxis === "Structural") {
      rx = "<strong>Rx-2 · 정기 그룹 추가</strong> — 청년에서는 Berkman 영역 1(혼인) 제외 시 " +
           "정기 그룹 참여(SEI 같은 동아리)로 보정 가능. 주 1회 정해진 그룹 활동을 일정에 고정.";
    } else {
      rx = "<strong>Rx-1 · \"응\" 대신 한 문장 더</strong> — Functional 축은 응답 속도와 상호성이 핵심. " +
           "단답을 줄이고 의견·감정이 담긴 한 문장을 덧붙이는 습관부터 시작.";
    }
    document.getElementById("next-step").innerHTML = rx;

    // Update notes with actual computed inputs
    document.getElementById("axis-s-note").textContent =
      "SNI " + sni.total + "/4, 청년 보정 " + sni.youth + "/3 → × 3.33 = " + ax.structural.toFixed(1);
    document.getElementById("axis-f-note").textContent =
      "UCLA-3 = " + ucla + ", DJG-T = " + djg.total + " → " + ax.functional.toFixed(1);
    document.getElementById("axis-q-note").textContent =
      "DJG-E = " + djg.emotional + ", Dunbar L1 기능 = " + dunbar.functional + " → " + ax.quality.toFixed(1);
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

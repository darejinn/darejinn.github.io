// Layer 1 자가진단 — 세 척도 점수 계산 및 통합 해석
// 발표 Part 3 · Layer 1 슬라이드와 동일 로직

(function () {
  "use strict";

  const state = {
    ucla: { q1: null, q2: null, q3: null },
    sni: { married: null, friends: null, religious: null, groups: null },
    dunbar: { L5: null, L15: null, L50: null },
  };

  // ── Option button handlers (UCLA, SNI) ──
  document.querySelectorAll(".options").forEach(function (group) {
    group.addEventListener("click", function (e) {
      const btn = e.target.closest(".option");
      if (!btn) return;
      const q = group.closest(".q");
      const scale = q.dataset.scale;
      const qid = q.dataset.q;
      const val = parseInt(btn.dataset.v, 10);

      // Mark selected
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
    return v.q1 + v.q2 + v.q3;
  }

  function scoreSNI() {
    const v = state.sni;
    if (v.married === null || v.friends === null || v.religious === null || v.groups === null) return null;
    return v.married + v.friends + v.religious + v.groups;
  }

  function scoreDunbar() {
    const v = state.dunbar;
    if (v.L5 === null) return null; // L5가 가장 중요
    // 충족률: L5 ÷ 5 × 100, cap at 100%
    return Math.min(100, Math.round((v.L5 / 5) * 100));
  }

  // ── Interpretation ──
  function interpUCLA(score) {
    // Hughes 2004: 3-point = 정상, 6점 이상 = 외로움 위험
    if (score <= 4) return { text: "정상 범위 · 외로움 위험 낮음", warn: false };
    if (score <= 5) return { text: "경계선 · 일부 외로움 신호", warn: false };
    return { text: "외로움 위험군 (6점 이상) — 다른 두 척도와 함께 확인해보세요", warn: true };
  }

  function interpSNI(score) {
    if (score >= 4) return { text: "풍부한 네트워크 — Structural 축 충분", warn: false };
    if (score >= 3) return { text: "중-상 네트워크 — 평균 이상", warn: false };
    if (score >= 2) return { text: "낮은-중간 네트워크 — 한두 영역 보완 여지", warn: false };
    if (score >= 1) return { text: "매우 낮은 네트워크 — 구조적 연결 취약", warn: true };
    return { text: "네트워크 고립 상태 (0점) — 우선 관심 대상", warn: true };
  }

  function interpDunbar(pct) {
    const L5 = state.dunbar.L5 || 0;
    if (pct >= 100) return { text: "Layer 5 충족 (" + L5 + "명) — 절친 구조 건강", warn: false };
    if (pct >= 60) return { text: "Layer 5 부분 충족 (" + L5 + "명) — 이상적 5명에 근접", warn: false };
    if (pct >= 40) return { text: "Layer 5 결손 신호 (" + L5 + "명) — 발표의 \"가면 고립\" 패턴 가능성", warn: true };
    return { text: "Layer 5 심각한 결손 (" + L5 + "명) — 주 1회 선제 연락부터 시작", warn: true };
  }

  // ── Render ──
  function render(scaleId, score, interp) {
    const box = document.getElementById("result-" + scaleId);
    const scoreEl = document.getElementById(scaleId + "-score");
    const interpEl = document.getElementById(scaleId + "-interp");

    if (score === null) {
      box.style.display = "none";
      return;
    }

    box.style.display = "block";

    // Score display
    if (scaleId === "ucla") {
      scoreEl.textContent = score + " / 9";
    } else if (scaleId === "sni") {
      scoreEl.textContent = score + " / 4";
    } else {
      scoreEl.textContent = score + " %";
    }

    scoreEl.classList.toggle("warn", interp.warn);
    interpEl.textContent = interp.text;
  }

  function renderSummary(ucla, sni, dunbar) {
    const allDone = ucla !== null && sni !== null && dunbar !== null;
    const summary = document.getElementById("summary");

    if (!allDone) {
      summary.style.display = "none";
      return;
    }

    summary.style.display = "block";

    document.getElementById("sum-ucla").textContent = ucla + " / 9";
    document.getElementById("sum-ucla-label").textContent = interpUCLA(ucla).text;

    document.getElementById("sum-sni").textContent = sni + " / 4";
    document.getElementById("sum-sni-label").textContent = interpSNI(sni).text;

    document.getElementById("sum-dunbar").textContent = dunbar + " %";
    document.getElementById("sum-dunbar-label").textContent = interpDunbar(dunbar).text;

    // Integrated headline: count warnings
    const warns = [interpUCLA(ucla).warn, interpSNI(sni).warn, interpDunbar(dunbar).warn]
      .filter(Boolean).length;

    const headline = document.getElementById("summary-headline");
    const desc = document.getElementById("summary-desc");
    const nextStep = document.getElementById("next-step");

    if (warns === 0) {
      headline.textContent = "건강한 사회적 연결";
      headline.classList.remove("red");
      desc.textContent = "세 척도 모두 안전 범위. 현재 패턴을 유지하되, 다음 페이지의 Layer 3 대시보드로 더 세밀하게 확인해보세요.";
      nextStep.innerHTML = "→ 주간 사회적 시간과 대화의 질(L4+L5)은 Layer 3에서 확인할 수 있습니다.";
    } else if (warns === 1) {
      headline.textContent = "일부 영역 주의";
      headline.classList.remove("red");
      desc.textContent = "하나의 척도가 경고를 보입니다. 그 축을 중심으로 개선해볼 여지가 있습니다.";
      nextStep.innerHTML = "→ 발표의 5가지 행동 변화 중 해당 축에 맞는 것부터 시도해보세요. 예) Quality가 낮다면 \"'응' 대신 한 문장 더\" 규칙.";
    } else if (warns === 2) {
      headline.textContent = "중간 위험 구간";
      headline.classList.add("red");
      desc.textContent = "두 영역에서 위험 신호가 확인됩니다. 발표의 핵심 처방인 \"Dunbar 5 부활\"이 효과적일 수 있습니다.";
      nextStep.innerHTML = "→ 가장 친한 3명을 정해 각자 1:1 채널을 만들고, 주 1회 먼저 연락하기.";
    } else {
      headline.textContent = "가면 고립 패턴 가능성";
      headline.classList.add("red");
      desc.textContent = "세 척도 모두 주의 영역입니다. 외부 지표로는 '카톡은 많이 한다'처럼 보일 수 있지만 내적으로는 연결이 빈약한 상태입니다.";
      nextStep.innerHTML = "→ 이번 주 안에 가장 친한 친구 한 명에게 먼저 연락하기. 다음 달까지 1:1 약속 잡기. 발표의 Rx-3을 참조하세요.";
    }
  }

  function computeAll() {
    const ucla = scoreUCLA();
    const sni = scoreSNI();
    const dunbar = scoreDunbar();

    if (ucla !== null) render("ucla", ucla, interpUCLA(ucla));
    if (sni !== null) render("sni", sni, interpSNI(sni));
    if (dunbar !== null) render("dunbar", dunbar, interpDunbar(dunbar));

    renderSummary(ucla, sni, dunbar);
  }
})();

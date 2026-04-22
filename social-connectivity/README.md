# 사회적 연결성 · 자기 진단 사이트

2026년 4월 연세대학교 의과대학 "사회적 연결성 — 생활습관 질환의 잊혀진 여섯 번째 위험요인" 발표의 온라인 동반 사이트입니다.

**라이브 URL** (배포 후): https://darejinn.github.io/social-connectivity/

---

## 파일 구조

```
social-connectivity/
├── index.html          랜딩 페이지
├── selftest.html       Layer 1 자가진단 3종 (QR 랜딩)
├── dashboard.html      Layer 3 대시보드 (카톡 txt 업로드 분석)
└── assets/
    ├── style.css       공통 스타일 (발표 팔레트와 일치)
    ├── selftest.js     UCLA · Berkman-SNI · Dunbar 점수 계산
    └── dashboard.js    카톡 파서 + Chart.js 대시보드
```

정적 사이트입니다. 빌드 도구, 백엔드, 데이터베이스 없이 **파일만 올리면 작동**합니다.

---

## GitHub Pages 배포 방법

### 기존 블로그 저장소에 서브디렉토리로 배포하는 경우 (권장)

1. 블로그 저장소(예: `darejinn.github.io`)를 로컬에 클론
   ```bash
   git clone https://github.com/darejinn/darejinn.github.io.git
   cd darejinn.github.io
   ```

2. 이 폴더를 저장소에 복사
   ```bash
   cp -r /path/to/webapp social-connectivity/
   ```

3. 커밋 & 푸시
   ```bash
   git add social-connectivity/
   git commit -m "Add social connectivity companion site"
   git push
   ```

4. 1–2분 후 `https://darejinn.github.io/social-connectivity/` 에서 접속 가능

### Jekyll 기반 블로그(예: GitHub Pages 기본)의 주의사항

Jekyll은 기본적으로 `_`로 시작하는 파일과 일부 폴더를 무시합니다. `social-connectivity/` 폴더에 **`.nojekyll` 파일을 하나 추가**하면 Jekyll 처리를 스킵하고 그대로 정적 파일로 서빙합니다.

```bash
touch social-connectivity/.nojekyll
```

---

## 로컬에서 테스트

```bash
cd social-connectivity
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 열기
```

---

## 기능

### 1. 자가진단 (`selftest.html`)

세 검증된 척도를 직접 풀어보고 실시간으로 점수를 확인:

- **UCLA Loneliness 3-item** (Hughes et al. 2004) — 외로움 3문항, 3–9점
- **Berkman-SNI** (Berkman & Syme 1979) — 네트워크 4영역, 0–4점
- **Dunbar 본인 카운트** (Dunbar 2018) — Layer 5·15·50 인원 입력

세 척도가 모두 채워지면 하단에 통합 결과와 개인화된 다음 단계 가이드가 표시됩니다.

### 2. 대시보드 (`dashboard.html`)

카카오톡 채팅방 `설정 > 대화 내용 내보내기`로 받은 `.txt` 파일을 드래그 앤 드롭하면:

- Holt-Lunstad 3축 (Structural · Functional · Quality) 점수 산출
- L1–L5 메시지 깊이 분포 (Mehl 2010 방법론)
- Dunbar 5 충족률, 커뮤니케이션 방향, 시간대별 분포 등 6개 차트

**모든 분석은 브라우저 내에서 수행**됩니다. 파일은 서버로 전송되지 않습니다 (네트워크 탭에서 확인 가능).

옵션으로 발표자 본인 데이터(31,122개 메시지, 3년치)를 예시로 먼저 둘러볼 수 있습니다.

---

## 참조

본 사이트에서 사용하는 참조값들의 출처:

- **3축 프레임**: Holt-Lunstad et al. 2015 *Perspectives on Psychological Science* 10:227 (3.4M명 메타)
- **L4+L5 깊은 대화 20% 참조값**: Mehl et al. 2010 *Psychological Science* 21:539 (EAR N=79, 4일 녹음)
- **주간 함께 식사 ≥8회 권장**: Dunbar 2017 *Adaptive Human Behavior and Physiology* 3:198
- **Dunbar 5 구조**: Dunbar 2018 *Trends in Cognitive Sciences* 22:32
- **외로움 위험 컷오프 6점**: Hughes et al. 2004 *Research on Aging* 26:655

---

## 라이선스 · 데이터 처리 원칙

- 이 저장소의 코드: MIT License
- 사용자의 카카오톡 txt: 브라우저에서만 처리, 어디에도 저장·전송되지 않음
- 분석 결과: 브라우저 세션이 끝나면 사라짐 (로컬 저장 없음)

---

조윤진 · 연세대학교 의과대학 · 2026년 4월

---
title:  "[KAIST_WURF]0122 카이스트 김지훈 교수님"
# excerpt: "3차원 유전체 구조 연구의 현재와 미래"
category:
  - KAIST_WURF
tag:
  - [일지]
toc: true
toc_sticky: true
date: 2025-01-22
last_modified_at: 2025-01-22
comments: true
---

카이스트 김지훈 교수님의 WURF meet the professor 강연을 정리하였습니다.
{: .notice--info}

# Introduction : Genome in a 4-Dimensional World</span>

| 김지훈 교수님 랩 사이트 👉 [사이트 바로가기](https://jihunkim.kaist.ac.kr/) |
{: .center}

> 3차원 공간의 genome structure뿐만 아니라 시간 축(4D)을 함께 고려하는 연구를 수행하는 랩이다. 세포 주기(cell cycle) 및 질병의 진행 상황에 따라 genome structure가 어떻게 달라지는지를 연구한다.

---

# What Does a Ph.D. Mean?

**Ph.D. = Doctor of Philosophy = 생각의 끝에 도달한 사람**

- 박사과정의 핵심 목표는: **조언 없이도 독립적으로 연구할 수 있는 사람으로 성장**하는 것이다.
- 커뮤니케이션의 정점은 **Publication**이며, 이는 계단식으로 축적된다.


---

# 3차원 후성유전학 (3D Epigenetics)

## 계층적 구조
> fiber → looping interactions → sub-TAD → TADs → Compartments → Chromosome territories

- Loop Extrusion Model
  - 멀리 떨어진 enhancer와 gene이 **loop**을 통해 가까워지며 상호작용.
  - **CTCF**는 cohesin의 통과를 막아 loop boundary 형성.

## Hi-C 기술 개요

- genome 전체의 구조적 interaction을 측정할 수 있는 기술.
- 3차원 구조를 2차원 matrix로 변환하여 분석한다.

### 실험 과정 요약

1. 포름알데하이드로 고정
2. Restriction enzyme으로 절단 → sticky end 생성
3. ligation → 물리적으로 가까운 서열이 연결됨
4. primer 설계 (universal tail + genomic sequence)
5. 증폭 및 시퀀싱
6. matrix 형태로 분석

> diagonal(대각선)은 자기 자신과의 interaction으로 가장 강함.  
> diagonal이 아닌 곳의 high count는 long-range interaction을 의미한다.

---

# 교수님 연구 :  Loop Engineering 시도: LADL (Light-Activated Dynamic Looping)

- 빛을 이용해 loop을 형성/해제할 수 있는 기술 개발

## 핵심 구성 요소 3가지

| 역할     | 구성 요소 |
|----------|-----------|
| Anchor   | CIBN + dCas9 |
| Target   | guide RNA |
| Bridge   | CRY1 (빛에 반응하여 oligomerize됨) |

- 실제 Zip462 locus에서 engineered loop을 유도하여 gene 발현 증가 확인 (RNA FISH)

---

## 확장 연구
1. 도메인 형성 관련 인자 실험
   - Fragile X 환자 샘플: domain 완전 소실, compartment 혼란
   - **Domain은 무엇으로 구성되는가? Compartment와 같은 개념인가?**

2. 바이러스 유전체 통합 시의 구조 변화
   - 바이러스 integration → domain 재구성
   - Hi-C를 통해 integration에 따른 genome 구조 변화 관찰 (plaid pattern 등)

3. Cell Cycle과 Genome Structure
   - degron 시스템을 이용한 구조 단백질 knockdown → genome 구조에 미치는 영향 분석

---

# Critical Unknowns

1. Loop 형성의 짧은 시간 내 dynamics
2. Looping과 genome function 간의 **인과 관계**
3. 세포 집단 내 **이질성 (heterogeneity)**

---

# Additional Comments

김지훈 교수님의 연구는 3차원 유전체 구조의 **정적 상태뿐만 아니라, 동적 변화**에 주목한다. 시간, 구조, 발현이라는 3축을 아우르며, 궁극적으로 유전체 기능과 질병의 연결고리를 이해하고자 한다.

구조를 ‘보는 것’을 넘어, 구조를 ‘만드는 것’으로 나아가는 연구를 목표하신다. 단순히 1차원 서열의 나열이 발현을 결정하는 것이 아니라, 삼차원 상호작용과 변동성을 고려하여 유전체의 구조를 재정의하는 것이 흥미로워, 이 분야를 더 공부하고 싶다는 확신이 들었다.
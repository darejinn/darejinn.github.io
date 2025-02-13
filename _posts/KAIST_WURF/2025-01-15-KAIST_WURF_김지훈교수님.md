---
title:  "[KAIST_WURF]0115 카이스트 김지훈 교수님" 
excerpt: ""

category:
  - KAIST_WURF
tag :
  - [일지]

toc: true
toc_sticky: true
 
date: 2025-01-15
last_modified_at: 2025-01-15
comments: true
---

---
원칙은 바뀔 수 있음이 원칙이다.
{: .notice--info}
# 개요

김지훈 교수님 : LADL - Light-Activated Dynamic Looping and its function 
<br>


# Condensin 1 and 2
- 여러 개의 scaffold protein이 모여서 network를 이룬다!
- condensin 1 and 2 : chromosome compaction에 영향을 미친다, transcription이 active하게 일어나는 부분에 binding한다! 그런데 mitosis에서 transcription은 일어나지 않는다.

## Condensin 1의 long range interaction
condensin과 같은 structure protein들이, gene과 enhancer가 가까워질 수 있도록 loop를 만든다.

### Epigenetic mechanisms in 3D

- fiber => loop => TAD => compartment => chromosome => genome
- top down 방식으로 분석

# 5C 분석법 (chromosome-conformation-capture-carbon-copy)
1. restriction enzyme digest
2. Sticky-end ligation이 이루어진 genome structure가 template 역할을 한다.
3. 5C primer design해서, 2개의 primer를 ligation 
- restriction enzyme 옆의 genomic sequence
- universial tail
4. 증폭시킨 후 5C sequencing

## Analysis step
1. Binning is x axis, y axis : 칸을 만든다
2. Assigning counts
=> long range interaction을 하는 부분의 숫자가 더 높다!

# Critical unknowns
1. looping dynamics on short time scales
2. causal role for looping on genome function : 인과관계가 불분명하다, 정확한 모델을 모름(loop extrustion, phase seperation)
3. population heterogenety

# Aim : 짧은 시간에, 동시에 population에 loop을 만들고, 풀 수 있는 기술
## CRY2 and CIB1 : 빛을 비추면 oligomerize된다

## 3개의 key components
1. Anchor : genome에서 binding할 수 있는 binding site CIBN+deepcas9
2. Target : guide RNA
3. Bridge : CRY1

## Zip462의 loop를 형성
- engineered looping
- endogeneous looping을 줄였다.

## Target gene의 transcription
single molecule RNA FISH
- LADL에서 target gene의 transcription을 높인다.

# Expanding loop engineering to domain
## Fragile X syndrom : 환자 샘플에서 도메인이 완전히 사라지고, compartment가 뒤바뀐다
### 문제점 : Domain이 어떻게 생겼는지 모름
- domain을 유도해보면 어떨까? Domain은 compartment를 의미??


# Science
## Viral genome integration into host (chromosome을 hiC해서, viral genome integration을 했을 때 domain이 변화된다)
- plaid pattern
- 단백질이 아닌 곳의 

## Cell cycle에서 genome structure가 어떻게 변화되는지
- degron knockdown을 했을 때, structure protein의 genome binding에 영향을 미치지 않을까?

- enhancer의 한쪽에 2개 anchor
- 
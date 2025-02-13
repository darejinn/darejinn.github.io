---
title:  "[KAIST WURF]0108 Meet the Professer : 박종은 교수님" 
excerpt: ""

category:
  - KAIST_WURF
tag :
  - [일지]

toc: true
toc_sticky: true
 
date: 2025-01-08
last_modified_at: 2025-01-09
comments: true
---

---
박종은 교수님의 WURF Meet the Professer 강의를 바탕으로 정리하였습니다.
{: .notice--info}

# Introduction

| ![Image](https://lh3.googleusercontent.com/duxnMrOhVupGWhfd4a_5IuBy7SQI9E8_RqC9MMxvcekUV4Bti6lNDfqK_TSFGyVZX1naigVH3hl-qIeMKSOsM1aXeAsvHQwJgxbSvtgzE35HhdWK=w1280) | 
|:--:| 
| 박종은교수님 lab site ([사이트 링크](https://sites.google.com/view/scmglkaist)) |
카이스트 박종은 교수님의 연구실인 Single-Cell Medical Genomics Laboratory는, single-cell data를 바탕으로 각 세포들의 유전체와 상호작용을 분석하여, 궁극적으로 사람을 이해하고자 목표하는 연구실이다. 크게 아래와 같은 세 가지를 research theme으로 하고 있다.

> 1. Integrative single-cell data analysis : 다앙햔 source의 single cell data를 통합적으로 이해하는 분석 방법 개발
> 2. Single-cell genomics as new diagnostic tool for complex immune disease : 면역 질환과 면역 반응을 single-cell genomics로 이해
> 3. Understanding development and ageing from the integrated cell atlas : 발달과 노화 과정을 single-cell genomics로 이해



# Personal Research History

교수님의 연구관과, 카이스트 의과학대학원에 오신 배경을 설명하셨다. 논문을 내는 것이 가장 인정받는 성과인 연구자의 삶을 살다 보면, 항상 '내 연구가 언제든 다른 사람에 의해 먼저 발표될 수 있지 않을까?'는 불안감에 시달리기 마련이다. 교수님께서는 Sanger 연구소([사이트링크](https://www.sanger.ac.uk/))에서 여러 명이 하나의 가치를 추구하는, 경쟁이 아닌 협력하는 환경을 접하셨고, 협력의 가치를 실감하셨다. 그리고 카이스트 의과학대학원 역시 비슷한 분야의 여러 교수님들께서 협력과 디스커션을 통해 공동의 가치를 창출해낸다는 점에서 연구자로서 참 좋다고 말씀하셨다.


## SCAID
보통 대부분의 교수님들께서는, 박사후 연구원 과정, 혹은 박사 과정에서 계셨던 연구실의 연구에서부터 연구를 시작하시는 편이다. 
Single Cell Atlas of Immune Diseases (SCAID) project는, 자가면역질환과 감염질환 등 면역 관련 질환에 관한 통합적인 세포 간 관계를 맵핑하는 것을 목적으로 디자인된 대규모 프로젝트이다.
([사이트 링크](https://www.scaid.org/))
<br>

# Encoding and decoding the Human tissue ecosystem

교수님의 연구 비전을, 트랜스포머 구조의 인코더와 디코더를 차용하여 설명하셨다. 

교수님께서는 결국 organism을 아래와 같은 두 과정을 통해 이해하여, in vitro human body를 종국에 만드는 것을 목표하신다.
> 1. organism의 발현 정보를 single-cell spatial multi-omics 정보를 분석하여 인코딩
> 2. 인코딩된 정보를, perturbation(세포에 인위적으로 변화를 가하고 인과관계를 찾는 것) 과정으로 디코딩하여 목적하는 organism을 생성

## Encoding(Human cell atlas의 현재)
## Human digital twin 

multiscale gene regulatory network

- intracellular > intercellular > multiorgan의 multiscale

## 세포 단위의(single cell) 기술
- 하나하나의 cell은 컴퓨터와 같다
- intercellular : spatially resolved transcriptom을 single cell 단위에서 분석해서 데이터화할 수 있다, 그러나 데이터를 만드는 것에 돈이 많이 든다(cell 하나하나마다 rna seuencing을 해야 함)
  - 교수님 : 우리는 data integration을 해야겠다!
    - toy example : 'tumor' => 장기마다 다양(heterogenety)
      - '하나의 암에 대해 missi하게 분석하자' => 췌장암 : immunotherapy가 되지 않는 이유는, cell 간의 interaction 때문이었다!
      > is it generalizable to other cancer?

## Co-occurrence analysis : 어떤 세포들이 같이 관찰되는가?

https://www.nature.com/articles/s41467-024-48310-4
- tumor에서만 나타나는 hot immune gene programs가 나타날 경우, 예후가 좋다

## web crawling based public data collection
1. cell type를 annotation
2. 피의 data를 clustering => 한 cluster에 모여 있는 질환을 보고, cell을 보면 => 해당 질환들이 공유하는 cell의 특징을 알 수 있지 않을까?, 치료제를 공유할 수 있지 않을까?
3. tissue phenotypes를 clustering => 다른 장기 간에도, 질환들이 공유하는 특징적 cell을 알 수 있지 않을까?

## 노가다
1. 논문을 읽어야 함
2. '여기있는 사람들이 아무도 안할 것 같지만, 할 수 있겠는데?'
> 노가다를 통해서 얻은 정답지로 누구보다 빨리 좋은 모델을 만들 수 있다.

# AI
- AI가 발달하는 시대에 우리가 왜 생물학을 연구해야하지?
- AI에게 '단군'이 될 수 있지 않을까?
- brain machine interface를 

## AI가 못하는 게 무엇일까?
- decoder : perturbation space !



# Perturbation encoding(AI가 할 수 없는 것)
- Perturbation space를 mapping => combinatiorial screening is possible!


## 야마나카의 fibroblast를 재현해보자
- transcription factor를 때려넣어서 fibroblast를 만들 수 있지 않을까?

## 사람의 몸을 어떻게 만들지?
> developing human imune organoids

1. self growing database by AI
2. Immune organ을 구현하는 것! 

> 메일을 보낼 떄 한번은 답장을 잘 안하고, 두번은 답장하신다~!!


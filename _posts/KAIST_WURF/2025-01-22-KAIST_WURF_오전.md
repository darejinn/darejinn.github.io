---
title:  "[KAIST_WURF]0122 카이스트 김지훈 교수님" 
excerpt: ""

category:
  - KAIST_WURF
tag :
  - [일지]

toc: true
toc_sticky: true
 
date: 2025-01-21
last_modified_at: 2025-01-21
comments: true
---

---
카이스트 김지훈 교수님의 WURF meet the professor 강연을 정리하였습니다.
{: .notice--info}
---


# <span style="background-color:LightBlue; font-size:110%">Introduction : Genome in 4-dimentional world

| ![Image](https://lh6.googleusercontent.com/xM-nAWrFYw7hLRiDAA5XqjcxtoOxEYDN1REyNGYIfEQPCYmi07Zb0-pRukeiPGPSEr-0FPhMCt55a72kaOT0mFgq8QDQSbBwB4Uk5OR5Q5nIoyyedLYJLMOEHhHZZ9uR8w=w1280) | 
|:--:| 
| 김지훈교수님 lab site ([사이트 링크](https://jihunkim.kaist.ac.kr/)) |
{: .center}


> 3차원 공간의 genome structure을 연구하는 연구실이다! 3차원 공간 + 시간

## <span style="font-size:90%">Time axis
- Cell cycle, 질병의 진행에 따라서 어떻게 달라지는지

<br>
<br>

# What does Ph.D means?
Doctor of Philosophy : 생각하는 끝에 있는 사람
박사학위의 목적 : Advise 없이 independent researcher가 될 수 있게 training을 받는 것이 Ph.D이다
- Communication의 정점이 Publication이다(계단식으로 감)

## Tip of Iceberg
- 사람에 대한 실패, 연구에 대한 실패, 부모님에 대한 실수, 교수님에 대한 실수
- 어떤 실패이든, persistence를 갖고 정진하는 것이 중요하다

# 3차원 후성유전학
## 3D epigenetic mechanisms
계층적 구조를 이룬다.
fiber > looping interactions > sub-TAD > TADs > Compartments > Chromosome territories

Paulson et al 1977 Cell : 화학적인 방식으로 히스톤 단백질을 제거하자, chromosome의 fiber들이 다 헝클어졌지만, 그럼에도 mitotic scaffold를 유지하더라
=> 다양한 단백질들이 network를 이루는 scaffold이더라! (condensin 1, condensin 2, Topo2...) : interphase에서도 기능하는, 구조를 만드는 protein이다

## loop extrusion model
IGB, UCSC genome browser => 일자로 펼쳐져 있는 genome, 그러나 멀리 떨어져 있는(500bp 이상) gene과 enhancer이 loop를 이루면서 가까이 interaction을 한다.
> Job Dekker
cohesin cannot pass CTCF : structure protein binds => loop가 뭉쳐지면서 domain이 만들어진다

## Hi-C
Chromosome-conformation -capture-carbon-copy(5C)... => 특정 protein으로 organize되는 양상을 관찰
- 5C는, 내가 원하는 sequence를 high resolution으로 볼 수 있다.
- hiC는 whole genome으로 볼 수 있다.

## Hi-C 실험 과정
0. 포름알데하이드로 고정
1. Restriction enzyme digest, 각 fragment에 stiky end가 존재하게 된다
2. 다시 digest한 아이를 ligase하여, long-range interaction하고 있는 gene과 enhancer가 붙게 된다 => 5C template이 된다.
3. 5c primer : restriction enzyme을 바라보는 방향으로 Universal tail(각각의 프라이머가 공통으로 갖고 있는 시퀀스 T7 primer, T5 primer)+genomic sequence(restriction enzyme 근처 서열)
4. ligase된 100bp 정도의 서열을 amplify시키면, ligase된 부분이 enrich된다
5. 데이터 분석 : 3차원 구조를 이차원의 matrix를 만든다

## Analysis 과정
1. Binning(보통 4bp로) : 칸이 있는 2차원의 matrix를 만든다.
2. 센 숫자들을 쓴다 => diagonal은 가장 높은 숫자를 가질 수밖에 없다, 대칭적 구조이다, 대각선이 아닌 다른 곳에 높은 숫자를 갖는 곳이 interaction을 하는 부위이다
3. Hi-C는 특정 region을 선택적으로 enrich하지 않고, whole genome을 sequencing한다

4가지 야마나카 factor 중 하나인 Sox2 : loop가 만들어지는 whole marker
ES cells => NPC => iPSC로 다시 reproduce를 하자, Sox2-Enhancer Interaction은 다시 돌아옴. 그러나 Sox2 Expression은 일어나지 않음.(transcription과 loop 사이의 관계는 있으나 반드시 동치인 건 아니다)
> Beagan et al 2020 Nature Neuroscience : 시간이 지남에 따라서 loop가 생성되다가, 사라짐 => transcription이 이루어지는 데에 시간이 걸림

> Gibcus and Damejima st al 2018 Science : condensin이 mitosis에서 작용할 때, 2는 항상 genome에 binding, 1은 mitosis 시기에 작은 loop를 만든다
Bill Earnshaw at Kaist [link] https://www.youtube.com/watch?v=qjfIe1BA3xs

## loop를 engineering할 수 없을까?
1. ahchor L deepCas9, CIBN L : forms the base of the loop
2. Target : specific genomic fragments
3. Bridge

https://starlibrary.org/research/laboratoryDetail?mngNo=384


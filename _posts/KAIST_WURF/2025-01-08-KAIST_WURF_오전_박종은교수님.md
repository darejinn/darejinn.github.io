---
title:  "[KAIST WURF]0108 카이스트 박종은 교수님" 
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
박종은 교수님의 WURF Meet the Professer 강의를 바탕으로 정리하였습니다.
{: .notice--info}

# Introduction

| ![Image](https://github.com/user-attachments/assets/361eb182-9360-4d07-ba46-230a9b08825a) | 
|:--:| 
| 박종은교수님 lab site ([사이트 링크](https://sites.google.com/view/scmglkaist)) |

카이스트 의과학대학원 박종은 교수님의 연구실은 single-cell 데이터를 바탕으로 각 세포의 유전체 및 상호작용을 심층적으로 분석하여, 궁극적으로 인간이라는 복잡한 시스템을 이해하고자 하는 비전을 갖고 있다. 연구는 다음과 같은 세 가지 큰 주제를 중심으로 진행된다.

> 1. Integrative single-cell data analysis
> 다양한 출처에서 생성된 single-cell 데이터를 통합적으로 이해하고 분석하는 방법론을 개발한다.
> 2. Single-cell genomics as a new diagnostic tool for complex immune diseases
> 자가면역질환, 감염질환 등 면역질환과 면역 반응을 single-cell genomics 접근법으로 파악하여 진단 및 치료적 가능성을 모색한다.
> 3. Understanding development and ageing from the integrated cell atlas
> 생체 발달 및 노화 과정을 single-cell genomics 관점에서 해석하고, 이를 바탕으로 세포 수준의 변화 양상을 체계적으로 이해하고자 한다.





# Personal Research History

교수님의 연구관과, 카이스트 의과학대학원에 오신 배경을 설명하셨다. 논문을 내는 것이 가장 인정받는 성과인 연구자의 삶을 살다 보면, 항상 '내 연구가 언제든 다른 사람에 의해 먼저 발표될 수 있지 않을까?'는 불안감에 시달리기 마련이다. 교수님께서는 Sanger 연구소([사이트링크][sitelink])에서 여러 명이 하나의 가치를 추구하는, 경쟁이 아닌 협력하는 환경을 접하셨고, 협력의 가치를 실감하셨다. 그리고 카이스트 의과학대학원 역시 비슷한 분야의 여러 교수님들께서 협력과 디스커션을 통해 공동의 가치를 창출해낸다는 점에서 연구자로서 참 좋다고 말씀하셨다.


보통 대부분의 교수님들께서는, 박사후 연구원 과정, 혹은 박사 과정에서 계셨던 연구실의 연구에서부터 연구를 시작하시는 편이다. Single Cell Atlas of Immune Diseases (SCAID) project는, 자가면역질환과 감염질환 등 면역 관련 질환에 관한 통합적인 세포 간 관계를 맵핑하는 것을 목적으로 디자인된 대규모 프로젝트이다. 본 프로젝트를 시작으로, 교수님께서는 single cell에 관한 연구를 시작하셨다.
([사이트 링크](https://www.scaid.org/))
<br>

# Encoding and decoding the Human tissue ecosystem

교수님의 연구 비전을, 트랜스포머 구조의 인코더와 디코더를 차용하여 설명하셨다. 


교수님께서는 결국 organism을 아래와 같은 두 과정을 통해 이해하여, in vitro human body를 종국에 만드는 것을 목표하신다.


## Encoding
> Single-cell spatial multi-omics 정보를 통해 인간 유기체(organism)의 세포 및 발현 정보를 체계적으로 인코딩

이미 전 세계적으로 Human Cell Atlas 프로젝트가 진행 중이며, 다양한 유형의 single-cell 데이터가 축적되고 있다. 연구실에서는 이러한 데이터를 효율적으로 통합·분석하기 위한 data integration 방법론을 개발하고 적용하는 데 집중하고 있다.

> ex. web crawling 기반 data collection 방법론
> 1. Cell type annotation: 다양한 공개 데이터베이스에 산재한 single-cell 데이터를 모아서, 세포 타입 정보를 일관성 있게 주석(annotate) 처리한다.
> 2. 질환별 데이터 클러스터링: 특정 클러스터에 모여 있는 질환들이 공유하는 특징적인 세포 유형(cell)을 발굴하여 공통된 치료 전략을 도출할 가능성을 모색한다.
> 3. 장기(tissue) 단위 클러스터링: 서로 다른 장기에서도 질환들이 공유하는 특징적 세포가 있는지를 파악한다.

## Decoding
> 인코딩된 정보를, perturbation(세포에 인위적으로 변화를 가하고 인과관계를 찾는 것) 과정으로 디코딩하여 목적하는 organism을 생성

'다가오는 시대에 AI가 할 수 없는 것이 무엇인지 고민해야 한다'라는 질문에서, 이야기를 시작하셨다. AI는 데이터로부터 패턴을 학습하는 데는 능하지만, 새로운 조건(perturbation)을 설계하고 적용하는 부분은 인체에 대한 심층적 이해가 필요하며 이는 아직 연구자의 영역이라고 말씀하셨다. Perturbation space를 성공적으로 매핑하려면 실제 실험(실증 데이터)과 생물학적 지식이 반드시 결합되어야 한다.

<br>

# Additional Comment

WURF 강의가 대부분 그러하듯, 교수님께서도 강의 중간중간 연구자로서의 마음가짐과 가치관에 대해 말씀하셨다. '생물학적 정보를 체계적으로 인코딩해서, 원하는 유기체를 결국에 디코딩하겠다'는 큰 틀의 비전을 갖고 하위 연구들을 가지치듯 뻗어나가는 교수님의 방식이 인상깊다. 데이터를 일일이 수집하고 실험하는 지난한 과정들을 내실 있게 수행하면서도, '이 연구를 왜 해야 하는가'를 잊지 않는 것이 필요하겠다고 생각했다.
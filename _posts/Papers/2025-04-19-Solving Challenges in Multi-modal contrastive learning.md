---
title: Solving Challenges in Multi-modal Contrastive Learning
date: 2025-04-19
last_modified_at: 2025-04-19
category:
  - Papers
tags:
  - Multimodal AI
  - Contrastive Learning
toc: true
toc_sticky: true

comments: true
---

---

# Introduction
‘다른 modality’는, 단순히 ‘다른 내용’을 의미하지 않는다. 내용뿐만 아니라 담긴 정보의 수준과 층위가 아예 다르기 때문이다. 가령, ‘예쁜 강아지’라는 글에서의 ‘강아지’가 갖는 해석 가능성이 다양하고 포괄적인 정보와, 강아지 사진에서 ‘강아지’의 확정적인 생김새가 주는 정보를 상상하면 직관적으로 이해가 될 것이다.

따라서, 다른 modality의 정보 사이의 유사성을 비교하는 contrastive learning의 과정에서는 individual modality의 정보가 손실되는 등의, 제대로 align하지 않아 생기는 여러 문제가 존재한다. 

이에, CLIP loss가 제안된 이후 multi modal contrastive learning의 문제점들과, 이를 해결하고자 등장한 방법론 3개를 정리하고자 한다. 구체적인 evaluation 과정보다는, 논문의 아이디어를 중심으로 전개하겠다.

<br>
<br>

# Remaining Challenges

## 1. Heterogeneity Gap

---

두 모달리티를 align하는 데에 있어서,  modality의 이질성(heterogenity gap)을 고려해야 한다. 각 모달리티 이질성을 고려하지 않고 형식적인 align을 수행하면, 모델이 일부 중요한 정보를 놓치거나(underalignment), 반대로 중복되거나 무관한 정보를 혼동하게(overalignment) 만들 수 있다. 결과적으로 멀티모달 대조 학습의 근간인 양 modalities 간 semantic support가 약화되어, 최종 표현 학습의 효율이 떨어지게 된다. 두 가지 heterogenity gap을 생각해볼 수 있다.

### **1.1. 추상화 레벨의 불일치(granuality mismatch)**

멀티모달 데이터에서 서로 다른 modality는 서로 다른 의미/표현 수준의 정보를 전달한다.
<p align="center"><img src="https://github.com/user-attachments/assets/a5163cf8-4d8f-4ae6-ba0e-cfe9d0a0630a" width="600"/><br><em>이미지와 텍스트의 추상화 레벨 불일치</em></p>

예컨대 오른쪽 강아지 이미지의 경우, 해당 이미지는 "웃고 있는 개"라는 상위 개념뿐만 아니라 품종, 털 색상, 크기, 형태 등 다양한 하위 수준의 속성을 포함하고 있다. 반면, "잔디밭에서 웃고 있는 개"라는 텍스트 설명은 일반적으로 더 추상적이고 압축된 정보만 담고 있다. 이러한 불일치는 멀티모달 대조 학습 과정에서 서로 다른 수준의 의미를 동등하게 맵핑하기 어렵게 만든다. 특히 시각적으로 표현된 하위 속성(예: 털의 질감, 표정 등)이 텍스트 캡션에서 직접 언급되지 않으면, 대응되는 의미를 찾지 못해 학습이 불안정해질 수 있다.

### **1.2. 구조적 이질성**
<p align="center"><img src="https://github.com/user-attachments/assets/bd264feb-149f-47ea-b62f-af6f9798f03a" width="600"/><br><em>이미지와 텍스트의 처리 방식</em></p>
이미지를 작은 패치 단위로 나누어 특징을 추출하는 방식과, 텍스트를 토큰(단어·문장 등) 단위로 나누는 방식 간에는 불가피한 구조적 차이가 존재한다. 

- 합성곱 신경망(CNN)이나 비전 트랜스포머(ViT)를 통해 처리되는 패치는 픽셀 값의 2D 그리드로 구성되어 있으며, 공간적 관계와 질감 정보를 포함한다.
- 텍스트에서 BERT나 GPT와 같은 언어 모델로 처리되는 순차적인 토큰은, 문법적 구조와 의미론적 관계를 포함한다.

CLIP(Contrastive Language-Image Pre-training)과 같은 초기 모델들은 이미지와 텍스트를 매칭하여 관계를 학습하나, 이러한 모델들은 시각적 패치와 텍스트 토큰을 집계하여 표현할 뿐, 동일한 세밀도 수준에서 시각적 및 의미적 개념을 명시적으로 정렬하지 않는다. 이를 단순 병렬로 처리하거나 동일 차원으로 맞추는 것만으로는 세밀한 의미 정렬이 보장되지 않는다. 

## 2. 결측 모달리티(Missing Modality) 문제

---

멀티모달 모델을 응용하는 실제 상황에서는 이미지 또는 텍스트가 일부 누락된 상태로 데이터를 받는 경우가 빈번하게 발생한다. ‘다양한 모달리티’를 복합적으로 고려하여 풍부하고 정확한 해석을 하고자 만든 모델인데, 오히려 모달리티의 다양성이 제약조건을 만들어버리는 것이다. 결측 상황은 단순한 예외적 상황으로 치부해버리기엔 너무나 보편적인 문제이기에, 멀티모달 시스템이 필수적으로 해결해야 하는 과제로 여겨지고 있다.

가령, 아래와 같은 상황이 있을 수 있겠다.

- 이미지는 있지만 그에 대한 텍스트 태그나 캡션이 없는 경우
- 멀티모달 센서 네트워크에서 특정 센서의 일시적 장애로 인한 데이터 결측
- 의료 진단 시스템에서 특정 검사 결과의 부재

**학습 시에는 모든 모달리티 정보를 이용할 수 있으나, 추론 과정에서는 특정 모달리티가 결측되는 현상(train-inference discrepancy)은 모델의 일반화 성능을 크게 저하시킬 수 있다.**

"[CVPR 2020] Gradient-Blending: Learning Modalities with Varying Rates"의 내용을 바탕으로 살펴보면, 학습된 모델은 특정 모달리티(특히 많은 정보가 있는 모달리티)에 의존하는 편향을 보일 수 있으며, 이러한 편향은 해당 모달리티가 결측되었을 때 성능이 급격히 저하되는 현상으로 이어진다. 해당 논문에서는 일부 멀티모달 모델은 단일 모달리티 입력 시 성능이 무작위 추측 수준으로 떨어지는 현상을 관찰하였다. 

<br>
<br>

# Solving Challenges in Multi-Modal Contrastive Learning

모달리티별 이질적인 표현을 공유 reprentation space에 정렬하고, missing modality의 문제를 다루는 시도들은 꾸준히 이루어지고 있다. 가령 각 모달리티의 확률 분포를 추정하는 VAE 기반 방법, 이산 표현(코드북)을 사용하는 벡터 양자화(VQ) 기반 접근법 등을 들 수 있겠다. 본 글에서는, **contrastive learning** 으로 학습하는 모델 구조를 큰 틀에서 변경하지 않고, 위 문제들을 해결하고자 시도한 논문 세 편의 방법론을 정리한다. 세 논문 모두 **공통의 latent space에서의 representation align** 을 목표하며, 세번째 논문은 missing modality의 문제를 함께 다룬다.

## 1. Unified Multi-modal Training (Intra- & Inter-modal Similarity Preservation)

---

> [ICML 2022] Multimodal Contrastive Training for Visual Representation Learning
> 


💡**핵심 아이디어 : 통합 학습 프레임워크(Unified Training Framework):**

- *Intra-modal Training Path*를 통해 각 모달리티 내에서 data augmentation에 의한 self-supervised 학습을 수행하며, intrinsic data properties를 최대한 보존한다.
- *Inter-modal Training Scheme*를 통해 이미지와 텍스트 등 서로 다른 모달리티 간의 cross-modal interactions를 강화하여, 공통 semantic space 내에서 유사도를 보존하도록 학습한다.


### 1.1. Objective

본 논문에서는, 이미지와 텍스트 데이터를 바탕으로, visual representation을 학습하는 것을 목표한다. 논문에서 강조하는 점은 cross-modal correlation을 배우는 것을 넘어서서 각 modality의 intrinsic data property를 unified framework로 최대한 끌어낸다는 것이다. (저자들은 similarity preservation이라고 표현한다.)

<p align="center">
  <img src="https://github.com/user-attachments/assets/39bcfe24-3340-4ba4-939f-d6e7148e6f20" width="600"/>
  <br>
  <em>(d)가 논문의 방법으로, 2번/3번과 같은 modality 안 학습과, 4번/5번과 같은 modality 사이 학습을 동시에 진행한다.</em>
</p>


### 1.2. Method
<p align="center">
  <img src="https://github.com/user-attachments/assets/ed297e33-d92b-4819-8140-3999234764da" width="600"/>
  <br>
  <em>위 그림에서, 주황색과 초록색이 modality 내 학습을, 노란색과 초록색이 modality 간 학습을 의미하며, 각각 다른 constrasive loss를 사용한다.</em>
</p>

1. **Modality 내 학습 : MoCo-v2 framework**
    
    본 논문에서는, modality 내의 unsupervised visual representation learning을 위해 **Momentum Contrast(MoCo)**라는 방법을 차용한다. 
    


    
    > **Momentum Contrast(MoCo)**
    > Xinlei Chen, Haoqi Fan, Ross B. Girshick, and Kaiming He. Improved baselines with momentum contrastive learning.
    > <p align="center"><img src="https://github.com/user-attachments/assets/d0640ca8-66e2-4fad-a89f-7a5b97be6d09" width="600"/><br><em>MOCO</em></p>
    > 
    > 이미지는 각 픽셀이 연관되어 있고, 고차원이기에 tokenized word dictionary와 같이 구조화된 dictionary를 만들 수 없다. 따라서 dynamic dictionary (동적사전)가 필요한데, MoCo는 이 사전을 <크고, 안정적으로> 만드는 방법으로 제안되었다.
    > - key는 데이터(이미지, patch 등)에서 sampling을 한 후 momentum encoder를 통해 표현이 된다.
    >   - ‘momentum encoder’이라고 이름붙여진 이유는 다음과 같다.  key를 만들어내는 encoder가 빠르게 학습이 되면 representation이 빠르게 바뀌기 때문에 이전에 dictionary의 key들이 다 소용이 없어지게 된다. 그렇기 때문에 momentum을 이용해 조금씩 변화를 주어서 한번에 큰 변경이 없게 만들어 학습을 안정적으로 진행한다.
    > - query encoder는 momentum encoder과 달리 적극적으로 학습된다. query는 matching 되는 key와 가깝고, 다른 key와는 다르게 constrasive learning이 이루어진다.
 
    
    저자들은 기존 MoCo에서 text encoder/text momentum encoder를 추가로 도입하고, tag information을 loss에 추가하여 high-level concept의 pattern도 학습하게 하였다.
    
2. **Modality 간 학습 : common space mapping + contrastive learning**
    
    크게 특별할 것 없이, 이미지(CNN 기반)와 캡션(Bert-like transformer 기반)을 각각 **독**립적인 MLP projection head를 통해 공통 공간으로 매핑한 뒤, 양방향 contrastive loss를 설계한다.
    
    - Image-to-Caption: 이미지 표현과 대응하는 캡션 표현의 유사도를 높이고, 나머지 음성 샘플들과의 유사도는 낮춤.
    - Caption-to-Image: 캡션 표현과 대응하는 이미지 표현의 유사도를 높이고, 나머지는 낮춤.

## 2. Finite Discrete Tokens (FDT)

---

> [CVPR2023] Revisiting Multimodal Representation in Contrastive Learning: From Patch and Token Embeddings to Finite Discrete Tokens

💡**핵심 아이디어 : Finite Discrete Tokens (FDT):**

- 학습 가능한 일정 수의 discrete tokens를 사전의 단어들마냥 도입하고, 이미지와 텍스트 모두를 동일한 FDT 집합의 sparse attention-based aggregation으로 표현한다.
- 기존 [이미지 패치의 가중합]과 [단어 토큰의 가중합]의 유사도 비교 대신 [FDT의 가중합 1]과 [FDT의 가중합 2]의 유사도 비교를 함으로써
  1) FDT라는 같은 granuality에서의 비교
  2) 두 모달리티의 진정한 의미론적 비교
  를 가능하게 한다.
    

### 2.1. Objective
<p align="center"><img src="https://github.com/user-attachments/assets/d3e1a253-7590-4858-983d-b7811a7bc1df" width="600"/><br><em>오른쪽이 논문의 방법이다.</em></p>


저자들은, CLIP 기반 모델에서, cross-modal information을 두개의 독립적 인코더로 인코딩한 뒤 바로 similarity를 비교하는 방식의 한계를 지적한다. 두 representation의 granualities(세밀한 정도)가 다르기 때문이다. 저자들은 같은 level의 granuarity를 가지는 정보 간 contrasive learning을 수행하는 것을 목표한다. 이를 위하여 본 논문은 두 information의 정보들을 각각 FDT라는 공통된 토큰집합을 매개로 표현한 뒤 학습을 수행한다.

### 2.2. Method
<p align="center"><img src="https://github.com/user-attachments/assets/82da74c5-b3bb-4c16-abf9-f16e18538c7e" width="600"/><br><em>전체 framework(왼), FDT based Feature generation 방법(오)</em></p>



FDT를 이용해서 두 modality의 granuality를 맞추어 contrasive learning을 수행하는 방법은 위 모식과 같다. FDT(Finite Discrete Tokens)는, 왼쪽 가운데에 표현된 노란색 토큰들의 집합이다. 이 토큰들을, 사전의 단어들이라고 생각할 수 있다. Image의 FDT based Feature를 구하는 것은, 결국 이 동적 사전의 단어들의 가중합으로 이미지를 표현하는 것을 의미한다. 방식은 아래와 같다.

  a. 먼저, 패치와 FDT 간의 내적 계산으로 N개의 패치가 FDT들과 얼마나 유사한지 나타내는 attention matrix가 구해진다.(오른쪽 가운데 회색 matrix) 이때 각 패치를 query, FDT를 key라고 볼 수 있겠다. 

  b. Max pooling을 통하여, C개의 FDT 각각이 이미지와 얼마나 유사한지의 유사도를 구한다.

  c. FDT의 토큰들을 앞서 구한 유사도를 가중합하여 최종적으로 FDT based Feature를 구한다. 

이렇게 구해진 FDT based image Feature, FDT based text Feature간 contrasive learning을 수행한다.

FDT는 각 이미지 패치와, 텍스트 토큰이 의미를 알려주는 prior knowledge의 기능을 수행한다. 이때 유의해야 할 것은, 결국 학습의 궁극적 목적은 text encoder, image encoder가 각각 유의미한 representation을 인코딩하게 학습되는 것이며 FDT는 이를 도와주는 역할이라는 것이다. ***Text FDT grounding, image FDT grounding 자체가 나중에 쓰이는 건 아니다.***

## 3. Geometric Multimodal Contrastive (GMC)

---

> [ICML 2022] Geometric Multimodal Contrastive Representation Learning

💡 **핵심 아이디어 : Geometric Multimodal Contrastive Loss**

- 전체 모달리티가 존재하는 **complete observation**과, **결측(modality missing)된 상황의 representation을 서로 가까이 정렬**하도록 기하학적으로 학습하는 novel한 loss를 설계하였다.

### 3.1. Objective
<p align="center"><img src="https://github.com/user-attachments/assets/2ff01865-2532-4fc9-9cce-5a38b4ac5b8d" width="600"/><br><em>가운데의 Z1:2가 complete modality representation이다.</em></p>


해당 논문은, modality의 종류나 개수를 한정짓지 않는 새로운 프레임워크를 제안한다. 저자들은 **1) modality 간 hetrogenity gap 2) missing modality 문제를 동시에 해결하는 것을 목표**한다.

이를 위하여 모달리티 특이적 encoding만을 진행하는 기존 방법과 달리 모든 모달리티가 통합된 **complete modality representation을  추가로 도입하여, 공통 공간에서 align한다.**

### 3.2. Method
<p align="center"><img src="https://github.com/user-attachments/assets/e13866ea-b5dd-4b5a-973a-1c1a1d32d974" width="600"/><br><em>전체 framework</em></p>


**a. Two-level Architecture**
    - *Modality-specific Base Encoders*를 이용해 각 모달리티와 complete-modality를 고정 차원의 intermediate representation으로 변환한다. (위 그림의 f)
    - 이후, *Shared Projection Head*를 거쳐 모든 모달리티를 공통의 latent representation space로 매핑한다. (위 그림의 g)

**b. Geometric Multimodal Contrastive Learning**

- contrastive learning은, 위 그림의 공통된 임베딩공간(점선 박스)에서 수행된다.
- 각 modality의 표현 $z_m$이 동일한 샘플의 complete representation인 $z_{1:M}$과는 가깝도록(위 그림의 빨강/파랑 실선), 다른 샘플의 표현들과는 멀어지도록(위 그림의 점선) 학습한다.

이러한 geometric alignment는, 각 modality가 스스로 complete representation과 의미관계가 가까워지도록 학습하기 때문에, **결측 modality가 존재해도 남은 modality만으로도 충분히 전체 의미를 유추할 수 있는 표현을 생성할 수 있게 된다.**

또한, modality의 fusion이 강제되는 기존 방식과 달리, 각 modality가 독립적으로 학습되어 전체 의미공간으로 연결되므로, modality의 종류/개수가 자유롭다는 점도 위 두 논문과의 차이점이다.

<br>
<br>

# To sum up…

본 글에서는 멀티모달 모델에서 modality 간 이질성(heterogeneity gap)과 **결측(modality missing)** 문제에 대응하고자 제안된 세 가지 방법론을 살펴보았다.

- 첫 번째로 소개한 **Unified Multimodal Training**은 intra-modal과 inter-modal 학습 경로를 동시에 학습하는 통합 프레임워크를 통해, modality별 intrinsic property를 보존하면서도 공통 표현 공간에서의 정렬을 유도한다.
- 두 번째 방법인 Finite Discrete Tokens (FDT)는 이미지와 텍스트의 표현 granularity 차이를 해결하고자, 양 modality 모두를 학습 가능한 고정된 토큰 집합(FDT)으로 표현하여 더 정밀한 의미 수준에서의 정렬을 가능하게 한다.
- 마지막으로 Geometric Multimodal Contrastive (GMC는 complete modality representation과 partial modality representation 간의 기하학적 정렬을 통해, modality 수나 조합, 결측상황에 구애받지 않는 유연성을 제공한다.

이들 방법론은 모두 기존 contrastive learning의 개념을 유지하면서도, align하는 대상과 방법울 다르게 하여 견고한 멀티모달 representation learning을 목표하였다는 점에서 특징적이다.  앞으로의 멀티모달모델이 더욱 다양한 입력 조건과 복잡한 의미 관계를 다루게 될 것을 고려할 때, 이와 같은 새로운 방법론은 더욱 중요한 연구 방향이 될 것으로 기대한다.

[정리](https://www.notion.so/1d50175a0e2d8074963efe10e8ab1b6f?pvs=21)
---
title: Two approaches of embedding nodes

date: 2025-08-11
last_modified_at: 2025-08-11
category:
  - Graphs
tags:
  - Graphs
  - Representation learning
toc: true
toc_sticky: true
comments: true
published : false
---

---


# Introduction

앞선 글에서 설명했듯, Graph Representation **Learning**은 그래프의 요소(노드, 엣지, 서브그래프)를 저차원 벡터로 매핑하는 일이다. 많은 survey가 여러 요소 중에서도 **node embedding**에 초점을 맞추는 이유는 다음과 같다.

1. **Edge/Subgraph 임베딩이 node 임베딩의 후처리로 귀결**되는 경우가 많다.  
   
   예를 들어 
   - 엣지 $(v_i,v_j)\in E$에 대해 노드 임베딩 $\mathbf{z}_i,\mathbf{z}_j$가 주어지면 hadamard/mean/weighted-L1·L2 같은 이항 연산으로

   $$
   \mathbf{z}_{(i,j)}=\mathbf{z}_i\odot\mathbf{z}_j
   $$

   처럼 엣지 임베딩을 만든다.  

   - 서브그래프 $\mathcal{G}[\mathcal{S}]$의 임베딩도 보통 $\mathcal{S}\subset\mathcal{V}$에 포함된 노드 임베딩을 집계(average/attention 등)해서 얻는다.
  
   $$
   \mathbf{z}_{\text{subgraph}}=\frac{1}{|\mathcal{S}|}\sum_{v_i\in\mathcal{S}}\mathbf{z}_i
   $$



2. Edge/Subgraph 임베딩을 **직접** 학습하더라도 절차는 **node 임베딩 학습과 본질적으로 유사**하다.  
   - 예를 들어 타깃 서브그래프의 모든 노드에 연결된 dummy 노드를 추가하고 그 노드의 임베딩을 학습 대상으로 두면 사실상 node embedding 학습과 거의 동일한 형태가 된다.

따라서 node embedding을 이해하면 edge/subgraph embedding도 같은 틀 안에서 상당 부분 설명된다. 이하에서는 **인코더를 어떻게 정의하는지**에 따라 node embedding을 **shallow embedding**과 **NN-based embedding**으로 비교해 정리한다. 본 글의 뼈대는 Jure Leskovec 외, *Representation Learning on Graphs* (2017)을 바탕으로 필자의 해석을 더해 재구성했다.

---

## Review : Learning framework

“그래프에서 가까운 노드는 임베딩 공간에서도 가깝다”는 **structural assumption**(구조 가정) 아래, 다음 세 가지를 설계한다.

- 그래프 상의 유사도 $s_G$
  
  $$
  s_G:\mathcal{V}\times\mathcal{V}\to\mathbb{R}^+,\qquad
  s_G(i,j)\in\{A_{ij},\ k\text{-hop},\ \text{랜덤워크 공출현확률},\ \text{Katz/RPR/Jaccard}\dots\}
  $$

- 임베딩 공간의 디코더 $\mathrm{DEC}$
  
  $$
  \mathrm{DEC}:\mathbb{R}^d\times\mathbb{R}^d\to\mathbb{R},\quad
  \text{예: }\ \mathbf{z}_i^\top\mathbf{z}_j,\ -\lVert\mathbf{z}_i-\mathbf{z}_j\rVert_2^2,\ \sigma(\mathbf{z}_i^\top\mathbf{z}_j)
  $$

- 인코더 $\mathrm{ENC}$와 loss function(learning objective)
  
  $$
  \mathbf{z}_i=\mathrm{ENC}(v_i),\qquad
  \mathcal{L}=\sum_{(i,j)\in\mathcal{D}}\ell\!\Big(\mathrm{DEC}(\mathbf{z}_i,\mathbf{z}_j),\ s_G(i,j)\Big)
  $$

여기서 **구조 가정**은 “무엇을 가깝게 유지할지”에 대한 inductive bias, 즉 **네트워크 구조에 관한 모델의 prior**다. $s_G$를 어떻게 정의할지(무엇을 ‘유사’로 볼지), $\mathrm{DEC}$를 어떻게 둘지(임베딩에서 유사를 어떻게 수치화할지), $\mathrm{ENC}$를 어떻게 설계할지(그 유사를 재현하도록 표현을 만들지)에 이 가정이 명시적·암묵적으로 들어 있다.

---

# Two approaches of embedding nodes

같은 $\mathrm{ENC}$–$s_G$–$\mathrm{DEC}$ 프레임 안에서 접근을 나눌 수 있다.

- **Shallow** : 미리 정한 $s_G$에 맞춰 **노드별 임베딩 자체**를 **직접** 최적화한다. 따라서 파라미터 수는 대략 $ O(|V|d)$이다.
- **NN(GNN)-based**: **유사도를 만들어내는 연산 자체**(메시지 패싱/오토인코더 등)를 학습해 임베딩을 **간접**적으로 만든다. 파라미터는 **노드 간 공유**된다.

즉, **학습이 일어나는 층위**가 다르다.

---

## 1. Shallow embedding

Shallow는 노드 ID를 임베딩 행렬의 열로 직접 매핑한다.

$$
Z\in\mathbb{R}^{d\times|\mathcal{V}|},\qquad \mathrm{ENC}(v_i)=Z_{\cdot i}=\mathbf{z}_i
$$

인코더가 단순하므로 “무엇을 보존할지”에 대한 선택이 거의 전적으로 $s_G$와 $\mathrm{DEC}$에 담긴다.

### 1-1. Factorization-based approaches

- **무엇을 보존할지($s_G$ 설정)**  
  
  $$
  S=A\ \text{(adjacency)},\qquad S=A^k\ (k\text{-hop}),\qquad S=\text{Katz},\ \text{RPR},\ \text{Jaccard}\ \text{등}
  $$
  
  $S$가 커뮤니티·근접성·전파 도달성 등 어떤 관계를 대표하는지에 따라 임베딩이 강조하는 구조가 달라진다.

- **임베딩에서 어떻게 읽을지(Decoder)**  
  
  $$
  \mathrm{DEC}(\mathbf{z}_i,\mathbf{z}_j)=\mathbf{z}_i^\top\mathbf{z}_j\quad \text{또는}\quad -\lVert\mathbf{z}_i-\mathbf{z}_j\rVert_2^2
  $$
  
  내적 기반은 계산이 단순하고 행렬분해로 자연스럽게 연결된다.
- **loss function(learning objective)**  
  
  $$
  \min_Z\ \lVert S-Z^\top Z\rVert_F^2
  $$
  
  **Laplacian Eigenmaps**는
  
  $$
  \sum_{i,j}W_{ij}\lVert\mathbf{z}_i-\mathbf{z}_j\rVert_2^2
  =2\,\mathrm{tr}(ZLZ^\top)
  $$
  
  을 최소화해 인접 노드가 가깝도록 한다(정규화/제약 포함). 이 목적은 “엣지가 강하면 임베딩 거리를 줄여라”라는 규칙을 직접적으로 구현한다.

### 1-2. Random walk-based approaches

- **무엇을 보존할지($s_G$ 설정)**  
  
  랜덤 워크로 생성한 시퀀스에서 **공출현 강도/확률**을 노드 유사도로 본다(윈도우 공존, PPMI 등). BFS/DFS 성향을 조절해 국소/원거리 문맥을 강조할 수 있다.
- **임베딩에서 어떻게 읽을지(Decoder)**  
  
  $$
  \mathrm{DEC}(\mathbf{z}_i,\mathbf{z}_j)=\mathbf{z}_i^\top\mathbf{z}_j
  $$
  
  로짓을 $\sigma(\cdot)$로 확률화해 “같이 등장할수록 내적이 커지게” 학습한다.
- **loss function(learning objective)**  
  
  $$
  \max_Z\sum_{(i,j)\in\mathcal{D}}\log\sigma(\mathbf{z}_i^\top\mathbf{z}_j)
  +\!\!\sum_{(i,j')\in\mathcal{D}^-}\!\!\log\sigma(-\mathbf{z}_i^\top\mathbf{z}_{j'})
  $$
  
  **DeepWalk**는 unbiased walk, **node2vec**은 하이퍼파라미터 $p,q$로 탐색 편향을 조절한다.

> 즉, Shallow는 $s_G$의 정의가 곧 **보존하려는 구조의 선언**이고, $\mathrm{DEC}$는 이를 근사하는 간단한 함수(대개 inner product)다.

---

## 2. NN-based embedding

Shallow가 node-id만 입력으로 받아 바로 embedding을 lookup하는 것과 달리, NN-based는 **노드 특징 $\mathbf{x}_i$와 이웃 $\mathcal{N}(i)$를 입력으로 받아 처리하는 네트워크**를 학습한다. 

파라미터가 **노드 간 공유**되어 효율성이 높아지며, 특히 neighborhood aggregation 방법은 node의 총 개수에 관계 없이, 주변 node의 정보를 단계적으로 가져와 학습하므로, 아예 새로운 그래프에 대해서도 학습한 모델을 적용할 수 있다. ( *inductive하다* )  

### 2-1. Neighborhood Autoencoder (DNGR, SDNE)


노드 i마다, 노드의 이웃 분포를 나타내는 벡터 $\mathbf{s}_i\in\mathbb{R}^{|\mathcal{V}|}$를 만든 뒤 오토인코더로 복원한다.

즉, learning objective는 아래와 같다.

$$
\min_{\theta,\phi}\ \sum_i \left\lVert\mathbf{s}_i - \mathrm{DEC}_\phi(\mathrm{ENC}_\theta(\mathbf{s}_i))\right\rVert_2^2
$$

**SDNE**는 여기에 Laplacian 정규화 항을 더해 인접 근접성을 강화한다.

$$
\sum_{(i,j)}W_{ij}\lVert\mathbf{z}_i-\mathbf{z}_j\rVert_2^2
$$

- $\mathbf{s}_i$를 **어떻게 만들었는지**가 곧 구조 가정이며, SDNE의 Lap 항은 구조 가정을 loss에서 명시적으로 추가한다.
  
- Shallow와 달리 **파라미터가 공유**되나 여전히 입력 차원이 |V|에 고정되어 매우 큰 그래프에 적용하기 어렵고, 새로운 그래프에 대해서도 적용이 어렵다. ( *transductive하다* )

### 2-2. Neighborhood Aggregation (GCN/GraphSAGE/GAT)

*Message Passing*으로 이웃 표현을 aggregate해 자신의 표현과 결합하는 연산을 여러 층 반복한다.

>
> 참고로, **Message Passing**은 "Neural message passing for quantum chemistry."논문에서 처음 GNN의 framework를 통합적으로 설명하기 위해 제시한 개념으로, 이후 많은 논문들에서 해당 개념을 차용하여 GNN을 설명하기 시작하였다. 
> 딥마인드의 Petar Veličković는 최신의 'beyond message passing'으로 여겨졌던 GNN 기법도 본질적으로 message passing framework으로 모두 설명할 수 있다고  <a href="https://web.stanford.edu/class/cs224w/">"Message passing all the way up" </a> 에서 주장하였다.
>

연산은 아래와 같다.

$$
\mathbf{h}_i^{(0)}=\mathbf{x}_i,\quad
\mathbf{h}_i^{(k)}=\mathrm{COMBINE}^{(k)}\!\Big(\mathbf{h}_i^{(k-1)},\ \mathrm{AGG}^{(k)}\{\mathbf{h}_j^{(k-1)}:j\in\mathcal{N}(i)\}\Big),\quad
\mathbf{z}_i=\mathbf{h}_i^{(K)}
$$

- 위 encoder 연산의 예는 아래와 같다.
  - **GCN**에서는 정규화된 연산이 핵심이다.
    $$
    \mathbf{H}^{(\ell+1)}=\sigma\!\big(\hat{D}^{-1/2}\hat{A}\hat{D}^{-1/2}\mathbf{H}^{(\ell)}W^{(\ell)}\big),\qquad \hat{A}=A+I
    $$
    이 식 자체가 “인접하면 가깝다”는 가정을 **encoder의 spectral filter**로 구현한다.
  - **GraphSAGE**는 aggregator를 선택해 structural bias을 조절한다.
    $$
    \mathbf{h}_i^{(k)}=\sigma\!\Big(W^{(k)}\big[\mathbf{h}_i^{(k-1)}\ \|\ \mathrm{AGG}(\{\mathbf{h}_j^{(k-1)}\}_{j\in\mathcal{N}(i)})\big]\Big)
    $$
  - **GAT**는 이웃 중요도를 attention coefficient로 가중한다.


- **loss function(learning objective)**  
GNN은 구조 가정을 $\mathrm{ENC}$가 담당하므로, $\mathrm{DEC}$와 손실은 태스크에 맞춰 유연하게 고른다.
  - 링크 예측 : $\mathrm{DEC}(\mathbf{z}_i,\mathbf{z}_j)=\sigma(\mathbf{z}_i^\top\mathbf{z}_j)$, 네거티브 샘플링
  - 노드 분류 : $\hat{\mathbf{y}}_i=\mathrm{softmax}(W\mathbf{z}_i)$, cross-enthropy
  - 그래프/서브그래프 관련 supervised task: $\mathrm{READOUT}$으로 집계 후 태스크별 $\mathrm{DEC}$ 사용

이 방법은 가장 진보한, 현재에도 활발히 연구되고 있는 graph representation 방식으로, 흔히 GNN을 이야기하면 보통 neighborhood aggregation을 바탕으로 한 이 message passing을 상정한다. 

- **파라미터 공유**로 모델 크기가 그래프 크기와 관계 없이 효율적으로 작게 유지된다.
- **노드 feature/edge weight** 등 그래프 관련 meta information을 자연스럽게 활용한다.
- **Inductive**한 특징을 가져 새 노드·새 그래프에도 적용이 수월하다.

---

## 마무리하며

- 그래프 표현 학습의 본질은  
  **(1) 무엇을 유사로 볼지($s_G$)**, **(2) 임베딩에서 그 유사를 어떻게 읽어낼지($\mathrm{DEC}$)**, **(3) 그 유사를 재현하도록 어떤 연산을 학습할지($\mathrm{ENC}$)**를 일관된 관점에서 설계하는 일이다.

  - **Shallow**는 “유사도를 정의하고 → 그에 맞춰 임베딩 열을 직접 optimize”한다.
  - **Neighborhood Autoencoder/SDNE**는 $s_G$의 근사치인 $\mathbf{s}_i$를 정의해 보존하되, 파라미터를 공유하여 더 효율적으로 학습한다
  - **Neighborhood Aggregation(GNN)**은 “무엇을 보존할지”가 **message passing network**에 녹아 있으며, 태스크에 따라 $\mathrm{DEC}$/손실을 유연하게 붙일 수 있다.


구체적 방법론과 수식 유도는 후속 글에서 더 다룰 예정이다.
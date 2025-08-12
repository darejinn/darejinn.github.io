---
title: Two Node Embedding Approaches - Shallow and NN-based

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
# published : false
---

---


# Introduction

앞선 글에서 설명했듯, Graph Representation Learning은 그래프의 요소(node, edge, subgraph)를 저차원 벡터로 매핑하는 일이다. 많은 survey가 여러 요소 중에서도 **node embedding**에 초점을 맞추는 이유는 다음과 같다.

1. **Edge/subgraph embedding이 node embedding의 후처리로 귀결**되는 경우가 많다.  
   
   예를 들어 
   - edge $(v_i,v_j)\in E$에 대해 node embedding $\mathbf{z}_i,\mathbf{z}_j$가 주어지면 hadamard/mean/weighted-L1·L2 같은 이항 연산으로

   $$
   \mathbf{z}_{(i,j)}=\mathbf{z}_i\odot\mathbf{z}_j
   $$

   처럼 edge embedding을 만든다.  

   - subgraph $\mathcal{G}[\mathcal{S}]$의 embedding도 보통 $\mathcal{S}\subset\mathcal{V}$에 포함된 node embedding을 집계(average/attention 등)해서 얻는다.
  
   $$
   \mathbf{z}_{\text{subgraph}}=\frac{1}{|\mathcal{S}|}\sum_{v_i\in\mathcal{S}}\mathbf{z}_i
   $$



2. Edge/Subgraph embedding을 직접 학습하더라도 절차는 **node embedding 학습과 본질적으로 유사**하다.  
   - 예를 들어 타깃 subgraph의 모든 node에 연결된 dummy node를 추가하고 그 node의 embedding을 학습 대상으로 두면 사실상 node embedding 학습과 거의 동일한 형태가 된다.

따라서 node embedding을 이해하면 edge/subgraph embedding도 같은 틀 안에서 상당 부분 설명된다. 이하에서는 **encoder를 어떻게 정의하는지**에 따라 node embedding을 **shallow embedding**과 **NN-based embedding**으로 비교해 정리한다. 본 글은 <a href="https://arxiv.org/abs/1709.05584">"*Representation Learning on Graphs*" (2017) </a>에서 제시한 개념을 바탕으로 필자의 해석을 더해 작성하였다.

---

## *Review : Learning framework*

*'그래프에서 가까운 node는 embedding 공간에서도 가깝다'*는 **structural assumption** 아래, 다음 세 가지를 설계한다.


- **그래프 상의 유사도 $s_G$**

  $$
  s_G:\mathcal{V}\times\mathcal{V}\to\mathbb{R}^+,\qquad
  s_G(i,j)\in\{A_{ij},\ k\text{-hop},\ \text{랜덤워크 공출현확률}
  $$
- **Embedding 공간의 decoder $\mathrm{DEC}$**
  
  $$
  \mathrm{DEC}:\mathbb{R}^d\times\mathbb{R}^d\to\mathbb{R},\quad
  \text{예: }\ \mathbf{z}_i^\top\mathbf{z}_j,\ -\lVert\mathbf{z}_i-\mathbf{z}_j\rVert_2^2,\ \sigma(\mathbf{z}_i^\top\mathbf{z}_j)
  $$
 - **Encoder $\mathrm{ENC}$와 loss function(learning objective)**
  
  $$
  \mathbf{z}_i=\mathrm{ENC}(v_i),\qquad
  \mathcal{L}=\sum_{(i,j)\in\mathcal{D}}\ell\!\Big(\mathrm{DEC}(\mathbf{z}_i,\mathbf{z}_j),\ s_G(i,j)\Big)
  $$

여기서 **structural assumption은 '무엇을 가깝게 유지할지'에 대한 inductive bias,** 즉 **네트워크 구조에 관한 모델의 prior**다. 

$s_G$를 어떻게 정의할지(무엇을 ‘유사’로 볼지), $\mathrm{DEC}$를 어떻게 둘지(embedding에서 유사를 어떻게 수치화할지), $\mathrm{ENC}$를 어떻게 설계할지(그 유사를 재현하도록 표현을 만들지)에 이 가정이 명시적·암묵적으로 들어 있다.

---
<br>
<br>

#  Two Node Embedding Approaches
---
위와 같은 $\mathrm{ENC}$–$s_G$–$\mathrm{DEC}$ 프레임워크 안에서, **학습이 일어나는 층위**에 따라 접근을 두 가지로 나눌 수 있다.

- **Shallow** : 미리 정한 $s_G$에 맞춰 **node별 embedding 자체**를 **직접** 최적화한다.
- **NN(GNN)-based**: **유사도를 만들어내는 연산**(autoencoder, message passing)를 학습해 embedding을 **간접**적으로 만든다. 파라미터는 **node 간 공유**된다.

---

## *1. Shallow embedding*

Shallow embedding은 **node ID를 임베딩 행렬의 열(column)에 직접 매핑**하는 방식이다.

$$
Z \in \mathbb{R}^{d \times |\mathcal{V}|}, \qquad \mathrm{ENC}(v_i) = Z_{\cdot i} = \mathbf{z}_i
$$

Encoder 구조가 단순하기 때문에, 무엇을 보존할지에 대한 선택이 거의 전적으로 **그래프 상의 유사도 정의 $s_G$와 Decoder** 설계에 담긴다.

---

### *1-1. Factorization-based approaches*

- **무엇을 보존할지 ($s_G$ 설정)**  
  유사도 행렬 $S$는 인접성, 근접성, 전파 도달성 등 다양한 그래프 속성을 반영하도록 정의할 수 있다. 예시는 다음과 같다.

  $$
  S = A \quad \text{(adjacency)}, \qquad
  S = A^k \quad (k\text{-hop}),
  \qquad
  S = \text{Katz}, \ \text{RPR}, \ \text{Jaccard} \ \text{등}
  $$

  $S$의 정의에 따라, embedding이 강조하는 구조적 특성(커뮤니티, 국소 근접성, 전파 가능성 등)이 달라진다.

- **Embedding에서 어떻게 읽을지 (Decoder)**  

  대표적인 Decoder 정의는 다음과 같다.

  $$
  \mathrm{DEC}(\mathbf{z}_i, \mathbf{z}_j) = \mathbf{z}_i^\top \mathbf{z}_j
  \quad \text{또는} \quad- \lVert \mathbf{z}_i - \mathbf{z}_j \rVert_2^2
  $$

- **Loss function (learning objective)**  

  - Decoder가 내적(inner product)일 경우
    $$
    \min_{Z} \ \lVert S - Z^\top Z \rVert_F^2
    $$
  
  - Decoder가 음의 유클리드 거리일 경우
    $$
    \sum_{i,j} W_{ij} \lVert \mathbf{z}_i - \mathbf{z}_j \rVert_2^2 
    \ = \ 2\, \mathrm{tr}(Z L Z^\top)
    $$

---

### *1-2. Random walk-based approaches*

- **무엇을 보존할지 ($s_G$ 설정)**  
  
  랜덤 워크를 통해 생성한 노드 시퀀스에서 **공출현(co-occurrence) 강도 또는 확률**을 노드 간 유사도로 정의한다.  
  - **DeepWalk**: 편향 없는(unbiased) 랜덤 워크를 사용.  
  - **node2vec**: 하이퍼파라미터 $p, q$로 BFS/DFS 성향을 조절하여, 국소적 조밀성(locality)과 구조적 역할(role) 간의 균형을 조정.
  

- **Embedding에서 어떻게 읽을지 (Decoder)**  

  Factorization 기반 방법과 유사하게, 내적 기반 Decoder를 사용하되, **유사도 행렬 S**가 아니라 **랜덤 워크 확률**을 근사하도록 학습한다.  
  즉, 다음 조건이 만족되도록 embedding을 학습한다.

  $$
  \mathrm{DEC}(\mathbf{z}_i, \mathbf{z}_j)=
  \frac{\exp(\mathbf{z}_i^\top \mathbf{z}_j)}
       {\sum_{v_k \in \mathcal{V}} \exp(\mathbf{z}_i^\top \mathbf{z}_k)}
  \ \approx \ p_{G,T}(v_j \mid v_i)
  $$

  여기서 $p_{G,T}(v_j \mid v_i)$는 그래프 $G$에서 노드 $v_i$에서 시작해 길이 $T$의 랜덤 워크를 수행할 때 노드 $v_j$를 방문할 확률이며, 일반적으로 $T \in \{ 2, \dots, 10 \}$ 범위로 설정된다.  


- **Loss function (learning objective)**  

  위 확률 근사를 위해 다음 **교차 엔트로피 손실**을 최소화한다.

  $$
  \mathcal{L} = \sum_{(v_i, v_j) \in D} - \log \left( \mathrm{DEC}(\mathbf{z}_i, \mathbf{z}_j) \right)
  $$

  여기서 $D$는 각 노드 $v_i$에서 시작하는 랜덤 워크로부터 샘플링된 $(v_i, v_j)$ 쌍들의 집합이다.
그러나 위 식의 분모 계산은 $O(|\mathcal{V}|)$ 시간이 소요되므로, 전체 학습 비용은 $O(|D||\mathcal{V}|)$로 매우 크다. 이를 해결하기 위해:

  - **DeepWalk**의 경우 : **Hierarchical softmax**를 사용하여, 이진 트리 구조로 정규화 항 계산을 가속한다.
  - **Node2vec**의 경우: **Negative sampling** 사용하여, 전체 노드 집합 대신 무작위로 선택한 소수의 negative sample로 분모를 근사한다.

- 가장 대표적인 random walk basedembedding method를 다루었는데, Deepwalk와 node2vec 외에도 LINE, HARP 등의 다양한 방법이 있다. 이 역시 다음에 자세히 다루겠다.


---
<br>


## *2. NN-based embedding*

Shallow가 node-id만 입력으로 받아 바로 embedding을 lookup하는 것과 달리, NN-based는 **node 특징 $\mathbf{x}_i$와 이웃 $\mathcal{N}(i)$를 입력으로 받아 처리하는 네트워크**를 학습한다. 

### *2-1. Neighborhood Autoencoder (DNGR, SDNE)*

각 노드 $i$마다, **이웃 분포(neighborhood distribution)** 를 나타내는 벡터  $\mathbf{s}_i \in \mathbb{R}^{|\mathcal{V}|}$를 생성한 뒤, 이를 **Autoencoder**로 복원한다.
여기서 $\mathbf{s}_i$는 행렬 $S$의 $i$번째 행에 해당하며, $S$는 노드 간 유사도 $s_G(v_i, v_j)$를 담고 있다.  
즉, $\mathbf{s}_i$는 노드 $v_i$가 그래프 내 모든 다른 노드와 가지는 유사도를 포함하는 고차원의 벡터다.

**Learning objective**는 다음과 같다.

$$
\min_{\theta,\phi} \ \sum_i 
\left\lVert
\mathbf{s}_i - \mathrm{DEC}_\phi\big(\mathrm{ENC}_\theta(\mathbf{s}_i)\big)
\right\rVert_2^2
$$

<br>
Shallow embedding과 달리 **파라미터가 노드 간 공유**되어 연산이 효율적이다. 하지만 입력 차원이 $|\mathcal{V}|$에 고정되어 있어 대규모 그래프 적용이 어려우며, 새로운 그래프에 대한 적용도 제한적이다. ( **transductive** )
  

### *2-2. Neighborhood Aggregation (GCN/GraphSAGE/GAT)*

**Message Passing**으로 이웃 표현을 aggregate해 자신의 표현과 결합하는 연산을 여러 층 반복한다.

>
> 참고로, **Message Passing**은 "Neural message passing for quantum chemistry."논문에서 처음 GNN의 framework를 통합적으로 설명하기 위해 제시한 개념으로, 이후 많은 논문들에서 해당 개념을 차용하여 GNN을 설명하기 시작하였다. 
> 딥마인드의 Petar Veličković는 최신의 'beyond message passing'으로 여겨졌던 GNN 기법도 본질적으로 message passing framework으로 모두 설명할 수 있다고  <a href="https://arxiv.org/abs/2202.11097">"Message passing all the way up" </a> 에서 주장하였다.
>

**연산 과정은 다음과 같다.**

$$
\mathbf{h}_i^{(0)} = \mathbf{x}_i, \quad
\mathbf{h}_i^{(k)} = \mathrm{COMBINE}^{(k)}\Big(
  \mathbf{h}_i^{(k-1)}, \
  \mathrm{AGG}^{(k)}\{\mathbf{h}_j^{(k-1)} : j \in \mathcal{N}(i)\}
\Big), \quad
\mathbf{z}_i = \mathbf{h}_i^{(K)}
$$

  1. 초기 임베딩은 입력 특징 $\mathbf{x}_i$로 설정한다.
  2. 각 단계에서 이웃 노드 임베딩을 집계($\mathrm{AGG}$)한다.
  3. 집계된 이웃 표현과 자신의 이전 단계 표현을 결합($\mathrm{COMBINE}$)한다.
  4. 이 과정을 $K$번 반복하여 최종 임베딩 $\mathbf{z}_i$를 얻는다.

위 encoder 연산에서 COMBINE function과 AGG function을 어떻게 정의하는지에 따라 GNN의 세부 방법론(GCN, GraphSAGE, GAT 등) 들이 나누어진다.
 


<br>

**GNN은 구조에 대한 연산(structural assumption)을 $\mathrm{ENC}$가 담당하므로, $\mathrm{DEC}$와  Loss function(learning objective) 은 태스크에 맞춰 유연하게 설정할 수 있다.**
 - 링크 예측 : $\mathrm{DEC}(\mathbf{z}_i,\mathbf{z}_j)=\sigma(\mathbf{z}_i^\top\mathbf{z}_j)$, negative sampling
 - node 분류 : $\hat{\mathbf{y}}_i=\mathrm{softmax}(W\mathbf{z}_i)$, cross-enthropy
 - 그래프/subgraph 관련 supervised task: $\mathrm{READOUT}$으로 node embedding을 post processing한 후 태스크별 $\mathrm{DEC}$ 사용
  
<br>

이 방법은 가장 진보한, 현재에도 활발히 연구되고 있는 graph representation 방식으로, 흔히 GNN을 이야기하면 보통 neighborhood aggregation을 바탕으로 한 이 message passing을 상정한다.

**파라미터 공유**로 모델 크기가 그래프 크기와 관계 없이 효율적으로 작게 유지된다. **Node feature/edge weight** 등 그래프 관련 meta information을 자연스럽게 활용할 수 있으며, 처음 보는 그래프에도 적용이 수월하다. ( **inductive** )

---

## 마무리하며

- Graph representation learning의 framework는,
  **(1) 무엇을 유사로 볼지($s_G$)**, **(2) embedding에서 그 유사를 어떻게 읽어낼지($\mathrm{DEC}$)**, **(3) 그 유사를 재현하도록 어떤 연산을 학습할지($\mathrm{ENC}$)** 를 설정(**structural assumption**) 하는 것이 핵심이다.

  - **Shallow**는 **(1)** 유사도를 정의하고(S 혹은 공출현확률) 그에 맞춰 **(2)** embedding 열의 내적이 비슷하도록 **(3)** embedding 열을 각 node id마다 따로따로 lookup한다.
  - **Neighborhood Autoencoder**는 **(1)** node마다 이웃 node의 정보를 나타내는 $\mathbf{s}_i$를 정의해, **(3)** 오토인코더를 이용해 **(2)** $\mathbf{s}_i$를 복원하도록 효율적으로 학습한다.
  - **Neighborhood Aggregation(GNN)** 은 **(1)(3)** “무엇을 보존할지”가 **message passing network**에 녹아 있으며, 태스크에 따라 **(2)** $\mathrm{DEC}$/loss를 유연하게 붙일 수 있다.


구체적 방법론과 수식 유도는 후속 글에서 더 다룰 예정이다.
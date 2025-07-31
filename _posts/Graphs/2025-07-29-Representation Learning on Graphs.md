---
title: Oveview on Graph Representation Learning
date: 2025-07-30
last_modified_at: 2025-07-30
category:
  - Graphs
tags:
  - Multimodal AI
  - Contrastive Learning
toc: true
toc_sticky: true
comments: true
---

---

# Introduction
---
<p align="center">
  <img src="https://github.com/user-attachments/assets/022b334c-5d69-4f4f-b3fe-4935350a043f" width="600"/>
</p>
<p align="center">  <em>Graph(왼쪽)과 Euclidean structured data(오른쪽) (출처: <a href="https://web.stanford.edu/class/cs224w/">CS224w)</a></em>
</p>
이미지, 문장과 같이 2D grid나 1D sequence로 성분의 순서와 구조가 정형화된 euclidean structured data와 달리, 세상의 많은 요소들은 요소 사이의 순서와 arrangement rule이 고정되어 있지 않은 non-euclidean space에 존재한다. 이러한 non-euclidean space, 기존의 traditional deep learning method들이 그대로 적용되기 어렵다. 단적인 예로, CNN의 convolution filter은, 특정 성분을 중심으로 n*n의 격자 kernel을 정의하지만, 상하좌우, 앞뒤 관계가 분명하지 않은 데이터, 가령 사람과 사람 사이의 네트워크 정보 등에서는, 같은 kernel을 정의하는 것이 불명확해진다. 

이러한 non-euclidean space 상의 요소들은, ‘Graph Struture’을 정의함으로써 다룰 수 있다. Node 와 node를 연결하는 edge로 정의되는 그래프는 node 사이의 관계가 euclidian space에 한정되지 않고 자유도가 높다는 장점과 더불어, node feature과 edge weight으로 자유롭게 요소의 정보를 추가할 수 있다는 점에서 매력적이다.

하지만 데이터의 자유도가 큰만큼, graph를 분석하는 방법론 역시 다양하고 방대하다. 

그래프를 공부하며, GNN, random walk, message passing, subgraph sampling, graph kernel, graph signal processing, graph structure learning, graph embedding, graph mining 등 끝없이 등장하는 용어들이 어느 층위에서 어떻게 다른 용어들과 연결되는 것인지 명확히 정리되지 않아 혼란함을 느꼈다. 나의 이해를 가시화해나가는 과정을 통해서 더 깊은 이해가 가능해지길, 또 글이 나와 비슷한 고민을 하는 누군가에게 조금이라도 도움이 되길 기대한다. 

본 글에서는, graph representation의 framework를 개괄한다.
<br>
<br>
<br>
# Graph Representation Learning이 무엇인가
---
## <span style="font-size:90%"> *Graph의 용어들*
Graph는 정보 unit(nodes)와, 사이의 연결관계(edge)로 이루어진, 나이브한 구조의 정보이다. 

2차원으로 flattening된 이미지나, 해석 가능한 단어들의 조합으로 정렬된 언어와 달리, graph stucture의 high dimensional, non-euclidian information은 직관적인 해석이 불가하다. 따라서, 그래프에서 필요에 맞는 **유용한 정보를 extract**하는 방법은 오래전부터, 많은 분야에서 다루어져왔다.
<p align="center">
  <img src="https://github.com/user-attachments/assets/42c6fd72-8baf-4029-8e2b-feec7395f4e4" width="600"/>
</p>
<p align="center">  <em>Graph (출처: <a href="https://web.stanford.edu/class/cs224w/">CS224w)</a></em>
</p>

일반적으로 그래프 $G$는 $G = (V, E)$의 tuple로 표현된다.

- 이때, $V = \{v_1, v_2, \ldots, v_n\}$ 는 $n$개의 노드 집합을 의미한다.
- $E = \{e_1, e_2, \ldots, e_m\} \subseteq V \times V$ 는 $m$개의 edge (노드와 노드를 연결하는 링크)를 의미한다.
- 각 노드는 특성을 가질 수 있으며 *(예: 노드가 사람일 경우, 성별이라는 특성이 각 노드에 정의될 수 있다)* $k$ 종류의 특성이 있을 경우, 노드 특성 행렬 
  $$\mathbf{X} \in \mathbb{R}^{k \times |V|}$$
  로 표현된다.
- 이렇게 정의된 그래프에서 edge의 양상은 인접행렬 (Adjacency Matrix) 
  $$\mathbf{A} \in \mathbb{R}^{|V| \times |V|}$$
  로 표현되며 만약 $(v_i, v_j) \in E$이면 $A_{ij} = 1$, 그렇지 않으면 $A_{ij} = 0$이다.
  
## <span style="font-size:90%"> *Learning의 목표는 그래프의 구조적 정보를 보존하는 것이다.*

그래프를 활용하기 위해서는, 그래프와 그 구성 요소들(예: 노드 및 엣지)을 다룰 수 있는 numerical features로 표현할 필요가 있다. 물론 위에 설명한 인접 행렬 $\mathbf{A}$ 자체도 그래프를 표현하는 방법이다. 그러나 인접 행렬은 크기가 $|V| \times |V|$이므로 매우 큰 그래프를 표현하기에는 소모적이며, 그래프의 중요한 정보를 보존하되 차원을 줄이는 feature extraction이 필요하다. 
<p align="center">
  <img src="https://github.com/user-attachments/assets/fe1e52bd-efee-41d4-aad0-e25074455606" width="600"/>
</p>
<p align="center">  <em>Graph Representation Learning (출처: <a href="https://web.stanford.edu/class/cs224w/">CS224w)</a></em>
</p>
- 고전적인 방법들은, 그래프에서 사전에 정의된 알고리즘으로 그래프에서 정보를 extract한다. Graph statistics(degrees, clustering coefficients), kernel functions 등이 이에 해당한다.  이러한 hand-engineered feature들은 산출 방법이 정해져 있는 ‘processing’이며, inflexible하다. 이러한 방법들은, 어느 정도 graph property를 반영하긴 하나, 오직 그래프를 정해진 방법으로 가공한 것이므로 feature의 깊이에 한계가 있다.
- **Graph Represenation Learning**은, 이와 달리 그래프의 구조적 정보를 잘 보존하도록 embedding을 ‘learning’한다. ‘learning’한다는 것은, 설정된 ‘goal’에 가까워지게 최적화하는 것을 의미한다. Graph Representation Learning의 ‘goal’이 ‘그래프의 구조적 정보를 잘 보존하는 것’이 되는 셈이다. 
  

<p align="center">
  <img src="https://github.com/user-attachments/assets/8c27c743-919c-4676-89a6-67c2055032f4" width="600"/>
</p>
<p align="center"><em>Node Embedding</em></p>

  - 위 그림의 그래프 $G = (V, E)$를 예로 들어 살펴보자. 
    - 그래프 구조에 대하서 설명하자면, 5개의 node($v_1, ... , v_5$)와 6개의 연결된 edge로 이루어진 그래프는 왼쪽 아래의 인접행렬 $A$로 표현되며 붉게 표시된 $v_4$와 연결된 3개의 node $\{v_2, v_3, v_5\}$의 연결은 성분 1로 표현된다. 인접행렬의 대각성분은 자기 자신과의 연결은 정의하지 않으므로 0이며, (i,j) 연결과 (j,i) 연결은 undirected graph에서는 구분되지 않으므로 대칭행렬이다.
  
    -  $|V| = 5$인 이 그래프에서, 각 노드 $v_i$를 차원 4의 저차원 벡터로 인코딩하는 mapping function $f : v_i \rightarrow \mathbb{R}^4$ 
  을 학습하여, 그래프의 구조적 정보를 잘 보존하는 node embedding을 구하는 것이 바로 Graph Representation Learning인 것이다.

  >
  > 그렇다면, learning의 goal인, **그래프의 구조적 정보를 잘 보존함**을 판단하는 기준은 무엇인가?
  >

## <span style="font-size:90%"> *구조적 정보는 유사도로 표현할 수 있다.*

위 질문에 대한 답이, Graph Representation Learning의 핵심을 담는다. 직관적으로 생각할 때, '그래프의 구조적 정보'에 대한 gold label이 존재한다면 그 gold label에 가깝게 f를 learning하면 될 것이다. 하지만, 일반적으로 graph representaton learning 자체가 gold label이 없는 복잡한 자료구조에서 최대한 원래의 정보를 보존하는 representation을 구해내는 것에 의의를 두기에, 일반적으로 learning은 외부에서 주어지는 정답지가 없는, unsupervised learning의 형태로 이루어진다.

Learing의 핵심적인 아이디어는, 아래와 같다.
>
> Embedding에서 node 간의 ***유사도(proximity)*** 가 원래 그래프와 비슷하게 보존된다면, 간접적으로 ***그래프의 중요한 구조 정보가 보존***된다고 볼 수 있다.
>
<p align="center">
  <img src="https://github.com/user-attachments/assets/42cfae28-12ef-47d4-bfe0-d43ac91a608b" width="600"/>
</p><p align="center"><em>유사도가 '거리'로 정의되는 상황</em></p>

예를 들어보겠다. 지구에 살고 있는 영이($v_1$), 영희($v_2$), Mike($v_3$)를, 극좌표계의 단위벡터로 표현한다고 생각해보자. 훌륭한 representation이 되기 위해서는, **사람들 간의 유사도가, 극좌표계 상에서도 보존되어야 한다.** 이 task를 단순명료화하기 위해서 아래와 같은 두 전제를 할 수 있다.

1. **전제 1** - '사람들 사이의 유사도'는 사람들 간의 '거주하는 지역 간의 거리'가 가까울수록 크다.
2. **전제 2** - 극좌표계에서 '벡터들 간의 유사도'는 벡터 사이의 각도가 작을수록 크다.

위 두 전제 하에 지구에서 영이와 영희가 옆집에 살고, Mike는 혼자 먼 섬나라에 산다는 것을 반영하면, 극좌표계 상에서 표현된 (영이, 영희) 사이의 각도가 좁고, (영희, Mike), (영이, Mike)의 각도가 큼은 합리적이다.
혹 지구에서 사람들 간의 '거주하는 지역 간의 거리' 정보가, 극좌표계 상의 벡터 간 사잇각 정보로 reconstruct되었다고 볼 수 있다. 이는 '거리 정보'가 보존된다는 점에서 훌륭한 representation이다.

하지만, 위의 두 전제에 관해 드는 의문이 있다. 
1. **전제 1 - Node 간 유사도에 대한 의문** : 사람은 셀 수 없이 많은 각기 다른 특성들을 갖고 있다. 머리모양에서부터 목소리, 옷, 성별, 나이, 인종... 이 많은 특성들을 깡그리 무시하고 **'거주하는 지역 간의 거리'가 '사람들 사이의 유사도'를 나타낸다고 가정하는 것이 합리적인가?**
2. **전제 2 - embedding space에서 보존되는 유사도 대한 의문** : 비슷한 맥락으로, **극좌표계의 두 임베딩 벡터 $z_i, z_j$의 유사도를 사잇각으로 정의하는 것이 합리적인가?**

<br>
<br>


# Learning Framework
-----
결론부터 이야기하면, 위의 두 전제, 즉 Representation Learning에서 **유사도의 정의**는 연구자의 의도, 혹은 downstream task에 따라 달라진다. 따라서 representation 학습은 본질적으로, **어떤 그래프 상의 유사도를 어떤 방식으로 보존할 것인가**에 대한 설계와 그 구현을 포함하는 과정이다.


<p align="center">
  <img src="https://github.com/user-attachments/assets/dabdcbcd-1a20-48f9-8233-25e5a208a8ba" width="600"/>
</p>
<p align="center"><em>Learning Scheme</em></p>

위에서 다룬 그래프 $G = (V, E)$를 다시 갖고 와, 지금까지 설명한 내용을 수식으로 살펴보자.

## <span style="font-size:90%"> *1.유사도의 정의*
   > 연구자는 두 가지 유사도를 정의한다. 하나는 **그래프 상의 유사도**이며, 다른 하나는 **embedding space 상의 유사도**이다.

- **Pairwise Similarity Function(노랑)**
  
  **그래프 $G = (V, E)$ 위에서 정의되는, 노드 간의 유사도를 나타내는 함수이며 아래와 같이 표현된다.**

  $$
  s_G : V \times V \rightarrow \mathbb{R}^+
  $$
  
  이 함수는 노드 $v_i$와 $v_j$ 사이의 **그래프 기반 유사도**를 정의한다. 
  예를 들어,

  - $s_G(v_i, v_j) = A_{ij}$일 경우, 유사도 자체는  노드 간 인접 여부 (adjacency matrix)를 의미한다.
  - Random walk 기반 representation learning에서 $s_G(v_i, v_j)$는 random walk에서의 공출현 확률로 정의될 수 있다.

- **Decoder Function(초록)**
  
  **두 임베딩 벡터 $z_i, z_j$의 유사도를 계산하는 함수이며 아래와 같이 표현된다.**

   $$
   \text{DEC} : \mathbb{R}^d \times \mathbb{R}^d \rightarrow \mathbb{R}^+
   $$
   
   일반적으로 학습 parameter를 가지지 않으며 단순한  형태이다. 예를 들어,

   - $\text{DEC}(z_i, z_j) = z_i^\top z_j$일 경우, 두 벡터 간 inner product를 의미한다.
   - $\text{DEC}(z_i, z_j) = -\|z_i - z_j\|^2$일 경우, 두 벡터 간 euclidean distance를 의미한다.

##  <span style="font-size:90%"> *2.Learning의 과정*
   
   
   > **최적화되는 대상은 Encoder function**이며, **학습의 목적은 Loss Function을 최소화하는 것**이다.

- **Encoder Function**
  
  **그래프 상의 노드 $v_i \in V$를 $d$차원 벡터로 임베딩하는 함수이며 아래와 같이 표현된다.**

  $$
  \text{ENC} : V \rightarrow \mathbb{R}^d
  $$

  즉, 노드 $v_i$는 임베딩 벡터 $z_i = \text{ENC}(v_i)$로 매핑된다. 이 함수는 학습 가능한 파라미터를 가지며, 학습 과정에서 최적화된다.


- **Loss Function**

  **복원된 유사도 $\text{DEC}(z_i, z_j)$와 원래 유사도 $s_G(v_i, v_j)$ 간의 차이를 최소화하는 손실 함수이다.** 

  $$
  \ell : \mathbb{R} \times \mathbb{R} \rightarrow \mathbb{R}
  $$
  에 대해, 전체 학습 손실은 다음과 같이 정의된다.

  $$
  \mathcal{L} = \sum_{(v_i, v_j) \in \mathcal{D}} \ell\left(\text{DEC}(z_i, z_j), s_G(v_i, v_j)\right)
  $$

  여기서 $\mathcal{D}$는 학습에 사용되는 노드 쌍들의 집합이다.

<br>
<br>

----

# 정리하면

위 프레임워크를 공통적인 틀로 가지는 Graph Representation Learning은 결국 아래의 두 요소가 본질이다.

>
> 1. **유사도 설정 : $s_G$(그래프 상의 유사도)와 Decoder(Decoding한 유사도)를 어떻게 정의하는가?**
> 2. **Learning의 과정 : 어떤 구조의 encoder를 사용하는가?, loss 함수는 어떻게 정의하는가?**
>

위 요소의 차이에 따라 Graph Representation Learning의 Method의 세부 분류가 나누어진다. 

사실, 스탠포드 CS224w의 강의자이시자 위 프레임워크를 제안하신 Jure Leskovec 교수님께서 지적하셨듯, GRL 방법들은 다양한 벤치마크와 모델 개념들이 산발적으로 존재하여 이론적 통일성이 결여되어 있다. 각기 다른 하위 분야에서 독립적으로 연구되어 온 GRL의 task 중심 평가에서 벗어나, 본질적으로 우리가 어떤 graph 구조를 representation에 담고자 하는지, 어떻게 그것을 encoding해야 하는지, latent space에 어떤 제약을 둘 것인지에 대한 체계화된 개념론적 논의가 더 활발히 이루어지길 소망한다.

---

*참고문헌*
1. Khoshraftar, Shima, and Aijun An. "A survey on graph representation learning methods." ACM Transactions on Intelligent Systems and Technology 15.1 (2024): 1-55.
2. Ju, Wei, et al. "A comprehensive survey on deep graph representation learning." Neural Networks 173 (2024): 106207.
3. Hamilton, William L., Rex Ying, and Jure Leskovec. "Representation learning on graphs: Methods and applications." arXiv preprint arXiv:1709.05584 (2017).

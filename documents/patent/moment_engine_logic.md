# Crealab 발명 제안서: 모먼트-투-커머셜 엔진 (Moment-to-Commercialization Engine)

이 문서는 Crealab의 핵심 기술인 "모먼트 엔진"의 작동 원리를 변리사 및 기술 심사관이 이해할 수 있도록 상세히 기술한 자료입니다.

## 1. 발명의 명칭
**시간적 이벤트 데이터를 상업적 제안 객체로 변환하고 이를 동기화하는 시스템 및 방법**
(System and Method for Transforming Temporal Event Data into Commercial Proposal Objects and Synchronizing the Same)

## 2. 해결하고자 하는 과제 (The Problem)
기존의 인플루언서 마케팅 시장은 **"일정 관리(Scheduling)"와 "계약 협상(Negotiation)"이 분리**되어 있었습니다.
1.  크리에이터는 구글 캘린더나 플래너 앱에 "여행", "이사" 등의 개인 일정을 기록합니다.
2.  브랜드는 별도의 이메일이나 DM으로 "혹시 여행 가실 때 우리 제품 홍보해주실 수 있나요?"라고 제안합니다.
3.  이 과정에서 **문맥의 단절(Context Switching)**이 발생하고, 협상 비용이 증가하며, 데이터가 파편화됩니다.

## 3. 해결 수단 (The Solution - Core Logic)
본 발명은 크리에이터가 입력한 단순한 **"시간적 이벤트(Life Moment)"**를 시스템이 감지하여, 즉시 **"상업적 제안 가능 객체(Tradable Asset)"**로 형변환(Type Transformation)하는 엔진을 제안합니다.

### 3.1 핵심 데이터 흐름도 (Logic Flow)

```mermaid
graph TD
    %% 1. Input Phase
    User[크리에이터 (User)] -->|1. 일정 등록 (예: 제주도 여행)| CalendarUI[캘린더 인터페이스]
    CalendarUI -->|2. 데이터 전송| InputHandler[이벤트 핸들러]

    %% 2. Transformation Phase (The Invention)
    subgraph "Moment Engine (Transformation Layer)"
        InputHandler -->|3. 메타데이터 추출 (날짜, 카테고리)| Classifier[모먼트 분류기]
        Classifier -->|4. 상업적 가치 판단 (Is Tradable?)| ValueEngine[가치 평가 로직]
        
        ValueEngine -- No --> SimpleEvent[단순 개인 일정 DB 저장]
        ValueEngine -- Yes --> Builder[제안 객체 빌더 (Proposal Builder)]
        
        %% Rate Card Integration
        DB_Rate[Rate Card DB] -->|5. 단가표 로드 (P*Q)| Builder
        
        Builder -->|6. 빈 슬롯 생성 (광고 구좌)| CommercialSlots[상업적 슬롯 생성]
        Builder -->|7. 객체 인스턴스화| TradeObj[상업적 제안 객체 (Deal Object)]
    end

    %% 3. Output Phase
    TradeObj -->|8. 마켓플레이스 노출| BrandMarket[브랜드 탐색 뷰]
    BrandMarket -->|9. 제안 요청 (Bidding)| Negotiation[협상 프로세스 시작]
```

### 3.2 단계별 상세 설명 (Step-by-Step)

#### 단계 1: 이벤트 의도 감지 (Intent Detection)
*   사용자가 "8월 15일 이사"라고 입력하면, 시스템은 자연어 처리(NLP) 또는 카테고리 매핑을 통해 이것이 단순 일정이 아닌 **"고소비 연관 이벤트(High-Consumption Event)"**임을 식별합니다. (예: 이사 -> 가구, 청소, 인테리어 수요 발생)

#### 단계 2: 상업적 슬롯 할당 (Commercial Slot Allocation)
*   감지된 이벤트의 기간(Duration)과 성격(Type)에 따라, 시스템은 해당 이벤트 내에 판매 가능한 **"광고 구좌(Slots)"**를 자동으로 생성합니다.
*   *예: 2박 3일 여행 -> [숙소 리뷰 슬롯 1개], [맛집 리뷰 슬롯 3개], [OOTD 슬롯 2개] 자동 생성.*

#### 단계 3: 동적 단가 매핑 (Dynamic Pricing Injection)
*   크리에이터가 미리 설정해둔 **Rate Card(단가표)**를 참조하여, 생성된 각 슬롯에 **"최소 제안 가격(Floor Price)"**을 주입합니다.
*   *기술적 특징: 정적인 단가가 아니라, 이벤트의 성수기/비수기 여부, 예상 도달 범위 등을 고려하여 가중치를 적용할 수 있는 구조.*

#### 단계 4: 제안 객체(Proposal Object) 생성 및 게시
*   최종적으로 `Event` 테이블의 데이터와 `Commercial` 테이블의 데이터가 결합된 `MomentProposal` 객체가 생성되어 브랜드가 볼 수 있는 마켓플레이스에 즉시 게시됩니다.

## 4. 데이터 스키마 구조
이 발명의 핵심은 데이터를 저장하는 구조의 차별성에 있습니다.

```json
// 기존 방식 (단순 일정)
{
  "event_id": 101,
  "date": "2026-08-15",
  "title": "제주도 여행",
  "is_private": false
}

// 본 발명의 방식 (상업적 제안 객체로 변환된 상태)
{
  "proposal_id": "P-2026-8821",
  "linked_event_id": 101, // 원본 일정과 연결
  "commercial_status": "OPEN_FOR_BIDDING", // 상업적 상태 플래그
  "available_slots": [
    {
      "slot_type": "YOUTUBE_VLOG",
      "pricing_model": "FIXED + INCENTIVE",
      "base_price": 5000000,
      "category_constraints": ["NO_GAMBLING", "NO_ALCOHOL"] // 브랜드 제한 조건
    },
    {
      "slot_type": "INSTAGRAM_FEED",
      "base_price": 1000000
    }
  ],
  "collaboration_terms": {
    "draft_deadline": "2026-08-10", // 여행 5일 전까지 초안 마감 (자동 계산)
    "usage_rights": "3_MONTHS"
  }
}
```

## 5. 결론 및 기대 효과
이 시스템을 통해 크리에이터는 별도의 복잡한 영업 행위 없이, **자신의 삶(Life)을 기록하는 행위만으로 비즈니스 기회(Business)를 창출**할 수 있습니다. 이는 기존의 수동적인 인플루언서 마케팅 플랫폼과 구분되는 Crealab만의 독창적인 기술적 진보입니다.

# Creadypick 플랫폼 전체 데이터 아키텍처 및 흐름도

이 문서는 Creadypick 플랫폼의 **모든 핵심 기능**에 대한 데이터 생성, 이동, 소비 과정을 상세히 기술합니다.

---

## 1. 회원가입 및 프로필 생성 (User Onboarding)
> **"모든 데이터의 시작점: 유저가 가입하면 역할에 맞는 데이터 공간이 생성됩니다."**

1.  **가입 (Auth)**: 사용자가 이메일/소셜 로그인을 합니다.
2.  **트리거 (Server-Side)**: `handle_new_user` SQL 트리거가 작동하여 `auth.users`에 데이터가 생기면 즉시 `public.profiles`에 복사합니다.
3.  **역할 분기 (Role Split)**:
    *   **Brand**: `profiles` 테이블만 사용하며, `brand_products`를 등록할 자격을 얻습니다.
    *   **Influencer (Creator)**: `profiles` 생성 후, 추가적으로 `influencer_details` 테이블(단가, 활동 태그 등)을 관리하게 됩니다.

---

## 2. 브랜드 자산 관리 (Brand Assets)
> **"협업의 재료: 브랜드는 제품을 먼저 등록해야 캠페인이나 제안을 할 수 있습니다."**

*   **생성**: 브랜드가 `app/brand/settings` 또는 캠페인 생성 중 '제품 등록'을 수행.
*   **저장**: `brand_products` 테이블
    *   핵심 필드: `name`, `image_url`, `selling_points`(소구점), `price`
*   **사용처**:
    1.  **캠페인 생성 시**: 제품 정보를 불러와 자동 입력.
    2.  **직접 제안 시**: 크리에이터에게 "이 제품을 줄 테니 협업하자"며 첨부.

---

## 3. 핵심 협업 프로세스 (Two-Way Collaboration)
플랫폼의 협업은 **두 가지 방향**으로 이루어지며, 결국 **워크스페이스**에서 만납니다.

### A. 캠페인 (Campaigns) - "공개 모집"
> **브랜드가 공고(Campaign)를 올리고 -> 크리에이터가 지원(Application)함**

1.  **생성 (Brand)**: 브랜드가 제품(`brand_products`)을 선택하고 예산, 모집 인원을 설정하여 `campaigns` 생성.
2.  **조회 (Creator)**: `CampaignProvider`가 활성 캠페인을 필터링하여 크리에이터에게 노출 (`app/creator/campaign-search`).
3.  **지원 (Action)**: 크리에이터가 '지원하기' 클릭.
    *   `campaign_proposals` 테이블 생성 (Type: Application).
    *   이때 크리에이터의 `influencer_details`(단가, 채널) 정보가 참조됨.
4.  **수락 (Match)**: 브랜드가 지원서를 수락하면 `status`가 'accepted'로 변경되고 워크스페이스 생성.

### B. 모먼트 (Moments) - "직접 제안"
> **크리에이터가 일정(Moment)을 올리고 -> 브랜드가 제안(Offer)함**

1.  **생성 (Creator)**: 크리에이터가 여행, 이사 등 `life_moments` 등록.
2.  **조회 (Brand)**: 브랜드가 조건(팔로워, 카테고리 등)에 맞는 모먼트를 검색 (`app/brand/moment-search`).
3.  **제안 (Action)**: 브랜드가 '제안하기' 클릭.
    *   `brand_proposals` 테이블 생성 (Type: Offer).
    *   브랜드의 `brand_products` 정보가 `product_id`로 연결됨.
4.  **수락 (Match)**: 크리에이터가 제안을 수락하면 `status`가 'accepted'로 변경되고 워크스페이스 생성.

---

## 4. 협업 워크스페이스 (Collaboration Workspace)
> **"성사 이후의 모든 과정: 채팅, 계약, 결과물 제출이 이루어지는 통합 공간"**

성사된 협업(`campaign_proposals` 또는 `brand_proposals`)은 **통합 워크스페이스 View**에서 관리됩니다.

### 데이터 구조 (Unified View)
*   프로런트엔드에서는 이 두 테이블을 합쳐서 하나의 `Target`으로 취급합니다.
*   공통적으로 아래 하위 프로세스를 포함합니다.

#### 1) 채팅 (Messages)
*   **테이블**: `messages`
*   **특징**: `proposal_id`(캠페인용) 또는 `brand_proposal_id`(제안용) 중 하나를 참조하여 대화 내용을 저장합니다.

#### 2) 전자 계약 (Contracts)
*   **저장 위치**: 각 Proposal 테이블 내부 (`contract_content`, `brand_signature`, `influencer_signature`)
*   **흐름**:
    1.  AI 또는 템플릿으로 계약서 초안 생성.
    2.  양측이 서명하면 `contract_status`가 'signed'로 변경.
    3.  PDF 다운로드 가능.

#### 3) 콘텐츠 제출 및 피드백 (Submission)
*   **저장 위치**: 각 Proposal 테이블 내부 (`content_submission_url`, `status`)
*   **흐름**:
    1.  크리에이터가 게시물 URL/파일 제출 -> `status`: 'pending'
    2.  브랜드가 검토 후 `submission_feedback` 테이블에 수정 요청 기록.
    3.  최종 승인 시 -> `status`: 'approved'

---

## 5. 데이터 관계 요약 (Relationship Diagram)

```mermaid
graph TD
    User[Auth User] -->|Trigger| Profile[Profiles]
    
    %% Brand Side
    Profile -->|Role: Brand| Products[Brand Products]
    Products --> Campaign[Campaigns]
    Products --> BrandOffer[Brand Proposals (Offer)]
    
    %% Creator Side
    Profile -->|Role: Creator| Details[Influencer Details]
    Details --> Moment[Life Moments]
    
    %% Flows
    Campaign -->|Creator Applies| App[Campaign Proposals (App)]
    Moment -->|Brand Offers| BrandOffer
    
    %% Workspace
    App --> Workspace
    BrandOffer --> Workspace
    
    subgraph Workspace [협업 워크스페이스]
        Chat[Messages]
        Contract[Digital Contract]
        Feedback[Submission & Feedback]
    end
```


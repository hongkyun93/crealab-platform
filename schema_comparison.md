# 제안 테이블 스키마 비교 분석

`moment_proposals`, `product_applications`, `campaign_applications` 세 테이블의 스키마를 비교하여 `workspaces` 로 마이그레이션 해야 할 공통 항목과 고유 항목을 정리합니다.

## 공통 항목 (Workspaces 테이블의 코어 필드 대상)

현재 세 테이블은 거의 동일한 실행 단계 데이터를 저장하고 있습니다. 이 항목들은 `workspaces` 테이블에서 통합 관리되어야 합니다.

### 기본 정보 및 식별자
- `id` (uuid, PK)
- `brand_id` (uuid)
- `creator_id` (uuid)
- `status` (text) - 진행 상황 (offered, accepted, signed, completed 등)
- `created_at` (timestamptz)

### 콘텐츠 및 조건 (계약/협의 사항)
- `price_offer` (bigint)
- `product_name` (text)
- `product_type` (text - gift, loan 등)
- `video_guide` (text - brand_provided 등)
- `date_flexible` (boolean)
- `secondary_usage_fee` (integer)
- **각종 조건들 (Conditions)**: 
  - `condition_product_receipt_date`, `condition_plan_sharing_date`, `condition_draft_submission_date`
  - `condition_final_submission_date`, `condition_upload_date`
  - `condition_maintenance_period`, `condition_secondary_usage_period`
- **크리에이터 작성 사항**:
  - `motivation`, `content_plan`, `portfolio_links`, `instagram_handle`, `insight_screenshot`, `special_terms`
  - `channel_name`, `channel_subtype`, `channel_url`

### 협업 실행 로직 제어 (상태/플래그)
- `contract_status` (none, signed 등)
- `delivery_status` (pending, shipped, delivered)
- `content_submission_status`, `content_submission_status_2` (초안/최종본 검수 상태)
- `brand_condition_confirmed`, `creator_condition_confirmed` (조건 양자 합의 체결 여부)
- `brand_signed_at`, `creator_signed_at` (서명 일시)
- `brand_signature`, `creator_signature` (서명 이미지/텍스트)

### 에셋 및 링크
- `content_submission_url`, `content_submission_file_url`
- `content_submission_url_2`, `content_submission_file_url_2`
- `content_final_url`, `content_clean_url`
- `product_url`, `tracking_number`
- `shipping_name`, `shipping_phone`, `shipping_address`

---

## 각 테이블 고유 항목 (프로젝트 성격 정의 필드)

이 항목들은 `workspaces` 테이블에 병합하되 nullable로 처리하거나, "원형 데이터(`original_proposal_id`)" 에 의존하는 형태로 남겨두어야 합니다.

### 1. `moment_proposals` 전용
- `moment_id` (uuid) - 대상 모먼트 식별자
- `product_id` (uuid) - 브랜드가 제안할 때 고른 자사 제품
- `message` (text) - 첫 제안 인사말
- `conditions` (jsonb) - 초기 제안 시 브랜드가 커스텀하게 남긴 조건 묶음
- `compensation_amount` / `has_incentive` / `incentive_detail` - 구버전 리워드 관련 필드 잔재

### 2. `product_applications` 전용
- `moment_id` (uuid) - (브랜드 제품을 보고 크리에이터가 제안했지만, 특정 모먼트에 귀속시킬 경우)
- `product_id` (uuid) - 타겟 브랜드 제품
- `message` (text) - 크리에이터가 지원할 때 남긴 인사말

### 3. `campaign_applications` 전용
- `campaign_id` (uuid) - 대상 캠페인 식별자
- `desired_date` (date) - 희망 방문/진행일 (캠페인 특화)
- `receiver_name` - 수령인 이름

---

## 결론 및 통합 방향 (Workspace 스키마 설계안)

세 테이블은 **시작점(Brand가 먼저 보냈는지, Creator가 먼저 지원했는지)만 다를 뿐, 계약 및 실행 단계에서 필요한 데이터 구조가 95% 일치**합니다.

따라서 `workspaces` 테이블은 본질적으로 **저 95%의 실행 항목들을 전부 가져오되**, 출생의 비밀(?)을 기억하기 위해 아래와 같은 참조 키만 추가하면 완벽합니다:

```sql
CREATE TABLE public.workspaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    
    -- 기본 관계
    brand_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    
    -- 출처 트래킹 (What started this workspace?)
    proposal_type text NOT NULL, -- 'moment_proposal', 'product_application', 'campaign_application'
    proposal_id uuid NOT NULL,   -- 원본 테이블의 ID 복사
    
    -- 프로젝트 메타데이터 (UI 표기용 캐싱)
    project_title text NOT NULL, -- 캠페인명, 모먼트명, 브랜드제품명
    
    -- [이하 모든 상태/계약/에셋 항목들은 공통으로 옮겨옴]
    status text,
    price_offer bigint,
    contract_status text,
    delivery_status text,
    content_submission_status text,
    ...
);
```

이 구조로 변경하면 `WorkspaceView`, `chat-area`, `message-provider` 등에서는 **무작정 `workspaces` 테이블 1개만 조회하면 되므로 분기 처리 코드가 1/3로 줄어듭니다.**

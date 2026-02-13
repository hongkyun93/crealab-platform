# 워크스페이스 데이터 흐름 분석 (Workspace Data Flow Analysis)

이 문서는 **브랜드(Brand)**와 **크리에이터(Creator)** 워크스페이스에서 데이터가 어떻게 데이터베이스에서 UI까지 흐르는지 정의합니다.

---

## 1. 데이터 소스 (Data Sources)

| 논리적 구분 | 테이블명 (DB Table) | 설명 | 주요 필드 (Key Fields) |
| :--- | :--- | :--- | :--- |
| **캠페인 지원** | `campaign_proposals` | 크리에이터가 공고된 캠페인에 지원 | `campaign_id`, `price_offer`, `message` |
| **브랜드 제안** | `brand_proposals` | 브랜드가 크리에이터에게 직접 제안 | `product_id`, `compensation_amount`, `message` |
| **모먼트 제안** | `moment_proposals` | 브랜드가 크리에이터의 '모먼트'를 보고 제안 | `moment_id`, `price_offer`, `message` |

---

## 2. 브랜드 워크스페이스 (Brand Workspace)

**위치:** `components/brand/views/WorkspaceView.tsx`

| 탭 (UI Tab) | 설명 | 데이터 소스 (Merged) | 필터링 로직 (Filter Logic) |
| :--- | :--- | :--- | :--- |
| **전체 보기 (All)** | 모든 제안 내역 | `All Sources` | `campaignProposals` + `brandProposals` |
| **진행중 (Active)** | 매칭되어 진행 중 | `All Sources` | `status` IN `('accepted', 'signed', 'started', 'confirmed')` |
| **받은 제안 (Inbound)** | 크리에이터의 지원 | `campaign_proposals` | `status` IN `('applied', 'pending', 'viewed')` |
| **보낸 제안 (Outbound)** | 나의 직접 제안<br>**(모먼트 제안 포함)** | `brand_proposals`<br>+ **`moment_proposals`** | `status` IN `('offered', 'negotiating')` |
| **거절됨 (Rejected)** | 거절하거나 취소된 건 | `All Sources` | `status` == `'rejected'` |
| **완료됨 (Completed)** | 종료된 협업 | `All Sources` | `status` == `'completed'` |

### 모먼트 제안 통합 로직 (Moment Integration)
*   `moment_proposals` 데이터는 **`brandProposals`** 배열에 병합되어 **"보낸 제안 (Outbound)"** 탭에 표시됩니다.
*   **구분:** `type: 'moment_offer'`로 식별됩니다.

---

## 3. 크리에이터 워크스페이스 (Creator Workspace)

**위치:** `app/creator/page.tsx`

| 탭 (UI Tab) | 설명 | 데이터 소스 (Merged) | 필터링 로직 (Filter Logic) |
| :--- | :--- | :--- | :--- |
| **전체 보기 (All)** | 모든 제안 내역 | `All Sources` | `campaignProposals` + `brandProposals` |
| **진행중 (Active)** | 매칭되어 진행 중 | `All Sources` | `status` IN `('accepted', 'signed', 'started', 'confirmed')` |
| **받은 제안 (Inbound)** | 브랜드의 직접 제안<br>**(모먼트 제안 포함)** | `brand_proposals`<br>+ **`moment_proposals`** | `status` IN `('offered', 'negotiating', 'pending')` |
| **보낸 지원 (Outbound)** | 나의 캠페인 지원 | `campaign_proposals` | `status` IN `('applied', 'pending', 'viewed')` |
| **거절됨 (Rejected)** | 거절당하거나 거절한 건 | `All Sources` | `status` == `'rejected'` |
| **완료됨 (Completed)** | 종료된 협업 | `All Sources` | `status` == `'completed'` |

### 모먼트 제안 통합 로직 (Moment Integration)
*   `moment_proposals` 데이터는 **`brandProposals`** 배열에 병합되어 **"받은 제안 (Inbound)"** 탭에 표시됩니다.
*   **구분:** `type: 'moment_offer'`로 식별됩니다.

---

## 4. 데이터 주입 매핑 (Data Injection Mapping)

UI 컴포넌트 (`ApplicationListRow`) 호환성을 위해 `ProposalProvider`는 DB 데이터를 변환합니다.

### Campaign Application (캠페인 지원)
*   `brand_name` ← `campaigns.profiles.display_name`
*   `product_name` ← `campaigns.product_name`

### Brand Proposal (직접 제안)
*   `brand_name` ← `profiles.display_name`
*   `product_name` ← `product_name` (Direct)

### Moment Proposal (모먼트 제안)
*   `brand_name` ← `profiles.display_name`
*   `product_name` ← `moment.title` (또는 연관된 `product_name`)

# Claude Merge Guide (Since Commit `70f70d5`)

이 문서는 `70f70d5` 커밋 (2026-03-04 12:13) 이후 현재 작업 디렉토리에 존재하는 **새로운 파일(New Files)**과 **수정된 파일(Modified Files)**의 정확한 변경 내역을 요약한 가이드입니다. Claude를 활용한 병합(Merge) 시 기준 자료로 사용해주세요.

현재 모든 Diff의 원형(Raw) 데이터는 터미널 옵션이나 아래 명령어를 통해 언제든 추출할 수 있습니다:
`git diff HEAD > /tmp/changes_since_70f70d5.diff`

---

## 1. 신규 추가된 파일 (New Files)
기존 버전에 없었으며 새롭게 작성된 파일 목록입니다.

### 📝 API & 컴포넌트
- **`app/api/contest-settlement/route.ts`**
  - **역할**: 콘테스트 정산 로직을 처리하는 Next.js 서버리스 API 라우트.
- **`components/creator/views/CreatorContestStatusView.tsx`**
  - **역할**: 크리에이터 대시보드에서 본인이 지원한 콘테스트 현황(대기/선발/탈락 등)을 확인하는 전용 뷰 컴포넌트.

### 🗄 DB 마이그레이션 스크립트 (Supabase)
이 프로젝트에서 가장 크게 변경된 데이터베이스 마이그레이션 파일들입니다. **반드시 순서대로 Supabase SQL Editor에서 실행**되어야 합니다.
- **`supabase/migrations/41_fix_contest_settlement_trigger.sql`**
- **`supabase/migrations/41_team_invitation_rpc.sql`**
- **`supabase/migrations/42_add_maintenance_period_to_contests.sql`**
  - 콘테스트 테이블에 유지 기간(maintenance_period) 컬럼 추가.
- **`supabase/migrations/43_fix_contest_escrow_use_deposit_balance.sql`**
  - 콘테스트 전용 에스크로 및 예치금(deposit) 처리 로직 수정.
- **`supabase/migrations/44_contest_fullstack_fix.sql`**
  - **(핵심 변경)** `select_contest_challenger` RPC 및 `workspaces` 테이블 Insert 오류 완전 수정. 존재하지 않는 컬럼(`updated_at`, `proposal_type` 등) 참조를 제거하고, `brand_id`, `creator_id`, `product_name`, `created_at` 등 실제 존재하는 필수 컬럼만으로 로직 최소화.
- **`supabase/migrations/45_add_brand_note_to_contest_applications.sql`**
  - 브랜드가 챌린저를 평가할 때 작성하는 메모 컬럼(`brand_note`)을 지원서 테이블에 추가.

### 🛠 기타 테스트 & 마이그레이션 유틸 (Root & Scripts)
- `apply_migration_node.ts`, `check_teams_cols.ts`, `migrate_teams.ts`, `reload_schema.ts`
- `scripts/fix-beauty-products.ts`, `scripts/seed-beauty-mock.ts`, `scripts/test-budget.js`, `scripts/test-db.js`, `scripts/test-insert.js`
- `test_teams_columns.ts`, `test_teams_mcn.ts`

---

## 2. 기존 코드가 수정된 파일 (Modified Files)
기존 컴포넌트 내에 기능이 추가/수정된 내역입니다.

### 💼 관리자 (Admin)
- **`app/admin/page.tsx`**
  - **변경점**: `financeLog` 상태 및 `fetchFinanceLog` 추가. 예치금 내역, 정산 지급 기록, 각 제안(Product/Moment/Campaign)별 결제 완료 내역을 한곳으로 취합하여 렌더링하도록 Admin 페이지 확장.

### 🏢 브랜드 워크스페이스 (Brand)
- **`components/brand/views/ContestAwardView.tsx`**
  - **변경점**: 
    - 크리에이터 지원서의 `performance_metrics`(좋아요, 조회수 등) 렌더링 로직 추가.
    - 랭킹/수상자 선택 UI 개편. 
    - `handleFinalize`(시상 확정 및 정산 실행) 비즈니스 로직 및 UX 버튼 구현.
- **`components/brand/views/ContestBuilderView.tsx`**
  - **변경점**: `isPublishing`, `isEscrowModalOpen`, `creditBalance` 상태 추가를 통한 콘테스트 등록/결제/에스크로 모달 연동.
- **`components/brand/views/ContestManagerView.tsx`**
  - **변경점**: 
    - 챔린저 조회를 위한 `sortBy`, `filterChannel` 등 필터 상태 추가.
    - 브랜드 메모(`brand_note`) 작성/수정 팝업 적용.
    - 지원자 리스트 페치(`fetchApplicants`) 시 `workspace_id` 관련 조인 실패에 대비한 **자동 Fallback 쿼리 재시도** 로직 구현.
    - 챔린저 선발(`handleSelectChallenger`) RPC 연동 및 에러 상세 파싱 로직 적용. 에러 발생 시 명확한 마이그레이션 안내 문구(Toast) 출력. 
    - 선발 완료 후 인앱 알림(`sendNotification`) 전송 로직 탑재.

### 🎨 크리에이터 대시보드 (Creator)
- **`components/creator/creator-dashboard.tsx`**
  - **변경점**: 좌측 탭 아카이브를 "내 모먼트/콘테스트/협업 아카이브"로 개편.
  - **핵심 수정**: 글로벌 로딩 가드 우회(Bypass). 전체 Provider가 로딩(`isLoading`) 중일 때 `ContestDiscoverView`와 `CreatorContestStatusView`가 무한 로딩되는 현상을 방지하기 위해, 이 두 뷰는 즉시 렌더링되도록 수정.

### 🤝 워크스페이스 공통 (Workspace Common)
- **`components/workspace/common/info-panel.tsx`**
  - **변경점**: 역할(`brand` / `creator`)과 진행 단계(Stage)에 따라 동적으로 상태를 보여주는 인포메이션 패널 전면 개편(약 150줄 추가). 콘텐츠 제출/피드백 등의 단계별 정보 패널 UX 정교화.

### ⚙️ 기타 마이너 UI & 라우팅 수정
- `app/moment/[id]/page.tsx`
- `components/brand/brand-dashboard.tsx`
- `components/brand/views/DepositView.tsx`
- `components/cards/ContestCard.tsx`
- `components/creator/views/ContestDiscoverView.tsx`
- `components/creator/views/MomentsView.tsx`
- `components/creator/views/WorkspaceView.tsx`
- `components/dialogs/ContestDetailDialog.tsx`
- `components/workspace/(brand|creator|common)/desktop-layout.tsx`
- `components/workspace/common/smart-contract-panel.tsx`
- `lib/compute-workspace-stage.ts`

---
**💡 Claude에게 보내는 프롬프트 팁:**
이 파일을 통째로 복사해서, "현재 `git diff HEAD` 내역을 이 구조에 맞게 순차적으로 리팩토링 및 병합해줘" 라고 지시하시면 됩니다. 복잡한 SQL 마이그레이션(특히 44번)과 `ContestManagerView`, `creator-dashboard`의 우회 로직이 핵심 병합 포인트입니다.

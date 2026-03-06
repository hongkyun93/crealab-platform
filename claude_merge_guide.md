# Claude Merge Guide (Since Commit `70f70d5`)

기준 커밋: `70f70d5` — 2026-03-04 12:13 (친구가 클론한 시점)
이후 로컬에 변경된 파일 총 **63개**, 미커밋 상태.

> 머지 전 체크: `git diff 70f70d5 --stat`으로 현황 재확인 가능

---

## 1. 콘테스트 시스템 전면 확장

**왜 만든 건지:**
브랜드가 콘테스트를 열면 크리에이터들이 지원하고, 브랜드가 실제 인스타 성과를 보면서 수상자를 고르고, 금액을 자동 정산하는 풀스택 흐름이 필요했음. 기존엔 콘테스트 등록/지원까지만 됐고, 선발→정산 사이의 흐름이 없었음.

### 신규 파일
- **`app/api/contest-settlement/route.ts`**
  - 수상자 선정 후 에스크로에서 크리에이터에게 금액 지급하는 API
- **`components/creator/views/CreatorContestStatusView.tsx`**
  - 크리에이터가 "내가 지원한 콘테스트 어떻게 됐어?" 확인하는 화면 (대기/선발/탈락 상태)

### DB 마이그레이션 (순서대로 실행 필요)
- **`41_fix_contest_settlement_trigger.sql`** — 정산 트리거 버그 수정
- **`41_team_invitation_rpc.sql`** — MCN 팀 초대 RPC 추가
- **`42_add_maintenance_period_to_contests.sql`** — 콘테스트에 유지기간 컬럼 추가
- **`43_fix_contest_escrow_use_deposit_balance.sql`** — 에스크로 예치금 처리 오류 수정
- **`44_contest_fullstack_fix.sql`** ⭐ 핵심 — `select_contest_challenger` RPC 오류 완전 수정, workspaces insert 오류 수정
- **`45_add_brand_note_to_contest_applications.sql`** — 브랜드가 지원자에 메모 남기는 컬럼 추가

### 수정 파일
- **`components/brand/views/ContestBuilderView.tsx`**
  - 왜: 콘테스트 등록 시 에스크로 결제 모달 연동. 기존엔 결제 없이 등록됐음.
- **`components/brand/views/ContestManagerView.tsx`**
  - 왜: 지원자 목록에서 인스타 성과 보면서 챌린저 선발하는 UX. 메모 기능, 선발 RPC 연동, 선발 시 알림 발송.
- **`components/brand/views/ContestAwardView.tsx`**
  - 왜: 수상자 최종 확정 + 정산 실행. 성과 지표(좋아요/조회수) 렌더링.
- **`components/creator/creator-dashboard.tsx`** (콘테스트 관련 부분)
  - 왜: 좌측 탭에 콘테스트 현황 뷰 추가. 로딩 가드 때문에 무한 스피너 걸리던 것 수정.
- **`components/cards/ContestCard.tsx`**, **`components/dialogs/ContestDetailDialog.tsx`**
  - 왜: 콘테스트 카드/다이얼로그 UI 개선
- **`components/creator/views/ContestDiscoverView.tsx`**
  - 왜: 크리에이터 콘테스트 탐색 화면 개선

---

## 2. 인스타그램 데이터 연동

**왜 만든 건지:**
콘테스트 수상자 선정할 때 브랜드가 지원자의 실제 인스타 게시물 성과(좋아요 수, 댓글 수, 조회수)를 보면서 고를 수 있게. 기존엔 그냥 지원서 텍스트만 있었음.

- **`app/api/instagram/media/route.ts`** — 특정 크리에이터의 인스타 미디어 조회 API
- **`app/api/instagram/profile-stats/route.ts`** — 프로필 통계 조회 (팔로워수, 인게이지먼트율 등)

---

## 3. MCN 대시보드 신규 구축

**왜 만든 건지:**
MCN/에이전시 계정이 소속 크리에이터들을 한 화면에서 관리할 수 있는 전용 대시보드가 필요했음. 기존엔 MCN 계정이 로그인해도 딱히 MCN스러운 기능이 없었음.

- **`components/mcn/mcn-dashboard.tsx`** — MCN 대시보드 메인. 탭 구성: 포트폴리오 / 크리에이터 관리(Overview) / 프록시 / 제안서 / 캘린더 / 정산 / 팀 관리
- **`components/mcn/views/mcn-quick-dashboard-view.tsx`** — "크리에이터 관리" 탭. 왼쪽에 소속 크리에이터 현황 리스트, 오른쪽에 클릭한 크리에이터 대시보드 임베드
- **`components/mcn/invite-link-generator.tsx`** — 크리에이터에게 팀 초대 링크 생성

### 오늘(2026-03-06) 추가 수정 — Supabase에 직접 적용 완료
- `get_team_proposals` RPC 재작성 — alias 전부 교정, workspaces JOIN으로 데이터 소스 수정
- `get_team_dashboard_summary` RPC 재작성 — 없는 컬럼 참조 제거
- RLS 정책 4개 추가 — MCN이 소속 크리에이터 데이터를 직접 쿼리할 수 있게
- 탭명 "빠른 관제탑" → "크리에이터 관리", "빠른 관제 리스트" → "크리에이터 현황 리스트"
- 임베드 헤더 "님의 워크스페이스" → "님의 대시보드"
- "내 일정 관리" h1 제거, "새 모먼트 만들기" 버튼을 내 모먼트 관리 카드 안으로 이동

---

## 4. 크리에이터 프로필 카드

**왜 만든 건지:**
MCN 포트폴리오 기능에서 브랜드에게 크리에이터를 소개할 때 쓸 카드. 인스타 데이터(팔로워, 최근 게시물, 인사이트 등)를 보여주는 리치한 카드 컴포넌트가 필요했음.

- **`components/profile/CreatorProfileCard.tsx`** — 대규모 개편 (인스타 포트폴리오 표시)

---

## 5. 홈 / 서비스 소개 페이지

**왜 만든 건지:**
랜딩 페이지를 업데이트하고 서비스 소개 페이지를 새로 만들어서 마케팅/영업에 활용하려고.

- **`app/page.tsx`** — 홈페이지 대규모 개편
- **`app/services/page.tsx`** — 신규 서비스 소개 페이지

---

## 6. 예치금 / 정산 / 어드민

**왜 만든 건지:**
콘테스트 에스크로 시스템이 생기면서 브랜드 예치금 관리와 관리자 재무 로그 뷰도 필요해졌음.

- **`components/brand/views/DepositView.tsx`** — 브랜드 예치금 뷰 개선
- **`app/admin/page.tsx`** — 어드민에서 예치금 내역, 정산 지급 기록 한눈에 확인

---

## 7. 워크스페이스 개선

**왜 만든 건지:**
워크스페이스 안에서 역할(브랜드/크리에이터)과 진행 단계에 따라 맞는 정보를 보여주는 패널이 필요했음. 기존엔 단계별 UX가 부족했음.

- **`components/workspace/common/info-panel.tsx`** — 단계별 동적 정보 패널 전면 개편
- **`components/workspace/common/smart-contract-panel.tsx`** — 스마트 계약 패널 개선
- **`lib/compute-workspace-stage.ts`** — 워크스페이스 단계 계산 로직 수정
- **`components/creator/views/WorkspaceView.tsx`** — 크리에이터 워크스페이스 뷰 개선
- **`components/creator/views/MomentsView.tsx`** — 모먼트 목록 뷰 대규모 개선

---

## 8. 설정 / 팀 관리

- **`app/settings/team/page.tsx`** — MCN 팀 멤버 관리 설정 페이지 개선

---

## 9. 기타 유틸 / 스크립트 (머지 시 무시 가능)

테스트/시딩용 스크립트들. 프로덕션 코드 아님.
- `scripts/seed-beauty-mock.ts`, `scripts/fix-beauty-products.ts` — 뷰티 브랜드 목 데이터
- `apply_migration_node.ts`, `migrate_teams.ts`, `reload_schema.ts` 등 — DB 마이그레이션 유틸
- `test_teams_columns.ts`, `test_teams_mcn.ts`, `scripts/test-*.js` — 테스트 스크립트

---

## 머지 순서 권장

1. **DB 마이그레이션 먼저** (41 → 42 → 43 → 44 → 45 순서로 Supabase SQL Editor 실행)
   - Supabase RPC/RLS는 이미 오늘 직접 적용됨 → 재실행 불필요
2. **코드 머지** — 충돌 날 가능성 높은 파일: `creator-dashboard.tsx`, `ContestManagerView.tsx`
3. **테스트**: 콘테스트 선발 흐름, MCN 대시보드, 워크스페이스 단계 확인

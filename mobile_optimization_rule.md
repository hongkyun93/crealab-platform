# Mobile Optimization Rule
> CreadyPick / Crealab Platform — 모바일 최적화 규칙 및 워크스페이스 Phase 문서

---

## ⚠️ 절대 규칙 (위반 금지)

### 1. 가로 스크롤 절대 금지
- `overflow-x-auto`, `overflow-x-scroll` 사용 금지
- 콘텐츠 overflow는 `flex-wrap`, `grid`, 글씨 축소, 컴포넌트 재구성으로 해결

### 2. 모바일 변경은 데스크탑에 영향 없어야 함
- 모바일 전용 클래스는 반드시 `md:` prefix로 격리
- 베이스 클래스 변경 시 데스크탑 영향 없는지 검토 후 적용

### 3. Tailwind 반응형 세트 규칙
| 모바일 추가 | 반드시 함께 붙일 것 |
|---|---|
| `w-full` | `md:w-auto` |
| `grid-cols-N` | `md:flex` 또는 `md:grid-cols-기존값` |
| `flex-col` 제거 | `md:gap-기존값` 복원 |
| `hidden` | `md:block` 또는 `md:flex` 또는 `md:inline-flex` |

### 4. className prop 중복 금지
- `hidden`, `md:inline-flex` 등은 반드시 **기존 template literal 안에** 병합
- React에서 같은 prop 두 번 사용 시 두 번째가 첫 번째를 완전 덮어씀 → 색상 등 소실

---

## 📋 워크스페이스 모바일 최적화 — Phase별 상세

### Phase 1. 탭 레이아웃
**파일:** `app/creator/page.tsx`

**메인 탭 6개** (전체 보기 / 진행중 / 받은 제안 / 보낸 제안 / 거절됨 / 완료됨)
- 모바일: `grid-cols-3` (2행 × 3열), 숫자 카운트 `hidden md:inline`
- 데스크탑: 기존 `md:flex md:flex-wrap`, 숫자 표시 유지
- `TabsTrigger`: `w-full md:w-auto md:min-w-[...]`

**서브탭 4개** (전체 / 모먼트 / 캠페인 / 브랜드)
- 모바일: `grid-cols-4` (1행 균등), `px-2`, 겹침 없음
- 데스크탑: `md:flex md:flex-wrap`, `md:w-auto md:min-w-[...]`, `md:px-4`
- 버튼: `w-full md:w-auto md:min-w-[90~100px] px-2 md:px-4`

---

### Phase 2. 뷰 모드 토글
**파일:** `app/creator/page.tsx`

- 리스트 / 그리드 / 테이블 선택 UI: `hidden md:flex`
- 모바일: 항상 리스트형 고정 (state 기본값 `'list'` 유지, 별도 로직 불필요)
- 데스크탑: 기존 3가지 뷰 선택 유지

---

### Phase 3. 카드 레이아웃
**파일:** `app/creator/page.tsx` → `renderWorkspaceItems()` LIST VIEW 섹션

**목표 레이아웃:**
```
[모바일]
[아바타 64px] │ [제품명 (text-base)]
               │ [브랜드명 • 날짜]
[─────── Progress Bar (전체 너비) ───────]

[데스크탑]
[아바타 64px] │ [제품명 (text-xl)] [상태배지]  [가이드보기 버튼]
               │ [브랜드명 • 날짜]
               │ [─── Progress Bar (md:pl-[88px]) ───]
```

**세부 변경 사항:**
1. 아바타 + 콘텐츠 래퍼: `flex flex-row items-start gap-4 md:gap-6`
2. Progress bar: 아바타-콘텐츠 flex-row 컨테이너 **바깥**에 배치 → `mt-4 md:pl-[88px] flex items-center gap-4`
3. 제품명 `h3`: `font-bold text-base md:text-xl flex items-center gap-2`
4. 상태 배지: template literal 안에 `hidden md:inline-flex` 포함 (prop 중복 금지)

---

### Phase 4. 전역 컴포넌트
**파일:** `components/site-footer.tsx`

- Footer: `hidden md:block` → 모바일 숨김, 데스크탑 유지

---

## 🔁 작업 체크리스트 (모바일 변경 전 확인)

- [ ] 변경 전 데스크탑 레이아웃 스크린샷 또는 코드 기억
- [ ] `w-full` 추가 시 → `md:w-auto` 세트 확인
- [ ] `grid` 추가 시 → `md:flex` 또는 `md:grid-cols-원래값` 확인
- [ ] `className` 중복 없는지 확인 (template literal 병합)
- [ ] 변경 후 데스크탑 렌더링 이상 없는지 확인

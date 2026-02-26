# CreadyPick `/app/` 폴더 구조 맵

> Last updated: 2026-02-26

---

## 🔐 인증 & 계정

| 폴더                  | URL                  | 용도                                          |
|-----------------------|----------------------|-----------------------------------------------|
| `auth/`               | `/auth`              | Supabase Auth 콜백 처리 (OAuth 리다이렉트)    |
| `login/`              | `/login`             | 로그인 페이지                                 |
| `signup/`             | `/signup`            | 회원가입 페이지                               |
| `join/`               | `/join`              | 초대 링크를 통한 팀 합류                      |
| `onboarding/`         | `/onboarding`        | 신규 유저 온보딩 (역할 선택, 프로필 초기 설정)|
| `forgot-password/`    | `/forgot-password`   | 비밀번호 찾기                                 |
| `reset-password/`     | `/reset-password`    | 비밀번호 재설정                               |

---

## 👤 역할별 대시보드

| 폴더          | URL        | 용도                                                    |
|---------------|------------|---------------------------------------------------------|
| `brand/`      | `/brand`   | **브랜드** 대시보드 (캠페인 관리, 프로덕트, 지원서 등) |
| `creator/`    | `/creator` | **크리에이터** 대시보드 (모먼트, 포트폴리오, 지원 현황 등) |
| `mcn/`        | `/mcn`     | **MCN** 대시보드 (팀 크리에이터 관리, 통계 등)         |

---

## 🛠️ 서비스 / 기능 페이지

| 폴더                  | URL                   | 용도                              |
|-----------------------|-----------------------|-----------------------------------|
| `brand-services/`     | `/brand-services`     | 브랜드용 서비스 소개 랜딩         |
| `creator-services/`   | `/creator-services`   | 크리에이터용 서비스 소개 랜딩     |
| `mcn-services/`       | `/mcn-services`       | MCN용 서비스 소개 랜딩            |
| `services/`           | `/services`           | 공통 서비스 소개 페이지           |
| `campaign/`           | `/campaign`           | 캠페인 상세 공개 페이지           |
| `event/`              | `/event`              | 이벤트 상세 공개 페이지 (공유 URL용) |
| `message/`            | `/message`            | 메시지 / 채팅                     |
| `settings/`           | `/settings`           | 계정 설정 (프로필, SNS 연동 등)   |

---

## ⚙️ 시스템 / 내부

| 폴더         | 용도                                        |
|--------------|---------------------------------------------|
| `api/`       | Next.js API Routes — 서버사이드 로직 (20개) |
| `actions/`   | Next.js Server Actions                      |
| `admin/`     | 관리자 전용 페이지                          |

### 주요 API 라우트

| 경로                              | 용도                              |
|-----------------------------------|-----------------------------------|
| `/api/instagram/delete-basic`     | Meta 데이터 삭제 콜백 (심사 필수) |
| `/api/instagram/callback`         | Instagram OAuth 콜백              |
| `/api/instagram/profile-stats`    | 인스타그램 프로필 통계 조회       |
| `/api/account/delete`             | 계정 탈퇴 API (POST only)         |

---

## 📜 법적 / 공개 문서

| 폴더          | URL        | 용도               |
|---------------|------------|--------------------|
| `privacy/`    | `/privacy` | 개인정보처리방침   |
| `terms/`      | `/terms`   | 이용약관           |

---

## 🧪 개발 / 디버그 전용

| 폴더                    | 용도                                      |
|-------------------------|-------------------------------------------|
| `design-lab/`           | UI 컴포넌트 디자인 실험실 (프로덕션 미노출) |
| `debug-notifications/`  | 알림 시스템 디버그 페이지                 |
| `debug-session/`        | 세션 상태 디버그 페이지                   |
| `sentry-example-page/`  | Sentry 에러 트래킹 테스트                 |

---

## 📄 루트 파일

| 파일                    | 용도                    |
|-------------------------|-------------------------|
| `page.tsx`              | 메인 랜딩 페이지        |
| `layout.tsx`            | 전체 앱 루트 레이아웃   |
| `globals.css`           | 전역 CSS 스타일         |
| `opengraph-image.tsx`   | OG 이미지 자동 생성     |
| `robots.ts`             | 검색엔진 크롤링 규칙    |
| `sitemap.ts`            | SEO 사이트맵 자동 생성  |
| `global-error.tsx`      | 전역 에러 핸들링 UI     |

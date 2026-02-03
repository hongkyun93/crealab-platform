# 🔑 소셜 로그인 설정 가이드 (Supabase)

"Provider is not enabled" 에러는 Supabase 대시보드에서 해당 로그인을 켜지 않았기 때문에 발생합니다.
소셜 로그인을 켜려면 각 플랫폼(구글, 카카오)에서 **ID와 비밀키(Secret)**를 발급받아 Supabase에 입력해야 합니다.

---

## 1. Google 로그인 설정
> 가장 쉽고 빠르게 테스트해볼 수 있습니다.

1.  **[Google Cloud Console](https://console.cloud.google.com/)** 접속 및 프로젝트 생성.
2.  **"API 및 서비스" > "사용자 인증 정보" (Credentials)** 메뉴로 이동.
3.  **"+ 사용자 인증 정보 만들기" > "OAuth 클라이언트 ID"** 선택.
4.  **애플리케이션 유형**: `웹 애플리케이션` 선택.
5.  **승인된 리디렉션 URI (Authorized redirect URIs)**에 아래 주소 추가:
    *   `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback`
    *   *(이 주소는 Supabase 대시보드 > Auth > Providers > Google 설정 화면 상단에서 복사할 수 있습니다)*
6.  생성 완료 후 나오는 **`클라이언트 ID`**와 **`클라이언트 보안 비밀(Secret)`**을 복사.
7.  **Supabase 대시보드 > Authentication > Providers > Google**을 누르고:
    *   **Enable Sign in with Google** 토글 켜기 (ON)
    *   복사한 ID와 Secret 붙여넣기.
    *   저장 (Save).

---

## 2. 카카오 로그인 설정
> 한국 서비스 필수 기능입니다.

1.  **[Kakao Developers](https://developers.kakao.com/)** 접속 및 "내 애플리케이션" 생성.
2.  **요약 정보**에서 **`REST API 키`** 복사 (이게 Client ID 역할).
3.  왼쪽 메뉴 **"카카오 로그인"** 클릭 > 상태를 **"ON"**으로 변경.
4.  **"Redirect URI"** 설정에 주소 추가:
    *   `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback`
5.  왼쪽 메뉴 **"카카오 로그인" > "보안"** 클릭:
    *   **Client Secret** 코드 생성 및 복사.
6.  **Supabase 대시보드 > Authentication > Providers > Kakao**를 누르고:
    *   **Enable Sign in with Kakao** 토글 켜기 (ON)
    *   `Client ID` 칸에 **REST API 키** 입력.
    *   `Client Secret` 칸에 **Client Secret** 입력.
    *   저장 (Save).

---

---

## 3. 배포 후 URL 설정 (필수)
> 배포된 웹사이트에서 로그인이 작동하려면 이 설정이 꼭 필요합니다.

1.  **Supabase 대시보드 > Authentication > URL Configuration** 메뉴로 이동.
2.  **Redirect URLs** 섹션에서 **"Add URL"** 클릭.
3.  아래 주소를 입력하고 **Save**:
    *   `https://crealab-platform.vercel.app/auth/callback`
    *   *(선택사항)* `https://crealab-platform.vercel.app/**` (전체 허용)

---

## 💡 팁
설정을 완료하고 저장하셨다면, 약 1분 뒤에 웹사이트에서 다시 로그인 버튼을 눌러보세요. 정상 작동할 것입니다!

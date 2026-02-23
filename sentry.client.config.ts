// sentry.client.config.ts
// 클라이언트 사이드 에러 캡처 설정
import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // 프로덕션에서만 활성화
    enabled: process.env.NODE_ENV === "production",

    // 100% 샘플링 (초기에는 모두 캡처, 트래픽 많아지면 줄이기)
    tracesSampleRate: 1.0,

    // 세션 리플레이: 에러 발생 전후 사용자 화면 녹화
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,       // 민감한 텍스트 마스킹
            blockAllMedia: false,
        }),
    ],

    // 알려진 외부 에러 무시 (광고 차단, 네트워크 오류)
    ignoreErrors: [
        "Non-Error promise rejection captured",
        "ResizeObserver loop limit exceeded",
        "Network Error",
    ],
});

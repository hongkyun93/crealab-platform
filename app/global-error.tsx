"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#f8f8f8',
        color: '#111',
        margin: 0,
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>예상치 못한 오류가 발생했습니다</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          잠시 후 다시 시도해 주세요. 문제가 지속되면 고객센터로 문의해주세요.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '0.6rem 1.5rem',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          다시 시도하기
        </button>
      </body>
    </html>
  );
}

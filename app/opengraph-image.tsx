import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'CreadyPick - 제품이 필요한 바로 그 순간에 연결합니다'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0f172a',
                    backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 80px',
                    }}
                >
                    <div
                        style={{
                            fontSize: 72,
                            fontWeight: 900,
                            letterSpacing: '-0.03em',
                            marginBottom: 24,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        CreadyPick
                    </div>
                    <div
                        style={{
                            fontSize: 36,
                            fontWeight: 700,
                            color: '#a5b4fc',
                            textAlign: 'center',
                            marginBottom: 16,
                        }}
                    >
                        제품이 필요한 바로 그 순간에 연결합니다
                    </div>
                    <div
                        style={{
                            fontSize: 22,
                            fontWeight: 500,
                            color: '#94a3b8',
                            textAlign: 'center',
                        }}
                    >
                        라이프 모먼트 기반 크리에이터 매칭 플랫폼 | 가입비 무료 · 수수료 0%
                    </div>
                </div>
                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        fontSize: 20,
                        color: '#64748b',
                    }}
                >
                    www.creadypick.com
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}

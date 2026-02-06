import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Creadypick - 브랜드와 크리에이터의 타이밍 매칭'
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
                    backgroundColor: 'white',
                    backgroundImage: 'linear-gradient(to bottom right, #fff 50%, #f0f9ff 100%)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '4px solid #000',
                        borderRadius: '20px',
                        padding: '40px 80px',
                        boxShadow: '10px 10px 0px 0px rgba(0,0,0,1)',
                        backgroundColor: '#fff',
                    }}
                >
                    <div
                        style={{
                            fontSize: 64,
                            fontWeight: 900,
                            letterSpacing: '-0.05em',
                            marginBottom: 20,
                            color: 'black',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {/* Simple SVG Logo Icon */}
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ marginRight: 20 }}
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                        Creadypick
                    </div>
                    <div
                        style={{
                            fontSize: 32,
                            fontWeight: 600,
                            color: '#4b5563',
                            textAlign: 'center',
                        }}
                    >
                        광고는 타이밍! 라이프 모먼트 매칭
                    </div>
                </div>
                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        fontSize: 24,
                        color: '#9ca3af',
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

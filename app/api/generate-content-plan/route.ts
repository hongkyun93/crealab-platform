
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const FALLBACK_PLAN = `
# 📝 콘텐츠 기획안 (기본)

## 1. 영상 컨셉
- **제목:** [제품명] 이거 하나면 끝! 솔직 리뷰
- **핵심 메시지:** 이 제품의 가장 큰 장점을 강조해보세요.

## 2. 오프닝 (0~3초)
- 시선을 사로잡는 제품 사용 장면을 보여주세요.
- "아직도 이거 모르시는 분?" 질문으로 시작.

## 3. 본문 (3~50초)
- 직접 사용하는 모습을 보여주세요.
- 비포/애프터 비교가 가능하다면 꼭 포함하세요.
- 제품의 특징 3가지를 빠르게 나열하세요.

## 4. 클로징 (50~60초)
- 구매 링크를 언급하세요.
- "팔로우하고 더 많은 꿀팁 받아가세요!" 멘트로 마무리.
`;

export async function POST(req: Request) {
    try {
        const { productName, sellingPoints, category, requiredShots } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn("API Key missing, returning fallback plan.");
            return NextResponse.json({ result: FALLBACK_PLAN, isFallback: true });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `
당신은 베테랑 콘텐츠 기획자이자 유튜브/인스타그램 숏폼 전문가입니다.
사용자로부터 제품 정보를 입력받아, 조회수가 잘 나올만한 매력적인 1분 미만의 숏폼 영상 기획안을 작성해주세요.

[제품 정보]
- 제품명: ${productName}
- 카테고리: ${category}
- 소구 포인트(강점): ${sellingPoints}
- 필수 포함 장면: ${requiredShots}

[요청 사항]
1.  **후킹(Hook)**: 스크롤을 멈추게 할 강력한 오프닝 멘트나 장면을 제안하세요.
2.  **스토리텔링**: 단순 나열이 아닌, 시청자가 공감할 수 있는 이야기 흐름으로 구성하세요.
3.  **촬영 팁**: 예쁘게 찍을 수 있는 구도나 조명 팁도 한 줄씩 추가해주세요.
4.  **출력 형식**: 읽기 편한 Markdown 형식으로 제목, 오프닝, 본문, 클로징, 촬영팁 섹션을 나누어 작성하세요. 이모지를 적절히 사용하여 생동감을 더하세요.
5.  **톤앤매너**: 트렌디하고 친근한 말투를 사용하세요.

기획안을 작성해주세요.
`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ result: text, isFallback: false });

    } catch (error: any) {
        console.error("AI Plan Generation Failed:", error);
        return NextResponse.json({ result: FALLBACK_PLAN, isFallback: true, error: error.message });
    }
}

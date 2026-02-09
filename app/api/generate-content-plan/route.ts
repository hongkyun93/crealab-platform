
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
당신은 베테랑 콘텐츠 기획자이자 인플루언서 매니지먼트 전문가입니다.
사용자로부터 제품 정보를 입력받아, 브랜드에게 어필할 수 있는 **지원 동기**와 **콘텐츠 제작 계획**을 작성해주세요.

[제품 정보]
- 제품명: ${productName}
- 카테고리: ${category}
- 소구 포인트(강점): ${sellingPoints}
- 필수 포함 장면: ${requiredShots}

[작성 가이드]
1. **지원 동기 (motivation)**:
   - "이 제품/브랜드를 왜 좋아하는지", "내 팔로워들에게 왜 잘 맞는지"를 중심으로 진정성 있게 작성하세요.
   - 너무 딱딱하지 않게, 열정이 느껴지는 톤으로 작성하세요. (200자 내외)

2. **콘텐츠 제작 계획 (content_plan)**:
   - 릴스/숏폼 영상 기준으로 작성하세요.
   - [초반 3초 후킹] -> [본론(제품 시연/특징)] -> [클로징(구매유도)] 흐름으로 구체적으로 작성하세요.
   - 촬영 구도나 연출 팁을 포함하세요. (300자 내외)

**반드시 오직 JSON 형식으로만 응답하세요.**
형식:
{
  "motivation": "작성된 지원 동기 텍스트...",
  "content_plan": "작성된 콘텐츠 기획안 텍스트..."
}
`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        const response = await result.response;
        const text = response.text();

        // Parse JSON safely
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse AI JSON:", text);
            // Fallback if JSON parsing fails but text exists (rare with responseMimeType)
            jsonResponse = {
                motivation: "AI 생성 중 오류가 발생했습니다. 직접 작성해주세요.",
                content_plan: text
            };
        }

        return NextResponse.json({ result: jsonResponse, isFallback: false });

        return NextResponse.json({ result: text, isFallback: false });

    } catch (error: any) {
        console.error("AI Plan Generation Failed:", error);
        return NextResponse.json({ result: FALLBACK_PLAN, isFallback: true, error: error.message });
    }
}

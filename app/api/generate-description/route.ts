import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // 인증 검증: 로그인된 사용자만 사용 가능
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY not configured" },
                { status: 500 }
            );
        }

        const { title, tags, targetProduct } = await req.json();

        if (!title && (!tags || tags.length === 0)) {
            return NextResponse.json(
                { error: "title or tags is required" },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
        const model = genAI.getGenerativeModel({ model: modelName });


        const tagsText = tags && tags.length > 0 ? tags.join(", ") : "없음";
        const productText = targetProduct ? targetProduct : "미정";

        const prompt = `
당신은 전문 콘텐츠 마케터입니다. 
크리에이터가 입력한 모먼트 정보를 바탕으로, 브랜드에게 제안할 수 있는 매력적인 [상세 설명]을 작성해주세요.

[작성 가이드]
1. 톤앤매너: 정중하면서도 열정적인, 협업 의지가 돋보이는 말투.
2. 내용:
   - 해당 모먼트(상황)에 대한 구체적인 묘사
   - 브랜드 제품이 왜 필요한지 (니즈 설명)
   - 어떤 식으로 홍보(콘텐츠 제작)가 가능한지 제안
3. 분량: 3~5문장 내외로 간결하게.
4. 언어: 한국어

[입력 정보]
모먼트 제목: ${title || "없음"}
카테고리 태그: ${tagsText}
희망 제품: ${productText}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ description: text });
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate content", details: error.message },
            { status: 500 }
        );
    }
}

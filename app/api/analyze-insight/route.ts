import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get("image") as File;
        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        const mimeType = file.type || "image/png";

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `당신은 인플루언서 마케팅 데이터 분석 전문가입니다.
이 이미지는 Instagram 인사이트 스크린샷입니다. 이미지에서 다음 데이터를 추출해주세요.

반드시 아래의 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.
값을 찾을 수 없으면 null로 설정하세요.

{
  "metrics": {
    "views": <조회수 숫자>,
    "likes": <좋아요 숫자>,
    "comments": <댓글 숫자>,
    "shares": <공유 숫자>,
    "saves": <저장 숫자>,
    "reposts": <리포스트 숫자>,
    "followers": <팔로워 수>,
    "newFollowers": <신규 팔로워>,
    "reach": <도달 수>,
    "interactions": <상호작용 수>,
    "contentCount": <게시물 수>,
    "period": "<기간 텍스트, 예: Jan 20 - Feb 18>"
  },
  "trafficSources": {
    "feed": <피드 비율 숫자>,
    "profile": <프로필 비율 숫자>,
    "search": <검색 비율 숫자>,
    "other": <기타 비율 숫자>
  },
  "screenshotType": "<post_insight | account_dashboard | reel_insight | story_insight | unknown>",
  "rawText": "<이미지에서 읽은 핵심 텍스트 요약>"
}`;

        const result = await model.generateContent([
            { text: prompt },
            {
                inlineData: {
                    mimeType,
                    data: base64,
                },
            },
        ]);

        const response = await result.response;
        let text = response.text();

        // Extract JSON from response (strip markdown code blocks if present)
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            text = jsonMatch[1].trim();
        }

        let extracted;
        try {
            extracted = JSON.parse(text);
        } catch {
            return NextResponse.json({
                error: "Failed to parse AI response",
                rawResponse: text
            }, { status: 500 });
        }

        // Calculate engagement rate and recommended price
        const m = extracted.metrics || {};
        const totalEngagement = (m.likes || 0) + (m.comments || 0) + (m.shares || 0) + (m.saves || 0) + (m.reposts || 0);
        const baseCount = m.views || m.reach || m.followers || 1;
        const engagementRate = (totalEngagement / baseCount) * 100;

        // Engagement multiplier
        let engagementMultiplier = 1.0;
        if (engagementRate >= 10) engagementMultiplier = 2.0;
        else if (engagementRate >= 6) engagementMultiplier = 1.6;
        else if (engagementRate >= 3) engagementMultiplier = 1.3;
        else if (engagementRate < 1) engagementMultiplier = 0.7;

        // Base price from views (CPV ~15원)
        const avgViews = m.views || (m.reach ? Math.round(m.reach * 0.7) : 0);
        const basePrice = avgViews * 15;

        // Recommended price
        const recommendedPrice = Math.round(basePrice * engagementMultiplier / 10000) * 10000; // Round to 만원 단위

        // Grade
        let engagementGrade = "보통";
        let engagementEmoji = "📊";
        if (engagementRate >= 6) { engagementGrade = "매우 높음"; engagementEmoji = "🔥"; }
        else if (engagementRate >= 3) { engagementGrade = "양호"; engagementEmoji = "✅"; }
        else if (engagementRate < 1) { engagementGrade = "낮음"; engagementEmoji = "⚠️"; }

        // Traffic analysis
        const ts = extracted.trafficSources || {};
        const searchPct = ts.search || 0;
        let discoveryGrade = "보통";
        if (searchPct >= 10) discoveryGrade = "검색 유입 우수";
        else if (searchPct >= 3) discoveryGrade = "검색 유입 보통";
        else discoveryGrade = "검색 유입 부족 — 해시태그 최적화 필요";

        const analysis = {
            extracted,
            engagementRate: Math.round(engagementRate * 100) / 100,
            engagementGrade,
            engagementEmoji,
            engagementMultiplier,
            totalEngagement,
            baseCount,
            basePrice,
            recommendedPrice: recommendedPrice > 0 ? recommendedPrice : null,
            discoveryGrade,
            tips: [] as string[],
        };

        // Tips
        if ((m.saves || 0) === 0 && (m.shares || 0) === 0) {
            analysis.tips.push("저장/공유가 0입니다. '저장하고 싶은' 정보성 콘텐츠를 추가해보세요.");
        }
        if (searchPct < 3) {
            analysis.tips.push("검색 유입이 거의 없습니다. 해시태그와 키워드를 최적화하세요.");
        }
        if (engagementRate >= 3) {
            analysis.tips.push("참여율이 좋습니다! 꾸준히 유지하면 브랜드 협업에 유리합니다.");
        }
        if (m.views && m.views > 500 && engagementRate < 1) {
            analysis.tips.push("조회수 대비 반응이 낮습니다. CTA(행동 유도)를 영상에 넣어보세요.");
        }

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error("Insight Analysis Error:", error);
        return NextResponse.json(
            { error: "분석에 실패했습니다.", details: error.message },
            { status: 500 }
        );
    }
}

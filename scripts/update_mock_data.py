import re

file_path = '/Users/kimhongkyun/Crealab/crealab-platform/lib/mock-data.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add isMock: true to MOCK_PRODUCTS
# Pattern: segments like { id: "...", ... category: "..." }
# We want to add isMock: true before the closing }
content = re.sub(r'({ id: "[^"]+", [^}]+)( })', r'\1, isMock: true\2', content)

# Add isMock: true to MOCK_BRAND_PROPOSALS
# These are multi-line objects
# Pattern: id: "p1", ... brand_name: "SAMSUNG"
content = re.sub(r'(brand_name: "[^"]+")\s+(})', r'\1, isMock: true\2', content)

# Add MOCK_MESSAGES
mock_messages = """
export const MOCK_MESSAGES: any[] = [
    {
        id: "m1",
        senderId: "brand_samsung",
        receiverId: "guest_influencer",
        proposalId: "p1",
        content: "안녕하세요! 김수민님, 제안드린 갤럭시 워치 캠페인 확인 부탁드립니다.",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        senderName: "SAMSUNG",
        isMock: true
    },
    {
        id: "m2",
        senderId: "guest_influencer",
        receiverId: "brand_samsung",
        proposalId: "p1",
        content: "네, 안녕하세요! 확인했습니다. 이번 제품 기능이 너무 좋아서 릴스로 제작하면 반응이 좋을 것 같아요.",
        timestamp: new Date(Date.now() - 82800000).toISOString(),
        read: true,
        senderName: "김수민",
        isMock: true
    },
    {
        id: "m3",
        senderId: "brand_samsung",
        receiverId: "guest_influencer",
        proposalId: "p1",
        content: "좋습니다! 가이드라인 전달드리면 검토 부탁드릴게요.",
        timestamp: new Date(Date.now() - 79200000).toISOString(),
        read: false,
        senderName: "SAMSUNG",
        isMock: true
    },
    {
        id: "m4",
        senderId: "brand_nike",
        receiverId: "guest_influencer",
        proposalId: "p3",
        content: "러닝화 협찬 관련하여 사이즈 문의 드립니다.",
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        read: true,
        senderName: "Nike",
        isMock: true
    }
];
"""

if "export const MOCK_MESSAGES" not in content:
    content += mock_messages

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

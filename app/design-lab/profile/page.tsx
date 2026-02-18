"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, Link as LinkIcon, Instagram, Youtube, Globe, Plus, Edit2, Trash2, Star, Sun, Moon } from "lucide-react"

const PROFILE_CATEGORIES = [
    "✈️ 여행", "💄 뷰티", "💊 건강", "💉 시술/병원", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

const mockChannels = [
    { id: "1", platform: "instagram", handle: "@honggildong", followers: 12000, isPrimary: true, isPublic: true },
    { id: "2", platform: "youtube", handle: "홍길동 채널", followers: 35000, isPrimary: false, isPublic: true },
    { id: "3", platform: "blog", handle: "honggil.blog.me", followers: null, isPrimary: false, isPublic: false }
]

type DesignOption = "A" | "B" | "C"

export default function ProfileDesignLabPage() {
    const [activeDesign, setActiveDesign] = useState<DesignOption>("A")
    const [isDark, setIsDark] = useState(false)
    const [selectedTags, setSelectedTags] = useState<string[]>(["💄 뷰티", "✈️ 여행", "🏡 리빙/인테리어"])

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag))
        } else {
            if (selectedTags.length >= 5) return
            setSelectedTags(prev => [...prev, tag])
        }
    }

    return (
        <div className={`min-h-screen p-8 transition-colors ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-950' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className={`rounded-lg shadow-sm p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>프로필 설정 - 디자인 Lab</h1>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>세 가지 소셜 채널 UI 옵션을 비교하고 선택하세요</p>
                        </div>
                        {/* Theme Toggle */}
                        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                            <Button
                                variant={!isDark ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setIsDark(false)}
                                className="gap-2"
                            >
                                <Sun className="h-4 w-4" />
                                라이트
                            </Button>
                            <Button
                                variant={isDark ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setIsDark(true)}
                                className="gap-2"
                            >
                                <Moon className="h-4 w-4" />
                                다크
                            </Button>
                        </div>
                    </div>

                    {/* Design Switcher */}
                    <div className="flex gap-3">
                        <Button
                            variant={activeDesign === "A" ? "default" : "outline"}
                            onClick={() => setActiveDesign("A")}
                            className="flex-1"
                        >
                            옵션 A: 프리미엄 카드
                        </Button>
                        <Button
                            variant={activeDesign === "B" ? "default" : "outline"}
                            onClick={() => setActiveDesign("B")}
                            className="flex-1"
                        >
                            옵션 B: 컴팩트 리스트
                        </Button>
                        <Button
                            variant={activeDesign === "C" ? "default" : "outline"}
                            onClick={() => setActiveDesign("C")}
                            className="flex-1"
                        >
                            옵션 C: 그리드 대시보드
                        </Button>
                    </div>
                </div>

                {/* Design Preview */}
                <div className="space-y-6">
                    {activeDesign === "A" && <DesignOptionA selectedTags={selectedTags} toggleTag={toggleTag} isDark={isDark} />}
                    {activeDesign === "B" && <DesignOptionB selectedTags={selectedTags} toggleTag={toggleTag} isDark={isDark} />}
                    {activeDesign === "C" && <DesignOptionC selectedTags={selectedTags} toggleTag={toggleTag} isDark={isDark} />}
                </div>
            </div>
        </div>
    )
}

// 옵션 A: 프리미엄 카드 스타일
function DesignOptionA({ selectedTags, toggleTag, isDark }: { selectedTags: string[], toggleTag: (tag: string) => void, isDark: boolean }) {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* 기본 정보 */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                    <CardTitle className={isDark ? 'text-white' : ''}>기본 정보</CardTitle>
                    <CardDescription className={isDark ? 'text-gray-400' : ''}>나를 표현하는 매력적인 프로필 사진과 소개를 등록해보세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className={isDark ? 'text-gray-300' : ''}>프로필 사진</Label>
                        <div className="flex items-center gap-4">
                            <div className={`w-20 h-20 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center text-4xl`}>
                                👤
                            </div>
                            <Button variant="outline" size="sm">사진 업로드</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className={isDark ? 'text-gray-300' : ''}>크레디픽 활동명</Label>
                        <Input placeholder="활동명 입력" defaultValue="홍길동" className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''} />
                    </div>
                    <div className="space-y-2">
                        <Label className={isDark ? 'text-gray-300' : ''}>활동 카테고리 / 태그 (최대 5개)</Label>
                        <div className="flex flex-wrap gap-2">
                            {PROFILE_CATEGORIES.map(tag => (
                                <Badge
                                    key={tag}
                                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                                    className="cursor-pointer px-3 py-1.5 text-sm"
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className={isDark ? 'text-gray-300' : ''}>자기소개</Label>
                        <Textarea placeholder="브랜드에게 어필할 수 있는 소개글을 작성해주세요" className={`min-h-[100px] ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`} defaultValue="여행과 뷰티를 사랑하는 크리에이터입니다." />
                    </div>
                </CardContent>
            </Card>

            {/* 소셜 채널 - 옵션 A */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
                                📱 소셜 채널
                                <Badge className="bg-purple-600">New</Badge>
                            </CardTitle>
                            <CardDescription className={isDark ? 'text-gray-400' : ''}>연결된 채널을 통해 브랜드에게 더 많은 정보를 제공하세요</CardDescription>
                        </div>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            채널 추가
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Instagram Card */}
                        <div className="relative group">
                            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform">
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-none">메인</Badge>
                                    <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <Instagram className="h-10 w-10 mb-4" />
                                <h4 className="text-2xl font-bold mb-2">@honggildong</h4>
                                <p className="text-white/80 text-lg mb-4">👥 1.2만 팔로워</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="font-medium">브랜드에게 공개</span>
                                </div>
                            </div>
                        </div>

                        {/* YouTube Card */}
                        <div className="relative group">
                            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform">
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <Youtube className="h-10 w-10 mb-4" />
                                <h4 className="text-2xl font-bold mb-2">홍길동 채널</h4>
                                <p className="text-white/80 text-lg mb-4">👥 3.5만 구독자</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="font-medium">브랜드에게 공개</span>
                                </div>
                            </div>
                        </div>

                        {/* Blog Card */}
                        <div className="relative group opacity-70">
                            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform">
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <Globe className="h-10 w-10 mb-4" />
                                <h4 className="text-2xl font-bold mb-2">honggil.blog.me</h4>
                                <p className="text-white/80 text-lg mb-4">📊 통계 비공개</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                    <span className="font-medium">🔒 비공개</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 활동 정보 */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                    <CardTitle className={isDark ? 'text-white' : ''}>활동 정보 & 정산 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Rate Card */}
                    <div className="space-y-4">
                        <h3 className={`text-base font-semibold ${isDark ? 'text-white' : ''}`}>예상 단가표 (Rate Card)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className={isDark ? 'text-gray-300' : ''}>숏폼 영상 (Reels/Shorts)</Label>
                                <div className="relative">
                                    <Input type="number" className={`pr-8 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="0" defaultValue="500000" />
                                    <span className={`absolute right-3 top-2.5 text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>원</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className={isDark ? 'text-gray-300' : ''}>피드 게시물 (Photo/Carousel)</Label>
                                <div className="relative">
                                    <Input type="number" className={`pr-8 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="0" defaultValue="300000" />
                                    <span className={`absolute right-3 top-2.5 text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>원</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className={isDark ? 'text-gray-300' : ''}>스토리 (Story)</Label>
                                <div className="relative">
                                    <Input type="number" className={`pr-8 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="0" defaultValue="150000" />
                                    <span className={`absolute right-3 top-2.5 text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>원</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className={isDark ? 'text-gray-300' : ''}>2차 활용권</Label>
                                <div className="relative">
                                    <Input type="number" className={`pr-8 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="0" defaultValue="200000" />
                                    <span className={`absolute right-3 top-2.5 text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>원</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className={isDark ? 'text-gray-300' : ''}>자동 DM 발송</Label>
                                <div className="relative">
                                    <Input type="number" className={`pr-8 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="0" defaultValue="100000" />
                                    <span className={`absolute right-3 top-2.5 text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>원</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Info */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className={`text-base font-semibold ${isDark ? 'text-white' : ''}`}>정산 정보</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className={isDark ? 'text-gray-300' : ''}>은행명</Label>
                                <Input placeholder="예: 국민은행" defaultValue="국민은행" className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''} />
                            </div>
                            <div className="space-y-2">
                                <Label className={isDark ? 'text-gray-300' : ''}>계좌번호</Label>
                                <Input placeholder="숫자만 입력" defaultValue="123456789012" className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''} />
                            </div>
                            <div className="space-y-2">
                                <Label className={isDark ? 'text-gray-300' : ''}>예금주</Label>
                                <Input placeholder="예금주명" defaultValue="홍길동" className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''} />
                            </div>
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className={`text-base font-semibold ${isDark ? 'text-white' : ''}`}>연락처 & 배송 정보</h3>
                        <div className="space-y-2">
                            <Label className={isDark ? 'text-gray-300' : ''}>전화번호</Label>
                            <Input placeholder="010-0000-0000" defaultValue="010-1234-5678" className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''} />
                        </div>
                        <div className="space-y-2">
                            <Label className={isDark ? 'text-gray-300' : ''}>배송지 주소</Label>
                            <Input placeholder="협업 제품 수령용 주소" defaultValue="서울시 강남구 테헤란로 123" className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-6">
                    <Button className="gap-2" size="lg">
                        <Save className="h-4 w-4" />
                        설정 저장하기
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

//옵션 B: 컴팩트 리스트 스타일
function DesignOptionB({ selectedTags, toggleTag, isDark }: { selectedTags: string[], toggleTag: (tag: string) => void, isDark: boolean }) {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Tabs */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                <div className="flex gap-4 px-6 pt-6 border-b">
                    <button className="px-4 py-2 text-gray-500 hover:text-gray-700">기본 정보</button>
                    <button className="px-4 py-2 text-gray-500 hover:text-gray-700">Rate Card</button>
                    <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium">소셜 채널</button>
                </div>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">연결된 채널</h3>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            새 채널 추가
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {/* Instagram Row */}
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/30 transition">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center text-white">
                                    <Instagram className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900">@honggildong</h4>
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">메인</Badge>
                                    </div>
                                    <p className="text-sm text-gray-500">👥 1.2만 팔로워</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    <span className="ml-2 text-sm text-gray-700">브랜드 공개</span>
                                </label>
                                <Button variant="ghost" size="sm">수정</Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">삭제</Button>
                            </div>
                        </div>

                        {/* YouTube Row */}
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50/30 transition">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white">
                                    <Youtube className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">홍길동 채널</h4>
                                    <p className="text-sm text-gray-500">👥 3.5만 구독자</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    <span className="ml-2 text-sm text-gray-700">브랜드 공개</span>
                                </label>
                                <Button variant="ghost" size="sm">수정</Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">삭제</Button>
                            </div>
                        </div>

                        {/* Blog Row */}
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50/30 transition">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">honggil.blog.me</h4>
                                    <p className="text-sm text-gray-500">📊 통계 비공개</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    <span className="ml-2 text-sm text-gray-700">비공개</span>
                                </label>
                                <Button variant="ghost" size="sm">수정</Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">삭제</Button>
                            </div>
                        </div>

                        {/* Add New */}
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition">
                            <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-600 font-medium">새 채널 추가</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button size="lg" className="gap-2">
                        <Save className="h-4 w-4" />
                        설정 저장하기
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

// 옵션 C: 그리드 대시보드 스타일
function DesignOptionC({ selectedTags, toggleTag, isDark }: { selectedTags: string[], toggleTag: (tag: string) => void, isDark: boolean }) {
    const bgClass = isDark ? 'bg-gray-900 text-white border-gray-800' : 'bg-white border-gray-200'
    const textClass = isDark ? 'text-white' : 'text-gray-900'
    const descClass = isDark ? 'text-gray-400' : 'text-gray-600'

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <Card className={bgClass}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className={textClass}>소셜 채널</CardTitle>
                            <CardDescription className={descClass}>3개 연결됨 • 총 47.2K 팔로워</CardDescription>
                        </div>
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/50">
                            <Plus className="h-4 w-4 mr-2" />
                            채널 추가
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Instagram Card */}
                        <div className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-purple-500/30 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30' : 'bg-white border-purple-200 hover:border-purple-400 hover:shadow-lg'} transition-all`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center text-white">
                                    <Instagram className="h-5 w-5" />
                                </div>
                                <Badge className={isDark ? 'bg-purple-500/20 text-purple-300 border-none' : 'bg-purple-100 text-purple-700 border-none'}>
                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                    메인
                                </Badge>
                            </div>
                            <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>@honggildong</h4>
                            <div className="flex items-end gap-2 mb-4">
                                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>12K</span>
                                <span className="text-green-400 text-sm mb-1">↑ 2.3%</span>
                            </div>
                            <div className="flex items-center gap-2 mb-4 text-sm">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-400">브랜드 공개</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" className={`flex-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>수정</Button>
                                <Button variant="secondary" size="sm" className={isDark ? 'bg-gray-700 hover:bg-red-600' : 'bg-gray-100 hover:bg-red-100'}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* YouTube Card */}
                        <div className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-red-500/30 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/30' : 'bg-white border-red-200 hover:border-red-400 hover:shadow-lg'} transition-all`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white">
                                    <Youtube className="h-5 w-5" />
                                </div>
                            </div>
                            <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>홍길동 채널</h4>
                            <div className="flex items-end gap-2 mb-4">
                                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>35K</span>
                                <span className="text-green-400 text-sm mb-1">↑ 5.1%</span>
                            </div>
                            <div className="flex items-center gap-2 mb-4 text-sm">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-400">브랜드 공개</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" className={`flex-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>수정</Button>
                                <Button variant="secondary" size="sm" className={isDark ? 'bg-gray-700 hover:bg-red-600' : 'bg-gray-100 hover:bg-red-100'}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Blog Card */}
                        <div className={`rounded-xl p-6 border opacity-60 ${isDark ? 'bg-gray-800 border-gray-600 hover:border-gray-500' : 'bg-white border-gray-300 hover:border-gray-400'} hover:shadow-lg transition-all`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white">
                                    <Globe className="h-5 w-5" />
                                </div>
                            </div>
                            <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>honggil.blog.me</h4>
                            <div className="flex items-end gap-2 mb-4">
                                <span className={`text-2xl font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>- -</span>
                            </div>
                            <div className="flex items-center gap-2 mb-4 text-sm">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span className="text-red-400">🔒 비공개</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" className={`flex-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>수정</Button>
                                <Button variant="secondary" size="sm" className={isDark ? 'bg-gray-700 hover:bg-red-600' : 'bg-gray-100 hover:bg-red-100'}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Add New */}
                        <div className={`rounded-xl p-6 border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center ${isDark ? 'bg-gray-800/50 border-gray-600 hover:border-cyan-500 hover:bg-gray-800' : 'bg-gray-50 border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 transition-all ${isDark ? 'bg-gray-700 text-gray-400 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white' : 'bg-gray-200 text-gray-500 hover:bg-blue-500 hover:text-white'}`}>
                                +
                            </div>
                            <p className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>채널 추가</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600">
                        <Save className="h-4 w-4" />
                        설정 저장하기
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

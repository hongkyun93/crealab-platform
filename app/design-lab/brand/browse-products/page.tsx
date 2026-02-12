"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    ShoppingBag, Heart, Star, Tag, Truck, Gift,
    MoreHorizontal, ArrowRight, Info, Percent, Sparkles,
    Flame, Package, Globe, Clock, ThumbsUp, Layers,
    Filter, Search, Grid, List as ListIcon
} from "lucide-react"

// --- Rich Realistic Mock Data (Marketplace/Product Context) ---
const MARKETPLACE_DATA_POOL = [
    {
        id: "mp1",
        brand: "아로마티카",
        brandLogo: "https://images.unsplash.com/photo-1556228720-19875c744c64?w=50&q=80",
        name: "유기농 로즈마리 샴푸 1000ml 대용량",
        price: "42,000",
        originalPrice: "55,000",
        discount: "24%",
        image: "https://images.unsplash.com/photo-1556228720-19875c744c64?w=800&q=80",
        category: "헤어/바디",
        tags: ["비건", "탈모완화", "대용량", "올리브영1위"],
        rating: 4.8,
        reviews: 1240,
        shipping: "Free",
        isNew: false,
        isHot: true,
        campaigns_active: 5
    },
    {
        id: "mp2",
        brand: "모노랩스",
        brandLogo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=50&q=80",
        name: "공부할때 먹는 젤리 (30포)",
        price: "29,800",
        originalPrice: "35,000",
        discount: "15%",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
        category: "건강식품",
        tags: ["집중력", "수험생선물", "카카오선물하기"],
        rating: 4.6,
        reviews: 512,
        shipping: "3,000",
        isNew: true,
        isHot: false,
        campaigns_active: 2
    },
    {
        id: "mp3",
        brand: "데스커",
        brandLogo: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=50&q=80",
        name: "모션데스크 베이직 1400 화이트",
        price: "349,000",
        originalPrice: "420,000",
        discount: "17%",
        image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&q=80",
        category: "가구/인테리어",
        tags: ["재택근무", "스탠딩책상", "데스크테리어"],
        rating: 4.9,
        reviews: 3200,
        shipping: "Free",
        isNew: false,
        isHot: true,
        campaigns_active: 12
    },
    {
        id: "mp4",
        brand: "오아",
        brandLogo: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=50&q=80",
        name: "무드 가습기 1000",
        price: "39,000",
        originalPrice: "39,000",
        discount: null,
        image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&q=80",
        category: "소형가전",
        tags: ["인테리어", "무드등", "촉촉"],
        rating: 4.5,
        reviews: 890,
        shipping: "2,500",
        isNew: false,
        isHot: false,
        campaigns_active: 1
    },
    {
        id: "mp5",
        brand: "널디",
        brandLogo: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=50&q=80",
        name: "NY 트랙탑 세트 [퍼플]",
        price: "89,000",
        originalPrice: "129,000",
        discount: "31%",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
        category: "패션/의류",
        tags: ["트레이닝복", "스트릿패션", "아이유착용"],
        rating: 4.7,
        reviews: 2100,
        shipping: "Free",
        isNew: true,
        isHot: true,
        campaigns_active: 8
    }
]

// Helper to get 3-4 random items
const getRandomProducts = () => {
    return [...MARKETPLACE_DATA_POOL].sort(() => 0.5 - Math.random()).slice(0, 3)
}

export default function BrowseProductsPage() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        if (!selectedDesign) return <ModernEcommerceGrid />

        switch (selectedDesign) {
            case 1: return <ModernEcommerceGrid />;
            case 2: return <DetailsListStyle />;
            case 3: return <ShowcaseCarouselStyle />;
            case 4: return <LookbookMagazineStyle />;
            case 5: return <FlashSaleCardStyle />;
            case 6: return <ReviewFocusStyle />;
            case 7: return <BentoGridStyle />;
            case 8: return <DarkLuxuryStyle />;
            case 9: return <MinimalistTypoStyle />;
            case 10: return <InstagramShopStyle />;
            case 11: return <TechSpecStyle />;
            case 12: return <CategoryPillStyle />;
            case 13: return <GamifiedCardStyle />;
            case 14: return <VideoPreviewStyle />;
            case 15: return <CouponClipStyle />;
            case 16: return <NeoBrutalismStyle />;
            case 17: return <GradientBorderCard />;
            case 18: return <HorizontalProductRow />;
            case 19: return <QuickAddWidget />;
            case 20: return <ComparisonTableStyle />;
            default: return <ModernEcommerceGrid />;
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">브랜드 제품 둘러보기 디자인 랩</h1>
                <p className="text-muted-foreground">마켓플레이스 및 제품 탐색을 위한 20가지 다양한 카드 디자인을 확인해보세요.</p>
            </div>

            {/* Main Preview Area */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {selectedDesign ? `Design Option #${selectedDesign}` : "Default View"}
                        </Badge>
                    </h3>
                    {selectedDesign && (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDesign(null)}>
                            Reset
                        </Button>
                    )}
                </div>
                <div className="bg-gray-50/50 p-6 rounded-2xl border min-h-[400px]">
                    {renderPreview()}
                </div>
            </div>

            <div className="border-t my-8" />

            {/* All Variations Grid */}
            <h3 className="font-bold text-xl mb-6">All 20 Design Variations</h3>
            <div className="grid grid-cols-1 gap-12">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h4 className="font-bold text-lg text-gray-800">Style #{i + 1}</h4>
                            <Button size="sm" variant="outline" onClick={() => handleSelect(i + 1)}>View in Main Area</Button>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl overflow-hidden">
                            {(() => {
                                switch (i + 1) {
                                    case 1: return <ModernEcommerceGrid />;
                                    case 2: return <DetailsListStyle />;
                                    case 3: return <ShowcaseCarouselStyle />;
                                    case 4: return <LookbookMagazineStyle />;
                                    case 5: return <FlashSaleCardStyle />;
                                    case 6: return <ReviewFocusStyle />;
                                    case 7: return <BentoGridStyle />;
                                    case 8: return <DarkLuxuryStyle />;
                                    case 9: return <MinimalistTypoStyle />;
                                    case 10: return <InstagramShopStyle />;
                                    case 11: return <TechSpecStyle />;
                                    case 12: return <CategoryPillStyle />;
                                    case 13: return <GamifiedCardStyle />;
                                    case 14: return <VideoPreviewStyle />;
                                    case 15: return <CouponClipStyle />;
                                    case 16: return <NeoBrutalismStyle />;
                                    case 17: return <GradientBorderCard />;
                                    case 18: return <HorizontalProductRow />;
                                    case 19: return <QuickAddWidget />;
                                    case 20: return <ComparisonTableStyle />;
                                    default: return null;
                                }
                            })()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- 20 Design Components ---

// 1. Modern Ecommerce Grid
function ModernEcommerceGrid() {
    const data = getRandomProducts()
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.map((p, i) => (
                <div key={i} className="group cursor-pointer">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 relative mb-2">
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {p.discount && <Badge className="absolute top-2 left-2 bg-red-500">{p.discount}</Badge>}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="rounded-full shadow-md"><ShoppingBag className="w-4 h-4" /></Button>
                            <Button size="icon" variant="secondary" className="rounded-full shadow-md"><Heart className="w-4 h-4" /></Button>
                        </div>
                    </div>
                    <h3 className="font-medium text-sm truncate">{p.name}</h3>
                    <div className="text-xs text-gray-500 mb-1">{p.brand}</div>
                    <div className="flex gap-2 items-center">
                        <span className="font-bold text-sm">{p.price}</span>
                        {p.originalPrice && <span className="text-xs text-gray-400 line-through">{p.originalPrice}</span>}
                    </div>
                </div>
            ))}
        </div>
    )
}

// 2. Details List Style
function DetailsListStyle() {
    const data = getRandomProducts()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex gap-4 p-4 border rounded-xl hover:shadow-md transition-shadow bg-white">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-xs text-blue-600 font-bold mb-1">{p.category}</div>
                                <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                                <div className="text-xs text-gray-500 mb-2">By {p.brand}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-lg">{p.price}</div>
                                <div className="text-xs text-green-600">{p.shipping === 'Free' ? 'Free Shipping' : `+${p.shipping}`}</div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            {p.tags.map((t, j) => <Badge key={j} variant="secondary" className="text-[10px] bg-gray-100">{t}</Badge>)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 3. Showcase Carousel
function ShowcaseCarouselStyle() {
    const data = getRandomProducts()
    return (
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x">
            {data.map((p, i) => (
                <div key={i} className="min-w-[300px] snap-center relative aspect-video rounded-2xl overflow-hidden group">
                    <img src={p.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                        <h3 className="font-bold text-xl mb-1">{p.name}</h3>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-sm opacity-80">{p.brand}</div>
                            </div>
                            <Button size="sm" variant="outline" className="text-black border-white hover:bg-white">View Deal</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 4. Lookbook Magazine
function LookbookMagazineStyle() {
    const data = getRandomProducts().slice(0, 1)
    return (
        <div className="flex justify-center">
            {data.map((p, i) => (
                <div key={i} className="relative w-full max-w-md bg-white p-2 shadow-2xl skew-y-1">
                    <div className="border border-black p-4 h-[400px] flex flex-col items-center text-center">
                        <div className="text-xs font-serif italic mb-4">The Collection • {new Date().getFullYear()}</div>
                        <img src={p.image} className="h-48 object-cover mb-6 grayscale contrast-125" />
                        <h3 className="font-serif text-2xl font-bold mb-2">{p.brand}</h3>
                        <div className="w-8 h-px bg-black mb-4"></div>
                        <p className="font-sans text-xs uppercase tracking-widest mb-1">{p.name}</p>
                        <p className="font-sans text-sm font-bold">{p.price}</p>
                        <div className="mt-auto text-[10px] text-gray-400">{p.id.toUpperCase()}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 5. Flash Sale Card
function FlashSaleCardStyle() {
    const data = getRandomProducts()
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((p, i) => (
                <div key={i} className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-xl p-4 flex gap-4 items-center">
                    <div className="relative w-24 h-24 bg-white rounded-lg p-1 shadow-sm">
                        <img src={p.image} className="w-full h-full object-cover rounded" />
                        <div className="absolute -top-2 -left-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                            {p.discount || 'HOT'}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-bold text-red-500 flex items-center mb-1"><Clock className="w-3 h-3 mr-1" /> Ending in 02:14:59</div>
                        <h3 className="font-bold text-sm mb-2 text-gray-800">{p.name}</h3>
                        <div className="flex items-end gap-2">
                            <div className="font-black text-xl text-red-600">{p.price}</div>
                            {p.originalPrice && <div className="text-xs text-gray-400 line-through mb-1">{p.originalPrice}</div>}
                        </div>
                        <div className="w-full bg-red-200 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-red-500 h-full w-[85%]"></div>
                        </div>
                        <div className="text-[10px] text-red-400 text-right mt-1">85% Cleaned</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 6. Review Focus
function ReviewFocusStyle() {
    const data = getRandomProducts()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((p, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-50 mb-4 overflow-hidden border-4 border-white shadow-md">
                        <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-center gap-1 text-yellow-400 mb-2">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                    </div>
                    <h3 className="font-bold text-sm mb-1 line-clamp-1">{p.name}</h3>
                    <div className="text-xs text-gray-400 mb-4">by {p.brand}</div>
                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 italic relative">
                        "배송도 빠르고 제품 퀄리티가 정말 좋네요. 재구매 의사 100%입니다!"
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-50 rotate-45"></div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 7. Bento Grid Style
function BentoGridStyle() {
    const data = getRandomProducts().slice(0, 3)
    return (
        <div className="grid grid-cols-3 gap-2 auto-rows-[100px]">
            {data.map((p, i) => (
                <div key={i} className={`relative rounded-xl overflow-hidden group ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                    <img src={p.image} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute bottom-2 left-2 text-white p-2">
                        <div className={`font-bold ${i === 0 ? 'text-xl' : 'text-xs'}`}>{p.name}</div>
                        {i === 0 && <div className="text-sm opacity-80">{p.price}</div>}
                    </div>
                </div>
            ))}
        </div>
    )
}

// 8. Dark Luxury
function DarkLuxuryStyle() {
    const data = getRandomProducts()
    return (
        <div className="bg-[#1a1a1a] p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.map((p, i) => (
                <div key={i} className="text-center group">
                    <div className="relative aspect-square mb-6 overflow-hidden">
                        <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        <div className="absolute inset-0 border border-white/10 group-hover:border-white/30 transition-colors"></div>
                    </div>
                    <div className="text-[#a1a1a1] text-xs uppercase tracking-widest mb-2">{p.brand}</div>
                    <h3 className="text-white font-serif text-lg mb-2">{p.name}</h3>
                    <div className="text-[#d4af37] text-sm">{p.price}</div>
                </div>
            ))}
        </div>
    )
}

// 9. Minimalist Typo
function MinimalistTypoStyle() {
    const data = getRandomProducts()
    return (
        <div className="divide-y border-t border-b">
            {data.map((p, i) => (
                <div key={i} className="py-4 flex justify-between items-center group hover:bg-gray-50 px-4">
                    <div className="flex-1">
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{p.brand}</div>
                        <h3 className="text-2xl font-light group-hover:ml-2 transition-all">{p.name}</h3>
                    </div>
                    <div className="text-right">
                        <div className="font-mono text-sm">{p.price}</div>
                        <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 mt-1" />
                    </div>
                </div>
            ))}
        </div>
    )
}

// 10. Instagram Shop
function InstagramShopStyle() {
    const data = getRandomProducts()
    return (
        <div className="grid grid-cols-3 gap-0.5">
            {data.map((p, i) => (
                <div key={i} className="aspect-square relative group">
                    <img src={p.image} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 text-white drop-shadow-md"><ShoppingBag className="w-5 h-5 fill-white/20" /></div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-white p-2 text-center">
                        <div className="font-bold text-sm mb-1">{p.price}</div>
                        <div className="text-xs line-clamp-2 px-2">{p.name}</div>
                        <Button size="sm" variant="outline" className="mt-2 h-7 text-xs bg-transparent text-white border-white hover:bg-white hover:text-black">View Shop</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 11. Tech Spec Style
function TechSpecStyle() {
    const data = getRandomProducts()
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((p, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-lg font-mono text-sm flex gap-4">
                    <div className="w-24 h-24 bg-white border border-slate-200 p-1 flex items-center justify-center">
                        <img src={p.image} className="max-w-full max-h-full object-contain grayscale" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-slate-500">MODEL</span>
                            <span className="font-bold text-slate-800">{p.id.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-slate-500">UNIT PRICE</span>
                            <span className="text-slate-800">{p.price}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-slate-500">STOCK</span>
                            <span className="text-green-600 font-bold">AVAILABLE</span>
                        </div>
                        <div className="text-xs text-slate-400 pt-1">{p.name}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 12. Category Pill
function CategoryPillStyle() {
    const data = getRandomProducts()
    return (
        <div className="space-y-3">
            {data.map((p, i) => (
                <div key={i} className="flex gap-4 items-center bg-white p-2 pr-4 rounded-full border shadow-sm hover:shadow-md transition-shadow">
                    <img src={p.image} className="w-12 h-12 rounded-full object-cover border" />
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full w-fit mb-0.5">{p.category}</div>
                        <h3 className="font-bold text-xs truncate">{p.name}</h3>
                    </div>
                    <div className="font-bold text-sm text-blue-600">{p.price}</div>
                    <Button size="icon" variant="ghost" className="rounded-full w-8 h-8"><ArrowRight className="w-4 h-4" /></Button>
                </div>
            ))}
        </div>
    )
}

// 13. Gamified Card
function GamifiedCardStyle() {
    const data = getRandomProducts()
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {data.map((p, i) => (
                <div key={i} className="bg-white border-2 border-b-4 border-black rounded-xl p-3 relative hover:-translate-y-1 transition-transform">
                    <div className="absolute -top-3 -right-3 bg-yellow-400 border-2 border-black text-black text-xs font-black px-2 py-1 rotate-12 shadow-sm">
                        LV.{Math.floor(p.rating * 10)}
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 mb-3 border border-blue-100">
                        <img src={p.image} className="w-full aspect-square object-contain mix-blend-multiply" />
                    </div>
                    <h3 className="font-black text-sm mb-1">{p.name}</h3>
                    <div className="flex gap-1 mb-3">
                        {p.tags.slice(0, 2).map((t, j) => <span key={j} className="text-[9px] border border-black px-1 rounded bg-gray-100">{t}</span>)}
                    </div>
                    <Button className="w-full bg-black text-white hover:bg-gray-800 h-8 text-xs font-bold shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] border-2 border-transparent">ITEM GET</Button>
                </div>
            ))}
        </div>
    )
}

// 14. Video Preview
function VideoPreviewStyle() {
    const data = getRandomProducts()
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((p, i) => (
                <div key={i} className="relative aspect-video bg-black rounded-xl overflow-hidden group">
                    <img src={p.image} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/50 group-hover:scale-110 transition-transform cursor-pointer">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                        <h3 className="font-bold text-sm">{p.name}</h3>
                        <div className="text-xs opacity-80">{p.brand} • {p.price}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 15. Coupon Clip
function CouponClipStyle() {
    const data = getRandomProducts()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex bg-white rounded-lg shadow-sm overflow-hidden filters drop-shadow-md">
                    <div className="w-32 bg-blue-500 flex items-center justify-center p-2 border-r-2 border-dashed border-white relative">
                        <div className="text-white text-center">
                            <div className="text-xs opacity-80">DISCOUNT</div>
                            <div className="text-2xl font-black">{p.discount || '10%'}</div>
                            <div className="text-[10px] opacity-80">OFF</div>
                        </div>
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full"></div>
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div className="flex-1 p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-sm mb-1">{p.name}</h3>
                            <div className="text-xs text-gray-500">Valid until Aug 31</div>
                        </div>
                        <Button size="sm" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">Claim</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 16. Neo-Brutalism
function NeoBrutalismStyle() {
    const data = getRandomProducts()
    return (
        <div className="grid grid-cols-2 gap-4 bg-[#ffde00] p-6">
            {data.map((p, i) => (
                <div key={i} className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="border-2 border-black mb-3">
                        <img src={p.image} className="w-full aspect-square object-cover" />
                    </div>
                    <h3 className="font-black text-lg leading-none mb-2">{p.name}</h3>
                    <div className="bg-black text-white font-mono text-center py-1 font-bold mb-2">
                        {p.price}
                    </div>
                    <Button className="w-full bg-[#ff7900] text-black border-2 border-black font-bold h-8 rounded-none hover:bg-[#ff9000]">BUY NOW</Button>
                </div>
            ))}
        </div>
    )
}

// 17. Gradient Border
function GradientBorderCard() {
    const data = getRandomProducts()
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {data.map((p, i) => (
                <div key={i} className="rounded-xl p-[2px] bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 hover:from-blue-400 hover:via-indigo-500 hover:to-purple-500 transition-all">
                    <div className="bg-white rounded-[10px] p-4 h-full flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-gray-100 p-1">
                            <img src={p.image} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="text-[10px] text-gray-400 mb-1">{p.brand}</div>
                        <h3 className="font-bold text-sm mb-2">{p.name}</h3>
                        <div className="mt-auto font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                            {p.price}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 18. Horizontal Product Row
function HorizontalProductRow() {
    const data = getRandomProducts()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex gap-4">
                    <div className="w-1/3 aspect-[4/3] rounded-lg overflow-hidden relative">
                        <img src={p.image} className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur">{p.rating} ★</div>
                    </div>
                    <div className="flex-1 py-1 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-sm leading-tight mb-1">{p.name}</h3>
                            <div className="text-xs text-gray-500 line-clamp-2">Best for {p.category} enthusiasts. Featured in Top 10 lists.</div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="font-bold text-sm">{p.price}</div>
                            <Button size="sm" variant="secondary" className="h-7 text-xs rounded-full">Add</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 19. Quick Add Widget
function QuickAddWidget() {
    const data = getRandomProducts()
    return (
        <div className="space-y-2">
            {data.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-white border rounded-lg p-2 pr-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <img src={p.image} className="w-10 h-10 rounded object-cover border" />
                        <div className="max-w-[150px]">
                            <div className="font-bold text-xs truncate">{p.name}</div>
                            <div className="text-[10px] text-gray-400">{p.price}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200">-</button>
                        <span className="text-xs font-bold w-4 text-center">1</span>
                        <button className="w-6 h-6 rounded bg-black text-white flex items-center justify-center hover:bg-gray-800">+</button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 20. Comparison Table
function ComparisonTableStyle() {
    const data = getRandomProducts().slice(0, 3)
    return (
        <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-3 w-20">Feature</th>
                        {data.map((p, i) => <th key={i} className="p-3 min-w-[120px]">{p.brand}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    <tr>
                        <td className="p-3 font-bold text-gray-500">Image</td>
                        {data.map((p, i) => <td key={i} className="p-3"><img src={p.image} className="w-12 h-12 rounded object-cover" /></td>)}
                    </tr>
                    <tr>
                        <td className="p-3 font-bold text-gray-500">Name</td>
                        {data.map((p, i) => <td key={i} className="p-3 font-medium">{p.name}</td>)}
                    </tr>
                    <tr>
                        <td className="p-3 font-bold text-gray-500">Price</td>
                        {data.map((p, i) => <td key={i} className="p-3 font-bold text-blue-600">{p.price}</td>)}
                    </tr>
                    <tr>
                        <td className="p-3 font-bold text-gray-500">Rating</td>
                        {data.map((p, i) => <td key={i} className="p-3">{p.rating}/5.0</td>)}
                    </tr>
                    <tr>
                        <td className="p-3 font-bold text-gray-500">Action</td>
                        {data.map((p, i) => <td key={i} className="p-3"><Button size="sm" className="w-full h-7 text-[10px]">Select</Button></td>)}
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

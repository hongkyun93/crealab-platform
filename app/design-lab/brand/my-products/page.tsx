"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Calendar, Users, DollarSign, Edit, Archive, MoreHorizontal,
    Package, ShoppingBag, Tag, Image as ImageIcon, FileText,
    ExternalLink, Share2, Eye, Box, Layers, Grid, PlusCircle
} from "lucide-react"

// --- Realistic Mock Data (Brand Product Context) ---
const MY_PRODUCTS = [
    {
        id: "p1",
        name: "모이스처 글로우 히알루론산 세럼",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
        price: "45,000",
        category: "뷰티/스킨케어",
        description: "속건조를 해결해주는 고농축 히알루론산 세럼입니다. 끈적임 없이 산뜻한 마무리가 특징입니다.",
        selling_points: ["속건조 해결", "물광 피부", "저자극 테스트 완료"],
        required_shots: ["제형 테스트", "비포/애프터", "화장대 연출"],
        website_url: "https://brand.com/products/serum",
        tags: ["수분세럼", "물광앰플", "Kbeauty"],
        status: "Active",
        campaign_count: 3,
        content_count: 45
    },
    {
        id: "p2",
        name: "프리미엄 비건 가죽 데스크 매트",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
        price: "32,000",
        category: "라이프스타일/데스크테리어",
        description: "책상을 깔끔하게 정리해주는 고급 비건 가죽 매트입니다. 방수 기능과 미끄럼 방지 처리가 되어 있습니다.",
        selling_points: ["비건 가죽", "방수/오염방지", "모던한 색감"],
        required_shots: ["책상 전체샷", "마우스 사용컷", "커피 연출컷"],
        website_url: "https://brand.com/products/desk-mat",
        tags: ["데스크테리어", "재택근무", "책상꾸미기"],
        status: "Active",
        campaign_count: 1,
        content_count: 12
    },
    {
        id: "p3",
        name: "유기농 착즙 ABC 주스 (10팩)",
        image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&q=80",
        price: "28,900",
        category: "푸드/건강식품",
        description: "물 한 방울 넣지 않고 만든 100% 착즙 주스입니다. 매일 아침 건강한 습관을 만들어보세요.",
        selling_points: ["100% 착즙", "무설탕/무첨가", "간편한 파우치"],
        required_shots: ["마시는 모습", "아침 식단 연출", "냉장고 보관컷"],
        website_url: "https://brand.com/products/abc-juice",
        tags: ["건강주스", "다이어트", "아침대용"],
        status: "Out of Stock",
        campaign_count: 0,
        content_count: 89
    }
]

export default function MyProductsDesignLab() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        switch (selectedDesign) {
            case 1: return <StandardProductCard />;
            case 2: return <HorizontalProductRow />;
            case 3: return <GalleryGridStyle />;
            case 4: return <EcommerceAdminStyle />;
            case 5: return <MinimalistDetailStyle />;
            case 6: return <TagFocusStyle />;
            case 7: return <ContentGuideStyle />;
            case 8: return <StatOverlayStyle />;
            case 9: return <InteractiveFlipStyle />;
            case 10: return <MagazineCatalogStyle />;
            case 11: return <CompactInventoryList />;
            case 12: return <VisualHeroStyle />;
            case 13: return <SpecificationCard />;
            case 14: return <PriceTagStyle />;
            case 15: return <SocialProofStyle />;
            case 16: return <BarcodeStyle />;
            case 17: return <GradientMeshStyle />;
            case 18: return <PolaroidStackStyle />;
            case 19: return <QuickActionPanel />;
            case 20: return <RecipeCardStyle />;
            default: return <StandardProductCard />;
        }
    }

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">내 브랜드 제품</h1>
                    <p className="text-muted-foreground mt-2">
                        등록된 제품 정보를 관리하고 캠페인에 연결하세요.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button className="bg-black text-white hover:bg-gray-800"><PlusCircle className="w-4 h-4 mr-2" /> 제품 등록하기</Button>
                </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Badge variant={selectedDesign ? "default" : "outline"} className={!selectedDesign ? "bg-indigo-50 text-indigo-700 border-indigo-200" : ""}>
                            {selectedDesign ? `Selected Design #${selectedDesign}` : "Default (Standard Card)"}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-normal">
                            {selectedDesign ? "Applied Product View" : "Live Code"}
                        </span>
                    </h3>
                    {selectedDesign && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedDesign(null)}>
                            Reset to Default
                        </Button>
                    )}
                </div>
                {renderPreview()}
            </div>

            <div className="border-t my-8" />
            <h3 className="font-bold text-xl mb-6">All 20 Product Variations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                            <h4 className="font-semibold text-sm text-muted-foreground">Style #{i + 1}</h4>
                            <Button size="sm" variant="ghost" onClick={() => handleSelect(i + 1)}>Preview</Button>
                        </div>
                        <div className="border rounded-xl p-4 bg-gray-50/50">
                            {(() => {
                                switch (i + 1) {
                                    case 1: return <StandardProductCard />;
                                    case 2: return <HorizontalProductRow />;
                                    case 3: return <GalleryGridStyle />;
                                    case 4: return <EcommerceAdminStyle />;
                                    case 5: return <MinimalistDetailStyle />;
                                    case 6: return <TagFocusStyle />;
                                    case 7: return <ContentGuideStyle />;
                                    case 8: return <StatOverlayStyle />;
                                    case 9: return <InteractiveFlipStyle />;
                                    case 10: return <MagazineCatalogStyle />;
                                    case 11: return <CompactInventoryList />;
                                    case 12: return <VisualHeroStyle />;
                                    case 13: return <SpecificationCard />;
                                    case 14: return <PriceTagStyle />;
                                    case 15: return <SocialProofStyle />;
                                    case 16: return <BarcodeStyle />;
                                    case 17: return <GradientMeshStyle />;
                                    case 18: return <PolaroidStackStyle />;
                                    case 19: return <QuickActionPanel />;
                                    case 20: return <RecipeCardStyle />;
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

// 1. Standard Product Card
function StandardProductCard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MY_PRODUCTS.slice(0, 3).map((p, i) => (
                <Card key={i} className="overflow-hidden hover:shadow-md transition-all">
                    <div className="aspect-square bg-gray-100 relative">
                        <img src={p.image} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/80 rounded-full hover:bg-white"><MoreHorizontal className="w-4 h-4" /></Button>
                        </div>
                        {p.status === 'Out of Stock' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">Sold Out</div>
                        )}
                    </div>
                    <CardHeader className="p-4 pb-2">
                        <div className="text-xs text-gray-500 mb-1">{p.category}</div>
                        <h3 className="font-bold text-lg line-clamp-1">{p.name}</h3>
                        <div className="font-bold text-lg">{p.price}원</div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-sm text-gray-600 line-clamp-2 h-10 mb-3">{p.description}</p>
                        <div className="flex gap-2 flex-wrap">
                            {p.tags.slice(0, 2).map((t, j) => <Badge key={j} variant="secondary" className="text-xs font-normal">{t}</Badge>)}
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                        <Button className="w-full" variant="outline">캠페인 생성</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

// 2. Horizontal Row
function HorizontalProductRow() {
    return (
        <div className="space-y-3">
            {MY_PRODUCTS.slice(0, 2).map((p, i) => (
                <div key={i} className="flex bg-white border p-3 rounded-lg gap-4 items-center hover:bg-gray-50">
                    <img src={p.image} className="w-16 h-16 rounded object-cover bg-gray-100 border" />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{p.name}</h3>
                        <div className="text-xs text-gray-500">{p.category}</div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-sm">{p.price}원</div>
                        <div className="text-xs text-gray-400">{p.status}</div>
                    </div>
                    <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                </div>
            ))}
        </div>
    )
}

// 3. Gallery Grid
function GalleryGridStyle() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {MY_PRODUCTS.slice(0, 2).map((p, i) => (
                <div key={i} className="group relative aspect-square bg-gray-100 overflow-hidden cursor-pointer">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                        <div className="font-bold text-sm mb-1">{p.name}</div>
                        <div className="text-xs opacity-80">{p.price}원</div>
                        <Button size="sm" variant="secondary" className="mt-2 h-7 text-xs">View Detail</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 4. Ecommerce Admin
function EcommerceAdminStyle() {
    return (
        <div className="border rounded-lg overflow-hidden text-sm">
            <div className="bg-gray-50 p-3 grid grid-cols-12 font-bold text-gray-600 border-b">
                <div className="col-span-1"><input type="checkbox" /></div>
                <div className="col-span-5">Product</div>
                <div className="col-span-2">SKU status</div>
                <div className="col-span-2">Campaigns</div>
                <div className="col-span-2 text-right">Action</div>
            </div>
            {MY_PRODUCTS.slice(0, 2).map((p, i) => (
                <div key={i} className="p-3 grid grid-cols-12 items-center border-b last:border-0 hover:bg-blue-50/30">
                    <div className="col-span-1"><input type="checkbox" /></div>
                    <div className="col-span-5 flex gap-3 items-center">
                        <img src={p.image} className="w-10 h-10 rounded border" />
                        <div className="truncate pr-2">
                            <div className="font-medium text-blue-600 cursor-pointer hover:underline">{p.name}</div>
                            <div className="text-xs text-gray-400">ID: {p.id.toUpperCase()}</div>
                        </div>
                    </div>
                    <div className="col-span-2"><Badge variant={p.status === 'Active' ? 'default' : 'secondary'} className="text-[10px]">{p.status}</Badge></div>
                    <div className="col-span-2 text-gray-500">{p.campaign_count} Active</div>
                    <div className="col-span-2 text-right"><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><MoreHorizontal className="w-4 h-4" /></Button></div>
                </div>
            ))}
        </div>
    )
}

// 5. Minimalist Detail
function MinimalistDetailStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MY_PRODUCTS.slice(0, 1).map((p, i) => (
                <div key={i} className="flex gap-4">
                    <div className="w-1/3 bg-gray-50 aspect-[3/4]"><img src={p.image} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" /></div>
                    <div className="flex-1 py-1">
                        <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">{p.category}</div>
                        <h3 className="text-xl font-serif mb-2 leading-tight">{p.name}</h3>
                        <div className="text-sm font-medium mb-4">{p.price} KRW</div>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">{p.description}</p>
                        <div className="flex gap-2">
                            <Button size="sm" className="bg-black text-white h-8 text-xs rounded-none hover:bg-gray-800">EDIT</Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs rounded-none">PREVIEW</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 6. Tag Focus
function TagFocusStyle() {
    return (
        <div className="space-y-4">
            {MY_PRODUCTS.slice(0, 2).map((p, i) => (
                <div key={i} className="bg-white border rounded-xl p-4">
                    <div className="flex gap-4">
                        <img src={p.image} className="w-20 h-20 rounded-lg object-cover" />
                        <div className="flex-1">
                            <h3 className="font-bold text-sm mb-2">{p.name}</h3>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {p.tags.map((t, j) => (<span key={j} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">#{t}</span>))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {p.selling_points.map((s, j) => (<span key={j} className="px-2 py-0.5 border rounded text-[10px] text-gray-500">✓ {s}</span>))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 7. Content Guide
function ContentGuideStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MY_PRODUCTS.slice(0, 2).map((p, i) => (
                <div key={i} className="border-l-4 border-l-purple-500 bg-purple-50/50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-sm text-purple-900">{p.name}</h3>
                        <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="bg-white p-3 rounded-lg text-xs space-y-2 border border-purple-100">
                        <div className="font-bold text-purple-800 mb-1">Required Shots</div>
                        <ul className="list-disc list-inside text-gray-600">
                            {p.required_shots.map((s, j) => <li key={j}>{s}</li>)}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 8. Stat Overlay
function StatOverlayStyle() {
    return (
        <div className="grid grid-cols-2 gap-4">
            {MY_PRODUCTS.slice(0, 2).map((p, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden aspect-video group">
                    <img src={p.image} className="w-full h-full object-cover blur-[1px] group-hover:blur-0 transition-all" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                        <h3 className="font-bold text-sm line-clamp-1">{p.name}</h3>
                        <div className="flex justify-between items-end mt-2">
                            <div className="text-center">
                                <div className="text-[10px] opacity-70">Campaigns</div>
                                <div className="font-bold text-lg leading-none">{p.campaign_count}</div>
                            </div>
                            <div className="w-px h-6 bg-white/30"></div>
                            <div className="text-center">
                                <div className="text-[10px] opacity-70">Contents</div>
                                <div className="font-bold text-lg leading-none">{p.content_count}</div>
                            </div>
                            <div className="w-px h-6 bg-white/30"></div>
                            <div className="text-center">
                                <div className="text-[10px] opacity-70">Views</div>
                                <div className="font-bold text-lg leading-none">12k</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 9. Interactive Flip
function InteractiveFlipStyle() {
    return (
        <div className="grid grid-cols-2 gap-4 perspective-1000">
            {MY_PRODUCTS.slice(0, 2).map((p, i) => (
                <div key={i} className="relative h-40 group cursor-pointer">
                    <div className="absolute inset-0 backface-hidden transition-transform duration-500 transform group-hover:rotate-y-180 bg-white border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                        <img src={p.image} className="w-16 h-16 rounded-full mb-2 object-cover" />
                        <h3 className="font-bold text-sm line-clamp-1">{p.name}</h3>
                        <div className="text-xs text-gray-500">{p.price}원</div>
                    </div>
                    <div className="absolute inset-0 backface-hidden transition-transform duration-500 transform rotate-y-180 group-hover:rotate-y-0 bg-gray-900 text-white rounded-xl p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-xs mb-2">{p.selling_points[0]}</div>
                        <Button size="sm" variant="secondary" className="h-7 text-xs w-full">Manage</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 10. Magazine Catalog
function MagazineCatalogStyle() {
    return (
        <div className="border p-4 bg-white shadow-lg rotate-1 max-w-sm mx-auto">
            {MY_PRODUCTS.slice(0, 1).map((p, i) => (
                <div key={i} className="text-center">
                    <div className="border-b-2 border-black pb-1 mb-2 font-black text-xl tracking-tighter uppercase">New Arrivals</div>
                    <img src={p.image} className="w-full h-48 object-cover mb-4 grayscale contrast-125" />
                    <h3 className="font-serif font-bold text-xl mb-1">{p.name}</h3>
                    <p className="text-xs text-justify leading-tight mb-2 font-serif">{p.description}</p>
                    <div className="font-mono font-bold text-lg bg-black text-white inline-block px-2">{p.price}</div>
                </div>
            ))}
        </div>
    )
}

// 11. Compact Inventory
function CompactInventoryList() {
    return (
        <div className="border rounded-lg divide-y">
            {MY_PRODUCTS.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-mono text-xs w-16 text-gray-400">#{p.id.toUpperCase()}</span>
                        <span className="font-medium text-sm truncate w-40">{p.name}</span>
                    </div>
                    <div className="font-mono text-xs">{p.price}</div>
                </div>
            ))}
        </div>
    )
}

// 12. Visual Hero
function VisualHeroStyle() {
    return (
        <div className="relative h-48 rounded-2xl overflow-hidden">
            {MY_PRODUCTS.slice(0, 1).map((p, i) => (
                <div key={i} className="absolute inset-0">
                    <img src={p.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent p-6 flex flex-col justify-center text-white w-2/3">
                        <div className="text-xs text-yellow-400 font-bold mb-1">BEST SELLER</div>
                        <h3 className="text-2xl font-bold leading-tight mb-2">{p.name}</h3>
                        <p className="text-sm opacity-80 line-clamp-2 mb-4">{p.description}</p>
                        <Button size="sm" className="bg-white text-black hover:bg-white/90 w-fit">View Dashboard</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 13. Specification Card
function SpecificationCard() {
    return (
        <div className="bg-slate-100 p-4 rounded-xl font-mono text-xs">
            {MY_PRODUCTS.slice(1, 2).map((p, i) => (
                <div key={i} className="border-2 border-slate-300 p-3 rounded bg-white shadow-sm">
                    <div className="flex justify-between border-b pb-2 mb-2 border-slate-200">
                        <span className="font-bold">SPEC SHEET</span>
                        <span className="text-slate-500">{new Date().toISOString().split('T')[0]}</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-y-1">
                        <div className="text-slate-500">ITEM</div>
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-slate-500">CAT</div>
                        <div className="text-slate-800">{p.category}</div>
                        <div className="text-slate-500">MSRP</div>
                        <div className="text-slate-800">{p.price}</div>
                        <div className="text-slate-500">USP</div>
                        <div className="text-slate-800">{p.selling_points.join(', ')}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 14. Price Tag
function PriceTagStyle() {
    return (
        <div className="flex justify-center p-4 bg-gray-100 rounded-xl">
            {MY_PRODUCTS.slice(0, 1).map((p, i) => (
                <div key={i} className="bg-white p-4 w-48 shadow-lg relative clip-path-tag">
                    <div className="w-3 h-3 bg-gray-100 rounded-full mx-auto mb-4 box-shadow-inner"></div>
                    <div className="text-center border-b-2 border-dashed border-gray-200 pb-4 mb-4">
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">{p.category.split('/')[0]}</div>
                        <div className="font-bold text-2xl mt-1">{p.price}</div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium text-sm leading-tight mb-2">{p.name}</div>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${p.id}`} className="w-16 h-16 mx-auto opacity-80" />
                    </div>
                </div>
            ))}
        </div>
    )
}

// 15. Social Proof
function SocialProofStyle() {
    return (
        <div className="space-y-4">
            {MY_PRODUCTS.slice(0, 2).map((p, i) => (
                <div key={i} className="bg-pink-50 rounded-xl p-4 border border-pink-100 flex gap-4 items-center">
                    <div className="relative">
                        <img src={p.image} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">HOT</div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-sm text-pink-900">{p.name}</h3>
                        <div className="text-xs text-pink-700 mt-1">Users love this! ⭐ 4.8/5.0</div>
                    </div>
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white h-8 text-xs rounded-full">Promote</Button>
                </div>
            ))}
        </div>
    )
}

// 16. Barcode
function BarcodeStyle() {
    return (
        <div className="bg-white border-2 border-black p-4 max-w-sm">
            {MY_PRODUCTS.slice(0, 1).map((p, i) => (
                <div key={i}>
                    <div className="flex gap-4 mb-4">
                        <div className="font-black text-4xl writing-vertical-rl rotate-180 leading-none tracking-tighter self-end opacity-20">CREADY</div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                            <div className="text-xs bg-black text-white px-1 inline-block mb-2">{p.id}</div>
                            <p className="text-xs leading-tight">{p.description}</p>
                        </div>
                    </div>
                    <div className="h-12 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/UPC-A-036000291452.svg/1200px-UPC-A-036000291452.svg.png')] bg-cover w-full opacity-60 grayscale filter contrast-150"></div>
                </div>
            ))}
        </div>
    )
}

// 17. Gradient Mesh
function GradientMeshStyle() {
    return (
        <div className="grid grid-cols-2 gap-4">
            {MY_PRODUCTS.slice(0, 2).map((p, i) => (
                <div key={i} className="rounded-2xl p-5 text-white relative overflow-hidden h-32 flex flex-col justify-between" style={{ background: `linear-gradient(${i * 45}deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)` }}>
                    <img src={p.image} className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full object-cover border-4 border-white/20" />
                    <div className="relative z-10 font-bold text-shadow text-black/70 text-sm w-2/3">{p.name}</div>
                    <div className="relative z-10 bg-white/30 backdrop-blur w-fit px-2 py-1 rounded-lg text-xs font-bold text-black/60 shadow-sm">{p.price}</div>
                </div>
            ))}
        </div>
    )
}

// 18. Polaroid Stack
function PolaroidStackStyle() {
    return (
        <div className="relative h-48 flex justify-center items-center bg-wood-pattern">
            {MY_PRODUCTS.slice(0, 3).map((p, i) => (
                <div key={i} className="absolute w-40 bg-white p-2 pb-8 shadow-lg transform transition-transform hover:scale-105 hover:z-50" style={{ transform: `rotate(${(i - 1) * 10}deg) translate(${i * 20}px, 0)` }}>
                    <img src={p.image} className="w-full aspect-square object-cover bg-gray-100 mb-2" />
                    <div className="font-handwriting text-center text-xs text-gray-600 line-clamp-1">{p.name}</div>
                </div>
            ))}
        </div>
    )
}

// 19. Quick Action Panel
function QuickActionPanel() {
    return (
        <div className="space-y-4">
            {MY_PRODUCTS.slice(0, 2).map((p, i) => (
                <div key={i} className="bg-white border rounded-lg p-3 flex gap-3 items-center shadow-sm">
                    <div className="bg-gray-100 p-2 rounded-lg"><Box className="w-6 h-6 text-gray-500" /></div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{p.name}</div>
                        <div className="flex gap-2 text-xs text-gray-400">
                            <span className="hover:text-blue-500 cursor-pointer">Edit</span>
                            <span className="hover:text-blue-500 cursor-pointer">Duplicate</span>
                            <span className="hover:text-red-500 cursor-pointer">Delete</span>
                        </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full"><Share2 className="w-4 h-4" /></Button>
                </div>
            ))}
        </div>
    )
}

// 20. Recipe Card
function RecipeCardStyle() {
    return (
        <div className="bg-amber-50 p-4 border-2 border-dashed border-amber-300 rounded-xl">
            {MY_PRODUCTS.slice(0, 1).map((p, i) => (
                <div key={i} className="flex gap-4">
                    <div className="flex-1">
                        <div className="uppercase text-[10px] font-bold text-amber-600 tracking-wider mb-1">Ingredients</div>
                        <h3 className="font-serif font-bold text-lg text-amber-900 mb-2">{p.name}</h3>
                        <div className="space-y-1 text-xs text-amber-800">
                            <div className="flex justify-between border-b border-amber-200 border-dashed pb-1"><span>Price</span><span>{p.price}</span></div>
                            <div className="flex justify-between border-b border-amber-200 border-dashed pb-1"><span>Stock</span><span>{p.status}</span></div>
                            <div className="flex justify-between pt-1"><span>Campaigns</span><span>{p.campaign_count}</span></div>
                        </div>
                    </div>
                    <img src={p.image} className="w-24 h-32 object-cover rounded-lg sepia bg-amber-200" />
                </div>
            ))}
        </div>
    )
}

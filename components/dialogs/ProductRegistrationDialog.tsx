"use client"

import React, { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, Package, AtSign, FileText, CheckCircle2, Camera, Pencil, Send, Info } from "lucide-react"
import { toast } from "sonner"
import { ChannelSelector } from "@/components/shared/ChannelSelector"

export interface ProductFormData {
    name: string;
    price: string;
    category: string;
    description: string;
    image: string;
    link: string;
    points: string;
    shots: string;
    contentGuide: string;
    formatGuide: string;
    accountTag: string;
    hashtags: string;
    channels: string[];
}

interface ProductRegistrationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEditing?: boolean;
    isSubmitting?: boolean;
    initialData?: ProductFormData | null;
    defaultStep?: "form" | "preview";
    onSubmit: (isDraft: boolean, data: ProductFormData) => Promise<void>;
}

export function ProductRegistrationDialog({
    open,
    onOpenChange,
    isEditing = false,
    isSubmitting = false,
    initialData,
    defaultStep = "form",
    onSubmit
}: ProductRegistrationDialogProps) {
    const [step, setStep] = useState<"form" | "preview">(defaultStep)

    // Form States
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [category, setCategory] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")
    const [link, setLink] = useState("")
    const [points, setPoints] = useState("")
    const [shots, setShots] = useState("")
    const [contentGuide, setContentGuide] = useState("")
    const [formatGuide, setFormatGuide] = useState("")
    const [accountTag, setAccountTag] = useState("")
    const [hashtags, setHashtags] = useState("")
    const [channels, setChannels] = useState<string[]>([])

    const [isImageUploading, setIsImageUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load initial data when opened
    useEffect(() => {
        if (open && initialData) {
            setName(initialData.name || "")
            setPrice(initialData.price || "")
            setCategory(initialData.category || "")
            setDescription(initialData.description || "")
            setImage(initialData.image === "📦" ? "" : (initialData.image || ""))
            setLink(initialData.link || "")
            setPoints(initialData.points || "")
            setShots(initialData.shots || "")
            setContentGuide(initialData.contentGuide || "")
            setFormatGuide(initialData.formatGuide || "")
            setAccountTag(initialData.accountTag || "")
            setHashtags(initialData.hashtags || "")
            setChannels(initialData.channels || [])
        } else if (open && !initialData) {
            resetForm()
        }

        setStep(defaultStep)
    }, [open, initialData, defaultStep])

    const resetForm = () => {
        setName("")
        setPrice("")
        setCategory("")
        setDescription("")
        setImage("")
        setLink("")
        setPoints("")
        setShots("")
        setContentGuide("")
        setFormatGuide("")
        setAccountTag("")
        setHashtags("")
        setChannels([])
        setStep("form")
    }

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            resetForm()
        }
        onOpenChange(isOpen)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) {
            toast.error("이미지 파일 크기는 10MB 이하여야 합니다.")
            return
        }

        setIsImageUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('bucket', 'product-images')
            formData.append('folder', 'products')

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || '업로드 실패')
            }

            const { url } = await res.json()
            setImage(url)
        } catch (error: any) {
            console.error('[handleImageUpload] Exception:', error)
            toast.error(`이미지 업로드 실패: ${error?.message || '알 수 없는 오류'}`)
        } finally {
            setIsImageUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handlePreviewClick = () => {
        if (!name || !category) {
            toast.error("제품명과 카테고리는 필수입니다.")
            return
        }
        if (isImageUploading) {
            toast.error("이미지 업로드가 아직 완료되지 않았습니다.")
            return
        }
        setStep("preview")
    }

    const handleSubmit = async (isDraft: boolean) => {
        await onSubmit(isDraft, {
            name,
            price,
            category,
            description,
            image: image || "📦",
            link,
            points,
            shots,
            contentGuide,
            formatGuide,
            accountTag,
            hashtags: hashtags.split(/[\s,]+/).filter(tag => tag.trim() !== "").map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(" "), // Standardize tags
            channels
        })
    }

    if (step === "preview") {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-muted/30">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold text-foreground">제작 가이드 미리보기</DialogTitle>
                        <DialogDescription className="text-center">
                            크리에이터에게 보여질 가이드 화면입니다.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden my-2">
                        {/* Header Image */}
                        <div className="h-40 bg-muted relative group">
                            {image && image !== "📦" ? (
                                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                            )}
                            <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                                {category || "카테고리"}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            <div className="text-center space-y-2 border-b border-border/50 pb-6">
                                <h3 className="text-xl font-black text-foreground">{name || "제품명 없음"}</h3>
                                <p className="text-lg font-bold text-primary">
                                    {price ? `${parseInt(price).toLocaleString()}원` : "가격 미정"}
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed px-4">
                                    {description || "제품 설명이 없습니다."}
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* Points */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> 소구 포인트
                                    </h4>
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap">
                                        {points || "등록된 소구 포인트가 없습니다."}
                                    </div>
                                </div>

                                {/* Required Shots */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                                        <Camera className="h-3 w-3" /> 필수 촬영 컷
                                    </h4>
                                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">
                                        {shots || "등록된 필수 촬영 컷이 없습니다."}
                                    </div>
                                </div>

                                {/* Guide */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                                        <FileText className="h-3 w-3" /> 필수 가이드
                                    </h4>
                                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm space-y-4">
                                        {contentGuide && (
                                            <div>
                                                <strong className="block text-foreground mb-1 font-bold">필수 포함 내용</strong>
                                                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{contentGuide}</p>
                                            </div>
                                        )}
                                        {formatGuide && (
                                            <div>
                                                <strong className="block text-foreground mb-1 font-bold">필수 형식</strong>
                                                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{formatGuide}</p>
                                            </div>
                                        )}
                                        {!contentGuide && !formatGuide && <p className="text-muted-foreground/70">등록된 필수 가이드가 없습니다.</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                                        <AtSign className="h-3 w-3" /> 태그 및 계정
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {accountTag && (
                                            <span className="px-2 py-1 bg-background border border-border rounded-md text-xs font-bold text-foreground/90 shadow-sm">
                                                {accountTag}
                                            </span>
                                        )}
                                        {hashtags.split(/[\s,]+/).filter(t => t).map((tag, i) => (
                                            <span key={i} className="px-2 py-1 bg-muted border border-border rounded-md text-xs text-muted-foreground">
                                                {tag.startsWith('#') ? tag : `#${tag}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setStep("form")} className="w-full sm:w-auto">
                            <Pencil className="mr-2 h-4 w-4" /> 수정하기
                        </Button>
                        <Button onClick={() => handleSubmit(false)} disabled={isSubmitting} className="w-full sm:w-auto font-bold bg-primary hover:bg-primary/90">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> {isEditing ? "이대로 수정" : "이대로 등록"}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "제품 수정" : "우리 브랜드 제품 등록"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "제품 정보를 수정해주세요." : "크리에이터가 확인하고 제안할 수 있도록 제품 상세 정보를 입력해 주세요."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    {/* Left Column: Basic Info & Social */}
                    <div className="space-y-6">
                        <div className="space-y-4 p-5 bg-muted/30 rounded-2xl border border-border/50">
                            <h4 className="font-bold text-sm text-foreground/90 flex items-center gap-2">
                                <Package className="h-4 w-4" /> 기본 정보
                            </h4>
                            <div className="space-y-2">
                                <Label htmlFor="op-name">제품명 <span className="text-red-500">*</span></Label>
                                <Input id="op-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 보이브 룸 스프레이 필로우토크" className="bg-background" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="op-cat">카테고리 <span className="text-red-500">*</span></Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger id="op-cat" className="bg-background">
                                            <SelectValue placeholder="선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="💄 뷰티">💄 뷰티</SelectItem>
                                            <SelectItem value="👗 패션">👗 패션</SelectItem>
                                            <SelectItem value="🍽️ 맛집">🍽️ 맛집</SelectItem>
                                            <SelectItem value="✈️ 여행">✈️ 여행</SelectItem>
                                            <SelectItem value="🏡 리빙/인테리어">🏡 리빙/인테리어</SelectItem>
                                            <SelectItem value="💻 테크/IT">💻 테크/IT</SelectItem>
                                            <SelectItem value="👶 육아">👶 육아</SelectItem>
                                            <SelectItem value="🐶 반려동물">🐶 반려동물</SelectItem>
                                            <SelectItem value="🏋️ 헬스/운동">🏋️ 헬스/운동</SelectItem>
                                            <SelectItem value="🥗 다이어트">🥗 다이어트</SelectItem>
                                            <SelectItem value="💊 건강">💊 건강</SelectItem>
                                            <SelectItem value="💉 시술/병원">💉 시술/병원</SelectItem>
                                            <SelectItem value="💍 웨딩/결혼">💍 웨딩/결혼</SelectItem>
                                            <SelectItem value="🎮 게임">🎮 게임</SelectItem>
                                            <SelectItem value="📚 도서/자기계발">📚 도서/자기계발</SelectItem>
                                            <SelectItem value="🎨 취미/DIY">🎨 취미/DIY</SelectItem>
                                            <SelectItem value="🎓 교육/강의">🎓 교육/강의</SelectItem>
                                            <SelectItem value="🎬 영화/문화">🎬 영화/문화</SelectItem>
                                            <SelectItem value="💰 재테크">💰 재테크</SelectItem>
                                            <SelectItem value="📌 기타">📌 기타</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="op-price">판매가 (원)</Label>
                                    <Input id="op-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="bg-background" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="op-img">제품 이미지 (300MB 이하)</Label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isImageUploading}
                                        className="flex-1 bg-background"
                                    >
                                        {isImageUploading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Upload className="mr-2 h-4 w-4" />
                                        )}
                                        {isImageUploading ? "업로드 중..." : "이미지 업로드"}
                                    </Button>
                                    {image && image !== "📦" && (
                                        <div className="h-10 w-10 relative bg-muted rounded overflow-hidden shrink-0 border">
                                            <img src={image} alt="Preview" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="op-link">브랜드 몰 링크</Label>
                                <Input
                                    id="op-link"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    onBlur={() => {
                                        if (link && !/^https?:\/\//i.test(link)) {
                                            setLink('https://' + link)
                                        }
                                    }}
                                    placeholder="https://..."
                                    className="bg-background"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 p-5 bg-muted/30 rounded-2xl border border-border/50">
                            <h4 className="font-bold text-sm text-foreground/90 flex items-center gap-2">
                                <AtSign className="h-4 w-4" /> 태그 및 필수 표기
                            </h4>
                            <div className="space-y-2">
                                <Label htmlFor="op-account">브랜드 계정 태그</Label>
                                <Input
                                    id="op-account"
                                    value={accountTag}
                                    onChange={(e) => {
                                        let value = e.target.value
                                        if (value && !value.startsWith('@')) {
                                            value = '@' + value
                                        }
                                        setAccountTag(value)
                                    }}
                                    placeholder="@voib_official"
                                    className="bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="op-tags">필수 해시태그 (스페이스로 구분)</Label>
                                <Input
                                    id="op-tags"
                                    value={hashtags}
                                    onChange={(e) => {
                                        let val = e.target.value
                                        if (val === '') { setHashtags(''); return }
                                        if (!val.startsWith('#')) val = '#' + val
                                        val = val.replace(/ (?!#)(?=\S)/g, ' #')
                                        val = val.replace(/#{2,}/g, '#')
                                        setHashtags(val)
                                    }}
                                    placeholder="#보이브 #룸스프레이"
                                    className="bg-background"
                                />
                            </div>
                            <div className="bg-background p-3 rounded-lg text-xs text-muted-foreground flex items-start gap-2 border border-border">
                                <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                <span>
                                    <span className="font-bold text-red-500">*[광고] 또는 [협찬] 문구</span>를 상단에 필수로 기재해달라는 안내가 자동으로 포함됩니다.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Channel + Detailed Guide */}
                    <div className="space-y-6">
                        <ChannelSelector
                            selected={channels}
                            onChange={setChannels}
                            label="추천 채널"
                            description="이 제품에 적합한 SNS 채널"
                        />
                        <div className="space-y-4 p-5 bg-background rounded-2xl border border-border shadow-sm h-full">
                            <h4 className="font-bold text-sm text-foreground/90 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> 상세 가이드라인
                            </h4>

                            <div className="space-y-2">
                                <Label htmlFor="op-desc">제품 상세 설명</Label>
                                <Textarea id="op-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="제품의 핵심 특징을 요약해주세요." className="min-h-[80px] resize-none" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="op-pts">제품 소구 포인트 (Selling Points)</Label>
                                <Textarea id="op-pts" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="크리에이터가 강조해주길 원하는 장점" className="min-h-[80px] resize-none" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="op-shot">필수 촬영 컷 (Required Shots)</Label>
                                <Textarea id="op-shot" value={shots} onChange={(e) => setShots(e.target.value)} placeholder="예: 언박싱 장면, 얼굴 근접 샷 1회 이상" className="min-h-[80px] resize-none" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="op-content-guide">필수 포함 내용</Label>
                                <Textarea id="op-content-guide" value={contentGuide} onChange={(e) => setContentGuide(e.target.value)} placeholder="예: 향 지속력을 강조해주세요." className="min-h-[80px] resize-none" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="op-format-guide">필수 형식</Label>
                                <Textarea id="op-format-guide" value={formatGuide} onChange={(e) => setFormatGuide(e.target.value)} placeholder="예: 9:16 비율, 30초 이내 영상" className="min-h-[80px] resize-none" />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row justify-between w-full sm:items-center gap-2 sm:gap-0 mt-4 sm:mt-0">
                    <Button variant="outline" onClick={() => handleOpenChange(false)} className="w-full sm:w-auto order-3 sm:order-1">취소</Button>
                    <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                        <Button variant="secondary" onClick={() => handleSubmit(true)} disabled={isSubmitting} type="button" className="flex-1 sm:flex-none">
                            임시저장
                        </Button>
                        <Button onClick={handlePreviewClick} disabled={isSubmitting || isImageUploading} type="button" className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground">
                            {isEditing ? "미리보기 및 수정" : "미리보기 및 등록"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

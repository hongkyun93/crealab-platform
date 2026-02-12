"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Phone, MoreVertical, FileText } from "lucide-react"

// Reuse some logic from BrandChat or make it distinct
export default function CreatorChatDesignLab() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        switch (selectedDesign) {
            case 1: return <MobileAppStyle />;
            default: return <MobileAppStyle />;
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold tracking-tight">메시지</h2>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="rounded-full">안읽음 2</Badge>
                </div>
            </div>

            {/* PREVIEW AREA */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Badge variant={selectedDesign ? "default" : "outline"} className={!selectedDesign ? "bg-green-50 text-green-700 border-green-200" : ""}>
                            {selectedDesign ? `Selected Design #${selectedDesign}` : "Current Implementation"}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-normal">
                            {selectedDesign ? "Applied to Context" : "Live Code"}
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
            <h3 className="font-bold text-xl mb-6">All Variations</h3>

            {/* #1 Mobile Optimized View */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#1. Mobile App Style</h3>
                    <Button size="sm" onClick={() => handleSelect(1)} disabled={selectedDesign === 1}>Select</Button>
                </div>
                <MobileAppStyle />
            </section>
        </div>
    )
}

function MobileAppStyle() {
    return (
        <div className="w-[320px] h-[600px] border-4 border-gray-800 rounded-[2rem] mx-auto bg-white overflow-hidden flex flex-col shadow-2xl">
            {/* Status Bar */}
            <div className="h-6 bg-gray-100 w-full shrink-0" />

            {/* App Header */}
            <div className="p-3 flex items-center justify-between border-b shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 -ml-2">{`<`}</Button>
                    <Avatar className="h-8 w-8"><AvatarFallback>B</AvatarFallback></Avatar>
                    <div className="font-bold text-sm">Brand Manager</div>
                </div>
                <MoreVertical className="h-5 w-5 text-gray-500" />
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-[#f2f2f7] p-3 space-y-3 overflow-y-auto">
                <div className="flex justify-center my-4">
                    <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-1 rounded-full">Feb 12, 2026</span>
                </div>
                <div className="bg-white p-3 rounded-xl rounded-tl-none text-sm shadow-sm max-w-[85%]">
                    안녕하세요 크리에이터님! 이번 캠페인 관련해서 연락드렸습니다.
                </div>
                <div className="flex justify-end">
                    <div className="bg-blue-500 text-white p-3 rounded-xl rounded-tr-none text-sm shadow-sm max-w-[85%]">
                        네 안녕하세요! 어떤 내용일까요?
                    </div>
                </div>

                {/* System Message */}
                <div className="flex gap-2 items-start bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 my-2">
                    <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                        <b>계약서가 도착했습니다.</b><br />
                        서명 후 작업을 시작해주세요.
                        <Button size="sm" variant="outline" className="h-6 mt-1 w-full bg-white border-blue-200 hover:bg-blue-50">계약서 보기</Button>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 border-t bg-gray-50 flex gap-2 items-center">
                <Button size="icon" variant="ghost" className="text-gray-400"><PlusIcon /></Button>
                <Input className="rounded-full bg-white h-9 text-sm" placeholder="메시지 보내기" />
                <Button size="icon" className="h-9 w-9 rounded-full bg-blue-500"><Send className="h-4 w-4" /></Button>
            </div>
        </div>
    )
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    )
}

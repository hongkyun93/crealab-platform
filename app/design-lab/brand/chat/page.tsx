"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Paperclip, MoreVertical, Phone, Video, Smile, Search } from "lucide-react"
import { Card } from "@/components/ui/card"

// --- Mock Data ---
const MOCK_MESSAGES = [
    { id: 1, sender: 'them', text: '안녕하세요! 제안주신 캠페인 확인했습니다.', time: '10:30 AM' },
    { id: 2, sender: 'me', text: '네 반갑습니다! 혹시 일정 관련해서 조정 가능하실까요?', time: '10:32 AM' },
    { id: 3, sender: 'them', text: '네, 다음주 수요일까지는 초안 전달 가능합니다.', time: '10:45 AM' },
    { id: 4, sender: 'me', text: '좋습니다. 그럼 계약서 발송해드리겠습니다.', time: '10:50 AM' },
]

export default function BrandChatDesignLab() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        switch (selectedDesign) {
            case 1: return <BubbleStyle />;
            case 2: return <ProductivityStyle />;
            case 3: return <MinimalistStyle />;
            default: return <BubbleStyle />;
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold tracking-tight">메시지</h2>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">모두 읽음 처리</Button>
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

            {/* #1 Standard Chat (Kakao/iOS Style) */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#1. Bubble Style (Standard)</h3>
                    <Button size="sm" onClick={() => handleSelect(1)} disabled={selectedDesign === 1}>Select</Button>
                </div>
                <BubbleStyle />
            </section>

            {/* #2 Slack Style */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#2. Productivity Style (Slack-like)</h3>
                    <Button size="sm" onClick={() => handleSelect(2)} disabled={selectedDesign === 2}>Select</Button>
                </div>
                <ProductivityStyle />
            </section>

            {/* #3 Minimalist iMessage */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#3. Minimalist (iMessage Style)</h3>
                    <Button size="sm" onClick={() => handleSelect(3)} disabled={selectedDesign === 3}>Select</Button>
                </div>
                <MinimalistStyle />
            </section>

            {/* Grid for remaining */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 border-2 border-dashed">
                    <h3 className="font-bold">#4. Discord Style (Dark)</h3>
                    <p className="text-xs text-muted-foreground mt-1">Gamer / Community vibe</p>
                    <Button variant="link" size="sm" className="px-0" onClick={() => handleSelect(4)}>Select</Button>
                </Card>
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <h3 className="font-bold text-yellow-800">#5. Note / Memo Style</h3>
                    <p className="text-xs text-yellow-600 mt-1">Casual sticky notes</p>
                    <Button variant="link" size="sm" className="px-0 text-yellow-700" onClick={() => handleSelect(5)}>Select</Button>
                </Card>
                <Card className="p-4 bg-gradient-to-r from-purple-400 to-pink-500 text-white">
                    <h3 className="font-bold">#6. Messenger Gradient</h3>
                    <p className="text-xs text-white/80 mt-1">Facebook Messenger style</p>
                    <Button variant="link" size="sm" className="px-0 text-white" onClick={() => handleSelect(6)}>Select</Button>
                </Card>
                <Card className="p-4">
                    <h3 className="font-bold">#7. Email Thread</h3>
                    <p className="text-xs text-muted-foreground mt-1">Formal & Structured</p>
                    <Button variant="link" size="sm" className="px-0" onClick={() => handleSelect(7)}>Select</Button>
                </Card>
                <Card className="p-4">
                    <h3 className="font-bold">#8. Trello/Card Comments</h3>
                    <p className="text-xs text-muted-foreground mt-1">Task-based context</p>
                    <Button variant="link" size="sm" className="px-0" onClick={() => handleSelect(8)}>Select</Button>
                </Card>
                <Card className="p-4">
                    <h3 className="font-bold">#9. Video Call Overlay</h3>
                    <p className="text-xs text-muted-foreground mt-1">Chat on top of video</p>
                    <Button variant="link" size="sm" className="px-0" onClick={() => handleSelect(9)}>Select</Button>
                </Card>
                <Card className="p-4">
                    <h3 className="font-bold">#10. AI Assistant Hybrid</h3>
                    <p className="text-xs text-muted-foreground mt-1">Auto-suggestions enabled</p>
                    <Button variant="link" size="sm" className="px-0" onClick={() => handleSelect(10)}>Select</Button>
                </Card>
            </div>

        </div>
    )
}

function BubbleStyle() {
    return (
        <div className="border rounded-xl h-[500px] flex flex-col bg-[#b2c7d9] overflow-hidden relative">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur p-4 border-b flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback>C</AvatarFallback></Avatar>
                    <div>
                        <div className="font-bold text-sm">Creator Kim</div>
                        <div className="text-xs text-muted-foreground">Online</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {MOCK_MESSAGES.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'them' && <Avatar className="h-8 w-8 mr-2 mt-1"><AvatarFallback>C</AvatarFallback></Avatar>}
                        <div className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.sender === 'me' ? 'bg-[#ffeb33] text-black' : 'bg-white text-black'}`}>
                            {msg.text}
                        </div>
                        <div className="text-[10px] text-gray-500 self-end ml-1 mb-1">{msg.time}</div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t shrink-0 flex items-center gap-2">
                <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5 text-gray-400" /></Button>
                <Input placeholder="메시지를 입력하세요..." className="rounded-full bg-gray-100 border-0" />
                <Button size="icon" className="rounded-full bg-[#ffeb33] hover:bg-[#ffe600] text-black"><Send className="h-4 w-4" /></Button>
            </div>
        </div>
    )
}

function ProductivityStyle() {
    return (
        <div className="border rounded-lg h-[400px] flex flex-col bg-white overflow-hidden">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {MOCK_MESSAGES.map((msg) => (
                    <div key={msg.id} className="flex gap-4 group">
                        <Avatar className="h-9 w-9 rounded"><AvatarFallback className="rounded">{msg.sender === 'me' ? 'B' : 'C'}</AvatarFallback></Avatar>
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-sm">{msg.sender === 'me' ? 'Brand Manager' : 'Creator Kim'}</span>
                                <span className="text-xs text-muted-foreground">{msg.time}</span>
                            </div>
                            <div className="text-sm text-gray-800 mt-0.5 leading-relaxed">
                                {msg.text}
                            </div>
                        </div>
                        {/* Hover Actions */}
                        <div className="opacity-0 group-hover:opacity-100 bg-white shadow-sm border rounded p-1 absolute right-10 -mt-2">
                            <Smile className="h-4 w-4 text-gray-500" />
                        </div>
                    </div>
                ))}

                <div className="flex gap-4">
                    <div className="w-[3px] bg-blue-500 rounded-full h-auto ml-4" />
                    <div className="text-sm text-gray-500 italic">계약서 파일이 업로드되었습니다.</div>
                </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
                <div className="border rounded-lg bg-white p-2">
                    <Input className="border-0 focus-visible:ring-0 shadow-none px-0" placeholder="Reply..." />
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <div className="flex gap-1 text-gray-400">
                            <Badge variant="outline" className="text-xs font-mono font-normal cursor-pointer hover:bg-gray-100">B</Badge>
                            <Badge variant="outline" className="text-xs font-mono font-normal cursor-pointer hover:bg-gray-100">I</Badge>
                            <Badge variant="outline" className="text-xs font-mono font-normal cursor-pointer hover:bg-gray-100">Link</Badge>
                        </div>
                        <Button size="sm" className="h-7 bg-green-700 hover:bg-green-800"><Send className="h-3 w-3" /></Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MinimalistStyle() {
    return (
        <div className="border-0 bg-black rounded-[3rem] p-3 shadow-2xl max-w-sm mx-auto h-[600px] border-4 border-gray-800 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-black rounded-b-xl z-20" />

            <div className="h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                <div className="bg-[#f5f5f5] p-4 pt-10 text-center border-b">
                    <div className="text-xs text-gray-500">To:</div>
                    <div className="font-semibold text-sm">Creator Kim <span className="text-blue-500">›</span></div>
                </div>

                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {MOCK_MESSAGES.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-2 px-3 rounded-2xl text-sm ${msg.sender === 'me'
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : 'bg-[#e5e5ea] text-black rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div className="text-xs text-gray-400 text-center my-4">Delivered</div>
                </div>

                <div className="p-3 bg-white flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center"><Phone className="h-4 w-4 text-gray-500" /></div>
                    <Input placeholder="iMessage" className="rounded-full border-gray-300 h-9" />
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center"><Send className="h-4 w-4 text-white" /></div>
                </div>
            </div>
        </div>
    )
}

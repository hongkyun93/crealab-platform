"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List as ListIcon, Lock } from "lucide-react"

export function CalendarView({ activeMoments = [], upcomingMoments = [], pastMoments = [], onSelectEvent }: { activeMoments?: any[], upcomingMoments?: any[], pastMoments?: any[], onSelectEvent?: (event: any) => void }) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')
    const [filterCategory, setFilterCategory] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all')

    // Combine all relevant moments for the calendar
    const allEvents = [
        ...activeMoments.map(m => ({ ...m, type: 'active' })),
        ...upcomingMoments.map(m => ({ ...m, type: 'upcoming' })),
        ...pastMoments.map(m => ({ ...m, type: 'completed' }))
    ].map(m => ({
        ...m,
        dateObj: new Date(m.date),
    }))

    // Filter Logic
    const filteredEvents = allEvents.filter(event => {
        if (filterCategory !== "all" && event.category !== filterCategory) return false
        if (statusFilter !== 'all' && event.type !== statusFilter) return false

        if (viewMode === 'calendar' && date) {
            // Simple month filtering for calendar view (client-side logic enhancement needed for real app)
            // For now, list shows all, calendar highlights selected date
            return true
        }
        return true
    })

    const selectedDateEvents = allEvents.filter(event =>
        date && event.date === date.toISOString().split('T')[0]
    )

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Left: Calendar Picker */}
            <div className="md:w-auto flex-shrink-0">
                <div className="border rounded-xl p-4 bg-white shadow-sm">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        modifiers={{
                            event: allEvents.map(e => new Date(e.date))
                        }}
                        modifiersStyles={{
                            event: { fontWeight: 'bold', textDecoration: 'underline', color: 'var(--primary)' }
                        }}
                    />
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>진행중 (협업)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            <span>다가오는 일정</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Schedule List / Table */}
            <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold flex items-center gap-2">
                                {date ? date.toLocaleDateString() : "전체 일정"}
                            </h3>
                            <Badge variant="secondary" className="font-normal text-xs">
                                {selectedDateEvents.length}개의 일정
                            </Badge>
                        </div>

                        {/* Status Filters */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-slate-100'}`}
                            >
                                전체보기
                            </button>
                            <button
                                onClick={() => setStatusFilter('active')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === 'active' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-slate-100'}`}
                            >
                                진행중
                            </button>
                            <button
                                onClick={() => setStatusFilter('upcoming')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === 'upcoming' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-slate-100'}`}
                            >
                                다가오는
                            </button>
                            <button
                                onClick={() => setStatusFilter('completed')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === 'completed' ? 'bg-slate-100 text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-slate-100'}`}
                            >
                                지난
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-[120px] h-8 text-xs border-slate-200">
                                <SelectValue placeholder="카테고리" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체</SelectItem>
                                <SelectItem value="뷰티">뷰티</SelectItem>
                                <SelectItem value="패션">패션</SelectItem>
                                <SelectItem value="맛집">맛집</SelectItem>
                                {/* Add more dynamically if needed */}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">브랜드</TableHead>
                                <TableHead className="w-[180px]">제품/캠페인</TableHead>
                                <TableHead className="w-[100px]">원고료</TableHead>
                                <TableHead className="text-center w-[120px]">초안 제출</TableHead>
                                <TableHead className="text-center w-[120px]">최종본 제출</TableHead>
                                <TableHead className="text-center w-[120px]">업로드</TableHead>
                                <TableHead className="text-right w-[100px]">상태</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event, idx) => (
                                    <TableRow
                                        key={idx}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => onSelectEvent?.(event)}
                                    >
                                        <TableCell className="font-medium">
                                            {event.brand_name || event.brandName || event.campaign?.brand_name || (event.type === 'upcoming' ? '-' : '미정')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium truncate">{event.product_name || event.productName || event.title || event.event || "제목 없음"}</span>
                                                {event.type === 'upcoming' && <span className="text-[10px] text-muted-foreground">내 모먼트</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {event.type === 'upcoming' ? '-' : (
                                                event.compensation_amount
                                                    ? `${Number(event.compensation_amount).toLocaleString()}원`
                                                    : event.cost
                                                        ? `${Number(event.cost).toLocaleString()}원`
                                                        : '-'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center text-xs">
                                            {event.type === 'upcoming' ? '-' : (
                                                event.condition_draft_submission_date ? (
                                                    <div className="flex flex-col items-center">
                                                        <span>{event.condition_draft_submission_date}</span>
                                                        {/* D-Day Logic could go here */}
                                                    </div>
                                                ) : '-'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center text-xs">
                                            {event.type === 'upcoming' ? '-' : (event.condition_final_submission_date || '-')}
                                        </TableCell>
                                        <TableCell className="text-center text-xs font-semibold text-slate-700">
                                            {event.type === 'upcoming' ? '-' : (event.condition_upload_date || event.date || '-')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {(() => {
                                                if (event.type === 'upcoming') return <Badge variant="outline" className="text-slate-500">모집중</Badge>
                                                if (event.status === 'completed') return <Badge className="bg-slate-100 text-slate-600 border-0">완료됨</Badge>

                                                // Active Status Logic
                                                if (event.status === 'confirmed') return <Badge className="bg-indigo-100 text-indigo-700 border-0">확정됨</Badge>
                                                if (event.status === 'signed') return <Badge className="bg-purple-100 text-purple-700 border-0">계약완료</Badge>
                                                if (event.status === 'accepted') return <Badge className="bg-blue-100 text-blue-700 border-0">매칭됨</Badge>

                                                return <Badge className="bg-emerald-100 text-emerald-700 border-0">진행중</Badge>
                                            })()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        일정이 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

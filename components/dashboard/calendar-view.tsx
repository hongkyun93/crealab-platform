"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"

export function CalendarView({ activeMoments = [], upcomingMoments = [], pastMoments = [], onSelectMoment }: { activeMoments?: any[], upcomingMoments?: any[], pastMoments?: any[], onSelectMoment?: (event: any) => void }) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all')

    // Combine all relevant moments for the calendar
    const allMoments = [
        ...activeMoments.map(m => ({ ...m, type: 'active' })),
        ...upcomingMoments.map(m => ({ ...m, type: 'upcoming' })),
        ...pastMoments.map(m => ({ ...m, type: 'completed' }))
    ].map(m => ({
        ...m,
        dateObj: new Date(m.date),
    }))

    // Filter Logic
    const filteredEvents = allMoments.filter(event => {
        if (statusFilter !== 'all' && event.type !== statusFilter) return false
        return true
    })

    const selectedDateEvents = allMoments.filter(event =>
        date && event.date === date.toISOString().split('T')[0]
    )

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
            {/* Left: Calendar Picker - Hidden on mobile, shown on tablet+ */}
            <div className="hidden lg:block lg:w-auto flex-shrink-0">
                <div className="border border-border rounded-xl p-4 bg-card shadow-sm">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        modifiers={{
                            event: allMoments.map(e => new Date(e.date))
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
                            <span className="w-2 h-2 rounded-full bg-muted-foreground/30"></span>
                            <span>모집중인 일정</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Schedule List / Table */}
            <div className="flex-1 min-w-0 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
                {/* Header: date + status filters in one row on desktop */}
                <div className="p-3 lg:p-4 border-b border-border bg-muted/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Date title */}
                        <div className="flex items-center gap-2 shrink-0">
                            <h3 className="font-bold text-sm lg:text-base">
                                {date ? date.toLocaleDateString() : "전체 일정"}
                            </h3>
                            <Badge variant="secondary" className="font-normal text-xs">
                                {selectedDateEvents.length}개
                            </Badge>
                        </div>

                        {/* Status Filters — inline on desktop */}
                        <div className="grid grid-cols-4 gap-1 sm:flex sm:items-center sm:gap-1">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`w-full sm:w-auto text-center px-1 lg:px-3 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === 'all' ? 'border-2 border-border text-foreground bg-transparent' : 'text-muted-foreground hover:text-foreground bg-muted'}`}
                            >
                                전체보기
                            </button>
                            <button
                                onClick={() => setStatusFilter('active')}
                                className={`w-full sm:w-auto text-center px-1 lg:px-3 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === 'active' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-muted-foreground hover:text-foreground bg-muted'}`}
                            >
                                진행중
                            </button>
                            <button
                                onClick={() => setStatusFilter('upcoming')}
                                className={`w-full sm:w-auto text-center px-1 lg:px-3 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === 'upcoming' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-muted-foreground hover:text-foreground bg-muted'}`}
                            >
                                모집중
                            </button>
                            <button
                                onClick={() => setStatusFilter('completed')}
                                className={`w-full sm:w-auto text-center px-1 lg:px-3 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === 'completed' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground bg-muted'}`}
                            >
                                완료된
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content - Table on desktop, Cards on mobile */}
                <div className="flex-1 overflow-auto">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">브랜드</TableHead>
                                    <TableHead className="w-[180px]">제품/캠페인</TableHead>
                                    <TableHead className="text-center w-[100px]">원고료</TableHead>
                                    <TableHead className="text-center w-[120px]">초안 제출</TableHead>
                                    <TableHead className="text-center w-[120px]">최종본 제출</TableHead>
                                    <TableHead className="text-center w-[120px]">업로드</TableHead>
                                    <TableHead className="text-center w-[120px]">상태</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map((event, idx) => (
                                        <TableRow
                                            key={idx}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => onSelectMoment?.(event)}
                                        >
                                            <TableCell className="font-medium">
                                                {event.brand_name || event.brandName || event.campaign?.brand_name || (event.type === 'upcoming' ? '-' : '미정')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium truncate">{event.product_name || event.productName || event.title || "제목 없음"}</span>

                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {event.type === 'upcoming' ? '-' : (
                                                    event.price_offer
                                                        ? `${Number(event.price_offer).toLocaleString()}원`
                                                        : event.compensation_amount
                                                            ? (Number.isNaN(Number(event.compensation_amount)) ? event.compensation_amount : `${Number(event.compensation_amount).toLocaleString()}원`)
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
                                                        </div>
                                                    ) : '-'
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center text-xs">
                                                {event.type === 'upcoming' ? '-' : (event.condition_final_submission_date || '-')}
                                            </TableCell>
                                            <TableCell className="text-center text-xs font-semibold text-foreground">
                                                {event.type === 'upcoming' ? '-' : (
                                                    // Determine the date string to show
                                                    (() => {
                                                        const singleDate = event.condition_upload_date || event.date;
                                                        // Prefer start/end date from unified model if available
                                                        const startDate = event.momentStartDate || event.moment_start_date;
                                                        const endDate = event.momentEndDate || event.moment_end_date;

                                                        if (!startDate) return singleDate || '-';

                                                        const s = new Date(startDate);
                                                        const sStr = `${s.getMonth() + 1}/${s.getDate()}`;

                                                        if (endDate && startDate !== endDate) {
                                                            const e = new Date(endDate);
                                                            if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
                                                                return `${sStr} ~ ${e.getDate()}`;
                                                            } else {
                                                                return `${sStr} ~ ${e.getMonth() + 1}/${e.getDate()}`;
                                                            }
                                                        }

                                                        return sStr || singleDate || '-';
                                                    })()
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(() => {
                                                    if (event.type === 'upcoming') return <Badge variant="outline" className="text-muted-foreground">모집중</Badge>
                                                    if (event.status === 'completed') return <Badge className="bg-muted text-muted-foreground border-0">완료됨</Badge>

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

                    {/* Mobile Card View */}
                    <div className="lg:hidden p-3 space-y-3">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event, idx) => (
                                <Card
                                    key={idx}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => onSelectMoment?.(event)}
                                >
                                    <CardContent className="p-4 space-y-3">
                                        {/* Header: Brand + Status */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm">
                                                    {event.brand_name || event.brandName || event.campaign?.brand_name || (event.type === 'upcoming' ? '-' : '미정')}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {event.product_name || event.productName || event.title || "제목 없음"}
                                                </div>
                                            </div>
                                            <div className="ml-2">
                                                {(() => {
                                                    if (event.type === 'upcoming') return <Badge variant="outline" className="text-muted-foreground">모집중</Badge>
                                                    if (event.status === 'completed') return <Badge className="bg-muted text-muted-foreground border-0">완료</Badge>
                                                    if (event.status === 'confirmed') return <Badge className="bg-indigo-100 text-indigo-700 border-0">확정</Badge>
                                                    if (event.status === 'signed') return <Badge className="bg-purple-100 text-purple-700 border-0">계약</Badge>
                                                    if (event.status === 'accepted') return <Badge className="bg-blue-100 text-blue-700 border-0">매칭</Badge>
                                                    return <Badge className="bg-emerald-100 text-emerald-700 border-0">진행중</Badge>
                                                })()}
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        {event.type !== 'upcoming' && (
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-muted-foreground">원고료:</span>
                                                    <div className="font-medium">
                                                        {event.price_offer
                                                            ? `${Number(event.price_offer).toLocaleString()}원`
                                                            : event.compensation_amount
                                                                ? (Number.isNaN(Number(event.compensation_amount)) ? event.compensation_amount : `${Number(event.compensation_amount).toLocaleString()}원`)
                                                                : event.cost
                                                                    ? `${Number(event.cost).toLocaleString()}원`
                                                                    : '-'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">업로드:</span>
                                                    <div className="font-medium">
                                                        {(() => {
                                                            const singleDate = event.condition_upload_date || event.date;
                                                            const startDate = event.momentStartDate || event.moment_start_date;
                                                            const endDate = event.momentEndDate || event.moment_end_date;

                                                            if (!startDate) return singleDate || '-';

                                                            const s = new Date(startDate);
                                                            const sStr = `${s.getMonth() + 1}/${s.getDate()}`;

                                                            if (endDate && startDate !== endDate) {
                                                                const e = new Date(endDate);
                                                                if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
                                                                    return `${sStr} ~ ${e.getDate()}`;
                                                                } else {
                                                                    return `${sStr} ~ ${e.getMonth() + 1}/${e.getDate()}`;
                                                                }
                                                            }

                                                            return sStr || singleDate || '-';
                                                        })()}
                                                    </div>
                                                </div>
                                                {event.condition_draft_submission_date && (
                                                    <div>
                                                        <span className="text-muted-foreground">초안:</span>
                                                        <div className="font-medium">{event.condition_draft_submission_date}</div>
                                                    </div>
                                                )}
                                                {event.condition_final_submission_date && (
                                                    <div>
                                                        <span className="text-muted-foreground">최종:</span>
                                                        <div className="font-medium">{event.condition_final_submission_date}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                                일정이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}

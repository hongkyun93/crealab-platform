"use client"

import React, { useState, useEffect } from 'react'
import DaumPostcodeEmbed from 'react-daum-postcode'
import { useTheme } from 'next-themes'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

interface AddressSearchResult {
    zonecode: string // 우편번호
    address: string // 기본주소
}

interface AddressSearchDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onComplete: (data: AddressSearchResult) => void
}

export function AddressSearchDialog({ open, onOpenChange, onComplete }: AddressSearchDialogProps) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])
    const handleComplete = (data: any) => {
        let fullAddress = data.address
        let extraAddress = ''

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname
            }
            if (data.buildingName !== '') {
                extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName
            }
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : ''
        }

        onComplete({
            zonecode: data.zonecode,
            address: fullAddress,
        })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>주소 검색</DialogTitle>
                    <DialogDescription>
                        우편번호 및 도로명/지번 주소를 검색해주세요.
                    </DialogDescription>
                </DialogHeader>
                <div className="h-[450px] w-full bg-background relative mt-2">
                    {mounted && (
                        <DaumPostcodeEmbed
                            onComplete={handleComplete}
                            style={{ height: '100%', width: '100%' }}
                            autoClose={false}
                            theme={
                                resolvedTheme === 'dark'
                                    ? {
                                        bgColor: "#09090b", // zinc-950 (background)
                                        searchBgColor: "#18181b", // zinc-900
                                        contentBgColor: "#09090b",
                                        pageBgColor: "#09090b",
                                        textColor: "#fafafa", // zinc-50 (foreground)
                                        queryTextColor: "#fafafa",
                                        postcodeTextColor: "#818cf8", // indigo-400
                                        emphTextColor: "#38bdf8", // sky-400
                                        outlineColor: "#27272a", // zinc-800
                                    }
                                    : undefined
                            }
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

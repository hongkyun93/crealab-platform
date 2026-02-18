"use client"

import { cn } from "@/lib/utils"

interface CategorySelectorProps {
    selected: string[]
    onChange: (categories: string[]) => void
    options: string[]
    maxSelections?: number
    label?: string
}

export function CategorySelector({
    selected,
    onChange,
    options,
    maxSelections,
    label = "카테고리"
}: CategorySelectorProps) {
    const toggle = (category: string) => {
        if (selected.includes(category)) {
            onChange(selected.filter(c => c !== category))
        } else {
            if (maxSelections && selected.length >= maxSelections) {
                return // Don't allow more than max selections
            }
            onChange([...selected, category])
        }
    }

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                    {maxSelections && (
                        <span className="ml-2 text-xs text-muted-foreground">
                            (최대 {maxSelections}개 선택)
                        </span>
                    )}
                </label>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {options.map((category) => {
                    const isSelected = selected.includes(category)
                    const isDisabled = maxSelections && !isSelected && selected.length >= maxSelections

                    return (
                        <button
                            key={category}
                            type="button"
                            onClick={() => toggle(category)}
                            disabled={!!isDisabled}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all border-2",
                                isSelected
                                    ? "bg-primary text-primary-foreground border-primary ring-2 ring-offset-2 ring-primary/20"
                                    : isDisabled
                                        ? "bg-muted/30 text-muted-foreground border-muted cursor-not-allowed opacity-50"
                                        : "bg-background hover:bg-muted/50 hover:border-primary/50 text-foreground border-border"
                            )}
                        >
                            {category}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

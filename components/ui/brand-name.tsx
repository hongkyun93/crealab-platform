/**
 * BrandName - CreadyPick 브랜드명 컬러 컴포넌트
 * Cready = emerald, Pick = indigo
 */
export function BrandName({ className }: { className?: string }) {
    return (
        <span className={className}>
            <span className="text-[#008080]">Cready</span>
            <span className="text-[#B342AF]">Pick</span>
        </span>
    )
}

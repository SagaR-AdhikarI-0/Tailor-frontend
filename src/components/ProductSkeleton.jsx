export default function ProductSkeleton({ compact = false }) {
    if (compact) {
        return (
            <div className="animate-pulse rounded-[22px] border border-stone-200 bg-white p-2.5 shadow-sm" aria-hidden="true">
                <div className="aspect-[4/5] rounded-[16px] bg-stone-200" />
                <div className="px-1.5 pb-1 pt-3">
                    <div className="h-2.5 w-24 rounded-full bg-stone-200" />
                    <div className="mt-3 h-5 w-3/4 rounded-full bg-stone-200" />
                    <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-2.5">
                        <div className="h-2.5 w-16 rounded-full bg-stone-200" />
                        <div className="h-3 w-12 rounded-full bg-stone-200" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <article className="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" aria-hidden="true">
            <div className="h-72 bg-stone-200" />
            <div className="p-5">
                <div className="h-3 w-24 rounded-full bg-stone-200" />
                <div className="mt-3 h-6 w-2/3 rounded-full bg-stone-200" />
                <div className="mt-3 h-4 w-20 rounded-full bg-stone-200" />
                <div className="mt-5 h-11 rounded-full bg-stone-200" />
            </div>
        </article>
    )
}
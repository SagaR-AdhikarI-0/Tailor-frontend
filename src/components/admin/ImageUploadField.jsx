import { useEffect, useId, useState } from 'react'

export default function ImageUploadField({ label = 'Image', value = '', onChange, onError }) {
    const inputId = useId()
    const [localPreview, setLocalPreview] = useState('')
    const preview = localPreview || value

    useEffect(() => {
        return () => {
            if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
        }
    }, [preview])

    const handleChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const localPreview = URL.createObjectURL(file)
        setLocalPreview(localPreview)
        onError?.('')
        onChange(file)
    }

    return (
        <div>
            <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-stone-700">{label}</label>
            <label htmlFor={inputId} className="group block cursor-pointer overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-stone-50 transition hover:border-stone-500 hover:bg-stone-100 focus-within:ring-2 focus-within:ring-stone-400 focus-within:ring-offset-2">
                {preview ? (
                    <div className="relative">
                        <img src={preview} alt={`${label} preview`} className="h-56 w-full bg-stone-100 object-contain p-3" />
                        <span className="absolute inset-x-0 bottom-0 bg-stone-900/75 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white opacity-0 transition group-hover:opacity-100">Replace image</span>
                    </div>
                ) : (
                    <div className="flex h-44 flex-col items-center justify-center px-4 text-center text-stone-500">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm transition group-hover:scale-110">+</div>
                        <p className="text-sm font-medium">Click to add an image</p>
                        <p className="mt-1 text-xs">PNG, JPG, or WEBP</p>
                    </div>
                )}
                <input id={inputId} type="file" accept="image/*" onChange={handleChange} className="sr-only" />
            </label>
            <p className="mt-2 text-xs text-stone-500">{preview ? 'Image ready. It uploads when you save.' : 'Optional'}</p>
        </div>
    )
}

import { useEffect, useState } from 'react'
import { uploadImage } from '../../utils/uploadImage'

export default function ImageUploadField({ label = 'Image', value = '', onChange, onUploading, onError }) {
    const [preview, setPreview] = useState(value)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        return () => {
            if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
        }
    }, [preview])

    const handleChange = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const localPreview = URL.createObjectURL(file)
        setPreview(localPreview)
        setIsUploading(true)
        onUploading?.(true)
        onError?.('')

        try {
            const imageUrl = await uploadImage(file)
            setPreview(imageUrl)
            onChange(imageUrl)
        } catch (error) {
            setPreview(value || '')
            onError?.(error.message || 'Image upload failed.')
        } finally {
            setIsUploading(false)
            onUploading?.(false)
        }
    }

    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">{label}</label>
            <div className="overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-stone-50">
                {preview ? (
                    <img src={preview} alt={`${label} preview`} className="h-44 w-full object-cover" />
                ) : (
                    <div className="flex h-44 flex-col items-center justify-center px-4 text-center text-stone-500">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">+</div>
                        <p className="text-sm font-medium">No image selected</p>
                        <p className="mt-1 text-xs">Choose an image to preview it here</p>
                    </div>
                )}
                <div className="flex items-center justify-between gap-3 border-t border-stone-200 bg-white p-3">
                    <input type="file" accept="image/*" onChange={handleChange} className="min-w-0 text-sm text-stone-600" />
                    <span className="shrink-0 text-xs text-stone-500">{isUploading ? 'Uploading...' : preview ? 'Ready' : 'Optional'}</span>
                </div>
            </div>
        </div>
    )
}

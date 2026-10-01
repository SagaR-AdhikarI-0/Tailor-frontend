import { useMemo, useState } from 'react'
import AdminShell from '../../components/admin/AdminShell'
import ImageUploadField from '../../components/admin/ImageUploadField'
import { uploadImage } from '../../utils/uploadImage'
import { useGetGarmentsQuery } from '../../features/products/productApi'
import { useCreateDesignMutation, useDeleteDesignMutation, useGetDesignsQuery } from '../../features/designs/designApi'

const emptyForm = { name: '', description: '', imageUrl: '', tailoringPrice: '' }
const getErrorMessage = (error) => error?.data?.message || error?.error || error?.message || 'Something went wrong.'

export default function DesignsPage() {
    const { data: garments = [] } = useGetGarmentsQuery()
    const { data: designs = [], isLoading, isError } = useGetDesignsQuery()
    const [createDesign, { isLoading: creating }] = useCreateDesignMutation()
    const [deleteDesign] = useDeleteDesignMutation()
    const [selectedGarmentId, setSelectedGarmentId] = useState('')
    const [form, setForm] = useState(emptyForm)
    const [message, setMessage] = useState('')
    const [imageUploading, setImageUploading] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [imageError, setImageError] = useState('')
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [sort, setSort] = useState('name')

    const activeGarments = garments.filter((garment) => garment.isActive !== false)
    const visibleDesigns = useMemo(() => designs.filter((design) => {
        const matchesGarment = !selectedGarmentId || String(design.garmentId) === selectedGarmentId
        const matchesSearch = `${design.name || ''} ${design.description || ''}`.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = status === 'all' || (status === 'active' ? design.isActive !== false : design.isActive === false)
        return matchesGarment && matchesSearch && matchesStatus
    }).sort((left, right) => sort === 'price' ? Number(left.tailoringPrice || 0) - Number(right.tailoringPrice || 0) : String(left.name || '').localeCompare(String(right.name || ''))), [designs, search, selectedGarmentId, sort, status])
    const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

    const handleSubmit = async (event) => {
        event.preventDefault()
        setMessage('')
        const garment = activeGarments.find((item) => String(item.id) === selectedGarmentId)
        const tailoringPrice = Number(form.tailoringPrice)
        if (!garment || !form.name.trim() || Number.isNaN(tailoringPrice) || tailoringPrice < 0) {
            setMessage('Select an active garment, enter a design name, and provide a valid tailoring price.')
            return
        }
        try {
            setImageUploading(true)
            const imageUrl = imageFile ? await uploadImage(imageFile) : form.imageUrl.trim() || null
            await createDesign({
                garmentId: garment.id,
                name: form.name.trim(),
                description: form.description.trim() || null,
                imageUrl,
                tailoringPrice,
                isActive: true,
            }).unwrap()
            setForm(emptyForm)
            setImageFile(null)
            setMessage('Design created.')
        } catch (error) {
            setMessage(getErrorMessage(error))
        } finally {
            setImageUploading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Deactivate this design?')) return
        try {
            await deleteDesign(id).unwrap()
            setMessage('Design deactivated.')
        } catch (error) {
            setMessage(getErrorMessage(error))
        }
    }

    return (
        <AdminShell title="Design management" eyebrow="Collection details">
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                <section className="rounded-3xl border border-stone-200 bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Designs by garment</h2><p className="mt-1 text-sm text-stone-500">Select a garment to inspect its designs.</p></div><select value={selectedGarmentId} onChange={(event) => setSelectedGarmentId(event.target.value)} className="admin-input max-w-xs"><option value="">All garments</option>{activeGarments.map((garment) => <option key={garment.id} value={garment.id}>{garment.name}</option>)}</select></div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search designs" className="admin-input" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="admin-input"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} className="admin-input"><option value="name">Sort by name</option><option value="price">Sort by price</option></select></div>
                    {isLoading ? <p className="mt-6 text-sm text-stone-500">Loading designs...</p> : isError ? <p className="mt-6 text-sm text-red-700">Unable to load designs.</p> : <div className="mt-5 space-y-3">{visibleDesigns.length === 0 ? <p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-500">No designs for this selection.</p> : visibleDesigns.map((design) => <div key={design.id} className="flex items-center gap-4 rounded-2xl border border-stone-100 p-3"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">{design.imageUrl ? <img src={design.imageUrl} alt={design.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] uppercase text-stone-400">No image</div>}</div><div className="min-w-0 flex-1"><p className="font-medium">{design.name}</p><p className="text-sm text-stone-500">{design.garmentName || garments.find((garment) => garment.id === design.garmentId)?.name || 'Garment'}</p><p className="mt-1 text-sm">{design.tailoringPrice != null ? `$${design.tailoringPrice}` : 'Custom'}</p></div><button type="button" onClick={() => handleDelete(design.id)} className="text-sm font-medium text-red-700 underline underline-offset-4">Delete</button></div>)}</div>}
                </section>
                <section className="rounded-3xl border border-stone-200 bg-white p-5"><h2 className="text-xl font-semibold">Add design</h2><form onSubmit={handleSubmit} className="mt-5 space-y-4"><select value={selectedGarmentId} onChange={(event) => setSelectedGarmentId(event.target.value)} required className="admin-input"><option value="">Select active garment</option>{activeGarments.map((garment) => <option key={garment.id} value={garment.id}>{garment.name}</option>)}</select><input name="name" value={form.name} onChange={handleChange} required placeholder="Design name" className="admin-input" /><textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Description" className="admin-input" /><ImageUploadField key={imageFile?.name || form.imageUrl || 'empty-image'} label="Design image" value={form.imageUrl} onChange={setImageFile} onError={setImageError} />{imageError && <p className="text-sm text-red-700">{imageError}</p>}<input name="tailoringPrice" value={form.tailoringPrice} onChange={handleChange} required type="number" min="0" step="0.01" placeholder="Tailoring price" className="admin-input" />{message && <p className="rounded-2xl bg-stone-50 p-3 text-sm text-stone-700">{message}</p>}<button type="submit" disabled={creating || imageUploading} className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{creating || imageUploading ? 'Saving...' : 'Create design'}</button></form></section>
            </div>
        </AdminShell>
    )
}

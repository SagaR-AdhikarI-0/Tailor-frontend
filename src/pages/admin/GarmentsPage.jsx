import { useMemo, useState } from 'react'
import AdminShell from '../../components/admin/AdminShell'
import ImageUploadField from '../../components/admin/ImageUploadField'
import {
    useCreateGarmentMutation,
    useDeleteGarmentMutation,
    useGetGarmentsQuery,
    useUpdateGarmentMutation,
} from '../../features/products/productApi'

const emptyForm = {
    name: '',
    category: '',
    description: '',
    iconUrl: '',
    requiredMeasurementsJson: '[]',
    basePrice: '',
}

const getErrorMessage = (error) => error?.data?.message || error?.error || error?.message || 'Something went wrong.'

export default function GarmentsPage() {
    const { data: garments = [], isLoading, isError } = useGetGarmentsQuery()
    const [createGarment, { isLoading: creating }] = useCreateGarmentMutation()
    const [updateGarment, { isLoading: updating }] = useUpdateGarmentMutation()
    const [deleteGarment] = useDeleteGarmentMutation()
    const [form, setForm] = useState(emptyForm)
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState('')
    const [imageUploading, setImageUploading] = useState(false)
    const [imageError, setImageError] = useState('')
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [sort, setSort] = useState('name')
    const visibleGarments = useMemo(() => garments.filter((garment) => {
        const matchesSearch = `${garment.name} ${garment.category || ''}`.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = status === 'all' || (status === 'active' ? garment.isActive !== false : garment.isActive === false)
        return matchesSearch && matchesStatus
    }).sort((left, right) => {
        if (sort === 'price') return Number(left.basePrice || 0) - Number(right.basePrice || 0)
        if (sort === 'status') return Number(right.isActive !== false) - Number(left.isActive !== false)
        return String(left.name || '').localeCompare(String(right.name || ''))
    }), [garments, search, sort, status])

    const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setMessage('')
        const name = form.name.trim()
        const basePrice = Number(form.basePrice)
        let measurements

        try {
            measurements = JSON.parse(form.requiredMeasurementsJson)
        } catch {
            setMessage('Required measurements must be valid JSON.')
            return
        }

        if (!name || !form.category.trim() || !Array.isArray(measurements) || Number.isNaN(basePrice) || basePrice < 0) {
            setMessage('Name, category, a valid price, and a JSON array of measurements are required.')
            return
        }

        const body = {
            name,
            category: form.category.trim(),
            description: form.description.trim() || null,
            iconUrl: form.iconUrl.trim() || null,
            requiredMeasurementsJson: JSON.stringify(measurements),
            basePrice,
            isActive: true,
        }

        try {
            if (editingId) await updateGarment({ id: editingId, ...body }).unwrap()
            else await createGarment(body).unwrap()
            setMessage(editingId ? 'Garment updated.' : 'Garment created.')
            resetForm()
        } catch (error) {
            setMessage(getErrorMessage(error))
        }
    }

    const startEditing = (garment) => {
        setEditingId(garment.id)
        setForm({
            name: garment.name || '',
            category: garment.category || '',
            description: garment.description || '',
            iconUrl: garment.iconUrl || '',
            requiredMeasurementsJson: garment.requiredMeasurementsJson || '[]',
            basePrice: garment.basePrice ?? '',
        })
        setMessage('')
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Deactivate this garment? It will no longer be visible to customers.')) return
        try {
            await deleteGarment(id).unwrap()
            setMessage('Garment deactivated.')
        } catch (error) {
            setMessage(getErrorMessage(error))
        }
    }

    return (
        <AdminShell title="Garment management" eyebrow="Inventory">
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
                    <div className="border-b border-stone-200 p-5">
                        <h2 className="text-xl font-semibold">Garments</h2>
                        <p className="mt-1 text-sm text-stone-500">Manage the pieces available in your collection.</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search garments" className="admin-input" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="admin-input"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} className="admin-input"><option value="name">Sort by name</option><option value="price">Sort by price</option><option value="status">Sort by status</option></select></div>
                    </div>
                    {isLoading ? <p className="p-5 text-sm text-stone-500">Loading garments...</p> : isError ? <p className="p-5 text-sm text-red-700">Unable to load garments.</p> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-stone-50 text-stone-500"><tr><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Category</th><th className="px-5 py-3 font-medium">Base price</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Actions</th></tr></thead>
                                <tbody>
                                    {visibleGarments.map((garment) => <tr key={garment.id} className="border-t border-stone-100">
                                        <td className="px-5 py-4 font-medium">{garment.name}</td>
                                        <td className="px-5 py-4 text-stone-600">{garment.category || 'Uncategorized'}</td>
                                        <td className="px-5 py-4">{garment.basePrice != null ? `$${garment.basePrice}` : 'Custom'}</td>
                                        <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${garment.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>{garment.isActive ? 'Active' : 'Inactive'}</span></td>
                                        <td className="px-5 py-4"><div className="flex gap-3"><button type="button" onClick={() => setMessage(`${garment.name}: ${garment.description || 'No description available.'}`)} className="font-medium underline underline-offset-4">View</button><button type="button" onClick={() => startEditing(garment)} className="font-medium underline underline-offset-4">Edit</button><button type="button" onClick={() => handleDelete(garment.id)} className="font-medium text-red-700 underline underline-offset-4">Delete</button></div></td>
                                    </tr>)}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="rounded-3xl border border-stone-200 bg-white p-5">
                    <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">{editingId ? 'Edit garment' : 'Create garment'}</h2>{editingId && <button type="button" onClick={resetForm} className="text-sm underline underline-offset-4">Cancel</button>}</div>
                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" className="admin-input" />
                        <input name="category" value={form.category} onChange={handleChange} required placeholder="Category" className="admin-input" />
                        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows="3" className="admin-input" />
                        <ImageUploadField label="Garment image" value={form.iconUrl} onChange={(iconUrl) => setForm((current) => ({ ...current, iconUrl }))} onUploading={setImageUploading} onError={setImageError} />
                        {imageError && <p className="text-sm text-red-700">{imageError}</p>}
                        <textarea name="requiredMeasurementsJson" value={form.requiredMeasurementsJson} onChange={handleChange} required rows="3" placeholder='Required measurements JSON, e.g. [{"name":"chest"}]' className="admin-input font-mono text-xs" />
                        <input name="basePrice" value={form.basePrice} onChange={handleChange} required type="number" min="0" step="0.01" placeholder="Base price" className="admin-input" />
                        {message && <p className="rounded-2xl bg-stone-50 p-3 text-sm text-stone-700">{message}</p>}
                        <button type="submit" disabled={creating || updating || imageUploading} className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{creating || updating || imageUploading ? 'Saving...' : editingId ? 'Update garment' : 'Create garment'}</button>
                    </form>
                </section>
            </div>
        </AdminShell>
    )
}

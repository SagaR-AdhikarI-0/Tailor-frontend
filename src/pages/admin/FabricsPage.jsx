import { useMemo, useState } from 'react'
import AdminShell from '../../components/admin/AdminShell'
import { useCreateFabricMutation, useDeleteFabricMutation, useGetFabricsQuery, useUpdateFabricMutation } from '../../features/fabrics/fabricApi'

const emptyForm = { name: '', category: '', description: '', color: '', price: '', availableQuantity: '', imageUrl: '' }
const getErrorMessage = (error) => error?.data?.message || error?.error || error?.message || 'Something went wrong.'

export default function FabricsPage() {
    const { data: fabrics = [], isLoading, isError } = useGetFabricsQuery()
    const [createFabric, { isLoading: creating }] = useCreateFabricMutation()
    const [updateFabric] = useUpdateFabricMutation()
    const [deleteFabric] = useDeleteFabricMutation()
    const [form, setForm] = useState(emptyForm)
    const [editingId, setEditingId] = useState(null)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [sort, setSort] = useState('name')
    const [message, setMessage] = useState('')

    const filteredFabrics = useMemo(() => fabrics.filter((fabric) => {
        const matchesSearch = `${fabric.name} ${fabric.category} ${fabric.color}`.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = status === 'all' || (status === 'active' ? fabric.isActive !== false : fabric.isActive === false)
        return matchesSearch && matchesStatus
    }).sort((left, right) => {
        if (sort === 'price') return Number(left.price || 0) - Number(right.price || 0)
        if (sort === 'quantity') return Number(left.availableQuantity || 0) - Number(right.availableQuantity || 0)
        return String(left.name || '').localeCompare(String(right.name || ''))
    }), [fabrics, search, sort, status])
    const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    const resetForm = () => { setForm(emptyForm); setEditingId(null) }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setMessage('')
        const price = Number(form.price)
        const availableQuantity = Number(form.availableQuantity)
        if (!form.name.trim() || Number.isNaN(price) || price < 0 || Number.isNaN(availableQuantity) || availableQuantity < 0) {
            setMessage('Name, a non-negative price, and a non-negative quantity are required.')
            return
        }
        const body = { name: form.name.trim(), category: form.category.trim() || null, description: form.description.trim() || null, color: form.color.trim() || null, price, availableQuantity, imageUrl: form.imageUrl.trim() || null, isActive: true }
        try {
            if (editingId) await updateFabric({ id: editingId, ...body }).unwrap()
            else await createFabric(body).unwrap()
            setMessage(editingId ? 'Fabric updated.' : 'Fabric created.')
            resetForm()
        } catch (error) { setMessage(getErrorMessage(error)) }
    }

    const startEditing = (fabric) => {
        setEditingId(fabric.id)
        setForm({ name: fabric.name || '', category: fabric.category || '', description: fabric.description || '', color: fabric.color || '', price: fabric.price ?? '', availableQuantity: fabric.availableQuantity ?? '', imageUrl: fabric.imageUrl || '' })
    }
    const handleDelete = async (id) => {
        if (!window.confirm('Deactivate this fabric?')) return
        try { await deleteFabric(id).unwrap(); setMessage('Fabric deactivated.') } catch (error) { setMessage(getErrorMessage(error)) }
    }

    return (
        <AdminShell title="Fabric management" eyebrow="Materials">
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white"><div className="flex flex-col gap-3 border-b border-stone-200 p-5 sm:flex-row"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search fabrics" className="admin-input" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="admin-input sm:max-w-44"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} className="admin-input sm:max-w-44"><option value="name">Sort by name</option><option value="price">Sort by price</option><option value="quantity">Sort by quantity</option></select></div>{isLoading ? <p className="p-5 text-sm text-stone-500">Loading fabrics...</p> : isError ? <p className="p-5 text-sm text-red-700">Unable to load fabrics.</p> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-stone-50 text-stone-500"><tr><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Category</th><th className="px-5 py-3 font-medium">Color</th><th className="px-5 py-3 font-medium">Price</th><th className="px-5 py-3 font-medium">Quantity</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Actions</th></tr></thead><tbody>{filteredFabrics.map((fabric) => <tr key={fabric.id} className="border-t border-stone-100"><td className="px-5 py-4 font-medium">{fabric.name}</td><td className="px-5 py-4 text-stone-600">{fabric.category || '-'}</td><td className="px-5 py-4 text-stone-600">{fabric.color || '-'}</td><td className="px-5 py-4">{fabric.price != null ? `$${fabric.price}` : '-'}</td><td className="px-5 py-4">{fabric.availableQuantity ?? 0}</td><td className="px-5 py-4">{fabric.isActive === false ? 'Inactive' : 'Active'}</td><td className="px-5 py-4"><div className="flex gap-3"><button type="button" onClick={() => startEditing(fabric)} className="underline underline-offset-4">Edit</button><button type="button" onClick={() => handleDelete(fabric.id)} className="text-red-700 underline underline-offset-4">Delete</button></div></td></tr>)}</tbody></table></div>}</section>
                <section className="rounded-3xl border border-stone-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">{editingId ? 'Edit fabric' : 'Add fabric'}</h2>{editingId && <button type="button" onClick={resetForm} className="text-sm underline underline-offset-4">Cancel</button>}</div><form onSubmit={handleSubmit} className="mt-5 space-y-4"><input name="name" value={form.name} onChange={handleChange} required placeholder="Name" className="admin-input" /><input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="admin-input" /><textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Description" className="admin-input" /><input name="color" value={form.color} onChange={handleChange} placeholder="Color" className="admin-input" /><input name="price" value={form.price} onChange={handleChange} required type="number" min="0" step="0.01" placeholder="Price" className="admin-input" /><input name="availableQuantity" value={form.availableQuantity} onChange={handleChange} required type="number" min="0" step="0.01" placeholder="Available quantity" className="admin-input" /><input name="imageUrl" value={form.imageUrl} onChange={handleChange} type="url" placeholder="Image URL" className="admin-input" />{form.imageUrl && <img src={form.imageUrl} alt="Fabric preview" className="h-32 w-full rounded-2xl object-cover" />}{message && <p className="rounded-2xl bg-stone-50 p-3 text-sm text-stone-700">{message}</p>}<button type="submit" disabled={creating} className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{creating ? 'Saving...' : editingId ? 'Update fabric' : 'Create fabric'}</button></form></section>
            </div>
        </AdminShell>
    )
}

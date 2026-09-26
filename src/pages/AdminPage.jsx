import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, selectUser } from '../features/auth/authSlice'
import { useCreateGarmentMutation, useGetProductsQuery } from '../features/products/productApi'
import { useGetDesignsQuery } from '../features/designs/designApi'
import { useGetFabricsQuery } from '../features/fabrics/fabricApi'
import { useGetMyOrdersQuery } from '../features/orders/orderApi'
import { uploadImage } from '../utils/uploadImage'

const fabricRows = [
    { name: 'Italian Wool', color: 'Charcoal', stock: 42, unit: 'meters' },
    { name: 'Silk Satin', color: 'Crimson', stock: 26, unit: 'meters' },
    { name: 'Cotton Linen', color: 'Ivory', stock: 18, unit: 'meters' },
]

const initialForm = {
    name: '',
    category: '',
    description: '',
    price: '',
    isActive: true,
    image: null,
}

function AdminPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector(selectUser)
    const { data: garments = [], isLoading: isLoadingGarments } = useGetProductsQuery({ page: 1, limit: 20 })
    const { data: designs = [] } = useGetDesignsQuery()
    const { data: fabrics = [] } = useGetFabricsQuery()
    const { data: orderData = [] } = useGetMyOrdersQuery()
    const [createGarment, { isLoading: isCreatingGarment }] = useCreateGarmentMutation()
    const [form, setForm] = useState(initialForm)
    const [submitMessage, setSubmitMessage] = useState('')
    const [imagePreview, setImagePreview] = useState('')
    const orders = Array.isArray(orderData) ? orderData : []
    const activeOrders = orders.filter((order) => !['completed', 'cancelled', 'canceled'].includes(String(order.status || '').toLowerCase())).length
    const revenue = orders.reduce((total, order) => total + Number(order.total ?? order.totalAmount ?? order.amount ?? 0), 0)
    const totalDesigns = designs.length || garments.reduce((total, garment) => total + (garment.designs?.length || 0), 0)
    const stats = [
        { label: 'Total garments', value: garments.length, detail: 'Collection pieces' },
        { label: 'Total designs', value: totalDesigns, detail: 'Design variations' },
        { label: 'Total fabrics', value: fabrics.length, detail: 'Material catalog' },
        { label: 'Active orders', value: activeOrders, detail: 'Orders in progress' },
        { label: 'Revenue', value: `$${revenue.toFixed(2)}`, detail: 'From available orders' },
    ]

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview)
        }
    }, [imagePreview])

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target
        const nextValue = type === 'checkbox' ? checked : type === 'file' ? event.target.files?.[0] || null : value

        if (type === 'file') {
            setImagePreview(nextValue ? URL.createObjectURL(nextValue) : '')
        }

        setForm((current) => ({
            ...current,
            [name]: nextValue,
        }))
    }

    const handleCreateGarment = async (event) => {
        event.preventDefault()
        setSubmitMessage('')

        const trimmedName = form.name.trim()
        const trimmedCategory = form.category.trim()
        const priceValue = Number(form.price)

        if (!trimmedName || !trimmedCategory || Number.isNaN(priceValue) || priceValue <= 0 || !form.image) {
            setSubmitMessage('Please enter a name, category, valid price, and select an image.')
            return
        }

        try {
            setSubmitMessage('Uploading image...')
            const imageUrl = await uploadImage(form.image)

            setSubmitMessage('Saving garment...')
            await createGarment({
                name: trimmedName,
                category: trimmedCategory,
                description: form.description.trim() || 'Premium crafted garment',
                basePrice: priceValue,
                isActive: form.isActive,
                iconUrl: imageUrl,
                requiredMeasurementsJson: '[]',
            }).unwrap()

            setForm(initialForm)
            setImagePreview('')
            setSubmitMessage('Garment created successfully.')
        } catch (error) {
            setSubmitMessage(error?.data?.message || error?.message || 'Unable to create garment.')
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f1ec] text-stone-900">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 shrink-0 border-r border-stone-200 bg-[#1a1a1a] p-6 text-white lg:block">
                    <div className="mb-10 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold tracking-[0.2em] text-stone-100">
                            AR
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.35em] text-stone-300">Admin</p>
                            <p className="text-lg font-semibold">Atelier Rouge</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {['Overview', 'Products', 'Fabrics', 'Orders', 'Customers'].map((item, index) => (
                            <button
                                key={item}
                                type="button"
                                className={[
                                    'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition',
                                    index === 0 ? 'bg-white text-stone-900' : 'text-stone-200 hover:bg-white/5',
                                ].join(' ')}
                            >
                                <span>{item}</span>
                                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-300">
                                    {index + 1}
                                </span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-10 rounded-3xl bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-stone-400">Signed in</p>
                        <p className="mt-2 text-lg font-semibold">{user?.name || 'Admin user'}</p>
                        <p className="mt-1 text-sm text-stone-300">{user?.email || 'admin@atelier.com'}</p>
                    </div>
                </aside>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-xl shadow-stone-200/50 sm:p-6">
                        <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.35em] text-stone-500">Operations overview</p>
                                <h1 className="mt-3 text-3xl font-semibold">Admin Dashboard</h1>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/garments')}
                                    className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-900 hover:text-stone-900"
                                >
                                    New garment
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {stats.map((stat) => (
                                <div key={stat.label} className="rounded-3xl bg-stone-50 p-5">
                                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{stat.label}</p>
                                    <p className="mt-3 text-3xl font-semibold text-stone-900">{stat.value}</p>
                                    <p className="mt-2 text-sm text-stone-500">{stat.detail}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button type="button" onClick={() => navigate('/admin/garments')} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white">New garment</button>
                            <button type="button" onClick={() => navigate('/admin/designs')} className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700">New design</button>
                            <button type="button" onClick={() => navigate('/admin/fabrics')} className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700">New fabric</button>
                            <button type="button" onClick={() => navigate('/admin/orders')} className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700">View orders</button>
                        </div>

                        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                            <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Products</h2>
                                    <button type="button" className="text-sm font-medium text-stone-700 underline underline-offset-4">
                                        Refresh list
                                    </button>
                                </div>

                                {isLoadingGarments ? (
                                    <p className="text-sm text-stone-500">Loading products...</p>
                                ) : (
                                    <div className="space-y-3">
                                        {garments.length === 0 ? (
                                            <p className="rounded-2xl bg-white p-4 text-sm text-stone-500">No garments available yet.</p>
                                        ) : (
                                            garments.slice(0, 4).map((product) => (
                                                <div key={product.id || product._id || product.name} className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        {product.iconUrl || product.image || product.imageUrl || product.image_url ? (
                                                            <img
                                                                src={product.iconUrl || product.image || product.imageUrl || product.image_url}
                                                                alt={product.name}
                                                                className="h-14 w-14 rounded-xl object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-stone-200 text-center text-[10px] uppercase tracking-[0.1em] text-stone-500">
                                                                No image
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-stone-900">{product.name}</p>
                                                            <p className="text-sm text-stone-500">{product.category || 'Tailoring'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-stone-900">{product.basePrice != null ? `$${product.basePrice}` : 'Custom'}</p>
                                                        <p className="text-sm text-stone-500">{product.isActive === false ? 'Inactive' : 'Active'}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                                <h2 className="text-xl font-semibold">Add garment</h2>

                                <form className="mt-4 space-y-4" onSubmit={handleCreateGarment}>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-stone-700">Garment name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                                            placeholder="Signature suit"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-stone-700">Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                                            placeholder="Luxury, bridal, formal"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-stone-700">Description</label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                                            placeholder="Describe the garment"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-stone-700">Price</label>
                                        <input
                                            type="number"
                                            name="price"
                                            min="0"
                                            step="0.01"
                                            value={form.price}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                                            placeholder="320"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-stone-700">Garment image</label>
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
                                        />
                                        {imagePreview ? (
                                            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-3">
                                                <img src={imagePreview} alt="Garment preview" className="h-20 w-20 rounded-xl object-cover" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-stone-700">Image preview</p>
                                                    <p className="truncate text-xs text-stone-500">{form.image?.name || 'Selected image'}</p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    <label className="flex items-center gap-3 text-sm text-stone-700">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={form.isActive}
                                            onChange={handleChange}
                                            className="h-4 w-4 rounded border-stone-300"
                                        />
                                        Active item
                                    </label>

                                    {submitMessage ? (
                                        <div className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700">
                                            {submitMessage}
                                        </div>
                                    ) : null}

                                    <button
                                        type="submit"
                                        disabled={isCreatingGarment}
                                        className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isCreatingGarment ? 'Saving...' : 'Save garment'}
                                    </button>
                                </form>
                            </section>
                        </div>

                        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                            <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Fabrics</h2>
                                    <button type="button" className="text-sm font-medium text-stone-700 underline underline-offset-4">
                                        Add fabric
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {fabricRows.map((fabric) => (
                                        <div key={fabric.name} className="rounded-2xl bg-white p-3 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-stone-900">{fabric.name}</p>
                                                <span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-600">
                                                    {fabric.color}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-stone-500">{fabric.stock} {fabric.unit} available</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <section className="mt-8 rounded-3xl border border-stone-200 bg-stone-50 p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Latest orders</h2>
                                <button type="button" className="text-sm font-medium text-stone-700 underline underline-offset-4">
                                    View all
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                                {orders.length === 0 ? (
                                    <p className="p-5 text-sm text-stone-500">No orders available yet.</p>
                                ) : <table className="min-w-full text-left text-sm">
                                    <thead className="bg-stone-100 text-stone-600">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Order</th>
                                            <th className="px-4 py-3 font-medium">Customer</th>
                                            <th className="px-4 py-3 font-medium">Total</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.slice(0, 5).map((order) => (
                                            <tr key={order.id || order.orderId} className="border-t border-stone-200">
                                                <td className="px-4 py-3 font-medium text-stone-900">#{order.orderNumber || order.id || order.orderId}</td>
                                                <td className="px-4 py-3 text-stone-600">{order.customer?.name || order.customerName || order.user?.name || 'Customer'}</td>
                                                <td className="px-4 py-3 text-stone-900">${Number(order.totalAmount ?? order.total ?? order.amount ?? 0).toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                        {order.status || 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminPage

import { useMemo, useState } from 'react'
import AdminShell from '../../components/admin/AdminShell'
import { useGetAdminOrdersQuery, useUpdateOrderStatusMutation } from '../../features/orders/orderApi'

const getErrorMessage = (error) => error?.data?.message || error?.error || error?.message || 'Something went wrong.'
const read = (value, ...keys) => keys.reduce((result, key) => result ?? value?.[key], undefined)
const orderId = (order) => read(order, 'id', 'orderId', 'number', 'orderNumber')
const customer = (order) => read(order, 'customer', 'user', 'customerDetails') || {}
const garment = (order) => read(order, 'garment', 'garmentName')
const design = (order) => read(order, 'design', 'designName')
const fabric = (order) => read(order, 'fabric', 'fabricName')
const orderStatus = (order) => read(order, 'status', 'orderStatus') || 'Pending'
const paymentStatus = (order) => read(order, 'paymentStatus', 'payment?.status') || 'Pending'
const total = (order) => read(order, 'totalAmount', 'total', 'amount') ?? 0
const dateValue = (order) => read(order, 'createdAt', 'orderDate', 'date')

const statusOptions = ['Pending', 'Confirmed', 'InProduction', 'Shipped', 'Completed', 'Cancelled']
const paymentOptions = ['Pending', 'Paid', 'Failed', 'Refunded']

export default function OrdersPage() {
    const { data: response = [], isLoading, isError, error } = useGetAdminOrdersQuery()
    const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation()
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [paymentFilter, setPaymentFilter] = useState('all')
    const [dateFilter, setDateFilter] = useState('')
    const [sort, setSort] = useState('newest')
    const [message, setMessage] = useState('')

    const filteredOrders = useMemo(() => {
        const orders = Array.isArray(response) ? response : response.items || response.orders || []
        const query = search.toLowerCase().trim()
        return [...orders]
            .filter((order) => {
                const person = customer(order)
                const searchable = [orderId(order), person.name, person.email, garment(order)?.name || garment(order), design(order)?.name || design(order), fabric(order)?.name || fabric(order)].filter(Boolean).join(' ').toLowerCase()
                const matchesSearch = !query || searchable.includes(query)
                const matchesStatus = statusFilter === 'all' || orderStatus(order).toLowerCase() === statusFilter.toLowerCase()
                const matchesPayment = paymentFilter === 'all' || paymentStatus(order).toLowerCase() === paymentFilter.toLowerCase()
                const matchesDate = !dateFilter || String(dateValue(order) || '').startsWith(dateFilter)
                return matchesSearch && matchesStatus && matchesPayment && matchesDate
            })
            .sort((left, right) => {
                if (sort === 'amount') return Number(total(right)) - Number(total(left))
                const leftDate = new Date(dateValue(left) || 0).getTime()
                const rightDate = new Date(dateValue(right) || 0).getTime()
                return sort === 'oldest' ? leftDate - rightDate : rightDate - leftDate
            })
    }, [dateFilter, paymentFilter, response, search, sort, statusFilter])

    const updateSelectedStatus = async (status) => {
        try {
            await updateStatus({ id: orderId(selectedOrder), status }).unwrap()
            setSelectedOrder((current) => ({ ...current, status }))
            setMessage('Order status updated.')
        } catch (updateError) {
            setMessage(getErrorMessage(updateError))
        }
    }

    return (
        <AdminShell title="Order management" eyebrow="Operations">
            <section className="rounded-3xl border border-stone-200 bg-white p-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, garment, design, fabric" className="admin-input xl:col-span-2" />
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="admin-input"><option value="all">All order statuses</option>{statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select>
                    <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="admin-input"><option value="all">All payment statuses</option>{paymentOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select>
                    <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="admin-input" />
                </div>
                <div className="mt-3 flex justify-end"><select value={sort} onChange={(event) => setSort(event.target.value)} className="admin-input max-w-52"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="amount">Highest amount</option></select></div>
            </section>

            <section className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white">
                {isLoading ? <p className="p-5 text-sm text-stone-500">Loading orders...</p> : isError ? <p className="p-5 text-sm text-red-700">{getErrorMessage(error)}</p> : <div className="overflow-x-auto"><table className="min-w-[1050px] w-full text-left text-sm"><thead className="bg-stone-50 text-stone-500"><tr><th className="px-5 py-3 font-medium">Order number</th><th className="px-5 py-3 font-medium">Customer</th><th className="px-5 py-3 font-medium">Garment</th><th className="px-5 py-3 font-medium">Design</th><th className="px-5 py-3 font-medium">Fabric</th><th className="px-5 py-3 font-medium">Total</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Payment</th><th className="px-5 py-3 font-medium">Details</th></tr></thead><tbody>{filteredOrders.map((order) => { const person = customer(order); return <tr key={orderId(order)} className="border-t border-stone-100"><td className="px-5 py-4 font-medium">#{orderId(order)}</td><td className="px-5 py-4"><p>{person.name || 'Customer'}</p><p className="text-xs text-stone-500">{person.email || '-'}</p></td><td className="px-5 py-4">{garment(order)?.name || garment(order) || '-'}</td><td className="px-5 py-4">{design(order)?.name || design(order) || '-'}</td><td className="px-5 py-4">{fabric(order)?.name || fabric(order) || '-'}</td><td className="px-5 py-4">${Number(total(order)).toFixed(2)}</td><td className="px-5 py-4">{orderStatus(order)}</td><td className="px-5 py-4">{paymentStatus(order)}</td><td className="px-5 py-4"><button type="button" onClick={() => { setSelectedOrder(order); setMessage('') }} className="font-medium underline underline-offset-4">View</button></td></tr> })}</tbody></table>{filteredOrders.length === 0 && <p className="p-8 text-center text-sm text-stone-500">No orders match these filters.</p>}</div>}
            </section>

            {selectedOrder && <div className="fixed inset-0 z-20 flex justify-end bg-stone-900/30" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedOrder(null) }}><aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl"><div className="flex items-start justify-between border-b border-stone-200 pb-5"><div><p className="text-xs uppercase tracking-[0.25em] text-stone-500">Order detail</p><h2 className="mt-2 text-2xl font-semibold">#{orderId(selectedOrder)}</h2></div><button type="button" onClick={() => setSelectedOrder(null)} className="text-sm underline underline-offset-4">Close</button></div><div className="mt-6 space-y-5 text-sm"><Detail title="Customer" value={`${customer(selectedOrder).name || 'Customer'} · ${customer(selectedOrder).email || 'No email'}`} /><Detail title="Selection" value={`${garment(selectedOrder)?.name || garment(selectedOrder) || '-'} / ${design(selectedOrder)?.name || design(selectedOrder) || '-'} / ${fabric(selectedOrder)?.name || fabric(selectedOrder) || '-'}`} /><Detail title="Measurements" value={JSON.stringify(selectedOrder.measurementSnapshot || selectedOrder.measurements || 'Not provided')} /><Detail title="Customization" value={selectedOrder.customizationDetails || selectedOrder.customization || 'Not provided'} /><Detail title="Shipping address" value={selectedOrder.shippingAddress || selectedOrder.address || 'Not provided'} /><Detail title="Pricing" value={`Total: $${Number(total(selectedOrder)).toFixed(2)} · Payment: ${paymentStatus(selectedOrder)}`} /><div><p className="font-medium">Update status</p><select value={orderStatus(selectedOrder)} disabled={updating} onChange={(event) => updateSelectedStatus(event.target.value)} className="admin-input mt-2">{statusOptions.map((option) => <option key={option}>{option}</option>)}</select></div><button type="button" onClick={() => setMessage(`Payment status: ${paymentStatus(selectedOrder)}`)} className="rounded-full border border-stone-200 px-4 py-2 font-medium">View payment details</button>{message && <p className="rounded-2xl bg-stone-50 p-3 text-stone-700">{message}</p>}</div></aside></div>}
        </AdminShell>
    )
}

function Detail({ title, value }) {
    return <div><p className="font-medium text-stone-900">{title}</p><p className="mt-1 break-words text-stone-600">{value}</p></div>
}

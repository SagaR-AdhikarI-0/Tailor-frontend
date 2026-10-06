import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import BottomNavbar from '../../components/layout/BottomNavbar'
import { useGetMyOrdersQuery } from '../features/orders/orderApi'

const getErrorMessage = (error) => error?.data?.message || error?.error || error?.message || 'Unable to load your orders.'
const getOrderId = (order) => order?.id ?? order?.orderId
const getOrderNumber = (order) => order?.orderNumber || order?.number || `#${getOrderId(order)}`
const getPaymentStatus = (order) => order?.paymentStatus || order?.payment?.status || 'Pending'
const getOrderStatus = (order) => order?.status || order?.orderStatus || 'Pending'
const getAmount = (order) => Number(order?.totalAmount ?? order?.total ?? order?.amount ?? order?.payment?.amount ?? 0)
const getImageUrl = (item) => item?.imageUrl || item?.iconUrl || item?.image || item?.image_url || item?.thumbnailUrl || item?.thumbnail || item?.url
const getOrderImage = (order) => order?.garmentImageUrl || getImageUrl(order?.garment) || getImageUrl(order?.product) || getImageUrl(order)
const getOrderItemName = (order) => order?.garment?.name || order?.product?.name || order?.garmentName || 'Tailoring garment'

function MyOrdersPage() {
    const { data: response, error, isLoading } = useGetMyOrdersQuery()
    const orders = Array.isArray(response) ? response : response?.orders || response?.items || []

    return <div className="min-h-screen bg-stone-100 text-stone-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">Your account</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div><h1 className="text-4xl font-semibold">My orders</h1><p className="mt-3 text-stone-600">Track your Atelier Rouge orders and payment status.</p></div>
                <Link to="/products" className="text-sm font-medium underline underline-offset-4">Continue shopping</Link>
            </div>
            {isLoading ? <OrdersSkeleton /> : error ? <div className="mt-8 rounded-2xl border border-red-200 bg-white p-8 text-red-700">{getErrorMessage(error)}</div> : orders.length === 0 ? <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center"><p className="text-stone-600">You have not placed any orders yet.</p><Link to="/products" className="mt-5 inline-block rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Browse products</Link></div> : <div className="mt-8 space-y-4">{orders.map((order) => { const imageUrl = getOrderImage(order); return <article key={getOrderId(order)} className="rounded-2xl border border-stone-200 bg-white p-5"><div className="flex flex-col gap-5 sm:flex-row"><div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:w-40">{imageUrl ? <img src={imageUrl} alt={getOrderItemName(order)} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.12em] text-stone-400">No image</div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Order</p><h2 className="mt-1 text-xl font-semibold">{getOrderNumber(order)}</h2><p className="mt-2 text-sm text-stone-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date unavailable'}</p></div><Link to={`/orders/${getOrderId(order)}`} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium hover:border-stone-900">View details</Link></div><div className="mt-5 grid gap-3 border-t border-stone-100 pt-4 text-sm sm:grid-cols-3"><p><span className="text-stone-500">Amount:</span> Rs {getAmount(order).toFixed(2)}</p><p><span className="text-stone-500">Payment:</span> {getPaymentStatus(order)}</p><p><span className="text-stone-500">Order status:</span> {getOrderStatus(order)}</p></div></div></div></article> })}</div>}
        </main>
        <BottomNavbar />
    </div>
}

function OrdersSkeleton() {
    return <div className="mt-8 animate-pulse space-y-4" aria-label="Loading orders">{Array.from({ length: 3 }, (_, index) => <div key={index} className="flex flex-col gap-5 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row"><div className="h-32 w-full shrink-0 rounded-xl bg-stone-200 sm:w-40" /><div className="flex-1"><div className="h-3 w-16 rounded bg-stone-200" /><div className="mt-3 h-6 w-56 rounded bg-stone-200" /><div className="mt-3 h-3 w-28 rounded bg-stone-200" /><div className="mt-6 grid gap-3 border-t border-stone-100 pt-4 sm:grid-cols-3"><div className="h-4 rounded bg-stone-200" /><div className="h-4 rounded bg-stone-200" /><div className="h-4 rounded bg-stone-200" /></div></div></div>)}</div>
}

export default MyOrdersPage

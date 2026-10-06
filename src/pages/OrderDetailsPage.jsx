import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import { useGetOrderQuery } from '../features/orders/orderApi'

const errorMessage = (error) => error?.data?.message || error?.error || error?.message || 'Unable to load this order.'
const display = (value, fallback = 'Not provided') => value === null || value === undefined || value === '' ? fallback : String(value)
const formatDate = (value) => value ? new Date(value).toLocaleString() : 'Not provided'
const normalizeImageUrl = (value) => {
    if (typeof value !== 'string') return ''
    const markdownMatch = value.match(/^\[.*\]\((https?:\/\/[^)]+)\)$/)
    return markdownMatch?.[1] || value
}
const getImageUrl = (item) => normalizeImageUrl(item?.garmentImageUrl || item?.imageUrl || item?.iconUrl || item?.image || item?.image_url || item?.thumbnailUrl || item?.thumbnail || item?.url)
const getNestedImageUrl = (...items) => items.reduce((image, item) => image || getImageUrl(item), '')
const parseJsonObject = (value) => {
    if (!value) return null
    if (typeof value === 'object') return value
    try {
        const parsed = JSON.parse(value)
        return parsed && typeof parsed === 'object' ? parsed : { value: parsed }
    } catch {
        return { value }
    }
}
const humanizeLabel = (value) => String(value).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase())
const formatDetailValue = (value) => {
    if (value === null || value === undefined || value === '') return 'Not provided'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return Object.entries(value).map(([key, nestedValue]) => `${humanizeLabel(key)}: ${formatDetailValue(nestedValue)}`).join(', ')
    return String(value)
}

function OrderDetailsPage() {
    const { orderId } = useParams()
    const { data: response, error, isLoading } = useGetOrderQuery(orderId)
    const order = response?.order || response?.data?.order || response?.data || response
    const total = Number(order?.totalAmount ?? order?.total ?? order?.amount ?? order?.payment?.amount ?? 0)
    const payment = order?.payment || {}
    const garment = order?.garment || {}
    const product = order?.product || {}
    const fabric = order?.fabric || {}
    const design = order?.design || {}
    const measurementDetails = order?.measurementDetails || order?.measurementProfile || {}
    const measurementFields = parseJsonObject(order?.measurementSnapshotJson || order?.measurementValuesJson || measurementDetails?.measurementValuesJson)
    const customizationFields = parseJsonObject(order?.customizationDetailsJson || order?.customizationDetails)

    const garmentImage = normalizeImageUrl(order?.garmentImageUrl) || getNestedImageUrl(garment, product, order?.garmentDetails, order)
    const designImage = normalizeImageUrl(order?.designImageUrl) || getNestedImageUrl(design, order?.designDetails)
    const fabricImage = normalizeImageUrl(order?.fabricImageUrl) || normalizeImageUrl(order?.cottonImageUrl) || normalizeImageUrl(order?.fabricIconUrl) || getNestedImageUrl(fabric, order?.cotton, order?.cottonFabric, order?.fabricDetails)
    const garmentName = order?.garmentName || garment.name || product.name
    const designName = order?.designName || design.name
    const fabricName = order?.fabricName || order?.cottonName || fabric.name

    useEffect(() => {
        if (!order) return
        console.log('[OrderDetails] backend order response:', order)
        console.log('[OrderDetails] image URLs:', {
            garmentImageUrl: order.garmentImageUrl,
            fabricImageUrl: order.fabricImageUrl,
            designImageUrl: order.designImageUrl,
            resolvedGarmentImage: garmentImage,
            resolvedFabricImage: fabricImage,
            resolvedDesignImage: designImage,
        })
    }, [designImage, fabricImage, garmentImage, order])

    return <div className="min-h-screen bg-stone-100 text-stone-900"><Navbar /><main className="mx-auto max-w-5xl px-4 py-12 sm:px-6"><Link to="/orders" className="text-sm underline underline-offset-4">Back to my orders</Link><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">Order details</p><h1 className="mt-3 text-4xl font-semibold">Your Atelier selection</h1><p className="mt-3 text-sm text-stone-500">Order {display(order?.orderNumber || order?.number, `#${order?.id || orderId}`)} · Placed {formatDate(order?.orderDate || order?.createdAt || order?.date)}</p></div>{order && <div className="flex gap-2 text-xs font-semibold uppercase tracking-[0.12em]"><span className="rounded-full bg-stone-900 px-3 py-2 text-white">{display(order.status || order.orderStatus, 'Pending')}</span><span className="rounded-full border border-stone-300 px-3 py-2">{display(order.paymentStatus || payment.status, 'Pending')}</span></div>}</div>{isLoading ? <OrderDetailsSkeleton /> : error ? <div className="mt-8 rounded-2xl border border-red-200 bg-white p-8 text-red-700">{errorMessage(error)}</div> : !order ? <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-stone-500">Order not found.</div> : <><section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6"><div className="grid gap-5 sm:grid-cols-3"><ImageTile label="Garment" name={garmentName} src={garmentImage} /><ImageTile label="Design" name={designName} src={designImage} /><ImageTile label="Cotton / fabric" name={fabricName} src={fabricImage} /></div></section><div className="mt-6 grid gap-6 lg:grid-cols-2"><DetailCard title="Order summary"><Detail label="Total amount" value={`Rs ${total.toFixed(2)}`} /><Detail label="Fit type" value={display(order.fitType)} /><Detail label="Fabric quantity" value={display(order.fabricQuantity)} /><Detail label="Shipping address" value={display(order.shippingAddress)} /><Detail label="Special instructions" value={display(order.specialInstructions)} /></DetailCard><DetailCard title="Payment"><Detail label="Payment status" value={display(order.paymentStatus || payment.status)} /><Detail label="Payment method" value={display(order.paymentMethod || payment.paymentMethod)} /><Detail label="Amount paid" value={`Rs ${Number(payment.amount ?? total).toFixed(2)}`} /><Detail label="Transaction reference" value={display(payment.transactionReference)} /><Detail label="Paid at" value={formatDate(payment.paidAt)} /><Detail label="Payment created" value={formatDate(payment.createdAt)} /></DetailCard><DetailCard title="Your selection"><Detail label="Garment price" value={order.tailoringPrice === undefined ? 'Not provided' : `Rs ${Number(order.tailoringPrice).toFixed(2)}`} /><Detail label="Fabric price" value={order.fabricPrice === undefined ? 'Not provided' : `Rs ${Number(order.fabricPrice).toFixed(2)}`} /><Detail label="Customization price" value={order.customizationPrice === undefined ? 'Not provided' : `Rs ${Number(order.customizationPrice).toFixed(2)}`} /><Detail label="Delivery fee" value={order.deliveryFee === undefined ? 'Not provided' : `Rs ${Number(order.deliveryFee).toFixed(2)}`} /></DetailCard><DetailCard title="Measurement details">{measurementDetails.name && <Detail label="Profile" value={measurementDetails.name} />}{measurementFields && <ReadableFields values={measurementFields} />}{!measurementFields && <p className="text-sm text-stone-500">No measurement details provided.</p>}</DetailCard>{customizationFields && <DetailCard title="Customization"><ReadableFields values={customizationFields} /></DetailCard>}</div></>}</main></div>
}

function OrderDetailsSkeleton() {
    return <div className="mt-8 animate-pulse" aria-label="Loading order details"><div className="rounded-3xl border border-stone-200 bg-white p-6"><div className="grid gap-5 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index}><div className="h-3 w-16 rounded bg-stone-200" /><div className="mt-2 aspect-[4/3] rounded-xl bg-stone-200" /><div className="mt-3 h-4 w-2/3 rounded bg-stone-200" /></div>)}</div></div><div className="mt-6 grid gap-6 lg:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-52 rounded-2xl border border-stone-200 bg-white p-6"><div className="h-5 w-32 rounded bg-stone-200" /><div className="mt-6 space-y-4"><div className="h-4 rounded bg-stone-200" /><div className="h-4 w-4/5 rounded bg-stone-200" /><div className="h-4 w-3/5 rounded bg-stone-200" /></div></div>)}</div></div>
}

function DetailCard({ title, children }) {
    return <section className="rounded-2xl border border-stone-200 bg-white p-6"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4 space-y-3">{children}</div></section>
}

function Detail({ label, value }) {
    return <div className="border-b border-stone-100 pb-3 last:border-0 last:pb-0"><p className="text-xs uppercase tracking-[0.14em] text-stone-500">{label}</p><p className="mt-1 break-words text-sm text-stone-800">{value}</p></div>
}

function ImageTile({ label, name, src }) {
    return <div><p className="mb-2 text-xs uppercase tracking-[0.14em] text-stone-500">{label}</p><div className="aspect-[4/3] overflow-hidden rounded-xl bg-stone-100">{src ? <img src={src} alt={name || label} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-3 text-center text-xs text-stone-400">No image provided</div>}</div><p className="mt-2 text-sm font-medium">{display(name)}</p></div>
}

function ReadableFields({ values }) {
    return <div className="grid gap-3 sm:grid-cols-2">{Object.entries(values).map(([key, value]) => <div key={key} className="rounded-xl bg-stone-50 p-3"><p className="text-xs uppercase tracking-[0.12em] text-stone-500">{humanizeLabel(key)}</p><p className="mt-1 break-words text-sm font-medium text-stone-800">{formatDetailValue(value)}</p></div>)}</div>
}

export default OrderDetailsPage

import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from '../../components/layout/Navbar'
import { selectUser } from '../features/auth/authSlice'
import { useGetMyCartQuery } from '../features/orders/orderApi'

const getItems = (response) => Array.isArray(response) ? response : response?.items || response?.cartItems || []
const getItemName = (item) => item.garment?.name || item.product?.name || item.garmentName || item.name || 'Tailoring garment'
const getItemPrice = (item) => Number(item.totalPrice ?? item.price ?? item.garment?.basePrice ?? item.product?.basePrice ?? 0)
const getItemImage = (item) => item.garment?.iconUrl || item.garment?.image || item.garment?.imageUrl || item.product?.imageUrl || item.imageUrl
const getRelatedName = (item, type) => item[type]?.name || item[`${type}Name`] || null

function CartPage() {
    const navigate = useNavigate()
    const user = useSelector(selectUser)
    const { data, isLoading, isError } = useGetMyCartQuery()
    const items = getItems(data)
    const total = items.reduce((sum, item) => sum + getItemPrice(item) * Number(item.quantity || 1), 0)

    return <div className="min-h-screen bg-stone-100 text-stone-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">Your selection</p>
            <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="mt-3 text-4xl font-semibold">Shopping cart</h1><p className="mt-3 text-stone-600">Review your tailored selections before entering delivery details.</p></div><Link to="/products" className="text-sm font-medium underline underline-offset-4">Continue shopping</Link></div>
            {isLoading && <p className="mt-8 text-stone-500">Loading your cart...</p>}
            {isError && <p className="mt-8 text-red-700">Your cart could not be loaded.</p>}
            {!isLoading && !isError && (items.length === 0 ? <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center"><p className="text-stone-600">Your cart is empty.</p><Link to="/products" className="mt-5 inline-block rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Browse products</Link></div> : <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">{items.map((item, index) => { const imageUrl = getItemImage(item); return <article key={item.id || item._id || index} className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="flex flex-col gap-5 p-5 sm:flex-row"><div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:w-32">{imageUrl ? <img src={imageUrl} alt={getItemName(item)} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.15em] text-stone-400">Made to order</div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Garment</p><h2 className="mt-1 text-lg font-semibold">{getItemName(item)}</h2></div><p className="font-semibold">${(getItemPrice(item) * Number(item.quantity || 1)).toFixed(2)}</p></div><p className="mt-2 text-sm text-stone-500">Quantity: {item.quantity || 1}</p><div className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><p><span className="text-stone-500">Design:</span> {getRelatedName(item, 'design') || 'Standard selection'}</p><p><span className="text-stone-500">Fabric:</span> {getRelatedName(item, 'fabric') || 'To be confirmed'}</p></div></div></div>{(item.measurementSnapshot || item.measurements || item.customizationDetails || item.customization) && <div className="border-t border-stone-100 bg-stone-50 px-5 py-4 text-sm"><p className="font-medium">Order details</p>{(item.measurementSnapshot || item.measurements) && <p className="mt-2 break-words text-stone-600"><span className="text-stone-500">Measurements:</span> {item.measurementSnapshot || item.measurements}</p>}{(item.customizationDetails || item.customization) && <p className="mt-1 break-words text-stone-600"><span className="text-stone-500">Customization:</span> {item.customizationDetails || item.customization}</p>}</div>}</article> })}</div>
                <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6 lg:sticky lg:top-6"><p className="text-sm text-stone-500">Order summary</p><div className="mt-4 flex justify-between text-sm"><span>Items</span><span>{items.length}</span></div><div className="mt-3 flex justify-between border-t border-stone-200 pt-3"><span className="font-semibold">Estimated total</span><span className="text-xl font-semibold">${total.toFixed(2)}</span></div><p className="mt-4 text-xs leading-5 text-stone-500">Signed in as {user?.email || user?.name || 'customer'}</p><button type="button" onClick={() => navigate('/checkout')} className="mt-6 w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-700">Checkout with details</button></aside>
            </div>)}
        </main>
    </div>
}

export default CartPage
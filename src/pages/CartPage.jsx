import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Navbar from '../../components/layout/Navbar'
import BottomNavbar from '../../components/layout/BottomNavbar'
import { selectUser } from '../features/auth/authSlice'
import { getLocalCart, removeLocalCartItem } from '../utils/localCart'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'

const getItemName = (item) => item.garment?.name || item.product?.name || item.garmentName || item.name || 'Tailoring garment'
const getItemPrice = (item) => Number(item.totalPrice ?? item.price ?? item.garment?.basePrice ?? item.product?.basePrice ?? 0)
const getItemImage = (item) => item.garment?.iconUrl || item.garment?.image || item.garment?.imageUrl || item.product?.imageUrl || item.imageUrl
const getRelatedName = (item, type) => item[type]?.name || item[`${type}Name`] || null

function CartPage() {
    const navigate = useNavigate()
    const user = useSelector(selectUser)
    const [items, setItems] = useState(() => getLocalCart(user))
    const [isCartLoading, setIsCartLoading] = useState(true)
    useEffect(() => {
        const refreshCart = () => {
            setItems(getLocalCart(user))
            setIsCartLoading(false)
        }
        refreshCart()
        window.addEventListener('tailor-cart-updated', refreshCart)
        return () => window.removeEventListener('tailor-cart-updated', refreshCart)
    }, [user])
    const total = items.reduce((sum, item) => sum + getItemPrice(item) * Number(item.quantity || 1), 0)

    return <div className="min-h-screen bg-stone-100 text-stone-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">Your selection</p>
            <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="mt-3 text-4xl font-semibold">Shopping cart</h1><p className="mt-3 text-stone-600">Review your tailored selections before entering delivery details.</p></div><Link to="/products" className="text-sm font-medium underline underline-offset-4">Continue shopping</Link></div>
            {isCartLoading ? <CartSkeleton /> : items.length === 0 ? <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center"><p className="text-stone-600">Your cart is empty.</p><Link to="/products" className="mt-5 inline-block rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Browse products</Link></div> : <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">{items.map((item, index) => { const imageUrl = getItemImage(item); return <article key={item.itemKey || item.id || item._id || index} className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="flex flex-col gap-5 p-5 sm:flex-row"><div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:w-32">{imageUrl ? <img src={imageUrl} alt={getItemName(item)} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.15em] text-stone-400">Made to order</div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Garment</p><h2 className="mt-1 text-lg font-semibold">{getItemName(item)}</h2></div><div className="flex items-center gap-3"><p className="font-semibold">Rs {(getItemPrice(item) * Number(item.quantity || 1)).toFixed(2)}</p><button type="button" onClick={() => removeLocalCartItem(user, item.itemKey)} aria-label={`Delete ${getItemName(item)}`} title="Delete item" className="flex h-10 w-10 items-center justify-center rounded-full text-red-700 transition hover:bg-red-50 hover:text-red-900"><DeleteOutlineIcon fontSize="medium" /></button></div></div><p className="mt-2 text-sm text-stone-500">Quantity: {item.quantity || 1}</p><div className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><p><span className="text-stone-500">Design:</span> {getRelatedName(item, 'design') || 'Standard selection'}</p><p><span className="text-stone-500">Fabric:</span> {getRelatedName(item, 'fabric') || 'To be confirmed'}</p></div></div></div>{(item.measurementSnapshot || item.measurements || item.customizationDetails || item.customization) && <div className="border-t border-stone-100 bg-stone-50 px-5 py-4 text-sm"><p className="font-medium">Order details</p>{(item.measurementSnapshot || item.measurements) && <p className="mt-2 break-words text-stone-600"><span className="text-stone-500">Measurements:</span> {item.measurementSnapshot || item.measurements}</p>}{(item.customizationDetails || item.customization) && <p className="mt-1 break-words text-stone-600"><span className="text-stone-500">Customization:</span> {item.customizationDetails || item.customization}</p>}</div>}</article> })}</div>
                <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6 lg:sticky lg:top-6">
                    <p className="text-sm text-stone-500">Order summary</p>
                    <div className="mt-4 flex justify-between text-sm"><span>Items</span><span>{items.length}</span></div>
                    <div className="mt-3 flex justify-between border-t border-stone-200 pt-3"><span className="font-semibold">Estimated total</span><span className="text-xl font-semibold">Rs {total.toFixed(2)}</span></div>
                    <p className="mt-4 text-xs leading-5 text-stone-500">{user ? `Signed in as ${user.email || user.name || 'customer'}` : 'Sign in required to checkout and place order'}</p>
                    <button type="button" onClick={() => user ? navigate('/checkout') : navigate('/login', { state: { from: '/checkout' } })} className="mt-6 w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-700">{user ? 'Checkout with details' : 'Sign in to place order'}</button>
                </aside>
            </div>}
        </main>
        <BottomNavbar />
    </div>
}

function CartSkeleton() {
    return <div className="mt-8 grid animate-pulse gap-6 lg:grid-cols-[1fr_320px]" aria-label="Loading cart">
        <div className="space-y-4">
            {Array.from({ length: 2 }, (_, index) => <div key={index} className="flex gap-5 rounded-2xl border border-stone-200 bg-white p-5"><div className="h-32 w-32 shrink-0 rounded-xl bg-stone-200" /><div className="flex-1"><div className="h-3 w-20 rounded bg-stone-200" /><div className="mt-3 h-5 w-2/3 rounded bg-stone-200" /><div className="mt-5 h-3 w-1/2 rounded bg-stone-200" /><div className="mt-4 h-3 w-3/4 rounded bg-stone-200" /></div></div>)}
        </div>
        <aside className="h-48 rounded-2xl border border-stone-200 bg-white p-6"><div className="h-3 w-24 rounded bg-stone-200" /><div className="mt-6 h-4 w-full rounded bg-stone-200" /><div className="mt-4 h-8 w-2/3 rounded bg-stone-200" /><div className="mt-6 h-11 rounded-full bg-stone-200" /></aside>
    </div>
}

export default CartPage
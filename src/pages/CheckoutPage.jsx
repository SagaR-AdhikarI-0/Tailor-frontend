import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from '../../components/layout/Navbar'
import { selectUser } from '../features/auth/authSlice'
import { useGetMyCartQuery, usePlaceOrderMutation } from '../features/orders/orderApi'

const getItems = (response) => Array.isArray(response) ? response : response?.items || response?.cartItems || []
const getPrice = (item) => Number(item.totalPrice ?? item.price ?? item.garment?.basePrice ?? item.product?.basePrice ?? 0)
const getErrorMessage = (error) => error?.data?.message || error?.error || 'Unable to place your order.'

function CheckoutPage() {
    const navigate = useNavigate()
    const user = useSelector(selectUser)
    const { data, isLoading } = useGetMyCartQuery()
    const [placeOrder, { isLoading: placingOrder }] = usePlaceOrderMutation()
    const [fullName, setFullName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [phone, setPhone] = useState('')
    const [shippingAddress, setShippingAddress] = useState('')
    const [orderNotes, setOrderNotes] = useState('')
    const [message, setMessage] = useState('')
    const items = getItems(data)
    const total = items.reduce((sum, item) => sum + getPrice(item) * Number(item.quantity || 1), 0)

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!items.length || !fullName.trim() || !email.trim() || !phone.trim() || !shippingAddress.trim()) {
            setMessage('Complete your name, email, phone number, and shipping address.')
            return
        }
        try {
            const orderDetails = [
                `Name: ${fullName.trim()}`,
                `Email: ${email.trim()}`,
                `Phone: ${phone.trim()}`,
                `Address: ${shippingAddress.trim()}`,
                orderNotes.trim() ? `Order notes: ${orderNotes.trim()}` : '',
            ].filter(Boolean).join('\n')
            await placeOrder({ shippingAddress: orderDetails }).unwrap()
            navigate('/')
        } catch (error) {
            setMessage(getErrorMessage(error))
        }
    }

    return <div className="min-h-screen bg-stone-100 text-stone-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">Final details</p>
            <h1 className="mt-3 text-4xl font-semibold">Checkout</h1>
            {isLoading ? <p className="mt-8 text-stone-500">Loading your order...</p> : !items.length ? <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8"><p>Your cart is empty.</p><Link to="/products" className="mt-5 inline-block rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Browse products</Link></div> : <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                <section className="rounded-2xl border border-stone-200 bg-white p-6"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Your details</h2><p className="mt-1 text-sm text-stone-500">We will use these details to coordinate your fitting and delivery.</p></div><Link to="/cart" className="text-sm font-medium underline underline-offset-4">Back to cart</Link></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} className="admin-input mt-2" placeholder="Your full name" /></label><label className="text-sm font-medium">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="admin-input mt-2" placeholder="you@example.com" /></label><label className="text-sm font-medium sm:col-span-2">Phone number<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="admin-input mt-2" placeholder="Your phone number" /></label><label className="text-sm font-medium sm:col-span-2">Shipping address<textarea value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} rows="4" className="admin-input mt-2" placeholder="Street, city, postal code" /></label><label className="text-sm font-medium sm:col-span-2">Order notes <span className="font-normal text-stone-500">(optional)</span><textarea value={orderNotes} onChange={(event) => setOrderNotes(event.target.value)} rows="3" className="admin-input mt-2" placeholder="Fitting preferences or anything else we should know" /></label></div>{message && <p className="mt-5 rounded-xl bg-stone-100 p-3 text-sm text-stone-700">{message}</p>}</section>
                <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6 lg:sticky lg:top-6"><p className="text-sm text-stone-500">Order summary</p><div className="mt-4 space-y-3">{items.map((item, index) => <div key={item.id || item._id || index} className="flex justify-between gap-4 text-sm"><span className="truncate">{item.garment?.name || item.product?.name || item.garmentName || item.name || 'Tailoring garment'} × {item.quantity || 1}</span><span>${(getPrice(item) * Number(item.quantity || 1)).toFixed(2)}</span></div>)}</div><div className="mt-5 flex justify-between border-t border-stone-200 pt-4"><span className="font-semibold">Total</span><span className="text-xl font-semibold">${total.toFixed(2)}</span></div><p className="mt-4 text-xs leading-5 text-stone-500">Payment details will be confirmed by the atelier after your order is reviewed.</p><button type="submit" disabled={placingOrder} className="mt-6 w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{placingOrder ? 'Placing order...' : 'Place order'}</button></aside>
            </form>}
        </main>
    </div>
}

export default CheckoutPage
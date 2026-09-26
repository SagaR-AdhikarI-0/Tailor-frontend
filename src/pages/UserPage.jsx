import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectUser } from '../features/auth/authSlice'
import { useNavigate } from 'react-router-dom'
import { useGetProductsQuery } from '../features/products/productApi'
import { useAddToCartMutation, useGetMyCartQuery, useGetMyOrdersQuery, usePlaceOrderMutation } from '../features/orders/orderApi'

const getErrorMessage = (error) => error?.data?.message || error?.error || error?.message || 'Unable to complete this request.'

function UserPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector(selectUser)
    const { data: products = [], isLoading: productsLoading } = useGetProductsQuery({ page: 1, limit: 20 })
    const { data: cartResponse = [], isLoading: cartLoading } = useGetMyCartQuery()
    const { data: orders = [], isLoading: ordersLoading } = useGetMyOrdersQuery()
    const [addToCart, { isLoading: addingToCart }] = useAddToCartMutation()
    const [placeOrder, { isLoading: placingOrder }] = usePlaceOrderMutation()
    const [shippingAddress, setShippingAddress] = useState('')
    const [orderMessage, setOrderMessage] = useState('')
    const [selectedProduct, setSelectedProduct] = useState(null)
    const cart = Array.isArray(cartResponse) ? cartResponse : cartResponse.items || cartResponse.cartItems || []

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    const handleAddToCart = async (garment) => {
        setOrderMessage('')
        try {
            await addToCart({ garmentId: garment.id, quantity: 1 }).unwrap()
            setOrderMessage(`${garment.name} was added to your cart.`)
        } catch (error) {
            setOrderMessage(getErrorMessage(error))
        }
    }

    const handlePlaceOrder = async (event) => {
        event.preventDefault()
        if (!cart.length || !shippingAddress.trim()) {
            setOrderMessage('Add a garment to your cart and enter a shipping address.')
            return
        }

        try {
            await placeOrder({ shippingAddress: shippingAddress.trim() }).unwrap()
            setShippingAddress('')
            setOrderMessage('Order placed successfully.')
        } catch (error) {
            setOrderMessage(getErrorMessage(error))
        }
    }

    return (
        <div className="min-h-screen bg-stone-100 p-6 text-stone-900">
            <div className="mx-auto max-w-5xl rounded-[30px] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-200/60">
                <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.35em] text-stone-500">User dashboard</p>
                        <h1 className="mt-3 text-3xl font-semibold">Hello, {user?.name || 'Tailor user'}</h1>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-900 hover:text-stone-900"
                    >
                        Logout
                    </button>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-3">
                    <div className="rounded-2xl bg-stone-100 p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Role</p>
                        <p className="mt-3 text-xl font-semibold capitalize">{user?.role}</p>
                    </div>

                    <div className="rounded-2xl bg-stone-100 p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Cart items</p>
                        <p className="mt-3 text-xl font-semibold">{cartLoading ? 'Loading...' : cart.length}</p>
                    </div>

                    <div className="rounded-2xl bg-stone-100 p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Orders</p>
                        <p className="mt-3 text-xl font-semibold">{ordersLoading ? 'Loading...' : orders.length}</p>
                    </div>
                </div>

                <section className="mt-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">My orders</h2>
                        <span className="text-xs uppercase tracking-[0.2em] text-stone-500">History</span>
                    </div>
                    {ordersLoading ? (
                        <p className="mt-4 text-sm text-stone-500">Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <p className="mt-4 rounded-2xl bg-stone-100 p-4 text-sm text-stone-500">You have no orders yet.</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {orders.map((order) => (
                                <div key={order.id || order.orderId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 p-4">
                                    <div>
                                        <p className="font-medium">Order #{order.orderNumber || order.id || order.orderId}</p>
                                        <p className="mt-1 text-sm text-stone-500">{order.garment?.name || order.garmentName || 'Tailoring order'}</p>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p className="font-medium">${Number(order.totalAmount ?? order.total ?? order.amount ?? 0).toFixed(2)}</p>
                                        <p className="mt-1 text-stone-500">{order.status || 'Pending'} · {order.paymentStatus || 'Payment pending'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="mt-8 border-t border-stone-200 pt-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-semibold">Browse garments</h2>
                            <p className="mt-1 text-sm text-stone-500">Choose a garment and add it to your order.</p>
                        </div>
                        <p className="text-sm text-stone-500">Cart: {cartLoading ? '...' : cart.length} item{cart.length === 1 ? '' : 's'}</p>
                    </div>

                    {productsLoading ? (
                        <p className="mt-4 text-sm text-stone-500">Loading garments...</p>
                    ) : (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {products.map((garment) => {
                                const imageUrl = garment.iconUrl || garment.image || garment.imageUrl
                                return (
                                    <article
                                        key={garment.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setSelectedProduct(garment)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') setSelectedProduct(garment)
                                        }}
                                        className="cursor-pointer overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        {imageUrl ? <img src={imageUrl} alt={garment.name} className="h-40 w-full object-cover" /> : <div className="h-40 bg-stone-100" />}
                                        <div className="p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{garment.category || 'Tailoring'}</p>
                                            <h3 className="mt-2 font-semibold">{garment.name}</h3>
                                            <p className="mt-1 text-sm text-stone-600">{garment.basePrice != null ? `$${garment.basePrice}` : 'Custom pricing'}</p>
                                            <button type="button" onClick={(event) => { event.stopPropagation(); handleAddToCart(garment) }} disabled={addingToCart} className="mt-4 w-full rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                                                {addingToCart ? 'Adding...' : 'Add to cart'}
                                            </button>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    )}

                    <form onSubmit={handlePlaceOrder} className="mt-6 rounded-2xl bg-stone-100 p-5">
                        <h3 className="font-semibold">Checkout</h3>
                        <p className="mt-1 text-sm text-stone-500">Your cart contains {cart.length} item{cart.length === 1 ? '' : 's'}.</p>
                        <textarea value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} rows="3" placeholder="Shipping address" className="admin-input mt-4" />
                        {orderMessage && <p className="mt-3 rounded-xl bg-white p-3 text-sm text-stone-700">{orderMessage}</p>}
                        <button type="submit" disabled={placingOrder || cartLoading} className="mt-4 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                            {placingOrder ? 'Placing order...' : 'Place order'}
                        </button>
                    </form>
                </section>

                {selectedProduct && (
                    <div
                        className="fixed inset-0 z-20 flex items-center justify-center bg-stone-900/40 p-4"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) setSelectedProduct(null)
                        }}
                    >
                        <article className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Garment detail</p>
                                    <h2 className="mt-2 text-2xl font-semibold">{selectedProduct.name}</h2>
                                </div>
                                <button type="button" onClick={() => setSelectedProduct(null)} className="text-sm underline underline-offset-4">Close</button>
                            </div>

                            {(selectedProduct.iconUrl || selectedProduct.image || selectedProduct.imageUrl) ? (
                                <img src={selectedProduct.iconUrl || selectedProduct.image || selectedProduct.imageUrl} alt={selectedProduct.name} className="mt-5 h-64 w-full rounded-2xl object-cover" />
                            ) : null}
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Category</p>
                                    <p className="mt-1 font-medium">{selectedProduct.category || 'Tailoring'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Base price</p>
                                    <p className="mt-1 font-medium">{selectedProduct.basePrice != null ? `$${selectedProduct.basePrice}` : 'Custom pricing'}</p>
                                </div>
                            </div>
                            <div className="mt-5">
                                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Description</p>
                                <p className="mt-1 text-stone-600">{selectedProduct.description || 'A garment tailored to your measurements and preferences.'}</p>
                            </div>
                            <div className="mt-5">
                                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Available designs</p>
                                {selectedProduct.designs?.length ? (
                                    <div className="mt-2 space-y-2">{selectedProduct.designs.map((design) => <div key={design.id} className="flex items-center justify-between rounded-xl bg-stone-100 p-3"><span>{design.name}</span><span className="text-sm text-stone-600">{design.tailoringPrice != null ? `$${design.tailoringPrice}` : 'Custom'}</span></div>)}</div>
                                ) : <p className="mt-1 text-stone-600">Design options will be confirmed after you order.</p>}
                            </div>
                            <div className="mt-5">
                                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Measurement requirements</p>
                                <p className="mt-1 break-words text-sm text-stone-600">{selectedProduct.requiredMeasurementsJson || 'Measurements will be collected after checkout.'}</p>
                            </div>
                            <button type="button" onClick={() => handleAddToCart(selectedProduct)} disabled={addingToCart} className="mt-6 w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                                {addingToCart ? 'Adding...' : 'Add this garment to cart'}
                            </button>
                        </article>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserPage

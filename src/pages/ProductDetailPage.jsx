import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../features/auth/authSlice'
import { useGetProductByIdQuery } from '../features/products/productApi'
import { useGetFabricsQuery } from '../features/fabrics/fabricApi'
import { useAddToCartMutation } from '../features/orders/orderApi'

const getErrorMessage = (error) => error?.data?.message || error?.error || error?.message || 'Unable to add this garment to your cart.'

export default function ProductDetailPage() {
    const { productId } = useParams()
    const navigate = useNavigate()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const { data: garment, isLoading, isError } = useGetProductByIdQuery(productId)
    const { data: fabrics = [] } = useGetFabricsQuery()
    const [addToCart, { isLoading: adding }] = useAddToCartMutation()
    const [message, setMessage] = useState('')
    const [selectedDesignId, setSelectedDesignId] = useState('')
    const [selectedFabricId, setSelectedFabricId] = useState('')
    const [measurementSnapshot, setMeasurementSnapshot] = useState('')
    const [customizationDetails, setCustomizationDetails] = useState('')

    if (isLoading) return <main className="min-h-screen bg-stone-100 p-8 text-stone-600">Loading garment...</main>
    if (isError || !garment) return <main className="min-h-screen bg-stone-100 p-8 text-red-700">Garment could not be found.</main>

    const imageUrl = garment.iconUrl || garment.image || garment.imageUrl
    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        try {
            await addToCart({
                garmentId: garment.id,
                designId: selectedDesignId || null,
                fabricId: selectedFabricId || null,
                quantity: 1,
                measurementSnapshot: measurementSnapshot.trim() || null,
                customizationDetails: customizationDetails.trim() || null,
            }).unwrap()
            setMessage('Added to cart. Continue to your dashboard to checkout.')
        } catch (error) {
            setMessage(getErrorMessage(error))
        }
    }

    return (
        <main className="min-h-screen bg-stone-100 p-4 text-stone-900 sm:p-8">
            <div className="mx-auto max-w-5xl">
                <button type="button" onClick={() => navigate(-1)} className="mb-6 text-sm font-medium underline underline-offset-4">Back to collection</button>
                <section className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg md:grid-cols-2">
                    {imageUrl ? <img src={imageUrl} alt={garment.name} className="h-full min-h-80 w-full object-cover" /> : <div className="min-h-80 bg-stone-200" />}
                    <div className="p-6 sm:p-8">
                        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{garment.category || 'Tailoring'}</p>
                        <h1 className="mt-3 text-3xl font-semibold">{garment.name}</h1>
                        <p className="mt-4 text-xl font-medium">{garment.basePrice != null ? `$${garment.basePrice}` : 'Custom pricing'}</p>
                        <p className="mt-5 leading-7 text-stone-600">{garment.description || 'A garment tailored to your measurements and preferences.'}</p>

                        <div className="mt-7 border-t border-stone-200 pt-5">
                            <h2 className="font-semibold">Design options</h2>
                            {garment.designs?.length ? <div className="mt-3 space-y-2">{garment.designs.map((design) => <div key={design.id} className="flex justify-between rounded-xl bg-stone-100 p-3 text-sm"><span>{design.name}</span><span>{design.tailoringPrice != null ? `$${design.tailoringPrice}` : 'Custom'}</span></div>)}</div> : <p className="mt-2 text-sm text-stone-500">Design options will be confirmed after ordering.</p>}
                            {garment.designs?.length > 0 && <select value={selectedDesignId} onChange={(event) => setSelectedDesignId(event.target.value)} className="admin-input mt-3"><option value="">Choose a design (optional)</option>{garment.designs.filter((design) => design.isActive !== false).map((design) => <option key={design.id} value={design.id}>{design.name}{design.tailoringPrice != null ? ` - $${design.tailoringPrice}` : ''}</option>)}</select>}
                        </div>

                        <div className="mt-6">
                            <h2 className="font-semibold">Fabric</h2>
                            <select value={selectedFabricId} onChange={(event) => setSelectedFabricId(event.target.value)} className="admin-input mt-3"><option value="">Choose a fabric (optional)</option>{fabrics.filter((fabric) => fabric.isActive !== false).map((fabric) => <option key={fabric.id} value={fabric.id}>{fabric.name}{fabric.price != null ? ` - $${fabric.price}` : ''}</option>)}</select>
                        </div>

                        <div className="mt-6">
                            <h2 className="font-semibold">Measurements needed</h2>
                            <p className="mt-2 break-words text-sm text-stone-600">{garment.requiredMeasurementsJson || 'Measurements will be collected after checkout.'}</p>
                            <textarea value={measurementSnapshot} onChange={(event) => setMeasurementSnapshot(event.target.value)} rows="3" placeholder="Enter your measurements or measurement notes" className="admin-input mt-3" />
                        </div>

                        <div className="mt-6">
                            <h2 className="font-semibold">Customization</h2>
                            <textarea value={customizationDetails} onChange={(event) => setCustomizationDetails(event.target.value)} rows="3" placeholder="Color, fit, monogram, or other requests" className="admin-input mt-3" />
                        </div>

                        {message && <p className="mt-5 rounded-2xl bg-stone-100 p-3 text-sm text-stone-700">{message}</p>}
                        <button type="button" onClick={handleAddToCart} disabled={adding} className="mt-6 w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{adding ? 'Adding...' : isAuthenticated ? 'Add to cart' : 'Login to order'}</button>
                        {isAuthenticated && <button type="button" onClick={() => navigate('/user')} className="mt-3 w-full rounded-full border border-stone-200 px-4 py-3 text-sm font-medium">Open checkout</button>}
                    </div>
                </section>
            </div>
        </main>
    )
}

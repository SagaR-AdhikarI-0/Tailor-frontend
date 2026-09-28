import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../features/auth/authSlice'
import { useGetProductByIdQuery } from '../features/products/productApi'
import { useGetFabricsQuery } from '../features/fabrics/fabricApi'
import Navbar from '../../components/layout/Navbar'
import { addLocalCartItem } from '../utils/localCart'
import BottomNavbar from '../../components/layout/BottomNavbar'

const getErrorMessage = (error) => error?.data?.message || error?.error || error?.message || 'Unable to add this garment to your cart.'

export default function ProductDetailPage() {
    const { productId } = useParams()
    const navigate = useNavigate()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const user = useSelector((state) => state.auth.user)
    const { data: garment, isLoading, isError } = useGetProductByIdQuery(productId)
    const { data: fabrics = [] } = useGetFabricsQuery()
    const [message, setMessage] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDesignId, setSelectedDesignId] = useState('')
    const [viewingDesign, setViewingDesign] = useState(null)
    const [selectedFabricId, setSelectedFabricId] = useState('')
    const [viewingFabric, setViewingFabric] = useState(null)
    const [measurementSnapshot, setMeasurementSnapshot] = useState('')
    const [customizationDetails, setCustomizationDetails] = useState('')

    useEffect(() => {
        if (!isModalOpen) return undefined
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setIsModalOpen(false)
        }
        document.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isModalOpen])

    if (isLoading) return <main className="min-h-screen bg-stone-100 p-8 text-stone-600">Loading garment...</main>
    if (isError || !garment) return <main className="min-h-screen bg-stone-100 p-8 text-red-700">Garment could not be found.</main>

    const imageUrl = garment.iconUrl || garment.image || garment.imageUrl
    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        try {
            addLocalCartItem(user, {
                garmentId: garment.id,
                designId: selectedDesignId || null,
                fabricId: selectedFabricId || null,
                quantity: 1,
                measurementSnapshot: measurementSnapshot.trim() || null,
                customizationDetails: customizationDetails.trim() || null,
                garment,
                design: garment.designs?.find((design) => String(design.id || design._id) === String(selectedDesignId)) || null,
                fabric: fabrics.find((fabric) => String(fabric.id || fabric._id) === String(selectedFabricId)) || null,
            })
            setIsModalOpen(false)
            setMessage('Added to cart. Continue to your cart to checkout.')
        } catch (error) {
            setMessage(getErrorMessage(error))
        }
    }

    return (
        <div className="min-h-screen bg-stone-100 text-stone-900">
            <Navbar />
            <main className="p-4 sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <button type="button" onClick={() => navigate(-1)} className="mb-6 text-sm font-medium underline underline-offset-4">Back to collection</button>
                    <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg">
                        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
                            <div className="min-h-[420px] bg-stone-200 md:min-h-[620px]">{imageUrl ? <img src={imageUrl} alt={garment.name} className="h-full w-full object-cover" /> : <div className="h-full min-h-[420px] bg-stone-200" />}</div>
                            <div className="flex flex-col p-6 sm:p-10">
                                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{garment.category || 'Tailoring'}</p>
                                <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{garment.name}</h1>
                                <p className="mt-5 text-2xl font-medium">{garment.basePrice != null ? `$${garment.basePrice}` : 'Custom pricing'}</p>
                                <p className="mt-6 leading-7 text-stone-600">{garment.description || 'A garment tailored to your measurements and preferences.'}</p>
                                <div className="mt-8 grid grid-cols-2 gap-3 border-y border-stone-200 py-5 text-sm">
                                    <div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Made for</p><p className="mt-2 font-medium">Your measurements</p></div>
                                    <div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Availability</p><p className="mt-2 font-medium">Made to order</p></div>
                                </div>
                                <div className="mt-auto pt-8">
                                    {message && <p className="mb-4 rounded-2xl bg-stone-100 p-3 text-sm text-stone-700">{message}</p>}
                                    <button type="button" onClick={() => isAuthenticated ? setIsModalOpen(true) : navigate('/login')} className="w-full rounded-full bg-stone-900 px-4 py-4 text-sm font-semibold text-white hover:bg-stone-700">{isAuthenticated ? 'Add to cart' : 'Login to order'}</button>
                                    {isAuthenticated && <button type="button" onClick={() => navigate('/cart')} className="mt-3 w-full rounded-full border border-stone-200 px-4 py-3 text-sm font-medium hover:border-stone-900">View cart</button>}
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-8 border-t border-stone-200 p-6 sm:grid-cols-3 sm:p-10">
                            <div><h2 className="font-semibold">Design options</h2><p className="mt-2 text-sm leading-6 text-stone-600">{garment.designs?.length ? `${garment.designs.length} designs available to personalize this piece.` : 'Design options will be confirmed after ordering.'}</p></div>
                            <div><h2 className="font-semibold">Fabric selection</h2><p className="mt-2 text-sm leading-6 text-stone-600">Choose from the atelier fabric collection when adding this garment to your cart.</p></div>
                            <div><h2 className="font-semibold">Measurements</h2><p className="mt-2 break-words text-sm leading-6 text-stone-600">{garment.requiredMeasurementsJson || 'Measurements will be collected with your order.'}</p></div>
                        </div>
                    </section>
                </div>
            </main>
            <BottomNavbar />
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsModalOpen(false) }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="add-to-cart-title" className="max-h-[min(780px,calc(100vh-2rem))] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                        <div className="flex items-start justify-between gap-5 border-b border-stone-200 pb-5"><div><p className="text-xs uppercase tracking-[0.25em] text-stone-500">Personalize your piece</p><h2 id="add-to-cart-title" className="mt-2 text-2xl font-semibold">Add {garment.name} to cart</h2></div><button type="button" aria-label="Close add to cart dialog" onClick={() => setIsModalOpen(false)} className="rounded-full border border-stone-200 px-3 py-1 text-lg leading-none text-stone-600 hover:border-stone-900 hover:text-stone-900">&times;</button></div>
                        <div className="mt-6 space-y-6">
                            <div>
                                <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold">Choose a design</p><p className="mt-1 text-sm text-stone-500">Select an image to see its details.</p></div>{selectedDesignId && <button type="button" onClick={() => { setSelectedDesignId(''); setViewingDesign(null) }} className="text-sm font-medium text-stone-600 underline underline-offset-4">Clear</button>}</div>
                                {garment.designs?.filter((design) => design.isActive !== false).length ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{garment.designs.filter((design) => design.isActive !== false).map((design) => {
                                    const designId = design.id || design._id
                                    const designImage = design.imageUrl || design.image || design.iconUrl
                                    const isSelected = String(selectedDesignId) === String(designId)
                                    return <button key={designId} type="button" onClick={() => { setSelectedDesignId(designId); setViewingDesign(design) }} className={`overflow-hidden rounded-2xl border-2 text-left transition hover:border-stone-900 ${isSelected ? 'border-stone-900 ring-2 ring-stone-900/15' : 'border-stone-200'}`}>
                                        <div className="h-28 bg-stone-100">{designImage ? <img src={designImage} alt={design.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-3 text-center text-xs uppercase tracking-[0.12em] text-stone-400">No image</div>}</div>
                                        <div className="p-3"><p className="truncate text-sm font-semibold">{design.name}</p><p className="mt-1 text-sm text-stone-600">{design.tailoringPrice != null ? `$${design.tailoringPrice}` : 'Custom'}</p></div>
                                    </button>
                                })}</div> : <p className="mt-3 rounded-xl bg-stone-100 p-3 text-sm text-stone-500">No designs are available for this garment.</p>}
                                {viewingDesign && <div className="mt-4 rounded-2xl bg-stone-100 p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Selected design</p><h3 className="mt-1 font-semibold">{viewingDesign.name}</h3></div><p className="font-semibold">{viewingDesign.tailoringPrice != null ? `$${viewingDesign.tailoringPrice}` : 'Custom'}</p></div><p className="mt-3 text-sm leading-6 text-stone-600">{viewingDesign.description || 'A considered design detail prepared for this garment.'}</p></div>}
                            </div>
                            <div>
                                <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold">Choose a fabric</p><p className="mt-1 text-sm text-stone-500">Select an image to see its details.</p></div>{selectedFabricId && <button type="button" onClick={() => { setSelectedFabricId(''); setViewingFabric(null) }} className="text-sm font-medium text-stone-600 underline underline-offset-4">Clear</button>}</div>
                                {fabrics.filter((fabric) => fabric.isActive !== false).length ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{fabrics.filter((fabric) => fabric.isActive !== false).map((fabric) => {
                                    const fabricId = fabric.id || fabric._id
                                    const fabricImage = fabric.imageUrl || fabric.image || fabric.iconUrl
                                    const isSelected = String(selectedFabricId) === String(fabricId)
                                    return <button key={fabricId} type="button" onClick={() => { setSelectedFabricId(fabricId); setViewingFabric(fabric) }} className={`overflow-hidden rounded-2xl border-2 text-left transition hover:border-stone-900 ${isSelected ? 'border-stone-900 ring-2 ring-stone-900/15' : 'border-stone-200'}`}>
                                        <div className="h-28 bg-stone-100">{fabricImage ? <img src={fabricImage} alt={fabric.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-3 text-center text-xs uppercase tracking-[0.12em] text-stone-400">No image</div>}</div>
                                        <div className="p-3"><p className="truncate text-sm font-semibold">{fabric.name}</p><p className="mt-1 text-sm text-stone-600">{fabric.price != null ? `$${fabric.price}` : 'Custom'}</p></div>
                                    </button>
                                })}</div> : <p className="mt-3 rounded-xl bg-stone-100 p-3 text-sm text-stone-500">No fabrics are available for this garment.</p>}
                                {viewingFabric && <div className="mt-4 rounded-2xl bg-stone-100 p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Selected fabric</p><h3 className="mt-1 font-semibold">{viewingFabric.name}</h3></div><p className="font-semibold">{viewingFabric.price != null ? `$${viewingFabric.price}` : 'Custom'}</p></div><p className="mt-2 text-sm text-stone-500">{viewingFabric.category || viewingFabric.color || 'Atelier fabric'}</p><p className="mt-3 text-sm leading-6 text-stone-600">{viewingFabric.description || 'A fabric selected for its feel, drape, and finish.'}</p></div>}
                            </div>
                            <div><label htmlFor="measurements" className="text-sm font-semibold">Measurements or notes</label><textarea id="measurements" value={measurementSnapshot} onChange={(event) => setMeasurementSnapshot(event.target.value)} rows="4" placeholder="Enter your measurements or measurement notes" className="admin-input mt-2" /></div>
                            <div><label htmlFor="customization" className="text-sm font-semibold">Customization requests</label><textarea id="customization" value={customizationDetails} onChange={(event) => setCustomizationDetails(event.target.value)} rows="4" placeholder="Color, fit, monogram, or other requests" className="admin-input mt-2" /></div>
                        </div>
                        <button type="button" onClick={handleAddToCart} className="mt-7 w-full rounded-full bg-stone-900 px-4 py-4 text-sm font-semibold text-white">Add to cart</button>
                    </section>
                </div>,
                document.body,
            )}
        </div>
    )
}

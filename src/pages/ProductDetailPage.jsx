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
    const [imageZoom, setImageZoom] = useState(null)
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

    if (isLoading) return <ProductDetailSkeleton />
    if (isError || !garment) return <main className="min-h-screen bg-stone-100 p-8 text-red-700">Garment could not be found.</main>

    const imageUrl = garment.iconUrl || garment.image || garment.imageUrl
    const activeDesigns = (garment.designs || []).filter((design) => design.isActive !== false)
    const availableFabrics = Array.isArray(fabrics) ? fabrics : fabrics.items || fabrics.fabrics || []
    const activeFabrics = availableFabrics.filter((fabric) => fabric.isActive !== false)
    const handleAddToCart = async () => {
        const itemData = {
            garmentId: garment.id,
            designId: selectedDesignId || null,
            fabricId: selectedFabricId || null,
            quantity: 1,
            measurementSnapshot: measurementSnapshot.trim() || null,
            customizationDetails: customizationDetails.trim() || null,
            garment,
            design: garment.designs?.find((design) => String(design.id || design._id) === String(selectedDesignId)) || null,
            fabric: availableFabrics.find((fabric) => String(fabric.id || fabric._id) === String(selectedFabricId)) || null,
        }

        if (!isAuthenticated) {
            addLocalCartItem(null, itemData)
            setIsModalOpen(false)
            navigate('/login', { state: { from: '/cart' } })
            return
        }

        try {
            addLocalCartItem(user, itemData)
            setIsModalOpen(false)
            setMessage('Added to cart. Continue to your cart to checkout.')
        } catch (error) {
            setMessage(getErrorMessage(error))
        }
    }

    const updateImageZoom = (event, id, image) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100))
        const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100))
        const left = Math.min(event.clientX + 20, window.innerWidth - 240)
        const top = Math.min(Math.max(12, event.clientY - 112), window.innerHeight - 236)
        setImageZoom({ id, image, x, y, left, top })
    }

    return (
        <div className="min-h-screen bg-stone-100 text-stone-900">
            <Navbar />
            <main className=" px-4 py-6 sm:px-8 sm:py-10">
                <div className="mx-auto max-w-6xl">
                    <button type="button" onClick={() => navigate(-1)} className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-stone-950"><span aria-hidden="true">←</span> Back to collection</button>
                    <section className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
                        <div className="mx-auto w-full max-w-[500px] rounded-[28px] bg-[#d9cabe] p-3 shadow-sm sm:p-4 lg:sticky lg:top-6">
                            <div className="relative aspect-[5/6] overflow-hidden rounded-[22px] bg-stone-200">
                                {imageUrl ? <img src={imageUrl} alt={garment.name} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-stone-200" />}
                                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600 shadow-sm backdrop-blur-sm">{garment.category || 'Tailoring'}</span>
                            </div>
                            <div className="flex items-center justify-between px-2 pt-4 text-xs font-medium uppercase tracking-[0.18em] text-stone-600 sm:px-3">
                                <span>Atelier piece</span>
                                <span>Made to order</span>
                            </div>
                        </div>

                        <div className="p-2 sm:p-9 lg:pt-4">
                            <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">The considered edit</p>
                            <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-tight text-stone-900 sm:text-6xl">{garment.name}</h1>
                            <div className="mt-6 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
                                <p className="text-2xl font-semibold text-stone-900">{garment.basePrice != null ? `$${garment.basePrice}` : 'Custom pricing'}</p>
                                <span className="text-right text-xs uppercase tracking-[0.16em] text-stone-500">Designed<br />around you</span>
                            </div>
                            <p className="mt-7 text-base leading-7 text-stone-600">{garment.description || 'A garment tailored to your measurements and preferences.'}</p>
                            <div className="mt-8 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-white/45 p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Fit</p><p className="mt-2 text-sm font-medium text-stone-900">Your measurements</p></div>
                                <div className="rounded-2xl bg-white/45 p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Finish</p><p className="mt-2 text-sm font-medium text-stone-900">Made to order</p></div>
                            </div>
                            <div className="mt-8 border-t border-dashed border-stone-300 pt-6">
                                {message && <p className="mb-4 rounded-2xl bg-stone-100 p-3 text-sm text-stone-700">{message}</p>}
                                <button type="button" onClick={() => setIsModalOpen(true)} className="w-full rounded-full bg-stone-900 px-4 py-4 text-sm font-semibold text-white transition hover:bg-stone-700">Personalize this piece <span aria-hidden="true">↗</span></button>
                                <button type="button" onClick={() => navigate('/cart')} className="mt-3 w-full rounded-full border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900">View cart</button>
                            </div>
                        </div>
                    </section>

                    <section className="mt-10 border-t border-stone-400/50 pt-8 sm:pt-10">
                        <div className="flex flex-col gap-2 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.25em] text-stone-500">Make it yours</p><h2 className="mt-2 text-2xl font-semibold text-stone-900">Choose the details</h2></div><p className="max-w-sm text-sm text-stone-500">Explore every design and fabric available for {garment.name} before adding it to your cart.</p></div>

                        <div className="mt-7">
                            <div className="flex items-center justify-between gap-4"><div><h3 className="text-lg font-semibold text-stone-900">Designs for this garment</h3><p className="mt-1 text-sm text-stone-500">{activeDesigns.length ? `${activeDesigns.length} available design${activeDesigns.length === 1 ? '' : 's'}` : 'No designs available yet.'}</p></div>{activeDesigns.length > 0 && <button type="button" onClick={() => setIsModalOpen(true)} className="text-sm font-medium text-stone-600 underline underline-offset-4">View selector</button>}</div>
                            {activeDesigns.length > 0 ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">{activeDesigns.map((design) => {
                                const designId = design.id || design._id
                                const designImage = design.imageUrl || design.image || design.iconUrl
                                return <button key={designId} type="button" onClick={() => { setSelectedDesignId(designId); setViewingDesign(design); setIsModalOpen(true) }} onMouseMove={(event) => designImage && updateImageZoom(event, `design-${designId}`, designImage)} onMouseEnter={(event) => designImage && updateImageZoom(event, `design-${designId}`, designImage)} onMouseLeave={() => setImageZoom(null)} className="group/design overflow-hidden rounded-2xl bg-white/70 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900">
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-stone-100">{designImage ? <img src={designImage} alt={design.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-3 text-center text-xs uppercase tracking-[0.12em] text-stone-400">No image</div>}
                                        {imageZoom?.id === `design-${designId}` && <span className="pointer-events-none absolute h-16 w-20 -translate-x-1/2 -translate-y-1/2 border-2 border-white bg-white/20 shadow-[0_0_0_1px_rgba(28,25,23,0.55)]" style={{ left: `${imageZoom.x}%`, top: `${imageZoom.y}%` }} />}
                                    </div>
                                    <div className="p-3"><p className="truncate text-sm font-semibold text-stone-900">{design.name}</p><p className="mt-1 text-xs text-stone-500">{design.tailoringPrice != null ? `$${design.tailoringPrice}` : 'Custom detail'}</p></div>
                                </button>
                            })}</div> : <p className="mt-4 rounded-2xl bg-stone-100 p-4 text-sm text-stone-500">Design options will be confirmed after ordering.</p>}
                        </div>

                        <div className="mt-10 border-t border-stone-200 pt-7">
                            <div className="flex items-center justify-between gap-4"><div><h3 className="text-lg font-semibold text-stone-900">Available fabrics</h3><p className="mt-1 text-sm text-stone-500">{activeFabrics.length ? `${activeFabrics.length} fabric option${activeFabrics.length === 1 ? '' : 's'} in the atelier library` : 'No fabrics available yet.'}</p></div>{activeFabrics.length > 0 && <button type="button" onClick={() => setIsModalOpen(true)} className="text-sm font-medium text-stone-600 underline underline-offset-4">View selector</button>}</div>
                            {activeFabrics.length > 0 ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{activeFabrics.map((fabric) => {
                                const fabricId = fabric.id || fabric._id
                                const fabricImage = fabric.imageUrl || fabric.image || fabric.iconUrl
                                return <button key={fabricId} type="button" onClick={() => { setSelectedFabricId(fabricId); setViewingFabric(fabric); setIsModalOpen(true) }} onMouseMove={(event) => fabricImage && updateImageZoom(event, fabricId, fabricImage)} onMouseEnter={(event) => fabricImage && updateImageZoom(event, fabricId, fabricImage)} onMouseLeave={() => setImageZoom(null)} className="group/fabric relative overflow-visible rounded-2xl border border-stone-200 text-left transition hover:-translate-y-1 hover:border-stone-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900">
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-stone-100">{fabricImage ? <img src={fabricImage} alt={fabric.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-3 text-center text-xs uppercase tracking-[0.12em] text-stone-400">No image</div>}
                                        {imageZoom?.id === fabricId && <span className="pointer-events-none absolute h-16 w-20 -translate-x-1/2 -translate-y-1/2 border-2 border-white bg-white/20 shadow-[0_0_0_1px_rgba(28,25,23,0.55)]" style={{ left: `${imageZoom.x}%`, top: `${imageZoom.y}%` }} />}
                                    </div>
                                    <div className="p-3"><p className="truncate text-sm font-semibold text-stone-900">{fabric.name}</p><p className="mt-1 text-xs text-stone-500">{fabric.price != null ? `$${fabric.price}` : fabric.category || fabric.color || 'Atelier cloth'}</p></div>
                                </button>
                            })}</div> : <p className="mt-4 rounded-2xl bg-stone-100 p-4 text-sm text-stone-500">Fabric options will be confirmed after ordering.</p>}
                        </div>

                        <div className="mt-10 border-t border-stone-200 pt-7"><p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Measurements</p><p className="mt-3 break-words text-sm leading-6 text-stone-600">{garment.requiredMeasurementsJson || 'Measurements will be collected with your order.'}</p></div>
                    </section>
                </div>
            </main>
            {imageZoom && <div className="pointer-events-none fixed z-[60] hidden h-56 w-56 rounded-2xl border border-stone-300 bg-white p-2 shadow-2xl lg:block" style={{ left: imageZoom.left, top: imageZoom.top }} aria-hidden="true"><div className="h-full w-full rounded-xl bg-stone-100" style={{ backgroundImage: `url(${imageZoom.image})`, backgroundPosition: `${imageZoom.x}% ${imageZoom.y}%`, backgroundRepeat: 'no-repeat', backgroundSize: '250%' }} /></div>}
            <BottomNavbar />
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsModalOpen(false) }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="add-to-cart-title" className="scrollbar-hidden max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8 lg:p-10">
                        <div className="flex items-start justify-between gap-5 border-b border-stone-200 pb-5"><div><p className="text-xs uppercase tracking-[0.25em] text-stone-500">Personalize your piece</p><h2 id="add-to-cart-title" className="mt-2 text-2xl font-semibold">Add {garment.name} to cart</h2></div><button type="button" aria-label="Close add to cart dialog" onClick={() => setIsModalOpen(false)} className="rounded-full border border-stone-200 px-3 py-1 text-lg leading-none text-stone-600 hover:border-stone-900 hover:text-stone-900">&times;</button></div>
                        <div className="mt-6 grid gap-8 lg:grid-cols-2">
                            <div>
                                <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold">Choose a design</p><p className="mt-1 text-sm text-stone-500">Select an image to see its details.</p></div>{selectedDesignId && <button type="button" onClick={() => { setSelectedDesignId(''); setViewingDesign(null) }} className="text-sm font-medium text-stone-600 underline underline-offset-4">Clear</button>}</div>
                                {activeDesigns.length ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{activeDesigns.map((design) => {
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
                                {activeFabrics.length ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{activeFabrics.map((fabric) => {
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
                            <div className="lg:col-span-2"><label htmlFor="measurements" className="text-sm font-semibold">Measurements or notes</label><textarea id="measurements" value={measurementSnapshot} onChange={(event) => setMeasurementSnapshot(event.target.value)} rows="4" placeholder="Enter your measurements or measurement notes" className="admin-input mt-2" /></div>
                            <div className="lg:col-span-2"><label htmlFor="customization" className="text-sm font-semibold">Customization requests</label><textarea id="customization" value={customizationDetails} onChange={(event) => setCustomizationDetails(event.target.value)} rows="4" placeholder="Color, fit, monogram, or other requests" className="admin-input mt-2" /></div>
                        </div>
                        <button type="button" onClick={handleAddToCart} className="mt-7 w-full rounded-full bg-stone-900 px-4 py-4 text-sm font-semibold text-white hover:bg-stone-700">{isAuthenticated ? 'Add to cart' : 'Sign in to add to cart'}</button>
                    </section>
                </div>,
                document.body,
            )}
        </div>
    )
}

function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen animate-pulse bg-stone-100 text-stone-900">
            <Navbar />
            <main className="px-4 py-6 sm:px-8 sm:py-10">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6 h-4 w-36 rounded-full bg-stone-200" />
                    <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
                        <div className="rounded-[28px] bg-[#e5dbd0] p-3 sm:p-4">
                            <div className="aspect-[4/5] rounded-[22px] bg-stone-200" />
                            <div className="mt-4 flex justify-between px-2 sm:px-3"><div className="h-3 w-24 rounded-full bg-stone-300" /><div className="h-3 w-24 rounded-full bg-stone-300" /></div>
                        </div>
                        <div className="rounded-[28px] border border-stone-200 bg-white p-6 sm:p-9">
                            <div className="h-3 w-32 rounded-full bg-stone-200" />
                            <div className="mt-5 h-16 w-4/5 rounded-2xl bg-stone-200" />
                            <div className="mt-7 h-px bg-stone-200" />
                            <div className="mt-7 space-y-3"><div className="h-4 w-full rounded-full bg-stone-200" /><div className="h-4 w-11/12 rounded-full bg-stone-200" /><div className="h-4 w-2/3 rounded-full bg-stone-200" /></div>
                            <div className="mt-8 grid grid-cols-2 gap-3"><div className="h-20 rounded-2xl bg-stone-100" /><div className="h-20 rounded-2xl bg-stone-100" /></div>
                            <div className="mt-8 h-14 rounded-full bg-stone-200" />
                            <div className="mt-3 h-12 rounded-full bg-stone-100" />
                        </div>
                    </div>
                    <div className="mt-5 grid gap-px rounded-[28px] border border-stone-200 bg-stone-200 sm:grid-cols-3"><div className="h-36 bg-white" /><div className="h-36 bg-white" /><div className="h-36 bg-white" /></div>
                </div>
            </main>
            <BottomNavbar />
        </div>
    )
}

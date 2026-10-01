import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import FashionHero from '../../components/layout/Hero'
import Navbar from '../../components/layout/Navbar'
import BottomNavbar from '../../components/layout/BottomNavbar'
import { selectIsAuthenticated } from '../features/auth/authSlice'
import { useGetFabricsQuery } from '../features/fabrics/fabricApi'
import { useGetProductsQuery } from '../features/products/productApi'
import tailorImage from '../assets/tailor.png'
import fabricImage from '../assets/fabric.png'

function HomePage() {
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const { data: products = [], isLoading } = useGetProductsQuery({ page: 1, limit: 4 })
    const { data: fabrics = [] } = useGetFabricsQuery()

    return (
        <div className="min-h-screen bg-stone-100 text-stone-900">
            <Navbar />
            <FashionHero />

            <section className="border-b border-stone-200 bg-[#f0ebe4]">
                <div className="mx-auto grid max-w-6xl divide-y divide-stone-300 px-4 py-8 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-6">
                    <div className="px-5 py-3 text-center sm:px-8">
                        <p className="text-3xl font-semibold tracking-tight text-stone-900">2,500+</p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Customers served</p>
                    </div>
                    <div className="px-5 py-3 text-center sm:px-8">
                        <p className="text-3xl font-semibold tracking-tight text-stone-900">8,000+</p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Garments tailored</p>
                    </div>
                    <div className="px-5 py-3 text-center sm:px-8">
                        <p className="text-3xl font-semibold tracking-tight text-stone-900">18</p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Years of craft</p>
                    </div>
                    <div className="px-5 py-3 text-center sm:px-8">
                        <p className="text-3xl font-semibold tracking-tight text-stone-900">40+</p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Fabric options</p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6">
                <div className="flex items-end justify-between gap-6 border-b border-stone-300 pb-5">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">A considered edit</p>
                        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Featured collection</h3>
                    </div>
                    <Link to="/products" className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-stone-600 underline decoration-stone-300 underline-offset-8 transition hover:text-stone-900 sm:block">View all pieces</Link>
                </div>

                {isLoading ? (
                    <p className="py-12 text-stone-500">Loading products...</p>
                ) : (
                    <div className="mt-8 grid gap-x-6 gap-y-12 md:grid-cols-12">
                        {products.slice(0, 4).map((product, index) => {
                            const productPath = product.id ? `/products/${product.id}` : '/products'
                            const imageUrl = product.iconUrl || product.image || product.imageUrl
                            const isLead = index === 0
                            return (
                                <Link key={product.id || product._id} to={productPath} className={isLead ? 'group md:col-span-7' : 'group md:col-span-5'}>
                                    <div className={`${isLead ? 'aspect-[1.2/1] sm:aspect-[1.35/1]' : 'aspect-[1.15/1]'} overflow-hidden bg-stone-200`}>
                                        {imageUrl ? <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105" /> : <div className="h-full w-full bg-stone-200" />}
                                    </div>
                                    <div className="mt-4 flex items-start justify-between gap-4 border-b border-stone-300 pb-4">
                                        <div>
                                            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-stone-500">{product.category || 'Tailoring'}</p>
                                            <h4 className={`${isLead ? 'text-2xl' : 'text-xl'} mt-2 font-semibold text-stone-900`}>{product.name || 'Signature Piece'}</h4>
                                        </div>
                                        <p className="shrink-0 pt-5 text-sm text-stone-600">{product.basePrice != null ? `$${product.basePrice}` : 'Custom'}</p>
                                    </div>
                                    <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 transition group-hover:text-stone-900">Explore piece <span aria-hidden="true">↗</span></span>
                                </Link>
                            )
                        })}
                    </div>
                )}
                <Link to="/products" className="mt-10 block text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-600 underline decoration-stone-300 underline-offset-8 sm:hidden">View all pieces</Link>
            </section>

            <section className="overflow-hidden bg-[#e8e0d7]">
                <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-24">
                    <div>
                        <h2 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl">
                            Tailored clothes only for you
                        </h2>
                        <p className="mt-6 max-w-lg text-base leading-7 text-stone-600">
                            Every piece begins with your measurements, preferences, and the way you actually live. We cut, stitch, and finish each garment so the fit feels personal — not pulled from a rack, but made around you from the first fitting to the final hem.
                        </p>
                    </div>
                    <div className="flex justify-center md:justify-end">
                        <img src={tailorImage} alt="A tailor taking a customer's measurements" className="h-auto max-h-[360px] w-full max-w-md object-contain sm:max-h-[440px] lg:max-h-[520px] lg:max-w-lg" />
                    </div>
                </div>
                <div className="mx-auto grid max-w-6xl gap-3 px-4 pb-10 sm:grid-cols-2 sm:px-6">
                    <p className="text-center text-xs font-medium uppercase tracking-[0.24em] text-stone-600 sm:text-left">Measured for your life.</p>
                    <p className="text-center text-xs font-medium uppercase tracking-[0.24em] text-stone-600 sm:text-right">Cut around you.</p>
                </div>
            </section>

            <section className="border-t border-stone-200 bg-[#e9e3db]">
                <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-24">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">The atelier approach</p>
                        <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl">Tailoring that begins with you.</h2>
                        <p className="mt-6 max-w-md text-base leading-7 text-stone-600">A well-made garment should feel inevitable. We bring together thoughtful design, considered fabrics, and precise craft to create pieces that move naturally with your life.</p>
                        <Link to="/products" className="mt-8 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-stone-700 underline decoration-stone-400 underline-offset-8 transition hover:text-stone-950">Start your piece <span aria-hidden="true">↗</span></Link>
                    </div>

                    <div className="divide-y divide-stone-300 border-y border-stone-300">
                        <div className="grid gap-4 py-6 sm:grid-cols-[72px_1fr] sm:gap-6">
                            <p className="text-3xl font-light text-stone-400">01</p>
                            <div><h3 className="text-xl font-semibold text-stone-900">Choose your foundation</h3><p className="mt-2 max-w-xl leading-7 text-stone-600">Begin with a silhouette from our collection, then make it yours with the details that matter to you.</p></div>
                        </div>
                        <div className="grid gap-4 py-6 sm:grid-cols-[72px_1fr] sm:gap-6">
                            <p className="text-3xl font-light text-stone-400">02</p>
                            <div><h3 className="text-xl font-semibold text-stone-900">Select with intention</h3><p className="mt-2 max-w-xl leading-7 text-stone-600">Explore fabrics and design options chosen for their texture, structure, and ability to wear beautifully over time.</p></div>
                        </div>
                        <div className="grid gap-4 py-6 sm:grid-cols-[72px_1fr] sm:gap-6">
                            <p className="text-3xl font-light text-stone-400">03</p>
                            <div><h3 className="text-xl font-semibold text-stone-900">Refine every detail</h3><p className="mt-2 max-w-xl leading-7 text-stone-600">Share your measurements and preferences, and our atelier prepares a piece with a fit and finish made specifically for you.</p></div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden  bg-white">
                <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-20 lg:py-28">
                    <img src={fabricImage} alt="Fabric Image" />

                    <div className="max-w-md">
                        <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">The fabric library</p>
                        <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl">The right cloth changes everything.</h2>
                        <p className="mt-6 text-base leading-7 text-stone-600">From quiet textures to expressive colour, every fabric is chosen for how it feels, falls, and becomes part of your everyday life.</p>
                        <p className="mt-4 text-base leading-7 text-stone-600">Choose a foundation, then let the details make it unmistakably yours.</p>
                        <Link to="/products" className="mt-8 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-stone-700 underline decoration-stone-400 underline-offset-8 transition hover:text-stone-950">Explore the collection <span aria-hidden="true">↗</span></Link>
                    </div>
                </div>
            </section>
            <BottomNavbar />
        </div>
    )
}

export default HomePage

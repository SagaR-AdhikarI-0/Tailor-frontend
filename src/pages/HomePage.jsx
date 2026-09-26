import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import FashionHero from '../../components/layout/Hero'
import Navbar from '../../components/layout/Navbar'
import { selectIsAuthenticated, selectUser } from '../features/auth/authSlice'
import { useGetProductsQuery } from '../features/products/productApi'

function HomePage() {
    const navigate = useNavigate()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const user = useSelector(selectUser)
    const { data: products = [], isLoading } = useGetProductsQuery({ page: 1, limit: 4 })

    const dashboardPath = user?.role === 'admin' ? '/admin' : '/user'

    return (
        <div className="min-h-screen bg-stone-100 text-stone-900">
            <Navbar />
            <FashionHero />

            <section className="mx-auto max-w-5xl px-4 py-12 text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-stone-900">Tailored access for every customer</h2>
                <p className="mx-auto mt-4 max-w-2xl text-stone-600">
                    Choose the role you want to explore. Admin handles inventory and ops, while users access personal tailoring flows.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    {isAuthenticated ? (
                        <button
                            type="button"
                            onClick={() => navigate(dashboardPath)}
                            className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-stone-700"
                        >
                            Open dashboard
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-stone-700"
                        >
                            Login to continue
                        </Link>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 pb-16">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-stone-900">Featured collection</h3>
                    <span className="text-xs font-medium uppercase tracking-[0.25em] text-stone-500">Public</span>
                </div>

                {isLoading ? (
                    <p className="text-stone-500">Loading products...</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-4">
                        {products.slice(0, 4).map((product) => (
                            <article
                                key={product.id || product._id}
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate(product.id ? `/products/${product.id}` : isAuthenticated ? '/user' : '/login')}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') navigate(product.id ? `/products/${product.id}` : isAuthenticated ? '/user' : '/login')
                                }}
                                className="cursor-pointer rounded-3xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                {product.iconUrl || product.image || product.imageUrl ? (
                                    <img src={product.iconUrl || product.image || product.imageUrl} alt={product.name} className="mb-4 h-48 w-full rounded-2xl object-cover" />
                                ) : (
                                    <div className="mb-4 h-48 rounded-2xl bg-stone-200" />
                                )}
                                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{product.category || 'Tailoring'}</p>
                                <h4 className="mt-2 text-lg font-semibold text-stone-900">{product.name || 'Signature Piece'}</h4>
                                <p className="mt-2 text-sm text-stone-600">{product.basePrice != null ? `$${product.basePrice}` : 'Custom pricing'}</p>
                                <button type="button" onClick={(event) => { event.stopPropagation(); navigate(product.id ? `/products/${product.id}` : isAuthenticated ? '/user' : '/login') }} className="mt-4 w-full rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">View and order</button>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default HomePage

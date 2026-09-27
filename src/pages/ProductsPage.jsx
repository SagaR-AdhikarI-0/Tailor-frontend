import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import { useGetProductsQuery } from '../features/products/productApi'

function ProductsPage() {
    const { data: products = [], isLoading, isError } = useGetProductsQuery({ page: 1, limit: 40 })

    return (
        <div className="min-h-screen bg-stone-100 text-stone-900">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">The collection</p>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Pieces made for your proportions.</h1>
                    <p className="mt-4 text-stone-600">Select a garment to choose its fabric, design details, and measurements.</p>
                </div>
                {isLoading && <p className="mt-10 text-stone-500">Loading products...</p>}
                {isError && <p className="mt-10 text-red-700">Products could not be loaded.</p>}
                {!isLoading && !isError && <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => {
                        const productId = product.id || product._id
                        const imageUrl = product.iconUrl || product.image || product.imageUrl
                        return <article key={productId} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            {imageUrl ? <img src={imageUrl} alt={product.name} className="h-72 w-full object-cover" /> : <div className="h-72 bg-stone-200" />}
                            <div className="p-5">
                                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{product.category || 'Tailoring'}</p>
                                <h2 className="mt-2 text-xl font-semibold">{product.name || 'Signature piece'}</h2>
                                <p className="mt-2 text-stone-600">{product.basePrice != null ? `$${product.basePrice}` : 'Custom pricing'}</p>
                                <Link to={`/products/${productId}`} className="mt-5 block rounded-full bg-stone-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-stone-700">View product</Link>
                            </div>
                        </article>
                    })}
                </div>}
            </main>
        </div>
    )
}

export default ProductsPage
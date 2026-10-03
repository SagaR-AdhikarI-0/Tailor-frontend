import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import BottomNavbar from '../../components/layout/BottomNavbar'
import ProductSkeleton from '../components/ProductSkeleton'
import { useGetProductsQuery } from '../features/products/productApi'
import { useGetDesignsQuery } from '../features/designs/designApi'
import { useGetFabricsQuery } from '../features/fabrics/fabricApi'

function ProductsPage() {
    const { data: response = [], isLoading, isError } = useGetProductsQuery({ page: 1, limit: 100 })
    const { data: designResponse = [], isLoading: isLoadingDesigns, isError: isDesignError } = useGetDesignsQuery()
    const { data: fabricResponse = [], isLoading: isLoadingFabrics, isError: isFabricError } = useGetFabricsQuery()
    const [search, setSearch] = useState('')
    const [catalogType, setCatalogType] = useState('garments')
    const [category, setCategory] = useState('all')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [sort, setSort] = useState('featured')
    const [page, setPage] = useState(1)
    const [selectedItem, setSelectedItem] = useState(null)
    const products = useMemo(() => Array.isArray(response) ? response : response.items || response.garments || [], [response])
    const designs = useMemo(() => Array.isArray(designResponse) ? designResponse : designResponse.items || designResponse.designs || [], [designResponse])
    const fabrics = useMemo(() => Array.isArray(fabricResponse) ? fabricResponse : fabricResponse.items || fabricResponse.fabrics || [], [fabricResponse])
    const catalogItems = useMemo(() => {
        if (catalogType === 'designs') return designs.filter((item) => item.isActive !== false).map((item) => ({ ...item, catalogType, itemId: item.id || item._id, price: item.tailoringPrice, imageUrl: item.imageUrl || item.image || item.iconUrl, category: item.garmentName || item.category || 'Design', description: item.description || 'A considered design detail for a made-to-measure garment.' }))
        if (catalogType === 'fabrics') return fabrics.filter((item) => item.isActive !== false).map((item) => ({ ...item, catalogType, itemId: item.id || item._id, price: item.price, imageUrl: item.imageUrl || item.image || item.iconUrl, category: item.category || item.color || 'Fabric', description: item.description || 'A fabric selected for its texture, drape, and finish.' }))
        return products.map((item) => ({ ...item, catalogType, itemId: item.id || item._id, price: item.basePrice, imageUrl: item.iconUrl || item.image || item.imageUrl, category: item.category || 'Tailoring', description: item.description || 'A garment tailored to your measurements and preferences.' }))
    }, [catalogType, designs, fabrics, products])
    const pageSize = 8
    const categories = useMemo(() => [...new Set(catalogItems.map((item) => item.category).filter(Boolean))].sort(), [catalogItems])
    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase()
        const minimum = minPrice === '' ? null : Number(minPrice)
        const maximum = maxPrice === '' ? null : Number(maxPrice)

        if (minimum !== null && maximum !== null && (Number.isNaN(minimum) || Number.isNaN(maximum) || minimum > maximum)) return []

        return catalogItems
            .filter((product) => {
                const name = String(product.name || '').toLowerCase()
                const productCategory = String(product.category || '').toLowerCase()
                const price = Number(product.price)
                const matchesSearch = !query || `${name} ${productCategory}`.includes(query)
                const matchesCategory = category === 'all' || product.category === category
                const matchesMinimum = minimum === null || (!Number.isNaN(price) && price >= minimum)
                const matchesMaximum = maximum === null || (!Number.isNaN(price) && price <= maximum)
                return matchesSearch && matchesCategory && matchesMinimum && matchesMaximum
            })
            .sort((left, right) => {
                if (sort === 'price-low') return Number(left.price || 0) - Number(right.price || 0)
                if (sort === 'price-high') return Number(right.price || 0) - Number(left.price || 0)
                if (sort === 'name') return String(left.name || '').localeCompare(String(right.name || ''))
                return 0
            })
    }, [catalogItems, category, maxPrice, minPrice, search, sort])
    const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
    const safePage = Math.min(page, pageCount)
    const visibleProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize)
    const hasFilters = search || category !== 'all' || minPrice || maxPrice || sort !== 'featured'
    const hasInvalidPriceRange = minPrice !== '' && maxPrice !== '' && (Number.isNaN(Number(minPrice)) || Number.isNaN(Number(maxPrice)) || Number(minPrice) > Number(maxPrice))
    const isCatalogLoading = catalogType === 'garments' ? isLoading : catalogType === 'designs' ? isLoadingDesigns : isLoadingFabrics
    const isCatalogError = catalogType === 'garments' ? isError : catalogType === 'designs' ? isDesignError : isFabricError
    const catalogTitle = catalogType === 'garments' ? 'Garments made for your proportions.' : catalogType === 'designs' ? 'Design details with a point of view.' : 'Fabrics chosen to become yours.'
    const catalogDescription = catalogType === 'garments' ? 'Start with a silhouette, then choose its fabric, design details, and measurements.' : catalogType === 'designs' ? 'Browse the details that shape a garment from familiar to unmistakably yours.' : 'Explore the cloth, texture, and color options available for your next piece.'
    const catalogLabel = catalogType === 'garments' ? 'Garments' : catalogType === 'designs' ? 'Designs' : 'Fabrics'
    const clearFilters = () => {
        setSearch('')
        setCategory('all')
        setMinPrice('')
        setMaxPrice('')
        setSort('featured')
        setPage(1)
    }

    return (
        <div className="min-h-screen bg-stone-100 text-stone-900">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">The collection / {catalogLabel}</p>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{catalogTitle}</h1>
                    <p className="mt-4 text-stone-600">{catalogDescription}</p>
                </div>
                <div className="mt-8 flex gap-2 overflow-x-auto border-b border-stone-300 pb-3">
                    {[['garments', 'Garments'], ['designs', 'Designs'], ['fabrics', 'Fabrics']].map(([value, label]) => <button key={value} type="button" onClick={() => { setCatalogType(value); setCategory('all'); setPage(1); setSelectedItem(null) }} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${catalogType === value ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-900 hover:text-stone-900'}`}>{label}</button>)}
                </div>
                <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
                        <label className="relative block">
                            <span className="sr-only">Search products</span>
                            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder={`Search ${catalogLabel.toLowerCase()}...`} className="admin-input pl-10" />
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true">⌕</span>
                        </label>
                        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }} className="admin-input" aria-label="Filter by category">
                            <option value="all">All categories</option>
                            {categories.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <input type="number" min="0" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPage(1) }} placeholder="Min price" className="admin-input min-w-0" aria-label="Minimum price" />
                            <input type="number" min="0" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPage(1) }} placeholder="Max price" className="admin-input min-w-0" aria-label="Maximum price" />
                        </div>
                        <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }} className="admin-input" aria-label="Sort products">
                            <option value="featured">Featured</option>
                            <option value="price-low">Price: low to high</option>
                            <option value="price-high">Price: high to low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                        {hasFilters ? <button type="button" onClick={clearFilters} className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-stone-900 hover:text-stone-900">Clear</button> : <span />}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-4 text-sm text-stone-500">
                        <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}</span>
                        {filteredProducts.length > 0 && <span>Showing {((safePage - 1) * pageSize) + 1}-{Math.min(safePage * pageSize, filteredProducts.length)}</span>}
                    </div>
                    {hasInvalidPriceRange && <p className="mt-3 text-sm font-medium text-red-700">Enter a minimum price that is lower than the maximum price.</p>}
                </section>
                {isCatalogLoading && <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" aria-label={`Loading ${catalogLabel.toLowerCase()}`}>
                    {Array.from({ length: pageSize }, (_, index) => <ProductSkeleton key={index} compact />)}
                </div>}
                {isCatalogError && <p className="mt-10 text-red-700">{catalogLabel} could not be loaded.</p>}
                {!isCatalogLoading && !isCatalogError && visibleProducts.length > 0 && <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                    {visibleProducts.map((product) => {
                        const imageUrl = product.imageUrl
                        const card = <div className="block text-left">
                            <div className="relative aspect-[4/5] overflow-hidden bg-stone-200">
                                {imageUrl ? <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="h-full w-full bg-stone-200" />}
                                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-600 shadow-sm backdrop-blur-sm">{product.category}</span>
                            </div>
                            <div className="p-3 sm:p-4">
                                <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-stone-400">{catalogType === 'garments' ? 'Made to measure' : catalogType === 'designs' ? 'Design detail' : 'Atelier cloth'}</p>
                                <div className="mt-1 flex items-start justify-between gap-2">
                                    <h2 className="min-w-0 truncate text-sm font-semibold text-stone-900 sm:text-base">{product.name || 'Signature piece'}</h2>
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stone-200 text-xs text-stone-500 transition group-hover:border-stone-900 group-hover:bg-stone-900 group-hover:text-white" aria-hidden="true">↗</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-xs">
                                    <span className="font-medium uppercase tracking-[0.12em] text-stone-500">{catalogType === 'garments' ? 'View piece' : 'View details'}</span>
                                    <span className="font-semibold text-stone-700">{product.price != null ? `$${product.price}` : 'Custom'}</span>
                                </div>
                            </div>
                        </div>
                        return <article key={`${catalogType}-${product.itemId}`} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/60">
                            {catalogType === 'garments' ? <Link to={`/products/${product.itemId}`}>{card}</Link> : <button type="button" onClick={() => setSelectedItem(product)} className="block w-full">{card}</button>}
                        </article>
                    })}
                </div>}
                {!isCatalogLoading && !isCatalogError && visibleProducts.length === 0 && <div className="mt-10 rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center"><p className="text-lg font-semibold text-stone-900">No {catalogLabel.toLowerCase()} match your search.</p><p className="mt-2 text-sm text-stone-500">Try a different category or price range.</p><button type="button" onClick={clearFilters} className="mt-5 text-sm font-semibold text-stone-800 underline underline-offset-4">Clear filters</button></div>}
                {!isCatalogLoading && !isCatalogError && pageCount > 1 && <nav className="mt-10 flex items-center justify-center gap-2" aria-label={`${catalogLabel} pages`}>
                    <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1} className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-600 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                    {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button key={pageNumber} type="button" onClick={() => setPage(pageNumber)} className={`h-9 w-9 rounded-xl text-sm font-medium ${safePage === pageNumber ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-600 hover:bg-stone-50'}`}>{pageNumber}</button>)}
                    <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={safePage === pageCount} className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-600 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                </nav>}
            </main>
            {selectedItem && <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedItem(null) }}>
                <section role="dialog" aria-modal="true" aria-labelledby="catalog-item-title" className="grid max-h-[min(720px,calc(100vh-2rem))] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl sm:grid-cols-2">
                    <div className="min-h-72 bg-stone-200">{selectedItem.imageUrl ? <img src={selectedItem.imageUrl} alt={selectedItem.name} className="h-full min-h-72 w-full object-cover" /> : <div className="h-full min-h-72 bg-stone-200" />}</div>
                    <div className="p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.25em] text-stone-500">{catalogType === 'designs' ? 'Design detail' : 'Fabric detail'}</p><h2 id="catalog-item-title" className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">{selectedItem.name}</h2></div><button type="button" aria-label="Close details" onClick={() => setSelectedItem(null)} className="rounded-full border border-stone-200 px-3 py-1 text-lg leading-none text-stone-600 hover:border-stone-900 hover:text-stone-900">&times;</button></div><p className="mt-5 text-2xl font-semibold text-stone-900">{selectedItem.price != null ? `$${selectedItem.price}` : 'Custom pricing'}</p><div className="mt-6 border-y border-stone-200 py-5"><p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">{catalogType === 'designs' ? 'Works with' : 'Category'}</p><p className="mt-2 font-medium text-stone-900">{selectedItem.category}</p></div><p className="mt-6 text-sm leading-7 text-stone-600">{selectedItem.description}</p><button type="button" onClick={() => setSelectedItem(null)} className="mt-8 w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-700">Close details</button></div>
                </section>
            </div>}
            <BottomNavbar />
        </div>
    )
}

export default ProductsPage
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useGetAdminOrdersQuery } from '../../features/orders/orderApi'
import { useGetDesignsQuery } from '../../features/designs/designApi'
import { useGetFabricsQuery } from '../../features/fabrics/fabricApi'
import { useGetGarmentsQuery } from '../../features/products/productApi'

const links = [
    { label: 'Overview', to: '/admin' },
    { label: 'Garments', to: '/admin/garments' },
    { label: 'Designs', to: '/admin/designs' },
    { label: 'Fabrics', to: '/admin/fabrics' },
    { label: 'Orders', to: '/admin/orders' },
]

export default function AdminShell({ children, title, eyebrow }) {
    const location = useLocation()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const { data: garments = [] } = useGetGarmentsQuery()
    const { data: designs = [] } = useGetDesignsQuery()
    const { data: fabrics = [] } = useGetFabricsQuery()
    const { data: orderResponse = [] } = useGetAdminOrdersQuery()
    const results = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return []
        const orders = Array.isArray(orderResponse) ? orderResponse : orderResponse.items || orderResponse.orders || []
        const matches = [
            ...garments.map((item) => ({ label: String(item.name || ''), type: 'Garment', to: '/admin/garments' })),
            ...designs.map((item) => ({ label: String(item.name || ''), type: 'Design', to: '/admin/designs' })),
            ...fabrics.map((item) => ({ label: String(item.name || ''), type: 'Fabric', to: '/admin/fabrics' })),
            ...orders.flatMap((item) => {
                const orderLabel = `Order #${item.orderNumber || item.id || item.orderId}`
                const customer = item.customer || item.user || {}
                return [
                    { label: orderLabel, type: 'Order', to: '/admin/orders' },
                    { label: String(customer.email || ''), type: 'Customer email', to: '/admin/orders' },
                    { label: String(item.garment?.name || item.garmentName || ''), type: 'Order garment', to: '/admin/orders' },
                    { label: String(item.design?.name || item.designName || ''), type: 'Order design', to: '/admin/orders' },
                    { label: String(item.fabric?.name || item.fabricName || ''), type: 'Order fabric', to: '/admin/orders' },
                ]
            }),
        ]
        return matches.filter((item) => item.label.toLowerCase().includes(query)).slice(0, 8)
    }, [designs, fabrics, garments, orderResponse, search])

    return (
        <div className="min-h-screen bg-[#f5f1ec] text-stone-900">
            <div className="mx-auto flex min-h-screen max-w-[1600px]">
                <aside className="hidden w-64 shrink-0 bg-[#1a1a1a] p-6 text-white lg:block">
                    <Link to="/admin" className="block border-b border-white/10 pb-8">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400">Atelier Rouge</p>
                        <p className="mt-2 text-xl font-semibold">Admin studio</p>
                    </Link>
                    <nav className="mt-8 space-y-2">
                        {links.map((link) => {
                            const active = location.pathname === link.to
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? 'bg-white text-stone-900' : 'text-stone-300 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {link.label}
                                </Link>
                            )
                        })}
                    </nav>
                </aside>
                <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
                    <nav className="mb-6 flex gap-2 overflow-x-auto rounded-2xl bg-[#1a1a1a] p-2 lg:hidden">
                        {links.map((link) => {
                            const active = location.pathname === link.to
                            return <Link key={link.to} to={link.to} className={`shrink-0 rounded-xl px-3 py-2 text-sm font-medium ${active ? 'bg-white text-stone-900' : 'text-stone-300'}`}>{link.label}</Link>
                        })}
                    </nav>
                    <header className="mb-8 border-b border-stone-200 pb-6">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.35em] text-stone-500">{eyebrow || 'Admin workspace'}</p>
                                <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
                            </div>
                            <div className="relative w-full xl:max-w-md">
                                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search garments, designs, fabrics, orders" className="admin-input" />
                                {results.length > 0 && <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">{results.map((result, index) => <button key={`${result.type}-${result.label}-${index}`} type="button" onClick={() => { navigate(result.to); setSearch('') }} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-stone-50"><span>{result.label}</span><span className="text-xs uppercase tracking-[0.15em] text-stone-400">{result.type}</span></button>)}</div>}
                            </div>
                        </div>
                    </header>
                    {children}
                </main>
            </div>
        </div>
    )
}

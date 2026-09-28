import { Link, useLocation } from 'react-router-dom'

const links = [
    { label: 'Home', to: '/' },
    { label: 'Collection', to: '/products' },
    { label: 'Cart', to: '/cart' },
]

function BottomNavbar() {
    const location = useLocation()

    return (
        <footer className="border-t border-stone-300 bg-[#e9e3db]">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <Link to="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-900">Atelier Rouge</Link>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">Thoughtful tailoring, considered fabrics, and pieces made to become part of your everyday.</p>
                </div>
                <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">
                    {links.map((link) => {
                        const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)
                        return <Link key={link.to} to={link.to} className={`text-xs font-semibold uppercase tracking-[0.18em] transition ${isActive ? 'text-stone-950' : 'text-stone-500 hover:text-stone-950'}`}>{link.label}</Link>
                    })}
                    <Link to="/login" className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 transition hover:text-stone-950">Account</Link>
                </nav>
            </div>
            <div className="border-t border-stone-300 px-4 py-4 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-stone-500 sm:px-6">Made with precision · Atelier Rouge</div>
        </footer>
    )
}

export default BottomNavbar
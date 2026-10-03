import { Link, useLocation } from 'react-router-dom'
import footerImage from '../../src/assets/footer.png'

const links = [
    { label: 'Home', to: '/' },
    { label: 'Collection', to: '/products' },
    { label: 'Cart', to: '/cart' },
]

function BottomNavbar() {
    const location = useLocation()

    return (
        <footer
            className="relative overflow-hidden border-t border-[#8f3040] bg-[#641d2b] bg-cover bg-center bg-no-repeat text-[#f5e9dc]"
            style={{ backgroundImage: `url(${footerImage})` }}
        >
            <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:flex-row lg:items-start lg:justify-between ">
                <div className="max-w-md">
                    <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e8b5a9]">Made with intention</p>
                    <Link to="/" className="text-2xl font-semibold tracking-tight text-[#fff8ef] sm:text-3xl">Atelier Rouge</Link>
                    <p className="mt-4 text-sm leading-6 text-[#ead3ca]">Thoughtful tailoring, considered fabrics, and pieces made to become part of your everyday.</p>
                </div>
                <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 lg:justify-end">
                    {links.map((link) => {
                        const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)
                        return <Link key={link.to} to={link.to} className={`text-xs font-semibold uppercase tracking-[0.18em] transition ${isActive ? 'text-[#fff8ef]' : 'text-[#d8aaa0] hover:text-[#fff8ef]'}`}>{link.label}</Link>
                    })}
                    <Link to="/login" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8aaa0] transition hover:text-[#fff8ef]">Account</Link>
                </nav>
            </div>
            <div className="absolute inset-x-0 bottom-0 z-10 border-t border-[#a14a59]/60 px-4 py-4 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-[#d8aaa0] sm:px-6">Made with precision · Atelier Rouge</div>
        </footer>
    )
}

export default BottomNavbar
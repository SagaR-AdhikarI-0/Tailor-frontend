import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, selectIsAuthenticated, selectUser } from '../../src/features/auth/authSlice'

const navItems = ['Home', 'Suits', 'Couture', 'Atelier', 'Capsule', 'Salon']

function Navbar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const user = useSelector(selectUser)

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    return (
        <header className="border-b border-stone-200 bg-[#f8f3ee]/90 backdrop-blur-md">
            <nav
                aria-label="Main Navigation"
                className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
            >
                <a href="#" className="flex items-center gap-3" aria-label="Atelier Rouge home">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-900/20 bg-white shadow-sm">
                        <span className="text-sm font-semibold tracking-[0.2em] text-stone-900">AR</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-stone-500">Bespoke</p>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-900">Atelier Rouge</p>
                    </div>
                </a>

                <div className="hidden items-center gap-1 rounded-full border border-stone-200 bg-white/80 p-1.5 shadow-sm md:flex">
                    {navItems.map((item) => (
                        <a
                            key={item}
                            href="#"
                            className="rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-stone-600 hover:bg-stone-900 hover:text-white"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Search"
                        className="hidden rounded-full border border-stone-200 bg-white p-2 text-stone-700 hover:border-stone-900 hover:text-stone-900 sm:inline-flex"
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="11" cy="11" r="5.5" />
                            <path d="M16 16L21 21" strokeLinecap="round" />
                        </svg>
                    </button>

                    {isAuthenticated ? (
                        <>
                            <button type="button" onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/user')} className="hidden text-sm font-medium text-stone-700 hover:text-stone-900 sm:inline-block">
                                Dashboard
                            </button>
                            <button type="button" onClick={handleLogout} className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-700 hover:border-stone-900 hover:text-stone-900">
                                Logout
                            </button>
                        </>
                    ) : (
                        <button type="button" onClick={() => navigate('/login')} className="hidden text-sm font-medium text-stone-700 hover:text-stone-900 sm:inline-block">
                            Login
                        </button>
                    )}

                    <button
                        type="button"
                        className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm hover:bg-stone-700"
                    >
                        Book fitting
                    </button>

                    <button
                        type="button"
                        aria-label="Open menu"
                        className="inline-flex rounded-full border border-stone-200 bg-white p-2 text-stone-700 md:hidden"
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 7H20M4 12H20M4 17H20" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </nav>
        </header>
    )
}

export default Navbar
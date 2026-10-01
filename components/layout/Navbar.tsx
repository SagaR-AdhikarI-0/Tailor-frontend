import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { logout, selectIsAuthenticated, selectUser } from '../../src/features/auth/authSlice'

function Navbar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const user = useSelector(selectUser)
    const location = useLocation()
    const [profileOpen, setProfileOpen] = useState(false)
    const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.email?.toLowerCase().includes('admin')

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    return (
        <header className="bg-[#f4efe9] pt-3 sm:pt-5">
            <nav
                aria-label="Main Navigation"
                className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
            >
                <Link to="/" className="flex items-center gap-3" aria-label="Atelier Rouge home">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-900/20 bg-white shadow-sm">
                        <span className="text-sm font-semibold tracking-[0.2em] text-stone-900">AR</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-stone-500">Bespoke</p>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-900">Atelier Rouge</p>
                    </div>
                </Link>

                <div className="hidden items-center gap-1 rounded-full border border-stone-200 bg-white/80 p-1.5 shadow-sm md:flex">
                    <Link to="/" className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] ${location.pathname === '/' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-900 hover:text-white'}`}>Home</Link>
                    <Link to="/products" className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] ${location.pathname.startsWith('/products') ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-900 hover:text-white'}`}>Products</Link>
                    <Link to="/cart" className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] ${location.pathname === '/cart' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-900 hover:text-white'}`}>Cart</Link>
                    {isAdmin && <Link to="/admin" className="rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-stone-600 hover:bg-stone-900 hover:text-white">Admin</Link>}
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
                            <div className="relative">
                                <button type="button" aria-label="Open profile" onClick={() => setProfileOpen((open) => !open)} className="rounded-full border border-stone-200 bg-white p-2 text-stone-700 hover:border-stone-900 hover:text-stone-900">
                                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5" strokeLinecap="round" /></svg>
                                </button>
                                {profileOpen && <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-xl">
                                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Your profile</p>
                                    <p className="mt-3 font-semibold text-stone-900">{user?.name || 'Tailor customer'}</p>
                                    <p className="mt-1 break-words text-sm text-stone-500">{user?.email || 'No email available'}</p>
                                    <p className="mt-3 text-xs capitalize text-stone-500">{user?.role || 'user'}</p>
                                    {isAdmin && <button type="button" onClick={() => { setProfileOpen(false); navigate('/admin') }} className="mt-4 w-full rounded-xl bg-stone-100 px-3 py-2 text-sm font-medium text-stone-800">Open admin</button>}
                                </div>}
                            </div>
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

                    <button type="button" onClick={() => navigate('/products')}
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
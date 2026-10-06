import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser } from '../../features/auth/authSlice'
import { adminLinks } from './adminLinks'
import tailorLogo from '../../assets/tailor-logo.png'

export default function AdminSidebar() {
    const location = useLocation()
    const user = useSelector(selectUser)

    return (
        <aside className="hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-stone-200 bg-white p-6 text-stone-900 lg:sticky lg:top-0 lg:block">
            <Link to="/admin" aria-label="Atelier Rouge admin dashboard" className="mb-10 inline-flex">
                <img src={tailorLogo} alt="Atelier Rouge" className="h-16 w-auto max-w-[210px] object-contain" />
            </Link>
            <nav className="space-y-2">
                {adminLinks.map((link) => {
                    const active = location.pathname === link.to
                    return (
                        <Link key={link.to} to={link.to} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}>
                            <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-base ${active ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-500'}`} aria-hidden="true">{link.icon}</span>
                            <span>{link.label}</span>
                        </Link>
                    )
                })}
            </nav>
            <div className="mt-10 rounded-3xl bg-stone-100 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Signed in</p>
                <p className="mt-2 text-lg font-semibold text-stone-900">{user?.name || 'Admin user'}</p>
                <p className="mt-1 text-sm text-stone-600">{user?.email || 'admin@atelier.com'}</p>
            </div>
        </aside>
    )
}

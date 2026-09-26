import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser } from '../../features/auth/authSlice'
import { adminLinks } from './adminLinks'

export default function AdminSidebar() {
    const location = useLocation()
    const user = useSelector(selectUser)

    return (
        <aside className="hidden w-72 shrink-0 border-r border-stone-200 bg-[#1a1a1a] p-6 text-white lg:block">
            <Link to="/admin" className="mb-10 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold tracking-[0.2em] text-stone-100">AR</div>
                <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-stone-300">Admin</p>
                    <p className="text-lg font-semibold">Atelier Rouge</p>
                </div>
            </Link>
            <nav className="space-y-2">
                {adminLinks.map((link, index) => {
                    const active = location.pathname === link.to
                    return (
                        <Link key={link.to} to={link.to} className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? 'bg-white text-stone-900' : 'text-stone-200 hover:bg-white/5'}`}>
                            <span>{link.label}</span>
                            <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${active ? 'bg-stone-100 text-stone-600' : 'bg-white/10 text-stone-300'}`}>{index + 1}</span>
                        </Link>
                    )
                })}
            </nav>
            <div className="mt-10 rounded-3xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-stone-400">Signed in</p>
                <p className="mt-2 text-lg font-semibold">{user?.name || 'Admin user'}</p>
                <p className="mt-1 text-sm text-stone-300">{user?.email || 'admin@atelier.com'}</p>
            </div>
        </aside>
    )
}

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { setCredentials, selectIsAuthenticated, selectUser } from '../features/auth/authSlice'
import { loginUser } from '../features/auth/authService'

function LoginPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const user = useSelector(selectUser)

    const [form, setForm] = useState({
        email: 'admin@tailor.com',
        password: '123456',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isAuthenticated && user) {
            const redirectTo = location.state?.from || (user.role === 'admin' ? '/admin' : '/user')
            navigate(redirectTo, { replace: true })
        }
    }, [isAuthenticated, user, location.state, navigate])

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError('')

        try {
            const result = await loginUser({
                email: form.email,
                password: form.password,
            })

            dispatch(
                setCredentials({
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                }),
            )
        } catch (loginError) {
            setError(loginError.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-stone-100 p-4">
            <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50">
                <div className="mb-8 text-center">
                    <p className="text-xs font-medium uppercase tracking-[0.35em] text-stone-500">Tailor access</p>
                    <h1 className="mt-4 text-3xl font-semibold text-stone-900">Welcome back</h1>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-stone-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none ring-0 transition focus:border-stone-900"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-stone-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none ring-0 transition focus:border-stone-900"
                            placeholder="••••••••"
                        />
                    </div>

                    {error ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Signing in...' : 'Continue'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-stone-600">
                    Need an account?{' '}
                    <Link to="/signup" className="font-medium text-stone-900 underline underline-offset-4">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage

import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import { useInitiatePaymentMutation } from '../features/orders/orderApi'
import { getPendingEsewaPayment, savePendingEsewaPayment, submitEsewaForm } from '../utils/payment'

const errorMessage = (error) => error?.data?.message || error?.error || error?.message || 'Unable to retry payment.'

function PaymentFailurePage() {
    const [searchParams] = useSearchParams()
    const status = searchParams.get('status') || 'failed'
    const [initiatePayment] = useInitiatePaymentMutation()
    const [message, setMessage] = useState('')
    const [retrying, setRetrying] = useState(false)
    const retryStarted = useRef(false)
    const pendingPayment = getPendingEsewaPayment()
    const orderId = searchParams.get('orderId') || pendingPayment?.orderId
    const reason = searchParams.get('message')

    const retry = async () => {
        if (!orderId || retryStarted.current) return
        retryStarted.current = true
        setRetrying(true)
        setMessage('Preparing your eSewa payment...')
        try {
            const payment = await initiatePayment({ orderId: Number(orderId), paymentMethod: 'ESewa' }).unwrap()
            savePendingEsewaPayment({ orderId: Number(orderId), transactionReference: payment.payment?.transactionReference })
            submitEsewaForm(payment)
        } catch (error) {
            retryStarted.current = false
            setRetrying(false)
            setMessage(errorMessage(error))
        }
    }

    return <div className="min-h-screen bg-stone-100 text-stone-900">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            <section className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-600">Payment not completed</p>
                <h1 className="mt-4 text-3xl font-semibold">Your eSewa payment failed</h1>
                <p className="mt-4 text-stone-600">{reason || `The payment was ${status}. No payment was taken. Your order remains unpaid.`}</p>
                {orderId && <p className="mt-4 text-sm text-stone-500">Order #{orderId}</p>}
                {message && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}
                {orderId ? <button type="button" onClick={retry} disabled={retrying} className="mt-8 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{retrying ? 'Preparing eSewa...' : 'Try again'}</button> : <Link to="/checkout" className="mt-8 inline-block rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Return to checkout</Link>}
            </section>
        </main>
    </div>
}

export default PaymentFailurePage

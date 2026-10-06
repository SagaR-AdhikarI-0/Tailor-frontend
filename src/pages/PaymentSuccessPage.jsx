import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import { useGetOrderQuery, useVerifyPaymentMutation } from '../features/orders/orderApi'
import { clearPendingEsewaPayment, getPendingEsewaPayment } from '../utils/payment'

const errorMessage = (error) => error?.data?.message || error?.error || error?.message || 'Unable to load payment status.'
const getOrderNumber = (order) => order?.orderNumber || order?.number || `Order #${order?.id || order?.orderId || ''}`
const getAmount = (order) => Number(order?.totalAmount ?? order?.total ?? order?.amount ?? order?.payment?.amount ?? 0)

function PaymentSuccessPage() {
    const [searchParams] = useSearchParams()
    const status = searchParams.get('status')
    const orderId = searchParams.get('orderId')
    const [verifyPayment] = useVerifyPaymentMutation()
    const [verificationMessage, setVerificationMessage] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const verificationStarted = useRef(false)
    const pendingPayment = getPendingEsewaPayment()
    const { data: response, error, isLoading, isFetching, refetch } = useGetOrderQuery(orderId, { skip: !orderId })
    const order = response?.order || response

    useEffect(() => {
        if (!orderId || !order || order.paymentStatus === 'Paid' || verificationStarted.current) return
        const transactionReference = pendingPayment?.orderId === Number(orderId) ? pendingPayment.transactionReference : null
        if (!transactionReference) return

        verificationStarted.current = true
        Promise.resolve().then(() => setIsVerifying(true))
        verifyPayment({
            orderId: Number(orderId),
            transactionReference,
            paymentMethod: 'ESewa',
        }).unwrap().then(async () => {
            await refetch()
            setIsVerifying(false)
        }).catch((verificationError) => {
            verificationStarted.current = false
            setIsVerifying(false)
            setVerificationMessage(errorMessage(verificationError))
        })
    }, [order, orderId, pendingPayment, refetch, verifyPayment])

    const paid = order?.paymentStatus === 'Paid'
    const checking = isLoading || isFetching || isVerifying

    useEffect(() => {
        if (paid) clearPendingEsewaPayment()
    }, [paid])

    return <div className="min-h-screen bg-stone-100 text-stone-900">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            <section className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">Payment confirmation</p>
                {!orderId ? <h1 className="mt-4 text-3xl font-semibold">Order information is missing</h1> : error ? <><h1 className="mt-4 text-3xl font-semibold">We could not load your order</h1><p className="mt-4 text-sm text-red-700">{errorMessage(error)}</p></> : checking ? <><h1 className="mt-4 text-3xl font-semibold">Checking your payment...</h1><p className="mt-4 text-stone-600">{verificationMessage || 'Please wait while we confirm the payment with the backend.'}</p></> : paid ? <><h1 className="mt-4 text-3xl font-semibold">Payment successful</h1><p className="mt-4 text-stone-600">Thank you. Your payment has been confirmed by Atelier.</p><div className="mt-8 rounded-2xl bg-stone-50 p-5 text-left text-sm"><p><span className="text-stone-500">Order:</span> {getOrderNumber(order)}</p><p className="mt-2"><span className="text-stone-500">Amount:</span> Rs {getAmount(order).toFixed(2)}</p><p className="mt-2"><span className="text-stone-500">Payment:</span> Paid</p></div><Link to={`/orders/${orderId}`} className="mt-8 inline-block rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">View order details</Link></> : <><h1 className="mt-4 text-3xl font-semibold">Payment is still pending</h1><p className="mt-4 text-stone-600">We could not confirm payment yet. You can try the payment again without creating another order.</p><Link to={`/payment/failure?status=pending&orderId=${orderId}`} className="mt-8 inline-block rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Try again</Link></>}
                {paid && <p className="mt-4 text-xs uppercase tracking-[0.16em] text-stone-500">Gateway status: {status || 'success'}</p>}
            </section>
        </main>
    </div>
}

export default PaymentSuccessPage

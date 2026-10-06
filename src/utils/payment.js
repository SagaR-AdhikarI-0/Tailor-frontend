const PENDING_PAYMENT_KEY = 'tailor_pending_esewa_payment'

export const savePendingEsewaPayment = (payment) => {
    if (typeof window === 'undefined') return
    window.sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payment))
}

export const getPendingEsewaPayment = () => {
    if (typeof window === 'undefined') return null
    try {
        const value = window.sessionStorage.getItem(PENDING_PAYMENT_KEY)
        return value ? JSON.parse(value) : null
    } catch {
        return null
    }
}

export const clearPendingEsewaPayment = () => {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(PENDING_PAYMENT_KEY)
}

export const submitEsewaForm = (payment) => {
    if (!payment?.paymentUrl || !payment.formFields || Object.keys(payment.formFields).length === 0) {
        throw new Error('The payment gateway response was incomplete.')
    }

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = payment.paymentUrl
    Object.entries(payment.formFields).forEach(([name, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = name
        input.value = String(value)
        form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
}

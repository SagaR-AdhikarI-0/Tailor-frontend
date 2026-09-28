const getCartKey = (user) => `tailor_cart_${user?.id || user?._id || user?.email || 'guest'}`

export const getLocalCart = (user) => {
    if (typeof window === 'undefined') return []
    try {
        const stored = window.localStorage.getItem(getCartKey(user))
        const parsed = stored ? JSON.parse(stored) : []
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export const saveLocalCart = (user, items) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(getCartKey(user), JSON.stringify(items))
    window.dispatchEvent(new CustomEvent('tailor-cart-updated'))
}

export const addLocalCartItem = (user, item) => {
    const currentItems = getLocalCart(user)
    const itemKey = `${item.garmentId}-${item.designId || 'default'}-${item.fabricId || 'default'}-${item.measurementSnapshot || ''}-${item.customizationDetails || ''}`
    const existingIndex = currentItems.findIndex((currentItem) => currentItem.itemKey === itemKey)
    const nextItems = [...currentItems]

    if (existingIndex >= 0) {
        nextItems[existingIndex] = { ...nextItems[existingIndex], quantity: Number(nextItems[existingIndex].quantity || 1) + Number(item.quantity || 1) }
    } else {
        nextItems.push({ ...item, itemKey })
    }

    saveLocalCart(user, nextItems)
    return nextItems
}
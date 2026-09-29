const getCartKey = (user) => `tailor_cart_${user?.id || user?._id || user?.email || 'guest'}`

export const getLocalCart = (user) => {
    if (typeof window === 'undefined') return []
    try {
        const userKey = getCartKey(user)
        const stored = window.localStorage.getItem(userKey)
        let parsed = stored ? JSON.parse(stored) : []
        if (!Array.isArray(parsed)) parsed = []

        if (user && userKey !== 'tailor_cart_guest') {
            const guestStored = window.localStorage.getItem('tailor_cart_guest')
            const guestParsed = guestStored ? JSON.parse(guestStored) : []
            if (Array.isArray(guestParsed) && guestParsed.length > 0) {
                for (const gItem of guestParsed) {
                    const existingIndex = parsed.findIndex((i) => i.itemKey === gItem.itemKey)
                    if (existingIndex >= 0) {
                        parsed[existingIndex] = {
                            ...parsed[existingIndex],
                            quantity: Number(parsed[existingIndex].quantity || 1) + Number(gItem.quantity || 1),
                        }
                    } else {
                        parsed.push(gItem)
                    }
                }
                window.localStorage.setItem(userKey, JSON.stringify(parsed))
                window.localStorage.removeItem('tailor_cart_guest')
            }
        }

        return parsed
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
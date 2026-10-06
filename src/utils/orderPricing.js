const DELIVERY_FEE = 100

const toAmount = (value) => {
    const amount = Number(value ?? 0)
    return Number.isFinite(amount) ? amount : 0
}

export const getOrderItemPricing = (item) => {
    const fabricQuantity = toAmount(item.fabricQuantity ?? item.quantity) || 1
    const garmentPrice = toAmount(item.garment?.basePrice ?? item.product?.basePrice ?? item.garmentBasePrice)
    const designPrice = toAmount(item.design?.tailoringPrice ?? item.designPrice)
    const fabricUnitPrice = toAmount(item.fabric?.price ?? item.fabricPrice)
    const fabricTotal = fabricUnitPrice * fabricQuantity

    return {
        garmentPrice,
        designPrice,
        fabricUnitPrice,
        fabricQuantity,
        fabricTotal,
        deliveryFee: DELIVERY_FEE,
        total: garmentPrice + designPrice + fabricTotal + DELIVERY_FEE,
    }
}

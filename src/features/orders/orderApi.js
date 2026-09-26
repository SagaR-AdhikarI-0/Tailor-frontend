import { baseApi } from '../../app/baseApi'

export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMyCart: builder.query({
            query: () => ({
                url: '/cart',
                method: 'GET',
                requireAuth: true,
            }),
            providesTags: ['Cart'],
        }),
        addToCart: builder.mutation({
            query: (payload) => ({
                url: '/cart',
                method: 'POST',
                body: payload,
                requireAuth: true,
            }),
            invalidatesTags: ['Cart'],
        }),
        getMyOrders: builder.query({
            query: () => ({
                url: '/orders',
                method: 'GET',
                requireAuth: true,
            }),
            providesTags: ['Orders'],
        }),
        getAdminOrders: builder.query({
            query: () => ({
                url: '/orders',
                method: 'GET',
                requireAuth: true,
            }),
            providesTags: ['Orders'],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/orders/${id}/status`,
                method: 'PATCH',
                body: { status },
                requireAuth: true,
            }),
            invalidatesTags: ['Orders'],
        }),
        placeOrder: builder.mutation({
            query: (payload) => ({
                url: '/orders',
                method: 'POST',
                body: payload,
                requireAuth: true,
            }),
            invalidatesTags: ['Orders', 'Cart'],
        }),
    }),
})

export const {
    useGetMyCartQuery,
    useAddToCartMutation,
    useGetMyOrdersQuery,
    useGetAdminOrdersQuery,
    useUpdateOrderStatusMutation,
    usePlaceOrderMutation,
} = orderApi

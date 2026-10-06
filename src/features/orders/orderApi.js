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
                url: '/order',
                method: 'GET',
                requireAuth: true,
            }),
            providesTags: ['Orders'],
        }),
        getOrder: builder.query({
            query: (id) => ({
                url: `/order/${id}`,
                method: 'GET',
                requireAuth: true,
            }),
            providesTags: ['Orders'],
        }),
        getAdminOrders: builder.query({
            query: () => ({
                url: '/admin/order',
                method: 'GET',
                requireAuth: true,
            }),
            providesTags: ['Orders'],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/admin/order/${id}/status`,
                method: 'PATCH',
                body: { status },
                requireAuth: true,
            }),
            invalidatesTags: ['Orders'],
        }),
        placeOrder: builder.mutation({
            query: (payload) => ({
                url: '/order',
                method: 'POST',
                body: payload,
                requireAuth: true,
            }),
            invalidatesTags: ['Orders', 'Cart'],
        }),
        createOrder: builder.mutation({
            query: (payload) => ({
                url: '/order',
                method: 'POST',
                body: payload,
                requireAuth: true,
            }),
            invalidatesTags: ['Orders'],
        }),
        initiatePayment: builder.mutation({
            query: (payload) => ({
                url: '/payment/initiate',
                method: 'POST',
                body: payload,
                requireAuth: true,
            }),
        }),
        verifyPayment: builder.mutation({
            query: (payload) => ({
                url: '/payment/verify',
                method: 'POST',
                body: payload,
                requireAuth: true,
            }),
            invalidatesTags: ['Orders'],
        }),
    }),
})

export const {
    useGetMyCartQuery,
    useAddToCartMutation,
    useGetMyOrdersQuery,
    useGetOrderQuery,
    useGetAdminOrdersQuery,
    useUpdateOrderStatusMutation,
    usePlaceOrderMutation,
    useCreateOrderMutation,
    useInitiatePaymentMutation,
    useVerifyPaymentMutation,
} = orderApi

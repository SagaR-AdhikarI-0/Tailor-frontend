import { baseApi } from '../../app/baseApi'

export const productApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: (options = {}) => {
                const { page, limit } = options
                return {
                    url: '/garment',
                    method: 'GET',
                    ...(page != null || limit != null ? { params: { page, limit } } : {}),
                    requireAuth: false,
                }
            },
            providesTags: ['Garment'],
        }),
        getGarments: builder.query({
            query: () => ({
                url: '/garment',
                method: 'GET',
                requireAuth: false,
            }),
            providesTags: ['Garment'],
        }),
        getProductById: builder.query({
            query: (productId) => ({
                url: `/garment/${productId}`,
                method: 'GET',
                requireAuth: false,
            }),
        }),
        getGarmentById: builder.query({
            query: (productId) => ({
                url: `/garment/${productId}`,
                method: 'GET',
                requireAuth: false,
            }),
        }),
        createGarment: builder.mutation({
            query: (body) => ({
                url: '/garment',
                method: 'POST',
                body,
                requireAuth: true,
            }),
            invalidatesTags: ['Garment'],
        }),
        updateGarment: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/garment/${id}`,
                method: 'PUT',
                body,
                requireAuth: true,
            }),
            invalidatesTags: ['Garment'],
        }),
        deleteGarment: builder.mutation({
            query: (id) => ({
                url: `/garment/${id}`,
                method: 'DELETE',
                requireAuth: true,
            }),
            invalidatesTags: ['Garment'],
        }),
    }),
})

export const {
    useGetProductsQuery,
    useGetGarmentsQuery,
    useGetProductByIdQuery,
    useGetGarmentByIdQuery,
    useCreateGarmentMutation,
    useUpdateGarmentMutation,
    useDeleteGarmentMutation,
} = productApi

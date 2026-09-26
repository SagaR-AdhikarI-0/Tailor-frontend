import { baseApi } from '../../app/baseApi'

export const fabricApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFabrics: builder.query({
            query: () => ({ url: '/fabric', method: 'GET', requireAuth: false }),
            providesTags: ['Fabric'],
        }),
        createFabric: builder.mutation({
            query: (body) => ({ url: '/fabric', method: 'POST', body, requireAuth: true }),
            invalidatesTags: ['Fabric'],
        }),
        updateFabric: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/fabric/${id}`, method: 'PUT', body, requireAuth: true }),
            invalidatesTags: ['Fabric'],
        }),
        deleteFabric: builder.mutation({
            query: (id) => ({ url: `/fabric/${id}`, method: 'DELETE', requireAuth: true }),
            invalidatesTags: ['Fabric'],
        }),
    }),
})

export const {
    useGetFabricsQuery,
    useCreateFabricMutation,
    useUpdateFabricMutation,
    useDeleteFabricMutation,
} = fabricApi

import { baseApi } from '../../app/baseApi'

export const designApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDesigns: builder.query({
            query: () => ({ url: '/design', method: 'GET', requireAuth: false }),
            providesTags: ['Design'],
        }),
        createDesign: builder.mutation({
            query: (body) => ({ url: '/design', method: 'POST', body, requireAuth: true }),
            invalidatesTags: ['Design'],
        }),
        updateDesign: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/design/${id}`, method: 'PUT', body, requireAuth: true }),
            invalidatesTags: ['Design'],
        }),
        deleteDesign: builder.mutation({
            query: (id) => ({ url: `/design/${id}`, method: 'DELETE', requireAuth: true }),
            invalidatesTags: ['Design'],
        }),
    }),
})

export const {
    useGetDesignsQuery,
    useCreateDesignMutation,
    useUpdateDesignMutation,
    useDeleteDesignMutation,
} = designApi

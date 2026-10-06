import { baseApi } from '../../app/baseApi'

export const measurementApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createMeasurementProfile: builder.mutation({
            query: (body) => ({
                url: '/measurementprofile',
                method: 'POST',
                body,
                requireAuth: true,
            }),
        }),
    }),
})

export const { useCreateMeasurementProfileMutation } = measurementApi
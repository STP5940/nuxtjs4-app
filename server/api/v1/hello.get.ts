// server/api/v1/hello.get.ts

import { useResponseHandler } from '~~/server/composables/useResponseHandler';

export default defineEventHandler(async (event) => {
    const { responseSuccess } = useResponseHandler(event);
    // return { message: 'Hello from API!' }
    return responseSuccess({ greeting: 'Hello from API!' }, 'Greeting retrieved successfully');
})
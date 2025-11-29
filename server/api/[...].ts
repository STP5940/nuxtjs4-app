// server/api/[...].ts
export default defineEventHandler(async (event) => {
    setResponseStatus(event, 401);
    return {
        error: true,
        url: getRequestURL(event).href,
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'The requested API endpoint does not exist',
    };
})
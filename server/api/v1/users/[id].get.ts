// server/api/v1/users/[id].get.ts
export default defineEventHandler(async (event) => {
    const userId = getRouterParam(event, 'id');
    console.log(userId);
    return {
        api: 'get user by id',
    }
});
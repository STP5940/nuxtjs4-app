export default defineNuxtRouteMiddleware((to, from) => {
    console.log("This is my global middleware!");

    const token = useCookie('authToken');
    console.log(token.value);
    if (!token.value && to.path !== '/login') {
        return navigateTo('/login');
    }
    
    //   if (to.params.id === '1') {
    //     return abortNavigation()
    //   }
    //   // In a real app you would probably not redirect every route to `/`
    //   // however it is important to check `to.path` before redirecting or you
    //   // might get an infinite redirect loop
    //   if (to.path !== '/') {
    //     return navigateTo('/')
    //   }
})

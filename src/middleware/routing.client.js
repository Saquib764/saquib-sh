export default defineNuxtRouteMiddleware((to, from) => {
  console.log("routing", to, from)
})
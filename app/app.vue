<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";

const colorMode = useColorMode();

const color = computed(() => (colorMode.value === "dark" ? "#1b1718" : "white"));

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

useHead({
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { key: "theme-color", name: "theme-color", content: color },
  ],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    lang: "en",
  },
});

const title = "Nuxt Dashboard Template";
const description =
  "A professional dashboard template built with Nuxt UI, featuring multiple pages, data visualization, and comprehensive management capabilities for creating powerful admin interfaces.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://ui.nuxt.com/assets/templates/nuxt/dashboard-light.png",
  twitterImage: "https://ui.nuxt.com/assets/templates/nuxt/dashboard-light.png",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <UApp
    :toaster="{
      position: isMobile ? 'top-right' : 'bottom-right',
      max: 3,
      expand: false,
    }"
  >
    <NuxtRouteAnnouncer />

    <NuxtLoadingIndicator :throttle="0" :height="5" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

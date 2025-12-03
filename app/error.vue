<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{
  error: NuxtError;
}>();

useSeoMeta({
  title: "Page not found",
  description: "We are sorry but this page could not be found.",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
});
</script>

<template>
  <UApp>
    <UError
      :clear="{
        color: 'neutral',
        size: 'xl',
        icon: 'i-lucide-house',
        class: 'rounded-full',
      }"
      :error="{
        statusCode: 404,
        statusMessage: 'Page not found',
        message: 'The page you are looking for does not exist.',
      }"
    />
  </UApp>
</template>

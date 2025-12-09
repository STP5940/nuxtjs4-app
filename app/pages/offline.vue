<template>
  <div class="fixed inset-0 flex items-center justify-center p-4">
    <UError
      :clear="{
        color: 'primary',
        size: 'xl',
        icon: 'i-heroicons-arrow-path',
        label: 'Try Again',
        class: 'rounded-full',
      }"
      :error="{
        statusCode: 503,
        statusMessage: 'You are offline',
        message: 'Unable to connect to the internet. Please check your connection.',
      }"
    >
      <template #icon>
        <UIcon
          name="i-heroicons-wifi-slash"
          class="w-24 h-24 text-red-500"
        />
      </template>
    </UError>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "blank",
});

useHead({
  title: "No Internet Connection",
  meta: [{ name: "robots", content: "noindex" }],
});
</script>
<script setup lang="ts">
// app/pages/logout.vue

definePageMeta({
  layout: "blank",
});

// ฟังก์ชันสำหรับดำเนินการ Logout
const handleLogout = async () => {
  try {
    await $fetch("/api/v1/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout failed", error);
  } finally {
    setTimeout(async () => {
      await navigateTo("/login");
    }, 2000); // หน่วงเวลา 2,000 มิลลิวินาที (2 วินาที)
  }
};

// เรียกใช้งานเมื่อ Component ถูก Mount
onMounted(() => {
  handleLogout();
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-4 pb-20">
    <UCard class="w-full max-w-sm text-center">
      <div class="py-8">
        <img
          src="/loading.gif"
          alt="Logging out..."
          class="h-30 w-30 mx-auto block"
        />

        <p class="mt-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
          Logging out...
        </p>

        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please wait. redirected to login page.
        </p>
      </div>
      <UProgress animation="swing" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
// app/pages/settings/users.vue
import type { UsersResponse, Users } from "~/types";

const accessToken = useCookie("access_token");
const { data: usersLists, pending, error, refresh } = await useFetch<UsersResponse>(
  "/api/v1/users",
  {
    lazy: true,
    method: "GET",
    headers: computed(() => ({
      Authorization: `Bearer ${accessToken.value}`, // reactive
    })),
  }
);

// ⚠️ ตรวจจับข้อผิดพลาดแสดง log console
// กรณีที่ token ถูก revoke ก่อนหมดอายุ
watch(
  error,
  async (newError) => {
    // ตรวจสอบว่าเป็น Client-side
    if (import.meta.client && newError) {
      await refresh();
      // refresh token ถูก revoked ให้ไปที่หน้า login
      if (newError.statusCode === 403) {
        alert(accessToken.value);
        //   console.log("Unauthorized access - possibly invalid token.");
        //   console.log("Status code:", newError.statusCode);
        //   console.log(`Error fetching users: ${newError.message}`);
        //   setTimeout(async () => {
        //     await navigateTo("/login");
        //   }, 5000); // หน่วงเวลา 5,000 มิลลิวินาที (5 วินาที)
      }
    }
  },
  { immediate: true }
);

// ข้อมูลมีอยู่แล้ว จึงสามารถใช้ค่าได้ทันที
const usersCount = computed(() => usersLists.value?.data?.usersCount ?? 0);
const q = ref<string>("");

const filteredUsers = computed<Users[]>(() => {
  const users = usersLists.value?.data?.users ?? [];
  return users.filter((user: Users) => {
    return (
      user.name.search(new RegExp(q.value, "i")) !== -1 ||
      user.username.search(new RegExp(q.value, "i")) !== -1 ||
      user.email.search(new RegExp(q.value, "i")) !== -1
    );
  });
});
</script>

<template>
  <!-- กำลังโหลดข้อมูลจาก API โปรดรอสักครู่ -->
  <div v-if="pending" class="flex flex-col items-center justify-center h-48">
    <Icon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-primary" />
    <p class="mt-2 text-gray-500">Loading data...</p>
  </div>

  <!-- เกิดข้อผิดพลาดขณะดึงข้อมูลจาก API โปรดลองอีกครั้ง -->
  <div v-else-if="error" class="flex flex-col items-center justify-center h-48">
    <Icon name="i-lucide-alert-triangle" class="w-8 h-8 text-red-500" />
    <p class="mt-2 text-red-500">Failed to load data. Please try again.</p>
    <h1 class="mt-2 text-sm">
      <code>{{ error.data?.message || "Unknown error" }}</code>
    </h1>
    <UButton
      icon="i-lucide-refresh-cw"
      label="Reload"
      color="error"
      class="mt-4"
      @click="$router.go(0)"
    />
  </div>

  <!-- แสดงรายการผู้ใช้เมื่อดึงข้อมูลสำเร็จ -->
  <div v-if="usersLists && !pending && !error">
    <UPageCard
      :title="`Total Users ${usersCount} people`"
      description="Invite new users by email address."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton label="Invite people" color="neutral" class="w-fit lg:ms-auto" />
    </UPageCard>

    <UPageCard
      variant="subtle"
      :ui="{
        container: 'p-0 sm:p-0 gap-y-0 overflow-hidden',
        wrapper: 'items-stretch overflow-hidden',
        header: 'p-4 mb-0 border-b border-default',
      }"
    >
      <template #header>
        <UInput
          v-model="q"
          icon="i-lucide-search"
          placeholder="Search users"
          class="w-full"
        />
      </template>

      <SettingsUsersList :users="filteredUsers" />
    </UPageCard>
  </div>
</template>

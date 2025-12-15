<script setup lang="ts">
// app/pages/settings/users.vue
import { callRefreshToken } from "~/middleware/auth";
import type { UsersResponse, Users } from "~/types";

const accessToken = useCookie("access_token");
const { data: users, status, pending, error, refresh } = await useFetch<UsersResponse>(
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
// 🔑 ตรวจจับ token ถูก revoke หรือหมดอายุ
watch(
  error,
  async (newError) => {
    // ตรวจสอบว่าเป็น Client-side
    if (import.meta.client && newError) {
      const success = await callRefreshToken("access_token");
      if (success) {
        console.log("✅ Token refreshed successfully");
        await refresh();
      } else {
        console.log("❌ Token refresh failed");
        setTimeout(async () => {
          await navigateTo("/login", { external: true });
        }, 5000); // หน่วงเวลา 5,000 มิลลิวินาที (5 วินาที)
      }
    }
  },
  { immediate: true }
);

// ข้อมูลมีอยู่แล้ว จึงสามารถใช้ค่าได้ทันที
const usersCount = computed(() => users.value?.data?.usersCount ?? 0);
const q = ref<string>("");

const filteredUsers = computed<Users[]>(() => {
  const usersLists = users.value?.data?.users ?? [];
  return usersLists.filter((user: Users) => {
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
  <div v-if="users && !pending && !error">
    <UPageCard
      :title="`Total Users ${usersCount} people`"
      description="Invite new users by email address."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton label="Invite people" icon="i-lucide-user-plus" color="neutral" class="w-fit lg:ms-auto" />
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

      <SettingsUsersList v-if="filteredUsers.length > 0" :users="filteredUsers" />

      <div v-else class="p-4 text-center">
        <UIcon
          name="i-lucide-users"
          class="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2"
        />
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">
          No users found
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Try adjusting your search criteria.
        </p>
      </div>
    </UPageCard>
  </div>
</template>

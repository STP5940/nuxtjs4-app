<script setup lang="ts">
// app/pages/settings/users.vue
import type { UsersResponse, Users } from "~/types";

const { data: usersResponse, pending, error } = await useFetch<UsersResponse>(
  "/api/v1/users"
);

// ข้อมูลมีอยู่แล้ว จึงสามารถใช้ค่าได้ทันที
const usersCount: number = usersResponse.value?.data?.usersCount ?? 0; // ✅ ถูกต้อง

const q = ref<string>("");

const filteredUsers = computed<Users[]>(() => {
  const users = usersResponse.value?.data?.users ?? [];
  return users.filter((user) => {
    return (
      user.name.search(new RegExp(q.value, "i")) !== -1 ||
      user.username.search(new RegExp(q.value, "i")) !== -1 ||
      user.email.search(new RegExp(q.value, "i")) !== -1
    );
  });
});
</script>

<template>
  <div>
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
        container: 'p-0 sm:p-0 gap-y-0',
        wrapper: 'items-stretch',
        header: 'p-4 mb-0 border-b border-default',
      }"
    >
      <template #header>
        <UInput
          v-model="q"
          icon="i-lucide-search"
          placeholder="Search users"
          autofocus
          class="w-full"
        />
      </template>

      <SettingsUsersList :users="filteredUsers" />
    </UPageCard>
  </div>
</template>

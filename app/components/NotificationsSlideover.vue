<script setup lang="ts">
import { callRefreshToken } from "~/middleware/auth";
import { formatTimeAgo } from "@vueuse/core";
import type { Notification } from "~/types";

const { isNotificationsSlideoverOpen } = useDashboard();

const accessToken = useCookie("access_token");
const { data: notifications, error, refresh } = await useFetch<Notification[]>(
  "/api/v1/notifications",
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
</script>

<template>
  <USlideover v-model:open="isNotificationsSlideoverOpen" title="Notifications">
    <template #body>
      <NuxtLink
        v-for="notification in notifications"
        :key="notification.id"
        :to="`/inbox?id=${notification.id}`"
        class="px-3 py-2.5 rounded-md hover:bg-elevated/50 flex items-center gap-3 relative -mx-3 first:-mt-3 last:-mb-3"
      >
        <UChip color="error" :show="!!notification.unread" inset>
          <UAvatar
            v-bind="notification.sender.avatar"
            :alt="notification.sender.name"
            size="md"
          />
        </UChip>

        <div class="text-sm flex-1">
          <p class="flex items-center justify-between">
            <span class="text-highlighted font-medium">{{
              notification.sender.name
            }}</span>

            <time
              :datetime="notification.date"
              class="text-muted text-xs"
              v-text="formatTimeAgo(new Date(notification.date))"
            />
          </p>

          <p class="text-dimmed">
            {{ notification.body }}
          </p>
        </div>
      </NuxtLink>
    </template>
  </USlideover>
</template>

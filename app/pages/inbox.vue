<script setup lang="ts">
// app/pages/inbox.vue
import { callRefreshToken } from "~/middleware/auth";
import { breakpointsTailwind } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import type { Mail } from "~/types";

definePageMeta({
  middleware: ["auth"],
});

const tabItems = [
  {
    label: "All",
    value: "all",
    icon: "i-lucide-message-square-text",
  },
  {
    label: "Unread",
    value: "unread",
    icon: "i-lucide-mail",
  },
];
const selectedTab = ref("all");

const accessToken = useCookie("access_token");
const { data: mails, status, pending, error, refresh } = await useFetch<Mail[]>(
  "/api/v1/mails",
  {
    lazy: true,
    method: "GET",
    headers: computed(() => ({
      Authorization: `Bearer ${accessToken.value}`, // reactive
    })),
    default: () => [],
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

// Filter mails based on the selected tab
const filteredMails = computed(() => {
  if (selectedTab.value === "unread") {
    return mails.value.filter((mail) => !!mail.unread);
  }

  return mails.value;
});

const selectedMail = ref<Mail | null>();

const isMailPanelOpen = computed({
  get() {
    return !!selectedMail.value;
  },
  set(value: boolean) {
    if (!value) {
      selectedMail.value = null;
    }
  },
});

// Reset selected mail if it's not in the filtered mails
watch(filteredMails, () => {
  if (!filteredMails.value.find((mail) => mail.id === selectedMail.value?.id)) {
    selectedMail.value = null;
  }
});

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
</script>

<template>
  <UDashboardPanel
    id="inbox-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
  >
    <UDashboardNavbar :title="$t('inbox_link')">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #trailing>
        <UBadge :label="filteredMails.length" variant="subtle" />
      </template>

      <template #right>
        <UTabs v-model="selectedTab" :items="tabItems" :content="false" size="xs" />
      </template>
    </UDashboardNavbar>
    <InboxList v-model="selectedMail" :mails="filteredMails" />
  </UDashboardPanel>

  <InboxMail v-if="selectedMail" :mail="selectedMail" @close="selectedMail = null" />
  <div v-else class="hidden lg:flex flex-1 items-center justify-center">
    <UIcon name="i-lucide-inbox" class="size-32 text-dimmed" />
  </div>

  <ClientOnly>
    <USlideover v-if="isMobile" v-model:open="isMailPanelOpen">
      <template #content>
        <InboxMail
          v-if="selectedMail"
          :mail="selectedMail"
          @close="selectedMail = null"
        />
      </template>
    </USlideover>
  </ClientOnly>
</template>

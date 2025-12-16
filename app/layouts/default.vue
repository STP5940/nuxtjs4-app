<script setup lang="ts">
// app/layouts/default.vue
import { callRefreshToken } from '~/middleware/auth';
import { useAuthStore } from '@/stores/auth'

import { jwtDecode, type JwtPayload } from 'jwt-decode';
import type { NavigationMenuItem } from '@nuxt/ui'

// const refreshToken = useCookie('refresh_token');
const accessToken = useCookie("access_token");

const authStore = useAuthStore()
const route = useRoute()

const open = ref(false)

// ตัวแปรสำหรับเก็บ interval/timeout ID
let intervalId: NodeJS.Timeout | null = null;

// ตัวแปรสำหรับเก็บค่าเวลา
const REFRESH_THRESHOLD = 10; // 10 วินาที - จะ refresh เมื่อเหลือเวลาน้อยกว่านี้
const CHECK_INTERVAL = 10000; // 10 วินาที (10,000 milliseconds) - ตรวจสอบทุก 10 วินาที

const links = computed(() => [[{
  label: $t("home_link"),
  icon: 'i-lucide-house',
  to: '/',
  onSelect: () => {
    open.value = false
  }
}, {
  label: $t("inbox_link"),
  icon: 'i-lucide-inbox',
  to: '/inbox',
  badge: '4',
  onSelect: () => {
    open.value = false
  }
}, {
  label: $t("customers_link"),
  icon: 'i-lucide-users',
  to: '/customers',
  onSelect: () => {
    open.value = false
  }
}, {
  label: $t("settings_link"),
  to: '/settings',
  icon: 'i-lucide-settings',
  defaultOpen: true,
  type: 'trigger',
  children: [{
    label: $t("general_link"),
    to: '/settings',
    exact: true,
    onSelect: () => {
      open.value = false
    }
  }, {
    label: $t("user_link"),
    to: '/settings/users',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: $t("notifications_link"),
    to: '/settings/notifications',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: $t("security_link"),
    to: '/settings/security',
    onSelect: () => {
      open.value = false
    }
  }]
}], [{
  label: $t('feedback_link'),
  icon: 'i-lucide-message-circle',
  to: 'https://github.com/STP5940/nuxtjs4-app/issues',
  target: '_blank'
}, {
  label: $t('help_link'),
  icon: 'i-lucide-info',
  to: 'https://www.facebook.com/home.htmI',
  target: '_blank'
}]] satisfies NavigationMenuItem[][])

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.value.flat()
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: `https://github.com/STP5940/nuxtjs4-app/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }]
}])

/**
 * ตรวจสอบว่า token เหลือเวลาน้อยกว่า REFRESH_THRESHOLD หรือไม่
 * @returns true ถ้าควร refresh, false ถ้ายังไม่ต้อง refresh
 */
const shouldRefreshToken = (): boolean => {
  try {
    if (!accessToken.value) {
      return false;
    }

    const decoded: JwtPayload = jwtDecode(accessToken.value);

    if (!decoded.exp) {
      console.warn('⚠️ Token ไม่มี exp field');
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;

    console.log(`⏰ Token เหลืออายุอีก ${expiresIn} วินาที (${Math.floor(expiresIn / 60)} นาที)`);

    // ถ้าเหลือเวลาน้อยกว่า REFRESH_THRESHOLD (5 นาที) ให้ refresh
    if (expiresIn <= REFRESH_THRESHOLD) {
      console.log(`🔔 Token เหลือเวลาน้อยกว่า ${REFRESH_THRESHOLD / 60} นาที, ควร refresh!`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ ไม่สามารถ decode token:', error);
    return false;
  }
};

/**
 * ตรวจสอบและ refresh token ถ้าจำเป็น
 */
const checkAndRefreshToken = async () => {
  if (shouldRefreshToken()) {
    // console.log('🔄 Auto-refreshing access token...');
    const success = await callRefreshToken('access_token');

    if (success) {
      console.log('✅ Token refreshed successfully');
    } else {
      console.log('❌ Token refresh failed');
      // หยุด interval ถ้า refresh ไม่สำเร็จ
      stopAutoRefresh();
      return navigateTo("/login", { external: true });
    }
  } else {
    // console.log('✓ Token ยังไม่ต้อง refresh');
  }
};

/**
 * เริ่มต้น auto-check และ refresh token
 */
const startAutoRefresh = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  console.log(`🚀 Starting token auto-check (ตรวจสอบทุก ${CHECK_INTERVAL / 1000} วินาที)...`);

  // ตรวจสอบทันทีครั้งแรก
  checkAndRefreshToken();

  // ตั้งเวลาตรวจสอบแบบ interval
  intervalId = setInterval(() => {
    checkAndRefreshToken();
  }, CHECK_INTERVAL);
};

/**
 * หยุด auto-refresh token
 */
const stopAutoRefresh = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('⏸️ Token auto-refresh stopped');
  }
};

onMounted(async () => {
  if (accessToken.value) {
    startAutoRefresh();

    authStore.setToken(accessToken.value);
    await authStore.fetchUser();
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});

watch(accessToken, (newToken) => {
  if (newToken) {
    console.log('🔄 Access token changed, restarting auto-refresh...');
    startAutoRefresh();
  } else if (!newToken) {
    stopAutoRefresh();
  }
});
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
        >
          <template v-if="!collapsed">
            <span class="text-sm text-dimmed">{{ $t("search_placeholder") }}</span>
          </template>
        </UDashboardSearchButton>

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <!-- <CookieConsentToast /> -->

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>

<script setup lang="ts">
import { sub } from 'date-fns'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Period, Range } from '~/types'

definePageMeta({
  middleware: ["auth"],
});

const { isNotificationsSlideoverOpen } = useDashboard()
const { locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()


const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value);
});

const items = [[{
  label: 'New mail',
  icon: 'i-lucide-send',
  to: '/inbox'
}, {
  label: 'New customer',
  icon: 'i-lucide-user-plus',
  to: '/customers'
}]] satisfies DropdownMenuItem[][]

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})
const period = ref<Period>('daily')
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <HomeDateRangePicker v-model="range" class="-ms-1" />

          <HomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <!-- Language Switcher -->
      <!-- <div class="absolute top-4 right-4 z-50"> -->
      <UButton
        v-for="locale in availableLocales"
        :key="locale.code"
        @click="setLocale(locale.code)"
        class="px-3 py-1 mx-1 rounded-md text-sm transition-all"
        :class="{
          'bg-emerald-600 text-white': $i18n.locale === locale.code,
          'bg-gray-800 text-gray-300 hover:bg-gray-700': $i18n.locale !== locale.code,
        }"
      >
        <UIcon
          :name="locale.flag"
          class="w-5 h-5 mr-3 flex-shrink-0"
          :class="$i18n.locale === locale.code ? 'opacity-100' : 'opacity-70'"
        />
        {{ locale.name }}
      </UButton>
      <!-- </div> -->

      {{ $t("welcome") }}
      <!-- Language switcher -->
      <!-- <button @click="setLocale('en')">English</button>
      <button @click="setLocale('th')">ไทย</button>
      {{ locale }} -->
      <!-- <pre>
      {{ locales }}
      </pre> -->

      <!-- Localized links -->
      <!-- <NuxtLink :to="localePath('inbox')">{{ $t("home") }}</NuxtLink> -->
      <HomeStats :period="period" :range="range" />
      <HomeChart :period="period" :range="range" />
      <HomeSales :period="period" :range="range" />
    </template>
  </UDashboardPanel>
</template>

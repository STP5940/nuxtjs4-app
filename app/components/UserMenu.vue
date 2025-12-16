<script setup lang="ts">
// app/components/UserMenu.vue
import type { DropdownMenuItem } from "@nuxt/ui";
import { useAuthStore } from "@/stores/auth";

defineProps<{
  collapsed?: boolean;
}>();

const { locale, locales, setLocale } = useI18n();

const colorMode = useColorMode();
const appConfig = useAppConfig();
const authStore = useAuthStore();

const colors = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];
const neutrals = ["slate", "gray", "zinc", "neutral", "stone"];

const user = computed(() => ({
  name: authStore.user?.name || "Guest",
  avatar: {
    src: String(authStore.user?.avatar) || "https://github.com/nuxtlabs.png?size=128",
    alt: authStore.user?.name || "User avatar",
  },
}));

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: "label",
      label: user.value.name,
      avatar: user.value.avatar,
    },
  ],
  [
    {
      label: $t("profile_link"),
      icon: "i-lucide-user",
    },
    {
      label: $t("billing_link"),
      icon: "i-lucide-credit-card",
    },
    {
      label: $t("settings_link"),
      icon: "i-lucide-settings",
      to: "/settings",
      kbds: ["g", "s"],
    },
  ],
  [
    {
      label: $t("theme_link"),
      icon: "i-lucide-palette",
      children: [
        {
          label: "Primary",
          slot: "chip",
          chip: appConfig.ui.colors.primary,
          content: {
            align: "center",
            collisionPadding: 16,
          },
          children: colors.map((color) => ({
            label: color,
            class: "cursor-pointer",
            chip: color,
            slot: "chip",
            checked: appConfig.ui.colors.primary === color,
            type: "checkbox",
            onSelect: (e) => {
              e.preventDefault();

              appConfig.ui.colors.primary = color;
            },
          })),
        },
        {
          label: "Neutral",
          slot: "chip",
          chip:
            appConfig.ui.colors.neutral === "neutral"
              ? "old-neutral"
              : appConfig.ui.colors.neutral,
          content: {
            align: "end",
            collisionPadding: 16,
          },
          children: neutrals.map((color) => ({
            label: color,
            class: "cursor-pointer",
            chip: color === "neutral" ? "old-neutral" : color,
            slot: "chip",
            type: "checkbox",
            checked: appConfig.ui.colors.neutral === color,
            onSelect: (e) => {
              e.preventDefault();

              appConfig.ui.colors.neutral = color;
            },
          })),
        },
      ],
    },
    {
      label: $t("appearance_link"),
      icon: "i-lucide-sun-moon",
      children: [
        {
          label: "System",
          icon: "i-lucide-monitor",
          class: "cursor-pointer",
          type: "checkbox",
          checked: colorMode.preference === "system",
          onSelect(e: Event) {
            e.preventDefault();

            colorMode.preference = "system";
          },
        },
        {
          label: "Light",
          icon: "i-lucide-sun",
          class: "cursor-pointer",
          type: "checkbox",
          checked: colorMode.preference === "light",
          onSelect(e: Event) {
            e.preventDefault();

            colorMode.preference = "light";
          },
        },
        {
          label: "Dark",
          icon: "i-lucide-moon",
          class: "cursor-pointer",
          type: "checkbox",
          checked: colorMode.preference === "dark",
          onSelect(e: Event) {
            e.preventDefault();

            colorMode.preference = "dark";
          },
        },
      ],
    },
    {
      label: $t("language_link"),
      icon: "i-lucide-globe",
      children: locales.value.map((l) => ({
        label: l.name,
        icon: l.flag,
        class: "cursor-pointer",
        type: "checkbox",
        checked: locale.value === l.code,
        onSelect(e: Event) {
          e.preventDefault();
          setLocale(l.code);
        },
      })),
    },
  ],
  [
    {
      label: $t("logout_link"),
      icon: "i-lucide-log-out",
      onSelect: handleLogout,
    },
  ],
]);

const handleLogout = async function () {
  await navigateTo("/logout");
};
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    />

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>

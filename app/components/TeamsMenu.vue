<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

defineProps<{
  collapsed?: boolean;
}>();

const teams = ref([
  {
    label: "Nuxt",
    class: "cursor-pointer",
    avatar: {
      src: "https://github.com/nuxt.png?size=128",
      alt: "Nuxt",
    },
  },
  {
    label: "NuxtHub",
    class: "cursor-pointer",
    avatar: {
      src: "https://github.com/nuxt-hub.png?size=128",
      alt: "NuxtHub",
    },
  },
  {
    label: "NuxtLabs",
    class: "cursor-pointer",
    avatar: {
      src: "https://github.com/nuxtlabs.png?size=128",
      alt: "NuxtLabs",
    },
  },
]);
const selectedTeam = ref(teams.value[0]);

const items = computed<DropdownMenuItem[][]>(() => {
  return [
    teams.value.map((team) => ({
      ...team,
      onSelect() {
        selectedTeam.value = team;
      },
    })),
    [
      {
        label: "Create team",
        icon: "i-lucide-circle-plus",
        class: "cursor-pointer",
      },
      {
        label: "Manage teams",
        icon: "i-lucide-cog",
        class: "cursor-pointer",
      },
    ],
  ];
});
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }"
    class="cursor-pointer"
  >
    <UButton
      v-bind="{
        ...selectedTeam,
        label: collapsed ? undefined : selectedTeam?.label,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
// app/components/settings/UsersList.vue
import { randomRoles } from '~~/constants/roles'
import type { Users } from '~/types'

import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  users: Users[]
}>()

const items = [{
  label: 'Edit users',
  icon: 'i-lucide-edit',
  onSelect: () => console.log('Edit users')
}, {
  label: 'Remove users',
  icon: 'i-lucide-trash',
  color: 'error' as const,
  onSelect: () => console.log('Remove users')
}] satisfies DropdownMenuItem[]
</script>

<template>
  <ul role="list" class="divide-y divide-default">
    <li
      v-for="(user, index) in users"
      :key="index"
      class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6"
    >
      <div class="flex items-center gap-3 min-w-0">
        <UAvatar
          v-bind="user.avatar"
          :alt="user.avatar?.alt || `User avatar`"
          size="md"
          :chip="
            user.online
              ? {
                  inset: true, // จัดวาง Chip ที่มุมด้านใน
                  color: 'success', // สีเขียวสำหรับออนไลน์
                }
              : undefined
          "
        />

        <div class="text-sm min-w-0">
          <p class="text-highlighted font-medium truncate">
            {{ user.name }}
          </p>
          <p class="text-muted truncate">
            {{ user.username }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <USelect
          :model-value="user.role"
          :items="randomRoles"
          color="neutral"
          :ui="{ value: 'capitalize', item: 'capitalize' }"
        />

        <UDropdownMenu :items="items" :content="{ align: 'end' }">
          <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
        </UDropdownMenu>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
// app/components/settings/UsersList.vue
import type { DropdownMenuItem } from '@nuxt/ui'

import { randomRoles } from '~~/constants/roles'
import type { Users } from '~/types'

defineProps<{
  users: Users[]
}>()

const items = [{
  label: 'Edit users',
  onSelect: () => console.log('Edit users')
}, {
  label: 'Remove users',
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
        />

        <div class="text-sm min-w-0">
          <p class="text-highlighted font-medium truncate">
            {{ user.name }}
          </p>
          <p class="text-muted truncate">
            {{ user.email }}
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

<script setup lang="ts">
// app/components/settings/UsersList.vue
import { randomRoles } from '~~/constants/roles'
import type { Users } from '~/types'
import type { DropdownMenuItem } from '@nuxt/ui'

const props = withDefaults(defineProps<{
  users: Users[]
  itemsPerPage?: number
}>(), {
  itemsPerPage: 5
})

// Dropdown menu items per user
const getMenuItems = (userId: string | number) => [{
  label: 'Edit users',
  icon: 'i-lucide-edit',
  onSelect: () => alert(`Edit User: ${userId}`)
}, {
  label: 'Remove users',
  icon: 'i-lucide-trash',
  color: 'error' as const,
  onSelect: () => alert(`Remove User: ${userId}`)
}] satisfies DropdownMenuItem[]

// Pagination
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(props.users.length / props.itemsPerPage))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.users.slice(start, end)
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
</script>

<template>
  <div>
    <!-- Pagination Controls -->
    <div
      v-if="users.length > 0"
      class="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-default"
    >
      <div class="text-sm text-muted">
        show {{ (currentPage - 1) * props.itemsPerPage + 1 }}-{{
          Math.min(currentPage * props.itemsPerPage, users.length)
        }}
        of {{ users.length }} items
      </div>

      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        />

        <div class="flex items-center gap-1">
          <UButton
            v-for="page in totalPages"
            :key="page"
            :label="String(page)"
            color="neutral"
            :variant="currentPage === page ? 'solid' : 'ghost'"
            @click="goToPage(page)"
          />
        </div>

        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="ghost"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        />
      </div>
    </div>

    <!-- User List -->
    <ul role="list" class="divide-y divide-default">
      <li
        v-for="(user, index) in paginatedUsers"
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
                    inset: true,
                    color: 'success',
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

          <UDropdownMenu :items="getMenuItems(user.id)" :content="{ align: 'end' }">
            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
          </UDropdownMenu>
        </div>
      </li>
    </ul>
  </div>
</template>

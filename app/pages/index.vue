<script setup lang="ts">
import { useFetch } from "nuxt/app";
import type { UsersResponse } from "../types";

// ใช้ useFetch เหมือนเดิม
const { data: usersResponse, pending, error } = await useFetch<UsersResponse>(
  "/api/v1/users",
  { key: "users-api" } // สำหรับ caching
);

// การใช้ Nuxt UI Components:
// เราจะใช้ Card และ List group เพื่อจัดโครงสร้าง
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-600 p-4">
    
    <UCard class="w-full max-w-md mx-auto text-center" :ui="{ body: 'sm:p-8 p-6' }">
      
      <h1 class="text-3xl font-extrabold mb-6 flex items-center justify-center">
        <UIcon name="i-heroicons-rocket-launch" class="mr-2 text-primary-500" />
        Index Page
      </h1>

      <UAlert
        v-if="pending"
        icon="i-heroicons-arrow-path"
        color="neutral"
        variant="subtle"
        title="Loading..."
        class="mt-4"
      />

      <UAlert
        v-else-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="soft"
        title="Error loading users"
        :description="error.message"
        class="mt-4"
      />

      <div v-else-if="usersResponse">
        <h2 class="text-xl font-semibold text-gray-400 mb-4 mt-6">
          Users ({{ usersResponse.data.usersCount }})
        </h2>

        <div class="space-y-3">
          <UCard 
            v-for="user in usersResponse.data.users" 
            :key="user.id" 
            class="text-left bg-white shadow-sm"
            :ui="{ body: 'p-3 sm:p-4' }"
          >
            <div class="text-gray-900 font-bold">{{ user.name }}</div>
            <div class="text-sm text-gray-600 truncate">{{ user.email }}</div>
            <div class="text-xs text-gray-500 mt-1">
              Created: {{ user.createdAt.toLocaleString() }}
            </div>
          </UCard>
        </div>
      </div>
    </UCard>
  </div>
</template>
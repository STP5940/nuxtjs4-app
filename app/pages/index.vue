<script setup lang="ts">
import { useFetch } from "nuxt/app";
import type { UsersResponse } from "../types";

const { data: usersResponse, pending, error } = await useFetch<UsersResponse>(
  "/api/v1/users",
  { key: "users-api" } // สำหรับ caching
);
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">🚀 Index Page</h1>

      <!-- Loading -->
      <p v-if="!usersResponse">⏳ Loading...</p>

      <!-- Show Users -->
      <div v-else>
        <!-- <pre>
        {{ usersResponse.data.users }}
        </pre> -->
        <h2 class="subtitle">Users ({{ usersResponse.data.usersCount }})</h2>

        <ul class="user-list">
          <li v-for="user in usersResponse.data.users" :key="user.id">
            <strong>{{ user.name }}</strong>
            <br />
            {{ user.email }}
            <br />
            <small>Created: {{ user.createdAt.toLocaleString() }}</small>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  min-width: 360px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.subtitle {
  font-size: 18px;
  margin-top: 10px;
  margin-bottom: 15px;
  color: #555;
}

.user-list {
  list-style: none;
  padding: 0;
  text-align: left;
}

.user-list li {
  background: #f8f8f8;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 10px;
}
</style>

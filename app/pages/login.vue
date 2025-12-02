<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import * as z from "zod";

definePageMeta({
  layout: "blank",
});

const toast = useToast();
const loading = ref(false);

const fields: AuthFormField[] = [
  {
    name: "username",
    label: "Username",
    type: "text",
    placeholder: "Enter your username",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
  },
  {
    name: "remember",
    label: "Remember me",
    type: "checkbox",
  },
];

const providers = [
  {
    label: "Google",
    icon: "i-simple-icons-google",
    onClick: () => {
      toast.add({ title: "Google", description: "Login with Google" });
    },
  },
  {
    label: "GitHub",
    icon: "i-simple-icons-github",
    onClick: () => {
      toast.add({ title: "GitHub", description: "Login with GitHub" });
    },
  },
];

const schema = z.object({
  username: z
    .string("Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    await $fetch("/api/v1/auth/login", {
      method: "POST",
      body: {
        username: payload.data.username,
        password: payload.data.password,
      },
    });

    toast.add({ title: "Login successful!" });
    await navigateTo("/settings/users");
  } catch (error: any) {
    toast.add({
      title: "Login Failed",
      description: error.data?.message || "An unexpected error occurred.",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 min-h-screen">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Login"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        :loading="loading"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>

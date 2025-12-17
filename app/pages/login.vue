<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import * as z from "zod";

definePageMeta({
  middleware: ["guest"],
  layout: "blank",
});

const toast = useToast();
const loading = ref(false);
const authStore = useAuthStore();
const { start, finish } = useLoadingIndicator();

const fields = computed<AuthFormField[]>(() => [
  {
    name: "username",
    label: $t("login.username"),
    type: "text",
    placeholder: $t("login.enter_username"),
    required: true,
    defaultValue: "antfu",
  },
  {
    name: "password",
    label: $t("login.password"),
    type: "password",
    placeholder: $t("login.enter_password"),
    required: true,
    defaultValue: "123456789",
  },
  {
    name: "remember",
    label: $t("login.remember_me"),
    type: "checkbox",
    defaultValue: true,
  },
]);

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
  remember: z.boolean().optional(),
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  start({ force: true });
  loading.value = true;
  try {
    await $fetch("/api/v1/auth/login", {
      method: "POST",
      body: {
        username: payload.data.username,
        password: payload.data.password,
      },
    });

    // toast.add({
    //   title: "Login Successful",
    //   description: "You have been logged in successfully.",
    //   color: "success",
    // });

    const accessToken = useCookie("access_token");
    if (accessToken.value) {
      authStore.setToken(accessToken.value);
      await authStore.fetchUser();
    }

    await navigateTo("/");
  } catch (error: any) {
    toast.add({
      title: "Login Failed",
      description: error.data?.message || "An unexpected error occurred.",
      color: "error",
    });
    finish({ error: true });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-4 pb-20">
    <UPageCard class="w-full max-w-md shadow-md">
      <UAuthForm
        :title="$t('login.title')"
        :description="$t('login.enter_credentials')"
        icon="i-lucide-user"
        :schema="schema"
        :fields="fields"
        :providers="providers"
        :separator="$t('login.providers')"
        :loading="loading"
        :submit="{
          label: $t('login.submit'),
        }"
        @submit="onSubmit"
      >
        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1"
            >{{ $t("login.forgot_password") }}</ULink
          >
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>

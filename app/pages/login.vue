<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import * as z from "zod";

definePageMeta({
  middleware: ["guest"],
  layout: "blank",
});

const toast = useToast();
const loading = ref(false);
const { start } = useLoadingIndicator();

const fields: AuthFormField[] = [
  {
    name: "username",
    label: "Username",
    type: "text",
    placeholder: "Enter your username",
    required: true,
    defaultValue: "antfu",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
    defaultValue: "123456789",
  },
  {
    name: "remember",
    label: "Remember me",
    type: "checkbox",
    defaultValue: true,
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
    await navigateTo("/");
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
  <div class="flex flex-col items-center justify-start gap-4 p-4 min-h-screen pt-20">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        title="Login"
        description="Enter your credentials"
        icon="i-lucide-user"
        :schema="schema"
        :fields="fields"
        :providers="providers"
        separator="Providers"
        :loading="loading"
        :submit="{
          label: 'Submit',
        }"
        @submit="onSubmit"
      >
        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1"
            >Forgot password?</ULink
          >
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>

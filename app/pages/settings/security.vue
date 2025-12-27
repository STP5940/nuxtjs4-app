<script setup lang="ts">
import * as z from "zod";
import type { FormError } from "@nuxt/ui";

const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);
const loading = ref(false);

const passwordSchema = z.object({
  current: z.string().min(8, "Must be at least 8 characters"),
  new: z.string().min(8, "Must be at least 8 characters"),
  confirm: z.string().min(8, "Must be at least 8 characters"),
});

type PasswordSchema = z.output<typeof passwordSchema>;

const password = reactive<Partial<PasswordSchema>>({
  current: undefined,
  new: undefined,
  confirm: undefined,
});

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = [];
  // validate that current and new passwords are different
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: "new", message: "Passwords must be different" });
  }
  // validate that new and confirm passwords match
  if (state.new && state.confirm && state.new !== state.confirm) {
    errors.push({ name: "confirm", message: "Passwords do not match" });
  }
  return errors;
};

const toast = useToast();

const accessToken = useCookie("access_token");
const onSubmit = async () => {
  loading.value = true;
  try {
    const { data, status, pending, error, refresh } = await useFetch(
      "/api/v1/auth/change-password",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
        body: {
          currentPassword: password.current,
          newPassword: password.new,
        },
      }
    );

    if (error.value) {
      const errData = error.value.data;
      const statusCode = error.value.statusCode;

      let errorMsg = errData?.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน";
      errorMsg = errData?.message;

      toast.add({
        title: "Error",
        description: errorMsg,
        color: "error",
      });
    } else {
      toast.add({
        title: "Success",
        description: "Your password has been updated successfully",
        color: "success",
      });
      // Reset form
      password.current = undefined;
      password.new = undefined;
      password.confirm = undefined;
    }
  } catch (err) {
    // กันเหนียวกรณี Network ล่ม
    toast.add({
      title: "Network Error",
      description: "Unable to change password due to network issues.",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

const deleteAccount = () => {
  alert("Account deleted");
};
</script>

<template>
  <UPageCard
    title="Password"
    description="Confirm your current password before setting a new one."
    variant="subtle"
  >
    <UForm
      :schema="passwordSchema"
      :state="password"
      :validate="validate"
      :disabled="loading"
      @submit="onSubmit"
      class="flex flex-col gap-4 max-w-xs"
    >
      <UFormField name="current">
        <UInput
          v-model="password.current"
          :type="showCurrent ? 'text' : 'password'"
          placeholder="Current password"
          class="w-full"
          :ui="{ trailing: 'pe-1' }"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="showCurrent ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="showCurrent ? 'Hide password' : 'Show password'"
              :aria-pressed="showCurrent"
              aria-controls="password"
              tabindex="-1"
              @click="showCurrent = !showCurrent"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField name="new">
        <UInput
          v-model="password.new"
          :type="showNew ? 'text' : 'password'"
          placeholder="New password"
          class="w-full"
          :ui="{ trailing: 'pe-1' }"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="showNew ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="showNew ? 'Hide password' : 'Show password'"
              :aria-pressed="showNew"
              aria-controls="password"
              tabindex="-1"
              @click="showNew = !showNew"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField name="confirm">
        <UInput
          v-model="password.confirm"
          :type="showConfirm ? 'text' : 'password'"
          placeholder="Confirm password"
          class="w-full"
          :ui="{ trailing: 'pe-1' }"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="showConfirm ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="showConfirm ? 'Hide password' : 'Show password'"
              :aria-pressed="showConfirm"
              aria-controls="password"
              tabindex="-1"
              @click="showConfirm = !showConfirm"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        label="Update"
        icon="i-lucide-save"
        class="w-fit"
        type="submit"
        :loading="loading"
      />
    </UForm>
  </UPageCard>

  <UPageCard
    title="Account"
    description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
    class="bg-gradient-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <UButton
        @click="deleteAccount"
        label="Delete account"
        icon="i-lucide-trash"
        color="error"
      />
    </template>
  </UPageCard>
</template>

<style>
/* Hide the password reveal button in Edge */
::-ms-reveal {
  display: none;
}
</style>

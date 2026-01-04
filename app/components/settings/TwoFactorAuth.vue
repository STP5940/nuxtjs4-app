<script setup lang="ts">
// 2FA widget reused in security pages
import { computed, ref } from "vue";
import { vMaska } from "maska/vue";
import { useAuthStore } from "@/stores/auth";

import type { TwoFactorSetupResponse } from "~/types";

const authStore = useAuthStore();

const toast = useToast();
const config = useRuntimeConfig();

const is2FAEnabled = ref(false);
const showQRCode = ref(false);
const showDisableConfirm = ref(false);
const verificationPinCode = ref([]);
const isVerifying = ref(false);
const isQrLoading = ref(true);

const secretKey = ref("");
const qrCodeValueFromAPI = ref("");

const accessToken = useCookie("access_token");
const { data, status, pending, error, refresh } = await useFetch<TwoFactorSetupResponse>(
  "/api/v1/auth/2fa/setup",
  {
    method: "GET",
    headers: computed(() => ({
      Authorization: `Bearer ${accessToken.value}`, // reactive
    })),
    immediate: false,
  }
);

const isPinComplete = computed(() => {
  // ตรวจสอบว่า pin code มีความยาว 6 หลักและเป็นตัวเลขทั้งหมด
  const pin = verificationPinCode.value;
  return Array.isArray(pin) && pin.join('').length === 6 && /^\d{6}$/.test(pin.join(''));
});

const enable2FA = async () => {
  showQRCode.value = true;
  isQrLoading.value = true;

  try {
    // เรียก API เพื่อดึงข้อมูล 2FA setup
    await refresh();
    const twoFactorSetup = data.value;

    if (twoFactorSetup?.data) {
      secretKey.value = twoFactorSetup.data.secretkey;
      qrCodeValueFromAPI.value = twoFactorSetup.data.qrcodevalue;
      isQrLoading.value = false;
    } else {
      throw new Error("No data received from API");
    }
  } catch (error) {
    console.error("Failed to fetch 2FA setup info:", error);
    toast.add({
      title: "Error",
      description: "Failed to fetch 2FA setup information",
      color: "error",
    });
    showQRCode.value = false;
    isQrLoading.value = false;
  }
};

const verify2FA = async () => {
  if (!isPinComplete.value) {
    // alert("กรุณากรอกรหัส 6 หลัก");
    toast.add({
      title: "Invalid Code",
      description: "Please enter a valid 6-digit code.",
      color: "error",
    });
    return;
  }

  isVerifying.value = true;

  // Simulate API call
  setTimeout(() => {
    // ในการใช้งานจริงจะต้องส่งไปยัง backend เพื่อ verify
    is2FAEnabled.value = true;
    showQRCode.value = false;
    verificationPinCode.value = [];
    isVerifying.value = false;
    // alert("เปิดใช้งาน 2FA สำเร็จ");
    toast.add({
      title: "Success",
      description: "2FA enabled successfully",
      color: "success",
    });
  }, 1000);
};

const disable2FA = () => {
  showDisableConfirm.value = true;
};

const confirmDisable2FA = async () => {
  if (!isPinComplete.value) {
    // alert("กรุณากรอกรหัส 6 หลัก");
    toast.add({
      title: "Invalid Code",
      description: "Please enter a valid 6-digit code.",
      color: "error",
    });
    return;
  }

  isVerifying.value = true;

  // Simulate API call
  setTimeout(() => {
    // ในการใช้งานจริงจะต้องส่งไปยัง backend เพื่อ verify
    is2FAEnabled.value = false;
    showDisableConfirm.value = false;
    verificationPinCode.value = [];
    isVerifying.value = false;
    // alert("ปิดใช้งาน 2FA สำเร็จ");
    toast.add({
      title: "Success",
      description: "2FA disabled successfully",
      color: "success",
    });
  }, 1000);
};

const cancelSetup = () => {
  showQRCode.value = false;
  verificationPinCode.value = [];
};

const cancelDisable = () => {
  showDisableConfirm.value = false;
  verificationPinCode.value = [];
};

const copySecret = () => {
  navigator.clipboard.writeText(secretKey.value.toString());
  toast.add({
    title: "Copied to clipboard",
    description: "Secret Key copied to clipboard",
  });
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <!-- <div>
      <h3 class="text-lg font-semibold text-highlighted">
        {{ $t("twofactor.title") }} (2FA)
      </h3>
      <p class="mt-1 text-sm text-muted">
        Secure your account with two-factor authentication.
      </p>
    </div> -->

    <UPageCard
      :title="`${$t('twofactor.title')} (2FA)`"
      description="Secure your account with two-factor authentication."
      variant="naked"
      class="mb-4"
    />

    <!-- Status Card -->
    <UPageCard v-if="!showDisableConfirm" variant="subtle">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            :class="[
              'w-12 h-12 rounded-full flex items-center justify-center',
              is2FAEnabled
                ? 'bg-success-100 text-success-600'
                : 'bg-gray-100 text-gray-600 border-1 border-gray-200',
            ]"
          >
            <UIcon
              :name="is2FAEnabled ? 'i-lucide-shield-check' : 'i-lucide-shield-off'"
              class="w-6 h-6"
            />
          </div>
          <div>
            <p class="font-medium text-highlighted">2FA Status</p>
            <p class="text-sm text-muted">
              {{ is2FAEnabled ? "Enabled" : "Disabled" }}
            </p>
          </div>
        </div>

        <UButton
          icon="i-lucide-shield-plus"
          v-if="!is2FAEnabled && !showQRCode"
          @click="enable2FA"
          color="primary"
          variant="outline"
        >
          2FA Enabled
        </UButton>

        <UButton
          icon="i-lucide-trash"
          v-if="is2FAEnabled && !showDisableConfirm"
          @click="disable2FA"
          color="error"
          variant="outline"
        >
          2FA Disabled
        </UButton>
      </div>
    </UPageCard>

    <!-- Enable 2FA - QR Code Setup -->
    <UCard
      v-if="showQRCode && !is2FAEnabled"
      class="bg-gradient-to-tl from-indigo-500/10 from-5% to-default"
    >
      <div class="space-y-6">
        <div>
          <h4 class="font-semibold text-highlighted mb-2">Step 1: Scan the QR Code</h4>
          <p class="text-sm text-muted">
            Use an authenticator app (such as Google Authenticator or Authy) to scan this
            QR code.
          </p>
        </div>

        <!-- QR Code -->
        <div class="flex flex-col items-center gap-4 py-6">
          <div class="relative p-4 bg-white rounded-lg border-2 border-default">
            <div
              v-if="isQrLoading"
              class="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70"
            >
              <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-muted" />
            </div>
            <Qrcode
              :value="qrCodeValueFromAPI"
              class="w-48 h-48"
              :style="{ opacity: isQrLoading === true ? 0.1 : 1 }"
            />
          </div>

          <!-- Secret Key -->
          <div class="w-full max-w-md">
            <p class="text-sm text-muted mb-2">Or enter the secret key manually:</p>
            <div class="flex gap-2">
              <UInput
                :model-value="secretKey"
                readonly
                class="flex-1 font-mono text-sm"
              />
              <UButton
                icon="i-lucide-copy"
                color="neutral"
                variant="outline"
                @click="copySecret"
              />
            </div>
          </div>
        </div>

        <!-- Verification -->
        <div>
          <h4 class="font-semibold text-highlighted mb-2">Step 2: Verify the Code</h4>
          <p class="text-sm text-muted mb-4">
            Enter the 6-digit code from your authenticator app
          </p>

          <div class="flex gap-3">
            <UPinInput
              v-model="verificationPinCode"
              type="number"
              :length="6"
              placeholder="○"
              :ui="{ base: 'text-2xl font-mono' }"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <UButton
            icon="i-lucide-shield-check"
            @click="verify2FA"
            color="primary"
            :loading="isVerifying"
            :disabled="!isPinComplete"
          >
            Confirm Enable
          </UButton>
          <UButton
            @click="cancelSetup"
            color="neutral"
            variant="outline"
            :disabled="isVerifying"
          >
            Cancel
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Disable 2FA - Confirmation -->
    <UCard
      v-if="showDisableConfirm && is2FAEnabled"
      class="bg-gradient-to-tl from-yellow-500/10 from-5% to-default"
    >
      <div class="space-y-6">
        <div class="flex items-start gap-3">
          <div
            class="w-12 h-12 rounded-full bg-error-100 text-error-600 flex items-center justify-center flex-shrink-0"
          >
            <UIcon name="i-lucide-alert-triangle" class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-semibold text-highlighted mb-2">Disable 2FA</h4>
            <p class="text-sm text-muted">
              Disabling 2FA reduces your security. Enter the 6-digit code to confirm.
            </p>
          </div>
        </div>

        <!-- Verification -->
        <div>
          <label class="block text-sm font-medium text-highlighted mb-2">
            Verification Code
          </label>
          <UPinInput
            v-model="verificationPinCode"
            type="number"
            :length="6"
            placeholder="○"
            :ui="{ base: 'text-2xl font-mono' }"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <UButton
            icon="i-lucide-shield-off"
            @click="confirmDisable2FA"
            color="error"
            :loading="isVerifying"
            :disabled="!isPinComplete"
          >
            Confirm Disable
          </UButton>
          <UButton
            @click="cancelDisable"
            color="neutral"
            variant="outline"
            :disabled="isVerifying"
          >
            Cancel
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Info Card -->
    <UCard
      v-if="is2FAEnabled && !showDisableConfirm"
      class="bg-gradient-to-tl from-green-500/10 from-5% to-default"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-info"
            class="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
          />
          <div class="text-sm text-muted">
            <p class="font-medium text-highlighted mb-1">How does 2FA work?</p>
            <ul class="space-y-1 list-disc list-inside">
              <li>Enter your password and 6-digit 2FA code to log in.</li>
              <li>The 6-digit code changes every 30 seconds.</li>
              <li>Protects your account even if your password is stolen.</li>
            </ul>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

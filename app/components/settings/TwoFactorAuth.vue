<script setup lang="ts">
// 2FA widget reused in security pages
import { ref } from "vue";
import { vMaska } from "maska/vue";
// import { vMaska } from "maska"

const toast = useToast();

const is2FAEnabled = ref(false);
const showQRCode = ref(false);
const showDisableConfirm = ref(false);
const verificationCode = ref("");
const isVerifying = ref(false);
const isQrLoading = ref(true);

const secretKey = ref("JBSWY3DPEHPK3PXP");
const issuer = "YourApp";
const account = "user@example.com";

// สร้าง OTP Auth URL สำหรับทำ QR Code
const qrCodeValue = computed(() => {
  return `otpauth://totp/${issuer}:${account}?secret=${secretKey.value}&issuer=${issuer}`;
});

const enable2FA = async () => {
  showQRCode.value = true;
  isQrLoading.value = true;
  setTimeout(() => {
    isQrLoading.value = false;
  }, 500);
};

const verify2FA = async () => {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
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
    verificationCode.value = "";
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
  if (!verificationCode.value || verificationCode.value.length !== 6) {
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
    verificationCode.value = "";
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
  verificationCode.value = "";
};

const cancelDisable = () => {
  showDisableConfirm.value = false;
  verificationCode.value = "";
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
              :value="qrCodeValue"
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
            <UInput
              v-maska="'######'"
              v-model="verificationCode"
              placeholder="000000"
              maxlength="6"
              class="flex-1 max-w-[240px]"
              :ui="{ base: 'text-center text-2xl tracking-widest font-mono' }"
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
            :disabled="verificationCode.length !== 6"
          >
            Verify and Enable
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
          <UInput
            v-maska="'######'"
            v-model="verificationCode"
            placeholder="000000"
            maxlength="6"
            class="flex-1 max-w-[240px]"
            :ui="{ base: 'text-center text-2xl tracking-widest font-mono' }"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <UButton
            icon="i-lucide-shield-off"
            @click="confirmDisable2FA"
            color="error"
            :loading="isVerifying"
            :disabled="verificationCode.length !== 6"
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
              <li>
                When you log in, you will need to enter your password and a 6-digit code
                from your app.
              </li>
              <li>The 6-digit code changes every 30 seconds.</li>
              <li>
                Even with your password, 2FA keeps your account inaccessible to others.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import * as z from "zod";
import type { FormError } from "@nuxt/ui";

const progressPlanning = ref(50);
const progressRiskResponse = ref(85);
const progressCompletion = ref(15);
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar :title="$t('home_link')" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="flex flex-col space-y-4 w-full mx-auto">
        <UCard variant="subtle" ref="workingPaperRef">
          <template #header>
            <div class="flex justify-between items-center">
              <h1 class="text-xl font-semibold">Title Template</h1>
            </div>
          </template>
          <p>This is the body of card.</p>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style></style>

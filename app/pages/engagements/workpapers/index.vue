<script setup lang="ts">
import type { AccordionItem, TableColumn, ProgressProps } from '@nuxt/ui'

definePageMeta({
  middleware: ["auth"],
})

/* ------------------ Types ------------------ */

type WorkingRow = {
  name: string
  progress: number
  dueDate: string
  // color?: ProgressProps['color']
}

type StatusOption = {
  label: string
  color?: ProgressProps['color']
  icon?: string
  bgIcon: string
  colorIcon: string
}

type WorkingSection = AccordionItem & {
  rows: WorkingRow[]
}

/* ------------------ State ------------------ */
const progressPlanning = ref(50)
const progressRiskResponse = ref(85)
const progressCompletion = ref(15)

const startDate = ref("01 ธ.ค. 2566")
const endDate = ref("31 ธ.ค. 2566")
const companyName = ref("การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย")

const selectedWorkingPaper = ref("planning")

const open = ref(false)

const workingPaperOptions = [
  { label: "Planning", value: "planning" },
  { label: "Responding to Risk", value: "responding-to-risk" },
  { label: "Complete", value: "complete" },
]

const statusOptions = [
  {
    label: "On Track", color: "success", icon: "i-lucide-check-circle-2",
    bgIcon: "bg-emerald-500/10", colorIcon: "text-emerald-500"
  },
  {
    label: "At Risk", color: "warning", icon: "i-lucide-alert-triangle",
    bgIcon: "bg-amber-500/10", colorIcon: "text-amber-500"
  },
  {
    label: "Behind Schedule", color: "error", icon: "i-lucide-clock-3",
    bgIcon: "bg-rose-500/10", colorIcon: "text-rose-500"
  },
  {
    label: "Completed", color: "success", icon: "i-lucide-badge-check",
    bgIcon: "bg-emerald-500/10", colorIcon: "text-emerald-500"
  },
  {
    label: "In Progress", color: "info", icon: "i-lucide-activity",
    bgIcon: "bg-blue-500/10", colorIcon: "text-blue-500"
  },
] as const satisfies readonly StatusOption[]

const selectedStatus = ref<StatusOption>(
  // statusOptions[4] ?? statusOptions[0]
  // statusOptions.find(option => option.label === "On Track") ?? statusOptions[0]
  statusOptions[Math.floor(Math.random() * statusOptions.length)] ?? statusOptions[0]
)

const selectedRow = ref<WorkingRow | null>(null)

const dropdownItems = [
  [
    { label: "Settings", slot: "header" }
  ],
  [
    {
      label: "Add Working paper",
      icon: "i-lucide-plus",
      click: () => console.log("Add document"),
    },
    {
      label: "Set Due Date",
      icon: "i-lucide-calendar",
      click: () => console.log("Set due date"),
    },
  ],
]

const accordionItems: WorkingSection[] = [
  {
    label: 'เริ่มต้นการทำงาน (Initiation)',
    icon: 'i-lucide-clipboard-list',
    content: 'Prepare audit plan, scope and objectives.',
    rows: [
      { name: 'การตอบรับงาน/เสนองานลูกค้าใหม่', progress: 76, dueDate: '31 ม.ค. 2567' },
      { name: 'ความเสี่ยงในการรับงาน', progress: 50, dueDate: '28 ม.ค. 2567' },
      { name: 'การตัดสินใจรับงาน', progress: 24, dueDate: '25 ม.ค. 2567' },
    ],
  },
  {
    label: '1. การทำความเข้าใจเกี่ยวกับกิจการและสภาพแวดล้อมของกิจการ',
    icon: 'i-lucide-shield-alert',
    content: 'Identify risk and mitigation strategy.',
    rows: [
      { name: '1.1 ทำความเข้าใจโครงสร้างและลักษณะของกิจการ (Entity \'s Nature)', progress: 64, dueDate: '05 ก.พ. 2567' },
      { name: '1.2 วิเคราะห์ปัจจัยสภาพแวดล้อมของกิจการ ที่ส่งผลต่อการดำเนินงาน และวิเคราะห์เปรียบเทียบงบการเงินขั้นต้น', progress: 38, dueDate: '10 ก.พ. 2567' },
    ],
  },
  {
    label: '2. การกำหนดระดับสาระสำคัญ (Materiality Levels)',
    icon: 'i-lucide-check-circle',
    content: 'Finalize documentation and approval.',
    rows: [
      { name: '2.1 ทำความเข้าใจธุรกิจและผุ้ใช้งบการเงิน', progress: 82, dueDate: '15 ก.พ. 2567' },
      { name: '2.2 เลือกฐานที่ใช้ในการคำนวณสาระสำคัญและกำหนดสาระสำคัญ', progress: 55, dueDate: '18 ก.พ. 2567' },
    ],
  }
]

const workingColumns: TableColumn<WorkingRow>[] = [
  {
    accessorKey: 'name',
    header: 'Item name',
    meta: {
      class: {
        th: 'w-2/5',
        td: 'w-2/5 whitespace-normal break-words',
      },
    },
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    meta: {
      class: {
        th: 'w-1/5 text-center',
        td: 'w-1/5',
      },
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Due date',
    meta: {
      class: {
            th: 'w-1/5 text-center',
            td: 'w-1/5 text-center',
      },
    },
  },
  {
    id: 'action',
    header: 'Menu options',
    cell: () => null,
    meta: {
      class: {
            th: 'w-1/5 text-center',
            td: 'w-1/5 text-center',
      },
    },
  },
]

/* ------------------ Methods ------------------ */

const getProgressColor = (progress: number) => {
  if (progress <= 25) {
    return "error";
  } else if (progress <= 75) {
    return "warning";
  } else {
    return "success";
  }
};
</script>

<template>
  <UDashboardPanel id="home">
    <!-- ================= HEADER ================= -->
    <template #header>
      <UDashboardNavbar :ui="{ right: 'gap-2' }">
        <template #leading>
          <UDashboardSidebarCollapse />
          <div class="ml-2">
            <p class="text-xs text-gray-500">Enterprise Computer Systems</p>
            <!-- <p class="text-xs text-gray-500">Dashboard</p> -->
            <h1 class="text-lg font-semibold">Question</h1>
          </div>
        </template>

        <!-- <template #right>
          <UButton icon="i-lucide-plus" label="New" size="sm" color="primary" />
        </template> -->
      </UDashboardNavbar>
    </template>

    <!-- ================= BODY ================= -->
    <template #body>
      <!-- Header Section -->
      <div class="mb-3 pb-3 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-3 mb-2">
          <div class="flex items-center justify-center p-2 bg-primary/10 rounded-lg">
            <UIcon name="i-lucide-clipboard-list" class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Working Paper
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and track your audit documentation progress
            </p>
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <!-- ===== Summary Cards ===== -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Company -->
          <UPageCard variant="subtle" class="hover:shadow-md transition">
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center p-3 rounded-xl bg-indigo-500/10"
              >
                <UIcon name="i-lucide-building-2" class="w-6 h-6 text-indigo-400" />
              </div>

              <div>
                <p class="text-xs text-gray-500">Company</p>
                <p class="font-semibold">{{ companyName }}</p>
              </div>
            </div>
          </UPageCard>

          <!-- Period -->
          <UPageCard variant="subtle" class="hover:shadow-md transition">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center p-3 rounded-xl bg-blue-500/10">
                <UIcon name="i-lucide-calendar" class="w-6 h-6 text-blue-500" />
              </div>

              <div>
                <p class="text-xs text-gray-500">Accounting Period</p>
                <p class="font-medium text-sm">{{ startDate }} → {{ endDate }}</p>
              </div>
            </div>
          </UPageCard>

          <!-- Status -->
          <UPageCard variant="subtle" class="hover:shadow-md transition">
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center p-3 rounded-xl"
                :class="selectedStatus.bgIcon"
              >
                <UIcon
                  :name="selectedStatus.icon"
                  class="w-6 h-6"
                  :class="selectedStatus.colorIcon"
                />
              </div>

              <div>
                <p class="text-xs text-gray-500">Overall Status</p>
                <UBadge :color="selectedStatus.color" variant="subtle">{{
                  selectedStatus.label
                }}</UBadge>
              </div>
            </div>
          </UPageCard>
        </div>

        <!-- ===== Progress ===== -->
        <UPageCard>
          <template #header>
            <div class="flex items-center justify-between gap-2 w-full">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-activity" class="w-5 h-5 text-primary" />
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Work Progress
                </h2>
              </div>
              <!-- <UBadge color="primary" variant="subtle">Realtime</UBadge> -->
            </div>
          </template>

          <div class="space-y-5">
            <!-- Planning -->
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Planning</span>
                <UBadge size="lg" :color="getProgressColor(progressPlanning)"
                  >{{ progressPlanning }}%</UBadge
                >
              </div>
              <UProgress
                v-model="progressPlanning"
                :color="getProgressColor(progressPlanning)"
                :ui="{ indicator: 'striped-bar animate-striped' }"
              />
            </div>

            <!-- Risk -->
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Responding to Risk</span>
                <UBadge size="lg" :color="getProgressColor(progressRiskResponse)"
                  >{{ progressRiskResponse }}%</UBadge
                >
              </div>
              <UProgress
                v-model="progressRiskResponse"
                :color="getProgressColor(progressRiskResponse)"
                :ui="{ indicator: 'striped-bar animate-striped' }"
              />
            </div>

            <!-- Complete -->
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Completion</span>
                <UBadge size="lg" :color="getProgressColor(progressCompletion)"
                  >{{ progressCompletion }}%</UBadge
                >
              </div>
              <UProgress
                v-model="progressCompletion"
                :color="getProgressColor(progressCompletion)"
                :ui="{ indicator: 'striped-bar animate-striped' }"
              />
            </div>
          </div>
        </UPageCard>

        <!-- ===== Working Paper ===== -->
        <UCard variant="subtle">
          <template #header>
            <div class="flex items-center justify-between gap-2 w-full">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-file-text" class="w-5 h-5 text-primary" />
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Working Paper
                </h2>
              </div>
              <div class="flex gap-2">
                <USelect
                  icon="i-lucide-search"
                  v-model="selectedWorkingPaper"
                  :items="workingPaperOptions"
                  class="min-w-[220px]"
                  :ui="{ item: 'cursor-pointer' }"
                />

                <UDropdownMenu
                  :items="dropdownItems"
                  :content="{
                    align: 'end',
                    side: 'bottom',
                    sideOffset: 8,
                  }"
                >
                  <UButton icon="i-lucide-settings" variant="soft" color="neutral" />
                </UDropdownMenu>
              </div>
            </div>
            <!-- <div class="flex flex-wrap gap-3 items-center justify-between">
              <UIcon name="i-lucide-file-text" class="w-5 h-5 text-primary" />
              <h2 class="font-semibold">Working Paper</h2>

              <div class="flex gap-2 w-full sm:w-auto">
                <USelect
                  v-model="selectedWorkingPaper"
                  :items="workingPaperOptions"
                  class="min-w-[220px]"
                />

                <UDropdownMenu :items="dropdownItems">
                  <UButton icon="i-lucide-settings" variant="soft" color="neutral" />
                </UDropdownMenu>
              </div>
            </div> -->
          </template>

          <!-- Accordion -->
          <UAccordion type="multiple" :items="accordionItems" class="divide-y">
            <template #body="{ item }">
              <div class="py-3">
                <UTable :data="item.rows" :columns="workingColumns" class="w-full">
                  <!-- Progress Cell -->
                  <template #progress-cell="{ row }">
                    <div class="flex items-center gap-2">
                      <UProgress
                        :model-value="row.original.progress"
                        :color="getProgressColor(row.original.progress)"
                        size="sm"
                        class="flex-1"
                        :ui="{ indicator: 'striped-bar animate-striped' }"
                      />
                      <span class="text-xs font-semibold">
                        {{ row.original.progress }}%
                      </span>
                    </div>
                  </template>

                  <!-- Action Cell -->
                  <template #action-cell="{ row }">
                    <div class="flex justify-center">
                      <UModal
                        :dismissible="false"
                        v-model:open="open"
                        :ui="{
                          footer: 'justify-start',
                          content: 'w-[95vw] max-w-[1800px] h-[90vh] max-h-[900px]',
                        }"
                      >
                        <template #header>
                          <div class="space-y-3 w-full relative">
                            <UButton
                              icon="i-lucide-x"
                              color="neutral"
                              variant="ghost"
                              size="xs"
                              class="absolute right-0 top-0"
                              @click="open = false"
                            />
                            <h3
                              class="text-lg font-semibold text-gray-900 dark:text-white"
                            >
                              {{ selectedRow?.name || "Working Paper" }}
                            </h3>

                            <div class="w-full">
                              <!-- Grid layout: แสดงแบบ 2 cards บน Desktop, stack บน Mobile -->
                              <div class="grid gap-3 md:gap-4 md:grid-cols-12">
                                <!-- Due Date Card - ซ่อนบน mobile -->
                                <UPageCard
                                  variant="subtle"
                                  class="hidden md:block hover:shadow-md transition md:col-span-4 lg:col-span-3 xl:col-span-2"
                                  :ui="{ container: 'p-4 sm:p-2' }"
                                >
                                  <div class="flex items-center gap-2">
                                    <div
                                      class="flex items-center justify-center p-2 rounded-lg bg-indigo-500/10"
                                    >
                                      <UIcon
                                        name="i-lucide-calendar-clock"
                                        class="w-5 h-5 text-indigo-400"
                                      />
                                    </div>
                                    <div>
                                      <p class="text-xs text-gray-500">Due Date</p>
                                      <p class="font-semibold text-sm">
                                        {{ selectedRow?.dueDate || "—" }}
                                      </p>
                                    </div>
                                  </div>
                                </UPageCard>

                                <!-- Progress Card - แสดงทั้ง mobile และ desktop -->
                                <UPageCard
                                  variant="subtle"
                                  class="hover:shadow-md transition md:col-span-8 lg:col-span-9 xl:col-span-10"
                                  :ui="{ container: 'p-4 sm:p-2' }"
                                >
                                  <div class="flex items-center gap-2">
                                    <div
                                      class="flex items-center justify-center p-2 rounded-lg bg-indigo-500/10"
                                    >
                                      <UIcon
                                        name="i-lucide-activity"
                                        class="w-5 h-5 text-indigo-400"
                                      />
                                    </div>
                                    <div class="flex-1">
                                      <p class="text-xs text-gray-500">Progress</p>
                                      <div class="flex items-center gap-2 mt-0.5">
                                        <UBadge
                                          size="sm"
                                          variant="subtle"
                                          :color="
                                            getProgressColor(selectedRow?.progress || 0)
                                          "
                                        >
                                          {{ selectedRow?.progress ?? 0 }}%
                                        </UBadge>
                                        <UProgress
                                          :model-value="selectedRow?.progress || 0"
                                          :color="
                                            getProgressColor(selectedRow?.progress || 0)
                                          "
                                          class="flex-1"
                                          :ui="{
                                            indicator: 'striped-bar animate-striped',
                                          }"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </UPageCard>
                              </div>
                            </div>
                          </div>
                        </template>
                        <UButton
                          size="xs"
                          icon="i-lucide-file-pen-line"
                          label="Open"
                          color="neutral"
                          variant="subtle"
                          @click="selectedRow = row.original"
                        />

                        <template #body>
                          <div class="space-y-4">
                            <!-- <div class="grid gap-4 md:grid-cols-3">
                              <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                                <p
                                  class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400"
                                >
                                  Item Name
                                </p>
                                <p
                                  class="text-sm font-semibold text-gray-900 dark:text-white"
                                >
                                  {{ selectedRow?.name || "—" }}
                                </p>
                              </div>

                              <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                                <p
                                  class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400"
                                >
                                  Progress
                                </p>
                                <div class="flex items-center gap-2">
                                  <UBadge
                                    size="lg"
                                    :color="getProgressColor(selectedRow?.progress || 0)"
                                    variant="subtle"
                                  >
                                    {{ selectedRow?.progress ?? 0 }}%
                                  </UBadge>
                                  <UProgress
                                    :model-value="selectedRow?.progress || 0"
                                    :color="getProgressColor(selectedRow?.progress || 0)"
                                    size="sm"
                                    class="flex-1"
                                    :ui="{ indicator: 'striped-bar animate-striped' }"
                                  />
                                </div>
                              </div>

                              <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                                <p
                                  class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400"
                                >
                                  Due Date
                                </p>
                                <p
                                  class="text-sm font-semibold text-gray-900 dark:text-white"
                                >
                                  {{ selectedRow?.dueDate || "—" }}
                                </p>
                              </div>
                            </div> -->

                            <!-- <div class="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                              <p class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Notes</p>
                              <p class="text-sm text-gray-600 dark:text-gray-300">
                                เพิ่มรายละเอียดเอกสาร แนวทางตรวจสอบ หรือสิ่งที่ต้องติดตามเพิ่มเติมได้ที่นี่
                              </p>
                            </div> -->
                            123<br /><br /><br /><br /><br /><br /><br />
                            <br /><br /><br /><br /><br /><br /><br /><br />
                            <br /><br /><br /><br /><br /><br /><br /><br />
                            <br /><br />456
                          </div>
                        </template>

                        <template #footer="{ close }">
                          <UButton
                            label="Cancel"
                            color="neutral"
                            variant="outline"
                            @click="close"
                          />
                        </template>
                      </UModal>
                    </div>
                  </template>
                </UTable>
              </div>
            </template>
          </UAccordion>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style>
/* Striped Progress Animation */
.striped-bar {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.35) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.35) 50%,
    rgba(255, 255, 255, 0.35) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.animate-striped {
  animation: progress-bar-stripes 1s linear infinite;
}

@keyframes progress-bar-stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}
</style>

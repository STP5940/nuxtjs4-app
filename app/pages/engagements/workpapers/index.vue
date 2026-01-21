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
const companyName = ref("เอ็นเตอร์ไพรส์ คอมพิวเตอร์ ซิสเท็มส์ (ประเทศไทย)")

const selectedWorkingCategory = ref("planning")

const workingPaperCategories = [
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

const selectedWorkingRow = ref<WorkingRow | null>(null)

const workingPaperMenuItems = [
  [
    { label: "Settings", slot: "header" }
  ],
  [
    {
      label: "Add Working paper",
      icon: "i-lucide-plus",
      onSelect: () => {
        console.log("Add Working paper");
        window.alert("Add Working paper clicked!");
      },
    },
    {
      label: "Set Due Date",
      icon: "i-lucide-calendar",
      onSelect: () => {
        console.log("Set Due Date");
        window.alert("Set Due Date clicked!");
      }
    },
  ],
]

const modalRowMenuItems = [
  [{ label: "ค่าคำถาม และคำตอบ", slot: "header" }],
  [
    {
      label: "แก้ไขคำถาม",
      icon: "i-lucide-pencil",
      onSelect: () => {
        console.log("Edit Question");
        window.alert("Edit Question clicked!");
      },
    },
    {
      label: "ลบคำถาม",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => {
        console.log("Delete Question");
        window.alert("Delete Question clicked!");
      },
    },
    {
      label: "เพิ่มคำตอบ",
      icon: "i-lucide-plus",
      onSelect: () => {
        console.log("Add Answer");
        window.alert("Add Answer clicked!");
      },
    },
  ],
  [
    {
      label: "แก้ไขคำตอบ",
      icon: "i-lucide-pencil",
      onSelect: () => {
        console.log("Edit Answer");
        window.alert("Edit Answer clicked!");
      },
    },
    {
      label: "ลบคำตอบ",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => {
        console.log("Delete Answer");
        window.alert("Delete Answer clicked!");
      },
    },
  ],
];

// Settings menu for modal accordion (หัวข้อคำถาม)
const modalAccordionMenuItems = [
  [
    { label: "ตั้งค่าหัวข้อคำถาม", slot: "header" }],
  [
    {
      label: "แก้ไขหัวข้อคำถาม",
      icon: "i-lucide-pencil",
      onSelect: () => {
        console.log("Edit Section");
        window.alert("Edit Section clicked!");
      },
    },
  ],
]

const workingPaperSections: WorkingSection[] = [
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
    icon: 'i-lucide-shield-alert',
    content: 'Finalize documentation and approval.',
    rows: [
      { name: '2.1 ทำความเข้าใจธุรกิจและผุ้ใช้งบการเงิน', progress: 82, dueDate: '15 ก.พ. 2567' },
      { name: '2.2 เลือกฐานที่ใช้ในการคำนวณสาระสำคัญและกำหนดสาระสำคัญ', progress: 55, dueDate: '18 ก.พ. 2567' },
    ],
  }
]

const modalAccordionItems: AccordionItem[] = [
  {
    label: "1.1.1 ลักษณะของกิจการ (Nature of the Entity) TSA 315.12(a)",
    icon: "i-lucide-scroll-text",
    content: "Summary of the selected working paper.",
  },
  {
    label:
      "1.1.2 สภาพแวดล้อมด้านกฎระเบียบและกฎหมาย (Regulatory Environment) TSA315.12(b)",
    icon: "i-lucide-scroll-text",
    content: "Key details and references.",
  },
  {
    label:
      "1.1.3 นโยบายและกระบวนการบัญชี (Entity's Accounting Policies and Procedures) TSA315.12(c)",
    icon: "i-lucide-scroll-text",
    content: "Additional comments or attachments.",
  },
  {
    label:
      "1.1.4 กลยุทธ์และเป้าหมายของกิจการ (Entity's Objectives and Strategies) TSA315.12(d)",
    icon: "i-lucide-scroll-text",
    content: "Audit objectives and expected outcomes.",
  },
  {
    label:
      "1.1.5 การวัดผลการดำเนินงาน (Measurement and Review of the Entity's Financial Performance) TSA315.12(e)",
    icon: "i-lucide-scroll-text",
    content: "Defined scope, timeframe, and constraints.",
  },
];

const modalRows: ModalRow[] = [
  {
    ref: "REF-001",
    process: `ในส่วนของโครงสร้างการจัดการและการกำกับดูแล

1. ได้รับและรวบรวมเอกสารที่เกี่ยวข้องกับโครงสร้างองค์กร เช่นผังองค์กร หน่วยธุรกิจหลัก ผู้ถือหุ้น TSA315.11(a)
2. สัมภาษณ์ฝ่ายบริหารเพื่อทำความเข้าใจบทบาทและความรับผิดชอบของคณะกรรมการ TSA315.A13`,
    response: [
      { text: "ได้ดำเนินการแล้ว โดยบันทึกรายละเอียดในแบบฟอร์ม [TBD]", checked: false },
      { text: "เพิ่มทีมงานและปรับกำหนดการ", checked: false },
    ],
    evidence: "แนบไฟล์เอกสาร",
    userName: "สมชาย รัตนโชติ",
    updatedAt: "2026-01-10 14:30",
  },
  {
    ref: "REF-002",
    process: `ในส่วนการทำความเข้าใจธุรกิจได้สอบทานลักษณะธุรกิจหลักของกิจการโดย

1. วิเคราะห์ข้อมูลเกี่ยวกับ ผลิตภัณฑ์หรือบริการ TSA315.A14
2. ตรวจสอบสัญญาสำคัญที่เกี่ยวข้องกับการดำเนินงาน TSA315.11(a)
3. สอบทานงบกำไรขาดทุนเพื่อระบุแหล่งรายได้และค่าใช้จ่ายหลัก TSA 315.A16-A17`,
    response: [
      { text: "ได้ดำเนินการแล้วรายละเอียดตามแบบฟอร์ม [TBD]", checked: false },
      { text: "ทดสอบควบคุมเพิ่มเติม", checked: false },
    ],
    evidence: "แนบไฟล์เอกสาร",
    userName: "วราพงษ์ ศรีสุวรรณ",
    updatedAt: "2026-01-12 09:15",
  },
  {
    ref: "REF-003",
    process: "รวบรวมหลักฐาน",
    response: [
      { text: "ขอหลักฐานเพิ่มเติมจากฝ่ายบัญชี", checked: false },
      { text: "ไม่สามารถดำเนินการได้", checked: false },
    ],
    evidence: "แนบไฟล์เอกสาร",
    userName: "ณัฐธิดา พงษ์พิทักษ์",
    updatedAt: "2026-01-15 16:45",
  },
];

const modalColumns: TableColumn<ModalRow>[] = [
  {
    accessorKey: "ref",
    header: "REF #",
    meta: {
      class: {
        th: "w-1/16 text-center",
        td: "w-1/16 text-left",
      },
    },
  },
  {
    accessorKey: "process",
    header: "Process",
    meta: {
      class: {
        th: "w-6/16 text-left",
        td: "w-6/16 text-left whitespace-normal break-words",
      },
    },
  },
  {
    accessorKey: "response",
    header: "Response",
    cell: () => null,
    meta: {
      class: {
        th: "w-3/16 text-left",
        td: "w-3/16 text-left whitespace-normal break-words",
      },
    },
  },
  {
    accessorKey: "evidence",
    header: "Additional Evidence",
    cell: () => null,
    meta: {
      class: {
        th: "w-2/16 text-left",
        td: "w-2/16 text-left",
      },
    },
  },
  {
    accessorKey: "userName",
    header: "User History",
    cell: () => null,
    meta: {
      class: {
        th: "w-2/16 text-left",
        td: "w-2/16 text-left",
      },
    },
  },
  {
    id: "action",
    header: "Menu options",
    cell: () => null,
    meta: {
      class: {
        th: "w-2/16 text-center",
        td: "w-2/16 text-center",
      },
    },
  },
];

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
              Working Paper Question
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
          <UPageCard
            variant="subtle"
            class="hover:shadow-md transition"
            :ui="{ container: 'p-4 sm:p-4' }"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center p-3 rounded-xl bg-indigo-500/10"
              >
                <UIcon name="i-lucide-building-2" class="w-6 h-6 text-indigo-400" />
              </div>

              <div>
                <p class="text-xs text-gray-500">Company</p>
                <p class="font-medium text-sm">{{ companyName }}</p>
                <!-- font-semibold -->
              </div>
            </div>
          </UPageCard>

          <!-- Period -->
          <UPageCard
            variant="subtle"
            class="hover:shadow-md transition"
            :ui="{ container: 'p-4 sm:p-4' }"
          >
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
          <UPageCard
            variant="subtle"
            class="hover:shadow-md transition"
            :ui="{ container: 'p-4 sm:p-4' }"
          >
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
              <UBadge color="primary" variant="subtle">Realtime</UBadge>
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
                  v-model="selectedWorkingCategory"
                  :items="workingPaperCategories"
                  class="min-w-[220px]"
                  :ui="{ item: 'cursor-pointer' }"
                />

                <UDropdownMenu
                  :items="workingPaperMenuItems"
                  :content="{
                    align: 'end',
                    side: 'bottom',
                    sideOffset: 8,
                  }"
                  :ui="{
                    content: 'w-48',
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
                  v-model="selectedWorkingCategory"
                  :items="workingPaperCategories"
                  class="min-w-[220px]"
                />

                <UDropdownMenu :items="workingPaperMenuItems">
                  <UButton icon="i-lucide-settings" variant="soft" color="neutral" />
                </UDropdownMenu>
              </div>
            </div> -->
          </template>

          <!-- Accordion -->
          <UAccordion type="multiple" :items="workingPaperSections" class="divide-y">
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
                        :ui="{
                          footer: 'justify-start',
                          content: 'w-[95vw] max-w-[1800px] h-[90vh] max-h-[900px]',
                          header: 'flex items-start justify-between gap-3',
                          title: 'flex-1 pr-4 break-words line-clamp-2',
                        }"
                      >
                        <template #header="{ close }">
                          <div class="space-y-3 w-full relative">
                            <UButton
                              icon="i-lucide-x"
                              color="neutral"
                              variant="ghost"
                              size="xs"
                              class="absolute right-0 top-0"
                              @click="close"
                            />
                            <h3
                              class="text-lg font-semibold text-gray-900 dark:text-white pr-8 break-words line-clamp-2"
                            >
                              {{ selectedWorkingRow?.name || "Working Paper" }}
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
                                        {{ selectedWorkingRow?.dueDate || "—" }}
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
                                            getProgressColor(
                                              selectedWorkingRow?.progress || 0
                                            )
                                          "
                                        >
                                          {{ selectedWorkingRow?.progress ?? 0 }}%
                                        </UBadge>
                                        <UProgress
                                          :model-value="selectedWorkingRow?.progress || 0"
                                          :color="
                                            getProgressColor(
                                              selectedWorkingRow?.progress || 0
                                            )
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
                          icon="i-lucide-square-chart-gantt"
                          label="Open"
                          color="neutral"
                          variant="subtle"
                          @click="selectedWorkingRow = row.original"
                        />

                        <template #body>
                          <UAccordion
                            type="multiple"
                            :items="modalAccordionItems"
                            class="divide-y"
                          >
                            <template #trailing="{ item, open }">
                              <div class="flex items-center gap-2 ml-auto">
                                <div @click.stop>
                                  <UDropdownMenu
                                    :items="modalAccordionMenuItems"
                                    :content="{
                                      align: 'end',
                                      side: 'bottom',
                                      sideOffset: 8,
                                    }"
                                    :ui="{
                                      content: 'w-48',
                                    }"
                                  >
                                    <UButton
                                      icon="i-lucide-settings"
                                      variant="ghost"
                                      color="neutral"
                                      size="xs"
                                    />
                                  </UDropdownMenu>
                                </div>
                                <UIcon
                                  name="i-lucide-chevron-down"
                                  class="w-5 h-5 transition-transform duration-200"
                                  :class="[open ? 'rotate-180' : '']"
                                />
                              </div>
                            </template>

                            <template #body="{ item }">
                              <div class="py-3">
                                <UTable
                                  :data="modalRows"
                                  :columns="modalColumns"
                                  class="w-full"
                                >
                                  <template #process-cell="{ row }">
                                    <div class="whitespace-pre-wrap text-sm">
                                      {{ row.original.process }}
                                    </div>
                                  </template>
                                  <template #response-cell="{ row }">
                                    <div class="flex flex-col gap-2">
                                      <label
                                        v-for="(item, index) in row.original.response"
                                        :key="index"
                                        class="flex items-start gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                                      >
                                        <UCheckbox
                                          v-model="item.checked"
                                          class="mt-0.5 flex-shrink-0"
                                        />
                                        <span class="text-sm break-words">{{
                                          item.text
                                        }}</span>
                                      </label>
                                    </div>
                                  </template>
                                  <template #evidence-cell="{ row }">
                                    <div class="flex items-center gap-2">
                                      <UIcon
                                        name="i-lucide-paperclip"
                                        class="w-4 h-4 text-gray-500 flex-shrink-0"
                                      />
                                      <span class="text-sm">{{
                                        row.original.evidence
                                      }}</span>
                                    </div>
                                  </template>
                                  <template #userName-cell="{ row }">
                                    <UTooltip
                                      :text="`แก้ไขเมื่อ: ${row.original.updatedAt}`"
                                      :popper="{ placement: 'top' }"
                                    >
                                      <span class="cursor-help">{{
                                        row.original.userName
                                      }}</span>
                                    </UTooltip>
                                  </template>
                                  <template #action-cell="{ row }">
                                    <UDropdownMenu
                                      :items="modalRowMenuItems"
                                      :content="{
                                        align: 'end',
                                        side: 'bottom',
                                        sideOffset: 8,
                                      }"
                                      :ui="{
                                        content: 'w-48',
                                      }"
                                    >
                                      <UButton
                                        icon="i-lucide-ellipsis-vertical"
                                        variant="ghost"
                                        color="neutral"
                                      />
                                    </UDropdownMenu>
                                  </template>
                                </UTable>
                              </div>
                            </template>
                          </UAccordion>
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

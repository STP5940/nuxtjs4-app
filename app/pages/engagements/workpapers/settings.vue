<script setup lang="ts">
import type { AccordionItem, TableColumn } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

/* ------------------ Types ------------------ */

type WorkingRow = {
  name: string;
};

type WorkingSection = AccordionItem & {
  rows: WorkingRow[];
};

type ResponseItem = {
  text: string;
  checked: boolean;
};

type ModalRow = {
  ref: string;
  process: string;
  response: ResponseItem[];
  evidence?: string;
  userName?: string;
  updatedAt?: string;
};

/* ------------------ State ------------------ */

const selectedWorkingCategory = ref("planning");
const selectedWorkingRow = ref<WorkingRow | null>(null);

const workingPaperCategories = ref([
  { label: "Planning", value: "planning" },
  { label: "Responding to Risk", value: "responding-to-risk" },
  { label: "Complete", value: "complete" },
]);

const showAddCategoryModal = ref(false);
const editingCategoryIndex = ref<number | null>(null);
const editingCategoryLabel = ref<string>("");

// Drag and Drop State
const dragSourceCategoryIndex = ref<number | null>(null);
const dropTargetCategoryIndex = ref<number | null>(null);

/* ------------------ Methods ------------------ */

const updateWorkingPaperCategory = (index: number, label: string) => {
  if (!label.trim()) return;

  const option = workingPaperCategories.value[index];
  if (!option) return;

  const newValue = label.toLowerCase().replace(/\s+/g, "-");
  const oldValue = option.value;

  workingPaperCategories.value[index] = {
    label,
    value: newValue,
  };

  // Update selected category if the edited option is currently selected
  if (selectedWorkingCategory.value === oldValue) {
    selectedWorkingCategory.value = newValue;
  }

  editingCategoryIndex.value = null;
};

const deleteWorkingPaperCategory = (index: number) => {
  const deletedValue = workingPaperCategories.value[index]?.value;
  workingPaperCategories.value.splice(index, 1);

  if (selectedWorkingCategory.value === deletedValue) {
    selectedWorkingCategory.value = workingPaperCategories.value[0]?.value || "";
  }
};

// Drag and Drop Methods - ย้ายตำแหน่งแบบสอดแทรก
const handleDragStart = (e: DragEvent, index: number) => {
  dragSourceCategoryIndex.value = index;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
  }
};

const handleDragOver = (e: DragEvent, index: number) => {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "move";
  }

  if (dragSourceCategoryIndex.value !== null && dragSourceCategoryIndex.value !== index) {
    dropTargetCategoryIndex.value = index;
  }
};

const handleDragEnter = (e: DragEvent, index: number) => {
  e.preventDefault();
  if (dragSourceCategoryIndex.value !== null && dragSourceCategoryIndex.value !== index) {
    dropTargetCategoryIndex.value = index;
  }
};

const handleDragLeave = (e: DragEvent) => {
  const target = e.currentTarget as HTMLElement;
  const relatedTarget = e.relatedTarget as HTMLElement;

  if (!target.contains(relatedTarget)) {
    dropTargetCategoryIndex.value = null;
  }
};

const handleDrop = (e: DragEvent, dropIndex: number) => {
  e.preventDefault();
  e.stopPropagation();

  if (
    dragSourceCategoryIndex.value === null ||
    dragSourceCategoryIndex.value === dropIndex
  ) {
    dragSourceCategoryIndex.value = null;
    dropTargetCategoryIndex.value = null;
    return;
  }

  // Remove source then insert at drop target index; items between shift accordingly
  const items = [...workingPaperCategories.value];
  const [moved] = items.splice(dragSourceCategoryIndex.value, 1);
  if (moved) {
    const targetIndex = Math.min(dropIndex, items.length);
    items.splice(targetIndex, 0, moved);
    workingPaperCategories.value = items;
  }

  dragSourceCategoryIndex.value = null;
  dropTargetCategoryIndex.value = null;
};

const handleDragEnd = () => {
  dragSourceCategoryIndex.value = null;
  dropTargetCategoryIndex.value = null;
};

const workingPaperMenuItems = [
  [{ label: "Settings", slot: "header" }],
  [
    {
      label: "Add Working paper",
      icon: "i-lucide-plus",
      onSelect: () => {
        console.log("Add Working paper");
        window.alert("Add Working paper clicked!");
      },
    },
  ],
];

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
  [{ label: "ตั้งค่าหัวข้อคำถาม", slot: "header" }],
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
];

const workingPaperSections: WorkingSection[] = [
  {
    label: "เริ่มต้นการทำงาน (Initiation)",
    icon: "i-lucide-clipboard-list",
    content: "Prepare audit plan, scope and objectives.",
    rows: [
      { name: "การตอบรับงาน/เสนองานลูกค้าใหม่" },
      { name: "ความเสี่ยงในการรับงาน" },
      { name: "การตัดสินใจรับงาน" },
    ],
  },
  {
    label: "1. การทำความเข้าใจเกี่ยวกับกิจการและสภาพแวดล้อมของกิจการ",
    icon: "i-lucide-shield-question-mark",
    content: "Identify risk and mitigation strategy.",
    rows: [
      { name: "1.1 ทำความเข้าใจโครงสร้างและลักษณะของกิจการ (Entity 's Nature)" },
      {
        name:
          "1.2 วิเคราะห์ปัจจัยสภาพแวดล้อมของกิจการ ที่ส่งผลต่อการดำเนินงาน และวิเคราะห์เปรียบเทียบงบการเงินขั้นต้น",
      },
    ],
  },
  {
    label: "2. การกำหนดระดับสาระสำคัญ (Materiality Levels)",
    icon: "i-lucide-shield-question-mark",
    content: "Finalize documentation and approval.",
    rows: [
      { name: "2.1 ทำความเข้าใจธุรกิจและผุ้ใช้งบการเงิน" },
      { name: "2.2 เลือกฐานที่ใช้ในการคำนวณสาระสำคัญและกำหนดสาระสำคัญ" },
    ],
  },
];

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
    // evidence: "แนบไฟล์เอกสาร",
    // userName: "สมชาย รัตนโชติ",
    // updatedAt: "2026-01-10 14:30",
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
    // evidence: "แนบไฟล์เอกสาร",
    // userName: "วราพงษ์ ศรีสุวรรณ",
    // updatedAt: "2026-01-12 09:15",
  },
  {
    ref: "REF-003",
    process: "รวบรวมหลักฐาน",
    response: [
      { text: "ขอหลักฐานเพิ่มเติมจากฝ่ายบัญชี", checked: false },
      { text: "ไม่สามารถดำเนินการได้", checked: false },
    ],
    // evidence: "แนบไฟล์เอกสาร",
    // userName: "ณัฐธิดา พงษ์พิทักษ์",
    // updatedAt: "2026-01-15 16:45",
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
    header: "",
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
    header: "",
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
    accessorKey: "name",
    header: "Item name",
    meta: {
      class: {
        th: "w-4/5",
        td: "w-4/5 whitespace-normal break-words",
      },
    },
  },
  {
    id: "action",
    header: "Menu options",
    cell: () => null,
    meta: {
      class: {
        th: "w-1/5 text-center",
        td: "w-1/5 text-center",
      },
    },
  },
];
</script>

<template>
  <UDashboardPanel id="questions">
    <template #header>
      <UDashboardNavbar :ui="{ right: 'gap-2' }">
        <template #leading>
          <UDashboardSidebarCollapse />
          <div class="ml-2">
            <p class="text-xs text-gray-500">Enterprise Computer Systems</p>
            <h1 class="text-lg font-semibold">Management</h1>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Header Section -->
      <div class="mb-3 pb-3 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-3 mb-2">
          <div class="flex items-center justify-center p-2 bg-primary/10 rounded-lg">
            <UIcon name="i-lucide-clipboard-list" class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Working Paper Management
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and track your audit documentation progress
            </p>
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <!-- Working Paper Options Management Card -->
        <UCard variant="subtle">
          <template #header>
            <div class="flex items-center justify-between gap-2 w-full">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-settings-2" class="w-5 h-5 text-primary" />
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Working Paper Categories
                </h2>
              </div>
              <UButton
                icon="i-lucide-plus"
                label="Add Category"
                color="primary"
                @click="showAddCategoryModal = true"
              />
            </div>
          </template>

          <div class="space-y-2">
            <div
              v-for="(option, index) in workingPaperCategories"
              :key="`${option.value}-${index}`"
              draggable="true"
              @dragstart="handleDragStart($event, index)"
              @dragover="handleDragOver($event, index)"
              @dragenter="handleDragEnter($event, index)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, index)"
              @dragend="handleDragEnd"
              :class="[
                'flex items-center justify-between gap-3 p-3 rounded-lg border',
                'transition-all duration-200 ease-in-out',
                'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                'border-gray-200 dark:border-gray-800',
                dragSourceCategoryIndex === index
                  ? 'opacity-40 scale-95 cursor-grabbing shadow-lg'
                  : 'cursor-grab hover:shadow-md',
                dropTargetCategoryIndex === index && dragSourceCategoryIndex !== index
                  ? 'border-primary border-2 bg-primary/10 scale-[1.02] shadow-md'
                  : '',
              ]"
            >
              <div class="flex items-center gap-3 flex-1">
                <UIcon
                  name="i-lucide-grip-vertical"
                  :class="[
                    'w-5 h-5 flex-shrink-0 transition-colors duration-200',
                    dragSourceCategoryIndex === index
                      ? 'text-primary'
                      : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400',
                  ]"
                />

                <div v-if="editingCategoryIndex !== index" class="flex-1">
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ option.label }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ option.value }}
                  </p>
                </div>

                <div v-else class="flex-1 flex gap-2 py-1.5">
                  <UInput
                    v-model="editingCategoryLabel"
                    placeholder="Category name"
                    class="flex-1"
                  />
                </div>
              </div>

              <div class="flex gap-2">
                <UButton
                  v-if="editingCategoryIndex !== index"
                  icon="i-lucide-pencil"
                  label="Edit"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                  @click="
                    () => {
                      editingCategoryIndex = index;
                      editingCategoryLabel = option.label;
                    }
                  "
                />
                <UButton
                  v-else
                  icon="i-lucide-save"
                  label="Save"
                  color="success"
                  variant="subtle"
                  size="xs"
                  @click="updateWorkingPaperCategory(index, editingCategoryLabel)"
                />
                <UButton
                  v-if="editingCategoryIndex === index"
                  icon="i-lucide-circle-x"
                  label="Cancel"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                  @click="
                    () => {
                      editingCategoryIndex = null;
                      editingCategoryLabel = '';
                    }
                  "
                />

                <UButton
                  v-if="editingCategoryIndex !== index"
                  icon="i-lucide-trash-2"
                  label="Delete"
                  color="error"
                  variant="subtle"
                  size="xs"
                  @click="deleteWorkingPaperCategory(index)"
                />
              </div>
            </div>

            <div
              v-if="workingPaperCategories.length === 0"
              class="text-center py-6 text-gray-500 dark:text-gray-400"
            >
              <p>No categories added yet</p>
            </div>
          </div>
        </UCard>

        <!-- Original Working Paper Card -->
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
                <UIcon
                  v-if="workingPaperCategories.length === 0"
                  name="i-lucide-alert-triangle"
                  class="w-5 h-5 text-yellow-500 self-center"
                  aria-label="Empty"
                />

                <USelect
                  placeholder="Select Working Paper"
                  icon="i-lucide-search"
                  v-model="selectedWorkingCategory"
                  :items="workingPaperCategories"
                  :disabled="workingPaperCategories.length === 0"
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
          </template>

          <UAccordion type="multiple" :items="workingPaperSections" class="divide-y">
            <template #body="{ item }">
              <div class="py-3">
                <UTable :data="item.rows" :columns="workingColumns" class="w-full">
                  <!-- Action Cell -->
                  <template #action-cell="{ row }">
                    <div class="flex justify-center">
                      <UButton
                        size="xs"
                        icon="i-lucide-pencil"
                        label="Edit"
                        color="neutral"
                        variant="subtle"
                        class="mr-2"
                      />
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
                                          disabled
                                        />
                                        <span class="text-sm break-words">{{
                                          item.text
                                        }}</span>
                                      </label>
                                    </div>
                                  </template>
                                  <template #evidence-cell="{ row }">
                                    <!-- <div class="flex items-center gap-2">
                                      <UIcon
                                        name="i-lucide-paperclip"
                                        class="w-4 h-4 text-gray-500 flex-shrink-0"
                                      />
                                      <span class="text-sm">{{
                                        row.original.evidence
                                      }}</span>
                                    </div> -->
                                  </template>
                                  <template #userName-cell="{ row }">
                                    <!-- <UTooltip
                                      :text="`แก้ไขเมื่อ: ${row.original.updatedAt}`"
                                      :popper="{ placement: 'top' }"
                                    >
                                      <span class="cursor-help">{{
                                        row.original.userName
                                      }}</span>
                                    </UTooltip> -->
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

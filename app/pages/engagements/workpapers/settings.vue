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

/* ------------------ State ------------------ */

const selectedWorkingPaper = ref("planning");
const selectedRow = ref<WorkingRow | null>(null);

const workingPaperOptions = ref([
  { label: "Planning", value: "planning" },
  { label: "Responding to Risk", value: "responding-to-risk" },
  { label: "Complete", value: "complete" },
]);

const showAddOptionModal = ref(false);
const editingOptionIndex = ref<number | null>(null);
const editingOptionLabel = ref<string>("");

// Drag and Drop State
const dragSourceIndex = ref<number | null>(null);
const dropTargetIndex = ref<number | null>(null);

/* ------------------ Methods ------------------ */

const updateWorkingPaperOption = (index: number, label: string) => {
  if (!label.trim()) return;

  const option = workingPaperOptions.value[index];
  if (!option) return;

  const newValue = label.toLowerCase().replace(/\s+/g, "-");
  const oldValue = option.value;

  workingPaperOptions.value[index] = {
    label,
    value: newValue,
  };

  // Update selectedWorkingPaper if the edited option is currently selected
  if (selectedWorkingPaper.value === oldValue) {
    selectedWorkingPaper.value = newValue;
  }

  editingOptionIndex.value = null;
};

const deleteWorkingPaperOption = (index: number) => {
  const deletedValue = workingPaperOptions.value[index]?.value;
  workingPaperOptions.value.splice(index, 1);

  if (selectedWorkingPaper.value === deletedValue) {
    selectedWorkingPaper.value = workingPaperOptions.value[0]?.value || "";
  }
};

// Drag and Drop Methods - ย้ายตำแหน่งแบบสอดแทรก
const handleDragStart = (e: DragEvent, index: number) => {
  dragSourceIndex.value = index;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
  }
};

const handleDragOver = (e: DragEvent, index: number) => {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "move";
  }

  if (dragSourceIndex.value !== null && dragSourceIndex.value !== index) {
    dropTargetIndex.value = index;
  }
};

const handleDragEnter = (e: DragEvent, index: number) => {
  e.preventDefault();
  if (dragSourceIndex.value !== null && dragSourceIndex.value !== index) {
    dropTargetIndex.value = index;
  }
};

const handleDragLeave = (e: DragEvent) => {
  const target = e.currentTarget as HTMLElement;
  const relatedTarget = e.relatedTarget as HTMLElement;

  if (!target.contains(relatedTarget)) {
    dropTargetIndex.value = null;
  }
};

const handleDrop = (e: DragEvent, dropIndex: number) => {
  e.preventDefault();
  e.stopPropagation();

  if (dragSourceIndex.value === null || dragSourceIndex.value === dropIndex) {
    dragSourceIndex.value = null;
    dropTargetIndex.value = null;
    return;
  }

  // Remove source then insert at drop target index; items between shift accordingly
  const items = [...workingPaperOptions.value];
  const [moved] = items.splice(dragSourceIndex.value, 1);
  if (moved) {
    const targetIndex = Math.min(dropIndex, items.length);
    items.splice(targetIndex, 0, moved);
    workingPaperOptions.value = items;
  }

  dragSourceIndex.value = null;
  dropTargetIndex.value = null;
};

const handleDragEnd = () => {
  dragSourceIndex.value = null;
  dropTargetIndex.value = null;
};

const dropdownItems = [
  [{ label: "Settings", slot: "header" }],
  [
    {
      label: "Add Working paper",
      icon: "i-lucide-plus",
      click: () => console.log("Add document"),
    },
  ],
];

const accordionItems: WorkingSection[] = [
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
                @click="showAddOptionModal = true"
              />
            </div>
          </template>

          <div class="space-y-2">
            <div
              v-for="(option, index) in workingPaperOptions"
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
                dragSourceIndex === index
                  ? 'opacity-40 scale-95 cursor-grabbing shadow-lg'
                  : 'cursor-grab hover:shadow-md',
                dropTargetIndex === index && dragSourceIndex !== index
                  ? 'border-primary border-2 bg-primary/10 scale-[1.02] shadow-md'
                  : '',
              ]"
            >
              <div class="flex items-center gap-3 flex-1">
                <UIcon
                  name="i-lucide-grip-vertical"
                  :class="[
                    'w-5 h-5 flex-shrink-0 transition-colors duration-200',
                    dragSourceIndex === index
                      ? 'text-primary'
                      : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400',
                  ]"
                />

                <div v-if="editingOptionIndex !== index" class="flex-1">
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ option.label }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ option.value }}
                  </p>
                </div>

                <div v-else class="flex-1 flex gap-2">
                  <UInput
                    v-model="editingOptionLabel"
                    placeholder="Category name"
                    class="flex-1"
                  />
                </div>
              </div>

              <div class="flex gap-2">
                <UButton
                  v-if="editingOptionIndex !== index"
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="
                    () => {
                      editingOptionIndex = index;
                      editingOptionLabel = option.label;
                    }
                  "
                />
                <UButton
                  v-else
                  icon="i-lucide-check"
                  color="success"
                  variant="ghost"
                  size="xs"
                  @click="updateWorkingPaperOption(index, editingOptionLabel)"
                />
                <UButton
                  v-if="editingOptionIndex === index"
                  icon="i-lucide-x"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="
                    () => {
                      editingOptionIndex = null;
                      editingOptionLabel = '';
                    }
                  "
                />

                <UButton
                  v-if="editingOptionIndex !== index"
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="deleteWorkingPaperOption(index)"
                />
              </div>
            </div>

            <div
              v-if="workingPaperOptions.length === 0"
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
                  v-if="workingPaperOptions.length === 0"
                  name="i-lucide-alert-triangle"
                  class="w-5 h-5 text-yellow-500 self-center"
                  aria-label="Empty"
                />

                <USelect
                  placeholder="Select Working Paper"
                  icon="i-lucide-search"
                  v-model="selectedWorkingPaper"
                  :items="workingPaperOptions"
                  :disabled="workingPaperOptions.length === 0"
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
          </template>

          <UAccordion type="multiple" :items="accordionItems" class="divide-y">
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
                        :title="selectedRow?.name || 'Working Paper'"
                        desciption="Detailed view of the selected working paper item."
                        :dismissible="false"
                        :ui="{
                          footer: 'justify-start',
                          content: 'w-[95vw] max-w-[1800px] h-[90vh] max-h-[900px]',
                        }"
                      >
                        <UButton
                          size="xs"
                          icon="i-lucide-square-chart-gantt"
                          label="Open"
                          color="neutral"
                          variant="subtle"
                          @click="selectedRow = row.original"
                        />

                        <template #body>
                          <div class="space-y-4">
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

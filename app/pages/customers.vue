<script setup lang="ts">
// app/pages/customers.vue
import { getPaginationRowModel } from "@tanstack/table-core";
import type { Row } from "@tanstack/table-core";
import type { TableColumn } from "@nuxt/ui";
import { upperFirst } from "scule";

import type { User } from "~/types";

definePageMeta({
  middleware: ["auth"],
});

const UAvatar = resolveComponent("UAvatar");
const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UCheckbox = resolveComponent("UCheckbox");

const toast = useToast();
const table = useTemplateRef("table");

const columnFilters = ref([
  {
    id: "email",
    value: "",
  },
]);
const columnVisibility = ref();
const rowSelection = ref({ 1: true });

const accessToken = useCookie("access_token");
const { data, status, pending, error, execute } = await useFetch<User[]>(
  "/api/customers",
  {
    lazy: true,
    method: "GET",
    headers: computed(() => ({
      Authorization: `Bearer ${accessToken.value}`, // reactive
    })),
  }
);

// ⚠️ ตรวจจับข้อผิดพลาดแสดง log console
// กรณีที่ token ถูก revoke ก่อนหมดอายุ
watch(
  error,
  async (newError) => {
    // ตรวจสอบว่าเป็น Client-side เพื่อให้ log console ทำงาน
    if (import.meta.client && newError) {
      // refresh token ถูก revoked ให้ไปที่หน้า login
      if (newError.statusCode === 403) {
        console.log("Unauthorized access - possibly invalid token.");
        console.log("Status code:", newError.statusCode);
        console.log(`Error fetching users: ${newError.message}`);
        setTimeout(async () => {
          await navigateTo("/login");
        }, 2000); // หน่วงเวลา 2000 มิลลิวินาที (2 วินาที)
      }
    }
  },
  { immediate: true }
);

function getRowItems(row: Row<User>) {
  return [
    {
      type: "label",
      label: "Actions",
    },
    {
      label: "Copy customer ID",
      icon: "i-lucide-copy",
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString());
        toast.add({
          title: "Copied to clipboard",
          description: "Customer ID copied to clipboard",
        });
      },
    },
    {
      type: "separator",
    },
    {
      label: "View customer details",
      icon: "i-lucide-list",
    },
    {
      label: "View customer payments",
      icon: "i-lucide-wallet",
    },
    {
      type: "separator",
    },
    {
      label: "Delete customer",
      icon: "i-lucide-trash",
      color: "error",
      onSelect() {
        toast.add({
          title: "Customer deleted",
          description: "The customer has been deleted.",
        });
      },
    },
  ];
}

const columns: TableColumn<User>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        ariaLabel: "Select row",
      }),
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return h("div", { class: "flex items-center gap-3" }, [
        h(UAvatar, {
          ...row.original.avatar,
          size: "lg",
        }),
        h("div", undefined, [
          h("p", { class: "font-medium text-highlighted" }, row.original.name),
          h("p", { class: "" }, `@${row.original.name}`),
        ]),
      ]);
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Email",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => row.original.location,
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: "equals",
    cell: ({ row }) => {
      const color = {
        subscribed: "success" as const,
        unsubscribed: "error" as const,
        bounced: "warning" as const,
      }[row.original.status];

      return h(
        UBadge,
        { class: "capitalize", variant: "subtle", color },
        () => row.original.status
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: {
              align: "end",
            },
            items: getRowItems(row),
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto",
            })
        )
      );
    },
  },
];

const statusFilter = ref("all");

watch(
  () => statusFilter.value,
  (newVal) => {
    if (!table?.value?.tableApi) return;

    const statusColumn = table.value.tableApi.getColumn("status");
    if (!statusColumn) return;

    if (newVal === "all") {
      statusColumn.setFilterValue(undefined);
    } else {
      statusColumn.setFilterValue(newVal);
    }
  }
);

const email = computed({
  get: (): string => {
    return (table.value?.tableApi?.getColumn("email")?.getFilterValue() as string) || "";
  },
  set: (value: string) => {
    table.value?.tableApi?.getColumn("email")?.setFilterValue(value || undefined);
  },
});

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});
</script>

<template>
  <UDashboardPanel id="customers">
    <template #header>
      <UDashboardNavbar title="Customers">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template v-if="data && !pending && !error" #right>
          <CustomersAddModal />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- กำลังโหลดข้อมูลจาก API โปรดรอสักครู่ -->
      <div v-if="pending" class="flex flex-col items-center justify-center h-48">
        <Icon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-primary" />
        <p class="mt-2 text-gray-500">Loading data...</p>
      </div>

      <!-- เกิดข้อผิดพลาดขณะดึงข้อมูลจาก API โปรดลองอีกครั้ง -->
      <div v-else-if="error" class="flex flex-col items-center justify-center h-48">
        <Icon name="i-lucide-alert-triangle" class="w-8 h-8 text-red-500" />
        <p class="mt-2 text-red-500">Failed to load data. Please try again.</p>
        <h1 class="mt-2 text-sm">
          <code>Message: {{ error.data.message }}</code>
        </h1>
        <UButton
          icon="i-lucide-refresh-cw"
          label="Reload"
          color="error"
          class="mt-4"
          @click="$router.go(0)"
        />
      </div>

      <!-- แสดงรายการลูกค้าเมื่อดึงข้อมูลสำเร็จ -->
      <template v-if="data && !pending && !error">
        <div class="flex flex-wrap items-center justify-between gap-1.5">
          <UInput
            v-model="email"
            class="max-w-sm"
            icon="i-lucide-search"
            placeholder="Filter emails..."
          />

          <div class="flex flex-wrap items-center gap-1.5">
            <CustomersDeleteModal
              :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
            >
              <UButton
                v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
                label="Delete"
                color="error"
                variant="subtle"
                icon="i-lucide-trash"
              >
                <template #trailing>
                  <UKbd>
                    {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                  </UKbd>
                </template>
              </UButton>
            </CustomersDeleteModal>

            <USelect
              v-model="statusFilter"
              :items="[
                { label: 'All', value: 'all' },
                { label: 'Subscribed', value: 'subscribed' },
                { label: 'Unsubscribed', value: 'unsubscribed' },
                { label: 'Bounced', value: 'bounced' },
              ]"
              :ui="{
                trailingIcon:
                  'group-data-[state=open]:rotate-180 transition-transform duration-200',
              }"
              placeholder="Filter status"
              class="min-w-28"
            />
            <UDropdownMenu
              :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column: any) => column.getCanHide())
                .map((column: any) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault()
                  }
                }))
            "
              :content="{ align: 'end' }"
            >
              <UButton
                label="Display"
                color="neutral"
                variant="outline"
                trailing-icon="i-lucide-settings-2"
              />
            </UDropdownMenu>
          </div>
        </div>

        <UTable
          ref="table"
          v-model:column-filters="columnFilters"
          v-model:column-visibility="columnVisibility"
          v-model:row-selection="rowSelection"
          v-model:pagination="pagination"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel(),
          }"
          class="shrink-0"
          :data="data"
          :columns="columns"
          :loading="status === 'pending'"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th:
              'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default',
            separator: 'h-0',
          }"
        />

        <div
          class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto"
        >
          <div class="text-sm text-muted">
            {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
            {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
          </div>

          <div class="flex items-center gap-1.5">
            <UPagination
              :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="table?.tableApi?.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
        </div>
      </template>
    </template>
  </UDashboardPanel>
</template>

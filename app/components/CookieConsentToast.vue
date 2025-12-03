<script setup lang="ts">
// ใช้ useToast และ useCookie ที่นี่
const toast = useToast();

// ตรวจสอบและแสดง Toast เมื่อ Component ถูก Mount
onMounted(async () => {
  // 1. ดึงค่าคุกกี้ 'cookie-consent'
  const cookie = useCookie("cookie-consent");

  // ถ้าคุกกี้เป็น 'accepted' แล้ว ก็ไม่ต้องทำอะไร
  if (cookie.value === "accepted") {
    return;
  }

  // 2. แสดง Toast สำหรับการยินยอมคุกกี้
  toast.add({
    title: "We use first-party cookies to enhance your experience on our website.",
    duration: 0, // 0 คือแสดงจนกว่าผู้ใช้จะโต้ตอบ
    close: false, // ปิดปุ่มปิด Toast
    actions: [
      {
        label: "Accept",
        color: "neutral",
        variant: "outline",
        // เมื่อคลิก Accept ให้ตั้งค่าคุกกี้เป็น 'accepted'
        onClick: () => {
          cookie.value = "accepted";
        },
      },
      {
        label: "Opt out",
        color: "neutral",
        variant: "ghost",
        // ถ้าเลือก Opt out โค้ดนี้ไม่ได้ตั้งค่าคุกกี้เป็น 'accepted'
        // ซึ่งจะทำให้ Toast แสดงขึ้นมาอีกในการโหลดหน้าครั้งต่อไป
      },
    ],
  });
});
</script>

<template>
  <div style="display: none"></div>
</template>

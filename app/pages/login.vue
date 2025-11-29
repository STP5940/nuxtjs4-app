<script setup>
definePageMeta({
  // middleware: ["auth"],
  // layout: "blank",
});
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">👮 Login Page</h1>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh; /* เต็มหน้าจอ */
  display: flex; /* ใช้ Flexbox */
  justify-content: center; /* จัดตรงกลางแนวนอน */
  align-items: center; /* จัดตรงกลางแนวตั้ง */
  background: #f5f7fa; /* สีพื้นหลังนุ่ม ๆ */
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  min-width: 320px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}
</style>

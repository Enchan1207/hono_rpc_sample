<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'

</script>

<template>
  <el-container class="root-container">
    <el-header>
      <h1>Hono RPC sample</h1>
    </el-header>
    <el-container>
      <el-aside>
        <Sidebar />
      </el-aside>
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
}

.root-container {
  height: 100vh;
}
</style>

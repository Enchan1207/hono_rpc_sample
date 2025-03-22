<script setup lang="ts">

</script>

<template>
  <el-row>
    <h2>ホーム</h2>
  </el-row>

  <el-row>
    <el-button
      type="primary"
      tag="router-link"
      to="/tasks"
    >
      項目一覧へ
    </el-button>
  </el-row>
</template>

<style>
a.el-button{
    text-decoration: none;
}
</style>

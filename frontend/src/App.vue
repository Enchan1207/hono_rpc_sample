<template>
  <h2>Hono RPC sample</h2>
  <div>under construction...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { client } from './client';

onMounted(async()=>{
  const tasks = client.task.$get({query:{}});
  console.log(tasks);
});

</script>

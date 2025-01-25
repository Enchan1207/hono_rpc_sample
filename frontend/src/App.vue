<template>
  <h2>Hono RPC sample</h2>
  <div>registered tasks</div>
  <ul>
    <li
      v-for="task in tasks"
      :key="task.id"
    >
      {{ task.id }} {{ task.title }} (due: {{ task.limit }}
      priority: {{ task.priority }})
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { TaskListItem } from '@backend/repository/taskRepository';
import { client } from './client';

const tasks = ref<TaskListItem[]>([]);

onMounted(async()=>{
  // TODO: 双方プリミティブ型でやりとりした方がよいのでは?
  const tasksData = await (await client.task.$get({query:{}})).json();
  tasks.value = tasksData.map(({id, title, limit, priority})=>({
    id,
    title,
    priority,
    limit: new Date(limit),
  }));
});

</script>

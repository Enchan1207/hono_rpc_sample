<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import { breakpointsElement, useBreakpoints } from '@vueuse/core'
import { BIconPersonFill } from 'bootstrap-icons-vue'
import { err } from 'neverthrow'
import { onMounted, ref } from 'vue'

import type { User } from '@/entities/user'
import { getCurrentUser } from '@/repositories/userRepository'

// MARK: - States

const {
  loginWithRedirect, isAuthenticated, logout, getAccessTokenSilently,
} = useAuth0()

const user = ref<User>()

const breakpoints = useBreakpoints(breakpointsElement)
const isSmartphone = breakpoints.smaller('sm')

// MARK: - Event handlers

onMounted(async () => {
  user.value = await getAccessTokenSilently()
    .then(token => getCurrentUser(token))
    .catch(e => err(e))
    .then(result => result.unwrapOr(undefined))
})

const onClickLogout = async () => {
  await logout({ logoutParams: { returnTo: window.location.origin } })
}

</script>

<template>
  <template v-if="isAuthenticated">
    <el-popover
      trigger="click"
      width="unset"
      :title="user?.name"
      placement="bottom-end"
    >
      <template #reference>
        <el-button
          v-if="isSmartphone"
          :icon="BIconPersonFill"
        />

        <el-button
          v-else
          :icon="BIconPersonFill"
        >
          {{ user?.name }}
        </el-button>
      </template>
      <template #default>
        <el-row style="margin-bottom: 10px;">
          <el-text type="info">
            mail@example.com
          </el-text>
        </el-row>
        <el-row justify="end">
          <el-button
            link
            type="primary"
            @click="onClickLogout()"
          >
            ログアウト
          </el-button>
        </el-row>
      </template>
    </el-popover>
  </template>

  <template v-else>
    <el-button
      :icon="BIconPersonFill"
      @click="loginWithRedirect()"
    >
      ログイン
    </el-button>
  </template>
</template>

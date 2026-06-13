<script setup lang="ts">
// 全局无需内容,layout 决定渲染什么
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition
      name="fade"
      mode="out-in"
    >
      <component
        :is="Component"
        :key="route.fullPath"
      />
    </transition>
  </router-view>
</template>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <div class="ucd">
    <div class="ucd-left">
      <chartNav></chartNav>
    </div>
    <div class="ucd-right">
      <router-view />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

import chartNav from './components/chartNav.vue'
export default {
  name: 'ChartDev',
  components: { chartNav },
  setup() {
    const aaa = ref(1)
    return {
      aaa
    }
  }
}
</script>

<style lang="scss">
.ucd {
  display: flex;
  height: 100%;
  .ucd-left {
    width: 220px;
    height: 100%;
  }
  .ucd-right {
    flex: 1;
  }
}
</style>

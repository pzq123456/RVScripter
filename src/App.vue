<template>
  <div class="rete" ref="rete"></div>
</template>

<script>


</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createEditor } from './editor'

const rete = ref();

onMounted(() => {
  createEditor(rete.value)
})


</script>


<style lang="css">
body {
  margin: 0;
}
.rete {
  width: 100vw;
  height: 100vh;
}

</style>

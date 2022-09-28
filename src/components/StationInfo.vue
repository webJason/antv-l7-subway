<template>
  <div class="station-info" :style="{ color: colors[info] }">
    {{ info }}
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, watch } from "vue";
import { Colors } from "@/views/colors";
export default defineComponent({
  name: "StationInfo",
  props: {
    station: {
      type: Object,
      default() {},
    },
  },
  setup(props) {
    const colors = new Colors();
    const info = computed(() => props.station.properties?.name || "err");
    /* watch(
      () => props.station,
      (n, o) => {
        console.log(n);
      },
      {
        deep: true,
      }
    ); */
    // setup return
    return {
      info,
      colors,
    };
  },
});
</script>

<style>
.station-info {
  width: 100px;
  height: 100px;
}
</style>

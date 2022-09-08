<template>
  <div class="station-info">
    {{ info }}
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, onMounted, watch } from "vue";
export default defineComponent({
  name: "StationInfo",
  props: {
    station: {
      type: Object,
      default() {},
    },
  },
  setup(props) {
    const info = computed(() => props.station.properties?.name || "err");
    watch(
      () => props.station,
      (n, o) => {
        console.log(n);
      },
      {
        deep: true,
      }
    );
    onMounted(() => {
      console.log(props.station);
    });
    // setup return
    return {
      info,
    };
  },
});
</script>

<style>
.station-info {
  width: 200px;
  height: 200px;
}
</style>

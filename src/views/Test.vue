<template>
  <main class="l7">
    <div id="subway"></div>
  </main>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import { Scene, LineLayer, PolygonLayer, Popup } from "@antv/l7";
import { Mapbox } from "@antv/l7-maps";
import httpRequest from "@/request/index";
export default defineComponent({
  name: "L7View",
  setup() {
    onMounted(() => {
      const scene = new Scene({
        id: "subway",
        map: new Mapbox({
          pitch: 0,
          style: "light",
          center: [-96, 37.8],
          zoom: 3,
        }),
      });
      scene.on("loaded", () => {
        // 请求json数据
        httpRequest({
          url: "/alipay/os/basement_prod/d36ad90e-3902-4742-b8a2-d93f7e5dafa2.json",
        }).then((data) => {
          //   console.log(resp);
          //   const data = resp.data
          const color = [
            "rgb(255,255,217)",
            "rgb(237,248,177)",
            "rgb(199,233,180)",
            "rgb(127,205,187)",
            "rgb(65,182,196)",
            "rgb(29,145,192)",
            "rgb(34,94,168)",
            "rgb(12,44,132)",
          ];
          const layer = new PolygonLayer({})
            .source(data)
            .color("density", (d) => {
              return d > 1000
                ? color[7]
                : d > 500
                ? color[6]
                : d > 200
                ? color[5]
                : d > 100
                ? color[4]
                : d > 50
                ? color[3]
                : d > 20
                ? color[2]
                : d > 10
                ? color[1]
                : color[0];
            })
            .shape("fill")
            .style({
              opacity: 1.0,
            });
          const layer2 = new LineLayer({
            zIndex: 2,
          })
            .source(data)
            .color("#fff")
            .active(true)
            .size(1)
            .style({
              lineType: "dash",
              dashArray: [2, 2],
              opacity: 1,
            });
          scene.addLayer(layer); // 填充图
          scene.addLayer(layer2); // 描边

          layer.on("mousemove", (e) => {
            const popup = new Popup({
              offsets: [0, 0],
              closeButton: false,
            })
              .setLnglat(e.lngLat)
              .setHTML(`<span>地区: ${e.feature.properties.name}</span>`);
            scene.addPopup(popup);
          });
        });
      }); // scene loaded
    }); // mounted end

    // setup return
    return {};
  },
});
</script>

<style>
#subway {
  height: 100vh;
  background-color: #070918;
  position: relative;
}
</style>

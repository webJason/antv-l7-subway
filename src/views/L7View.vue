<template>
  <main class="l7">
    <div id="subway"></div>
    <StationInfo v-show="showInfo" ref="stationInfo" :station="focusStation" />
  </main>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import { Scene, LineLayer, PointLayer, Popup } from "@antv/l7";
import { Mapbox } from "@antv/l7-maps";
import { Colors } from "./colors";
import httpRequest from "@/request/index";
import active from "@/assets/SVG/active.svg";
import normal from "@/assets/SVG/normal.svg";
import StationInfo from "@/components/StationInfo.vue";
export default defineComponent({
  name: "L7View",
  components: {
    StationInfo,
  },
  setup() {
    const colors = new Colors();
    let linesStations = []; // 记录接口数据
    const getGeoJSON = (data: object, type = "MultiLineString"): object => {
      const features = [];
      for (const line in data) {
        const position = data[line].map((s: object) =>
          s.lnglat.split(",").map((e) => {
            return e * 1; // 必须为number类型
          })
        );
        const feture = {
          type: "Feature",
          properties: {
            name: line,
            // uid: line.uid,
          },
          geometry: {
            type,
            coordinates: type === "MultiLineString" ? [position] : position,
          },
        };
        features.push(feture);
      }
      const collection = {
        type: "FeatureCollection",
        features: features,
      };
      return collection;
    };
    const searchStationInLine = (station: string, line: string): [] => {
      let res = [];
      for (const key in linesStations) {
        if (key.indexOf(line) >= 0) {
          res = linesStations[key].filter((s) => s.name === station);
          break;
        }
      }
      return res;
    };
    const searchStationSegment = (
      start: string,
      end: string,
      line?: string
    ): [] => {
      let res = [];
      let lineData = [];
      const referlines = [];
      for (const key in linesStations) {
        if (line) {
          if (key.indexOf(line) >= 0) {
            lineData = linesStations[key];
            break;
          }
        } else {
          // 查找所在线路
          const matchAll = [];
          for (const station of linesStations[key]) {
            if (matchAll.length === 2) break;
            if (station.name === start) {
              referlines.push(...station.referlines.map((l) => l.name));
              matchAll.push(start);
              continue;
            }
            if (station.name === end) {
              referlines.push(...station.referlines.map((l) => l.name));
              matchAll.push(end);
            }
          }
          if (matchAll.length === 2) {
            lineData = linesStations[key];
            break;
          }
        }
      }

      let startIndex = lineData.findIndex((s) => s.name === start);
      let endIndex = lineData.findIndex((s) => s.name === end);
      [startIndex, endIndex] = [startIndex, endIndex].sort((a, b) => a - b);
      res = lineData.slice(startIndex, endIndex + 1);
      return res;
    };
    const stationInfo = ref(null);
    const focusStation = reactive({});
    const showInfo = ref(false);
    onMounted(() => {
      /* httpRequest({
        url: "/alipay/os/basement_prod/0d2f0113-f48b-4db9-8adc-a3937243d5a3.json",
        method: "get",
      }).then((data) => {
        console.log(data);
      }); */

      const scene = new Scene({
        id: "subway",
        logoVisible: false, // false 不显示logo
        map: new Mapbox({
          // interactive: false, // 禁用鼠标监听（无拖拽缩放等操作）
          // dragPan: false, // 不允许拖拽
          // scrollZoom: true, // 滚动缩放
          // boxZoom: true, // 框选缩放
          // doubleClickZoom: true, // 双击缩放
          maxBounds: [
            // 将限制在给定的最大范围 [西南, 东北]
            [115.7, 39.4],
            [117.4, 40.5],
          ],
          center: [116.25, 39.54],
          pitch: 0, // 地图倾角
          // zoom: 10,
          minZoom: 9,
          style: "dark", // blank无底图模式 light/dark
        }),
      });
      // 设置地图缩放范围 经纬度 （eg: 北京）
      scene.fitBounds([
        [117.2, 40.3],
        [115.6, 39.5],
      ]);
      // 线图层
      const getLineLayer = (geoJson) => {
        return new LineLayer({
          // autoFit: true
        })
          .source(geoJson)
          .size(2)
          .shape("line")
          .color("name", (v) => {
            return colors[v] || colors.line;
          })
          .style({});
      };
      // 普通站点图层
      const getStationLayer = (geoJson) => {
        return new PointLayer()
          .shape("circle")
          .source(geoJson)
          .size(4)
          .color(colors.station)
          .style({});
      };
      // 故障站点图层
      const getFaultStationLayer = (geoJson) => {
        return (
          new PointLayer({
            // zIndex: 22,
          })
            .shape("circle")
            .source(geoJson)
            .size(5)
            // .active(true)
            .color("name", (v) => colors[v])
            .style({
              strokeWidth: 1,
              stroke: "#fff",
            })
        );
      };
      // 图片标记图层
      scene.addImage("normal", normal);
      scene.addImage("active", active);
      const getImageLayer = (geoJson) => {
        return new PointLayer()
          .shape("name", (v) => v)
          .source(geoJson)
          .size(40);
      };
      scene.on("loaded", () => {
        // 地图加载完毕
        // 请求json数据
        httpRequest({
          url: "/linesStations.json",
          method: "get",
        }).then((data) => {
          linesStations = data;
          const geoJSONLine = getGeoJSON(data, "MultiLineString");
          console.log(geoJSONLine);
          const lineLayer = getLineLayer(geoJSONLine);
          scene.addLayer(lineLayer); // 线路
          const geoJSONStation = getGeoJSON(data, "MultiPoint");
          console.log(geoJSONStation);
          const stationLayer = getStationLayer(geoJSONStation);
          scene.addLayer(stationLayer); // 站点
          // 经纬度转换像素
          // console.log(scene.lngLatToPixel([116.412888, 40.083668])); // 天通苑北
          // console.log(scene.lngLatToContainer([116.412888, 40.083668])); // 天通苑北
          // console.log(scene.lngLatToPixel([116.412759, 40.075222]));
          // 某段站点标记 （红绿黄）
          // 模拟查找站点数据
          const faultI = searchStationSegment("立水桥", "立水桥南");
          const faultII = searchStationSegment("望京", "望京西", "15");
          const faultIII = searchStationSegment("南锣鼓巷", "东四");
          console.log(faultII);
          // 标记以上站点段
          const faultGeo = getGeoJSON({ faultI, faultII, faultIII });
          const faultLineLayer = getLineLayer(faultGeo);
          scene.addLayer(faultLineLayer); // 线路

          // 站点标记
          const stationI = searchStationInLine("立水桥", "5号线");
          const stationII = searchStationInLine("霍营", "8");
          const stationIII = searchStationInLine("上地", "13号线");
          // 站点geo
          const faultStationGeo = getGeoJSON(
            { faultI: stationI, faultII: stationII, faultIII: stationIII },
            "MultiPoint"
          );
          const faultStationLayer = getFaultStationLayer(faultStationGeo);
          // 绑定popup事件
          faultStationLayer.on("mouseenter", (e) => {
            // console.log(e.feature);
            Object.assign(focusStation, e.feature);
            const popup = new Popup({
              offsets: [0, 0],
              closeButton: false,
            })
              .setLnglat(e.lngLat)
              .setDOMContent(stationInfo.value.$el);
            popup.on("open", () => {
              showInfo.value = true;
            });
            // popup.on("close", () => {
            //   console.log(0);
            //   showInfo.value = false;
            // });
            scene.addPopup(popup);
          });
          scene.addLayer(faultStationLayer); // 站点
          // 站点图片标记
          const active = searchStationInLine("王府井", "1号线");
          const normal = searchStationInLine("2号航站楼", "首都机场");
          const imgGeo = getGeoJSON({ active, normal }, "MultiPoint");
          const imgLayer = getImageLayer(imgGeo);
          scene.addLayer(imgLayer); // 站点
        });
      }); // scene loaded
    }); // mounted end

    // setup return
    return {
      stationInfo,
      focusStation,
      showInfo,
    };
  },
});
</script>

<style>
#subway {
  height: 100%;
  background-color: #070918;
}
</style>

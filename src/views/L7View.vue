<template>
  <main class="l7">
    <div id="subway"></div>
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
export default defineComponent({
  name: "L7View",
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
    onMounted(() => {
      /* httpRequest({
        url: "/alipay/os/basement_prod/0d2f0113-f48b-4db9-8adc-a3937243d5a3.json",
        method: "get",
      }).then((data) => {
        console.log(data);
      }); */

      const scene = new Scene({
        id: "subway",
        map: new Mapbox({
          center: [116.3956, 39.9392],
          pitch: 20,
          zoom: 10,
          rotation: 0,
          style: "dark",
        }),
      });
      // 线图层
      const getLineLayer = (geoJson, color) => {
        return new LineLayer({})
          .source(geoJson)
          .size(2)
          .shape("line")
          .color("name", [color])
          .style({});
      };
      // 普通站点图层
      const getStationLayer = (geoJson, color) => {
        return new PointLayer()
          .shape("circle")
          .source(geoJson)
          .size(4)
          .color(color)
          .style({});
      };
      // 故障站点图层
      const getFaultStationLayer = (geoJson, color) => {
        return new PointLayer()
          .shape("circle")
          .source(geoJson)
          .size(5)
          .color(color)
          .style({
            strokeWidth: 1,
            stroke: "#fff",
          });
      };
      // 图片标记图层
      scene.addImage("normal", normal);
      scene.addImage("active", active);
      const getImageLayer = (geoJson, shape) => {
        return new PointLayer().shape(shape).source(geoJson).size(40);
      };

      scene.on("loaded", () => {
        // 请求json数据
        httpRequest({
          url: "/linesStations.json",
          method: "get",
        }).then((data) => {
          linesStations = data;
          const geoJSONLine = getGeoJSON(data, "MultiLineString");
          console.log(geoJSONLine);
          const lineLayer = getLineLayer(geoJSONLine, colors.line);
          scene.addLayer(lineLayer); // 线路
          const geoJSONStation = getGeoJSON(data, "MultiPoint");
          console.log(geoJSONStation);
          const stationLayer = getStationLayer(geoJSONStation, colors.station);
          scene.addLayer(stationLayer); // 站点
          // 某段站点标记 （红绿黄）
          // 模拟查找站点数据
          const faultI = searchStationSegment("立水桥", "立水桥南");
          const faultII = searchStationSegment("望京", "望京西", "15");
          const faultIII = searchStationSegment("南锣鼓巷", "东四");
          console.log(faultII);
          // 标记以上站点段
          const faultIGeo = getGeoJSON({ faultI });
          const faultIIGeo = getGeoJSON({ faultII });
          const faultIIIGeo = getGeoJSON({ faultIII });
          const layerI = getLineLayer(faultIGeo, colors.faultI);
          const layerII = getLineLayer(faultIIGeo, colors.faultII);
          const layerIII = getLineLayer(faultIIIGeo, colors.faultIII);
          scene.addLayer(layerI); // 线路
          scene.addLayer(layerII); // 线路
          scene.addLayer(layerIII); // 线路

          // 站点标记
          const stationI = searchStationInLine("立水桥", "5号线");
          const stationII = searchStationInLine("霍营", "8");
          const stationIII = searchStationInLine("上地", "13号线");
          // 站点geo
          const faultSIGeo = getGeoJSON({ stationI }, "MultiPoint");
          const faultSIIGeo = getGeoJSON({ stationII }, "MultiPoint");
          const faultSIIIGeo = getGeoJSON({ stationIII }, "MultiPoint");
          const stationLayerI = getFaultStationLayer(faultSIGeo, colors.faultI);
          const stationLayerII = getFaultStationLayer(
            faultSIIGeo,
            colors.faultII
          );
          const stationLayerIII = getFaultStationLayer(
            faultSIIIGeo,
            colors.faultIII
          );
          scene.addLayer(stationLayerI); // 站点
          scene.addLayer(stationLayerII); // 站点
          scene.addLayer(stationLayerIII); // 站点
          // 站点图片标记
          const active = searchStationInLine("王府井", "1号线");
          const normal = searchStationInLine("2号航站楼", "首都机场");
          const activeGeo = getGeoJSON({ active }, "MultiPoint");
          const normalGeo = getGeoJSON({ normal }, "MultiPoint");
          const activeLayer = getImageLayer(activeGeo, "active");
          const normalLayer = getImageLayer(normalGeo, "normal");
          scene.addLayer(activeLayer); // 站点
          scene.addLayer(normalLayer); // 站点
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
  height: 100%;
}
</style>

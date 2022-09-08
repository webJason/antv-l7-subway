<template>
  <main class="line">
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
    const getLineGeoJSON = (data: []): object => {
      const features = [];
      for (const line of data) {
        const position = line.stations.map((s: object) =>{
          return [s.lngLat.lng, s.lngLat.lat]
        });
        if (["2号线", "10号线"].includes(line.lb)) { // 环线 首尾相接
          position.push(position[0])
        }
        const feture = {
          type: "Feature",
          properties: {
            name: line,
            // uid: line.uid,
          },
          geometry: {
            type: "MultiLineString",
            coordinates: [position],
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
    const getStationGeoJSON = (data: []): object => {
      const features = [];
      for (const line of data) {
        const position = line.stations.filter((s: object) => s.lb !== "").map((s: object) =>{ // 过渡点位过滤
          return [s.lngLat.lng, s.lngLat.lat]
        });
        const feture = {
          type: "Feature",
          properties: {
            name: line,
            // uid: line.uid,
          },
          geometry: {
            type: "MultiPoint",
            coordinates: position,
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
      const scene = new Scene({
        id: "subway",
        map: new Mapbox({
          center: [116.25, 39.54],
          pitch: 0, // 地图倾角
          maxBounds: [
            // 将限制在给定的最大范围 [西南, 东北]
            [115.0, 39.13],
            [117.35, 40.43],
          ],
          style: "blank", // blank无底图模式 light/dark
        }),
      });
      scene.fitBounds([
        [115.0, 39.13],
        [117.35, 40.43],
      ]);
      // 线图层
      const getLineLayer = (geoJson) => {
        return new LineLayer({})
          .source(geoJson)
          .size(2)
          .shape("line")
          .color("name", (v) => {
            return colors[v] || colors.line;
          })
          .style({
            opacity: 0.4
          });
      };
      // 标记线路图层
      const getSingleLineLayer = (geoJson) => {
        return new LineLayer({})
          .source(geoJson)
          .size(2)
          .shape("line")
          .color("name", (v) => {
            return colors[v] || colors.line;
          })
          .style({
            lineType: 'dash',
            dashArray: [3, 3] // [长度, 间距]
          });
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
        return new PointLayer()
          .shape("circle")
          .source(geoJson)
          .size(5)
          .color("name", (v) => colors[v])
          .style({
            strokeWidth: 1,
            stroke: "#fff",
          });
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
      // 经纬度转画布坐标
      scene.on("loaded", () => {
        // 请求json数据
        httpRequest({
          url: "/bj2.json",
          method: "get",
        }).then((data) => {
          linesStations = data
          const notLine6 = linesStations.filter((l) => l.lb !== "6号线")
          const line6 = linesStations.filter((l) => l.lb === "6号线")
          const geoJSONLine = getLineGeoJSON(notLine6); // , "MultiLineString"
          const lineLayer = getLineLayer(geoJSONLine);
          scene.addLayer(lineLayer); // 线路
          // 6号线
          const geoJSONLine6 = getLineGeoJSON(line6); // , "MultiLineString"
          const geoJSONStation = getStationGeoJSON(line6); // , "MultiPoint"
          const line6Layer = getSingleLineLayer(geoJSONLine6);
          const stationLayer = getStationLayer(geoJSONStation);
          scene.addLayer(line6Layer); // 站点
          scene.addLayer(stationLayer); // 站点

          /* // 某段站点标记 （红绿黄）
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
          faultStationLayer.on("mousemove", (e) => {
            console.log(e);
            const popup = new Popup({
              offsets: [0, 0],
              closeButton: false,
            })
              // .setLnglat(e.lngLat)
              // .setHTML(`<span style="color: red">故障类型：${e.feature.properties.name}</span>`);
              .setLnglat([116.3956, 39.9392])
              .setText("xx信息");
            // popup.on("open", () => {
            //   alert("打开了");
            // });
            scene.addPopup(popup);
          });
          scene.addLayer(faultStationLayer); // 站点
          // 站点图片标记
          const active = searchStationInLine("王府井", "1号线");
          const normal = searchStationInLine("2号航站楼", "首都机场");
          const imgGeo = getGeoJSON({ active, normal }, "MultiPoint");
          const imgLayer = getImageLayer(imgGeo);
          scene.addLayer(imgLayer); // 站点 */
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
  background-color: #070918;
}
</style>

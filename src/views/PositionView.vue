<template>
  <main class="l7">
    <div id="subway"></div>
  </main>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { Scene, LineLayer, PointLayer, Popup } from "@antv/l7";
import { Colors } from "./colors";
import { Mapbox } from "@antv/l7-maps";
import httpRequest from "@/request/index";
export default defineComponent({
  name: "L7View",
  setup() {
    const colors = new Colors();
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
        .style({
          // lineType: 'dash',
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
    // 故障站点
    const getFaultStationLayer = (geoJson) => {
      return (
        new PointLayer({
          // zIndex: 22,
        })
          .shape("circle")
          .source(geoJson)
          .size(5)
          // .active(true)
          // .color("name", (v) => colors[v])
          .style({
            strokeWidth: 1,
            stroke: "#fff",
          })
      );
    };
    onMounted(() => {
      const scene = new Scene({
        id: "subway",
        map: new Mapbox({
          pitch: 0,
          style: "dark",
          center: [116.3956, 39.9392],
          zoom: 10,
          //   maxBounds: [
          //     // 将限制在给定的最大范围 [西南, 东北]
          //     [113.4, 38.47],
          //     [118.3, 40.68],
          //   ],
          //   trackResize: true
        }),
      });
      scene.fitBounds([
        [115.0, 39.2],
        [117.33, 40.33],
      ]);
      scene.on("loaded", () => {
        // 请求json数据
        httpRequest({
          url: "/bj_lines.json",
        }).then((resp) => {
          /* const line6 = resp.filter((line) => line.lb === "10号线");
          const coordinates = [];
          for (const point of line6[0].stations) {
            const x = point.x - 1500;
            const lngLat = scene.containerToLngLat([x, point.y]);
            // point.lngLat = lngLat;
            coordinates.push([lngLat.lng, lngLat.lat]);
          }
          const geoJsonLine6 = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {
                  name: line6[0].lb,
                },
                geometry: {
                  type: "MultiLineString",
                  coordinates: [coordinates],
                },
              },
            ],
          };
          console.log(geoJsonLine6) */
          const features = [];
          let stationFeature = {};
          for (const line of resp) {
            const feature = {
              type: "Feature",
              properties: {
                name: line.lb,
              },
              geometry: {
                type: "MultiLineString",
                coordinates: [],
              },
            };

            const coordinates = [];
            for (const point of line.stations) {
              const x = point.x - 1518;
              const y = point.y - 352;
              const lngLat = scene.pixelToLngLat([x, y]);
              point.lngLat = lngLat;
              coordinates.push([lngLat.lng, lngLat.lat]);
              // 西南 东北
              /* if (point.lb === "燕山") {
                console.log("燕山：", lngLat)
              }
              if (point.lb === "大兴机场") {
                console.log("大兴机场", lngLat)
              }
              if (point.lb === "潞城") {
                console.log("潞城", lngLat)
              }
              if (point.lb === "昌平西山口") {
                console.log("昌平西山口", lngLat)
              } */
              if (point.lb === "南锣鼓巷") {
                // 站点测试
                stationFeature = {
                  type: "Feature",
                  properties: {
                    name: point.lb,
                  },
                  geometry: {
                    type: "Point",
                    coordinates: [lngLat.lng, lngLat.lat],
                  },
                };
              }
            }
            feature.geometry.coordinates.push(coordinates);
            features.push(feature);
          }

          const geoJson = {
            type: "FeatureCollection",
            features: features,
          };
          const faultStaionGeoJson = {
            type: "FeatureCollection",
            features: [stationFeature],
          };
          console.log(geoJson);
          const lineLayer = getLineLayer(geoJson);
          const faultLayer = getFaultStationLayer(faultStaionGeoJson);
          scene.addLayer(lineLayer);
          scene.addLayer(faultLayer);
          //   getJson(resp)
          /* const data = {"type":"FeatureCollection","features":[{"type":"Feature","id":12860,"properties":{},"geometry":{"type":"LineString","coordinates":[[116.355427,39.94047047],[116.3554312,39.94091444],[116.35543539,39.94157396],[116.35546895,39.94218201],[116.35550112,39.94242573],[116.3555388,39.94269154],[116.35560663,39.94296699],[116.35568954,39.94312109],[116.35581516,39.94329252],[116.3560428,39.9435406],[116.3562171,39.94367948],[116.3563709,39.94376857],[116.3565247,39.94384718],[116.35671268,39.94393365],[116.35694509,39.94403846],[116.35716383,39.94411445],[116.35745434,39.94419306],[116.35776536,39.94429788],[116.3583498,39.94447606],[116.35894722,39.94465723],[116.35949627,39.9448275],[116.35954957,39.94484074]]},"bbox":[116.355427,39.94047047,116.35954957,39.94484074]}]};
          const layer = new LineLayer()
            .source(data)
            .color("red");
          scene.addLayer(layer);
          const data2 = {"type":"FeatureCollection","features":[{"type":"Feature","id":12860,"properties":{},"geometry":{"type":"LineString","coordinates":[
        116.35542142,
        39.94044453
        ]}}]};
          const station = new PointLayer()
          .shape("circle")
          .source(data2)
          .size(4)
          .color("blue")
          .style({});
          scene.addLayer(station) */
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

#  antv L7 l7 subway vue3
*vue3 + antv/l7 demo*

## Project Setup

```sh
npm install
```
```sh
npm run dev
```
```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
## antv/l7使用
```npm install --save @antv/l7```
* 第三方底图依赖\
```npm install --save @antv/l7-maps```

### [mapbox](http://www.mapbox.cn/mapbox-gl-js/api/) 中文文档

# 开发问题记录
### 不能使用```require()```导入静态资源
* vite 将资源引入未URL ```import normal from '@/assets/SVG/normal.svg'```

### 使用popup组件时 信息框未出现
* 可能跟当前页面布局有关 个例；解决方法：
```
.l7-marker-container { /* popup不显示问题 */
  overflow: unset !important;
}
```

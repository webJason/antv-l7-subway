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

# 开发问题记录
### 不能使用```require()```导入静态资源
* vite 将资源引入未URL ```import normal from '@/assets/SVG/normal.svg'```
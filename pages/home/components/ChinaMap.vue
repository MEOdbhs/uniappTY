<template>
	<view class="map-container">
		<!-- eslint-disable-next-line @typescript-eslint/ban-ts-comment -->
		<!-- @ts-expect-error renderjs module type -->
		<view
			id="chinaMap"
			class="echarts-view"
			:prop="mapData"
			:change:prop="echarts.updateData"
			:geoJson="chinaGeoJson"
			:change:geoJson="echarts.updateGeoJson"
		></view>
	</view>
</template>

<script>
import chinaGeoJson from "./100000_full.json";

// 省份坐标映射
const geoCoordMap = {
	北京: [116.407526, 39.90403],
	天津: [117.200983, 39.084158],
	河北: [114.530044, 38.037271],
	山西: [112.562398, 37.871104],
	内蒙古: [111.765617, 40.817498],
	辽宁: [123.431474, 41.805698],
	吉林: [125.323544, 43.817071],
	黑龙江: [126.661669, 45.742347],
	上海: [121.473701, 31.230416],
	江苏: [118.796877, 32.060255],
	浙江: [120.15507, 30.274084],
	安徽: [117.284922, 31.861184],
	福建: [119.295144, 26.099912],
	江西: [115.816912, 28.63666],
	山东: [117.020359, 36.66853],
	河南: [113.753602, 34.765515],
	湖北: [114.305393, 30.593099],
	湖南: [112.938814, 28.228209],
	广东: [113.26653, 23.132191],
	广西: [108.366121, 22.8172],
	海南: [110.349228, 20.017377],
	重庆: [106.551556, 29.563009],
	四川: [104.075931, 30.651651],
	贵州: [106.630153, 26.647661],
	云南: [102.710002, 25.045806],
	西藏: [91.117212, 29.646922],
	陕西: [108.954239, 34.265472],
	甘肃: [103.826308, 36.059421],
	青海: [101.780199, 36.620901],
	宁夏: [106.258602, 38.471317],
	新疆: [87.616848, 43.825592],
	台湾: [121.509062, 25.044332],
	香港: [114.173355, 22.320048],
	澳门: [113.54909, 22.198951],
};

export default {
	props: {
		activeProvinces: {
			type: Array,
			default: () => [
				//'四川',  '江苏', '湖北', '陕西', '新疆'
			],
		},
		projectList: {
			type: Array,
			default: () => [],
		},
	},
	computed: {
		mapData() {
			const res = [];
			if (this.activeProvinces && this.activeProvinces.length > 0) {
				this.activeProvinces.forEach((name) => {
					let coord = geoCoordMap[name];
					if (!coord) {
						const key = Object.keys(geoCoordMap).find(
							(k) => name.includes(k) || k.includes(name)
						);
						if (key) coord = geoCoordMap[key];
					}
					if (coord) {
						res.push({ name: name, value: coord });
					}
				});
			}

			// 合并 projectList 数据
			if (this.projectList && this.projectList.length > 0) {
				res.push(...this.projectList);
			}

			return res;
		},
		chinaGeoJson() {
			return chinaGeoJson;
		},
	},
};
</script>

<!-- #ifdef APP-VUE || H5 -->
<script module="echarts" lang="renderjs">
import { headquartersIcon } from './mapIcons.js'

export default {
  data() {
    return {
      chart: null,
      isLoaded: false,
      pendingData: null,
      geoJson: null
    }
  },
  mounted() {
    console.log('renderjs mounted')
    this.initECharts()
  },
  methods: {
    initECharts() {
      console.log('initECharts called, window.echarts:', typeof window !== 'undefined' ? (window.echarts ? 'exists' : 'not exists') : 'window undefined')
      if (typeof window !== 'undefined' && window.echarts) {
        this.loadMapData()
      } else {
        // 在app端，使用uni-app的资源路径
        const script = document.createElement('script')
        // 尝试多个可能的路径
        const paths = [
          '/plugin/echarts.min.js',
          './plugin/echarts.min.js',
          '/static/plugin/echarts.min.js',
          './static/plugin/echarts.min.js',
          '/uni_modules/qiun-data-charts/static/app-plus/echarts.min.js'
        ]

        let currentIndex = 0
        const tryLoad = () => {
          if (currentIndex >= paths.length) {
            // 所有路径都失败，尝试CDN
            console.warn('所有本地路径加载失败，尝试CDN')
            const script3 = document.createElement('script')
            script3.src = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js'
            script3.onload = this.checkEchartsLoaded.bind(this)
            script3.onerror = () => console.error('ECharts CDN加载也失败')
            document.head.appendChild(script3)
            return
          }

          const script = document.createElement('script')
          script.src = paths[currentIndex]
          script.onload = () => {
            console.log('ECharts加载成功，路径:', paths[currentIndex])
            this.checkEchartsLoaded()
          }
          script.onerror = () => {
            console.warn('ECharts加载失败，路径:', paths[currentIndex])
            currentIndex++
            tryLoad()
          }
          document.head.appendChild(script)
        }

        tryLoad()
      }
    },
    checkEchartsLoaded() {
      if (window.echarts && this.geoJson) {
        this.loadMapData()
      } else {
        setTimeout(() => {
          if (window.echarts && this.geoJson) {
            this.loadMapData()
          }
        }, 100)
      }
    },
    updateGeoJson(newGeoJson) {
      this.geoJson = newGeoJson
      if (this.geoJson && window.echarts && !this.isLoaded) {
        this.loadMapData()
      }
    },
    loadMapData() {
      if (typeof window === 'undefined' || !window.echarts) {
        console.warn('ECharts未加载')
        return
      }
      // 使用本地传入的 geoJson 数据
      if (this.geoJson) {
        try {
          window.echarts.registerMap('china', this.geoJson)
          this.isLoaded = true
          this.initChart()
        } catch (err) {
          console.error('注册地图数据失败:', err)
        }
      } else {
        console.warn('geoJson数据未传入')
      }
    },
    initChart() {
      const el = document.getElementById('chinaMap')
      if (!el) {
        console.error('找不到chinaMap元素')
        return
      }
      if (typeof window === 'undefined' || !window.echarts) {
        console.error('ECharts未加载')
        return
      }

      try {
        this.chart = window.echarts.init(el)
        console.log('ECharts初始化成功')
      } catch (err) {
        console.error('ECharts初始化失败:', err)
      }

      if (this.pendingData) {
        this.renderChart(this.pendingData)
        this.pendingData = null
      } else {
        this.renderChart([])
      }

      window.addEventListener('resize', () => {
        this.chart && this.chart.resize()
      })
    },
    updateData(newValue) {
      if (this.isLoaded && this.chart) {
        this.renderChart(newValue)
      } else {
        this.pendingData = newValue
      }
    },
    renderChart(data) {
      if (!this.chart) return

      const option = {
        backgroundColor: '#fff',
        geo: {
          map: 'china',
          roam: false, // 禁用交互，保持固定视图
          center: [105, 36],
          zoom: 1.4,
          // -----------------

          label: { show: false },
          itemStyle: {
            areaColor: '#ffffff',
            borderColor: '#2B95FE',
            borderWidth: 1,
            shadowColor: 'rgba(43, 149, 254, 0.2)',
            shadowBlur: 2
          },
          emphasis: {
            disabled: true,
            label: { show: false },
            itemStyle: { areaColor: '#ffffff' }
          },
          select: { disabled: true }
        },
        series: [
          {
            name: 'Points',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: data,
            symbol: 'triangle', // 三角形图标
            symbolSize: 10,     // 尺寸 10
            itemStyle: {
              color: '#7D5FFE', // 紫色
              opacity: 1
            },
            zlevel: 1
          },
          // 新增北京位置
          {
            name: 'Beijing Star',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: [{
              name: '北京',
              value: [116.407526, 39.90403]
            }],

            symbol: 'path://M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
            symbolSize: 18,
            itemStyle: {
              color: '#FF0000',
              opacity: 1,
              shadowBlur: 5,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            },
            zlevel: 2
          },
          // 新增总部位置配置
          {
            name: 'Headquarters',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: [{
              name: '总部',
              value: [119.95, 31.79]
            }],
            // 使用自定义图片作为总部标识
            symbol: 'image://' + headquartersIcon,
            symbolSize: 30,
            itemStyle: {
              opacity: 1
            },
            zlevel: 3
          }
        ]
      }
      this.chart.setOption(option)
    }
  }
}
</script>
<!-- #endif -->

<style scoped>
.map-container {
	width: 100%;
	height: 600rpx; /* 如果觉得高度不够，可以调整为 700rpx 或 100% */
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #fff;
}
.echarts-view {
	width: 100%;
	height: 100%;
}
</style>

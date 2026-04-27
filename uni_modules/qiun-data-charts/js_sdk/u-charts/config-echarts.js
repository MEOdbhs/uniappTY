/*
 * uCharts®
 * 高性能跨平台图表库，支持H5、APP、小程序（微信/支付宝/百度/头条/QQ/360）、Vue、Taro等支持canvas的框架平台
 * Copyright (c) 2021 QIUN®秋云 https://www.ucharts.cn All rights reserved.
 * Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
 * 复制使用请保留本段注释，感谢支持开源！
 * 
 * uCharts®官方网站
 * https://www.uCharts.cn
 * 
 * 开源地址:
 * https://gitee.com/uCharts/uCharts
 * 
 * uni-app插件市场地址：
 * http://ext.dcloud.net.cn/plugin?id=271
 * 
 */

// 通用配置项

// 主题颜色配置：如每个图表类型需要不同主题，请在对应图表类型上更改color属性
const color = ['#1890FF', '#91CB74', '#FAC858', '#EE6666', '#73C0DE', '#3CA272', '#FC8452', '#9A60B4', '#ea7ccc']

const cfe = {
    //demotype为自定义图表类型
    "type": ["pie", "ring", "rose", "funnel", "line", "column", "area", "radar", "gauge", "candle", "demotype"],
    //增加自定义图表类型，如果需要categories，请在这里加入您的图表类型例如最后的"demotype"
    "categories": ["line", "column", "area", "radar", "gauge", "candle", "demotype"],
    //instance为实例变量承载属性，option为eopts承载属性，不要删除
    "instance": {},
    "option": {},
    //下面是自定义format配置，因除H5端外的其他端无法通过props传递函数，只能通过此属性对应下标的方式来替换
    "formatter": {
        "tooltipDemo1": function (res) {
            let result = ''
            for (let i in res) {
                if (i == 0) {
                    result += res[i].axisValueLabel + '年销售额'
                }
                let value = '--'
                if (res[i].data !== null) {
                    value = res[i].data
                }
                // #ifdef H5
                result += '\n' + res[i].seriesName + '：' + value + ' 万元'
                // #endif

                // #ifdef APP-PLUS
                result += '<br/>' + res[i].marker + res[i].seriesName + '：' + value + ' 万元'
                // #endif
            }
            return result
        },

        "downWellTooltip": function (params) {
            // echarts 的 tooltip formatter 参数格式不同
            // params 可能是数组（axis trigger）或单个对象（item trigger）
            if (!Array.isArray(params)) {
                params = [params]
            }
            if (params.length === 0) return ''

            const param = params[0]
            const index = param.dataIndex
            const opts = param.opts || {}
            const listData = opts._downWellListData

            if (!listData || !listData[index]) {
                return param.axisValueLabel + '<br/>' + param.seriesName + ': ' + param.value
            }

            const dataItem = listData[index]

            const date = dataItem.attendanceDate
            // 格式化日期（格式：YYYY.MM.DD）
            const dateStr = date ? (date.split(' ')[0].replace(/-/g, '.')) : param.axisValueLabel
            // 格式化时长（秒转小时:分钟:秒）
            const formatTime = function (seconds) {
                // 确保转换为数字类型
                const numSeconds = Number(seconds)
                if (isNaN(numSeconds) || numSeconds < 0) {
                    return '00:00:00'
                }
                const hours = Math.floor(numSeconds / 3600)
                const minutes = Math.floor((numSeconds % 3600) / 60)
                const secs = Math.floor(numSeconds % 60)
                return (hours < 10 ? '0' : '') + hours + ':' +
                    (minutes < 10 ? '0' : '') + minutes + ':' +
                    (secs < 10 ? '0' : '') + secs
            }
            const totalDuration = formatTime(dataItem.downWellDuration)
            const avgDuration = formatTime(dataItem.avgDownWellDuration)

            // echarts 使用 <br/> 换行
            return dateStr + '<br/>' +
                '下井人次: ' + param.value + '<br/>' +
                '下井总时长: ' + dataItem.downWellDuration + '<br/>' +
                '下井平均时长: ' + dataItem.avgDownWellDuration
        },

        "inspectionTooltip": function (params) {
            if (!Array.isArray(params)) {
                params = [params]
            }
            if (params.length === 0) return ''
            const p0 = params[0]
            const axisLabel = p0.axisValueLabel || p0.name || ''
            const map = {}
            for (let i = 0; i < params.length; i++) {
                const p = params[i]
                if (p.seriesName) {
                    map[p.seriesName] = p.value
                }
            }
            const v0 = map['巡检总数'] !== undefined ? map['巡检总数'] : 0
            const v1 = map['巡检转维修数'] !== undefined ? map['巡检转维修数'] : 0
            const v2 = map['巡检任务合格数'] !== undefined ? map['巡检任务合格数'] : 0
            const c1 = '#6b7a8f'
            const cNum0 = '#E8B84A'
            const cNum1 = '#3A9EFF'
            const cNum2 = '#3FBF8F'
            return (
                '<div style="font-weight:600;color:#1a2b4b;margin-bottom:6px;">' + axisLabel + '</div>' +
                '<div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0;"><span style="color:' + c1 + ';">巡检总数</span><span style="color:' + cNum0 + ';font-weight:600;">' + v0 + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0;"><span style="color:' + c1 + ';">巡检转维修数</span><span style="color:' + cNum1 + ';font-weight:600;">' + v1 + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0;"><span style="color:' + c1 + ';">巡检任务合格数</span><span style="color:' + cNum2 + ';font-weight:600;">' + v2 + '</span></div>'
            )
        },

        legendFormat: function (name) {
            return "自定义图例+" + name
        },
        yAxisFormatDemo: function (value, index) {
            return value + '元'
        },
        seriesFormatDemo: function (res) {
            return res.name + '年' + res.value + '元'
        }
    },
    //这里演示了自定义您的图表类型的option，可以随意命名，之后在组件上 type="demotype" 后，组件会调用这个花括号里的option，如果组件上还存在eopts参数，会将demotype与eopts中option合并后渲染图表。
    "demotype": {
        "color": color,
        //在这里填写echarts的option即可

    },
    //下面是自定义配置，请添加项目所需的通用配置
    "column": {
        "color": color,
        "title": {
            "text": ''
        },
        "tooltip": {
            "trigger": 'axis'
        },
        "grid": {
            "top": 30,
            "bottom": 50,
            "right": 15,
            "left": 40
        },
        "legend": {
            "bottom": 'left',
        },
        "toolbox": {
            "show": false,
        },
        "xAxis": {
            "type": 'category',
            "axisLabel": {
                "color": '#666666'
            },
            "axisLine": {
                "lineStyle": {
                    "color": '#CCCCCC'
                }
            },
            "boundaryGap": true,
            "data": []
        },
        "yAxis": {
            "type": 'value',
            "axisTick": {
                "show": false,
            },
            "axisLabel": {
                "color": '#666666'
            },
            "axisLine": {
                "lineStyle": {
                    "color": '#CCCCCC'
                }
            },
        },
        "seriesTemplate": {
            "name": '',
            "type": 'bar',
            "data": [],
            "barwidth": 20,
            "label": {
                "show": true,
                "color": "#666666",
                "position": 'top',
            },
        },
    },
    "line": {
        "color": color,
        "title": {
            "text": ''
        },
        "tooltip": {
            "trigger": 'axis'
        },
        "grid": {
            "top": 30,
            "bottom": 50,
            "right": 15,
            "left": 40
        },
        "legend": {
            "bottom": 'left',
        },
        "toolbox": {
            "show": false,
        },
        "xAxis": {
            "type": 'category',
            "axisLabel": {
                "color": '#666666'
            },
            "axisLine": {
                "lineStyle": {
                    "color": '#CCCCCC'
                }
            },
            "boundaryGap": true,
            "data": []
        },
        "yAxis": {
            "type": 'value',
            "axisTick": {
                "show": false,
            },
            "axisLabel": {
                "color": '#666666'
            },
            "axisLine": {
                "lineStyle": {
                    "color": '#CCCCCC'
                }
            },
        },
        "seriesTemplate": {
            "name": '',
            "type": 'line',
            "data": [],
            "barwidth": 20,
            "label": {
                "show": true,
                "color": "#666666",
                "position": 'top',
            },
        },
    },
    "area": {
        "color": color,
        "title": {
            "text": ''
        },
        "tooltip": {
            "trigger": 'axis'
        },
        "grid": {
            "top": 30,
            "bottom": 50,
            "right": 15,
            "left": 40
        },
        "legend": {
            "bottom": 'left',
        },
        "toolbox": {
            "show": false,
        },
        "xAxis": {
            "type": 'category',
            "axisLabel": {
                "color": '#666666'
            },
            "axisLine": {
                "lineStyle": {
                    "color": '#CCCCCC'
                }
            },
            "boundaryGap": true,
            "data": []
        },
        "yAxis": {
            "type": 'value',
            "axisTick": {
                "show": false,
            },
            "axisLabel": {
                "color": '#666666'
            },
            "axisLine": {
                "lineStyle": {
                    "color": '#CCCCCC'
                }
            },
        },
        "seriesTemplate": {
            "name": '',
            "type": 'line',
            "data": [],
            "areaStyle": {},
            "label": {
                "show": true,
                "color": "#666666",
                "position": 'top',
            },
        },
    },
    "pie": {
        "color": color,
        "title": {
            "text": ''
        },
        "tooltip": {
            "trigger": 'item'
        },
        "grid": {
            "top": 40,
            "bottom": 30,
            "right": 15,
            "left": 15
        },
        "legend": {
            "bottom": 'left',
        },
        "seriesTemplate": {
            "name": '',
            "type": 'pie',
            "data": [],
            "radius": '50%',
            "label": {
                "show": true,
                "color": "#666666",
                "position": 'top',
            },
        },
    },
    "ring": {
        "color": color,
        "title": {
            "text": ''
        },
        "tooltip": {
            "trigger": 'item'
        },
        "grid": {
            "top": 40,
            "bottom": 30,
            "right": 15,
            "left": 15
        },
        "legend": {
            "bottom": 'left',
        },
        "seriesTemplate": {
            "name": '',
            "type": 'pie',
            "data": [],
            "radius": ['40%', '70%'],
            "avoidLabelOverlap": false,
            "label": {
                "show": true,
                "color": "#666666",
                "position": 'top',
            },
            "labelLine": {
                "show": true
            },
        },
    },
    "rose": {
        "color": color,
        "title": {
            "text": ''
        },
        "tooltip": {
            "trigger": 'item'
        },
        "legend": {
            "top": 'bottom'
        },
        "seriesTemplate": {
            "name": '',
            "type": 'pie',
            "data": [],
            "radius": "55%",
            "center": ['50%', '50%'],
            "roseType": 'area',
        },
    },
    "funnel": {
        "color": color,
        "title": {
            "text": ''
        },
        "tooltip": {
            "trigger": 'item',
            "formatter": "{b} : {c}%"
        },
        "legend": {
            "top": 'bottom'
        },
        "seriesTemplate": {
            "name": '',
            "type": 'funnel',
            "left": '10%',
            "top": 60,
            "bottom": 60,
            "width": '80%',
            "min": 0,
            "max": 100,
            "minSize": '0%',
            "maxSize": '100%',
            "sort": 'descending',
            "gap": 2,
            "label": {
                "show": true,
                "position": 'inside'
            },
            "labelLine": {
                "length": 10,
                "lineStyle": {
                    "width": 1,
                    "type": 'solid'
                }
            },
            "itemStyle": {
                "bordercolor": '#fff',
                "borderwidth": 1
            },
            "emphasis": {
                "label": {
                    "fontSize": 20
                }
            },
            "data": [],
        },
    },
    "gauge": {
        "color": color,
        "tooltip": {
            "formatter": '{a} <br/>{b} : {c}%'
        },
        "seriesTemplate": {
            "name": '业务指标',
            "type": 'gauge',
            "detail": { "formatter": '{value}%' },
            "data": [{ "value": 50, "name": '完成率' }]
        },
    },
    "candle": {
        "xAxis": {
            "data": []
        },
        "yAxis": {},
        "color": color,
        "title": {
            "text": ''
        },
        "dataZoom": [{
            "type": 'inside',
            "xAxisIndex": [0, 1],
            "start": 10,
            "end": 100
        },
        {
            "show": true,
            "xAxisIndex": [0, 1],
            "type": 'slider',
            "bottom": 10,
            "start": 10,
            "end": 100
        }
        ],
        "seriesTemplate": {
            "name": '',
            "type": 'k',
            "data": [],
        },
    }
}

export default cfe

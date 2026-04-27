<template>
    <view class="leader-home">
        <!-- 操作按钮 -->
        <view class="action-buttons">
            <view class="action-btn repair-btn" @tap="handleRepair">
                <cl-image src="/static/icon/home/fault.png" mode="aspectFill" class="top-img"></cl-image>
                <view class="btn-text">故障报修</view>
            </view>
            <view class="action-btn query-btn" @tap="handleTechQuery">
                <cl-image src="/static/icon/home/technology.png" mode="aspectFill" class="top-img"></cl-image>
                <view class="btn-text">技术查询</view>
            </view>
        </view>

        <!-- 今日运维人员 -->
        <view class="section personnel-section">
            <view class="section-header personnel-header">
                <view class="section-title personnel-title">今日运维人员</view>
                <view class="downwell-time-pill-shell">
                    <text class="downwell-pill-text">
                        <text class="count-current">{{ todayPersonnel.ywCount || 0 }} /</text>
                        <text class="count-all">{{ todayPersonnel.count || 0 }}</text>
                    </text>
                </view>
            </view>
            <view class="personnel-list" v-if="todayPersonnel.list && todayPersonnel.list.length > 0">
                <view class="personnel-item" v-for="(item, index) in todayPersonnel.list" :key="item.personId || index">
                    <view class="personnel-status-tag" :class="getStatusClass(item.currentStatusText)">
                        {{ item.currentStatusText || '' }}
                    </view>
                    <view class="personnel-item-inner">
                        <view class="personnel-avatar">
                            <cl-image :src="getPersonPhotoUrl(item.personPhotoUrl)" mode="aspectFill"
                                class="avatar-img"></cl-image>
                        </view>
                        <view class="personnel-info">
                            <view class="personnel-name">{{ item.personName || '' }}</view>
                            <view v-if="!isUndergroundPerson(item)" class="personnel-dept-row">
                                <text class="dept-only">{{ item.deptName || '' }}</text>
                                <view class="expert-tag">{{ item.roleName || '' }}</view>
                            </view>
                            <view v-if="isUndergroundPerson(item)" class="underground-count-row">
                                <text class="u-label">下井次数:</text>
                                <text class="u-val">{{ item.downWellCount ?? 0 }}</text>
                            </view>
                        </view>

                    </view>
                    <view v-if="isUndergroundPerson(item)" class="personnel-metrics-bar">
                        <text class="bar-seg"><text class="bar-lbl">下井时长:</text> {{ item.downWellDuration ||
                            '--' }}</text>
                        <text class="bar-line">|</text>
                        <text class="bar-seg"><text class="bar-lbl">平均下井时长:</text> {{ item.avgDownWellDuration
                            || '--' }}</text>
                    </view>
                </view>
            </view>
            <view v-else class="empty-repair">暂无数据</view>
        </view>



        <!-- 近期下井情况统计 -->
        <view class="section downwell-section">
            <view class="downwell-header">
                <view class="section-title downwell-section-title">近期下井情况统计</view>
                <view class="downwell-time-pill-shell" @tap="showTimePicker = true">
                    <text class="downwell-pill-text">{{ timeRangeText }}</text>
                </view>
            </view>
            <view class="chart-container downwell-chart-wrap">
                <Charts cartType="column" :chartData="downWellChartData" :colors="['#4d84ff']" :opts="columnOpts"
                    tooltipFormat="downWellTooltip" :ontouch="true" />
            </view>
        </view>

        <!-- 巡检统计 -->
        <view class="section inspection-section">
            <view class="inspection-header">
                <view class="section-title inspection-section-title">近期巡检任务完成情况</view>
                <view class="downwell-time-pill-shell" @tap="showInspectionTimePicker = true">
                    <text class="downwell-pill-text">{{ inspectionTimeRangeText }}</text>
                </view>
            </view>
            <view class="chart-container inspection-chart-wrap">
                <Charts cartType="line" :chartData="inspectionChartData" :colors="['#E8B84A', '#3A9EFF', '#3FBF8F']"
                    :opts="lineOpts" :ontouch="true" tooltipFormat="inspectionTooltip" />
            </view>
        </view>

        <!-- 近期报修完成情况 -->
        <view class="section repair-ring-section star-section">
            <view class="section-header">
                <view class="section-title">近期报修完成情况</view>
                <view class="repair-tabs">
                    <view class="tab-btn" :class="{ active: repairFlag === 1 }" @tap="handleRepairFlagChange(1)">
                        <text>近一周</text>
                    </view>
                    <view class="tab-btn" :class="{ active: repairFlag === 2 }" @tap="handleRepairFlagChange(2)">
                        <text>近一月</text>
                    </view>
                    <view class="tab-btn" :class="{ active: repairFlag === 3 }" @tap="handleRepairFlagChange(3)">
                        <text>近三月</text>
                    </view>
                </view>
            </view>
            <view class="repair-content">
                <view class="repair-gauge-column">
                    <view class="repair-gauge-wrap">
                        <svg class="repair-gauge-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <!-- 3/9 点微光 -->
                            <circle cx="182" cy="100" r="10" fill="rgba(58,158,255,0.14)" />
                            <circle cx="18" cy="100" r="10" fill="rgba(58,158,255,0.14)" />
                            <!-- 外层虚线装饰环 -->
                            <circle class="repair-gauge-outer-dash" cx="100" cy="100" :r="repairGaugeGeo.rOuter"
                                fill="none" stroke="rgba(100,160,230,0.35)" stroke-width="1" stroke-dasharray="3 5" />
                            <!-- 先 -90 使缺口在上方，再 180° 绕心翻转，缺口落在正下方 -->
                            <g transform="rotate(180 100 100)">
                                <g transform="rotate(-90 100 100)">
                                    <!-- 轨道：浅蓝未完成段 -->
                                    <circle cx="100" cy="100" :r="repairGaugeGeo.r" fill="none"
                                        stroke="rgba(58,158,255,0.22)" stroke-width="12" stroke-linecap="round"
                                        :stroke-dasharray="`${repairGaugeGeo.arcLen} ${repairGaugeGeo.c}`" />
                                    <!-- 进度：亮蓝 -->
                                    <circle cx="100" cy="100" :r="repairGaugeGeo.r" fill="none" stroke="#3A9EFF"
                                        stroke-width="12" stroke-linecap="round"
                                        :stroke-dasharray="`${repairGaugeGeo.progLen} ${repairGaugeGeo.c}`" />
                                </g>
                            </g>
                            <!-- 底部缺口刻度 -->
                            <g v-for="(t, ti) in repairGaugeTicks" :key="'tk' + ti">
                                <line :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2" stroke="rgba(58,158,255,0.55)"
                                    stroke-width="2" stroke-linecap="round" />
                            </g>
                        </svg>
                        <view class="repair-gauge-center">
                            <text class="repair-gauge-pct">{{ repairGaugeGeo.rate }}%</text>
                            <view class="repair-gauge-tri">
                                <img src="@/static/icon/home/arrow.png" alt="" style="width:32rpx">
                            </view>
                            <text class="repair-gauge-cap">任务完成率</text>
                        </view>
                    </view>
                    <view class="repair-kpi-cards">
                        <view class="repair-kpi-card repair-kpi-done">
                            <text class="repair-kpi-label">已处理</text>
                            <view class="repair-kpi-bar">
                                <text class="repair-kpi-num">{{ repairSummary.handled || 0 }}</text>
                            </view>
                        </view>
                        <view class="repair-kpi-card repair-kpi-wait">
                            <text class="repair-kpi-label">待维修</text>
                            <view class="repair-kpi-bar repair-kpi-wait-bar">
                                <text class="repair-kpi-num repair-kpi-num-gold">{{ repairSummary.wait || 0 }}</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 近期报修列表 -->
        <view class="section recent-repair-section">
            <view class="section-header recent-repair-header">
                <view class="section-title recent-repair-title" @tap="goToRepairList">近期报修</view>
                <view class="downwell-time-pill-shell">
                    <text class="downwell-pill-text">近一周</text>
                </view>
            </view>
            <view class="repair-list scrollable-list">
                <view class="repair-item" v-for="(item, index) in recentRepairList" :key="index">
                    <view class="repair-cat-tab" :class="getRepairCategoryClass(item)">
                        {{ repairCategoryText(item) }}
                    </view>
                    <view class="repair-item-inner">
                        <view class="repair-item-header">
                            <view class="status-tag repair-status-pill" :class="getFixStatusClass(item.fixStatusName)">
                                {{
                                    item.fixStatusName || '' }}</view>
                        </view>
                        <view class="repair-item-body">
                            <template v-if="item.faultTaskType === 0">
                                <view class="item-row">
                                    <text class="label">所属子系统：</text>
                                    <text class="value ellipsis">{{ item.childSysName || '-' }}</text>
                                </view>
                                <view class="item-row">
                                    <text class="label">报修时间：</text>
                                    <text class="value">{{ formatRepairEndTime(item) }}</text>
                                </view>
                                <view class="item-row">
                                    <text class="label">维修人：</text>
                                    <text class="value">{{ item.nickName || '-' }}</text>
                                </view>
                            </template>
                            <template v-else>
                                <view class="item-row">
                                    <text class="label">联系人：</text>
                                    <text class="value ellipsis">{{ item.contactName || '-' }}</text>
                                </view>
                                <view class="item-row">
                                    <text class="label">联系电话：</text>
                                    <text class="value">{{ item.contactTel || '-' }}</text>
                                </view>
                                <view class="item-row">
                                    <text class="label">报修时间：</text>
                                    <text class="value">{{ formatRepairEndTime(item) }}</text>
                                </view>

                            </template>
                        </view>
                    </view>
                </view>
                <view v-if="!recentRepairList || recentRepairList.length === 0" class="empty-repair">暂无数据</view>
            </view>
        </view>

        <!-- 明星员工 -->
        <view class="section star-section">
            <view class="section-header star-section-header">
                <view class="section-title star-section-title">明星员工</view>
            </view>
            <view class="star-list">
                <view class="star-item" v-for="(item, idx) in starEmployees" :key="item.personId || idx">
                    <view class="rank-badge" :class="['rank-' + Math.min(idx + 1, 5)]">
                        <text class="rank-num">{{ idx + 1 }}</text>
                    </view>
                    <view class="star-info">
                        <view class="star-name-row">
                            <text class="star-name">{{ item.personName || '-' }}</text>
                            <view v-if="item.deptName" class="dept-tag">{{ item.deptName }}</view>
                        </view>
                        <view class="star-role">{{ item.roleName || '-' }}</view>
                        <view class="star-metrics">
                            <text class="metric-item">评价次数: {{ item.assessNum ?? 0 }}</text>
                            <text class="metric-item">处理工单数: {{ item.workOrderNum ?? 0 }}</text>
                        </view>
                    </view>
                    <view class="star-score-wrap">
                        <view class="star-score-hex">
                            <text class="star-score-num">{{ item.score ?? 0 }}</text>
                        </view>
                    </view>
                </view>
                <view v-if="!starEmployees || starEmployees.length === 0" class="empty-repair">暂无数据</view>
            </view>
        </view>

    </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue"
import { useCool } from "/@/cool"
import { config } from "/@/config"
import dayjs from "dayjs"
import Charts from "./charts.vue"
import { getTodayMaintenancePerson, getRecentDownWellStats, getInspectionCountLine, getRepairCompletion, getRecentRepairList, getStarEmployees } from "../api"
import { addDomainPrefix } from "/@/cool/utils"

const { router } = useCool()

// 今日运维人员
const todayPersonnel = ref({
    count: 0,
    ywCount: 0,
    list: [] as any[]
})

// 近期下井情况统计
const downWellListData = ref<any[]>([])
const timeRangeText = ref("近一周")
const showTimePicker = ref(false)

// 巡检统计
const inspectionTimeRangeText = ref("近一周")
const showInspectionTimePicker = ref(false)
const inspectionChartData = ref<{
    categories: string[]
    series: Array<{
        name: string
        data: number[]
        legendShape?: string
    }>
    sortedKeys: string[]
}>({
    categories: [],
    series: [
        {
            name: "巡检总数",
            data: [],
            legendShape: "square",
        },
        {
            name: "巡检转维修数",
            data: [],
            legendShape: "square",
        },
        {
            name: "巡检任务合格数",
            data: [],
            legendShape: "square",
        }
    ],
    sortedKeys: []
})
const downWellMaxValue = computed(() => {
    return Math.ceil(Math.max(...downWellChartData.value.series[0].data) / 5) * 5
})
const inspectionMaxValue = computed(() => {
    const max1 = Math.ceil(Math.max(...inspectionChartData.value.series[0].data) / 5) * 5
    const max2 = Math.ceil(Math.max(...inspectionChartData.value.series[1].data) / 5) * 5
    const max3 = Math.ceil(Math.max(...inspectionChartData.value.series[2].data) / 5) * 5
    let max4 = Math.max(max1, max2, max3)
    if (max4 === 5) {
        max4 = 10
    }
    return max4
})
// 报修完成情况（环形图）
const repairFlag = ref<number>(1) // 1近一周 2近一月 3近三月
const repairSummary = ref({
    handled: 0,
    wait: 0,
    total: 0,
    rate: 0
})

/** 近期报修仪表盘：270° 弧 + 底部 90° 缺口刻度（与参考稿一致） */
const repairGaugeGeo = computed(() => {
    const r = 82
    const rOuter = 92
    const c = 2 * Math.PI * r
    const arcLen = c * 0.75
    const rate = Math.min(100, Math.max(0, Number(repairSummary.value.rate) || 0))
    const progLen = arcLen * (rate / 100)
    return { r, rOuter, c, arcLen, progLen, rate }
})

const repairGaugeTicks = computed(() => {
    const inner = 74
    const outer = 91
    const ticks: { x1: number; y1: number; x2: number; y2: number }[] = []
    for (let i = 0; i <= 14; i++) {
        const deg = 45 + (i * 90) / 14
        const rad = (deg * Math.PI) / 180
        ticks.push({
            x1: 100 + Math.cos(rad) * inner,
            y1: 100 + Math.sin(rad) * inner,
            x2: 100 + Math.cos(rad) * outer,
            y2: 100 + Math.sin(rad) * outer,
        })
    }
    return ticks
})

// 近期报修列表
const recentRepairList = ref<any[]>([])

// 明星员工
const starEmployees = ref<any[]>([])

// 柱状图数据
const downWellChartData = ref<{
    categories: string[]
    series: Array<{
        name: string
        data: number[]
    }>
}>({
    categories: [],
    series: [
        {
            name: "下井人次",
            data: []
        }
    ]
})

// 近期下井模块顶部三项 KPI：与「近期巡检任务完成情况」同源数据（近 7 日巡检接口汇总）
const downWellKpiSummary = computed(() => {
    const series = inspectionChartData.value.series || []
    const sum = (idx: number) =>
        (series[idx]?.data || []).reduce((a, b) => a + (Number(b) || 0), 0)
    return {
        totalInspection: sum(0),
        toRepairOrder: sum(1),
        qualified: sum(2),
    }
})

// 柱状图配置（使用计算属性，以便访问原始数据）
const columnOpts = computed(() => {
    return {
        xAxis: {
            disableGrid: true,
            boundaryGap: "justify",
            fontSize: 11,
            fontColor: "#949DAD",
        },
        yAxis: {
            data: [{
                min: 0,
                max: downWellMaxValue.value,
                axisLine: false,
                disableGrid: false,
                gridType: "solid",
                gridColor: "#DDE1EE",
                fontSize: 11,
                fontColor: "#949DAD",
            }],
        },
        extra: {
            column: {
                type: "group",
                width: 20,
                barBorderCircle: true,
                activeBgColor: '#F1F4FF',
                activeBgOpacity: 0.95

            },
            tooltip: {
                showBox: true,
                showArrow: false,
                showCategory: false,
                bgColor: "#F7F9FC",
                bgOpacity: 0.98,
                borderColor: "#DDE1EE",
                borderWidth: 1,
                borderRadius: 12,
                fontColor: "#949DAD",
                fontSize: 12,
                lineHeight: 22,
                boxPadding: 8,
                splitLine: true,
                splitStroke: false,
                splitAreaWidth: 22,
                splitAreaColor: "#3A9EFF",
                splitAreaOpacity: 0.14,
                gridColor: "rgba(58, 158, 255, 0.25)",
                legendShow: false,
            },
        },
        legend: {
            show: true,
            position: "top",
            float: "left",
            margin: "8",
            fontSize: 12,
            fontColor: "#8ca0c0",
            lineHeight: 20,
        },
        padding: [0, 16, 16, 16],
        // 自定义 tooltip 格式化函数
        tooltipFormat: "downWellTooltip",
        // 存储原始数据，供 tooltip 使用
        _downWellListData: downWellListData.value,
    }
})

// 折线图配置（近期巡检任务完成情况：与设计图一致的网格、图例、曲线与 tooltip）
const lineOpts = computed(() => ({
    xAxis: {
        disableGrid: true,
        boundaryGap: "justify",
        scrollAlign: "left",
        labelCount: 10,
        fontSize: 11,
        fontColor: "#949DAD",
        formatter: (val: string) => {
            if (!val) return ""
            const d = dayjs(val)
            return d.isValid() ? d.format("MM.DD") : val
        },
    },
    yAxis: {
        data: [
            {
                min: 0,
                max: inspectionMaxValue.value,
                axisLine: false,
                disableGrid: false,
                fontSize: 11,
                fontColor: "#949DAD",
            },
        ],
        gridColor: "#DDE1EE",
        gridType: "solid",
    },
    extra: {
        line: {
            type: "curve",
            width: 2,
            activeType: "none",
        },
        tooltip: {
            showBox: true,
            showArrow: false,
            showCategory: false,
            bgColor: "#F7F9FC",
            bgOpacity: 0.98,
            borderColor: "#DDE1EE",
            borderWidth: 1,
            borderRadius: 12,
            fontColor: "#949DAD",
            fontSize: 12,
            lineHeight: 22,
            boxPadding: 8,
            splitLine: true,
            splitStroke: false,
            splitAreaWidth: 22,
            splitAreaColor: "#3A9EFF",
            splitAreaOpacity: 0.14,
            gridColor: "rgba(58, 158, 255, 0.25)",
            legendShow: false,
        },
        grid: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
    },
    legend: {
        show: true,
        position: "top",
        float: "left",
        margin: "10",
        padding: "4",
        itemGap: 12,
        fontColor: "#3d5a8a",
        lineHeight: 20,
    },
    // [上,右,下,左]：上留白给图例与曲线区、下留白给 X 轴刻度，避免与图例或横轴挤在一起
    padding: [16, 14, 18, 14],
    tooltipFormat: "inspectionTooltip",
    _inspectionChartData: inspectionChartData.value
}))

// 故障报修
function handleRepair() {
    router.push({
        path: "/pages_auto/repair/report/index",
    })
}

// 技术查询
function handleTechQuery() {
    router.push({
        path: "/pages/TecLibrary/index"
    })
}

// 加载今日运维人员
async function loadTodayPersonnel() {
    try {
        const res = await getTodayMaintenancePerson()
        todayPersonnel.value = {
            count: res.count || 0,
            ywCount: res.ywCount || 0,
            list: res.list || []
        }
    } catch (error) {
        console.error("加载今日运维人员失败:", error)
    }
}



// 获取人员照片URL（拼接域名）
function getPersonPhotoUrl(url: string): string {
    if (!url) {
        // 返回默认头像或占位图
        return '/static/icon/home/userDefault.png'
    }
    return addDomainPrefix(url)
}

// 格式化时长（秒转小时:分钟:秒）
function formatDuration(seconds: number): string {
    if (!seconds && seconds !== 0) return '0.00.00'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hours}.${minutes.toString().padStart(2, '0')}.${secs.toString().padStart(2, '0')}`
}

// 加载近期下井情况统计
async function loadRecentDownWellStats() {
    try {
        const res = await getRecentDownWellStats()
        const dataList = Array.isArray(res) ? res : (res?.data || res?.list || [])

        // 按日期排序（排序后的数据用于图表，确保索引对应）
        const sortedData = [...(dataList || [])].sort((a, b) => {
            return new Date(a.attendanceDate).getTime() - new Date(b.attendanceDate).getTime()
        })

        // 存储排序后的数据，确保 tooltip 索引对应
        downWellListData.value = sortedData

        // 提取日期（格式化为 MM.DD）
        const categories = sortedData.map((item: any) => {
            const date = dayjs(item.attendanceDate)
            return date.format("MM.DD")
        })

        // 提取下井人次数据
        const downWellCountData = sortedData.map((item: any) => item.downWellCount || 0)

        downWellChartData.value = {
            categories,
            series: [
                {
                    name: "下井人次",
                    data: downWellCountData
                }
            ]
        }
    } catch (error) {
        console.error("加载近期下井情况统计失败:", error)
    }
}

// 加载巡检统计数据（返回对象，内部是各字段的对象：date -> value）
async function loadInspectionStats() {
    try {
        const res = await getInspectionCountLine()
        const dataObj = res?.data || res || {}

        const inspectionCountObj = dataObj.inspectionCount || {}
        const inspectionToRepairObj = dataObj.inspectionToRepairCount || {}
        const inspectionQualifiedObj = dataObj.inspectionQualifiedCount || {}

        // 汇总所有日期键
        const allKeys = new Set<string>([
            ...Object.keys(inspectionCountObj),
            ...Object.keys(inspectionToRepairObj),
            ...Object.keys(inspectionQualifiedObj),
        ])

        if (allKeys.size === 0) {
            inspectionChartData.value = {
                categories: [],
                series: [
                    { name: "巡检总数", data: [] },
                    { name: "巡检转维修数", data: [] },
                    { name: "巡检任务合格数", data: [] }
                ],
                sortedKeys: []
            }
            return
        }

        // 对日期排序
        const sortedKeys = Array.from(allKeys).sort((a, b) => {
            const da = dayjs(a).isValid() ? dayjs(a).valueOf() : a.localeCompare(b)
            const db = dayjs(b).isValid() ? dayjs(b).valueOf() : a.localeCompare(b)
            return da - db
        })

        // categories 显示 MM.DD
        const categories = sortedKeys.map((d, idx) => {
            const dd = dayjs(d)
            return dd.isValid() ? dd.format("MM.DD") : (d || `第${idx + 1}天`)
        })

        // 三条线数据按排序后的日期取值
        const inspectionCountData = sortedKeys.map((d) => Number(inspectionCountObj[d]) || 0)
        const inspectionToRepairData = sortedKeys.map((d) => Number(inspectionToRepairObj[d]) || 0)
        const inspectionQualifiedData = sortedKeys.map((d) => Number(inspectionQualifiedObj[d]) || 0)

        inspectionChartData.value = {
            categories,
            series: [
                { name: "巡检总数", data: inspectionCountData },
                { name: "巡检转维修数", data: inspectionToRepairData },
                { name: "巡检任务合格数", data: inspectionQualifiedData }
            ],
            sortedKeys: sortedKeys
        }
    } catch (error) {
        console.error("加载巡检统计数据失败:", error)
    }
}

// 加载报修完成情况（环形图）
async function loadRepairCompletion() {
    try {
        const res = await getRepairCompletion({ flag: repairFlag.value })

        const handled = Number(res?.completedCount || 0)
        const wait = Number(res?.pendingCount || 0)
        const total = Number(res?.totalCount || 0)
        // completionRate 是小数形式（0.16），需要转换为百分比（16%）
        const rate = res?.completionRate !== undefined ? Math.round(res.completionRate * 100) : 0

        repairSummary.value = {
            handled,
            wait,
            total,
            rate
        }
    } catch (error) {
        console.error("加载报修完成情况失败:", error)
    }
}

// 维修状态样式
function getFixStatusClass(status: string) {
    if (!status) return 'status-default'
    if (status.includes('待') || status.includes('处理中')) return 'status-pending'
    if (status.includes('完成') || status.includes('已')) return 'status-done'
    return 'status-default'
}

// 时间格式化
function formatDateTime(dt: string) {
    if (!dt) return '-'
    const d = dayjs(dt)
    return d.isValid() ? d.format("YYYY-MM-DD HH:mm:ss") : dt
}

/** 分类角标：0 故障任务 / 非 0 非故障任务（与接口 faultTaskType 一致） */
function repairCategoryText(item: any) {
    if (item?.faultTaskTypeName) return item.faultTaskTypeName
    return item?.faultTaskType === 0 ? '故障任务' : '非故障任务'
}

function getRepairCategoryClass(item: any) {
    return item?.faultTaskType === 0 ? 'cat-fault' : 'cat-non-fault'
}

/** 待处理类状态不展示维修结束时间，与设计稿一致显示「-」 */
function formatRepairEndTime(item: any) {
    return formatDateTime(item?.fixDate)
}

// 获取状态标签的样式类
function getStatusClass(statusText: string): string {
    if (!statusText) return 'status-default'
    if (statusText.includes('远程运维')) return 'status-remote'
    if (statusText.includes('地面运维')) return 'status-ground'
    if (statusText.includes('井下运维')) return 'status-underground'
    if (statusText.includes('休班') || statusText.includes('休假')) return 'status-rest'
    return 'status-default'
}


function isUndergroundPerson(item: any): boolean {
    return (item?.currentStatusText || '').includes('井下运维')
}

// 刷新数据的方法
async function refreshData() {
    await Promise.all([
        loadTodayPersonnel(),
        loadRecentDownWellStats(),
        loadInspectionStats(),
        loadRepairCompletion(),
        loadRecentRepairList(),
        loadStarEmployees()
    ])
}

onMounted(() => {
    refreshData()
})

// 暴露刷新方法供父组件调用
defineExpose({
    refreshData
})

// tab 切换（报修完成情况）
function handleRepairFlagChange(flag: number) {
    if (repairFlag.value === flag) return
    repairFlag.value = flag
    loadRepairCompletion()
}

// 加载近期报修列表
async function loadRecentRepairList() {
    try {
        const res = await getRecentRepairList()
        const list = Array.isArray(res) ? res : (res?.data || res?.list || [])
        // 按报修时间倒序
        const sorted = [...(list || [])].sort((a, b) => {
            return new Date(b.fixDate).getTime() - new Date(a.fixDate).getTime()
        })
        recentRepairList.value = sorted
    } catch (error) {
        console.error("加载近期报修列表失败:", error)
    }
}

// 跳转到报修列表页面（预留函数，地址待定）
function goToRepairList() {
    // TODO: 待确定跳转地址后，取消注释并修改路径
    // router.push({
    //     path: "/pages/repair/list" // 示例路径，需要根据实际页面路径修改
    // });
    console.log("跳转到报修列表页面（地址待定）")
}

// 加载明星员工
async function loadStarEmployees() {
    try {
        const res = await getStarEmployees()
        const list = Array.isArray(res) ? res : (res?.data || res?.list || [])
        starEmployees.value = list || []
    } catch (error) {
        console.error("加载明星员工失败:", error)
    }
}
</script>


<style lang="scss" scoped>
$gap: 24rpx;

.leader-home {
    background-color: #eff3fd;
    background-image: linear-gradient(180deg, #0b1688 0%, #1b2cd2 28%, #4873fa 55%, #eff3fd 100%);
    background-size: 100% 50%;
    background-repeat: no-repeat;
    background-position: top center;
    min-height: 100vh;
    padding: 24rpx;
    padding-bottom: 160rpx; // 为底部 tabbar 留出空间
}


// 操作按钮
.action-buttons {
    display: flex;
    justify-content: space-between;
    width: calc(100% + 20rpx);
    margin-left: -10rpx;
    margin-bottom: $gap * 1.5;
    margin-top: $gap * 2.2;
}

.action-btn {
    position: relative;
    height: 227rpx;
    width: 353rpx;
    border-radius: 24rpx;
    cursor: pointer;

    .btn-text {
        position: absolute;
        top: 54rpx;
        left: 0;
        font-size: 35rpx;
        color: #13144F;
        line-height: 50rpx;
        font-weight: 600;
    }

    &.repair-btn .btn-text {
        left: 42rpx;
    }

    &.query-btn .btn-text {
        left: 58rpx;
    }
}

// .top-img {
//     height: 3rem !important;
//     width: 4rem !important;
// }

// 通用区块样式
.section {
    // background-color: #fff;
    // border-radius: 24rpx;
    padding: $gap;
    margin-bottom: $gap;
    // box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
    background: linear-gradient(270deg, #F6F8FC 0%, #FFFFFF 100%);
    border-radius: 21rpx 21rpx 21rpx 21rpx;
    border: 2rpx solid #FFFFFF;
}

.section-title {
    font-weight: 700;
    font-size: 29rpx;
    color: #13144F;
    line-height: 60rpx;
    font-family: Alibaba PuHuiTi 3.0, Alibaba PuHuiTi 30;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

// 今日运维人员模块
.personnel-section {
    background: linear-gradient(180deg, #DCF0FF 0%, #FFFFFF 100%);
}

.personnel-header {
    align-items: center;
}

.personnel-title {
    color: #1a1a2e;
    font-weight: 700;
    letter-spacing: 0.5rpx;
}

.personnel-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    margin-top: 20rpx;
    padding: 20rpx 16rpx;
    background: #e8f1ff;
    border-radius: 20rpx;
    box-sizing: border-box;
}

.personnel-item {
    position: relative;
    padding: 32rpx 36rpx;
    margin-bottom: 0;
    background: linear-gradient(270deg, #DCF0FF 0%, #FFFFFF 100%);
    border-radius: 24rpx;
    border: 2rpx solid #b8d4f0;
    box-sizing: border-box;
    overflow: hidden;
}

.personnel-item-inner {
    display: flex;
    align-items: center;
    gap: 24rpx;
}

.personnel-avatar {
    flex-shrink: 0;
    width: 104rpx;
    height: 104rpx;
    border-radius: 24rpx;
    overflow: hidden;
    background: #f2f7ff;
    border: 1rpx solid rgba(184, 212, 240, 0.85);
    box-sizing: border-box;

    .avatar-img {
        width: 100%;
        height: 100%;
    }
}

.personnel-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    padding-right: 140rpx;
}

.personnel-name {
    font-size: 34rpx;
    font-weight: 700;
    color: #0f1f3d;
    line-height: 1.35;
}

.personnel-dept {
    font-size: 24rpx;
    color: #4a6585;
    line-height: 1.45;
}

.personnel-dept-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10rpx;
}

.dept-only {
    font-size: 24rpx;
    line-height: 1.45;
    color: #13144F;
}

.expert-tag {
    display: inline-flex;
    align-items: center;
    height: 32rpx;
    padding: 0rpx 18rpx;
    font-size: 20rpx;
    font-weight: 500;
    color: #ffffff;
    background: #5b67f1;
    border-radius: 999rpx;
}

.underground-count-row {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #4a6585;
    line-height: 1.45;

    .u-label {
        margin-right: 8rpx;
    }

    .u-val {
        color: #333;
        font-weight: 600;
    }
}

.personnel-metrics-bar {
    margin-top: 14rpx;
    padding: 10rpx 20rpx;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8rpx 12rpx;
    font-size: 22rpx;
    color: #4a6585;
    line-height: 1.5;
    background: #FEFFFF;
    border-radius: 6rpx 6rpx 6rpx 6rpx;
    border: 1rpx solid #DCF0FF;
}

.bar-lbl {
    color: #949DAD;
    margin-right: 4rpx;
}

.bar-line {
    color: rgba(74, 101, 133, 0.45);
    font-weight: 300;
}

.personnel-status-tag {
    position: absolute;
    top: 7rpx;
    right: 7rpx;
    z-index: 2;
    padding: 14rpx 22rpx 14rpx 28rpx;
    font-size: 26rpx;
    font-weight: 500;
    color: #fff;
    white-space: nowrap;
    /* 右上与卡片圆角对齐，左下圆角，左上与右下直角 */
    border-radius: 0 24rpx 0 20rpx;
    max-width: 52%;

    &.status-remote {
        background: linear-gradient(90deg, #1a4fd4 0%, #4db8ff 100%);
    }

    &.status-ground {
        background: linear-gradient(90deg, #0d7ae8 0%, #35b0ff 100%);
    }

    &.status-underground {
        background: linear-gradient(90deg, #e87e5e 0%, #f2ad4e 100%);
    }

    &.status-rest {
        background: linear-gradient(90deg, #9e9e9e 0%, #bdbdbd 100%);
    }

    &.status-default {
        background: linear-gradient(90deg, #8a8a9a 0%, #a8a8b8 100%);
    }
}

// 近期下井情况统计模块
.downwell-time-pill-shell {
    width: 185rpx;
    height: 69rpx;
    flex-shrink: 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    background: url('@/static/icon/home/time-pill-bg.png') no-repeat center center;
    background-size: 100% 100%;
}

.downwell-pill-text {
    font-size: 26rpx;
    font-weight: 500;
    color: #ffffff;
    line-height: 1.2;
    margin-left: 24rpx;

    .count-current {
        font-size: 31rpx;
        color: #FFFFFF;
    }

    .count-all {
        font-size: 31rpx;
        color: rgba(255, 255, 255, 0.5);
    }
}

.downwell-section {
    // background: #e8effc;
    // box-shadow: 0 6rpx 24rpx rgba(26, 43, 75, 0.06);
    // border-radius: 22rpx;
    // padding: 28rpx 24rpx 24rpx;
    // overflow: visible;

    .downwell-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 28rpx;
        gap: 16rpx;
    }

    .downwell-section-title {
        flex: 1;
        min-width: 0;
    }

    // 右侧「时间」标签：左上尖角 + 左侧内凹弧线 + 右侧略圆角（外层裁切，避免裁掉 drop-shadow 不用 overflow:hidden）


    .downwell-kpi-row {
        display: flex;
        gap: 14rpx;
        margin-bottom: 20rpx;
    }

    .downwell-kpi-card {
        flex: 1;
        min-width: 0;
        padding: 18rpx 12rpx 20rpx;
        background: rgba(255, 255, 255, 0.72);
        border-radius: 16rpx;
        border: 1rpx solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 2rpx 12rpx rgba(26, 43, 75, 0.05);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14rpx;
    }

    .downwell-kpi-label {
        display: flex;
        align-items: flex-start;
        gap: 8rpx;
        width: 100%;
    }

    .kpi-indicator {
        flex-shrink: 0;
        width: 6rpx;
        min-height: 28rpx;
        margin-top: 4rpx;
        border-radius: 4rpx;

        &.kpi-orange {
            background: #f39c12;
        }

        &.kpi-blue {
            background: #3498db;
        }

        &.kpi-green {
            background: #2ecc71;
        }
    }

    .kpi-label-text {
        flex: 1;
        font-size: 22rpx;
        font-weight: 500;
        color: #3d5a8a;
        line-height: 1.35;
    }

    .kpi-value {
        font-size: 40rpx;
        font-weight: 700;
        color: #1a2b4b;
        line-height: 1.2;
        text-align: center;
    }

    .downwell-chart-wrap {
        margin-top: 8rpx;
        background: #F7F9FC;
        border-radius: 15rpx 15rpx 15rpx 15rpx;
    }
}

.chart-container {
    width: 100%;
    height: 500rpx;
    margin-top: $gap;
}

.downwell-section .chart-container {
    margin-top: 0;
    height: 460rpx;
}

// 近期巡检任务完成情况（与设计图一致的浅蓝卡片 + 右侧折叠「近一周」标签）
.inspection-section {
    // background: linear-gradient(165deg, #e8f1fc 0%, #ddeaf8 48%, #e3eefb 100%);
    // box-shadow: 0 8rpx 28rpx rgba(26, 43, 75, 0.07);
    // border-radius: 24rpx;
    // padding: 28rpx 24rpx 22rpx;
    // overflow: visible;
    // border: 1rpx solid rgba(255, 255, 255, 0.65);
}

.inspection-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12rpx;
    gap: 16rpx;
}

.inspection-section-title {
    flex: 1;
    min-width: 0;
}

.inspection-time-pill {
    position: relative;
    flex-shrink: 0;
    padding: 10rpx 26rpx 10rpx 36rpx;
    margin-right: -24rpx;
    margin-top: -6rpx;
    background: linear-gradient(105deg, #1e7ae8 0%, #3a9eff 52%, #5cb0ff 100%);
    border-radius: 8rpx 0 0 8rpx;
    box-shadow: 0 4rpx 14rpx rgba(24, 144, 251, 0.38);
}

.inspection-time-pill::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 22rpx 14rpx 22rpx 0;
    border-color: transparent #1568cf transparent transparent;
    filter: brightness(0.92);
}

.inspection-pill-text {
    position: relative;
    z-index: 1;
    font-size: 26rpx;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 1rpx;
}

.inspection-chart-wrap {
    margin-top: 0;
    height: 500rpx;
    background: #F7F9FC;
    border-radius: 15rpx 15rpx 15rpx 15rpx;
}

// 报修完成情况
.repair-ring-section {
    .section-header {
        gap: 16rpx;
    }

    .repair-tabs {
        display: flex;
        flex: 0 0 auto;
        align-items: stretch;
        width: 336rpx;
        max-width: 48vw;
        border-radius: 9999rpx;
        border: 1rpx solid #8ab4ff;
        overflow: hidden;
        background: #ffffff;
        box-sizing: border-box;
    }

    .repair-tabs .tab-btn {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10rpx 8rpx;
        border-right: 1rpx solid #8ab4ff;
        background: transparent;

        &:last-child {
            border-right: none;
        }

        text {
            font-size: 24rpx;
            font-weight: 500;
            color: #13144f;
            line-height: 1.2;
        }

        &.active {
            background: #3b5bdb;

            text {
                color: #ffffff;
            }
        }
    }

    .repair-content {
        width: 100%;
        margin-top: 24rpx;
    }

    .repair-gauge-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        gap: 8rpx;
    }

    .repair-gauge-wrap {
        position: relative;
        width: 100%;
        max-width: 520rpx;
        height: 380rpx;
        margin: 0 auto;
    }

    .repair-gauge-svg {
        width: 100%;
        height: 100%;
        display: block;
    }

    .repair-gauge-center {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-bottom: 36rpx;
        pointer-events: none;
    }

    .repair-gauge-pct {
        font-size: 56rpx;
        font-weight: 700;
        color: #16a34a;
        line-height: 1.1;
    }


    .repair-gauge-cap {
        margin-top: 12rpx;
        font-size: 26rpx;
        color: #8a96a8;
        font-weight: 500;
    }

    .repair-kpi-cards {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
        max-width: 640rpx;
        gap: 24rpx;
        padding: 0 8rpx 8rpx;
        box-sizing: border-box;
    }

    .repair-kpi-card {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12rpx;
    }

    .repair-kpi-label {
        font-size: 28rpx;
        font-weight: 600;
        color: #1e3a5f;
    }

    .repair-kpi-bar {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 88rpx;
        padding: 12rpx 8rpx;
        box-sizing: border-box;
        border-radius: 8rpx;
        position: relative;
        background: url('@/static/icon/home/complete.png') no-repeat center center;
        background-size: 100% 100%;
    }

    .repair-kpi-wait-bar {
        background: url('@/static/icon/home/pending.png') no-repeat center center;
        background-size: 100% 100%;
    }


    .repair-kpi-bracket {
        font-size: 52rpx;
        font-weight: 300;
        line-height: 1;
        color: #3a9eff;
        padding: 0 2rpx;
    }

    .repair-kpi-bracket-gold {
        color: #d4a012;
    }

    .repair-kpi-num {
        flex: 1;
        text-align: center;
        font-size: 48rpx;
        font-weight: 700;
        color: #2b7fd4;
        min-width: 0;
    }

    .repair-kpi-num-gold {
        color: #c9a227;
    }

    .repair-kpi-arrow {
        width: 0;
        height: 0;
        flex-shrink: 0;
    }

    /* 指向数字：左缘向右、右缘向左 */
    .repair-kpi-arrow-in {
        border-top: 8rpx solid transparent;
        border-bottom: 8rpx solid transparent;
        border-left: 10rpx solid #3a9eff;
    }

    .repair-kpi-arrow-in.repair-kpi-arrow-right {
        border-left: none;
        border-right: 10rpx solid #3a9eff;
    }

    .repair-kpi-arrow-gold.repair-kpi-arrow-in {
        border-left-color: #d4a012;
    }

    .repair-kpi-arrow-gold.repair-kpi-arrow-right.repair-kpi-arrow-in {
        border-right-color: #d4a012;
    }
}

// 近期报修列表（设计稿：浅蓝底、左上分类角标、右上状态胶囊、标签/数值双色）
.recent-repair-section {

    .recent-repair-header {
        margin-bottom: 24rpx;
        align-items: center;
    }

    .recent-repair-title {
        // font-size: 32rpx;
        // font-weight: 700;
        // color: #1e3a5f;
        // letter-spacing: 0.5rpx;
    }

    // 右上角「近一周」：右侧贴边圆角，左侧斜切
    .time-selector.repair-week-tab {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12rpx 28rpx 12rpx 40rpx;
        margin-right: -24rpx;
        background: linear-gradient(100deg, #2b8ae8 0%, #3a8ee6 55%, #4b9fff 100%);
        clip-path: polygon(22rpx 0, 100% 0, 100% 100%, 0 100%);
        border-radius: 0 16rpx 16rpx 0;

        .time-text {
            font-size: 26rpx;
            font-weight: 500;
            color: #ffffff;
        }
    }

    .repair-list {
        display: flex;
        flex-direction: column;
        gap: 28rpx;

        &.scrollable-list {
            max-height: 900rpx;
            overflow-y: auto;
            overflow-x: hidden;

            &::-webkit-scrollbar {
                width: 6rpx;
            }

            &::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.5);
                border-radius: 3rpx;
            }

            &::-webkit-scrollbar-thumb {
                background: #b8d4f0;
                border-radius: 3rpx;
            }
        }
    }

    // 任务类型标签在卡片外顶部，浅蓝主体在 inner
    .repair-item {
        position: relative;
        padding: 0;
        overflow: visible;
    }

    .repair-item-inner {
        margin-top: 50rpx;
        padding: 0;
        border-radius: 32rpx;
        background: linear-gradient(45deg, #FFFFFF 0%, #DCF0FF 100%);
        border: 2rpx solid #ffffff;
        overflow: hidden;
        position: relative;
    }

    // 顶栏：仅右状态胶囊（分类在卡片外）
    .repair-item-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        min-height: 0;
        padding: 20rpx 0rpx 0;
    }

    // 左上分类：绝对定位在浅蓝卡片上方，底边与卡片顶边对齐
    .repair-cat-tab {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding: 0rpx 32rpx 0rpx 24rpx;
        height: 66rpx;
        font-size: 24rpx;
        font-weight: 500;
        color: #ffffff;
        line-height: 36rpx;
        border-radius: 21rpx 32rpx 0 0;

        &.cat-non-fault {
            background: #4d80f7;
        }

        &.cat-fault {
            background: #ff6077;
        }
    }

    // 右上状态：完整胶囊，与边缘留白
    .repair-status-pill {
        flex-shrink: 0;
        margin: 0;
        width: 110rpx;
        height: 40rpx;
        border-radius: 17rpx 0rpx 0rpx 17rpx;
        font-size: 22rpx;
        font-weight: 500;
        color: #ffffff;
        line-height: 40rpx;
        text-align: center;

        &.status-pending {
            background: #f5a623;
        }

        &.status-done {
            background: #4d80f7;
        }

        &.status-default {
            background: #8a9aaf;
        }
    }

    .repair-item-body {
        padding: 20rpx 28rpx 32rpx;
        display: flex;
        flex-direction: column;
        gap: 26rpx;
    }

    .item-row {
        display: flex;
        align-items: flex-start;
        gap: 16rpx;
        font-size: 26rpx;
        line-height: 1.5;

        .label {
            flex-shrink: 0;
            width: 200rpx;
            text-align: left;
            color: #13144F;
            font-weight: 400;
        }

        .value {
            flex: 1;
            min-width: 0;
            color: #2b7fd4;
            font-weight: 500;
        }

        .ellipsis {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }


}

.empty-repair {
    text-align: center;
    padding: 48rpx 0;
    color: #7a8aa8;
    font-size: 28rpx;
}

// 明星员工（浅蓝底、丝带排名、信息区、六边形综合分）
.star-section {


    .star-section-header {
        margin-bottom: 20rpx;
    }

    .star-section-title {
        font-size: 29rpx;
        color: #13144F;
        font-weight: 700;
        letter-spacing: 0.5rpx;
    }

    .star-list {
        display: flex;
        flex-direction: column;
        gap: 20rpx;
    }

    .star-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 24rpx;
        padding: 0rpx 20rpx 0rpx 12rpx;
        background: linear-gradient(270deg, #DCF0FF 0%, #FFFFFF 100%);
        border-radius: 15rpx 15rpx 15rpx 15rpx;
        border: 2rpx solid #FFFFFF;
        height: 156rpx;
    }

    .rank-badge {
        flex-shrink: 0;
        align-self: stretch;
        width: 46rpx;
        height: 58rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 49rpx;
        color: #fff;
        background: url('/static/icon/home/No4.png') no-repeat center center;
        background-size: 100% 100%;

        .rank-num {
            font-size: 32rpx;
            font-weight: 700;
            line-height: 1;
        }

        &.rank-1 {
            background: url('/static/icon/home/No1.png') no-repeat center center;
            background-size: 100% 100%;
        }

        &.rank-2 {
            background: url('/static/icon/home/No2.png') no-repeat center center;
            background-size: 100% 100%;
        }

        &.rank-3 {
            background: url('/static/icon/home/No3.png') no-repeat center center;
            background-size: 100% 100%;
        }

    }

    .star-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6rpx;
        padding-right: 8rpx;
    }

    .star-name-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12rpx;
    }

    .star-name {
        font-weight: 700;
        line-height: 1.3;
        font-size: 33rpx;
        color: #13144F;
    }

    .dept-tag {
        padding: 0rpx 18rpx;
        background: rgba(112, 147, 247, 0.1);
        border-radius: 33rpx 33rpx 33rpx 33rpx;
        border: 1rpx solid #7093F7;
        font-size: 21rpx;
        line-height: 44rpx;
        height: 40rpx;
        color: #4873FA;
    }

    .star-role {
        line-height: 1.35;
        font-size: 21rpx;
        color: #4873FA;
    }

    .star-metrics {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12rpx 28rpx;
        margin-top: 4rpx;
        font-size: 24rpx;
        color: #4a7bc8;
    }

    .metric-item {
        line-height: 1.4;
        font-size: 19rpx;
        color: #13144F;
    }

    .star-score-wrap {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        align-self: center;
        padding-left: 4rpx;
    }

    .star-score-hex {
        width: 90rpx;
        height: 104rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: url('/static/icon/home/rating.png') no-repeat center center;
        background-size: 100% 100%;
        // clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        // filter: drop-shadow(0 8rpx 14rpx rgba(26, 111, 212, 0.42));
        // background: radial-gradient(71.2% 71.9% at -11.98% 55.29%, #638AFC 0%, #4474FF 67.86%, #3867F0 100%);
        // border: 2rpx solid;
        // border-image: linear-gradient(270deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0)) 2 2;
    }

    .star-score-num {
        font-size: 33rpx;
        font-weight: 700;
        color: #ffffff;
        line-height: 1;
    }
}
</style>
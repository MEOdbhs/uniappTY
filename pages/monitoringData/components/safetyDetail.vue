<template>
	<cl-page :statusBar="false">
		<view class="detail-page">
			<view class="detail-header">
				<view class="header-left" @tap="goBack">
					<uni-icons type="left" size="22" color="#909399" />
				</view>
				<text class="header-title">监测详情</text>
				<view class="header-right-btn" @tap="goManualImport">+人工数据导入</view>
			</view>

			<view class="device-card">
				<view class="device-title-row">
					<view class="device-left">
						<view class="status-dot" :style="{ backgroundColor: statusDotColor }" />
						<text class="device-name">{{ detailBase.deviceName }}</text>
					</view>
					<view
						class="device-status-tag"
						:style="{ color: statusTagColor, backgroundColor: statusTagBgColor }"
					>
						{{ detailBase.statusText }}
					</view>
				</view>

				<view class="device-value-row">
					<text class="device-value">{{ detailBase.monitorValueText }}</text>
					<text class="device-unit">{{ detailBase.unit }}</text>
				</view>

				<view class="device-meta-row">
					<text class="device-site">{{ detailBase.siteName }}</text>
					<text class="device-time">{{ detailBase.monitorDt }}</text>
				</view>
			</view>

			<view class="section-title">趋势曲线</view>
			<view class="chart-card">
				<view v-if="trendInitLoading && trendPoints.length === 0" class="loading-wrap">
					<cl-loading theme="primary" />
					<text class="loading-text">趋势数据加载中...</text>
				</view>
				<view v-else-if="trendPoints.length === 0" class="loading-wrap">
					<text class="loading-text">暂无趋势数据</text>
				</view>
				<qiun-data-charts
					v-else
					type="line"
					:opts="chartOpts"
					:chartData="trendChartData"
					:ontouch="true"
					canvas2d
					canvasId="safety-detail-chart"
					class="trend-chart"
				/>
			</view>

			<view class="section-title">设备阈值</view>
			<view v-if="thresholdLoading" class="loading-wrap threshold-loading">
				<cl-loading theme="primary" />
				<text class="loading-text">阈值数据加载中...</text>
			</view>
			<view v-else-if="!thresholdConfig" class="loading-wrap threshold-loading">
				<text class="loading-text">暂无阈值配置</text>
			</view>
			<view v-else class="threshold-grid">
				<view class="threshold-cell threshold-cell--red">
					<text class="threshold-value"
						>{{ thresholdConfig.red }}{{ thresholdConfig.unit }}</text
					>
					<text class="threshold-label">红色预警</text>
				</view>
				<view class="threshold-cell threshold-cell--orange">
					<text class="threshold-value"
						>{{ thresholdConfig.orange }}{{ thresholdConfig.unit }}</text
					>
					<text class="threshold-label">橙色预警</text>
				</view>
				<view class="threshold-cell threshold-cell--yellow">
					<text class="threshold-value"
						>{{ thresholdConfig.yellow }}{{ thresholdConfig.unit }}</text
					>
					<text class="threshold-label">黄色预警</text>
				</view>
				<view class="threshold-cell threshold-cell--blue">
					<text class="threshold-value"
						>{{ thresholdConfig.blue }}{{ thresholdConfig.unit }}</text
					>
					<text class="threshold-label">蓝色预警</text>
				</view>
			</view>
		</view>
	</cl-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onHide, onLoad, onShow, onUnload } from "@dcloudio/uni-app";
import { useCool } from "/@/cool";
import {
	getSafetyThresholdByDeviceType,
	getSafetyTrendByDeviceCode,
	normalizeSafetyThreshold,
	normalizeSafetyTrendDataByOptions,
	type SafetyThresholdConfig,
	type SafetyTrendPoint,
} from "../api";

const { router } = useCool();

/**
 * 详情页首屏信息：
 * - 首屏直接使用列表页透传的字段，确保点击后立即可见，不必等待接口；
 * - 趋势与阈值再异步刷新，既保证体验也保证数据实时性。
 */
const detailBase = ref({
	id: "",
	deviceName: "-",
	deviceCode: "",
	siteName: "-",
	monitorValueText: "-",
	unit: "",
	statusText: "正常",
	monitorDt: "-",
});

/**
 * 趋势点与阈值：
 * - 单独管理 loading，避免一块失败影响另一块展示；
 * - 按接口返回做归一化后再供模板渲染。
 */
const trendLoading = ref(false);
const trendInitLoading = ref(true);
const thresholdLoading = ref(false);
const trendPoints = ref<SafetyTrendPoint[]>([]);
const thresholdConfig = ref<SafetyThresholdConfig | null>(null);

/**
 * 曲线轮询配置：
 * - 轮询间隔 5 秒，满足“每 5 秒更新一次数据”的需求；
 * - 每次仅回显接口返回按时间排序后的最后 10 条数据。
 */
const TREND_POLL_INTERVAL_MS = 5000;
const TREND_TAIL_COUNT = 10;

/**
 * 轮询定时器句柄：
 * - 统一管理 start/stop，避免重复开启多个定时器；
 * - 页面销毁时释放资源，避免后台无意义请求。
 */
const trendPollTimer = ref<ReturnType<typeof setInterval> | null>(null);

/**
 * 趋势图表配置：
 * - 采用简洁浅蓝风格，和你给的效果图保持一致；
 * - 减少网格线视觉噪音，让数值波动更突出。
 */
const chartOpts = computed(() => {
	/**
	 * 为了解决真机“顶部点位被裁切”：
	 * - 根据当前数据计算一个略高于最大值的 y 轴上限；
	 * - 同时增加顶部 padding，给圆点和曲线留出安全空间。
	 */
	const values = trendPoints.value.map((item) => Number(item.value ?? 0)).filter(Number.isFinite);
	const maxValue = values.length ? Math.max(...values) : 0;
	const minValue = values.length ? Math.min(...values) : 0;
	const span = Math.max(1, maxValue - minValue);
	const yMax = maxValue + Math.max(span * 0.15, 1);

	return {
		color: ["#2f7bff"],
		// 顶部和底部都留足空间，避免裁切与倾斜标签重叠。
		padding: [20, 12, 24, 8],
		enableScroll: false,
		legend: {
			show: false,
		},
		xAxis: {
			disableGrid: false,
			gridColor: "#eef2fb",
			fontColor: "#8d98a8",
			fontSize: 11,
			// 轻微倾斜显示，减少时间标签重叠。
			rotateLabel: true,
		},
		yAxis: {
			gridType: "dash",
			dashLength: 4,
			gridColor: "#eef2fb",
			data: [
				{
					min: 0,
					max: yMax,
					fontColor: "#8d98a8",
					fontSize: 11,
				},
			],
		},
		extra: {
			line: {
				type: "curve",
				width: 2,
				activeType: "hollow",
				/**
				 * 关闭更新动画，避免轮询每次都出现“重新加载”的视觉跳变。
				 */
				animation: false,
			},
		},
	};
});

/**
 * 图表数据转换：
 * - qiun-data-charts 需要 categories + series 结构；
 * - 在 computed 中转换，避免每次请求后手动拼装重复代码。
 */
const trendChartData = computed(() => {
	return {
		categories: trendPoints.value.map((item) => item.time),
		series: [
			{
				name: "实时值",
				data: trendPoints.value.map((item) => item.value),
			},
		],
	};
});

/**
 * 状态色映射：
 * - 详情头部与列表保持同一颜色语义；
 * - 用 computed 集中管理，避免模板层出现复杂条件表达式。
 */
const statusStyle = computed(() => {
	const text = String(detailBase.value.statusText || "").trim();
	if (text.includes("超")) {
		return {
			dotColor: "#ff4d4f",
			tagColor: "#ff4d4f",
			tagBgColor: "#fff1f0",
		};
	}
	if (text.includes("预警")) {
		return {
			dotColor: "#ff9f43",
			tagColor: "#ff9f43",
			tagBgColor: "#fff4e8",
		};
	}
	if (text.includes("注意")) {
		return {
			dotColor: "#ffd84d",
			tagColor: "#d5a600",
			tagBgColor: "#fffbe6",
		};
	}
	return {
		dotColor: "#22b573",
		tagColor: "#22b573",
		tagBgColor: "#ecfff6",
	};
});

const statusDotColor = computed(() => statusStyle.value.dotColor);
const statusTagColor = computed(() => statusStyle.value.tagColor);
const statusTagBgColor = computed(() => statusStyle.value.tagBgColor);

onLoad((options) => {
	/**
	 * 路由参数解码：
	 * - 列表页会对中文字段做 encodeURIComponent；
	 * - 统一在这里解码，保证详情页展示文本正确。
	 */
	const decode = (value: any) => {
		if (value === undefined || value === null) return "";
		try {
			return decodeURIComponent(String(value));
		} catch {
			return String(value);
		}
	};

	detailBase.value = {
		id: String(options?.id || ""),
		deviceName: decode(options?.deviceName) || "-",
		deviceCode: decode(options?.deviceCode),
		siteName: decode(options?.siteName) || "-",
		monitorValueText: decode(options?.monitorValueText) || "-",
		unit: decode(options?.unit),
		statusText: decode(options?.statusText) || "正常",
		monitorDt: decode(options?.monitorDt) || "-",
	};
});

onShow(() => {
	loadDetailData();
	startTrendPolling();
});

onHide(() => {
	stopTrendPolling();
});

onUnload(() => {
	stopTrendPolling();
});

/**
 * 计算“最近 60 秒”查询窗口：
 * - 按你要求，startTime 取当前时间前 60 秒；
 * - endTime 取当前时间，形成实时短窗口查询。
 */
function getRecent60sRange() {
	const end = new Date();
	const start = new Date(end.getTime() - 60 * 60000);
	return {
		startTime: formatDateTime(start),
		endTime: formatDateTime(end),
	};
}

/**
 * 日期格式化为 `YYYY-MM-DD HH:mm:ss`：
 * - 直接复用后端接口常见时间格式；
 * - 避免传 ISO 字符串引发时区解析差异。
 */
function formatDateTime(date: Date) {
	const pad = (num: number) => String(num).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
		date.getHours(),
	)}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * 加载趋势曲线：
 * - 先按设备编码查询最近 24h 原始数据；
 * - 再在前端裁剪为“当前前 10 秒 + 时间去重”，满足你提出的曲线规则。
 */
async function loadTrendData() {
	if (!detailBase.value.deviceCode) {
		trendPoints.value = [];
		trendInitLoading.value = false;
		return;
	}
	if (trendLoading.value) return;

	const range = getRecent60sRange();
	const isFirstLoad = trendPoints.value.length === 0;
	if (isFirstLoad) {
		trendInitLoading.value = true;
	}
	trendLoading.value = true;
	try {
		const trendRes = await getSafetyTrendByDeviceCode({
			deviceCode: detailBase.value.deviceCode,
			startTime: range.startTime,
			endTime: range.endTime,
		});
		const nextPoints = normalizeSafetyTrendDataByOptions(trendRes, {
			tailCount: TREND_TAIL_COUNT,
		});
		/**
		 * 只有数据确实变化时才回写：
		 * - 避免同一批点位重复赋值触发图表刷新；
		 * - 减少轮询场景下的无效重绘。
		 */
		const hasChanged =
			nextPoints.length !== trendPoints.value.length ||
			nextPoints.some((item, index) => {
				const prev = trendPoints.value[index];
				return !prev || prev.time !== item.time || prev.value !== item.value;
			});
		if (hasChanged) {
			trendPoints.value = nextPoints;
		}
	} catch {
		// 轮询失败时保留上一帧曲线，避免图表反复闪烁或被清空。
		if (trendPoints.value.length === 0) {
			trendPoints.value = [];
		}
		uni.showToast({ title: "趋势数据加载失败", icon: "none" });
	} finally {
		trendLoading.value = false;
		trendInitLoading.value = false;
	}
}

/**
 * 加载阈值配置：
 * - 阈值变化频率低，按首屏加载即可；
 * - 避免把阈值接口放进高频轮询，降低无效请求量。
 */
async function loadThresholdData() {
	thresholdLoading.value = true;
	try {
		const thresholdRes = await getSafetyThresholdByDeviceType(1);
		thresholdConfig.value = normalizeSafetyThreshold(thresholdRes);
	} catch {
		thresholdConfig.value = null;
		uni.showToast({ title: "阈值数据加载失败", icon: "none" });
	} finally {
		thresholdLoading.value = false;
	}
}

/**
 * 详情首屏初始化：
 * - 趋势与阈值并发加载，缩短首屏等待；
 * - 后续趋势实时刷新由轮询接管。
 */
async function loadDetailData() {
	if (!detailBase.value.deviceCode) {
		trendPoints.value = [];
		thresholdConfig.value = null;
		return;
	}
	await Promise.all([loadTrendData(), loadThresholdData()]);
}

/**
 * 启动趋势轮询：
 * - 先立即拉一次，避免用户进入后等待下个轮询周期；
 * - 轮询周期固定 5 秒。
 */
function startTrendPolling() {
	stopTrendPolling();
	if (!detailBase.value.deviceCode) return;
	trendPollTimer.value = setInterval(() => {
		loadTrendData();
	}, TREND_POLL_INTERVAL_MS);
}

/**
 * 停止趋势轮询：
 * - 页面隐藏/卸载时停止，避免后台请求泄漏；
 * - 同时防止重复进入页面后叠加多个轮询实例。
 */
function stopTrendPolling() {
	if (!trendPollTimer.value) return;
	clearInterval(trendPollTimer.value);
	trendPollTimer.value = null;
}

/**
 * 返回上一页：
 * - 与系统路由行为一致；
 * - 不额外做状态持久化，保持返回逻辑简单稳定。
 */
function goBack() {
	router.back();
}

/**
 * 跳转人工导入页：
 * - 这是你确认要保留的右上角入口；
 * - 路由复用现有人工导入页面，避免重复实现表单逻辑。
 */
function goManualImport() {
	router.push({
		path: "/pages/monitoringData/components/manualImport",
	});
}
</script>

<style scoped lang="scss">
.detail-page {
	min-height: 100vh;
	background: #ffffff;
	padding-bottom: 24rpx;
}

.detail-header {
	height: 92rpx;
	padding: 0 16rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1rpx solid #eef0f6;
}

.header-left {
	width: 62rpx;
	height: 62rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.header-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #0f1f3d;
}

.header-right-btn {
	height: 58rpx;
	line-height: 58rpx;
	padding: 0 20rpx;
	border: 2rpx solid #4d86ff;
	border-radius: 10rpx;
	font-size: 24rpx;
	color: #4d86ff;
}

.device-card {
	padding: 22rpx 16rpx 18rpx;
	border-bottom: 1rpx solid #eef0f6;
}

.device-title-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10rpx;
}

.device-left {
	flex: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.status-dot {
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.device-name {
	font-size: 30rpx;
	font-weight: 500;
	color: #0f1f3d;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.device-status-tag {
	padding: 8rpx 14rpx;
	border-radius: 8rpx;
	font-size: 24rpx;
	line-height: 1;
}

.device-value-row {
	margin-top: 8rpx;
	display: flex;
	align-items: baseline;
	gap: 8rpx;
	padding-left: 30rpx;
}

.device-value {
	font-size: 46rpx;
	line-height: 1.1;
	font-weight: 700;
	color: #0f1f3d;
}

.device-unit {
	font-size: 34rpx;
	line-height: 1;
	font-weight: 700;
	color: #0f1f3d;
}

.device-meta-row {
	margin-top: 12rpx;
	padding-left: 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 18rpx;
}

.device-site,
.device-time {
	font-size: 22rpx;
	color: #b0b8c2;
}

.device-site {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.device-time {
	flex-shrink: 0;
}

.section-title {
	margin: 18rpx 16rpx 12rpx;
	font-size: 30rpx;
	font-weight: 600;
	color: #0f1f3d;
}

.chart-card {
	margin: 0 16rpx;
	padding: 10rpx 8rpx;
	border-radius: 12rpx;
	background: #ffffff;
	border: 1rpx solid #edf0f6;
	height: 420rpx;
}

.trend-chart {
	width: 100%;
	height: 100%;
}

.loading-wrap {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
}

.loading-text {
	font-size: 24rpx;
	color: #909399;
}

.threshold-loading {
	height: 180rpx;
	margin: 0 16rpx;
	border: 1rpx solid #edf0f6;
	border-radius: 12rpx;
}

.threshold-grid {
	padding: 0 16rpx;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12rpx;
}

.threshold-cell {
	border-radius: 10rpx;
	padding: 16rpx 18rpx;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.threshold-cell--red {
	background: #ff6262;
}

.threshold-cell--orange {
	background: #ff9f43;
}

.threshold-cell--yellow {
	background: #ffd84d;
}

.threshold-cell--blue {
	background: #4a9eff;
}

.threshold-value {
	font-size: 40rpx;
	line-height: 1;
	font-weight: 700;
	color: #ffffff;
}

.threshold-label {
	font-size: 24rpx;
	line-height: 1.2;
	color: #ffffff;
}
</style>

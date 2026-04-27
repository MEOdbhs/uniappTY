<template>
	<cl-page>
		<view class="detail-page">
			<view class="detail-header">
				<text class="header-title">监测详情</text>
				<view class="header-right-btn" @tap="goManualImport">+人工数据导入</view>
			</view>

			<view class="page-body">
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

			<view class="footer">
				<view class="config" @tap="openThresholdPopup">阈值配置</view>
				<view class="device" @tap="goDeviceArchive">设备档案</view>
			</view>
		</view>

		<cl-popup v-model="thresholdPopupVisible" direction="bottom" :padding="0" :z-index="1200" border-radius="20rpx 20rpx 0 0">
			<view class="popup-wrap">
				<view class="popup-header">
					<text class="popup-title">阈值配置</text>
					<uni-icons type="closeempty" size="24" color="#909399" @tap="closeThresholdPopup" />
				</view>
				<scroll-view scroll-y class="popup-content">
					<view class="form-row">
						<text class="form-label">红色预警</text>
						<input class="form-input" type="digit" v-model="thresholdForm.redAlarm" placeholder="请输入" />
					</view>
					<view class="form-row">
						<text class="form-label">橙色预警</text>
						<input class="form-input" type="digit" v-model="thresholdForm.orangeAlarm" placeholder="请输入" />
					</view>
					<view class="form-row">
						<text class="form-label">黄色预警</text>
						<input class="form-input" type="digit" v-model="thresholdForm.yellowAlarm" placeholder="请输入" />
					</view>
					<view class="form-row">
						<text class="form-label">蓝色预警</text>
						<input class="form-input" type="digit" v-model="thresholdForm.blueAlarm" placeholder="请输入" />
					</view>
					<view class="form-row">
						<text class="form-label">单位</text>
						<input class="form-input" type="text" v-model="thresholdForm.unit" placeholder="m / kN / mm ..." />
					</view>
					<view class="form-row">
						<text class="form-label">判定方向</text>
						<picker :range="directionOptions" range-key="label" @change="onDirectionChange" class="form-picker">
							<view class="picker-inner">
								<text class="picker-text">{{ currentDirectionLabel }}</text>
								<uni-icons type="bottom" size="16" color="#C0C4CC" />
							</view>
						</picker>
					</view>
					<view class="form-row">
						<text class="form-label">通知方式</text>
						<view class="checkbox-group">
							<view class="checkbox-item" @tap="toggleNoticeWay('1')">
								<text class="checkbox-icon" :class="{ 'is-checked': thresholdForm.noticeWays.includes('1') }">✓</text>
								<text>短信通知</text>
							</view>
							<view class="checkbox-item" @tap="toggleNoticeWay('2')">
								<text class="checkbox-icon" :class="{ 'is-checked': thresholdForm.noticeWays.includes('2') }">✓</text>
								<text>邮件通知</text>
							</view>
						</view>
					</view>
					<view class="form-row form-row--textarea">
						<text class="form-label">备注</text>
						<textarea class="form-textarea" v-model="thresholdForm.remark" placeholder="请输入备注" />
					</view>
				</scroll-view>
				<view class="popup-footer">
					<view class="btn-cancel" @tap="closeThresholdPopup">取消</view>
					<view class="btn-confirm" @tap="submitThreshold">保存</view>
				</view>
			</view>
		</cl-popup>
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
	saveAlarmThreshold,
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
	siteCode: "",
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

const thresholdPopupVisible = ref(false);
const thresholdForm = ref({
	id: "",
	deviceType: 1,
	redAlarm: "",
	orangeAlarm: "",
	yellowAlarm: "",
	blueAlarm: "",
	unit: "",
	condition: 1,
	noticeWays: [] as string[],
	remark: "",
});

const directionOptions = [
	{ label: "大于阈值预警", value: 1 },
	{ label: "小于阈值预警", value: 2 },
];

const currentDirectionLabel = computed(() => {
	const found = directionOptions.find((o) => o.value === thresholdForm.value.condition);
	return found ? found.label : "请选择判定方向";
});

function onDirectionChange(e: any) {
	const idx = e.detail.value;
	thresholdForm.value.condition = directionOptions[idx].value;
}

function toggleNoticeWay(val: string) {
	const idx = thresholdForm.value.noticeWays.indexOf(val);
	if (idx > -1) {
		thresholdForm.value.noticeWays.splice(idx, 1);
	} else {
		thresholdForm.value.noticeWays.push(val);
	}
}

function openThresholdPopup() {
	if (thresholdConfig.value && (thresholdConfig.value as any).raw) {
		const raw = (thresholdConfig.value as any).raw;
		thresholdForm.value.id = raw.id || "";
		thresholdForm.value.deviceType = raw.deviceType || 1;
		thresholdForm.value.redAlarm = raw.redAlarm !== undefined && raw.redAlarm !== null ? String(raw.redAlarm) : "";
		thresholdForm.value.orangeAlarm = raw.orangeAlarm !== undefined && raw.orangeAlarm !== null ? String(raw.orangeAlarm) : "";
		thresholdForm.value.yellowAlarm = raw.yellowAlarm !== undefined && raw.yellowAlarm !== null ? String(raw.yellowAlarm) : "";
		thresholdForm.value.blueAlarm = raw.blueAlarm !== undefined && raw.blueAlarm !== null ? String(raw.blueAlarm) : "";
		thresholdForm.value.unit = raw.unit || "";
		thresholdForm.value.condition = raw.condition || 1;
		thresholdForm.value.noticeWays = raw.noticeWay ? String(raw.noticeWay).split(",").filter(Boolean) : [];
		thresholdForm.value.remark = raw.remark || "";
	} else {
		thresholdForm.value.id = "";
		thresholdForm.value.deviceType = 1;
		thresholdForm.value.redAlarm = "";
		thresholdForm.value.orangeAlarm = "";
		thresholdForm.value.yellowAlarm = "";
		thresholdForm.value.blueAlarm = "";
		thresholdForm.value.unit = "";
		thresholdForm.value.condition = 1;
		thresholdForm.value.noticeWays = [];
		thresholdForm.value.remark = "";
	}
	thresholdPopupVisible.value = true;
}

function closeThresholdPopup() {
	thresholdPopupVisible.value = false;
}

async function submitThreshold() {
	try {
		uni.showLoading({ title: "保存中...", mask: true });
		const payload = {
			...thresholdForm.value,
			noticeWay: thresholdForm.value.noticeWays.join(","),
			redAlarm: thresholdForm.value.redAlarm === "" ? null : Number(thresholdForm.value.redAlarm),
			orangeAlarm: thresholdForm.value.orangeAlarm === "" ? null : Number(thresholdForm.value.orangeAlarm),
			yellowAlarm: thresholdForm.value.yellowAlarm === "" ? null : Number(thresholdForm.value.yellowAlarm),
			blueAlarm: thresholdForm.value.blueAlarm === "" ? null : Number(thresholdForm.value.blueAlarm),
		};
		await saveAlarmThreshold(payload);
		uni.hideLoading();
		uni.showToast({ title: "保存成功", icon: "success" });
		closeThresholdPopup();
		loadThresholdData();
	} catch (err: any) {
		uni.hideLoading();
		uni.showToast({ title: err.message || "保存失败", icon: "none" });
	}
}

onLoad((options) => {
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
		siteCode: decode(options?.siteCode) || "",
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

function getRecent60sRange() {
	const end = new Date();
	const start = new Date(end.getTime() - 60 * 60000);
	return {
		startTime: formatDateTime(start),
		endTime: formatDateTime(end),
	};
}

function formatDateTime(date: Date) {
	const pad = (num: number) => String(num).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
		date.getHours(),
	)}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

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
		if (trendPoints.value.length === 0) {
			trendPoints.value = [];
		}
		uni.showToast({ title: "趋势数据加载失败", icon: "none" });
	} finally {
		trendLoading.value = false;
		trendInitLoading.value = false;
	}
}

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

async function loadDetailData() {
	if (!detailBase.value.deviceCode) {
		trendPoints.value = [];
		thresholdConfig.value = null;
		return;
	}
	await Promise.all([loadTrendData(), loadThresholdData()]);
}

function startTrendPolling() {
	stopTrendPolling();
	if (!detailBase.value.deviceCode) return;
	trendPollTimer.value = setInterval(() => {
		loadTrendData();
	}, TREND_POLL_INTERVAL_MS);
}

function stopTrendPolling() {
	if (!trendPollTimer.value) return;
	clearInterval(trendPollTimer.value);
	trendPollTimer.value = null;
}

function goBack() {
	router.back();
}

function goManualImport() {
	router.push({
		path: "/pages/monitoringData/components/manualImport",
		query: {
			siteCode: detailBase.value.siteCode,
			siteName: encodeURIComponent(detailBase.value.siteName),
			deviceId: detailBase.value.id,
			deviceCode: encodeURIComponent(detailBase.value.deviceCode),
			deviceName: encodeURIComponent(detailBase.value.deviceName),
		},
	});
}

function goDeviceArchive() {
	router.push({
		path: "/pages/monitoringData/components/deviceArchiveList",
	});
}
</script>

<style scoped lang="scss">
.footer {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 24rpx;
	padding: 0 20rpx 20rpx;
	background: #ffffff;
	view {
		line-height: 88rpx;
		border-radius: 44rpx;
		width: 49%;
		color: #fff;
		text-align: center;
		font-size: 30rpx;
	}
	.config {
		background-color: #547bff;
	}
	.device {
		background-color: #2ba471;
	}
}

.detail-page {
	margin: 16rpx 20rpx 0;
	padding: 20rpx;
	background: linear-gradient(180deg, #f6f8fc 0%, #ffffff 100%);
	border-radius: 21rpx;
	border: 2rpx solid #ffffff;
	min-height: calc(100vh - 220rpx);
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.page-body {
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	padding-bottom: 40rpx;
}

.detail-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 16rpx;
}

.header-left {
	width: 62rpx;
	height: 62rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.header-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #303133;
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
	height: 320rpx;
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

.popup-wrap {
	display: flex;
	flex-direction: column;
	background: #ffffff;
	border-radius: 20rpx 20rpx 0 0;
	height: 70vh;
	width: 100%;
	box-sizing: border-box;
	overflow: hidden;
}

.popup-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid #eef0f6;
}

.popup-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #0f1f3d;
}

.popup-content {
	flex: 1;
	min-height: 0;
	padding: 20rpx 30rpx;
	width: 100%;
	box-sizing: border-box;
	overflow-x: hidden;
}

.form-row {
	display: flex;
	align-items: center;
	min-height: 100rpx;
	border-bottom: 1rpx solid #eef0f6;
	gap: 16rpx;
	padding: 0 4rpx;
	box-sizing: border-box;
}

.form-row--textarea {
	flex-direction: column;
	align-items: stretch;
	border-bottom: none;
	padding-top: 30rpx;
}

.form-row--textarea .form-label {
	margin-bottom: 20rpx;
}

.form-label {
	width: 160rpx;
	font-size: 28rpx;
	color: #303133;
	flex-shrink: 0;
}

.form-input {
	flex: 1;
	height: 100%;
	font-size: 28rpx;
	color: #303133;
	text-align: right;
	min-width: 0;
	padding-right: 6rpx;
	box-sizing: border-box;
}

.form-picker {
	flex: 1;
	min-width: 0;
}

.picker-inner {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	height: 100rpx;
	gap: 10rpx;
}

.picker-text {
	font-size: 28rpx;
	color: #303133;
	max-width: 360rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.checkbox-group {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 30rpx;
	min-width: 0;
	flex-wrap: wrap;
}

.checkbox-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	font-size: 28rpx;
	color: #303133;
}

.checkbox-icon {
	width: 32rpx;
	height: 32rpx;
	border-radius: 4rpx;
	border: 2rpx solid #c0c4cc;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	color: transparent;
	transition: all 0.2s;
}

.checkbox-icon.is-checked {
	background: #3d7eff;
	border-color: #3d7eff;
	color: #ffffff;
}

.form-textarea {
	width: 100%;
	height: 200rpx;
	background: #f5f7fa;
	border-radius: 12rpx;
	padding: 20rpx;
	font-size: 28rpx;
	color: #303133;
	box-sizing: border-box;
}

.popup-footer {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
	gap: 20rpx;
	border-top: 1rpx solid #eef0f6;
}

.btn-cancel,
.btn-confirm {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	border-radius: 44rpx;
	font-size: 30rpx;
}

.btn-cancel {
	background: #f5f7fa;
	color: #606266;
}

.btn-confirm {
	background: #3d7eff;
	color: #ffffff;
}
</style>

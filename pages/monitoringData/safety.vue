<template>
	<cl-page :statusBar="false">
		<view class="safety-page">
			<view class="stats-grid">
				<view class="stats-card stats-card--online">
					<text class="stats-num">{{ statView.online }}</text>
					<text class="stats-label">在线设备/共{{ statView.total }}</text>
				</view>
				<view class="stats-card stats-card--offline">
					<text class="stats-num">{{ statView.offline }}</text>
					<text class="stats-label">离线设备/共{{ statView.total }}</text>
				</view>
				<view class="stats-card stats-card--warning">
					<text class="stats-num">{{ statView.warning }}</text>
					<text class="stats-label">预警设备/共{{ statView.total }}</text>
				</view>
			</view>

			<view v-if="loading" class="state-wrap">
				<cl-loading theme="primary" />
				<text class="state-text">安全监测数据加载中...</text>
			</view>

			<view v-else-if="filteredSensorList.length === 0" class="state-wrap">
				<text class="state-text">暂无安全监测设备</text>
			</view>

			<view v-else class="sensor-list">
				<view
					v-for="item in filteredSensorList"
					:key="item.id"
					class="sensor-card"
					@tap="openDetail(item)"
				>
					<view class="sensor-title-row">
						<view class="sensor-left">
							<view class="status-dot" :style="{ backgroundColor: item.dotColor }" />
							<text class="sensor-name">{{ item.deviceName }}</text>
						</view>
						<view class="sensor-right">
							<view
								class="sensor-tag"
								:style="{ color: item.tagColor, backgroundColor: item.tagBgColor }"
							>
								{{ item.statusText }}
							</view>
							<uni-icons type="right" size="18" color="#c0c4cc" />
						</view>
					</view>

					<view class="sensor-value-row">
						<text class="sensor-value">{{ item.monitorValueText }}</text>
						<text class="sensor-unit">{{ item.unit }}</text>
					</view>

					<view class="card-meta">
						<text class="meta-item">工地：{{ item.siteName || "-" }}</text>
					</view>
					<view class="card-meta">
						<text class="meta-item">更新时间：{{ item.monitorDt || "-" }}</text>
					</view>
				</view>
			</view>
		</view>
	</cl-page>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useCool } from "/@/cool";
import {
	getSafetySensorList,
	getSafetyTopStat,
	normalizeSafetySensorList,
	type SafetySensorViewItem,
	type SafetyTopStatData,
} from "./api";

const props = withDefaults(
	defineProps<{
		names?: string;
	}>(),
	{
		names: "",
	},
);

const { router } = useCool();
const filteredKeyword = ref("");
const FILTER_DEBOUNCE_MS = 300;
const SAFETY_LIST_SIZE = 1000;
let filterDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 页面加载态：
 * - 统一控制“统计 + 列表”这两块异步内容；
 * - 避免局部加载造成页面上下闪烁不同步。
 */
const loading = ref(false);

/**
 * 顶部统计原始数据：
 * - 保留后端返回对象，后续若新增统计字段可直接扩展；
 * - 展示层通过 computed 再做最终数字兜底。
 */
const topStatRaw = ref<SafetyTopStatData>({
	onlineDeviceCount: 0,
	offlineDeviceCount: 0,
	alarmDeviceCount: 0,
});

/**
 * 列表展示数据：
 * - 使用 API 层归一化后的视图模型；
 * - 模板不再关心 alarmStatus/alarmColor 的原始差异。
 */
const sensorList = ref<SafetySensorViewItem[]>([]);

/**
 * 搜索关键字防抖：
 * - 参考视频监控 tab，输入过程不触发接口，避免频繁请求；
 * - 300ms 防抖可平衡输入响应和低端机性能。
 */
watch(
	() => props.names,
	(value) => {
		if (filterDebounceTimer) clearTimeout(filterDebounceTimer);
		filterDebounceTimer = setTimeout(() => {
			filteredKeyword.value = String(value || "")
				.trim()
				.toLowerCase();
		}, FILTER_DEBOUNCE_MS);
	},
	{ immediate: true },
);

onUnmounted(() => {
	if (filterDebounceTimer) clearTimeout(filterDebounceTimer);
});

/**
 * 前端过滤字段：
 * - 设备名称 + 工地名称；
 * - 告警状态也参与匹配，便于输入“预警/正常”等关键字快速定位。
 */
const filteredSensorList = computed(() => {
	const keyword = filteredKeyword.value;
	if (!keyword) return sensorList.value;
	return sensorList.value.filter((item) => {
		const deviceName = String(item.deviceName || "").toLowerCase();
		const siteName = String(item.siteName || "").toLowerCase();
		const statusText = String(item.statusText || "").toLowerCase();
		return (
			deviceName.includes(keyword) || siteName.includes(keyword) || statusText.includes(keyword)
		);
	});
});

/**
 * 统计展示模型：
 * - 统一把字符串/null 等异常值转数字；
 * - 总数由在线+离线计算，保障前端展示稳定。
 */
const statView = computed(() => {
	const online = Number(topStatRaw.value.onlineDeviceCount ?? 0) || 0;
	const offline = Number(topStatRaw.value.offlineDeviceCount ?? 0) || 0;
	const warning = Number(topStatRaw.value.alarmDeviceCount ?? 0) || 0;
	return {
		online,
		offline,
		warning,
		total: online + offline,
	};
});

/**
 * 统一构造请求参数：
 * - 采用“大列表+前端过滤”策略，因此不传 names；
 * - size 提升到 1000，保证前端搜索覆盖范围更完整。
 */
function buildQueryParams() {
	return {
		listDeviceType: 1,
		deviceType: 1,
		page: 1,
		size: SAFETY_LIST_SIZE,
	};
}

/**
 * 拉取页面核心数据：
 * - 顶部统计与列表并发请求，减少用户等待；
 * - 异常统一 toast，避免静默失败造成“看起来没反应”。
 */
async function loadSafetyData() {
	loading.value = true;
	const params = buildQueryParams();
	try {
		const [topRes, listRes] = await Promise.all([
			getSafetyTopStat(params),
			getSafetySensorList(params),
		]);
		topStatRaw.value = (topRes && typeof topRes === "object" && "data" in topRes
			? topRes.data
			: topRes) || {
			onlineDeviceCount: 0,
			offlineDeviceCount: 0,
			alarmDeviceCount: 0,
		};
		sensorList.value = normalizeSafetySensorList(listRes);
	} catch {
		topStatRaw.value = {
			onlineDeviceCount: 0,
			offlineDeviceCount: 0,
			alarmDeviceCount: 0,
		};
		sensorList.value = [];
		uni.showToast({ title: "安全监测数据加载失败", icon: "none" });
	} finally {
		loading.value = false;
	}
}

onShow(() => {
	loadSafetyData();
});

/**
 * 列表点击进入详情页：
 * - 只传详情首屏必需字段，避免 query 过长；
 * - 详情页再按 deviceCode 拉趋势与阈值，保证数据实时性。
 */
function openDetail(item: SafetySensorViewItem) {
	router.push({
		path: "/pages/monitoringData/components/safetyDetail",
		query: {
			id: item.id,
			deviceName: encodeURIComponent(item.deviceName),
			deviceCode: encodeURIComponent(item.deviceCode),
			siteName: encodeURIComponent(item.siteName),
			monitorValueText: encodeURIComponent(item.monitorValueText),
			unit: encodeURIComponent(item.unit),
			statusText: encodeURIComponent(item.statusText),
			monitorDt: encodeURIComponent(item.monitorDt),
			siteCode: encodeURIComponent(item.siteCode || ""),
		},
	});
}
</script>

<style scoped lang="scss">
.safety-page {
	margin: -8rpx 20rpx 0;
	padding: 20rpx;
	background: linear-gradient(180deg, #f6f8fc 0%, #ffffff 100%);
	border-radius: 21rpx;
	border: 2rpx solid #ffffff;
	min-height: calc(100vh - 340rpx);
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12rpx;
	padding: 0;
	margin-bottom: 16rpx;
}

.stats-card {
	border-radius: 12rpx;
	padding: 14rpx 12rpx;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.stats-card--online {
	background: #22b573;
}

.stats-card--offline {
	background: #ff6262;
}

.stats-card--warning {
	background: #ff9f43;
}

.stats-num {
	font-size: 40rpx;
	line-height: 1;
	color: #ffffff;
	font-weight: 700;
}

.stats-label {
	font-size: 24rpx;
	line-height: 1.2;
	color: #ffffff;
}

.state-wrap {
	height: 260rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
}

.state-text {
	font-size: 24rpx;
	color: #909399;
}

.sensor-list {
	padding-top: 4rpx;
}

.sensor-card {
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(241, 251, 254, 0.7) 100%);
	box-shadow: 0 2px 8px rgba(75, 120, 250, 0.2);
	border-radius: 20rpx;
	border: 2rpx solid #e8ecf4;
	padding: 20rpx;
	margin-bottom: 16rpx;
}

.sensor-title-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10rpx;
}

.sensor-left {
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

.sensor-name {
	font-size: 30rpx;
	font-weight: 500;
	color: #0f1f3d;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.sensor-right {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.sensor-tag {
	padding: 8rpx 14rpx;
	border-radius: 8rpx;
	font-size: 24rpx;
	line-height: 1;
}

.sensor-value-row {
	margin-top: 10rpx;
	display: flex;
	align-items: baseline;
	gap: 8rpx;
}

.card-meta {
	margin-top: 8rpx;
}

.sensor-value {
	font-size: 46rpx;
	line-height: 1.1;
	font-weight: 700;
	color: #0f1f3d;
}

.sensor-unit {
	font-size: 34rpx;
	line-height: 1;
	font-weight: 700;
	color: #0f1f3d;
}

.meta-item {
	font-size: 24rpx;
	color: #606266;
}
</style>

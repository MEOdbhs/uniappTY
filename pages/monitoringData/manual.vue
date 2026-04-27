<template>
	<cl-page :statusBar="false">
		<view class="manual-page">
			<view v-if="loading" class="state-wrap">
				<cl-loading theme="primary" />
				<text class="state-text">设备数据加载中...</text>
			</view>

			<view v-else-if="filteredDeviceList.length === 0" class="state-wrap">
				<text class="state-text">暂无设备数据</text>
			</view>

			<view v-else class="device-list">
				<view
					v-for="item in filteredDeviceList"
					:key="String(item.id)"
					class="device-card"
					@tap="goRecordPage(item)"
				>
					<view class="card-head">
						<text class="device-name">{{ item.deviceName || "-" }}</text>
						<text class="device-status" :class="statusClass(item)">{{
							statusText(item)
						}}</text>
					</view>
					<view class="card-value-row">
						<text class="value-num">{{ valueText(item.monitorValue) }}</text>
						<text class="value-unit">{{ item.unit || "" }}</text>
					</view>
					<view class="card-meta">
						<text class="meta-item">工地：{{ item.siteName || "-" }}</text>
					</view>
					<view class="card-meta">
						<text class="meta-item"
							>更新时间：{{ formatDateTime(item.monitorDt) }}</text
						>
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
import { getManualDeviceList, type ManualDeviceItem } from "./api";

const props = withDefaults(
	defineProps<{
		names?: string;
	}>(),
	{
		names: "",
	},
);

const { router } = useCool();
const loading = ref(false);
const deviceList = ref<ManualDeviceItem[]>([]);
const filteredKeyword = ref("");

const FILTER_DEBOUNCE_MS = 300;
const MANUAL_LIST_SIZE = 1000;
let filterDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 搜索关键字防抖：
 * - 参考视频监控 tab：输入不触发接口，只在前端过滤；
 * - 防抖可减少频繁计算，保证列表滑动和点击更稳定。
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
 * - 监测设备名称 + 工地名称；
 * - 与视频监控 tab 的前端过滤策略保持一致。
 */
const filteredDeviceList = computed(() => {
	const keyword = filteredKeyword.value;
	if (!keyword) return deviceList.value;
	return deviceList.value.filter((item) => {
		const deviceName = String(item.deviceName || "").toLowerCase();
		const siteName = String(item.siteName || "").toLowerCase();
		return deviceName.includes(keyword) || siteName.includes(keyword);
	});
});

/**
 * 拉取较大列表做前端过滤：
 * - 参考视频监控 tab，实现“输入时不打接口，只做本地过滤”；
 * - size 提升到 1000，减少因分页过小导致前端过滤结果不全。
 */
async function loadDeviceList() {
	loading.value = true;
	try {
		const res = await getManualDeviceList({
			deviceType: 1,
			page: 1,
			size: MANUAL_LIST_SIZE,
		});
		const raw = res && typeof res === "object" && "data" in res ? res.data : res;
		const list = Array.isArray(raw)
			? raw
			: Array.isArray(raw?.records)
				? raw.records
				: Array.isArray(raw?.list)
					? raw.list
					: [];
		deviceList.value = list;
	} catch {
		deviceList.value = [];
		uni.showToast({ title: "人工监测设备加载失败", icon: "none" });
	} finally {
		loading.value = false;
	}
}

onShow(() => {
	loadDeviceList();
});

/**
 * 点击设备进入“人工数据详情页”：
 * - 详情页负责表格分页与刷新，当前页面只承担设备选择；
 * - 这样可避免一个页面承担两类重交互导致状态复杂度过高。
 */
function goRecordPage(item: ManualDeviceItem) {
	router.push({
		path: "/pages/monitoringData/components/manualRecords",
		query: {
			id: String(item.id ?? ""),
			name: String(item.deviceName ?? ""),
		},
	});
}

function formatDateTime(value?: string) {
	if (!value) return "-";
	return String(value).replace("T", " ");
}

function valueText(value: unknown) {
	if (value === null || value === undefined || value === "") return "-";
	return String(value);
}

function statusText(item: ManualDeviceItem) {
	const text = String(item.alarmStatus || "").trim();
	if (!text) return "正常";
	return text;
}

function statusClass(item: ManualDeviceItem) {
	const text = String(item.alarmStatus || "").trim();
	const color = String(item.alarmColor || "").trim();
	if (text.includes("超") || color.includes("红")) return "status-red";
	if (text.includes("预警") || color.includes("橙")) return "status-orange";
	if (text.includes("注意") || color.includes("黄")) return "status-yellow";
	return "status-green";
}
</script>

<style scoped lang="scss">
.manual-page {
	margin: -8rpx 20rpx 0;
	padding: 20rpx;
	background: linear-gradient(180deg, #f6f8fc 0%, #ffffff 100%);
	border-radius: 21rpx;
	border: 2rpx solid #ffffff;
	min-height: calc(100vh - 340rpx);
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

.device-list {
	padding-top: 4rpx;
}

.device-card {
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(241, 251, 254, 0.7) 100%);
	box-shadow: 0 2px 8px rgba(75, 120, 250, 0.2);
	border-radius: 20rpx;
	border: 2rpx solid #e8ecf4;
	padding: 20rpx;
	margin-bottom: 16rpx;
}

.card-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
}

.device-name {
	flex: 1;
	min-width: 0;
	font-size: 30rpx;
	font-weight: 700;
	color: #303133;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.device-status {
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	font-size: 22rpx;
	font-weight: 600;
}

.status-green {
	background: #ecfdf3;
	color: #0fbf71;
}

.status-yellow {
	background: #fff7e6;
	color: #e6a23c;
}

.status-orange {
	background: #fff1eb;
	color: #f59e0b;
}

.status-red {
	background: #fdecec;
	color: #ef4444;
}

.card-value-row {
	margin-top: 10rpx;
	display: flex;
	align-items: baseline;
	gap: 8rpx;
}

.value-num {
	font-size: 46rpx;
	font-weight: 700;
	color: #4474ff;
}

.value-unit {
	font-size: 24rpx;
	color: #909399;
}

.card-meta {
	margin-top: 8rpx;
}

.meta-item {
	font-size: 24rpx;
	color: #606266;
}
</style>

<template>
	<cl-page>
		<view class="records-page">
			<view class="records-header">
				<view class="header-top">
					<text class="header-title">{{ deviceName || "人工数据详情" }}</text>
				</view>
			</view>

			<view class="table-wrap">
				<view class="table-head">
					<text>设备名称</text>
					<text>监测时间</text>
					<text>监测值</text>
					<text>监测人</text>
					<text>备注</text>
				</view>

				<cl-scroller class="table-scroller" ref="scrollerRef" @down="handleRefresh" @up="handleLoadMore">
					<view v-if="loading && records.length === 0" class="state-wrap">
						<cl-loading theme="primary" />
						<text class="state-text">人工数据加载中...</text>
					</view>

					<view v-else-if="records.length === 0" class="state-wrap">
						<text class="state-text">暂无人工数据</text>
					</view>

					<view v-else class="table-body">
						<view v-for="(item, index) in records" :key="String(item.id || index)" class="table-row">
							<text>{{ item.deviceName || "-" }}</text>
							<text>{{ formatDateTime(item.monitorDt) }}</text>
							<text>{{ valueText(item.monitorValue) }}</text>
							<text>{{ item.checkUser || "-" }}</text>
							<text>{{ item.remark || "-" }}</text>
						</view>
					</view>
				</cl-scroller>
			</view>
		</view>
	</cl-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getManualDataPage, parsePageResult, type ManualRecordItem } from "../api";

const scrollerRef = ref<any>(null);
const loading = ref(false);
const records = ref<ManualRecordItem[]>([]);
const total = ref(0);

const pageNum = ref(1);
const pageSize = ref(15);

const deviceId = ref("");
const deviceName = ref("");

onLoad((options) => {
	deviceId.value = String(options?.id || "");
	deviceName.value = decodeURIComponent(String(options?.name || ""));
	loadRecords(true);
});

async function loadRecords(reset = false) {
	if (loading.value) return;

	if (reset) {
		pageNum.value = 1;
		total.value = 0;
		records.value = [];
	}

	loading.value = true;
	try {
		const res = await getManualDataPage({
			page: pageNum.value,
			size: pageSize.value,
			id: deviceId.value || undefined,
		});
		const page = parsePageResult<ManualRecordItem>(res);
		total.value = Number(page.total || 0);
		if (pageNum.value === 1) {
			records.value = page.records;
		} else {
			records.value = [...records.value, ...page.records];
		}
	} catch {
		if (pageNum.value === 1) {
			records.value = [];
		}
		uni.showToast({ title: "人工数据加载失败", icon: "none" });
	} finally {
		loading.value = false;
	}
}

async function handleRefresh(end?: () => void) {
	await loadRecords(true);
	if (typeof end === "function") end();
}

async function handleLoadMore(end?: () => void) {
	if (loading.value) {
		if (typeof end === "function") end();
		return;
	}
	if (total.value > 0 && records.value.length >= total.value) {
		if (typeof end === "function") end();
		return;
	}
	pageNum.value += 1;
	await loadRecords(false);
	if (typeof end === "function") end();
}

function formatDateTime(value?: string) {
	if (!value) return "-";
	return String(value).replace("T", " ");
}

function valueText(value: unknown) {
	if (value === null || value === undefined || value === "") return "-";
	return String(value);
}
</script>

<style scoped lang="scss">
.records-page {
	margin: 16rpx 20rpx 0;
	padding: 20rpx;
	background: linear-gradient(180deg, #f6f8fc 0%, #ffffff 100%);
	border-radius: 21rpx;
	border: 2rpx solid #ffffff;
	min-height: calc(100vh - 220rpx);
}

.records-header {
	margin-bottom: 16rpx;
}

.header-top {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.header-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #303133;
}

.table-wrap {
	border: 2rpx solid #e8ecf4;
	border-radius: 18rpx;
	overflow: hidden;
	background: #ffffff;
}

.table-head,
.table-row {
	display: grid;
	grid-template-columns: 1.3fr 1.6fr 1fr 1fr 1.4fr;
	column-gap: 8rpx;
	padding: 0 16rpx;
	align-items: center;
}

.table-head {
	height: 74rpx;
	font-size: 22rpx;
	font-weight: 600;
	color: #606266;
	background: #f5f7fb;
}

.table-scroller {
	height: calc(100vh - 430rpx);
}

.table-body {
	padding-bottom: 16rpx;
}

.table-row {
	min-height: 74rpx;
	font-size: 23rpx;
	color: #303133;
	border-top: 1rpx solid #edf0f6;
}

.state-wrap {
	height: 220rpx;
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
</style>

<template>
	<cl-page>
		<view class="archive-page">
			<view class="page-header" :style="{ paddingTop: `${statusBarHeight}px` }">
				<view class="header-bar">
					<view class="header-left" @tap="goBack">
						<uni-icons type="left" size="22" color="#909399" />
					</view>
					<text class="header-title">设备档案</text>
					<view class="header-right" />
				</view>
				<view class="search-row">
					<uni-icons type="search" size="16" color="#9ca3af" />
					<input
						v-model.trim="keyword"
						class="search-input"
						placeholder="设备名称"
						placeholder-class="search-placeholder"
						confirm-type="search"
						@confirm="handleSearch"
					/>
					<text class="search-btn" @tap="handleSearch">搜索</text>
				</view>
			</view>

			<scroll-view
				class="list-scroll"
				scroll-y
				:refresher-enabled="true"
				:refresher-triggered="refreshing"
				@refresherrefresh="handleRefresh"
				@scrolltolower="handleLoadMore"
			>
				<view v-if="loading && list.length === 0" class="state-wrap">
					<cl-loading theme="primary" />
					<text class="state-text">设备档案加载中...</text>
				</view>

				<view v-else-if="list.length === 0" class="state-wrap">
					<text class="state-text">暂无设备档案</text>
				</view>

				<view v-else class="list-body">
					<view v-for="item in list" :key="String(item.id)" class="archive-card">
						<view class="card-head">
							<text class="device-name">{{ item.deviceName || "-" }}</text>
							<text class="device-code">{{ item.deviceCode || "-" }}</text>
						</view>
						<view class="card-meta">
							<text class="meta-item">工地：{{ item.siteName || "-" }}</text>
						</view>
						<view class="card-meta">
							<text class="meta-item">型号：{{ item.model || "-" }}</text>
						</view>
					</view>

					<view v-if="finished" class="load-more-tip">没有更多数据了</view>
				</view>
			</scroll-view>
		</view>
	</cl-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useCool } from "/@/cool";
import { getDeviceArchiveListPage, parsePageResult, type DeviceArchiveItem } from "../api";

const { router } = useCool();

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
const keyword = ref("");

const page = ref(1);
const size = 10;
const list = ref<DeviceArchiveItem[]>([]);
const total = ref(0);
const loading = ref(false);
const refreshing = ref(false);

const finished = computed(() => {
	if (!total.value) return false;
	return list.value.length >= total.value;
});

function goBack() {
	router.back();
}

function buildParams(nextPage: number) {
	const params: Record<string, any> = {
		page: nextPage,
		size,
	};
	const name = keyword.value.trim();
	if (name) params.deviceName = name;
	return params;
}

async function loadList(options?: { reset?: boolean }) {
	if (loading.value) return;
	const reset = Boolean(options?.reset);
	if (reset) {
		page.value = 1;
		total.value = 0;
		list.value = [];
	}

	loading.value = true;
	try {
		const res = await getDeviceArchiveListPage(buildParams(page.value));
		const pageData = parsePageResult<DeviceArchiveItem>(res);
		total.value = pageData.total || 0;
		list.value = reset ? pageData.records : list.value.concat(pageData.records);
	} catch {
		if (reset) {
			list.value = [];
			total.value = 0;
		}
		uni.showToast({ title: "设备档案加载失败", icon: "none" });
	} finally {
		loading.value = false;
		if (refreshing.value) {
			refreshing.value = false;
		}
	}
}

function handleSearch() {
	loadList({ reset: true });
}

function handleRefresh() {
	refreshing.value = true;
	loadList({ reset: true });
}

function handleLoadMore() {
	if (loading.value) return;
	if (finished.value) return;
	page.value += 1;
	loadList();
}

onShow(() => {
	loadList({ reset: true });
});
</script>

<style scoped lang="scss">
.archive-page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f6f8fc;
}

.page-header {
	background: #ffffff;
	padding: 0 16rpx 14rpx;
	border-bottom: 1rpx solid #eef0f6;
}

.header-bar {
	height: 92rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
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

.header-right {
	width: 62rpx;
	height: 62rpx;
}

.search-row {
	height: 72rpx;
	display: flex;
	align-items: center;
	gap: 14rpx;
	padding: 0 20rpx;
	background: #ffffff;
	border-radius: 94rpx;
	box-shadow: 0 4rpx 10rpx rgba(198, 215, 255, 0.3);
	border: 2rpx solid #c6d7ff;
}

.search-input {
	flex: 1;
	height: 100%;
	font-size: 27rpx;
	color: #374151;
}

.search-placeholder {
	color: #c0c4cc;
	font-size: 27rpx;
}

.search-btn {
	font-size: 26rpx;
	color: #4474ff;
	font-weight: 600;
}

.list-scroll {
	flex: 1;
	min-height: 0;
	padding: 16rpx 20rpx 24rpx;
	box-sizing: border-box;
}

.state-wrap {
	height: 280rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 14rpx;
}

.state-text {
	font-size: 24rpx;
	color: #909399;
}

.archive-card {
	background: #ffffff;
	border: 2rpx solid #e8ecf4;
	border-radius: 18rpx;
	padding: 20rpx;
	box-shadow: 0 2px 8px rgba(75, 120, 250, 0.2);
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

.device-code {
	flex-shrink: 0;
	font-size: 24rpx;
	font-weight: 600;
	color: #4474ff;
}

.card-meta {
	margin-top: 8rpx;
}

.meta-item {
	font-size: 24rpx;
	color: #606266;
}

.load-more-tip {
	padding: 20rpx 0 6rpx;
	text-align: center;
	font-size: 22rpx;
	color: #9ca3af;
}
</style>

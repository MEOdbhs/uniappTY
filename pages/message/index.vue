<template>
	<cl-page statusBarBackground="#4474FF">
		<cl-sticky>
			<view class="sticky-header">
				<cl-topbar title="消息通知" background-color="#4474ff" color="#ffffff" :border="false" :show-back="false">
					<template #prepend>
						<view class="back-btn" @tap="goBack">
							<cl-icon name="arrow-left" color="#ffffff" :size="40" />
						</view>
					</template>
				</cl-topbar>

				<view class="tabs-container">
					<view class="msg-tabs">
						<view v-for="tab in tabList" :key="tab.value"
							:class="['msg-tab-item', { active: activeTab === tab.value }]"
							@tap="onMsgTabClick(tab.value)">
							{{ tab.label }}
						</view>
					</view>
				</view>
			</view>
		</cl-sticky>

		<view class="message-list-container">
			<cl-scroller @down="handleRefresh" ref="scrollerRef" @up="handleLoadMore">
				<view class="message-card-list" v-if="list.length > 0">
					<view class="message-card" v-for="(item, index) in list" :key="item.id || index" @tap="handleItemClick(item)">
						<view class="message-card__top">
							<view class="type-icon-wrap" :class="getTypeIconKind(item.typeText)">
								<!-- <cl-icon name="msg" :size="28" :color="getTypeIconColor(item.typeText)" /> -->
                                <image :src="getTypeIconImg(item.typeText)" class="type-icon" />
							</view>
							<view class="type-label">{{ getTypeLineLabel(item.typeText) }}</view>
							<view class="message-time">{{ formatListTime(item.sendTime) }}</view>
						</view>
						<view class="message-card__body">
							<view class="message-card__title-row">
								<view class="message-title">{{
									truncateText(item.title || "XXX", 18)
								}}</view>
								<view v-if="!isRead(item.readFlag)" class="unread-tag">未读</view>
							</view>
							<view class="message-desc">{{
								truncateText(item.content || "XXXXXXXXXXXX", 28)
							}}</view>
						</view>
						<view class="message-card__footer">
							<text class="detail-text">查看详情</text>
							<text class="detail-chevron">›</text>
						</view>
					</view>
				</view>
				<view v-else class="empty-container">
					<cl-text class="empty-text">暂无数据</cl-text>
				</view>
			</cl-scroller>
		</view>
	</cl-page>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useCool, useStore } from "/@/cool";

import { getMessageList, updateReadFlag } from "./api";
import { onShow } from "@dcloudio/uni-app";
const { user } = useStore();
const { router } = useCool();

// Tab列表
const activeTab = ref("all");
const tabList = ref([
	{
		label: "全部",
		value: "all",
		badge: 0,
	},
	{
		label: "未读",
		value: "unread",
		badge: 0,
	},
	{
		label: "已读",
		value: "read",
		badge: 0,
	},
]);

// 消息列表
const list = ref<any[]>([]);
const pagination = ref({
	pageNum: 1,
	pageSize: 10,
});
const loading = ref(false);
const finished = ref(false);
const scrollerRef = ref(null);
const unreadCountLoading = ref(false); // 未读数量加载中标志

// 返回上一页
function goBack() {
	uni.navigateBack();
}

// 判断消息是否已读（兼容数字和布尔值）
function isRead(readFlag: any): boolean {
	if (readFlag === true || readFlag === 1) {
		return true;
	}
	return false;
}

// Tab切换
function onTabChange() {
	pagination.value.pageNum = 1;
	list.value = [];
	finished.value = false;
	fetchList();
}

function onMsgTabClick(value: string) {
	if (activeTab.value === value) return;
	activeTab.value = value;
	onTabChange();
}

// 获取消息列表
async function fetchList() {
	if (loading.value || finished.value) return;

	loading.value = true;
	try {
		const userInfo = user?.info;
		const params: any = {
			pageNum: pagination.value.pageNum,
			pageSize: pagination.value.pageSize,
			userId: userInfo?.userId || "",
		};

		// 根据tab筛选
		if (activeTab.value === "unread") {
			params.readFlag = 0;
		} else if (activeTab.value === "read") {
			params.readFlag = 1;
		}
		// all时不传readFlag，获取全部

		const res = await getMessageList(params);

		if (res && res.rows) {
			if (pagination.value.pageNum === 1) {
				list.value = res.rows;
			} else {
				list.value = list.value.concat(res.rows);
			}

			// 判断是否还有更多
			if (res.rows.length < pagination.value.pageSize) {
				finished.value = true;
			} else {
				pagination.value.pageNum += 1;
			}
		} else {
			finished.value = true;
		}
	} catch (error) {
		console.error("获取消息列表失败:", error);
		uni.showToast({
			title: "加载失败",
			icon: "none",
		});
	} finally {
		loading.value = false;
	}
}

// 更新未读数量
async function updateUnreadCount() {
	// 如果正在加载中，跳过
	if (unreadCountLoading.value) {
		return;
	}

	unreadCountLoading.value = true;
	try {
		const res = await getMessageList({
			pageSize: 500,
		});
		if (res && res.rows) {
			const unreadCount = res.rows.filter((item: any) => !isRead(item.readFlag)).length;
			tabList.value[1].badge = unreadCount;
			tabList.value[0].badge = unreadCount;
		}
	} catch (error) {
		console.error("更新未读数量失败:", error);
	} finally {
		unreadCountLoading.value = false;
	}
}

// 刷新
function handleRefresh(end?: () => void) {
	pagination.value.pageNum = 1;
	list.value = [];
	finished.value = false;
	fetchList().finally(() => {
		if (end) end();
	});
}

// 加载更多
function handleLoadMore() {
	if (finished.value || loading.value) return;
	fetchList();
}

// 点击消息项
async function handleItemClick(item: any) {
	// 如果是未读消息，标记为已读
	if (!isRead(item.readFlag)) {
		try {
			await updateReadFlag({ anntId: item.id });
			item.readFlag = 1;
			// 更新列表中的状态
			const index = list.value.findIndex((msg: any) => msg.id === item.id);
			if (index !== -1) {
				list.value[index].readFlag = 1;
			}
			// 更新未读数量
			updateUnreadCount();
		} catch (error) {
			console.error("标记已读失败:", error);
		}
	}

	// 跳转到详情页
	router.push({
		path: "/pages/message/detail",
		query: {
			id: item.id,
		},
	});
}

// 截取文本
function truncateText(text: string, maxLength: number): string {
	if (!text) return "";
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + "...";
}

// 获取类型文本
function getTypeText(typeText: string) {
	if (!typeText) return "通知";
	// 根据类型返回对应的标签文本
	const typeMap: Record<string, string> = {
		任务: "任务",
		新品技术: "新品技术",
		运维风采: "运维风采",
		行业政策: "行业政策",
		通知: "通知",
		提醒: "提醒",
	};
	return typeMap[typeText] || typeText || "通知";
}

function getTypeLineLabel(typeText: string) {
	const t = getTypeText(typeText);
	if (t.includes("任务")) return "任务消息";
	return `${t}消息`;
}

function getTypeIconKind(typeText: string) {
	const t = getTypeText(typeText);
	return t.includes("任务") ? "is-task" : "is-notice";
}

function getTypeIconImg(typeText: string) {
	return getTypeIconKind(typeText) === "is-task" ? '/static/icon/message/task.png' : '/static/icon/message/message.png';
}

function formatListTime(time: string) {
	if (!time) return "";
	const d = new Date(time);
	if (Number.isNaN(d.getTime())) return "";
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	const h = String(d.getHours()).padStart(2, "0");
	const min = String(d.getMinutes()).padStart(2, "0");
	const s = String(d.getSeconds()).padStart(2, "0");
	return `${y}-${m}-${day} ${h}:${min}:${s}`;
}

onMounted(() => {
	fetchList();
	updateUnreadCount();
});

onShow(() => {
	// 页面显示时刷新未读数量和列表（从详情页返回时可能需要更新已读状态）
	updateUnreadCount();
	// 刷新当前列表，确保已读状态同步
	if (list.value.length > 0) {
		handleRefresh();
	}
});
</script>

<style lang="scss" scoped>
.sticky-header {
	background-color: #fff;
	position: sticky;
	top: 0;
	z-index: 20;
}

.tabs-container {
	background-color: #fff;
	height: 84rpx;
}

.msg-tabs {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.msg-tab-item {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 150rpx;
	height: 100%;
	font-size: 28rpx;
	font-weight: 600;
	color: #949dad;
	position: relative;

	&:nth-child(2) {
		margin: 0 80rpx;
	}

	&.active {
		color: #13144f;
		font-weight: 700;

		&::after {
			content: "";
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 60%;
			height: 8rpx;
			background-color: #4474ff;
			border-radius: 15rpx;
		}
	}
}

.message-list-container {
	background-color: #EFF3FD;
	height: calc(100vh - 200rpx);
	box-sizing: border-box;
}

:deep(.cl-list) {
	margin-bottom: 0;
}

:deep(.cl-list-item) {
	padding: 0;
	margin-bottom: 0;
	background-color: transparent;
	border-radius: 0;
}

:deep(.cl-list-item__content) {
	flex: 1;
	min-width: 0;
	width: 100%;
	padding: 0 !important;
}

:deep(.cl-list-item__append) {
	display: none !important;
	width: 0 !important;
	min-height: 0 !important;
	padding: 0 !important;
}

:deep(.cl-list-item__container) {
	background-color: transparent;
	padding: 0 !important;
	box-shadow: none;
	border-radius: 0;
	width: 100%;
	box-sizing: border-box;
}

.message-card-list {
	padding-top: 20rpx;
}

.message-card {
	display: flex;
	flex-direction: column;
	width: 667rpx;
	height: 250rpx;
	margin: 0 auto 20rpx;
	background: linear-gradient( 180deg, rgba(255,255,255,0.7) 0%, rgba(241,251,254,0.7) 100%);
	box-shadow: 0rpx 2rpx 8rpx 0rpx rgba(75,120,250,0.2);
	border-radius: 21rpx;
	box-sizing: border-box;
}

.message-card__top {
	padding: 10rpx 30rpx 10rpx 18rpx;
	display: flex;
	align-items: center;
}

.type-icon-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12rpx;

    .type-icon {
        width: 32rpx;
        height: 32rpx;
    }
}

.type-label {
	font-size: 22rpx;
	color: #13144F;
	line-height: 22rpx;
}

.message-time {
	font-size: 22rpx;
	color: #949DAD;
	margin-left: auto;
}

.message-card__body {
	position: relative;
	padding-left: 24rpx;
	box-sizing: border-box;
}

.message-card__title-row {
	display: flex;
	justify-content: space-between;
}

.message-title {
	flex-grow: 1;
	margin-bottom: 8rpx;
	font-size: 25rpx;
	color: #13144F;
	font-weight: 700;
	line-height: 35rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2; /* 限制行数 */
	-webkit-box-orient: vertical;
}

.unread-tag {
	width: 82rpx;
	height: 33rpx;
	min-width: 82rpx;
	margin-left: 16rpx;
	background: #FB5C7B;
	border-radius: 17rpx 0rpx 0rpx 17rpx;
	font-size: 21rpx;
	color: #FFFFFF;
	line-height: 29rpx;
	text-align: center;
}

.message-desc {
	padding-right: 30rpx;
	font-size: 20rpx;
	color: #949DAD;
	line-height: 35rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.message-card__footer {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-top: auto;
	padding: 0 16rpx 0 24rpx;
	height: 50rpx;
	background-color: #f5f8ff;
	border-top: 1rpx solid #ebeef5;
}

.detail-text {
	font-size: 22rpx;
	color: #13144F;
}

.detail-chevron {
	font-size: 36rpx;
	color: #8cb4ff;
	line-height: 1;
	font-weight: 300;
}

.empty-container {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
}

.back-btn {
	padding: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>

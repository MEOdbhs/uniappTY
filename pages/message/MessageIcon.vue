<template>
	<view class="message-icon-wrapper">
		<view
			v-if="showBanner && bannerMessage"
			class="message-banner"
			:class="{ 'banner-show': bannerVisible }"
			@tap="goToMessage"
		>
			<view class="banner-left">
				<view class="banner-title">
					<view class="badge"></view>
					<text class="banner-text">有新消息提醒</text>
				</view>
				<view class="banner-desc">
					<view class="type-tag">
						{{ bannerMessage.typeText || "通知" }}
					</view>
					<text class="desc-text">
						{{ bannerMessage.title || "点击查看详情" }}
					</text>
				</view>
			</view>
			<view class="banner-actions">
				<text class="close" @tap.stop="closeBanner">×</text>
			</view>
		</view>

		<view class="icon-box" @tap="goToMessage">
			<view class="icon">
				<image src="/static/icon/home/message-bubble.png" class="icon-image" />
			</view>
			<view class="message-count" v-if="unreadNumber > 0">
                <image src="/static/icon/home/message-top-bubble.png" class="icon-image" />
            </view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { useCool, useStore } from "/@/cool";
import { getMessageList } from "./api";

const { router } = useCool();
const { user } = useStore();

const unreadNumber = ref(0); // 未读消息数量
const bannerMessage = ref<any>(null); // 最新未读消息
const showBanner = ref(false); // 是否展示顶部横幅
const bannerVisible = ref(false); // 控制动画显示状态
let autoCloseTimer: any = null; // 自动关闭计时

// 获取未读消息数量
async function updateUnreadCount() {
	try {
		const res = await getMessageList({
			pageSize: 500,
		});
		if (res && res.rows) {
			const unreadList = res.rows.filter((item: any) => {
				const readFlag = item.readFlag;
				return readFlag === 0 || readFlag === false || readFlag != 1;
			});
			unreadNumber.value = unreadList.length;

			if (unreadList.length > 0) {
				// 仅在当前登录会话且还未在首页展示过消息横幅时，弹出最新一条未读
				// 注意：后续 updateUnreadCount() 可能会再次触发（例如 onShow），这里不要把横幅强制关掉，
				// 否则会出现"计时器未到但横幅立刻消失"，看起来像 startAutoClose 不生效。
				if (!user.hasShownHomeMessageBanner && !showBanner.value) {
					bannerMessage.value = unreadList[0] || null;
					showBanner.value = true;
					// 使用 setTimeout 确保 DOM 更新后再添加动画类
					setTimeout(() => {
						bannerVisible.value = true;
					}, 50);
					// 标记本次登录已经展示过首页横幅
					user.markHomeMessageBannerShown();
					startAutoClose();
				}
			} else {
				// 没有未读时关闭横幅并清理计时器
				if (showBanner.value) {
					closeBanner();
				}
				bannerMessage.value = null;
			}
		}
	} catch (error) {
		console.error("获取未读消息数量失败:", error);
	}
}

// 跳转到消息列表
function goToMessage() {
	router.push({
		path: "/pages/message/index",
	});
}

// 关闭顶部提示
function closeBanner() {
	bannerVisible.value = false;
	clearTimer();
	// 等待动画结束后再移除 DOM
	setTimeout(() => {
		showBanner.value = false;
	}, 300);
}

// 开始自动关闭
function startAutoClose() {
	clearTimer();
	autoCloseTimer = setTimeout(() => {
		closeBanner();
	}, 6000);
}

// 清理计时器
function clearTimer() {
	if (autoCloseTimer) {
		clearTimeout(autoCloseTimer);
		autoCloseTimer = null;
	}
}

onMounted(() => {
	updateUnreadCount();
});

onShow(() => {
	// 页面显示时更新未读数量
	updateUnreadCount();
});
</script>

<style lang="scss" scoped>
$gap: 24rpx;

.page-container {
	padding: $gap;
}

.message-icon-wrapper {
	width: 100%;
	// padding: $gap;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 30;
	pointer-events: none;
	position: relative;
}

.message-banner {
	width: 90%;
	background: linear-gradient(135deg, #1f2b6c, #4c7dff);
	color: #fff;
	border-radius: 24rpx;
	padding: 0.5rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 12rpx 36rpx rgba(76, 125, 255, 0.22);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 2;
	pointer-events: auto;
	margin-top: 2rem;
	margin-left: 2rem;
}

.banner-left {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
	flex: 1;
	min-width: 0;
}

.banner-title {
	display: flex;
	align-items: center;
	gap: 12rpx;
	font-size: 30rpx;
	font-weight: 600;
	color: #fff;
	overflow: hidden;
}

.banner-text {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.badge {
	width: 14rpx;
	height: 14rpx;
	border-radius: 50%;
	background: #ff6b6b;
	box-shadow: 0 0 10rpx rgba(255, 107, 107, 0.6);
}

.banner-desc {
	display: flex;
	align-items: center;
	gap: 12rpx;
	font-size: 26rpx;
	color: #eee;
	overflow: hidden;
}

.type-tag {
	background: rgba(255, 255, 255, 0.16);
	padding: 6rpx 14rpx;
	border-radius: 24rpx;
	font-size: 24rpx;
	color: #fff;
	white-space: nowrap;
	backdrop-filter: blur(2px);
}

.desc-text {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.banner-actions {
	display: flex;
	align-items: center;
	gap: 16rpx;
	color: #fff;
	font-size: 32rpx;
	margin-left: 20rpx;
	z-index: 99;
}

.banner-actions .close {
	font-size: 36rpx;
	padding: 8rpx 16rpx;
	margin-right: 2.5rem;
	line-height: 1;
	min-width: 60rpx;
	text-align: center;
}

.icon-box {
	position: absolute;
	display: inline-flex;
	align-items: center;
	z-index: 1;
	right: 2rem;
	top: 22rpx;
    right: 22rpx;
	pointer-events: auto;

    .icon-image {
        width: 100%;
        height: 100%;
    }
}

.icon {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 52rpx;
	width: 52rpx;
	background-color: rgba(150, 150, 150, 0.1);
	border-radius: 16rpx;
	font-size: 32rpx;
}

.message-banner {
	opacity: 0;
	transform: translateX(100%);
	transition: all 0.3s ease;
}

.message-banner.banner-show {
	opacity: 1;
	transform: translateX(0);
}

.message-count {
	position: absolute;
	top: -8rpx;
	right: -6rpx;
	z-index: 1;
    width: 25rpx;
    height: 25rpx;
}
</style>

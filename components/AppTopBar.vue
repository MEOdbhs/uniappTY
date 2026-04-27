<template>
	<!--
		全局公共顶部栏：
		- 统一沉淀“头像 + 用户信息 + 中部扩展区 + 通知/设置入口”，避免多个页面重复维护同一套结构；
		- 中部使用具名插槽 middle，保证不同页面可按需扩展。
	-->
	<view class="app-topbar" :style="{ paddingTop: `${statusBarHeight + 10}px` }">
		<view class="app-topbar__content">
			<!-- 左侧：用户信息 -->
			<view class="app-topbar__left">
				<view class="avatar-shell">
					<uni-icons type="person-filled" size="20" color="#ffffff" />
				</view>

				<view class="user-meta">
					<text class="user-name">{{ displayUserName }}</text>
					<view class="user-tags">
						<text class="meta-text">{{ displayDeptName }}</text>
						<text class="meta-split">|</text>
						<text class="meta-text">{{ displayRoleName }}</text>
					</view>
				</view>
			</view>

			<!-- 中部：红框预留插槽 -->
			<view class="app-topbar__middle">
				<slot name="middle"></slot>
			</view>

			<!-- 右侧：通知 + 设置，逻辑在组件内部处理 -->
			<view class="app-topbar__right">
				<view class="icon-btn icon-btn--notice" @tap="handleNoticeTap">
					<uni-icons type="notification" size="20" color="#111827" />
					<view v-if="showNoticeDot" class="notice-dot"></view>
				</view>

				<view class="icon-btn" @tap="handleSettingTap">
					<uni-icons type="gear" size="20" color="#111827" />
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCool, useStore } from "/@/cool";

/**
 * 顶层 props 只保留“可配置项”，并提供合理默认值：
 * - showNoticeDot：决定通知图标是否显示红点；
 * - noticePath/settingPath：给不同业务保留路由覆盖能力，避免把路径硬编码死在组件里无法复用。
 */
const props = withDefaults(
	defineProps<{
		showNoticeDot?: boolean;
		noticePath?: string;
		settingPath?: string;
	}>(),
	{
		showNoticeDot: true,
		noticePath: "/pages/message/index",
		settingPath: "/pages/user/set",
	},
);

const { user } = useStore();
const { router } = useCool();

/**
 * 状态栏适配：
 * - 按系统状态栏高度增加顶部内边距，解决全面屏/异形屏内容顶到状态栏的问题。
 */
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;

/**
 * 用户文案兜底：
 * - ，确保 UI 不会出现空文本。
 */
const displayUserName = computed(() => {
	return user.info?.nickName || user.info?.userName || "未登录用户";
});

const displayDeptName = computed(() => {
	return user.info?.deptName || "部门未设置";
});

const displayRoleName = computed(() => {
	return Array.isArray(user.roles) && user.roles.length ? user.roles[0] : "角色未设置";
});

/**
 * 通知点击逻辑内聚到组件内部：
 * - 这样父页面不再重复写相同跳转，真正实现“全局组件开箱即用”。
 */
function handleNoticeTap() {
	// 兜底判断可避免错误配置路径导致跳转异常，提高组件健壮性。
	if (!props.noticePath) {
		uni.showToast({ title: "未配置通知页路径", icon: "none" });
		return;
	}

	router.push({
		path: props.noticePath,
	});
}

/**
 * 设置点击逻辑同样内聚到组件内部：
 * - 默认跳系统设置页，复用场景下也支持通过 settingPath 覆盖。
 */
function handleSettingTap() {
	if (!props.settingPath) {
		uni.showToast({ title: "未配置设置页路径", icon: "none" });
		return;
	}

	router.push({
		path: props.settingPath,
	});
}
</script>

<style scoped lang="scss">
.app-topbar {
	position: sticky;
	top: 0;
	z-index: 20;
	background: #ffffff;
	padding-left: 20rpx;
	padding-right: 4rpx;
	padding-bottom: 12rpx;
	border-bottom: 1rpx solid #eef2f7;
}

.app-topbar__content {
	height: 104rpx;
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.app-topbar__left {
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.avatar-shell {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #2563eb;
	flex-shrink: 0;
}

.user-meta {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.user-name {
	max-width: 220rpx;
	font-size: 38rpx;
	font-weight: 700;
	color: #111827;
	line-height: 1.2;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.user-tags {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.meta-text {
	font-size: 22rpx;
	font-weight: 400;
	color: #4b5563;
	line-height: 1.2;
	max-width: 150rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.meta-split {
	font-size: 30rpx;
	color: #9ca3af;
	line-height: 1.2;
}

.app-topbar__middle {
	flex: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.app-topbar__right {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.icon-btn {
	position: relative;
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f9fafb;
}

.icon-btn--notice {
	margin-right: 2rpx;
}

.notice-dot {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #ef4444;
}
</style>

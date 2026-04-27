<template>
	<cl-page>
		<view class="tech-library-page">
			<!-- Tab切换按钮（顶部横向） -->
			<view class="top-tabs-container">
				<view v-for="tab in tabsList" :key="tab.value" class="tab-item" @click="onTabChange(tab.value)">
					<view :class="['tab-icon-wrap', { active: activeTab === tab.value }]">
						<image :src="tab.icon" class="tab-icon" mode="aspectFit"></image>
					</view>
					<text :class="['tab-text', { active: activeTab === tab.value }]">{{ tab.label }}</text>
				</view>
			</view>

			<!-- 内容区域 -->
			<view class="content-container">
				<TechSearch v-if="activeTab === 'search'" />
				<TechDocument v-else-if="activeTab === 'document'" />
				<TechForum v-else-if="activeTab === 'forum'" />
				<TechExperience v-else-if="activeTab === 'experience'" />
			</view>
		</view>
	</cl-page>
	<tabbar />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import Tabbar from "@/pages/index/components/tabbar.vue";
import TechSearch from "./components/TechSearch.vue";
import TechDocument from "./components/TechDocument.vue";
import TechForum from "./components/TechForum.vue";
import TechExperience from "./components/TechExperience.vue";

const activeTab = ref("search");

const tabsList = ref([
	{ label: "技术查询", value: "search", icon: "/static/icon/TecLibrary/A.png" },
	{ label: "技术文档", value: "document", icon: "/static/icon/TecLibrary/B.png" },
	{ label: "技术论坛", value: "forum", icon: "/static/icon/TecLibrary/C.png" },
	{ label: "经验文库", value: "experience", icon: "/static/icon/TecLibrary/D.png" },
]);

const onTabChange = (val: string) => {
	activeTab.value = val;
};
</script>

<style lang="scss" scoped>
.tech-library-page {
	height: 95vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	position: relative;
	background-color: #eff3fd;
	background-image: linear-gradient(180deg, #0b1688 0%, #1b2cd2 28%, #4873fa 55%, #eff3fd 100%);
	background-size: 100% 50%;
	background-repeat: no-repeat;
	background-position: top center;
}

.top-tabs-container {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	justify-content: space-between;
	background-color: transparent;
	padding: 30rpx 24rpx 20rpx;
	gap: 16rpx;
	position: sticky;
	top: 0;
	z-index: 100;
}

.tab-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
}

.tab-icon-wrap {
	width: 100rpx;
	height: 100rpx;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(211, 238, 255, 0.2);
	border-radius: 30rpx;
	flex-shrink: 0;
}

.tab-icon-wrap.active {
	background-color: rgba(255, 255, 255, 0.18);
}

.tab-icon {
	width: 60rpx;
	height: 60rpx;
	transition: filter 0.2s ease;
}

/* 未选中：蓝色（与主题蓝接近） */
.tab-icon-wrap:not(.active) .tab-icon {
	filter: brightness(0) saturate(100%) invert(40%) sepia(95%) saturate(1800%) hue-rotate(215deg) brightness(1.05);
}

/* 选中：白色 */
.tab-icon-wrap.active .tab-icon {
	filter: brightness(0) invert(1);
}

.tab-text {
	font-size: 24rpx;
	color: #ffffff;
	font-weight: 500;
	line-height: 1.3;
	text-align: center;
	width: 100%;
}

.tab-text.active {
	font-weight: 700;
}

.content-container {
	flex: 1;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}
</style>

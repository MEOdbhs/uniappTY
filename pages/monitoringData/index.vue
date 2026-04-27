<template>
	<view>
		<!-- 监测数据：顶部切换 + 内容区 -->
		<view class="monitoring-index-page">
			<AppTopBar>
				<template #middle>
					<view
						v-if="activeTab === 'manual'"
						class="dataExport"
						@tap.stop="goManualImportPage"
					>
						人工数据导入
					</view>
				</template>
			</AppTopBar>

			<view class="top-area">
				<view class="top-tabs">
					<view
						v-for="tab in tabList"
						:key="tab.value"
						class="tab-item"
						:class="{ active: activeTab === tab.value }"
						@tap="activeTab = tab.value"
					>
						{{ tab.label }}
					</view>
				</view>

				<!-- 数据看板：保留工地下拉 -->
				<view v-if="activeTab === 'board'" class="top-filter-card" @tap="openMinePicker">
					<uni-icons type="search" size="16" color="#9ca3af" />
					<text class="top-filter-text">{{ selectedMineName || "工地名称" }}</text>
					<uni-icons type="gear" size="18" color="#9ca3af" />
				</view>

				<!-- 其他三个 tab：统一输入框，按 tab 切换 placeholder -->
				<view v-else class="top-filter-input-card">
					<uni-icons type="search" size="16" color="#9ca3af" />
					<input
						v-model.trim="tabSearchTextMap[activeTab]"
						class="top-filter-input"
						:placeholder="placeholderMap[activeTab]"
						placeholder-class="top-filter-input-placeholder"
						confirm-type="search"
					/>
				</view>
			</view>

			<!-- 数据看板：默认进来即展示 -->
			<dataBoard v-if="activeTab === 'board'" :selectedMineId="selectedMineId" />

			<!-- 安全监测：本次仅接通搜索参数与占位 -->
			<safety v-else-if="activeTab === 'safety'" :names="tabSearchTextMap.safety" />

			<!-- 视频监控：本次仅接通搜索参数与占位 -->
			<videoSurveillance v-else-if="activeTab === 'video'" :names="tabSearchTextMap.video" />

			<!-- 人工监测：设备列表与详情跳转的业务主入口 -->
			<manual v-else :names="tabSearchTextMap.manual" />
		</view>

		<!-- 使用项目统一底部菜单 -->
		<tabbar />
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useCool, useStore } from "/@/cool";
import Tabbar from "@/pages/index/components/tabbar.vue";
import dataBoard from "./dataBoard.vue";
import AppTopBar from "@/components/AppTopBar.vue";
import manual from "./manual.vue";
import safety from "./safety.vue";
import videoSurveillance from "./videoSurveillance.vue";

/**
 * Tab 配置集中维护：
 * - 这样做的原因是后续如果新增/改文案，只改这一个数组即可；
 * - 同时避免模板里写 4 份重复节点，降低维护成本。
 */
const tabList = [
	{ label: "数据看板", value: "board" },
	{ label: "安全监测", value: "safety" },
	{ label: "视频监控", value: "video" },
	{ label: "人工监测", value: "manual" },
];

// 默认激活“数据看板”，满足你“默认一进来显示数据看板内容”的要求。
const activeTab = ref<string>("board");

const { project } = useStore();
const { router } = useCool();

/**
 * 三个输入型 tab 的检索值统一集中在父层：
 * - 方便后续新增“跨 tab 保留检索条件”；
 * - 子组件只接收 names，不需要关心输入框状态管理。
 */
const tabSearchTextMap = ref<Record<string, string>>({
	safety: "",
	video: "",
	manual: "",
});

/**
 * 每个 tab 的 placeholder 独立维护，避免模板中多重三元表达式可读性变差。
 */
const placeholderMap: Record<string, string> = {
	safety: "设备名称、工地名称",
	video: "监控名称、工地名称",
	manual: "监测设备、工地名称",
};

// 顶部筛选的数据源统一使用全局项目列表，保证与系统其他页面“工地来源”一致。
const mineOptions = computed(() => (Array.isArray(project.list) ? project.list : []));
const selectedMineId = ref<string>("");

const selectedMineName = computed(() => {
	const target = mineOptions.value.find((item: Record<string, any>) => {
		return String(item.mineId ?? item.id ?? "") === selectedMineId.value;
	});
	return target?.mineName || target?.projectName || "";
});

function openMinePicker() {
	const names = mineOptions.value.map((item: Record<string, any>) =>
		String(item.mineName || item.projectName || "-"),
	);
	if (!names.length) {
		uni.showToast({ title: "暂无可选工地", icon: "none" });
		return;
	}

	uni.showActionSheet({
		itemList: names,
		success: ({ tapIndex }) => {
			const chosen = mineOptions.value[tapIndex] as Record<string, any>;
			selectedMineId.value = String(chosen.mineId ?? chosen.id ?? "");
		},
	});
}

/**
 * 人工数据导入页路由跳转：
 * - 入口放在 AppTopBar middle 槽位，并且仅在 manual tab 出现；
 * - 使用独立页面承载导入表单，避免与列表页状态互相污染。
 */
function goManualImportPage() {
	router.push({
		path: "/pages/monitoringData/components/manualImport",
	});
}
</script>

<style scoped lang="scss">
.dataExport {
	height: 50rpx;
	line-height: 50rpx;
	padding: 0 16rpx;
	font-size: 20rpx;
	font-weight: 600;
	color: #4474ff;
	background: #ffffff;
	border-radius: 28rpx;
	border: 2rpx solid #c6d7ff;
	box-shadow: 0 4rpx 10rpx rgba(198, 215, 255, 0.3);
}
.monitoring-index-page {
	min-height: 100vh;
	background: #f6f8fc;
	padding-bottom: 120rpx;
}

.top-area {
	background: transparent;
	padding: 12rpx 20rpx;
}

.top-tabs {
	display: flex;
	align-items: center;
	background: #ffffff;
	border-radius: 16rpx;
	padding: 8rpx;
	border: 2rpx solid #eef2ff;
}

.tab-item {
	flex: 1;
	height: 70rpx;
	line-height: 70rpx;
	text-align: center;
	font-size: 25rpx;
	font-weight: 600;
	color: #6b7280;
	border-radius: 12rpx;
}

.tab-item.active {
	color: #4474ff;
	font-weight: 600;
	background: rgba(68, 116, 255, 0.12);
}

.top-filter-card,
.top-filter-input-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
	height: 72rpx;
	padding: 0 24rpx;
	background: #ffffff;
	border-radius: 94rpx;
	margin-top: 14rpx;
	box-shadow: 0 4rpx 10rpx rgba(198, 215, 255, 0.3);
	border: 2rpx solid #c6d7ff;
}

.top-filter-text {
	flex: 1;
	font-size: 27rpx;
	color: #6b7280;
}

.top-filter-input {
	flex: 1;
	height: 100%;
	font-size: 27rpx;
	color: #374151;
}

.top-filter-input-placeholder {
	color: #c0c4cc;
	font-size: 27rpx;
}
</style>

<template>
	<view class="tech-experience-page">
		<button class="add-btn" @click="handleAdd">
			<cl-icon class="add-btn-icon" name="plus-border" />
			<text>新增经验</text>
		</button>
		<!-- 筛选栏 -->
		<view class="filter-section">
			<!-- 搜索框 -->
			<view class="search-header">
				<!-- 白色圆角输入框 -->
				<view class="search-box">
					<view class="search-input-wrap">
						<input v-model="queryParams.keyword" class="native-input" placeholder="请输入标题/关键词搜索"
							placeholder-class="native-input-placeholder" confirm-type="search" @input="handleQuery"
							@confirm="handleQuery" />
						<image src="/static/icon/TecLibrary/F.png" class="search-icon" mode="aspectFit"
							@click="handleQuery"></image>
					</view>
				</view>
				<!-- 筛选按钮：在输入框外右侧 -->
				<view class="filter-btn" @tap="toggleFilter">
					<image src="/static/icon/TecLibrary/E.png" class="filter-icon" mode="aspectFit"></image>
					<text class="filter-text">筛选</text>
				</view>
			</view>

			<!-- 处理筛选弹窗 -->
			<cl-popup
				v-model="showFilter"
				background-color="transparent"
				padding="0">
				<view class="filter-content">
					<!-- 顶部标题 -->
					<view class="filter-header">
						<text class="filter-title">全部条件</text>
						<cl-icon class="filter-close" name="close" size="52" color="#C6D7FF"  @tap="toggleFilter"></cl-icon>
					</view>
					<view class="filter-top">
						<scroll-view class="filter-top-scroll" scroll-x>
							<view class="filter-top-scroll-content">
								<view class="filter-top-item" v-for="item in filterOptionsValueList" :key="item.value">
									<view class="filter-top-label">{{item.label}}</view>
									<cl-icon
										v-if="item.parent !== 'documentSource'"
										class="filter-top-icon"
										name="close"
										size="32"
										color="#4474FF"
										@click="deleteFilter(item)"></cl-icon>
								</view>
							</view>
						</scroll-view>
					</view>
					<!-- 主内容区：左侧分类栏 + 右侧选项区 -->
					<view class="filter-main">
						<!-- 左侧分类栏 -->
						<scroll-view class="filter-left" scroll-y>
							<template v-for="item in filterOptions" :key="item.value">
								<view
									v-if="queryParams.documentSource === 'manual' && (item.value === 'faultTaskType' || item.value === 'deviceCategory') ? false: true"
									:class="{'active': item.value === filterActive}"
									@click="handleFilterOptionClick(item)"
									class="filter-left-item">{{ item.label }}</view>
							</template>
						</scroll-view>

						<!-- 右侧选项区 -->
						<scroll-view class="filter-right" scroll-y>
							<view class="filter-options">
								<view
								v-for="item in filterOptionsList"
								:key="item.value"
								:class="{'active': item.value === queryParams[filterActive]}"
								@click="handleFilterClick(item)"
								class="filter-option">{{ item.label }}</view>
							</view>
						</scroll-view>
					</view>
					<view class="filter-buttons">
						<view class="filter-button reset" @click="restParams">重置</view>
						<view class="filter-button confirm" @click="filterConfirm">确定</view>
					</view>
				</view>
			</cl-popup>
		</view>

		<!-- 经验列表 -->
		<view class="experience-list">
			<cl-scroller
				class="scroller"
				@down="handleRefresh"
				ref="scrollerRef"
				@up="handleLoadMore"
			>
				<view v-if="experienceList.length === 0" class="empty-box">
					<text class="empty-text">暂无数据</text>
				</view>
				<view v-else>
					<view
						v-for="(item, index) in experienceList"
						:key="item.id || index"
						class="experience-item"
						@click="handleView(item)"
					>
						<!-- 系统生成 -->
						<template v-if="isSystemApi">
							<view class="item-header">
								<view class="item-title">{{ item.faultDesc }}</view>
								<view class="status-tag status-system">
									{{ item.faultTaskTypeName }}
								</view>
							</view>
							<view class="item-meta">
								<view class="meta-item">
									<view class="meta-item-label">所属子系统：</view>
									<view class="meta-item-value">{{ item.childSysName }}</view>
								</view>
								<view class="meta-item">
									<view class="meta-item-label">设备类型：</view>
									<view class="meta-item-value">{{ item.deviceType }}</view>
								</view>
								<view class="meta-item">
									<view class="meta-item-label">设备类别：</view>
									<view class="meta-item-value">{{ item.deviceCategoryName || '' }}</view>
								</view>
								<view class="meta-item">
									<view class="meta-item-label">设备名称：</view>
									<view class="meta-item-value">{{ item.deviceAttrName }}</view>
								</view>
								<view class="meta-item">
									<view class="meta-item-label">设备编号：</view>
									<view class="meta-item-value">{{ item.deviceCode }}</view>
								</view>
								<view class="meta-item">
									<view class="meta-item-label">安装位置：</view>
									<view class="meta-item-value">{{ item.installLocation }}</view>
								</view>
								<!-- <view class="meta-item">{{ item.deviceCategoryName || '' }}</view>
								<view class="meta-item">{{ item.childSysName }}</view>
								<view class="meta-item">{{ item.deviceType }}</view>
								<view class="meta-item">{{ item.deviceAttrName }}</view> -->
							</view>
							<!-- <view class="item-description">
								{{ item.handleDetail }}
							</view> -->
							<!-- <view
								v-if="item.keywords && item.keywords.length > 0"
								class="item-keywords"
							>
								<text
									v-for="(keyword, idx) in item.keywords"
									:key="idx"
									class="keyword-tag"
								>
									{{ keyword }}
								</text>
							</view> -->
							<view class="item-footer">
								<!-- <text class="footer-text">{{ item.techTypeName }}</text> -->
								<!-- <text class="footer-text">系统生成</text> -->
								<view class="footer-text">
									<cl-icon class="footer-text-icon" color="#4474FF" name="time"></cl-icon>
									<view class="footer-text-desc">创建时间：{{ item.createTime }}</view>
								</view>
								<view class="footer-text">
									<cl-icon class="footer-text-icon" color="#30BB7C" name="time"></cl-icon>
									<view class="footer-text-desc">归档时间：{{ item.confirmDt }}</view>
								</view>
							</view>
						</template>

						<!-- 人工创建 -->
						<template v-else>
							<view class="item-header">
								<view class="item-title">{{ item.question }}</view>
							</view>
							<view class="item-meta">
								<view class="meta-item">
									<view class="meta-item-label">所属子系统：</view>
									<view class="meta-item-value">{{ item.subsystemName }}</view>
								</view>
								<view class="meta-item">
									<view class="meta-item-label">设备类型：</view>
									<view class="meta-item-value">{{ item.deviceTypeName }}</view>
								</view>
								<view class="meta-item">
									<view class="meta-item-label">技术类型：</view>
									<view class="meta-item-value">{{ item.techTypeName || '' }}</view>
								</view>
								<view class="meta-item">
									<view class="meta-item-label">处理过程：</view>
									<view class="meta-item-value">{{ item.process || '' }}</view>
								</view>
							</view>
							<!-- <view class="item-meta">
								<view class="meta-item">{{ item.deviceTypeName }}</view>
								<view class="meta-item">{{ item.subsystemName }}</view>
							</view>
							<view class="item-description">
								{{ item.process }}
							</view>
							<view
								v-if="item.keywords && item.keywords.length > 0"
								class="item-keywords"
							>
								<text
									v-for="(keyword, idx) in item.keywords"
									:key="idx"
									class="keyword-tag"
								>
									{{ keyword }}
								</text>
							</view> -->
							<view class="item-footer">
								<!-- <text class="footer-text">{{ item.techTypeName }}</text>
								<text class="footer-text">人工创建</text>
								<text class="footer-text">更新：{{ item.updateTime1 }}</text> -->
								<view class="footer-text">
									<cl-icon class="footer-text-icon" color="#4474FF" name="time"></cl-icon>
									<view class="footer-text-desc">创建时间：{{ item.createTime1 }}</view>
								</view>
								<view class="footer-text">
									<cl-icon class="footer-text-icon" color="#30BB7C" name="time"></cl-icon>
									<view class="footer-text-desc">更新时间：{{ item.updateTime1 }}</view>
								</view>
							</view>
						</template>
					</view>
				</view>
			</cl-scroller>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useCool } from "/@/cool";
import {
	getExperienceList,
	getExperienceListSystem,
	getTechType,
	getApplicableDevice,
	getSubsystemList,
} from "../api";

const { router } = useCool();

const scrollerRef = ref(null);

const queryParams = ref<{
	pageNum: number;
	pageSize: number;
	keyword: string;
	techTypeId: string;
	faultTaskType: string;
	childSysId: string;
	deviceType: string;
	deviceCategory: string;
	documentSource: string;
	deviceNameOrCode: string;
	[key: string]: any;
}>({
	pageNum: 1,
	pageSize: 12,
	keyword: "",
	techTypeId: "",
	faultTaskType: "",
	childSysId: "",
	deviceType: "",
	deviceCategory: "",
	documentSource: "system",
	deviceNameOrCode: "",
});

const experienceList = ref<any[]>([]);
const total = ref(0);
const showFilter = ref(false);
const loading = ref(false);

// 筛选条件选项
const filterOptions = ref<any[]>([
	{
		label: "技术类型",
		value: "techTypeId",
		options: [],
	},
	{
		label: "设备类别",
		value: "deviceCategory",
		options: [],
	},
	{
		label: "设备类型",
		value: "deviceType",
		options: [
			{ label: "硬件", value: "硬件" },
			{ label: "软件", value: "软件" },
		],
	},
	{
		label: "文档来源",
		value: "documentSource",
		options: [
			{ label: "系统生成", value: "system" },
			{ label: "人工创建", value: "manual" },
		],
	},
	{
		label: "子系统名称",
		value: "childSysId",
		options: [],
	},
	{
		label: "故障任务类型",
		value: "faultTaskType",
		options: [
			{ label: "故障任务", value: 0 },
			{ label: "非故障任务", value: 1 },
		],
	},
]);
const filterActive = ref('techTypeId');
const filterOptionsList = ref<any[]>([]);
const filterOptionsValueList = ref<any[]>([
	{ label: "系统生成", value: "system", parent: "documentSource" },
]);

// 筛选条件选项点击,设置右侧选项
const handleFilterOptionClick = (item: any) => {
	filterActive.value = item.value;
	filterOptionsList.value = item.options;
};

// 筛选条件点击
const handleFilterClick = (item: any) => {
	// 同一父级数据只能存在一个，先删除当前父级的所有选项
	filterOptionsValueList.value = filterOptionsValueList.value.filter((i: any) => i.parent !== filterActive.value);

	// 检查是否已存在相同筛选项
	const existingItem = filterOptionsValueList.value.find((i: { value: any; }) => i.value === item.value);
	if (existingItem) {
		filterOptionsValueList.value = filterOptionsValueList.value.filter((i: { value: any; }) => i.value !== item.value);
		queryParams.value[filterActive.value] = "";
	} else {
		// 如果不存在，添加并设置父级标识
		const newItem = { ...item, parent: filterActive.value };
		filterOptionsValueList.value.push(newItem);
		queryParams.value[filterActive.value] = item.value;
	}

	// 人工创建时，设备类别和故障任务类型不能同时存在
	if (item.value === "manual") {
		filterOptionsValueList.value = filterOptionsValueList.value.filter((i: any) => i.parent !== 'deviceCategory' && i.parent !== 'faultTaskType');
		queryParams.value.deviceCategory = "";
		queryParams.value.faultTaskType = "";
	}

	handleQuery()
};

// 删除筛选项
const deleteFilter = (item: any) => {
	filterOptionsValueList.value = filterOptionsValueList.value.filter((i: any) => i.value !== item.value);
	queryParams.value[item.parent] = "";
	handleQuery()
};

const filterConfirm = () => {
	// handleQuery();
	toggleFilter();
};

const techTypeOptions = ref<any[]>([]);
const subsystemOptions = ref<any[]>([]);
const deviceCategoryOptions = ref<any[]>([]);

const faultTaskTypeOptions = [
	{ label: "故障任务", value: 0 },
	{ label: "非故障任务", value: 1 },
];

const deviceTypeOptions = [
	{ label: "硬件", value: "硬件" },
	{ label: "软件", value: "软件" },
];

const documentSourceOptions = [
	{ label: "系统生成", value: "system" },
	{ label: "人工创建", value: "manual" },
];

// 当前是否使用系统接口
const isSystemApi = computed(() => queryParams.value.documentSource === "system");

// 切换筛选条件显示
const toggleFilter = () => {
	showFilter.value = !showFilter.value;
};
/**
 * 重置
 * @date 2025-12-31
 * @returns {any}
 */
const restParams = () => {
	queryParams.value = {
		pageNum: 1,
		pageSize: 12,
		keyword: "",
		techTypeId: "",
		faultTaskType: "",
		childSysId: "",
		deviceType: "",
		deviceCategory: "",
		documentSource: "system",
		deviceNameOrCode: "",
	};
	// 重置筛选值列表
	filterOptionsValueList.value = [
		{ label: "系统生成", value: "system", parent: "documentSource" }
	];
	handleQuery();
	toggleFilter();
};
// 查询
const handleQuery = () => {
	queryParams.value.pageNum = 1;
	experienceList.value = [];
	total.value = 0;
	fetchList();
};

// 加载更多
const handleLoadMore = () => {
	console.log("-------");

	console.log("触发加载更多", {
		当前列表长度: experienceList.value.length,
		总数: total.value,
		当前页: queryParams.value.pageNum,
		是否正在加载: loading.value,
	});

	// 判断是否已加载全部数据
	if (experienceList.value.length >= total.value && total.value > 0) {
		console.log("已加载全部数据，停止加载");
		return;
	}

	// 如果正在加载，不重复请求
	if (loading.value) {
		console.log("正在加载中，跳过");
		return;
	}

	queryParams.value.pageNum += 1;
	console.log("开始加载第", queryParams.value.pageNum, "页");
	fetchList();
};

// 下拉刷新
const handleRefresh = async (end?: () => void) => {
	queryParams.value.pageNum = 1;
	experienceList.value = [];
	total.value = 0;
	await fetchList();
	// 调用 end 回调结束刷新状态
	if (end) {
		end();
	}
};

// 获取经验列表
const fetchList = async () => {
	if (loading.value) {
		return;
	}

	loading.value = true;

	try {
		const api = isSystemApi.value ? getExperienceListSystem : getExperienceList;

		let params: any = {
			pageNum: queryParams.value.pageNum,
			pageSize: queryParams.value.pageSize,
		};

		if (isSystemApi.value) {
			// 系统生成接口参数
			params = {
				...params,
				keywords: queryParams.value.keyword,
				faultTaskType: queryParams.value.faultTaskType,
				techTypeId: queryParams.value.techTypeId,
				childSysId: queryParams.value.childSysId,
				deviceType: queryParams.value.deviceType,
				deviceCategory: queryParams.value.deviceCategory,
			};
		} else {
			// 人工创建接口参数
			let deviceType = "";
			if (queryParams.value.deviceType === "硬件") {
				deviceType = "2";
			} else if (queryParams.value.deviceType === "软件") {
				deviceType = "1";
			} else {
				deviceType = "";
			}
			params = {
				...params,
				keyword: queryParams.value.keyword,
				techTypeId: queryParams.value.techTypeId,
				subsystemId: queryParams.value.childSysId,
				deviceType: deviceType,
			};
		}

		const res = await api(params);
		const rows = isSystemApi.value ? res?.records || [] : res?.dmTechnologyExperiences || [];

		console.log("接口返回数据:", {
			当前页: queryParams.value.pageNum,
			本次返回条数: rows.length,
			总数: res?.total,
			当前列表长度: experienceList.value.length,
		});

		// 如果是第一页，直接赋值；否则追加数据
		if (queryParams.value.pageNum === 1) {
			experienceList.value = rows;
		} else {
			experienceList.value = [...experienceList.value, ...rows];
		}

		total.value = res?.total || 0;

		console.log("更新后列表长度:", experienceList.value.length);
	} catch (error: any) {
		console.error("获取经验列表失败", error);
		uni.showToast({
			title: error.message || "获取经验列表失败",
			icon: "none",
		});
	} finally {
		loading.value = false;
	}
};

// 查看详情
const handleView = (item: any) => {
	router.push({
		path: "/pages_auto/technology/detail",
		query: {
			id: isSystemApi.value ? item.faultRepairId : item.id,
			type: "JYWK",
			source: queryParams.value.documentSource,
		},
	});
};

// 新增
const handleAdd = () => {
	router.push({
		path: "/pages/TecLibrary/addExperience",
	});
};

// 获取技术类型
const getTechTypeOptions = async () => {
	try {
		const res = await getTechType();
		const data = res || [];
		techTypeOptions.value = Array.isArray(data)
			? data.map((item: any) => ({
					label: item.name || item.label,
					value: item.id || item.value,
			  }))
			: [];
		filterOptions.value[0].options = techTypeOptions.value;
		filterOptionsList.value = techTypeOptions.value;
		} catch (error) {
		console.error("获取技术类型失败", error);
	}
};

// 获取子系统列表
const getSubsystemOptions = async () => {
	try {
		const res = await getSubsystemList();
		const data = res || [];
		subsystemOptions.value = Array.isArray(data)
			? data.map((item: any) => ({
					label: item.subsystemName || item.label,
					value: item.id || item.value,
			  }))
			: [];
		filterOptions.value[4].options = subsystemOptions.value;
	} catch (error) {
		console.error("获取子系统列表失败", error);
	}
};

// 获取设备类别
const getDeviceCategoryOptions = async () => {
	try {
		const res = await getApplicableDevice();
		const data = res || [];
		deviceCategoryOptions.value = Array.isArray(data)
			? data.map((item: any) => ({
					label: item.deviceCategoryName || item.label,
					value: item.deviceCategoryName || item.value,
			  }))
			: [];
		filterOptions.value[1].options = deviceCategoryOptions.value;
	} catch (error) {
		console.error("获取设备类别失败", error);
	}
};

onMounted(() => {
	getTechTypeOptions();
	getSubsystemOptions();
	getDeviceCategoryOptions();
	fetchList();
});
</script>

<style lang="scss" scoped>
.tech-experience-page {
	display: flex;
	flex-direction: column;
	// 计算高度：100vh - 顶部tabs高度(约180rpx) - 底部tabbar高度(约100rpx)
	height: calc(100vh - 280rpx);
	width: 708rpx;
	margin: 0 auto;
	background: linear-gradient( 180deg, #F6F8FC 0%, #FFFFFF 100%);
	border-radius: 21rpx 21rpx 21rpx 21rpx;
	border: 2rpx solid #FFFFFF;
}

.add-btn {
	position: fixed;
	bottom: 140rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 417rpx;
	z-index: 1;
	height: 84rpx;
	background: #4474FF;
	box-shadow: 0rpx 4rpx 10rpx 0rpx rgba(68,116,255,0.3);
	border-radius: 83rpx 83rpx 83rpx 83rpx;
	border: 2rpx solid #FFFFFF;
	font-size: 29rpx;
	line-height: 84rpx;
	color: #FFFFFF;

	.add-btn-icon {
		margin-right: 20rpx;
		font-size: 40rpx;
		color: #ffffff;
	}
}

.filter-section {
	padding: 25rpx 15rpx 0 20rpx;

	.search-header {
		background-color: transparent;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		gap: 20rpx;
	}

	.search-box {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		width: 571rpx;
		height: 73rpx;
		padding: 18rpx 26rpx 18rpx 32rpx;
		background: #FFFFFF;
		box-shadow: 0rpx 4rpx 10rpx 0rpx rgba(198,215,255,0.3);
		border-radius: 94rpx 94rpx 94rpx 94rpx;
		border: 2rpx solid #C6D7FF;
	}

	.search-input-wrap {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 16rpx;
		min-width: 0;
	}

	.native-input {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		height: 64rpx;
		line-height: 64rpx;
		background: transparent;
		border: none;
		min-width: 0;
	}

	.native-input-placeholder {
		color: #c0c4cc;
		font-size: 28rpx;
	}

	.search-icon {
		width: 40rpx;
		height: 40rpx;
		flex-shrink: 0;
	}

	.filter-btn {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		flex-shrink: 0;
	}

	.filter-icon {
		width: 32rpx;
		height: 32rpx;
	}

	.filter-text {
		font-size: 22rpx;
		color: black;
		white-space: nowrap;
	}
}

.filter-content {
	height: 65vh;
	width: 708rpx;
	background: #F7F8FC;
	border-radius: 20rpx;
	overflow: hidden;
}

.filter-header {
	position: relative;
	height: 74rpx;
	width: 100%;
	text-align: center;
	line-height: 74rpx;
	background: white;

	.filter-title {
		font-size: 30rpx;
		color: #13144F;
	}

	.filter-close {
		position: absolute;
		right: 16rpx;
		top: 50%;
		transform: translateY(-50%);
	}
}

.filter-top {
	height: 84rpx;
	width: 100%;

	.filter-top-scroll {
		width: 100%;
		height: 100%;
		background: #F7F8FC;
	}

	.filter-top-scroll-content {
		display: flex;
		align-items: center;
		height: 100%;
		width: fit-content;
		padding: 0 23rpx;
	}

	.filter-top-item {
		display: flex;
		align-items: center;
		padding: 6rpx 4rpx 6rpx 14rpx;
		white-space: nowrap;
		background: #FFFFFF;
		border-radius: 8rpx;
		margin-right: 40rpx;

		&:last-child {
			margin-right: 0;
		}
	}

	.filter-top-label {
		margin-right: 10rpx;
		font-size: 22rpx;
		line-height: 1;
		color: #13144F;
	}
}

.filter-main {
	display: flex;
	height: calc(100% - 74rpx - 84rpx - 134rpx);
}

.filter-left {
	width: 180rpx;
	height: 100%;
	background-color: #F7F8FC;
}

.filter-left-item {
	padding: 24rpx 0;
	text-align: center;
	font-size: 24rpx;
	color: #13144F;

	&.active {
		background-color: #FFFFFF;
	}
}

.filter-right {
	flex: 1;
	background-color: #FFFFFF;
}

.filter-options {
	display: flex;
	flex-wrap: wrap;
	gap: 24rpx;
	padding: 25rpx 34rpx;

	.filter-option {
		min-width: 208rpx;
		padding: 9rpx 32rpx;
		border-radius: 8rpx;
		box-sizing: border-box;
		font-size: 24rpx;
		color: #606266;
		background-color: #FFFFFF;
		border: 1rpx solid #4474FF;
		text-align: center;
	}

	.filter-option.active {
		background-color: #4474FF;
		color: #FFFFFF;
		border-color: #4474FF;
	}
}

.filter-buttons {
	display: flex;
	justify-content: center;
	height: 134rpx;
	width: 100%;
	box-sizing: border-box;
	background: #F7F8FC;
	padding: 21rpx 0 29rpx 0;
	border-top: 1rpx solid #C6D7FF;
}

.filter-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 292rpx;
	height: 83rpx;
	border-radius: 21rpx;
	font-size: 28rpx;
}

.filter-button.reset {
	background-color: #949DAD;
	color: white;
	margin-right: 20rpx;
}

.filter-button.confirm {
	background-color: #4474FF;
	color: #FFFFFF;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-10rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.experience-list {
	flex: 1;
	position: relative;
	overflow: hidden;
}

.scroller {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

.empty-box {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 400rpx;
}

.empty-text {
	color: #909399;
	font-size: 28rpx;
}

.experience-item {
	padding: 28rpx 28rpx 14rpx 16rpx;
	margin: 20rpx;
	background: linear-gradient( 180deg, rgba(255,255,255,0.7) 0%, rgba(241,251,254,0.7) 100%);
	box-shadow: 0rpx 2rpx 8rpx 0rpx rgba(75,120,250,0.2);
	border-radius: 21rpx;
}

.item-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 4rpx;
}

.item-title {
	flex: 1;
	font-size: 26rpx;
	line-height: 48rpx;
	font-weight: 600;
	color: #13144F;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
}

.status-tag {
	padding: 11rpx 10rpx;
	border-radius: 6rpx;
	font-size: 21rpx;
	line-height: 1;
	margin-left: 16rpx;
	flex-shrink: 0;
}

.status-system {
	background: rgba(255,83,26,0.1);
	border: 1rpx solid #FF531A;
	color: #FF531A;
}

.item-meta {
	padding-bottom: 12rpx;
	margin-bottom: 14rpx;
	border-bottom: 1rpx solid #CFDAFA;
}

.meta-item {
	display: flex;
	font-size: 22rpx;
	line-height: 42rpx;

	.meta-item-label {
		color: #949DAD;
		width: 140rpx;
	}

	.meta-item-value {
		flex: 1;
		color: #13144F;
		text-align: right;
		word-break: break-all;
	}
}

.item-description {
	font-size: 28rpx;
	color: #606266;
	line-height: 1.6;
	margin-bottom: 16rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	line-clamp: 3;
	-webkit-box-orient: vertical;
}

.item-keywords {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 16rpx;
}

.keyword-tag {
	padding: 4rpx 12rpx;
	background-color: #f5f7fa;
	color: #606266;
	border-radius: 8rpx;
	font-size: 24rpx;
}

.item-footer {
	color: #13144F;
}

.footer-text {
	display: flex;
	align-items: center;

	&:last-child {
		margin-top: 12rpx;
	}

	.footer-text-icon {
		margin-right: 6rpx;
	}

	.footer-text-desc {
		font-size: 22rpx;
		line-height: 1;
	}
}

.load-more-tip {
	text-align: center;
	padding: 32rpx;
	color: #909399;
	font-size: 28rpx;
}
</style>

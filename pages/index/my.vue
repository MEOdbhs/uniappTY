<template>
	<cl-page status-bar-background="transparent " background-color="#EFF3FD">
		<view class="bg-color"></view>
		<!-- #ifdef MP -->
		<cl-sticky>
			<cl-topbar :show-back="false" :border="false" background-color="#0B1688 " />
		</cl-sticky>
		<!-- #endif -->
		<view class="my-top flex flex-row items-center justify-between"
			:style="{ paddingTop: (navBarHeight + 100) + 'rpx' }">
			<view class="flex user-info">
				<cl-avatar class="user-img" :src="addDomainPrefix(userInfo.personPhotoUrl)" :size="156">
				</cl-avatar>
				<view class="user-info-text">
					<view class="user-name">{{ userInfo.personName || "未登录" }}</view>
					<view class="user-dept">{{
						`${userInfo.deptName ? userInfo.deptName + " | " : ""}${userInfo.roleName}`
					}}</view>
					<view class="project-btn-wrapper" @click="openProjectPopup">
						{{ currentProject?.customerName || "选择项目" }} <cl-icon name="arrow-bottom" :size="24"
							color="#EBF6FF"></cl-icon>
					</view>
				</view>
			</view>
			<template v-if="userInfo.roleName == '运维专家'">
				<view class="user-type">远程运维 </view>
			</template>
			<template v-else>
				<view class="user-type" v-if="userInfo.currentStatusText">{{ userInfo.currentStatusText }}
				</view>
			</template>
		</view>

		<view class="my-bot">
			<view class="task-box flex flex-row justify-around">
				<view class="flex justify-center items-center" v-for="(item, idx) in taskList" :key="idx + item.key"
					@tap="handleTaskClick(item)">
					<view class="task-num">{{ todoData[item.key] || 0 }}</view>
					<view class="task-text">{{ item.label }}</view>
				</view>
			</view>
			<AppMenu></AppMenu>
		</view>

		<view class="menu-list">
			<view class="menu-list-content">
				<view class="menu-item" v-for="(item, idx) in menuListOne" :key="idx" @click="handleMenuClick(item)">
					<image class="menu-icon" mode="aspectFit" :src="item.icon"></image>
					<view class="menu-text">{{ item.title }}</view>
					<cl-icon class="menu-right-icon" name="arrow-right" :size="24" color="#949DAD"></cl-icon>
				</view>
			</view>
		</view>
		<view class="menu-list">
			<view class="menu-list-content">
				<view class="menu-item" v-for="(item, idx) in menuListTwo" :key="idx" @click="handleMenuClick(item)">
					<image class="menu-icon" mode="aspectFit" :src="item.icon"></image>
					<view class="menu-text">{{ item.title }}</view>
					<cl-icon class="menu-right-icon" name="arrow-right" :size="24" color="#949DAD"></cl-icon>
				</view>
			</view>
		</view>
		<cl-popup v-model="projectPopupVisible" direction="bottom" border-radius="20rpx 20rpx 0 0" padding="0">
			<view class="project-popup">
				<view class="popup-title">
					<text>选择项目</text>
					<cl-icon class="popup-close" name="close" :size="34" color="#C6D7FF"
						@tap="projectPopupVisible = false"></cl-icon>
				</view>
				<!-- 使用scroll-view替代普通view，确保真机上的滚动效果 -->
				<scroll-view class="project-list-scroll" scroll-y="true" :scroll-with-animation="true">
					<view class="project-list">
						<view class="project-item" v-for="(item, idx) in projectList" :key="item.id || idx"
							@click="handleProjectSwitch(item)">
							<view class="project-title">{{ item.customerName || item.name || '未命名项目' }}</view>
							<view v-if="project.currentProjectId === item.id" class="project-tag">当前</view>
							<cl-icon v-else class="project-right-icon" name="arrow-right" :size="24"
								color="#949DAD"></cl-icon>
						</view>
						<view v-if="!projectList.length" class="empty">暂无可选项目</view>
					</view>
				</scroll-view>
				<!-- <view class="popup-footer">
					<cl-button type="primary" style="width: 100%;" block @tap="confirmProjectPopup">
					确定
					</cl-button>
				</view> -->
			</view>
		</cl-popup>
		<cl-confirm ref="Confirm"></cl-confirm>
		<tabbar />
	</cl-page>
</template>

<script lang="ts" setup>
import { onPullDownRefresh, onShow } from "@dcloudio/uni-app";
import { onUnmounted, onMounted } from "vue";
import { useCool, useStore } from "/@/cool";
import { useUi } from "/$/cool-ui";
import Tabbar from "./components/tabbar.vue";
import AppMenu from "./components/appMenu.vue";
import { ref, computed } from "vue";
import { config } from "/@/config";
import { getAllNum, getUserInfo } from "./api";
import { addDomainPrefix } from "/@/cool/utils";
import { showPermissionDialog, isPermitted } from "/@/utils/permission-dialog";
import { checkAppVersion } from "/@/hooks";
import { useUserStore } from "/@/cool/store/user";
const userStore = useUserStore();
const { router } = useCool();
const { user, project } = useStore();

// 导航栏高度
const navBarHeight = ref(0);

// 动态获取导航栏高度
const getNavBarHeight = () => {
	uni.getSystemInfo({
		success: (res: any) => {
			navBarHeight.value = res.statusBarHeight * 2
		},
	})
};

const ui = useUi();
const Confirm = ref<any>();
const methodMap: Record<string, Function> = {
	// 自定义方法
	toEdit,
	handleLogout,
	clearCache,
	checkAppVersion,
};

// 项目选择弹窗
const projectPopupVisible = ref(false);
const projectList = computed(() => project.list || []);
const currentProject = computed(() => project.currentProject);

// 打开项目弹窗
const openProjectPopup = () => {
	if (!projectList.value.length && Array.isArray(userInfo.value?.projectList)) {
		project.setList(userInfo.value?.projectList || []);
	}
	projectPopupVisible.value = true;
};

// 切换项目
const handleProjectSwitch = (item: any) => {
	const currentProjectId = project.currentProjectId;
	project.setCurrentProjectId(item.id);
	projectPopupVisible.value = false;
	if (currentProjectId !== item.id) {
		refreshPageData();
	}
};

// 确认弹窗
const confirmProjectPopup = () => {
	projectPopupVisible.value = false;
};

/**
 * 列表点击
 * @date 2025-12-08
 * @param {any} item:any
 * @returns {any}
 */
const handleMenuClick = (item: any) => {
	// if (["消息通知"].includes(item.title) && isPermitted("非运维客户")) {
	// 	showPermissionDialog();
	// 	return;
	// }

	if (item.method && typeof methodMap[item.method] === "function") {
		methodMap[item.method]();
	} else {
		toPath(item.path);
	}
};

/**
 * 列表路由跳转
 * @date 2025-12-08
 * @param {any} path:string
 * @param {any} data?:any
 * @returns {any}
 */
const toPath = (path: string, data?: any) => {
	if (path) {
		router.push(path);
		return;
	}
	ui.showToast({
		message: "开发中，敬请期待",
	});
};

const menuListOne = [
	{
		icon: '/static/icon/my/message.png',
		title: "消息通知",
		path: "/pages/message/index",
	},
	{
		icon: '/static/icon/my/repairRating.png',
		title: "报修评分",
		path: "/pages_auto/repair/repairRating/index",
	},
	{
		icon: '/static/icon/my/restPwd.png',
		title: "修改密码",
		path: "/pages/user/restPwd",
	},
]
const menuListTwo = [
	// 列表菜单
	{
		icon: '/static/icon/my/clearCache.png',
		title: "清除缓存",
		path: "clearCache",
		method: "clearCache",
	},
	{
		icon: '/static/icon/my/set.png',
		title: "系统设置",
		path: "/pages/user/set",
	},
	{
		icon: '/static/icon/my/checkAppVersion.png',
		title: "版本更新",
		path: "/pages/repair/index",
		method: "checkAppVersion",
	},
	{
		icon: '/static/icon/my/logout.png',
		title: "退出登录",
		path: "logout",
		method: "handleLogout",
	},
];
/**
 * 退出登录
 * @date 2025-12-08
 * @returns {any}
 */
function handleLogout() {
	Confirm.value?.open({
		title: "确认退出登录吗？",
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		callback(action: string) {
			console.log(user, action);
			if (action == "confirm") {
				user.logout();
			}
		},
	});
}

/**
 * 刷新当前页面的数据
 * @date 2025-12-09
 * @returns {any}
 */
async function refreshPageData() {
	try {
		await Promise.all([
			refresh(),
			getAllNum().then((res) => {
				if (res) todoData.value = res;
			}),
			getUserInfo({ userId: user.info?.userId }).then((res) => {
				if (res) {
					userInfo.value = res;
					if (Array.isArray(res.projectList)) {
						project.setList(res.projectList);
					}
				}
			}),
		]);
	} catch (error) {
		console.error("刷新数据失败:", error);
	}
}

/**
 * 使用uni-app机制刷新当前页面
 * @date 2025-12-09
 * @returns {any}
 */
function refreshCurrentPage() {
	// 获取当前页面路由
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];

	if (currentPage) {
		// 方法1：重新加载当前页面
		// #ifdef H5
		// H5环境下可以使用location.reload()
		location.reload();
		// #endif

		// 方法2：重新跳转当前页面（适用于所有平台）
		const currentRoute = (currentPage as any).route || (currentPage as any).__route__;
		if (currentRoute) {
			// 先关闭当前页面，再重新打开
			uni.redirectTo({
				url: "/" + currentRoute,
				success: () => {
					console.log("页面已重新加载");
				},
				fail: (error) => {
					console.error("页面重载失败:", error);
				},
			});
		}
	}
}

async function refresh() {
	if (user.token) {
		await user.get();
	} else {
		// user.logout();
	}
}
const baseUrl = ref("");

function toEdit() {
	router.push("/pages/user/edit");
}

function clearCache() {
	uni.clearStorageSync();
	ui.showToast("清除缓存成功");
}

onPullDownRefresh(async () => {
	uni.stopPullDownRefresh();
});
/**
 * 任务跳转
 * @date 2025-12-09
 * @param {any} item:any
 * @returns {any}
 */
const handleTaskClick = (item: any) => {
	if (isPermitted("非运维客户")) {
		showPermissionDialog();
		return;
	}
	if (item.key === "taultRepair") {
		if (userStore.roles && userStore.roles.includes("operationsCustomer")) {
			router.push("/pages_auto/repair/repairRating/index?type=1");
		} else {
			router.push("/pages_auto/repair/task");
		}
	} else {
		router.push(item.path);
	}
};
const todoData = ref<any>({});
const taskList = ref<Record<string, any>>([
	{
		label: "巡检任务",
		value: "18",
		path: "/pages_auto/inspection/task/index?type=0",
		key: "planRecord",
	},
	{
		label: "报修任务",
		value: "18",
		path: "/pages_auto/repair/deal/index",
		key: "taultRepair",
	},
	{
		label: "维护任务",
		value: "18",
		path: "/pages_auto/taskMaintenance/index?type=0",
		key: "equipment",
	},
	{
		label: "培训任务",
		value: "18",
		path: "/pages_auto/safetyTraining/index",
		key: "trainPlan",
	},
]);
const userInfo = ref<Record<string, any>>({});

// 监听项目切换事件
function onProjectChanged(event: any) {
	console.log("检测到项目切换:", event);
	// 刷新页面数据
	refreshPageData();
}

onMounted(() => {
	getNavBarHeight();
});

onShow(() => {
	baseUrl.value = (config as any).host || "";
	refresh();
	getAllNum().then((res) => {
		if (res) todoData.value = res;
	});
	getUserInfo({ userId: user.info?.userId }).then((res) => {
		if (res) {
			userInfo.value = res;
			if (Array.isArray(res.projectList)) {
				project.setList(res.projectList);
			}
		}
	});

	// 注册项目切换事件监听
	uni.$on("projectChanged", onProjectChanged);
});

// 页面卸载时移除事件监听
onUnmounted(() => {
	uni.$off("projectChanged", onProjectChanged);
});
</script>

<style lang="scss" scoped>
$gap: 24rpx;

.flex {
	display: flex;
}

.flex-row {
	flex-direction: row;
}

.items-center {
	align-items: center;
}

.justify-between {
	justify-content: space-between;
}

.justify-around {
	justify-content: space-around;
}

.bg-color {
	position: absolute;
	top: 0;
	left: 0;
	height: 960rpx;
	width: 100%;
	background: linear-gradient(180deg, #0B1688 0%, #1B2CD2 50%, #4873FA 72.14%, #EFF3FD 100%);
}

.my-top {
	position: relative;
	padding: 20rpx 56rpx 56rpx 42rpx;
	padding-top: 100rpx;
	color: #fff;

	.user-info-text {
		margin-left: 28rpx;
	}

	.user-info {
		position: relative;
	}

	.user-type {
		align-self: flex-start;
		padding: 8rpx 14rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.4);
		border-radius: 17rpx;
		font-size: 24rpx;
		line-height: 36rpx;
	}

	.user-img {
		min-width: 156rpx;
		border-radius: 50% !important;
		border: 16rpx solid rgba(220, 240, 255, 0.3);
	}

	.user-name {
		font-size: 48rpx;
		line-height: 68rpx;
		margin-bottom: 4rpx;
		font-weight: 600;
	}

	.user-dept {
		width: fit-content;
		height: 44rpx;
		padding: 0 20rpx;
		background: linear-gradient(90deg, #FFB74B 0%, #FAEC91 100%);
		border-radius: 26rpx;
		font-size: 21rpx;
		line-height: 44rpx;
		color: #13144F;
	}

	.project-btn-wrapper {
		margin-top: 14rpx;
		margin-left: 2rpx;
		font-size: 25rpx;
		line-height: 35rpx;
		color: #EBF6FF;
	}
}

.project-popup {
	max-height: 60vh;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;

	.popup-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 30rpx 25rpx 38rpx;
		border-bottom: 1rpx solid #C6D7FF;
		font-size: 29rpx;
		font-weight: 600;
		color: #13144F;
	}

	.popup-close {
		font-size: 28rpx;
		color: #547bff;
	}

	.project-list-scroll {
		flex: 1;
		width: 100%;
		min-height: 200rpx;
		max-height: calc(60vh - 120rpx);
	}

	:deep(.cl-list-item__container) {
		align-items: center;
	}

	:deep(.cl-list-item__label) {
		width: 80%;

		span {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			width: 100%;
		}
	}

	.project-list {
		width: 100%;
		padding: 50rpx 30rpx 50rpx 54rpx;
		box-sizing: border-box;
	}

	.project-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 48rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.project-title {
		font-size: 29rpx;
		color: #13144F;
		line-height: 41rpx;
	}

	.project-tag {
		width: 94rpx;
		height: 52rpx;
		background: rgba(68, 116, 255, 0.1);
		border-radius: 31rpx;
		border: 1rpx solid #4474FF;
		text-align: center;
		line-height: 52rpx;
		font-size: 21rpx;
		color: #4474FF;
	}

	.popup-footer {
		margin-top: 20rpx;
	}

	.empty {
		text-align: center;
		color: #999;
		padding: 30rpx 0;
	}
}

.my-bot {
	position: relative;
	padding: 0 20rpx;

	.task-box {
		padding: 0 26rpx;
		margin-bottom: 44rpx;
		text-align: center;

		uni-view {
			display: block;
		}
	}

	.task-num {
		margin-bottom: 10rpx;
		font-weight: 500;
		font-size: 44rpx;
		color: #FFFFFF;
		line-height: 52rpx;
	}

	.task-text {
		font-size: 29rpx;
		color: #E1F2FF;
		line-height: 41rpx;
	}
}

.menu-list {
	position: relative;
	padding: 0 20rpx;
	margin-top: 20rpx;

	.menu-list-content {
		padding: 13rpx 38rpx;
		background: linear-gradient(180deg, #F6F8FC 0%, #FFFFFF 100%);
		border-radius: 21rpx;
		border: 2rpx solid #FFFFFF;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 25rpx 0;
	}

	.menu-icon {
		width: 44rpx;
		height: 44rpx;
		margin-right: 22rpx;
	}

	.menu-text {
		font-size: 29rpx;
		color: #13144F;
		line-height: 41rpx;
	}

	.menu-right-icon {
		margin-left: auto;
	}
}
</style>

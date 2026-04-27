<template>
	<view class="app-menu">
		<scroll-view scroll-x class="scroll-view">
			<view class="menu-list">
				<view
					v-for="(item, index) in menuList"
					:key="item.path"
					class="menu-item"
					@tap="toPage(item)"
				>
					<!-- <cl-icon :name="randomIcon(index)" :size="40"></cl-icon> -->
					<image :src="randomIcon(item)" class="icon"></image>
					<view class="title">
						{{ item.meta.title }}
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useCool } from "/@/cool";
import { getAppRouters, type AppRoute } from "../api";
import { showPermissionDialog, isPermitted } from "/@/utils/permission-dialog";
const { router } = useCool();
const list = ref<AppRoute[]>([]);

// 图标映射，如果后端没有提供图标，使用默认图标
const iconMap: { [key: string]: string } = {
	"order-paid": "order-paid",
	"order-not-shipped": "order-not-shipped",
	"order-received": "order-received",
	"order-refund": "order-refund",
	defectReport: "file-list-line",
	repair: "tools-line",
};

function randomIcon(item: any) {
    console.log(item);

	//按顺序返回图标
    const icons: any = {
        repair: "/static/icon/my/reportRepair.png",
        hazardManagement: "/static/icon/my/danger.png",
        clockIn: "/static/icon/my/attendance.png",
        taskMaintenance: "/static/icon/my/maintenance.png",
        inspection: "/static/icon/my/operations.png",
    };
	return icons[item.component] || '/static/icon/my/operations.png';
}

// 获取图标名称
function getIcon(item: AppRoute): string {
	// 如果后端提供了图标，优先使用
	if (item.meta.icon && item.meta.icon !== "null" && item.meta.icon.length > 0) {
		return item.meta.icon;
	}

	// 根据 component 名称匹配图标
	const componentName = item.component || "";
	if (iconMap[componentName]) {
		return iconMap[componentName];
	}

	// 根据 path 匹配图标
	const path = item.path || "";
	for (const key in iconMap) {
		if (path.includes(key)) {
			return iconMap[key];
		}
	}

	// 默认图标
	return "file-list-line";
}

// 过滤出 APP 前缀且未隐藏的菜单
const menuList = computed<AppRoute[]>(() => {
	return list.value.filter((item) => {
		const meta = item.meta;
		//删除pathincludes("home")
		if (item.path.includes("home")) {
			return false;
		}
		// 后端有的写在 meta.path，有的直接写在 path，这里做兼容处理
		const targetPath = meta.path != null && meta.path.length > 0 ? meta.path : item.path;
		const isApp = typeof targetPath === "string" && targetPath.length > 0;

		return isApp && item.hidden === false;
	});
});

function toPage(item: AppRoute) {
	if (isPermitted("非运维客户")) {
		//非运维客户提示
		showPermissionDialog();
		return;
	}
	// component 指向 pages_auto 目录下的页面名称
	const componentName = item.component;
	console.log("toPage componentName", item, componentName);
	if (componentName != null && componentName.length > 0) {
		const url = `/pages_auto/${componentName}/index`;

		// cool-uni 使用 router.push，cool-unix 使用 router.to
		router.push(url);
	}
}

onMounted(async () => {
	try {
		const res = await getAppRouters();
		if (Array.isArray(res)) {
			// 取最后一项
			list.value = res[res.length - 1].children || res;
		}
	} catch (err) {
		// 接口异常时不影响页面其它区域
		console.error("getAppRouters error", err);
	}
});
</script>

<style lang="scss" scoped>
.app-menu {
	margin-bottom: 24rpx;
	background: linear-gradient( 180deg, #DCF0FF 0%, #FFFFFF 100%);
	border-radius: 21rpx;
	border: 2rpx solid #FFFFFF;

	.scroll-view {
		width: 100%;
		white-space: nowrap;
	}

	.menu-list {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: fit-content;
		padding: 38rpx 12rpx 32rpx 12rpx;
	}

	.menu-item {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex-shrink: 0;
		margin-right: 44rpx;

		&:last-child {
			margin-right: 0;
		}
	}

	.title {
		font-size: 25rpx;
		color: #13144F;
		line-height: 1;
		margin-top: 10rpx;
	}

	.icon {
		width: 84rpx;
		height: 84rpx;
		margin-bottom: 20rpx;
	}
}
</style>

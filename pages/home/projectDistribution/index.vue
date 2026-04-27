<template>
	<cl-page>
		<cl-topbar :title="pageTitle">
			<template #prepend> </template>
		</cl-topbar>

		<view class="list-container">
			<cl-scroller @down="handleRefresh" ref="scrollerRef" @up="handleLoadMore">
				<cl-list v-if="list.length > 0">
					<cl-list-item
						v-for="(item, index) in list"
						:key="item.id || index"
						@tap="handleItemClick(item)"
					>
						<cl-card>
							<view class="list-item">
								<view
									class="item-row"
									v-for="(column, colIndex) in columns"
									:key="colIndex"
								>
									<view class="item-label">{{ column.label }}：</view>
									<template v-if="column.label == '项目状态'">
										<view class="item-value">{{
											getProjectStatusLabel(item.projectStatus) || "-"
										}}</view>
									</template>
									<template v-else-if="column.label == '项目类型'">
										<view class="item-value">{{
											item.projectType == 1 ? "运维项目" : "非运维项目"
										}}</view>
									</template>
									<template v-else>
										<view class="item-value">{{
											getFieldValue(item, column.field) || "-"
										}}</view>
									</template>
								</view>
							</view>
						</cl-card>
					</cl-list-item>
				</cl-list>
				<view v-else class="empty-container">
					<cl-text class="empty-text">暂无数据</cl-text>
				</view>
			</cl-scroller>
		</view>
	</cl-page>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useCool } from "/@/cool";
import {
	getProjectContractListPage,
	getUnOperationsCustomerListPage,
	getOperationsCustomerListPage,
} from "../api";

const { router } = useCool();

// 页面参数
const type = ref<string>("");
const pageTitle = ref<string>("项目分布");

// 列表数据
const list = ref<any[]>([]);
const pagination = ref({
	pageNum: 1,
	pageSize: 10,
});
const loading = ref(false);
const finished = ref(false);
const scrollerRef = ref(null);

// 表头配置
const columns = ref<Array<{ label: string; field: string }>>([]);

// 表头配置映射（支持多个候选字段，用 | 分隔）
const columnConfigs: Record<string, Array<{ label: string; field: string }>> = {
	project: [
		{ label: "项目名称", field: "projectName" },
		{ label: "项目状态", field: "projectStatus" },
		{ label: "合同编号", field: "projectCode" },
		{ label: "服务客户", field: "serveCustomers" },
	],
	customer: [
		{ label: "客户名称", field: "customerName|name" },
		{ label: "项目类型", field: "projectType" },
		{ label: "客户地址", field: "customerAddress|projectAddress" },
		{ label: "客户负责人", field: "directorName" },
	],
	unCustomer: [
		{ label: "姓名", field: "nickName|userName|name" },
		{ label: "电话", field: "phonenumber|userName|mobile" },
		{ label: "客户单位", field: "customerUnit|customerDep" },
	],
};
const getProjectStatusLabel = (status) => {
	const map = {
		1: "即将生效",
		2: "履行中",
		3: "即将到期",
		4: "已到期",
	};
	return map[status] || "未知";
};
// 初始化配置
function initConfig() {
	// 根据类型设置标题和表头
	switch (type.value) {
		case "project":
			pageTitle.value = "运维项目";
			columns.value = columnConfigs.project;
			break;
		case "customer":
			pageTitle.value = "运维客户";
			columns.value = columnConfigs.customer;
			break;
		case "unCustomer":
			pageTitle.value = "非运维客户";
			columns.value = columnConfigs.unCustomer;
			break;
		default:
			pageTitle.value = "项目分布";
			columns.value = columnConfigs.project;
	}
}

// 获取字段值（支持嵌套字段和多个候选字段）
function getFieldValue(item: any, field: string): string {
	if (!item || !field) return "";

	// 支持多个候选字段，用 | 分隔
	const fields = field.split("|").map((f) => f.trim());

	for (const fieldPath of fields) {
		const fieldParts = fieldPath.split(".");
		let value = item;
		let found = true;

		for (const f of fieldParts) {
			value = value?.[f];
			if (value === undefined || value === null) {
				found = false;
				break;
			}
		}

		if (found && value !== undefined && value !== null) {
			return String(value);
		}
	}

	return "";
}

// 返回上一页
function goBack() {
	uni.navigateBack();
}

// 获取列表数据
async function fetchList() {
	if (loading.value) return;

	loading.value = true;
	try {
		const params: any = {
			pageNum: pagination.value.pageNum,
			pageSize: pagination.value.pageSize,
		};

		let res: any;
		switch (type.value) {
			case "project":
				res = await getProjectContractListPage(params);
				break;
			case "customer":
				res = await getOperationsCustomerListPage(params);
				break;
			case "unCustomer":
				res = await getUnOperationsCustomerListPage(params);
				break;
			default:
				res = await getProjectContractListPage(params);
		}

		// 处理不同接口的响应格式
		let rows: any[] = [];
		let total = 0;

		if (res) {
			if (Array.isArray(res)) {
				rows = res;
				total = res.length;
			} else if (res.rows && Array.isArray(res.rows)) {
				rows = res.rows;
				total = res.total || 0;
			} else if (res.data && Array.isArray(res.data)) {
				rows = res.data;
				total = res.total || 0;
			} else if (res.list && Array.isArray(res.list)) {
				rows = res.list;
				total = res.total || 0;
			}
		}

		// 追加数据
		if (pagination.value.pageNum === 1) {
			list.value = rows;
		} else {
			list.value = list.value.concat(rows);
		}

		// 判断是否还有更多数据
		// 如果有 total，则通过 total 判断；否则通过返回的数据量判断
		if (total > 0) {
			if (list.value.length >= total) {
				finished.value = true;
			}
		} else {
			if (rows.length < pagination.value.pageSize) {
				finished.value = true;
			}
		}
	} catch (error) {
		console.error("获取列表失败:", error);
		uni.showToast({
			title: "加载失败",
			icon: "none",
		});
	} finally {
		loading.value = false;
	}
}

// 刷新
async function handleRefresh(end?: () => void) {
	pagination.value.pageNum = 1;
	list.value = [];
	finished.value = false;
	await fetchList();
	end?.();
}

// 加载更多
function handleLoadMore() {
	if (finished.value || loading.value) {
		return;
	}
	pagination.value.pageNum++;
	fetchList();
}

// 点击列表项
function handleItemClick(item: any) {
	// 可以根据需要添加详情页跳转
	console.log("点击项:", item);
}

onLoad((options: any) => {
	type.value = options?.type || "project";
	initConfig();
	fetchList();
});
</script>

<style lang="scss" scoped>
$gap: 24rpx;
:deep(.cl-list-item__append) {
	display: none;
}
.back-btn {
	padding: 8rpx;
	margin-left: -8rpx;
}

.list-container {
	background-color: #f6f7fa;
	height: calc(100vh - 200rpx);
	padding: $gap;
}

:deep(.cl-list) {
	margin-bottom: 0;
}

:deep(.cl-list-item) {
	padding: 24rpx;
	margin-bottom: $gap;
	background-color: transparent;
	border-radius: 0;
}

:deep(.cl-list-item__content) {
	width: 100%;
}

:deep(.cl-card) {
	width: 100%;
}

:deep(.cl-list-item__container) {
	background-color: #fff;
	border-radius: 24rpx;
	padding: $gap;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	width: 100%;
}

.list-item {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.item-row {
	display: flex;
	align-items: flex-start;
	gap: 8rpx;
	font-size: 28rpx;
	line-height: 1.6;
}

.item-label {
	color: #666;
	font-weight: 400;
	flex-shrink: 0;
	min-width: 140rpx;
}

.item-value {
	color: #333;
	font-weight: 500;
	flex: 1;
	word-break: break-all;
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
</style>

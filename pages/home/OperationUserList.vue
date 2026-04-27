<template>
	<cl-page fullscreen :padding="0">
		<view class="page-layout">
			<cl-topbar :title="projectName" :description="`${typeText}人员`" />
			<view class="scroller-wrapper">
				<cl-scroller ref="scroller" @down="onDown" @up="onUp">
					<view class="list" v-if="list.length > 0">
						<view class="item" v-for="(item, index) in list" :key="index">
							<view class="row">
								<text class="label">用户名称：</text>
								<text class="value">{{ item.nickName || "-" }}</text>
							</view>
							<view class="row">
								<text class="label">角色：</text>
								<text class="value">{{ item.roleName || "-" }}</text>
							</view>
							<view class="row">
								<text class="label">手机号：</text>
								<text class="value">{{
									item.phonenumber || item.phone || "-"
								}}</text>
							</view>
						</view>
						<cl-loadmore :loading="loading" :finish="!hasMore" />
					</view>

					<cl-empty v-if="list.length === 0 && !loading" text="暂无数据" />
				</cl-scroller>
			</view>
		</view>
	</cl-page>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useCool } from "/@/cool";
import { onLoad, onReady } from "@dcloudio/uni-app";
import { getOperationUserList } from "./api";

const scroller = ref();
const list = ref<any[]>([]);
const loading = ref(false);
const pagination = {
	page: 1,
	size: 10,
};
const hasMore = ref(true);
const projectId = ref("");
const type = ref("personnel");
const projectName = ref("");

const notInFlag = computed(() => type.value === "personnel");
const typeText = computed(() => (type.value === "personnel" ? "运维" : "专家"));

onLoad((options: any) => {
	projectId.value = options.projectId || "";
	type.value = options.type || "personnel";
	projectName.value = options.projectName || "";
});

onReady(() => {
	scroller.value?.down();
});

// 下拉刷新
async function onDown(done: () => void) {
	pagination.page = 1;
	hasMore.value = true;
	loading.value = true;
	try {
		const res = await getOperationUserList({
			pageNum: pagination.page,
			pageSize: pagination.size,
			projectId: projectId.value,
			roleKeys: ["operationsExpert"],
			notInFlag: notInFlag.value,
		});
		list.value = res.rows || res.list || [];
		if (list.value.length >= (res.total || 0)) {
			hasMore.value = false;
		}
	} catch (e) {
		console.error(e);
		list.value = [];
	} finally {
		loading.value = false;
		done();
	}
}

// 上拉加载
async function onUp() {
	if (!hasMore.value || loading.value) return;

	loading.value = true;
	pagination.page++;
	try {
		const res = await getOperationUserList({
			pageNum: pagination.page,
			pageSize: pagination.size,
			projectId: projectId.value,
			roleKeys: ["operationsExpert"],
			notInFlag: notInFlag.value,
		});
		const nextList = res.rows || res.list || [];
		list.value.push(...nextList);
		if (list.value.length >= (res.total || 0)) {
			hasMore.value = false;
		}
	} catch (e) {
		pagination.page--;
	} finally {
		loading.value = false;
	}
}
</script>

<style lang="scss" scoped>
.page-layout {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.scroller-wrapper {
	flex: 1;
	height: 0; // 关键：确保 flex 子项正确计算高度
	position: relative;
}

.list {
	padding: 20rpx;

	.item {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

		.row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 16rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.label {
				font-size: 28rpx;
				color: #666;
			}

			.value {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
				flex: 1;
				text-align: right;
			}
		}
	}
}
</style>

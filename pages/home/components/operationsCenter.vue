<template>
	<view class="operations-page">
		<view class="section-title" @tap="handleTechQuery">
			<cl-image class="img" mode="aspectFill" src="/static/icon/F1.png"></cl-image>
			<text class="btn-text">技术查询</text>
			<cl-image class="img" mode="aspectFill" src="/static/icon/jump-icon.png"></cl-image>
		</view>
		<view class="module">
			<view class="pub-title">运维人数分布</view>
			<view class="cart-box">
				<Charts :chartData="userData" :colors="['#4474FF']" :opts="userDataOpts" />
			</view>
		</view>
		<view class="module">
			<view class="pub-title">巡检任务完成情况</view>
			<view class="cart-box">
				<Charts :chartData="taskData" :colors="['#73A0FA', '#5AD8A6']" cartType="line" :opts="taskDataOpts" />
			</view>
		</view>
		<view class="module">
			<view class="pub-title">项目好评榜</view>
			<view class="pro-list-box">
				<view class="list-item" v-for="(item, idx) in proData" :key="idx">
					<view class="list-item-num">
						<image class="list-item-num-icon" :src="ratingIcon(idx)"></image>
						<view class="list-item-num-text">{{ idx + 1 }}</view>
					</view>
					<view class="item-name">
						<view class="item-name-text">{{ item.projectName }}</view>
						<view class="item-name-count">评价次数：{{ item.commentTimes }}</view>
					</view>
					<view class="list-item-score">
						<image class="list-item-star" src="/static/icon/home/rating.png"></image>
						<view class="list-item-score-text">{{ item.avgScore }}</view>
					</view>
				</view>
			</view>
		</view>
		<!-- <view class="module">
			<view class="pub-title">诊断平台报警/故障分析</view>
			<view class="cart-box">
				<Charts :cartType="'line'" :chartData="userData" />
			</view>
		</view> -->
		<view class="module">
			<view class="pub-title">报修任务分析</view>
			<view class="task-list-box">
				<view class="list-item" v-for="(item, idx) in repairData" :key="idx">
					<view class="list-name">{{ item.projectName }}</view>
					<view class="list-item-content">
						<view class="list-item-title">
							<view class="list-item-name">报修任务数:</view>
							<view class="list-item-score">{{ item.taskCount }}</view>
						</view>
						<view class="list-item-title">
							<view class="list-item-name">完成数:</view>
							<view class="list-item-score">{{ item.doneCount }}</view>
						</view>
						<view class="list-item-title">
							<view class="list-item-name">最长处理时长:</view>
							<view class="list-item-score">{{ item.maxInterval || "-" }}</view>
						</view>
						<view class="list-item-title">
							<view class="list-item-name">最短处理时长:</view>
							<view class="list-item-score">{{ item.minInterval || "-" }}</view>
						</view>
						<view class="list-item-title">
							<view class="list-item-name">评价报修完成时长:</view>
							<view class="list-item-score">{{ item.avgInterval || "-" }}</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { ref } from "vue";
import Charts from "./charts.vue";
import { useCool } from "/@/cool";
import { ywPerson, ywkTasks, projectRank, ywTaskAnalyze } from "../api";
const { router } = useCool();
const userData = ref<Record<string, any>>({
	categories: [],
	series: [
		{
			name: "运维人数",
			data: [],
		},
	],
});

const userDataOpts = {
	xAxis: { disableGrid: true,fontColor:'transparent' },
	yAxis: { data: [{ min: 0 }] },
	legend: { show: true, iconHeight: 4 },
	extra: {
		column: {
			type: "group",
			width: "14",
			activeBgColor: "#000000",
			activeBgOpacity: 0.08,
			linearType: "custom",
			barBorderCircle: true,
			customColor: [
			  "#4474FF",
			  "#4474FF"
			]
		}
	},
}

const taskData = ref<Record<string, any>>({
	categories: [],
	series: [
		{
			name: "任务数量",
			data: [],
		},
		{
			name: "完成数量",
			data: [],
		},
	],
});
const taskDataOpts = {
	xAxis: {
		disableGrid: true,
		fontColor:'transparent'
	},
	yAxis: {
		gridType: "dash",
		dashLength: 2
	},
	extra: {
		line: {
			type: "straight",
			width: 2,
			activeType: "hollow"
		}
	}
}

const ratingIcon = (score: string) => {
	const index = Number(score);
	const icon = [
		"/static/icon/home/No1.png",
		"/static/icon/home/No2.png",
		"/static/icon/home/No3.png",
		"/static/icon/home/No4.png",
	]
	return index >= 3 ? icon[3] : icon[index];
}

// 技术查询
function handleTechQuery() {
	console.log(1111);
	router.push({
		path: "/pages/TecLibrary/index",
	});
}

// 获取排名类名
function getRankClass(idx: number | string): string {
	return `active${Number(idx)}`;
}

const proData = ref<Record<string, any>>([]);
const repairData = ref<Record<string, any>>([]);

// 刷新数据的方法
async function refreshData() {
	try {
		const [userRes, taskRes, proRes, bxRes] = await Promise.all([
			ywPerson(),
			ywkTasks(),
			projectRank(),
			ywTaskAnalyze(),
		]);
		if (Array.isArray(userRes)) {
			const categories = userRes.map((item: any) => item?.projectName ?? "");
			const series = userRes.map((item: any) => Number(item?.count ?? 0));
			userData.value = {
				categories,
				series: [{ name: "运维人数", data: series }],
			};
		}
		if (Array.isArray(taskRes)) {
			let categories = taskRes.map((item: any) => item?.projectName ?? "");
			const allData = taskRes.map((item: any) => Number(item?.count ?? 0));
			const doneData = taskRes.map((item: any) => Number(item?.completeCount ?? 0));
			console.log(categories);
			// categories = [
			// 	"LY运维合同03_合同未生效",
			// 	"XX煤矿井下安全避险fsafa应急指挥系统fsafagasgsgdsdg升级项目1",
			// 	"LY运维合同02_合同已生效",
			// ];
			taskData.value = {
				categories,
				series: [
					{ name: "任务数量", data: allData },
					{ name: "完成数量", data: doneData },
				],
			};
		}
		proData.value = Array.isArray(proRes) ? proRes : [];
		repairData.value = Array.isArray(bxRes) ? bxRes : [];
	} catch (err) {
		console.error(err);
	}
}

onShow(() => {
	refreshData();
});

// 暴露刷新方法供父组件调用
defineExpose({
	refreshData,
});
</script>

<style scoped lang="scss">
.operations-page {
	padding: 20rpx;
}

.module {
	margin-top: 30rpx;
	padding: 20rpx;
	background: linear-gradient( 180deg, #F6F8FC 0%, #FFFFFF 100%);
	border-radius: 21rpx;
	border: 2rpx solid #FFFFFF;
}

.pub-title {
	margin-left: 10rpx;
	font-weight: 600;
	font-size: 29rpx;
	color: #13144F;
	line-height: 41rpx;
}

.cart-box {
	width: 100%;
	height: 400rpx;
	background: #F7F9FC;
	border-radius: 21rpx;
	padding: 0 12rpx;
	box-sizing: border-box;
}

.section-title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: linear-gradient(135deg, #667eea 0%, #24a2fb 70%);
	height: 120rpx;
	color: #fff;
	border-radius: 24rpx;

	.img {
		width: 80rpx !important;
		height: 80rpx !important;
		margin: 0 20rpx;
	}
}

.pro-list-box {
	padding: 20rpx 4rpx 20rpx 18rpx;

	.list-item {
		display: flex;
		align-items: center;
		height: 156rpx;
		padding: 20rpx 38rpx 20rpx 26rpx;
		background: linear-gradient( -90deg, #DCF0FF 0%, #FFFFFF 100%);
		border-radius: 15rpx;
		border: 2rpx solid #FFFFFF;
		margin-bottom: 20rpx;
		box-sizing: border-box;
	}

	.list-item-title {
		display: flex;
		justify-content: space-between;
	}

	.list-item-num {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		width: 46rpx;
		height: 58rpx;
		margin-right: 30rpx;
		font-size: 21rpx;
		color: white;
	}

	.list-item-num-icon {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.list-item-num-text {
		position: relative;
		top: -4rpx;
	}

	.list-item-count {
		margin-top: 15rpx;
		color: #797979;
	}

	.list-item-score {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		width: 96rpx;
		height: 110rpx;
		margin-left: auto;

		.list-item-star {
			display: block;
			width: 100%;
			height: 100%;
			position: absolute;
		}

		.list-item-score-text {
			position: relative;
			font-size: 32rpx;
			color: #fff;
			transform: translateY(-2rpx);
		}
	}

	.list-item-text {
		font-size: 24rpx;
		flex: 1;
	}

	.item-name-text {
		font-weight: 600;
		font-size: 33rpx;
		color: #13144F;
		line-height: 47rpx;
		margin-bottom: 24rpx;
	}

	.item-name-count {
		font-size: 19rpx;
		color: #13144F;
		line-height: 26rpx;
	}
}

.task-list-box {
	padding: 0 0 30rpx;
	margin-top: 70rpx;

	.list-item {
		position: relative;
		margin-bottom: 30rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.list-name {
		position: absolute;
		top: -36rpx;
		left: 4rpx;
		height: 52rpx;
		background: #4873FA;
		border-radius: 21rpx 31rpx 0rpx 0rpx;
		color: white;
		font-size: 21rpx;
		padding: 6rpx 32rpx 0 22rpx;
		box-sizing: border-box;
	}

	.list-item-name {
		font-size: 21rpx;
		color: #13144F;
		line-height: 29rpx;
	}

	.list-item-content {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		position: relative;
		background: linear-gradient( 0deg, #FFFFFF 0%, #DCF0FF 100%);
		border-radius: 21rpx;
		border: 2rpx solid #FFFFFF;
		padding: 30rpx 40rpx;
	}

	.list-item-title:nth-child(even) {
		justify-content: flex-end;
	}

	.list-item-title {
		display: flex;
		align-items: center;
		width: 50%;
		margin-bottom: 26rpx;
	}

	.list-item-score {
		margin-left: 10rpx;
		font-size: 21rpx;
		color: #7093F7;
		line-height: 29rpx;
	}
}
</style>

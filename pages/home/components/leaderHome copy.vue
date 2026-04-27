<template>
	<view class="leader-home">
		<!-- 操作按钮 -->
		<view class="action-buttons">
			<view class="action-btn repair-btn" @tap="handleRepair">
				<view class="btn-icon">
					<cl-image
						src="/static/icon/A2.png"
						mode="aspectFill"
						class="top-img"
					></cl-image>
				</view>
				<text class="btn-text">故障报修</text>
			</view>
			<view class="action-btn query-btn" @tap="handleTechQuery">
				<view class="btn-icon">
					<cl-image
						src="/static/icon/B2.png"
						mode="aspectFill"
						class="top-img"
					></cl-image>
				</view>
				<text class="btn-text">技术查询</text>
			</view>
		</view>

		<!-- 项目分布 -->
		<view class="section project-distribution">
			<view class="section-title">项目分布</view>
			<view class="stats-row">
				<view class="stat-item" @tap="handleProjectClick">
					<view class="stat-icon repair-btn">
						<cl-image
							src="/static/icon/D1.png"
							mode="aspectFill"
							class="top-img"
						></cl-image>
						<view class="stat-label">运维项目</view>
					</view>
					<view class="stat-content">
						<view class="stat-value">{{ projectCount.projectDistribution || 0 }}</view>
					</view>
				</view>
				<!-- /@tap="handleCustomerClick" -->
				<view class="stat-item" @tap="handleCustomerClick">
					<view class="stat-icon repair-btn">
						<cl-image
							src="/static/icon/D2.png"
							mode="aspectFill"
							class="top-img"
						></cl-image>
						<view class="stat-label">运维客户</view>
					</view>
					<view class="stat-content">
						<view class="stat-value">{{ projectCount.customerDistribution || 0 }}</view>
					</view>
				</view>
				<view class="stat-item" @tap="handleUnCustomerClick">
					<view class="stat-icon repair-btn">
						<cl-image
							src="/static/icon/D3.png"
							mode="aspectFill"
							class="top-img"
						></cl-image>
						<view class="stat-label">非运维客户</view>
					</view>
					<view class="stat-content">
						<view class="stat-value">{{
							projectCount.noProjectCustomerDistribution || 0
						}}</view>
					</view>
				</view>
			</view>
			<view class="map-container">
				<ChinaMap
					:project-list="mapData.projectDistribution || []"
					:customer-list="mapData.customerDistribution || []"
					:no-project-customer-list="mapData.noProjectCustomerDistribution || []"
					:activeProvinces="mapList"
					:width="750"
					:height="600"
				/>
			</view>
		</view>

		<!-- 运维团队 -->
		<view class="section team-section">
			<view class="section-title">运维团队</view>
			<view class="team-stats">
				<view class="team-item" @tap="toOperationProjectList('personnel')">
					<view class="team-icon repair-btn">
						<cl-image
							src="/static/icon/C1.png"
							mode="aspectFill"
							class="top-img"
						></cl-image>
					</view>
					<view class="team-value">{{ teamStats.personnelCount || 0 }}</view>
					<view class="team-label">运维人员</view>
				</view>
				<!--  @tap="toOperationProjectList('expert')" -->
				<view class="team-item">
					<view class="team-icon repair-btn">
						<cl-image
							src="/static/icon/C2.png"
							mode="aspectFill"
							class="top-img"
						></cl-image>
					</view>
					<view class="team-value">{{ teamStats.expertCount || 0 }}</view>
					<view class="team-label">专家</view>
				</view>
			</view>
		</view>

		<!-- 巡检统计 -->
		<view class="section inspection-section">
			<view class="section-header">
				<view class="section-title">巡检统计</view>
				<view class="date-filter">
					<view class="time-box dis-flex">
						<view
							:class="inspectionDateType === 0 ? 'time-act' : ''"
							@tap="inspectionDateType = 0"
						>
							月
						</view>
						<view
							:class="inspectionDateType === 2 ? 'time-act' : ''"
							@tap="inspectionDateType = 2"
						>
							年
						</view>
					</view>
					<cl-select-date
						v-model="searchMonth"
						:mode="inspectionDateMode"
						:format="inspectionDateFormat"
						class="inspection-date-picker"
					>
						<template #default="{ value }">
							<view class="date-selector">
								<text class="date-text">{{
									value || getInspectionDefaultText()
								}}</text>
								<cl-icon name="arrow-down" size="24" color="#666" />
							</view>
						</template>
					</cl-select-date>
					<cl-button
						type="primary"
						size="small"
						round
						:margin="[0, 0, 0, 16]"
						@tap="handleQuery"
						:loading="queryLoading"
					>
						查询
					</cl-button>
				</view>
			</view>
			<view class="team-stats">
				<view class="team-item">
					<view class="team-value">{{ inspectionStats.totalCount || 0 }}</view>
					<view class="team-label">巡检总数</view>
				</view>
				<view class="team-item">
					<view class="team-value">{{ inspectionStats.transferToRepairCount || 0 }}</view>
					<view class="team-label">巡检转维修订单总数</view>
				</view>
				<view class="team-item">
					<view class="team-value">{{ inspectionStats.qualifiedCount || 0 }}</view>
					<view class="team-label">巡检任务合格数</view>
				</view>
			</view>

			<!-- 折线图 -->
			<view class="chart-container">
				<Charts
					cartType="line"
					:chartData="inspectionChartData"
					:colors="['#1890FF', '#91CB74', '#9E9E9E']"
					:opts="lineScrollOpts1"
					:ontouch="false"
				/>
			</view>
		</view>

		<!-- 维修工单 -->
		<view class="section repair-order-section">
			<view class="section-header">
				<view class="section-title">维修工单</view>
				<view class="date-filter">
					<view class="time-box dis-flex">
						<view
							:class="repairOrderDateType === 0 ? 'time-act' : ''"
							@tap="repairOrderDateType = 0"
						>
							月
						</view>
						<view
							:class="repairOrderDateType === 2 ? 'time-act' : ''"
							@tap="repairOrderDateType = 2"
						>
							年
						</view>
					</view>
					<cl-select-date
						v-model="repairOrderDate"
						:mode="repairOrderDateMode"
						:format="repairOrderDateFormat"
						class="repair-order-date-picker"
					>
						<template #default="{ value }">
							<view class="date-selector">
								<text class="date-text">{{
									value || getRepairOrderDefaultText()
								}}</text>
								<cl-icon name="arrow-down" size="24" color="#666" />
							</view>
						</template>
					</cl-select-date>
					<cl-button
						type="primary"
						size="small"
						round
						:margin="[0, 0, 0, 16]"
						@tap="handleRepairOrderQuery"
						:loading="repairOrderQueryLoading"
					>
						查询
					</cl-button>
				</view>
			</view>

			<view class="team-stats">
				<view class="team-item">
					<view class="team-value">{{ repairOrderStats.handled || 0 }}</view>
					<view class="team-label">已处理工单</view>
				</view>
				<view class="team-item">
					<view class="team-value">{{ repairOrderStats.wait || 0 }}</view>
					<view class="team-label">待维修工单</view>
				</view>
				<view class="team-item">
					<view class="team-value">{{ repairOrderStats.avgTime || 0 }}</view>
					<view class="team-label">处理平均时长</view>
				</view>
				<view class="team-item">
					<view class="team-value">{{ repairOrderStats.avgScore || 0 }}</view>
					<view class="team-label">平均评分</view>
				</view>
			</view>

			<view class="chart-container">
				<Charts
					cartType="line"
					:chartData="repairOrderChartData"
					:colors="['#1890FF', '#FF9F00']"
					:opts="lineScrollOpts"
					:ontouch="true"
				/>
			</view>
		</view>

		<view class="section inspection-section">
			<view class="section-header">
				<view class="section-title">诊断平台</view>
			</view>

			<view class="team-stats">
				<view class="team-item">
					<view class="team-value">{{ diagnosticData.totalCount || 0 }}</view>
					<view class="team-label">报警总数</view>
				</view>
				<view class="team-item">
					<view class="team-value">{{ diagnosticData.transferToRepairCount || 0 }}</view>
					<view class="team-label">诊断报警</view>
				</view>
				<view class="team-item">
					<view class="team-value">{{ diagnosticData.qualifiedCount || 0 }}</view>
					<view class="team-label">转维修工单总数</view>
				</view>
			</view>
		</view>

		<!-- 最新消息 -->
		<view class="section news-section">
			<view class="section-header">
				<view class="section-title">最新消息</view>
				<view class="more-btn" @tap="goToMessageList">
					<text class="more-text">更多</text>
					<cl-icon name="arrow-right" size="24" color="#666" />
				</view>
			</view>
			<view class="news-list">
				<view
					class="news-item"
					v-for="(item, index) in latestNewsList"
					:key="item.id || index"
					@tap="handleNewsClick(item)"
				>
					<view class="news-type-tag">{{ item.typeText || "通知" }}</view>
					<view class="news-content">
						<view class="news-title">{{ item.title || "" }}</view>
					</view>
					<view class="news-time">{{ formatNewsTime(item.sendTime) }}</view>
				</view>
			</view>
		</view>

		<!-- 公司资质 -->
		<view class="section qualification-section">
			<view class="section-title">公司资质</view>
			<view class="qualification-banner" v-if="qualificationList.length > 0">
				<cl-banner
					:list="qualificationList"
					type="card"
					:height="400"
					:radius="16"
					:indicator-dots="true"
					:autoplay="false"
					:circular="true"
				/>
			</view>
			<view v-else class="empty-qualification">
				<cl-text class="empty-text">暂无资质证书</cl-text>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { addDomainPrefix } from "/@/cool/utils";
import { useStore } from "/@/cool";
import { ref, onMounted, computed, watch } from "vue";
import { useCool } from "/@/cool";
import dayjs from "dayjs";
import { config } from "/@/config";
import ChinaMap from "./ChinaMap.vue";
import Charts from "./charts.vue";
const { user } = useStore();

import {
	getProjectDistribution,
	getTeamStatistics,
	getdiagnosticData,
	getInspectionStatistics,
	getInspectionStatisticsList,
	getLatestNews,
	getCompanyTicket,
	getRepairOrderCount,
	getRepairOrderCountLine,
	getMapIcon,
} from "../api";
import { showPermissionDialog, isPermitted } from "/@/utils/permission-dialog";
const { router } = useCool();

function toOperationProjectList(type: string) {
	router.push({
		path: "/pages/home/OperationProjectList",
		query: {
			type,
		},
	});
}

const mapList = ref([] as any[]);
// 项目分布统计
const projectCount = ref({
	projectDistribution: 0,
	customerDistribution: 0,
	noProjectCustomerDistribution: 0,
});

// 地图数据
const mapData = ref({
	projectDistribution: [] as any[],
	customerDistribution: [] as any[],
	noProjectCustomerDistribution: [] as any[],
});

// 运维团队统计
const teamStats = ref({
	personnelCount: 0,
	expertCount: 0,
});

// 巡检统计
const inspectionStats = ref({
	totalCount: 0,
	transferToRepairCount: 0,
	qualifiedCount: 0,
});

// 巡检统计数据列表（已废弃，直接在 loadInspectionData 中处理）
const inspectionListData = ref<any>(null);

// 选中的年月（格式：YYYY-MM）
const searchMonth = ref<string>("");
const inspectionDateType = ref<0 | 2>(0);
const inspectionDateMode = computed(() =>
	inspectionDateType.value === 2 ? ["year"] : ["year", "month"],
);
const inspectionDateFormat = computed(() => (inspectionDateType.value === 2 ? "YYYY" : "YYYY-MM"));

// 查询加载状态
const queryLoading = ref(false);
const companyTicket = ref({});

// 维修工单日期筛选（格式：YYYY-MM-DD）
const repairOrderDate = ref<string>("");
const repairOrderDateType = ref<0 | 2>(0);
const repairOrderDateMode = computed(() =>
	repairOrderDateType.value === 2 ? ["year"] : ["year", "month"],
);
const repairOrderDateFormat = computed(() =>
	repairOrderDateType.value === 2 ? "YYYY" : "YYYY-MM",
);
// 维修工单查询加载状态
const repairOrderQueryLoading = ref(false);

// 最新消息列表
const latestNewsList = ref<any[]>([]);
const diagnosticData = ref({
	totalCount: 0,
	transferToRepairCount: 0,
	qualifiedCount: 0,
});
// 公司资质列表
const qualificationList = ref<Array<{ url: string }>>([]);

// 维修工单统计
const repairOrderStats = ref({
	handled: 0,
	wait: 0,
	avgTime: 0,
	avgScore: 0,
});

// 维修工单折线图数据
const repairOrderChartData = ref<{
	categories: string[];
	series: Array<{
		name: string;
		data: number[];
	}>;
}>({
	categories: [],
	// 只绘制两条线：已处理工单、平均评分
	series: [
		{ name: "已处理工单", data: [] },
		{ name: "待维修工单", data: [] },
	],
});

const lineScrollOpts1 = {
	xAxis: {
		disableGrid: false,
		boundaryGap: "justify",
		scrollAlign: "left",
		labelCount: 10,
		fontSize: 11,
		fontColor: "#666666",
	},
	yAxis: {
		data: [{ min: 0 }],
		gridColor: "#f0f0f0",
		axisLine: false,
		fontSize: 11,
		fontColor: "#666666",
	},
	extra: {
		line: {
			type: "curve",
			width: 2,
		},
		tooltip: {
			showBox: true,
		},
	},
	padding: [30, 16, 16, 16], // 顶部加 padding，拉开图例与图形距离
};

// 统一的折线图滚动配置（防止时间刻度过密，支持滚动）
const lineScrollOpts = {
	enableScroll: true,
	xAxis: {
		disableGrid: false,
		boundaryGap: "justify",
		itemCount: 6, // 可视范围内显示的刻度数量
		scrollShow: true,
		scrollAlign: "left",
		labelCount: 10,
		fontSize: 11,
		fontColor: "#666666",
	},
	yAxis: {
		data: [{ min: 0 }],
		gridColor: "#f0f0f0",
		axisLine: false,
		fontSize: 11,
		fontColor: "#666666",
	},
	extra: {
		line: {
			type: "curve",
			width: 2,
		},
		tooltip: {
			showBox: true,
		},
	},
	padding: [50, 16, 16, 16], // 顶部加 padding，拉开图例与图形距离
};
// 获取当前年月
function getCurrentYearMonth(): string {
	return dayjs().format("YYYY-MM");
}
function getCurrentYear(): string {
	return dayjs().format("YYYY");
}
function normalizeToYear(value: string): string {
	const d = dayjs(value);
	return d.isValid() ? d.format("YYYY") : getCurrentYear();
}
function normalizeToYearMonth(value: string): string {
	const d = dayjs(value);
	return d.isValid() ? d.format("YYYY-MM") : getCurrentYearMonth();
}
function getInspectionDefaultText(): string {
	return inspectionDateType.value === 2 ? getCurrentYear() : getCurrentYearMonth();
}
function getRepairOrderDefaultText(): string {
	return repairOrderDateType.value === 2 ? getCurrentYear() : getCurrentYearMonth();
}

// 初始化选中年月为当前年月
searchMonth.value = getCurrentYearMonth();

// 初始化维修工单日期为当前年月
repairOrderDate.value = getCurrentYearMonth();

watch(inspectionDateType, (val) => {
	searchMonth.value =
		val === 2 ? normalizeToYear(searchMonth.value) : normalizeToYearMonth(searchMonth.value);
});

watch(repairOrderDateType, (val) => {
	repairOrderDate.value =
		val === 2
			? normalizeToYear(repairOrderDate.value)
			: normalizeToYearMonth(repairOrderDate.value);
});

// 查询按钮点击事件
async function handleQuery() {
	if (!searchMonth.value) {
		uni.showToast({
			title: "请选择时间",
			icon: "none",
		});
		return;
	}

	queryLoading.value = true;
	try {
		await loadInspectionData();
		uni.showToast({
			title: "查询成功",
			icon: "success",
		});
	} catch (error) {
		console.error("查询失败:", error);
		uni.showToast({
			title: "查询失败",
			icon: "none",
		});
	} finally {
		queryLoading.value = false;
	}
}

// 加载数据
async function loadData() {
	try {
		// 加载项目分布统计
		const projectRes = await getProjectDistribution();
		// console.log(projectRes);

		projectCount.value = {
			projectDistribution: projectRes.maintenanceNum || 0,
			customerDistribution: projectRes.customerNum || 0,
			noProjectCustomerDistribution: projectRes.noCustomerNum || 0,
		};
		let list = projectRes.maintenanceList || [];
		//取projectAddress字段，如果valueincludes了'省'则以省为最后一个字，截取前面的全部字符，‘四川省成都市’，取'四川'
		list = list.map((item: any) => {
			if (item.projectAddress.includes("省")) {
				return item.projectAddress.substring(0, item.projectAddress.indexOf("省") + 1);
			}
			//
			return item.projectAddress;
		});
		//console.log(list);

		mapList.value = list;

		// 加载地图图标数据(替换原有逻辑)
		try {
			const mapIconRes = await getMapIcon();
			let mapIconList = [];
			if (Array.isArray(mapIconRes)) {
				mapIconList = mapIconRes;
			} else if (mapIconRes && mapIconRes.data && Array.isArray(mapIconRes.data)) {
				mapIconList = mapIconRes.data;
			} else if (mapIconRes && mapIconRes.rows && Array.isArray(mapIconRes.rows)) {
				mapIconList = mapIconRes.rows;
			}

			// 过滤有经纬度的数据并转换为地图需要的格式
			mapData.value.projectDistribution = mapIconList
				.filter((item: any) => item.longitude && item.latitude)
				.map((item: any) => ({
					name: item.customerName || item.projectName || "未知项目",
					value: [Number(item.longitude), Number(item.latitude)],
					// 保留原始数据以备后用
					originalData: item,
				}));
			// console.log('地图打点数据:', mapData.value.projectDistribution);
		} catch (error) {
			console.error("加载地图图标数据失败:", error);
		}

		// 加载运维团队统计
		const teamRes = await getTeamStatistics();
		//console.log(teamRes);

		teamStats.value = {
			personnelCount: teamRes.maintenanceNum || 0,
			expertCount: teamRes.expertNum || 0,
		};

		// 加载巡检统计
		const inspectionRes = await getInspectionStatistics();
		//console.log(inspectionRes);

		inspectionStats.value = {
			totalCount: inspectionRes.inspectionNum || 0,
			transferToRepairCount: inspectionRes.inspectionhandleNum || 0,
			qualifiedCount: inspectionRes.inspectioPassNum || 0,
		};

		// 报警统计
		const diagnosticCount = await getdiagnosticData();
		console.log(diagnosticCount);

		diagnosticData.value = {
			totalCount: diagnosticCount.alarmCount || 0,
			transferToRepairCount: diagnosticCount.faultCount || 0,
			qualifiedCount: diagnosticCount.repairOrderCount || 0,
		};

		// 加载巡检统计列表数据（用于折线图）
		await loadInspectionData();

		await loadLatestNewsEcharts();

		await loadCompanyQualification();

		// 加载维修工单统计与折线图
		await loadRepairOrderStats();
		await loadRepairOrderChart();
	} catch (error) {
		console.error("加载首页数据失败:", error);
	}
}

// 加载最新消息
async function loadLatestNewsEcharts() {
	try {
		const latestNewsRes = await getLatestNews();

		// 处理数据格式
		let newsData: any[] = [];
		if (Array.isArray(latestNewsRes)) {
			newsData = latestNewsRes;
		} else if (latestNewsRes && latestNewsRes.rows && Array.isArray(latestNewsRes.rows)) {
			newsData = latestNewsRes.rows;
		} else if (latestNewsRes && latestNewsRes.data && Array.isArray(latestNewsRes.data)) {
			newsData = latestNewsRes.data;
		}

		// 只取前5条
		latestNewsList.value = newsData.slice(0, 5);
	} catch (error) {
		console.error("加载最新消息失败:", error);
	}
}

// 加载公司资质
async function loadCompanyQualification() {
	try {
		const qualificationRes = await getCompanyTicket();

		// 处理数据格式
		let qualificationData: any[] = [];
		if (Array.isArray(qualificationRes)) {
			qualificationData = qualificationRes;
		} else if (
			qualificationRes &&
			qualificationRes.rows &&
			Array.isArray(qualificationRes.rows)
		) {
			qualificationData = qualificationRes.rows;
		} else if (
			qualificationRes &&
			qualificationRes.data &&
			Array.isArray(qualificationRes.data)
		) {
			qualificationData = qualificationRes.data;
		}

		// 转换为轮播图需要的格式，并添加域名前缀
		qualificationList.value = qualificationData
			.map((item: any) => ({
				url: addDomainPrefix(item.imageUrl || ""),
			}))
			.filter((item: any) => item.url); // 过滤掉空URL
	} catch (error) {
		console.error("加载公司资质失败:", error);
	}
}

// 格式化消息时间
function formatNewsTime(time: string): string {
	if (!time) return "";
	try {
		const date = new Date(time);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = date.getDate().toString().padStart(2, "0");
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		return `${year}-${month}-${day} ${hours}:${minutes}`;
	} catch (error) {
		return time;
	}
}

// 跳转到消息列表
function goToMessageList() {
	if (isPermitted("非运维客户")) {
		showPermissionDialog();
		return;
	}
	router.push({
		path: "/pages/message/index",
	});
}

// 点击消息项，跳转到详情页（参考 handleItemClick）
function handleNewsClick(item: any) {
	router.push({
		path: "/pages/message/detail",
		query: {
			id: item.id,
		},
	});
}

// ---------------- 维修工单统计/折线图 ----------------
async function loadRepairOrderStats() {
	try {
		const res = await getRepairOrderCount();
		const data = res || {};
		repairOrderStats.value = {
			handled: Number(data.handledRepairOrderCount) || 0,
			wait: Number(data.waitRepairOrderCount) || 0,
			avgTime: data.repairOrderAvgTime || 0,
			avgScore: Number(data.repairOrderAvgScore) || 0,
		};
	} catch (error) {
		console.error("加载维修工单统计失败:", error);
	}
}

function formatCategoryLabel(item: any, index: number): string {
	const candidate =
		item.date ||
		item.statDate ||
		item.inspectionDate ||
		item.day ||
		item.time ||
		item.createTime ||
		item.label ||
		item.name;

	if (candidate) {
		const d = dayjs(candidate);
		if (d.isValid()) {
			return d.format("MM-DD");
		}
		return String(candidate);
	}
	return `第${index + 1}天`;
}

async function loadRepairOrderChart() {
	try {
		const yearMonth = repairOrderDate.value || getRepairOrderDefaultText();
		const res = await getRepairOrderCountLine({
			yearMonth: yearMonth,
			type: repairOrderDateType.value,
		});
		if (Array.isArray(res)) {
			const list = res || [];
			const categories = list.map((item, idx) => {
				const label = formatCategoryLabel(item, idx);
				// 如果是年模式，尝试将 "MM-DD" 转为 "M月"，或重新格式化原始日期
				if (repairOrderDateType.value === 2) {
					// 尝试从 item 中获取原始日期
					const rawDate = item.date || item.statDate || item.time;
					if (rawDate && dayjs(rawDate).isValid()) {
						return dayjs(rawDate).format("M月");
					}
				}
				return label;
			});
			const handledArr = list.map((item) => Number(item.handledRepairOrderCount) || 0);
			const avgScoreArr = list.map((item) => Number(item.waitRepairOrderCount) || 0);

			repairOrderChartData.value = {
				categories,
				series: [
					{ name: "已处理工单", data: handledArr },
					{ name: "待维修工单", data: avgScoreArr },
				],
			};
			return;
		}

		// 对象格式
		const dataObj = res?.data || res || {};
		const handledMap = dataObj.handledRepairOrderCount || {};
		const avgScoreMap = dataObj.waitRepairOrderCount || {};

		// 收集所有日期
		const dateSet = new Set<string>([...Object.keys(handledMap), ...Object.keys(avgScoreMap)]);

		// 转换并排序日期
		const categories = Array.from(dateSet)
			.sort((a, b) => {
				const da = dayjs(a).isValid() ? dayjs(a).valueOf() : a.localeCompare(b);
				const db = dayjs(b).isValid() ? dayjs(b).valueOf() : a.localeCompare(b);
				return da - db;
			})
			.map((d, idx) => {
				const dd = dayjs(d);
				if (!dd.isValid()) return d || `第${idx + 1}天`;
				// 根据查询类型格式化日期
				if (repairOrderDateType.value === 2) {
					return dd.format("M月");
				}

				return dd.format("MM-DD");
			});

		const orderedDates = Array.from(dateSet).sort((a, b) => {
			const da = dayjs(a).isValid() ? dayjs(a).valueOf() : a.localeCompare(b);
			const db = dayjs(b).isValid() ? dayjs(b).valueOf() : a.localeCompare(b);
			return da - db;
		});

		const handledArr = orderedDates.map((d) => Number(handledMap[d]) || 0);
		const avgScoreArr = orderedDates.map((d) => Number(avgScoreMap[d]) || 0);

		repairOrderChartData.value = {
			categories,
			series: [
				{ name: "已处理工单", data: handledArr },
				{ name: "待维修工单", data: avgScoreArr },
			],
		};
	} catch (error) {
		console.error("加载维修工单折线图失败:", error);
	}
}

// 处理图表数据
const inspectionChartData = ref<{
	categories: string[];
	series: Array<{
		name: string;
		data: number[];
	}>;
}>({
	categories: [],
	series: [
		{
			name: "巡检总数",
			data: [],
		},
		{
			name: "巡检转维修数",
			data: [],
		},
		{
			name: "巡检任务合格数",
			data: [],
		},
	],
});

// 加载巡检统计数据
async function loadInspectionData() {
	try {
		const yearMonth = searchMonth.value || getInspectionDefaultText();
		// 加载巡检统计列表数据（用于折线图）
		const res = await getInspectionStatisticsList({
			yearMonth: yearMonth, // 传递年月参数
			type: inspectionDateType.value,
		});
		console.log("巡检统计列表数据:", res);

		const data = res || {};
		const countMap = data.inspectionCount || {};
		const repairMap = data.inspectionToRepairCount || {};
		const qualifiedMap = data.inspectionQualifiedCount || {};

		// 收集所有日期
		const dateSet = new Set([
			...Object.keys(countMap),
			...Object.keys(repairMap),
			...Object.keys(qualifiedMap),
		]);

		// 转换并排序日期
		const sortedDates = Array.from(dateSet).sort((a, b) => {
			const da = dayjs(a).isValid() ? dayjs(a).valueOf() : a.localeCompare(b);
			const db = dayjs(b).isValid() ? dayjs(b).valueOf() : a.localeCompare(b);
			return da - db;
		});

		// 格式化日期
		const categories = sortedDates.map((date) => {
			const d = dayjs(date);
			if (d.isValid()) {
				// 如果是年视图且日期看起来像月份（YYYY-MM），或者日期是YYYY-MM-DD但我们想显示月份
				if (inspectionDateType.value === 2) {
					// 假设返回的是YYYY-MM或YYYY-MM-DD
					return d.format("M月");
				}
				return d.format("MM.DD");
			}
			return date;
		});

		// 提取数据
		const seriesData1 = sortedDates.map((d) => Number(countMap[d]) || 0);
		const seriesData2 = sortedDates.map((d) => Number(repairMap[d]) || 0);
		const seriesData3 = sortedDates.map((d) => Number(qualifiedMap[d]) || 0);

		inspectionChartData.value = {
			categories,
			series: [
				{
					name: "巡检总数",
					data: seriesData1,
				},
				{
					name: "巡检转维修数",
					data: seriesData2,
				},
				{
					name: "巡检任务合格数",
					data: seriesData3,
				},
			],
		};
	} catch (error) {
		console.error("加载巡检统计数据失败:", error);
	}
}

// 故障报修
function handleRepair() {
	router.push({
		path: "/pages_auto/repair/report/index",
	});
}

// 技术查询
function handleTechQuery() {
	router.push({
		path: "/pages/TecLibrary/index",
	});
}

// 点击运维项目
function handleProjectClick() {
	router.push({
		path: "/pages/home/projectDistribution/index",
		query: {
			type: "project",
		},
	});
}

// 点击运维客户
function handleCustomerClick() {
	const userInfo = user.info;
	const isNonOpsCustomer =
		userInfo?.roles?.some((role: any) => {
			if (!role) return false;
			return role.roleName === "非运维客户";
		}) ?? false;
	if (isNonOpsCustomer) return;
	router.push({
		path: "/pages/home/projectDistribution/index",
		query: {
			type: "customer",
		},
	});
}

// 点击非运维客户
function handleUnCustomerClick() {
	router.push({
		path: "/pages/home/projectDistribution/index",
		query: {
			type: "unCustomer",
		},
	});
}

// 维修工单查询按钮点击事件
async function handleRepairOrderQuery() {
	if (!repairOrderDate.value) {
		uni.showToast({
			title: "请选择时间",
			icon: "none",
		});
		return;
	}

	repairOrderQueryLoading.value = true;
	try {
		await loadRepairOrderChart();
		uni.showToast({
			title: "查询成功",
			icon: "success",
		});
	} catch (error) {
		console.error("查询失败:", error);
		uni.showToast({
			title: "查询失败",
			icon: "none",
		});
	} finally {
		repairOrderQueryLoading.value = false;
	}
}

// 刷新数据的方法
async function refreshData() {
	await loadData();
}

onMounted(() => {
	refreshData();
});

// 暴露刷新方法供父组件调用
defineExpose({
	refreshData,
});
</script>

<style lang="scss" scoped>
$gap: 24rpx;

:deep(.cl-popup) {
	margin-bottom: 3rem !important;
}

.top-img {
	height: 3rem !important;
	width: 4rem !important;
}

.leader-home {
	background-color: #f6f7fa;
	min-height: 100vh;
	padding-bottom: 160rpx; // 为底部 tabbar 留出空间
}

.title {
	font-size: 48rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: $gap * 1.5;
}

// 操作按钮
.action-buttons {
	display: flex;
	gap: $gap;
	margin-bottom: $gap * 1.5;
}

.action-btn {
	flex: 1;
	height: 120rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

	&.repair-btn {
		background: linear-gradient(135deg, #667eea 0%, #24a2fb 70%);
	}

	&.query-btn {
		background: linear-gradient(135deg, #667eea 0%, #24a2fb 70%);
	}

	.btn-icon {
		font-size: 48rpx;
	}

	.btn-text {
		font-size: 28rpx;
		color: #fff;
		font-weight: 500;
	}
}

// 通用区块样式
.section {
	background-color: #fff;
	border-radius: 24rpx;
	padding: $gap;
	margin-bottom: $gap;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.date-filter {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.time-box {
	display: flex;
	align-items: center;
	background-color: #f6f7fa;
	border-radius: 10rpx;
	padding: 4rpx;
}

.time-box > view {
	padding: 6rpx 14rpx;
	font-size: 24rpx;
	color: #666;
	border-radius: 8rpx;
}

.time-act {
	background-color: #fff;
	color: #4165d7;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08);
}

.date-selector {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 16rpx;
	background-color: #f6f7fa;
	border-radius: 8rpx;
	min-width: 105rpx;
	justify-content: space-between;
}

.date-text {
	font-size: 26rpx;
	color: #333;
}

// 日期选择器弹窗层级修复
:deep(.inspection-date-picker) {
	// 提高弹窗层级，确保在 tabbar 之上
	.cl-popup__wrapper {
		z-index: 9999 !important;
	}

	.cl-popup__modal {
		z-index: 9998 !important;
	}

	// 确保弹窗底部有足够空间，不被 tabbar 遮挡
	.cl-popup {
		max-height: calc(100vh - 120rpx) !important; // 减去 tabbar 高度
		margin-bottom: 120rpx !important; // 为 tabbar 留出空间
	}

	// 确保底部按钮区域可见且固定在底部
	.cl-select-popup__footer {
		position: sticky !important;
		bottom: 0 !important;
		background-color: #fff !important;
		z-index: 10000 !important;
		padding: 24rpx !important;
		border-top: 1rpx solid #f1f1f1 !important;
		box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05) !important;
	}

	// 弹窗容器确保有足够高度和滚动
	.cl-select-popup__wrap {
		max-height: calc(100vh - 200rpx) !important; // 减去 header 和 footer 高度
		display: flex !important;
		flex-direction: column !important;
	}

	// 确保滚动区域正确
	.cl-select-popup__container {
		flex: 1 !important;
		overflow-y: auto !important;
	}
}

// 维修工单日期选择器弹窗层级修复
:deep(.repair-order-date-picker) {
	// 提高弹窗层级，确保在 tabbar 之上
	.cl-popup__wrapper {
		z-index: 9999 !important;
	}

	.cl-popup__modal {
		z-index: 9998 !important;
	}

	// 确保弹窗底部有足够空间，不被 tabbar 遮挡
	.cl-popup {
		max-height: calc(100vh - 120rpx) !important; // 减去 tabbar 高度
		margin-bottom: 120rpx !important; // 为 tabbar 留出空间
	}

	// 确保底部按钮区域可见且固定在底部
	.cl-select-popup__footer {
		position: sticky !important;
		bottom: 0 !important;
		background-color: #fff !important;
		z-index: 10000 !important;
		padding: 24rpx !important;
		border-top: 1rpx solid #f1f1f1 !important;
		box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05) !important;
	}

	// 弹窗容器确保有足够高度和滚动
	.cl-select-popup__wrap {
		max-height: calc(100vh - 200rpx) !important; // 减去 header 和 footer 高度
		display: flex !important;
		flex-direction: column !important;
	}

	// 确保滚动区域正确
	.cl-select-popup__container {
		flex: 1 !important;
		overflow-y: auto !important;
	}
}

// 最新消息模块
.more-btn {
	display: flex;
	align-items: center;
	gap: 4rpx;
	cursor: pointer;
}

.more-text {
	font-size: 26rpx;
	color: #666;
}

.news-list {
	display: flex;
	flex-direction: column;
	gap: 0;
}

.news-item {
	display: flex;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #f1f1f1;
	cursor: pointer;
	transition: background-color 0.2s;

	&:last-child {
		border-bottom: none;
	}

	&:active {
		background-color: #f8f9fa;
	}
}

.news-type-tag {
	background-color: #f0f0f0;
	color: #666;
	font-size: 22rpx;
	padding: 4rpx 12rpx;
	border-radius: 4rpx;
	white-space: nowrap;
	flex-shrink: 0;
	margin-right: 16rpx;
	width: 140rpx; // 固定标签宽度，防止标题位移
	text-align: center;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.news-content {
	flex: 1;
	min-width: 0;
	margin-right: 16rpx;
}

.news-title {
	font-size: 28rpx;
	color: #333;
	line-height: 1.5;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.news-time {
	font-size: 24rpx;
	color: #999;
	white-space: nowrap;
	flex-shrink: 0;
}

// 公司资质模块
.qualification-banner {
	width: 100%;
	margin-top: $gap;
}

.empty-qualification {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 80rpx 0;
	margin-top: $gap;

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
}

// 项目分布
.stats-row {
	display: flex;
	justify-content: space-around;
	margin-bottom: $gap;
}

.stat-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
	flex: 1;
	cursor: pointer;
	transition: opacity 0.2s;

	&:active {
		opacity: 0.7;
	}
}

.stat-icon {
	font-size: 36rpx;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6rpx;
}

.stat-content {
	display: flex;
	align-items: flex-end;
	flex: 1;
}

.stat-value {
	font-size: 44rpx;
	font-weight: 600;
	color: #333;
	line-height: 1.2;
}

.stat-label {
	font-size: 24rpx;
	color: #666;
	line-height: 1.2;
}

.map-container {
	width: 100%;
	height: 600rpx;
	border-radius: 16rpx;
	overflow: hidden;
	background-color: #f8fcff;
}

// 运维团队
.team-stats {
	display: flex;
	justify-content: space-around;
}

.team-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.team-icon {
	font-size: 40rpx;
	margin-bottom: 4rpx;
}

.team-value {
	font-size: 40rpx;
	font-weight: 600;
	color: #333;
}

.team-label {
	font-size: 24rpx;
	color: #666;
}

// 巡检统计
.inspection-stats {
	display: flex;
	flex-direction: column;
	gap: $gap;
}

.inspection-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	padding: $gap;
	background-color: #f6f7fa;
	border-radius: 16rpx;
}

.inspection-value {
	font-size: 48rpx;
	font-weight: 600;
	color: #333;
}

.inspection-label {
	font-size: 24rpx;
	color: #666;
	text-align: center;
}

.chart-container {
	width: 100%;
	height: 500rpx;
	margin-top: $gap;
}
</style>

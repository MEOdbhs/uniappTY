<template>
	<cl-page>
		<view class="monitoring-page">
			<!-- 设备预警信息 -->
			<view class="module-card">
				<view class="module-title">
					<view class="title-dot" />
					<text class="title-text">设备预警信息</text>
				</view>

				<view class="warn-stat-grid">
					<view class="warn-stat-item" v-for="item in warnStatCards" :key="item.key">
						<text class="warn-stat-label">{{ item.label }}</text>
						<template v-if="item.key === 'onlineDeviceCount'">
							<view class="online-split online-split-large">
								<text class="online-current">{{
									warnOverview.onlineDeviceCount
								}}</text>
								<text class="online-sep">/</text>
								<text class="online-total">{{
									warnOverview.totalDeviceCount
								}}</text>
							</view>
						</template>
						<template v-else>
							<text class="warn-stat-value" :class="item.valueClass">{{
								item.value
							}}</text>
						</template>
						<text class="warn-stat-sub">{{ item.sub }}</text>
					</view>
				</view>

				<view class="table-wrap">
					<view class="table-head six-cols">
						<text class="col-name">工地名称</text>
						<text>预警总数</text>
						<text>待处置预警</text>
						<text>超时未处置</text>
						<text class="rate-col-head">处置率</text>
						<text class="online-col-head">在线设备</text>
					</view>
					<view v-if="siteWarnList.length === 0" class="empty-tip">暂无数据</view>
					<view
						class="table-row six-cols"
						v-for="(item, index) in siteWarnList"
						:key="item.mineId || index"
					>
						<view class="site-name-cell">
							<view class="site-arrow" />
							<text class="site-name">{{ item.mineName || "-" }}</text>
						</view>
						<text>{{ item.todayWarningCount ?? 0 }}</text>
						<text class="orange">{{ item.waitHandleCount ?? 0 }}</text>
						<text class="red">{{ item.overtimeNotHandleCount ?? 0 }}</text>
						<text class="blue rate-col-value">{{ (item.handleRate ?? 0) + "%" }}</text>
						<view class="online-col-value">
							<view class="online-split">
								<text class="online-current">{{
									item.onlineDeviceCount ?? 0
								}}</text>
								<text class="online-sep">/</text>
								<text class="online-total">{{ item.totalDeviceCount ?? 0 }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 安全检查 | 资产检查 -->
			<view class="module-card">
				<view class="inspect-header">
					<view class="inspect-title-tabs">
						<view class="title-dot" />
						<text
							class="inspect-title-tab"
							:class="{ active: checkType === 1 }"
							@tap="switchCheckType(1)"
							>安全检查</text
						>
						<text class="inspect-sep">|</text>
						<text
							class="inspect-title-tab"
							:class="{ active: checkType === 2 }"
							@tap="switchCheckType(2)"
							>资产检查</text
						>
					</view>

					<!-- 时间维度切换：按照截图做“月度/季度/年度”三段按钮 -->
					<view class="time-range-tabs">
						<text
							class="time-range-tab"
							:class="{ active: timeRange === 1 }"
							@tap="switchTimeRange(1)"
							>月度</text
						>
						<text
							class="time-range-tab"
							:class="{ active: timeRange === 2 }"
							@tap="switchTimeRange(2)"
							>季度</text
						>
						<text
							class="time-range-tab"
							:class="{ active: timeRange === 3 }"
							@tap="switchTimeRange(3)"
							>年度</text
						>
					</view>
				</view>

				<view class="time-picker-row">
					<picker
						mode="date"
						fields="month"
						:value="monthDate"
						@change="onMonthPicked"
						v-if="timeRange === 1"
					>
						<view class="time-picker-trigger">{{ monthDate }}</view>
					</picker>
					<picker
						mode="selector"
						:range="quarterOptions"
						:value="quarterIndex"
						@change="onQuarterPicked"
						v-else-if="timeRange === 2"
					>
						<view class="time-picker-trigger">{{
							quarterOptions[quarterIndex] || "选择季度"
						}}</view>
					</picker>
					<picker
						mode="date"
						fields="year"
						:value="yearDate"
						@change="onYearPicked"
						v-else
					>
						<view class="time-picker-trigger">{{ yearDate }}</view>
					</picker>
				</view>

				<view class="table-wrap">
					<view class="table-head inspect-cols">
						<text>排名</text>
						<text class="col-name">工地名称</text>
						<text>检查状态</text>
						<text>超时时间</text>
						<text>评分</text>
						<text>操作</text>
					</view>
					<view v-if="inspectionList.length === 0" class="empty-tip">暂无数据</view>
					<view
						class="table-row inspect-cols"
						v-for="(item, index) in inspectionList"
						:key="item.id || index"
					>
						<view class="rank-badge" :class="rankClass(index + 1)">{{
							index + 1
						}}</view>
						<text class="site-name">{{ item.mineName || "-" }}</text>
						<text>
							<text class="status-pill" :class="statusClass(item.checkStatusName)">{{
								item.checkStatusName || "-"
							}}</text>
						</text>
						<text>{{ item.timeoutTime || "-" }}</text>
						<text class="score-text">{{ formatScore(item.score) }}</text>
						<text class="action-text" @tap="viewInspection(item)">查看报告</text>
					</view>
				</view>
			</view>

			<!-- 今日施工状态 -->
			<view class="module-card">
				<view class="module-title with-date">
					<view class="module-title-left">
						<view class="title-dot" />
						<text class="title-text">今日施工状态</text>
					</view>
					<picker
						mode="date"
						:value="constructionDate"
						@change="onConstructionDatePicked"
					>
						<view class="date-trigger">{{ constructionDate }}</view>
					</picker>
				</view>

				<view class="status-summary-grid">
					<view
						class="status-summary-item"
						v-for="item in constructionSummaryCards"
						:key="item.key"
						:style="{ backgroundColor: item.color }"
					>
						<text class="status-count">{{ item.count }}</text>
						<text class="status-name">{{ item.label }}</text>
					</view>
				</view>

				<view class="table-wrap">
					<view class="table-head three-cols">
						<text class="col-name">工地名称</text>
						<text>施工状态</text>
						<text>填报时间</text>
					</view>
					<view v-if="constructionSiteList.length === 0" class="empty-tip">暂无数据</view>
					<view
						class="table-row three-cols"
						v-for="(item, index) in constructionSiteList"
						:key="item.mineId || index"
					>
						<text class="site-name">{{ item.mineName || "-" }}</text>
						<text>
							<text
								class="construction-pill"
								:class="constructionClass(item.statusState)"
								>{{ item.statusState || "-" }}</text
							>
						</text>
						<text>{{ formatFillTime(item.fillTime) }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 查看报告弹层：字段与 PC 端 inspectionManagement/editData.vue 对齐 -->
		<cl-popup v-model="inspectionPopupVisible" direction="bottom" :padding="0" :z-index="1200">
			<view class="inspection-popup">
				<view class="inspection-popup-header">
					<text class="inspection-popup-title">检查报告详情</text>
					<text class="inspection-popup-close" @tap="inspectionPopupVisible = false"
						>关闭</text
					>
				</view>
				<scroll-view scroll-y class="inspection-popup-body">
					<view class="detail-item"
						><text class="label">工地名称：</text
						><text class="value">{{ inspectionDetail.mineName || "-" }}</text></view
					>
					<view class="detail-item"
						><text class="label">检查类型：</text
						><text class="value">{{
							inspectionDetail.checkTypeName || "-"
						}}</text></view
					>
					<view class="detail-item"
						><text class="label">时间范围：</text
						><text class="value">{{
							inspectionDetail.timeRangeName || "-"
						}}</text></view
					>
					<view class="detail-item"
						><text class="label">检查时间：</text
						><text class="value">{{ inspectionDetail.checkTime || "-" }}</text></view
					>
					<view class="detail-item"
						><text class="label">检查状态：</text
						><text class="value">{{
							inspectionDetail.checkStatusName || "-"
						}}</text></view
					>
					<view class="detail-item"
						><text class="label">评分：</text
						><text class="value">{{ formatScore(inspectionDetail.score) }}</text></view
					>
					<view class="detail-item block"
						><text class="label">检查情况：</text
						><text class="value">{{
							inspectionDetail.checkSituation || "-"
						}}</text></view
					>
					<view class="detail-item block"
						><text class="label">整改情况：</text
						><text class="value">{{
							inspectionDetail.rectification || "-"
						}}</text></view
					>
					<view class="detail-item block"
						><text class="label">备注：</text
						><text class="value">{{ inspectionDetail.remarks || "-" }}</text></view
					>

					<view class="attachment-wrap">
						<view class="attach-title">附件</view>
						<view v-if="inspectionImageList.length" class="image-grid">
							<image
								v-for="(item, idx) in inspectionImageList"
								:key="item.path + idx"
								:src="item.url"
								mode="aspectFill"
								class="attach-image"
								@tap="previewInspectionImage(idx)"
							/>
						</view>
						<view v-if="inspectionDocList.length" class="doc-list">
							<view
								class="doc-item"
								v-for="(item, idx) in inspectionDocList"
								:key="item.path + idx"
								@tap="downloadInspectionDoc(item)"
							>
								<text class="doc-name">{{ item.name }}</text>
								<text class="doc-action">下载</text>
							</view>
						</view>
						<view
							v-if="!inspectionImageList.length && !inspectionDocList.length"
							class="empty-tip"
							>暂无附件</view
						>
					</view>
				</scroll-view>
			</view>
		</cl-popup>
	</cl-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import {
	getAssetCheckRanking,
	getDeviceWarnInfoList,
	getInspectionById,
	getTodayConstructionStatus,
} from "./api";

type AnyRecord = Record<string, any>;
type AttachmentItem = { name: string; path: string; url: string };

/**
 * 接收父页面传入的工地筛选值：
 * - 为什么这样做：筛选条件放在 tabs 父层统一管理，后续 4 个 tab 可以共享同一筛选状态；
 * - dataBoard 只负责“根据筛选值请求并渲染”，不再耦合筛选 UI。
 */
const props = defineProps<{
	selectedMineId?: string;
}>();

// 设备预警统计概览
const warnOverview = ref({
	todayWarningCount: 0,
	waitHandleCount: 0,
	overtimeNotHandleCount: 0,
	handleRate: 0,
	onlineDeviceCount: 0,
	totalDeviceCount: 0,
});
const siteWarnList = ref<AnyRecord[]>([]);

// 检查模块查询条件：checkType=1安全检查、2资产检查；timeRange=1月度、2季度、3年度。
const checkType = ref<number>(1);
const timeRange = ref<number>(1);
const inspectionList = ref<AnyRecord[]>([]);

// 时间条件拆分为三个字段，原因是 uni-app 的 picker 在不同模式下值格式不同，分开存可读性更高且不容易串值。
const monthDate = ref<string>(getCurrentMonth());
const yearDate = ref<string>(String(new Date().getFullYear()));
const quarterOptions = ref<string[]>(buildQuarterOptions());
const quarterIndex = ref<number>(getCurrentQuarterIndex(quarterOptions.value));

// 施工状态查询条件
const constructionDate = ref<string>(getTodayYmd());
const constructionSummary = ref({
	normalCount: 0,
	overtimeCount: 0,
	offWorkCount: 0,
	stoppedCount: 0,
	unknownCount: 0,
});
const constructionSiteList = ref<AnyRecord[]>([]);

// 检查报告详情弹层数据
const inspectionPopupVisible = ref(false);
const inspectionDetail = ref<AnyRecord>({});
const inspectionImageList = ref<AttachmentItem[]>([]);
const inspectionDocList = ref<AttachmentItem[]>([]);

const warnStatCards = computed(() => {
	return [
		{
			key: "todayWarningCount",
			label: "预警总数",
			value: warnOverview.value.todayWarningCount,
			sub: "今日累计",
			valueClass: "blue",
		},
		{
			key: "waitHandleCount",
			label: "待处置预警",
			value: warnOverview.value.waitHandleCount,
			sub: "需紧急处置",
			valueClass: "blue",
		},
		{
			key: "overtimeNotHandleCount",
			label: "超时未处置",
			value: warnOverview.value.overtimeNotHandleCount,
			sub: "超时未处理",
			valueClass: "blue",
		},
		{
			key: "handleRate",
			label: "处置率",
			value: `${warnOverview.value.handleRate}%`,
			sub: "今日数据",
			valueClass: "blue",
		},
		{
			key: "onlineDeviceCount",
			label: "在线设备",
			value: `${warnOverview.value.onlineDeviceCount}/${warnOverview.value.totalDeviceCount}`,
			sub: "实时统计",
			valueClass: "blue",
		},
	];
});

const constructionSummaryCards = computed(() => {
	return [
		{
			key: "normalCount",
			label: "正常施工",
			count: constructionSummary.value.normalCount,
			color: "#1dbb84",
		},
		{
			key: "overtimeCount",
			label: "加班施工",
			count: constructionSummary.value.overtimeCount,
			color: "#f6b317",
		},
		{
			key: "offWorkCount",
			label: "下班",
			count: constructionSummary.value.offWorkCount,
			color: "#2c9aff",
		},
		{
			key: "stoppedCount",
			label: "停工",
			count: constructionSummary.value.stoppedCount,
			color: "#ff5a5f",
		},
		{
			key: "unknownCount",
			label: "未知",
			count: constructionSummary.value.unknownCount,
			color: "#8f949a",
		},
	];
});

function switchCheckType(type: number) {
	if (checkType.value === type) return;
	checkType.value = type;
	loadInspectionList();
}

function switchTimeRange(type: number) {
	if (timeRange.value === type) return;
	timeRange.value = type;
	loadInspectionList();
}

function onMonthPicked(e: AnyRecord) {
	monthDate.value = e?.detail?.value || monthDate.value;
	loadInspectionList();
}

function onQuarterPicked(e: AnyRecord) {
	quarterIndex.value = Number(e?.detail?.value ?? quarterIndex.value);
	loadInspectionList();
}

function onYearPicked(e: AnyRecord) {
	yearDate.value = e?.detail?.value || yearDate.value;
	loadInspectionList();
}

function onConstructionDatePicked(e: AnyRecord) {
	constructionDate.value = e?.detail?.value || constructionDate.value;
	loadConstructionStatus();
}

/**
 * 查看报告：
 * 1) 先用列表行 id 调详情接口拿完整字段，避免列表精简字段导致信息缺失；
 * 2) 附件按“图片 / 文档”分组，图片支持放大，文档支持下载。
 */
async function viewInspection(item: AnyRecord) {
	const id = String(item?.id ?? "").trim();
	if (!id) {
		uni.showToast({ title: "缺少记录ID，无法查看", icon: "none" });
		return;
	}

	try {
		uni.showLoading({ title: "加载中..." });
		const res = await getInspectionById(id);
		const data = unwrapPayload<AnyRecord>(res, {});
		inspectionDetail.value = data;
		parseInspectionAttachments(data.mediaUrls);
		inspectionPopupVisible.value = true;
	} catch {
		uni.showToast({ title: "获取详情失败，请稍后重试", icon: "none" });
	} finally {
		uni.hideLoading();
	}
}

// ---------- 数据加载 ----------
async function loadWarnOverview() {
	try {
		const res = await getDeviceWarnInfoList(props.selectedMineId || "");
		const data = unwrapPayload<AnyRecord>(res, {});
		warnOverview.value = {
			todayWarningCount: Number(data.todayWarningCount ?? 0),
			waitHandleCount: Number(data.waitHandleCount ?? 0),
			overtimeNotHandleCount: Number(data.overtimeNotHandleCount ?? 0),
			handleRate: Number(data.handleRate ?? 0),
			onlineDeviceCount: Number(data.onlineDeviceCount ?? 0),
			totalDeviceCount: Number(data.totalDeviceCount ?? 0),
		};
		siteWarnList.value = Array.isArray(data.mineStatList) ? data.mineStatList : [];
	} catch {
		warnOverview.value = {
			todayWarningCount: 0,
			waitHandleCount: 0,
			overtimeNotHandleCount: 0,
			handleRate: 0,
			onlineDeviceCount: 0,
			totalDeviceCount: 0,
		};
		siteWarnList.value = [];
	}
}

async function loadInspectionList() {
	try {
		const checkTime = buildInspectionCheckTime();
		const params: AnyRecord = {
			checkType: checkType.value,
			timeRange: timeRange.value,
			checkTime,
		};
		// 与“顶部工地筛选”保持一致：有选中工地时额外带 mineId，便于后端按工地过滤。
		if (props.selectedMineId) {
			params.mineId = props.selectedMineId;
		}
		const res = await getAssetCheckRanking(params);
		const data = unwrapPayload<any>(res, []);
		inspectionList.value = Array.isArray(data)
			? data
			: Array.isArray(data?.list)
				? data.list
				: [];
	} catch {
		inspectionList.value = [];
	}
}
// 加载施工状态
async function loadConstructionStatus() {
	try {
		let params = {
			checkDate: constructionDate.value,
		};
		if (props.selectedMineId) {
			params.siteCode = props.selectedMineId;
		}
		const res = await getTodayConstructionStatus(params);
		const data = unwrapPayload<AnyRecord>(res, {});
		constructionSummary.value = {
			normalCount: Number(data.normalCount ?? 0),
			overtimeCount: Number(data.overtimeCount ?? 0),
			offWorkCount: Number(data.offWorkCount ?? 0),
			stoppedCount: Number(data.stoppedCount ?? 0),
			unknownCount: Number(data.unknownCount ?? 0),
		};
		constructionSiteList.value = Array.isArray(data.statusList) ? data.statusList : [];
	} catch {
		constructionSummary.value = {
			normalCount: 0,
			overtimeCount: 0,
			offWorkCount: 0,
			stoppedCount: 0,
			unknownCount: 0,
		};
		constructionSiteList.value = [];
	}
}

function loadAllData() {
	// 三块数据互不依赖，分开并发请求可缩短首屏等待时间。
	loadWarnOverview();
	loadInspectionList();
	loadConstructionStatus();
}

onShow(() => {
	loadAllData();
});

// 父层工地筛选变化后立即刷新，保证 4 个 tab 共用筛选时数据始终同步。
watch(
	() => props.selectedMineId,
	() => {
		loadAllData();
	},
);

// ---------- UI 显示辅助 ----------
function rankClass(rank: number) {
	if (rank === 1) return "rank-1";
	if (rank === 2) return "rank-2";
	if (rank === 3) return "rank-3";
	return "rank-other";
}

function statusClass(statusName?: string) {
	const key = String(statusName || "").trim();
	const map: Record<string, string> = {
		已完成: "status-done",
		已检查: "status-done",
		整改中: "status-rectify",
		待检查: "status-pending",
		超时: "status-overtime",
		已超时: "status-overtime",
	};
	return map[key] || "status-pending";
}

function constructionClass(statusName?: string) {
	const key = String(statusName || "").trim();
	const map: Record<string, string> = {
		正常: "cs-normal",
		加班施工: "cs-overtime",
		下班: "cs-offwork",
		停工: "cs-stopped",
		未知: "cs-unknown",
	};
	return map[key] || "cs-unknown";
}

function formatScore(score: any) {
	if (score === null || score === undefined || score === "") return "-";
	return String(score);
}

/**
 * 施工填报时间仅展示“时分秒”，提升列表扫描效率，避免日期重复信息占位。
 */
function formatFillTime(fillTime: string) {
	if (!fillTime) return "-";
	const text = String(fillTime).replace("T", " ");
	const match = text.match(/(\d{2}:\d{2}:\d{2})$/);
	if (match) return match[1];
	if (text.length >= 8) return text.slice(-8);
	return text;
}

/**
 * 解析检查详情附件：
 * - mediaUrls 为逗号分隔路径；
 * - 图片归入可预览列表；
 * - 非图片归入文档列表（点击下载）。
 */
function parseInspectionAttachments(mediaUrls: string) {
	const paths = String(mediaUrls || "")
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);

	const images: AttachmentItem[] = [];
	const docs: AttachmentItem[] = [];
	paths.forEach((path) => {
		const name = fileNameFromPath(path);
		const url = buildDownloadUrl(path);
		const ext = getFileExt(name || path);
		if (isImageExt(ext)) {
			images.push({ name, path, url });
		} else {
			docs.push({ name, path, url });
		}
	});
	inspectionImageList.value = images;
	inspectionDocList.value = docs;
}

function previewInspectionImage(index: number) {
	const urls = inspectionImageList.value.map((item) => item.url).filter(Boolean);
	if (!urls.length) return;
	uni.previewImage({
		urls,
		current: urls[index] || urls[0],
	});
}

function downloadInspectionDoc(item: AttachmentItem) {
	const url = item?.url;
	if (!url) {
		uni.showToast({ title: "附件地址无效", icon: "none" });
		return;
	}

	// #ifdef H5
	const link = document.createElement("a");
	link.href = url;
	link.download = item.name || "附件";
	link.target = "_blank";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	// #endif

	// #ifndef H5
	uni.downloadFile({
		url,
		success: (res) => {
			const filePath = res?.tempFilePath;
			if (!filePath) {
				uni.showToast({ title: "下载失败", icon: "none" });
				return;
			}
			uni.openDocument({
				filePath,
				showMenu: true,
				fail: () => uni.showToast({ title: "文件打开失败", icon: "none" }),
			});
		},
		fail: () => uni.showToast({ title: "下载失败", icon: "none" }),
	});
	// #endif
}

// ---------- 时间工具 ----------
function getTodayYmd() {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, "0");
	const d = String(now.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function getCurrentMonth() {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, "0");
	return `${y}-${m}`;
}

function buildQuarterOptions() {
	const list: string[] = [];
	const year = new Date().getFullYear();
	// 提供 3 年可选范围，兼顾“回看历史季度”与“列表长度不宜过长”两者平衡。
	for (let y = year; y >= year - 2; y -= 1) {
		list.push(`${y}-Q1`, `${y}-Q2`, `${y}-Q3`, `${y}-Q4`);
	}
	return list;
}

function getCurrentQuarterIndex(list: string[]) {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1;
	const quarter = month <= 3 ? "Q1" : month <= 6 ? "Q2" : month <= 9 ? "Q3" : "Q4";
	const current = `${year}-${quarter}`;
	const found = list.findIndex((item) => item === current);
	return found >= 0 ? found : 0;
}

function buildInspectionCheckTime() {
	// 接口约定为 YYYY-MM-01 风格，这里统一转成“该时间维度起始月第一天”，避免后端解析歧义。
	if (timeRange.value === 1) {
		return `${monthDate.value}-01`;
	}
	if (timeRange.value === 2) {
		const quarterText = quarterOptions.value[quarterIndex.value] || "";
		const match = quarterText.match(/^(\d{4})-Q([1-4])$/);
		if (!match) return `${new Date().getFullYear()}-01-01`;
		const year = match[1];
		const quarter = match[2];
		const monthMap: Record<string, string> = { "1": "01", "2": "04", "3": "07", "4": "10" };
		return `${year}-${monthMap[quarter]}-01`;
	}
	return `${yearDate.value}-01-01`;
}

function unwrapPayload<T>(response: any, fallback: T): T {
	if (response && typeof response === "object" && "data" in response) {
		return (response.data ?? fallback) as T;
	}
	return (response ?? fallback) as T;
}

function getFileExt(fileName: string) {
	const clean = String(fileName || "")
		.split("?")[0]
		.split("#")[0];
	return (clean.split(".").pop() || "").toLowerCase();
}

function isImageExt(ext: string) {
	return ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext);
}

function fileNameFromPath(path: string) {
	const clean = String(path || "").replace(/\\/g, "/");
	const seg = clean.split("/").filter(Boolean).pop() || clean;
	return decodeURIComponent(seg);
}

function buildDownloadUrl(path: string) {
	const cleanPath = String(path || "")
		.replace(/\\/g, "/")
		.replace(/^\/+/, "");
	// 与 PC 端上传组件保持同一下载地址拼接规则。
	return `/company/companyApp/file/download?fileName=${cleanPath}&fileUrl=${cleanPath}`;
}
</script>

<style scoped lang="scss">
.monitoring-page {
	margin: -8rpx 20rpx 0;
	padding: 20rpx;
	background: #f6f8fc;
	min-height: calc(100vh - 340rpx);
}

.module-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 18rpx;
	box-shadow: 0 6rpx 20rpx rgba(16, 24, 40, 0.05);
}

.module-title {
	display: flex;
	align-items: center;
	gap: 10rpx;
	margin-bottom: 16rpx;
}

.module-title.with-date {
	justify-content: space-between;
}

.module-title-left {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.title-dot {
	width: 8rpx;
	height: 24rpx;
	background: #2e78ff;
	border-radius: 10rpx;
}

.title-text {
	font-size: 30rpx;
	font-weight: 600;
	color: #1f2937;
}

.warn-stat-grid {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 8rpx;
	margin-bottom: 14rpx;
}

.warn-stat-item {
	background: #f8fafc;
	border-radius: 8rpx;
	padding: 10rpx 6rpx;
	text-align: center;
}

.warn-stat-label {
	display: block;
	font-size: 20rpx;
	color: #4b5563;
}

.warn-stat-value {
	display: block;
	margin-top: 4rpx;
	font-size: 34rpx;
	font-weight: 700;
}

.online-split {
	display: inline-flex;
	align-items: baseline;
}

.online-split-large {
	margin-top: 4rpx;
}

.online-current {
	color: #2e78ff;
	font-size: 30rpx;
	font-weight: 700;
}

.online-split-large .online-current {
	font-size: 34rpx;
}

.online-sep {
	color: #6b7280;
	font-size: 22rpx;
	padding: 0 2rpx;
}

.online-total {
	color: #111827;
	font-size: 26rpx;
	font-weight: 600;
}

.warn-stat-sub {
	display: block;
	margin-top: 2rpx;
	font-size: 18rpx;
	color: #9ca3af;
}

.blue {
	color: #2e78ff;
}

.orange {
	color: #f59e0b;
}

.red {
	color: #ef4444;
}

.table-wrap {
	width: 100%;
	overflow: hidden;
	border-radius: 8rpx;
}

.table-head,
.table-row {
	display: grid;
	align-items: center;
	min-height: 64rpx;
	padding: 0 10rpx;
	box-sizing: border-box;
}

.table-head {
	background: #f3f4f6;
	color: #6b7280;
	font-size: 22rpx;
	font-weight: 600;
}

.table-head.six-cols {
	font-size: 18rpx;
}

.table-head.six-cols > text {
	text-align: center;
	white-space: nowrap;
}

.table-head.six-cols > .col-name {
	text-align: left;
}

.table-row {
	background: #ffffff;
	color: #111827;
	font-size: 24rpx;
	border-bottom: 1rpx solid #f3f4f6;
}

.six-cols {
	/*
		这里把“待处置预警/超时未处置”列宽适度放大：
		原因是这两列标题文案较长，在移动端小屏容易换行。
	*/
	grid-template-columns: 1.7fr 0.9fr 1.2fr 1.2fr 1fr 1fr;
	column-gap: 8rpx;
}

.table-row.six-cols > text {
	text-align: center;
}

.online-col-value {
	display: flex;
	align-items: center;
	justify-content: center;
}

.inspect-cols {
	grid-template-columns: 0.7fr 1.5fr 1.2fr 1fr 0.7fr 0.9fr;
}

.three-cols {
	grid-template-columns: 1.8fr 1fr 1fr;
}

.col-name {
	text-align: left;
}

.site-name-cell {
	display: flex;
	align-items: center;
	min-width: 0;
}

.site-arrow {
	width: 0;
	height: 0;
	border-top: 8rpx solid transparent;
	border-bottom: 8rpx solid transparent;
	border-left: 10rpx solid #2e78ff;
	margin-right: 8rpx;
}

.site-name {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.empty-tip {
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	color: #9ca3af;
	font-size: 24rpx;
}

.inspect-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.inspect-title-tabs {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.inspect-title-tab {
	font-size: 30rpx;
	font-weight: 600;
	color: #9ca3af;
}

.inspect-title-tab.active {
	color: #1f2937;
}

.inspect-sep {
	color: #d1d5db;
}

.time-range-tabs {
	display: flex;
	border: 1rpx solid #2e78ff;
	border-radius: 8rpx;
	overflow: hidden;
}

.time-range-tab {
	height: 50rpx;
	line-height: 50rpx;
	padding: 0 20rpx;
	font-size: 22rpx;
	color: #2e78ff;
	background: #ffffff;
}

.time-range-tab.active {
	color: #ffffff;
	background: #2e78ff;
}

.time-picker-row {
	margin-bottom: 12rpx;
}

.time-picker-trigger,
.date-trigger {
	height: 60rpx;
	line-height: 60rpx;
	padding: 0 16rpx;
	background: #f9fafb;
	border-radius: 8rpx;
	font-size: 24rpx;
	color: #374151;
}

.rank-badge {
	width: 36rpx;
	height: 36rpx;
	line-height: 36rpx;
	text-align: center;
	border-radius: 50%;
	font-size: 20rpx;
	font-weight: 700;
	color: #ffffff;
}

.rank-1 {
	background: #ef4444;
}

.rank-2 {
	background: #f97316;
}

.rank-3 {
	background: #eab308;
}

.rank-other {
	background: #9ca3af;
}

.status-pill {
	display: inline-block;
	min-width: 90rpx;
	text-align: center;
	height: 38rpx;
	line-height: 38rpx;
	border-radius: 6rpx;
	font-size: 20rpx;
	font-weight: 600;
	padding: 0 8rpx;
}

.status-done {
	background: #0fbf71;
	color: #ffffff;
}

.status-rectify {
	background: #f59e0b;
	color: #ffffff;
}

.status-pending {
	background: #e8f1ff;
	color: #2e78ff;
}

.status-overtime {
	background: #fde8e8;
	color: #ef4444;
}

.score-text {
	font-weight: 700;
}

.action-text {
	color: #2e78ff;
}

.status-summary-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10rpx;
	margin-bottom: 14rpx;
}

.status-summary-item {
	border-radius: 10rpx;
	padding: 14rpx 10rpx 14rpx 16rpx;
}

.status-count {
	display: block;
	font-size: 40rpx;
	font-weight: 700;
	line-height: 1;
	color: #ffffff;
}

.status-name {
	display: block;
	margin-top: 6rpx;
	font-size: 22rpx;
	color: #ffffff;
}

.construction-pill {
	display: inline-block;
	min-width: 90rpx;
	text-align: center;
	height: 38rpx;
	line-height: 38rpx;
	border-radius: 6rpx;
	font-size: 20rpx;
	font-weight: 600;
	padding: 0 8rpx;
}

.cs-normal {
	background: #1dbb84;
	color: #ffffff;
}

.cs-overtime {
	background: #f6b317;
	color: #ffffff;
}

.cs-offwork {
	background: #2c9aff;
	color: #ffffff;
}

.cs-stopped {
	background: #ff5a5f;
	color: #ffffff;
}

.cs-unknown {
	background: #8f949a;
	color: #ffffff;
}

/* 查看报告弹层 */
.inspection-popup {
	background: #ffffff;
	border-radius: 24rpx 24rpx 0 0;
	max-height: 90vh;
}

.inspection-popup-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	border-bottom: 1rpx solid #f3f4f6;
}

.inspection-popup-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #111827;
}

.inspection-popup-close {
	font-size: 24rpx;
	color: #2e78ff;
}

.inspection-popup-body {
	max-height: 76vh;
	/*
		底部额外留白的原因：
		项目里 tabbar 是固定在底部的，弹层滚动到最后一项时需要预留空间，
		避免“最后几条详情/附件操作区”与底部菜单重叠后不可见。
	*/
	padding: 20rpx 24rpx 160rpx;
	box-sizing: border-box;
}

.detail-item {
	display: flex;
	margin-bottom: 12rpx;
	font-size: 24rpx;
	line-height: 38rpx;
}

.detail-item .label {
	color: #6b7280;
	flex-shrink: 0;
}

.detail-item .value {
	color: #111827;
}

.detail-item.block {
	display: block;
}

.attachment-wrap {
	margin-top: 16rpx;
	padding-top: 14rpx;
	border-top: 1rpx solid #f3f4f6;
}

.attach-title {
	font-size: 26rpx;
	font-weight: 600;
	color: #111827;
	margin-bottom: 12rpx;
}

.image-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10rpx;
	margin-bottom: 12rpx;
}

.attach-image {
	width: 100%;
	height: 180rpx;
	border-radius: 8rpx;
	background: #f3f4f6;
}

.doc-list {
	background: #f9fafb;
	border-radius: 10rpx;
	padding: 6rpx 10rpx;
}

.doc-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 60rpx;
}

.doc-name {
	flex: 1;
	color: #374151;
	font-size: 24rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding-right: 12rpx;
}

.doc-action {
	color: #2e78ff;
	font-size: 22rpx;
}
</style>

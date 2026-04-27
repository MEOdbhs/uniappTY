<template>
	<cl-page>
		<view class="import-page">
			<view class="panel-title">导入信息</view>

			<view class="field-row" @tap="openMinePicker">
				<text class="field-label">选择工地：</text>
				<view class="field-value-wrap">
					<text class="field-value">{{ selectedMineName || "请选择工地" }}</text>
					<uni-icons type="bottom" size="16" color="#9ca3af" />
				</view>
			</view>

			<view class="field-row" @tap="openDevicePopup">
				<text class="field-label">选择设备：</text>
				<view class="field-value-wrap">
					<text class="field-value">{{ selectedDeviceName || "请选择设备" }}</text>
					<uni-icons type="search" size="17" color="#9ca3af" />
				</view>
			</view>

			<view class="upload-section">
				<text class="section-title">上传数据</text>
				<view class="upload-box" @tap="chooseExcelFile">
					<text class="upload-plus">+</text>
					<text class="upload-text">{{
						selectedFile ? selectedFile.name : "添加Excel文件（.xlsx/.xls）"
					}}</text>
				</view>
				<view v-if="selectedFile" class="file-meta">
					<text>文件大小：{{ formatFileSize(selectedFile.size) }}</text>
				</view>
			</view>

			<button class="submit-btn" @tap="submitImport">提交导入</button>

			<view class="history-section">
				<view class="history-head">
					<text class="history-title">历史导入记录</text>
					<text class="history-all" @tap="toggleShowAll">{{
						showAllHistory ? "收起" : "全部"
					}}</text>
				</view>
				<view v-if="historyListToShow.length === 0" class="empty-tip">暂无记录</view>
				<view v-else>
					<view
						v-for="(item, index) in historyListToShow"
						:key="item.id + index"
						class="history-row"
					>
						<view class="history-icon">
							<uni-icons type="paperclip" size="16" color="#98a2b3" />
						</view>
						<view class="history-info">
							<text class="history-name">{{ item.fileName }}</text>
							<text class="history-meta"
								>{{ formatDateTime(item.importDt) }} ·
								{{ formatFileSize(Number(item.fileSize || 0)) }}</text
							>
						</view>
					</view>
				</view>
			</view>
		</view>

		<cl-popup v-model="devicePopupVisible" direction="bottom" :padding="0" :z-index="1200">
			<view class="device-popup">
				<view class="device-popup-header">
					<text class="popup-title">选择设备</text>
					<text class="popup-close" @tap="devicePopupVisible = false">关闭</text>
				</view>
				<view class="device-search-row">
					<uni-icons type="search" size="16" color="#9ca3af" />
					<input
						v-model.trim="deviceKeyword"
						class="device-search-input"
						placeholder="输入设备名称过滤"
						placeholder-class="device-search-placeholder"
					/>
				</view>
				<scroll-view scroll-y class="device-list-scroll">
					<view
						v-for="item in filteredDeviceList"
						:key="String(item.id)"
						class="device-item"
						@tap="selectDevice(item)"
					>
						<text class="device-item-name">{{ item.deviceName || "-" }}</text>
						<text class="device-item-meta">{{
							item.deviceCode || item.model || "未配置设备编码"
						}}</text>
					</view>
					<view v-if="!filteredDeviceList.length" class="empty-tip">暂无可选设备</view>
				</scroll-view>
			</view>
		</cl-popup>
	</cl-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
	getDeviceArchiveList,
	getImportMonitorDataRecord,
	getManualMineList,
	importManualMonitorData,
	normalizeManualMineList,
	parseListResult,
	type DeviceArchiveItem,
	type ImportMonitorDataRecordItem,
	type ManualMineItem,
} from "../api";

interface LocalFile {
	name: string;
	size: number;
	path: string;
}

const mineList = ref<ManualMineItem[]>([]);
const selectedMineSiteCode = ref("");
const selectedMineName = ref("");
const deviceList = ref<DeviceArchiveItem[]>([]);
const devicePopupVisible = ref(false);
const deviceKeyword = ref("");
const selectedDeviceId = ref("");
const selectedDeviceCode = ref("");
const selectedDeviceName = ref("");
const selectedFile = ref<LocalFile | null>(null);
const showAllHistory = ref(false);
const historyList = ref<ImportMonitorDataRecordItem[]>([]);
const submitting = ref(false);

const historyListToShow = computed(() => {
	if (showAllHistory.value) return historyList.value;
	return historyList.value.slice(0, 3);
});

const filteredDeviceList = computed(() => {
	const kw = deviceKeyword.value.trim().toLowerCase();
	if (!kw) return deviceList.value;
	return deviceList.value.filter((item) => {
		const name = String(item.deviceName || "").toLowerCase();
		const code = String(item.deviceCode || "").toLowerCase();
		return name.includes(kw) || code.includes(kw);
	});
});

onLoad(() => {
	loadMineList();
});

/**
 * 统一解析工地展示名：
 * - 后端在不同环境可能返回 mineName/siteName/projectName 其一；
 * - 这里集中兜底，避免模板层散落多字段判断，降低维护复杂度。
 */
function getMineLabel(item: ManualMineItem) {
	return String(item.mineName || item.siteName || item.projectName || "-");
}

/**
 * 按你确认的规则解析设备筛选 siteCode：
 * - 优先使用接口返回的 siteCode；
 * - 缺失时回退 mineId（再兜底 id），保证老数据也可联动设备查询。
 */
function getMineSiteCode(item: ManualMineItem) {
	const code = item.siteCode ?? item.mineId ?? item.id ?? "";
	return String(code);
}

async function loadMineList() {
	try {
		const res = await getManualMineList();
		/**
		 * 这里保留原始输出是为了满足你“先调接口、查看格式”的诉求：
		 * - 便于你直接在控制台确认字段命名；
		 * - 也便于后续若字段调整，第一时间定位差异来源。
		 */
		console.log("[monitoringData] listMineAllData raw response:", res);
		/**
		 * 这里改用工地专用归一化器的原因：
		 * - 你确认了接口返回是对象映射（siteCode -> 工地名称）；
		 * - 用专用转换可确保 ActionSheet 一定拿到数组，不受返回形态影响。
		 */
		mineList.value = normalizeManualMineList(res);
	} catch {
		mineList.value = [];
		uni.showToast({ title: "工地列表加载失败", icon: "none" });
	}
}

function openMinePicker() {
	const names = mineList.value.map((item) => getMineLabel(item));
	if (!names.length) {
		uni.showToast({ title: "暂无可选工地", icon: "none" });
		return;
	}
	uni.showActionSheet({
		itemList: names,
		success: ({ tapIndex }) => {
			const chosen = mineList.value[tapIndex] || {};
			selectedMineSiteCode.value = getMineSiteCode(chosen);
			selectedMineName.value = getMineLabel(chosen);
			selectedDeviceId.value = "";
			selectedDeviceCode.value = "";
			selectedDeviceName.value = "";
			historyList.value = [];
			loadDeviceList();
			loadHistoryList();
		},
	});
}

async function loadDeviceList() {
	if (!selectedMineSiteCode.value) {
		deviceList.value = [];
		return;
	}
	try {
		const res = await getDeviceArchiveList({
			page: 1,
			size: 500,
			siteCode: selectedMineSiteCode.value,
		});
		deviceList.value = parseListResult<DeviceArchiveItem>(res);
	} catch {
		deviceList.value = [];
		uni.showToast({ title: "设备列表加载失败", icon: "none" });
	}
}

async function openDevicePopup() {
	if (!selectedMineSiteCode.value) {
		uni.showToast({ title: "请先选择工地", icon: "none" });
		return;
	}
	if (!deviceList.value.length) {
		await loadDeviceList();
	}
	deviceKeyword.value = "";
	devicePopupVisible.value = true;
}

function selectDevice(item: DeviceArchiveItem) {
	selectedDeviceId.value = String(item.id ?? "");
	selectedDeviceCode.value = String(item.deviceCode || "");
	selectedDeviceName.value = String(item.deviceName || item.deviceCode || "-");
	devicePopupVisible.value = false;
	loadHistoryList();
}

async function loadHistoryList() {
	if (!selectedMineSiteCode.value) {
		historyList.value = [];
		return;
	}
	try {
		const res = await getImportMonitorDataRecord({
			// 按你的最新规则：历史记录按工地查询，仅传 siteCode，不再传 id。
			siteCode: selectedMineSiteCode.value,
			page: 1,
			size: 200,
		});
		historyList.value = parseListResult<ImportMonitorDataRecordItem>(res);
	} catch {
		historyList.value = [];
		uni.showToast({ title: "导入记录加载失败", icon: "none" });
	}
}

function chooseExcelFile() {
	/**
	 * 真机兼容性说明：
	 * - 你当前报错的根因是运行环境不存在 uni.chooseFile（函数未实现）；
	 * - 因此这里改为“能力探测 + 多方案兜底”，避免再次触发 TypeError 导致页面事件中断。
	 */
	const uniAny = uni as any;
	const chooseFileApi = uniAny?.chooseFile;
	const chooseMessageFileApi = uniAny?.chooseMessageFile;

	const onPickSuccess = (res: any) => {
		const file = res?.tempFiles?.[0];
		if (!file) return;
		const rawPath = String(file.path || file.tempFilePath || "");
		const fallbackName = rawPath.split("/").pop() || rawPath.split("\\").pop() || "未命名文件";
		const name = String(file.name || fallbackName);
		const lowerName = name.toLowerCase();
		if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xls")) {
			uni.showToast({ title: "仅支持Excel文件", icon: "none" });
			return;
		}
		selectedFile.value = {
			name,
			size: Number(file.size || 0),
			path: rawPath,
		};
	};

	if (typeof chooseFileApi === "function") {
		chooseFileApi({
			count: 1,
			type: "all",
			success: onPickSuccess,
			fail: () => {
				uni.showToast({ title: "文件选择失败", icon: "none" });
			},
		});
		return;
	}

	if (typeof chooseMessageFileApi === "function") {
		chooseMessageFileApi({
			count: 1,
			type: "file",
			success: onPickSuccess,
			fail: () => {
				uni.showToast({ title: "文件选择失败", icon: "none" });
			},
		});
		return;
	}

	uni.showModal({
		title: "当前环境不支持",
		content: "当前真机基座不支持文件选择接口，请升级运行基座后重试。",
		showCancel: false,
	});
}

async function submitImport() {
	if (!selectedMineSiteCode.value) {
		uni.showToast({ title: "请选择工地", icon: "none" });
		return;
	}
	if (!selectedDeviceId.value) {
		uni.showToast({ title: "请选择设备", icon: "none" });
		return;
	}
	if (!selectedFile.value) {
		uni.showToast({ title: "请上传Excel文件", icon: "none" });
		return;
	}
	if (!selectedDeviceCode.value) {
		uni.showToast({ title: "当前设备缺少编码，无法导入", icon: "none" });
		return;
	}
	if (submitting.value) return;

	submitting.value = true;
	try {
		await importManualMonitorData({
			deviceCode: selectedDeviceCode.value,
			siteCode: selectedMineSiteCode.value,
			filePath: selectedFile.value.path,
			fileName: selectedFile.value.name,
		});
		uni.showToast({ title: "导入成功", icon: "success" });
		loadHistoryList();
	} catch (err: any) {
		uni.showToast({ title: err?.message || "导入失败", icon: "none" });
	} finally {
		submitting.value = false;
	}
}

function toggleShowAll() {
	showAllHistory.value = !showAllHistory.value;
}

function formatFileSize(size: number) {
	if (!size) return "0B";
	if (size < 1024) return `${size}B`;
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
	return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDateTime(value?: string) {
	if (!value) return "-";
	return String(value).replace("T", " ");
}
</script>

<style scoped lang="scss">
.import-page {
	margin: 16rpx 20rpx 0;
	padding: 20rpx;
	background: linear-gradient(180deg, #f6f8fc 0%, #ffffff 100%);
	border-radius: 21rpx;
	border: 2rpx solid #ffffff;
	min-height: calc(100vh - 220rpx);
}

.panel-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #303133;
	margin-bottom: 10rpx;
}

.field-row {
	height: 84rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1rpx solid #eef1f6;
}

.field-label {
	font-size: 25rpx;
	font-weight: 600;
	color: #303133;
}

.field-value-wrap {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.field-value {
	max-width: 360rpx;
	font-size: 24rpx;
	color: #606266;
	text-align: right;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.upload-section {
	margin-top: 20rpx;
}

.section-title {
	display: block;
	font-size: 28rpx;
	font-weight: 700;
	color: #303133;
	margin-bottom: 14rpx;
}

.upload-box {
	height: 132rpx;
	border: 2rpx dashed #d9e2f4;
	border-radius: 12rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #ffffff;
}

.upload-plus {
	font-size: 44rpx;
	line-height: 1;
	color: #c0c4cc;
}

.upload-text {
	margin-top: 8rpx;
	font-size: 22rpx;
	color: #909399;
	padding: 0 16rpx;
	text-align: center;
}

.file-meta {
	margin-top: 10rpx;
	font-size: 21rpx;
	color: #98a2b3;
}

.submit-btn {
	margin-top: 28rpx;
	height: 84rpx;
	line-height: 84rpx;
	background: #4474ff;
	border-radius: 42rpx;
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 500;
	border: 2rpx solid #ffffff;
	box-shadow: 0 4rpx 10rpx rgba(68, 116, 255, 0.3);
}

.submit-btn::after {
	border: none;
}

.history-section {
	margin-top: 24rpx;
	padding-top: 8rpx;
	border-top: 1rpx solid #edf0f6;
}

.history-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.history-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #303133;
}

.history-all {
	font-size: 27rpx;
	color: #4474ff;
}

.history-row {
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
	padding: 18rpx 0;
	border-bottom: 1rpx solid #f0f2f7;
}

.history-icon {
	padding-top: 4rpx;
}

.history-info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.history-name {
	font-size: 26rpx;
	font-weight: 600;
	color: #101828;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.history-meta {
	font-size: 23rpx;
	font-weight: 500;
	color: #98a2b3;
}

.device-popup {
	background: #ffffff;
	border-radius: 24rpx 24rpx 0 0;
	max-height: 80vh;
}

.device-popup-header {
	height: 84rpx;
	padding: 0 24rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1rpx solid #edf0f6;
}

.popup-title {
	font-size: 27rpx;
	font-weight: 700;
	color: #303133;
}

.popup-close {
	font-size: 23rpx;
	color: #4474ff;
}

.device-search-row {
	margin: 14rpx 20rpx 0;
	height: 68rpx;
	display: flex;
	align-items: center;
	gap: 10rpx;
	padding: 0 20rpx;
	background: #ffffff;
	border: 2rpx solid #c6d7ff;
	border-radius: 94rpx;
	box-shadow: 0 4rpx 10rpx rgba(198, 215, 255, 0.3);
}

.device-search-input {
	flex: 1;
	height: 100%;
	font-size: 24rpx;
	color: #374151;
}

.device-search-placeholder {
	font-size: 24rpx;
	color: #c0c4cc;
}

.device-list-scroll {
	max-height: 60vh;
	padding: 14rpx 20rpx 32rpx;
	box-sizing: border-box;
}

.device-item {
	padding: 16rpx 0;
	border-bottom: 1rpx solid #f1f4fb;
}

.device-item-name {
	display: block;
	font-size: 24rpx;
	font-weight: 600;
	color: #303133;
}

.device-item-meta {
	display: block;
	margin-top: 6rpx;
	font-size: 21rpx;
	color: #909399;
}

.empty-tip {
	padding: 40rpx 0;
	text-align: center;
	font-size: 22rpx;
	color: #909399;
}
</style>

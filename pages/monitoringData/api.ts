import { service, useStore } from "/@/cool";
import { getLocale } from "/@/locale";
import { config } from "/@/config";

/**
 * 获取设备预警信息总览 + 分工地统计。
 * 为什么单独封装：页面只关心“拿什么数据”，不关心“怎么请求”，后续接口地址调整时只改这里即可。
 */
export function getDeviceWarnInfoList(mineId?: string) {
	return service.request({
		url: "/companyApp/zhgd/dashboard/stat",
		method: "GET",
		params: {
			mineId: mineId || "",
		},
		// 该大屏接口本身不依赖 projectId，避免请求层自动注入导致参数污染。
		needProject: false,
	});
}

/**
 * 获取安全检查 / 资产检查排名。
 * 参数约定与 PC 端保持一致，确保后端复用同一套入参结构。
 */
export function getAssetCheckRanking(params: {
	checkType: number;
	timeRange: number;
	checkTime: string;
}) {
	return service.request({
		url: "/companyApp/zhgd/dashboard/safetyCheckList",
		method: "GET",
		params,
		needProject: false,
	});
}

/**
 * 获取今日施工状态统计 + 明细列表。
 * 使用 checkDate 作为查询时间，便于支持“历史某一天状态回看”。
 */
export function getTodayConstructionStatus(params: { checkDate: string; siteCode?: any }) {
	return service.request({
		url: "/companyApp/zhgd/dashboard/constructionStatus",
		method: "GET",
		params,
		needProject: false,
	});
}

/**
 * 检查报告详情（查看报告弹层使用）。
 * 复用 PC 端检查管理详情接口，确保字段结构与后台保持一致。
 */
export function getInspectionById(id: string | number) {
	return service.request({
		url: "/companyApp/jcSecurityAssetInspection/getById",
		method: "GET",
		params: { id },
		needProject: false,
	});
}

/**
 * 人工监测设备列表行（参考 PC 端 DeviceSafeCheck/leftDeviceData 字段）。
 * 为什么在 API 层声明类型：
 * - 页面层只消费“业务语义字段”，不再关心接口返回的松散结构；
 * - 后续后端字段扩展时，可在这一处集中演进并统一影响调用端。
 */
export interface ManualDeviceItem {
	id: string | number;
	deviceName?: string;
	deviceCode?: string;
	monitorDt?: string;
	monitorValue?: string | number;
	unit?: string;
	siteName?: string;
	alarmStatus?: string;
	alarmColor?: string;
	checkUser?: string;
	createDt?: string;
	remark?: string;
	[key: string]: any;
}

/**
 * 人工监测详情页记录行（参考 PC 端 ManualDataDialog 列字段）。
 */
export interface ManualRecordItem {
	id?: string | number;
	deviceName?: string;
	deviceCode?: string;
	monitorDt?: string;
	monitorValue?: string | number;
	unit?: string;
	checkUser?: string;
	remark?: string;
	createDt?: string;
	[key: string]: any;
}

/**
 * 设备档案下拉行（导入页设备选择使用）。
 */
export interface DeviceArchiveItem {
	id: string | number;
	deviceName?: string;
	deviceCode?: string;
	siteCode?: string;
	siteName?: string;
	model?: string;
	factoryCode?: string;
	manufacturer?: string;
	unit?: string;
	[key: string]: any;
}

/**
 * 人工导入页工地行：
 * - 文档未给返回 schema，因此类型保持宽松并在页面消费前做字段兜底；
 * - 这样做的原因是避免把“后端字段差异”扩散到组件模板层。
 */
export interface ManualMineItem {
	id?: string | number;
	mineId?: string | number;
	mineName?: string;
	siteCode?: string;
	siteName?: string;
	projectName?: string;
	[key: string]: any;
}

/**
 * 人工导入历史记录行：
 * - 字段与接口文档 DeviceMonitorDataImportRecordPo 对齐；
 * - 页面仅使用展示字段，其余字段保留用于后续扩展。
 */
export interface ImportMonitorDataRecordItem {
	id?: string | number;
	deviceCode?: string;
	fileName?: string;
	filePath?: string;
	fileSize?: number;
	importDt?: string;
	siteCode?: string;
	[key: string]: any;
}

/**
 * 通用分页返回结构：
 * - 兼容不同后端字段命名（records/list + total/totalRow）；
 * - 页面拿到统一结构即可直接绑定列表与分页，不必在每个页面重复兜底。
 */
export interface PageResult<T> {
	records: T[];
	total: number;
}

/**
 * 人工监测设备列表：
 * - 按需求严格透传 names，不做 deviceName 映射；
 * - 其余入参允许透传，便于后续扩展分页/状态筛选等条件。
 */
export function getManualDeviceList(params: Record<string, any>) {
	return service.request({
		url: "/companyApp/DeviceSafeCheck/leftDeviceData",
		method: "GET",
		params,
		needProject: false,
	});
}

/**
 * 人工监测记录分页：
 * - 详情页使用该接口按设备查询人工数据；
 * - 与 PC 端 ManualDataDialog 对齐，便于字段一致展示。
 */
export function getManualDataPage(params: Record<string, any>) {
	return service.request({
		url: "/companyApp/DeviceSafeCheck/monitorDataListPage",
		method: "GET",
		params,
		needProject: false,
	});
}

/**
 * 导入页设备下拉数据：
 * - 来自设备档案分页接口，pageSize 可传较大值提升“下拉可选覆盖率”；
 * - 允许输入关键字过滤，避免移动端长列表查找成本过高。
 */
export function getDeviceArchiveListPage(params: Record<string, any>) {
	return service.request({
		url: "/companyApp/DeviceArchive/listPage",
		method: "GET",
		params,
		needProject: false,
	});
}

/**
 * 导入页设备列表：
 * - 使用接口文档指定的 DeviceArchive/list，避免 listPage 与后端筛选协议不一致；
 * - 参数由页面透传，便于按 siteCode 做工地维度过滤。
 */
export function getDeviceArchiveList(params: Record<string, any>) {
	return service.request({
		url: "/companyApp/DeviceArchive/list",
		method: "GET",
		params,
		needProject: false,
	});
}

/**
 * 查询人工导入工地列表：
 * - 与导入模块接口文档保持一致；
 * - 保持 needProject=false，避免自动注入 projectId 影响接口返回范围。
 */
export function getManualMineList() {
	return service.request({
		url: "/companyApp/DeviceSafeCheck/listMineAllData",
		method: "GET",
		needProject: false,
	});
}

/**
 * 查询导入历史记录：
 * - 由导入页在“选中设备后”触发，用于展示当前设备导入轨迹；
 * - 参数保持透传，以便后续按后端规则扩展过滤项。
 */
export function getImportMonitorDataRecord(params: Record<string, any>) {
	return service.request({
		url: "/companyApp/DeviceSafeCheck/findImportMonitorDataRecord",
		method: "GET",
		params,
		needProject: false,
	});
}

/**
 * 解析“可能被 AjaxJson 包裹”或“直接数组”结构为列表：
 * - 这层抽象的核心价值是把返回结构差异集中在 API 层消化；
 * - 页面拿到统一数组后，能保持模板与交互逻辑稳定。
 */
export function parseListResult<T = Record<string, any>>(response: any): T[] {
	const raw =
		response && typeof response === "object" && "data" in response ? response.data : response;
	if (Array.isArray(raw)) return raw as T[];
	if (Array.isArray(raw?.records)) return raw.records as T[];
	if (Array.isArray(raw?.list)) return raw.list as T[];
	if (Array.isArray(raw?.rows)) return raw.rows as T[];
	return [];
}

/**
 * 工地列表专用归一化：
 * - 该接口真实返回是对象映射（siteCode -> mineName），而非数组；
 * - 统一在 API 层转换为数组结构，页面层只处理同构数据，避免模板复杂度上升。
 */
export function normalizeManualMineList(response: any): ManualMineItem[] {
	const raw =
		response && typeof response === "object" && "data" in response ? response.data : response;
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return parseListResult<ManualMineItem>(response);
	}

	return Object.entries(raw).map(([siteCode, mineName]) => {
		/**
		 * 同时回填 id/mineId 的原因：
		 * - 导入页已有“siteCode 缺失回退 mineId/id”的联动规则；
		 * - 这里提前把三者统一成同值，可让后续逻辑无需再区分返回形态。
		 */
		return {
			id: siteCode,
			mineId: siteCode,
			siteCode,
			mineName: String(mineName ?? ""),
		};
	});
}

/**
 * 统一解析分页响应：
 * - 兼容后端直接返回 data 或 AjaxJson 包裹 data 两种形态；
 * - 兼容 records/list 与 total/totalRow 的差异，减少页面内分支判断。
 */
export function parsePageResult<T = Record<string, any>>(response: any): PageResult<T> {
	const raw =
		response && typeof response === "object" && "data" in response ? response.data : response;
	const records = Array.isArray(raw?.records)
		? raw.records
		: Array.isArray(raw?.list)
			? raw.list
			: Array.isArray(raw)
				? raw
				: [];
	const total = Number(raw?.total ?? raw?.totalRow ?? records.length ?? 0);
	return {
		records: records as T[],
		total,
	};
}

/**
 * 视频监控行（兼容 PC 端 MeVideo/listPage 的常见字段命名）。
 * 为什么做“宽松类型 + 归一化”：
 * - 后端不同环境可能存在 nodeName/cameraName、siteName/mineName 命名差异；
 * - 页面只消费统一字段，避免模板层反复写多套兜底判断。
 */
export interface MonitoringVideoItem {
	id?: string | number;
	nodeCode?: string;
	nodeName?: string;
	cameraName?: string;
	monitorName?: string;
	siteName?: string;
	mineName?: string;
	projectName?: string;
	onlineStateText?: string;
	videoStatus?: string | number;
	status?: string | number;
	online?: string | number | boolean;
	snapshotUrl?: string;
	coverUrl?: string;
	pictureUrl?: string;
	[key: string]: any;
}

/**
 * 视频监控页面消费的统一数据结构。
 */
export interface MonitoringVideoViewItem {
	id: string;
	nodeCode: string;
	monitorName: string;
	siteName: string;
	onlineStateText: string;
	coverUrl: string;
	raw: MonitoringVideoItem;
}

/**
 * 安全监测顶部统计返回结构：
 * - 与 PC 端同源接口 topStat 字段保持一致；
 * - 保持原始命名，避免前后端字段语义错位。
 */
export interface SafetyTopStatData {
	onlineDeviceCount?: number;
	offlineDeviceCount?: number;
	alarmDeviceCount?: number;
	[key: string]: any;
}

/**
 * 安全监测列表原始行（leftDeviceData）：
 * - 字段命名与后端保持同源，便于联调直接比对报文；
 * - 页面展示前会再做二次归一化，避免模板层写大量兜底判断。
 */
export interface SafetySensorRawItem {
	id?: string | number;
	deviceName?: string;
	deviceCode?: string;
	monitorDt?: string;
	monitorValue?: number | string;
	unit?: string;
	siteName?: string;
	alarmStatus?: string;
	alarmColor?: string;
	[key: string]: any;
}

/**
 * 安全监测列表页面使用的稳定视图模型：
 * - 将“状态文案/颜色/圆点颜色”在 API 层一次性算好；
 * - 页面只消费稳定字段，从而降低样式与业务耦合度。
 */
export interface SafetySensorViewItem {
	id: string;
	deviceName: string;
	deviceCode: string;
	monitorDt: string;
	monitorValueText: string;
	unit: string;
	siteName: string;
	statusText: string;
	statusType: "normal" | "notice" | "warning" | "exceed";
	dotColor: string;
	tagColor: string;
	tagBgColor: string;
	raw: SafetySensorRawItem;
}

/**
 * 安全监测趋势点：
 * - time 保留可直接展示的短时间文本（如 06:00）；
 * - value 强制归一为 number，避免图表组件因字符串导致坐标异常。
 */
export interface SafetyTrendPoint {
	time: string;
	value: number;
}

/**
 * 趋势归一化配置：
 * - tailCount: 仅保留接口返回按时间排序后的最后 N 条数据。
 */
export interface SafetyTrendNormalizeOptions {
	tailCount?: number;
}

/**
 * 安全监测阈值配置：
 * - 阈值接口真实字段是 redAlarm/orangeAlarm/yellowAlarm/blueAlarm；
 * - 页面展示时统一转成字符串，减少浮点精度与格式化差异。
 */
export interface SafetyThresholdConfig {
	red: string;
	orange: string;
	yellow: string;
	blue: string;
	unit: string;
	raw: any;
}

/**
 * 统一抽取业务 data：
 * - 兼容“AjaxJson 包裹 data”与“直接返回实体”两种返回形态；
 * - 将结构差异收敛在 API 层，页面层只处理同构数据。
 */
function resolveResponseData<T = any>(response: any): T {
	return response && typeof response === "object" && "data" in response
		? (response.data as T)
		: (response as T);
}

/**
 * 将设备告警状态映射到统一状态类型：
 * - 先读 alarmStatus 文案，再回退 alarmColor；
 * - 这样做的原因是不同环境下可能只返回其一，兜底后页面状态更稳定。
 */
function mapSafetyStatusType(
	alarmStatus?: string,
	alarmColor?: string,
): "normal" | "notice" | "warning" | "exceed" {
	const statusText = String(alarmStatus ?? "").trim();
	if (statusText.includes("超")) return "exceed";
	if (statusText.includes("预警")) return "warning";
	if (statusText.includes("注意")) return "notice";
	if (statusText.includes("正常")) return "normal";

	const colorText = String(alarmColor ?? "")
		.trim()
		.toLowerCase();
	if (colorText.includes("红") || colorText.includes("red")) return "exceed";
	if (colorText.includes("橙") || colorText.includes("orange")) return "warning";
	if (colorText.includes("黄") || colorText.includes("yellow")) return "notice";
	return "normal";
}

/**
 * 按状态类型计算前端展示色：
 * - 颜色集中管理可避免模板中散落魔法值；
 * - 后续视觉调整只改这一处即可全局生效。
 */
function getSafetyStatusStyle(statusType: "normal" | "notice" | "warning" | "exceed") {
	switch (statusType) {
		case "exceed":
			return {
				dotColor: "#ff4d4f",
				tagColor: "#ff4d4f",
				tagBgColor: "#fff1f0",
			};
		case "warning":
			return {
				dotColor: "#ff9f43",
				tagColor: "#ff9f43",
				tagBgColor: "#fff4e8",
			};
		case "notice":
			return {
				dotColor: "#ffd84d",
				tagColor: "#d5a600",
				tagBgColor: "#fffbe6",
			};
		default:
			return {
				dotColor: "#22b573",
				tagColor: "#22b573",
				tagBgColor: "#ecfff6",
			};
	}
}

/**
 * 统一格式化监测时间：
 * - 把 ISO `T` 替换为空格，兼容后端不同序列化格式；
 * - 列表与详情共用该格式，确保时间呈现一致。
 */
function formatSafetyDateTimeText(value?: string) {
	if (!value) return "-";
	return String(value).replace("T", " ");
}

/**
 * 安全监测顶部统计：
 * GET /companyApp/DeviceSafeCheck/topStat
 */
export function getSafetyTopStat(params: Record<string, any>) {
	return service.request({
		url: "/companyApp/DeviceSafeCheck/topStat",
		method: "GET",
		params,
		needProject: false,
	});
}

/**
 * 安全监测设备列表：
 * GET /companyApp/DeviceSafeCheck/leftDeviceData
 */
export function getSafetySensorList(params: Record<string, any>) {
	return service.request({
		url: "/companyApp/DeviceSafeCheck/leftDeviceData",
		method: "GET",
		params,
		needProject: false,
	});
}

/**
 * 将 leftDeviceData 响应归一化为列表页可直接渲染的数据结构。
 */
export function normalizeSafetySensorList(response: any): SafetySensorViewItem[] {
	const raw = resolveResponseData<any>(response);
	const rows: SafetySensorRawItem[] = Array.isArray(raw)
		? raw
		: Array.isArray(raw?.records)
			? raw.records
			: Array.isArray(raw?.list)
				? raw.list
				: [];

	return rows.map((item, index) => {
		const statusType = mapSafetyStatusType(item.alarmStatus, item.alarmColor);
		const style = getSafetyStatusStyle(statusType);
		return {
			id: String(item.id ?? item.deviceCode ?? index),
			deviceName: String(item.deviceName ?? "-"),
			deviceCode: String(item.deviceCode ?? ""),
			monitorDt: formatSafetyDateTimeText(item.monitorDt),
			monitorValueText:
				item.monitorValue === undefined ||
				item.monitorValue === null ||
				item.monitorValue === ""
					? "-"
					: String(item.monitorValue),
			unit: String(item.unit ?? ""),
			siteName: String(item.siteName ?? "-"),
			statusText: String(item.alarmStatus ?? "").trim() || "正常",
			statusType,
			dotColor: style.dotColor,
			tagColor: style.tagColor,
			tagBgColor: style.tagBgColor,
			raw: item,
		};
	});
}

/**
 * 安全监测趋势数据：
 * GET /companyApp/DeviceSafeCheck/checkDataByDeviceCode
 */
export function getSafetyTrendByDeviceCode(params: {
	deviceCode: string;
	startTime: string;
	endTime: string;
}) {
	return service.request({
		url: "/companyApp/DeviceSafeCheck/checkDataByDeviceCode",
		method: "GET",
		params,
		needProject: false,
	});
}

/**
 * 将趋势响应转换为图表数据：
 * - 先按 monitorDt 升序，确保曲线从左到右时间递增；
 * - time 仅保留 HH:mm，减少移动端横轴拥挤。
 */
export function normalizeSafetyTrendData(response: any): SafetyTrendPoint[] {
	const raw = resolveResponseData<any>(response);
	const rows: SafetySensorRawItem[] = Array.isArray(raw)
		? raw
		: Array.isArray(raw?.records)
			? raw.records
			: Array.isArray(raw?.list)
				? raw.list
				: [];

	return normalizeSafetyTrendDataByOptions(rows, {
		tailCount: 10,
	});
}

/**
 * 趋势点高级归一化：
 * - 把“时间过滤 + 去重 + 映射”集中在 API 层，页面只消费稳定结果；
 * - 这样做的原因是轮询频繁时，页面层不应承担重复数据清洗逻辑。
 */
export function normalizeSafetyTrendDataByOptions(
	responseOrRows: any,
	options: SafetyTrendNormalizeOptions = {},
): SafetyTrendPoint[] {
	const { tailCount = 10 } = options;
	const rows: SafetySensorRawItem[] = Array.isArray(responseOrRows)
		? responseOrRows
		: (() => {
				const raw = resolveResponseData<any>(responseOrRows);
				return Array.isArray(raw)
					? raw
					: Array.isArray(raw?.records)
						? raw.records
						: Array.isArray(raw?.list)
							? raw.list
							: [];
			})();
	/**
	 * 规则改为“最后 N 条，不去重”：
	 * - 先按 monitorDt 升序排好时间线；
	 * - 再截取尾部 N 条，确保始终展示最新一段曲线。
	 */
	const sortedRows = [...rows].sort((a, b) =>
		String(a.monitorDt ?? "").localeCompare(String(b.monitorDt ?? "")),
	);
	const safeTailCount = Number.isFinite(Number(tailCount)) ? Math.max(1, Number(tailCount)) : 10;
	const rowsForRender = sortedRows.slice(-safeTailCount);

	return rowsForRender.map((item) => {
		const dt = String(item.monitorDt ?? "")
			.replace("T", " ")
			.trim();
		/**
		 * 仅展示“时:分:秒”：
		 * - 标准 `YYYY-MM-DD HH:mm:ss` 直接切片；
		 * - 若后端未返回秒，则补 `:00`，保证 X 轴格式统一。
		 */
		const time = (() => {
			if (dt.length >= 19) return dt.slice(11, 19);
			if (dt.length >= 16) return `${dt.slice(11, 16)}:00`;
			return dt || "-";
		})();
		const valueNum = Number(item.monitorValue ?? 0);
		return {
			time,
			value: Number.isFinite(valueNum) ? valueNum : 0,
		};
	});
}

/**
 * 按设备类型读取阈值配置：
 * POST /companyApp/DeviceSafeCheck/getAlarmThresholdByDeviceType
 * 注意该接口要求 `application/x-www-form-urlencoded`。
 */
export function getSafetyThresholdByDeviceType(deviceType: string | number = 1) {
	const safeDeviceType = String(deviceType || 1);
	return service.request({
		url: "/companyApp/DeviceSafeCheck/getAlarmThresholdByDeviceType",
		method: "POST",
		/**
		 * 与 PC 端控制台保持一致：以“表单数据”方式提交 deviceType。
		 * 为什么这里用 `header`：
		 * - 当前项目 request 封装读取的是 `header` 字段，不是 `headers`；
		 * - 若写成 `headers`，Content-Type 不会生效，可能被默认 JSON 序列化。
		 */
		data: {
			deviceType: safeDeviceType,
		},
		header: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		needProject: false,
	});
}

/**
 * 保存或更新设备阈值配置
 * POST /companyApp/DeviceSafeCheck/alarmThresholdSave
 */
export function saveAlarmThreshold(data: any) {
	return service.request({
		url: "/companyApp/DeviceSafeCheck/alarmThresholdSave",
		method: "POST",
		data,
		needProject: false,
	});
}

/**
 * 统一阈值结构：
 * - 兼容接口返回空对象/空值；
 * - 所有阈值都转字符串，保证与页面文本渲染逻辑一致。
 */
export function normalizeSafetyThreshold(response: any): SafetyThresholdConfig | null {
	const raw = resolveResponseData<any>(response);
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

	const toText = (v: unknown) => {
		if (v === undefined || v === null || v === "") return "0";
		return String(v);
	};

	return {
		red: toText(raw.redAlarm),
		orange: toText(raw.orangeAlarm),
		yellow: toText(raw.yellowAlarm),
		blue: toText(raw.blueAlarm),
		unit: String(raw.unit ?? ""),
		raw,
	};
}

/**
 * 视频监控列表（与 PC 端保持同源接口）。
 */
export function getMonitoringVideoList(params: Record<string, any>) {
	return service.request({
		url: "/companyApp/MeVideo/listPage",
		method: "GET",
		params,
		needProject: false,
	});
}

/**
 * 读取系统参数（用于取 wvpUserPsw）。
 * 为什么放在 monitoringData/api.ts：
 * - 监测数据模块可复用同一读取入口，避免页面散落 URL 常量和入参协议。
 */
export function getSystemParamByCode(paramCode: string) {
	return service.request({
		url: "/sysm/systemParam/getByParamCode",
		method: "GET",
		params: { paramCode },
		needProject: false,
	});
}

/**
 * 将接口原始行映射为页面稳定字段：
 * - 监控名、工地名、在线状态统一后，页面模板能保持单一渲染分支；
 * - 统一在 API 层兜底，后续字段变更只改一处。
 */
export function normalizeMonitoringVideoItem(item: MonitoringVideoItem): MonitoringVideoViewItem {
	const idCandidate =
		item.id ?? item.nodeCode ?? item.nodeName ?? item.cameraName ?? Math.random();
	const nodeCode = String(item.nodeCode ?? item.id ?? "");
	const monitorName = String(
		item.nodeName ?? item.cameraName ?? item.monitorName ?? item.deviceName ?? "未命名监控",
	);
	const siteName = String(item.siteName ?? item.mineName ?? item.projectName ?? "未分配工地");
	const onlineStateText = String(
		item.onlineStateText ??
			item.videoStatus ??
			item.status ??
			(item.online === true ? "在线" : item.online === false ? "离线" : "未知"),
	);
	const coverUrl = String(item.snapshotUrl ?? item.coverUrl ?? item.pictureUrl ?? "");
	return {
		id: String(idCandidate),
		nodeCode,
		monitorName,
		siteName,
		onlineStateText,
		coverUrl,
		raw: item,
	};
}

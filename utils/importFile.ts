/**
 * 真机 App（Android / 鸿蒙）人工监测 Excel 导入上传封装。
 *
 * 设计原因：
 * 1. `uni.uploadFile` 与 `service.request` 是两条链路，鉴权/响应解析不能直接复用 request 拦截器；
 * 2. 导入页后续可能在多个页面复用，抽到 utils 可避免页面层重复写上传细节；
 * 3. 对 `content://` 问题，本文件只做“入参合法性保护”，真正转换在插件原生层处理（见 a.md）。
 */
import { config } from "/@/config";
import { useStore } from "/@/cool";

/**
 * 导入接口固定地址。
 * 为什么定义常量：避免页面散落魔法字符串，后续接口路径调整只改一处。
 */
const IMPORT_MONITOR_DATA_URL = "/companyApp/DeviceSafeCheck/importMonitorData";

/**
 * 上传入参。
 */
export interface ImportManualMonitorDataUploadOptions {
	/**
	 * 设备编码：接口用于定位导入目标设备。
	 */
	deviceCode: string;
	/**
	 * 工地编码：接口用于按工地归档导入记录。
	 */
	siteCode: string;
	/**
	 * 文件本地路径：
	 * - 理想路径是插件转换后的 `file://...`；
	 * - 也兼容 uni 临时文件路径，便于非 Android 场景联调。
	 */
	filePath: string;
	/**
	 * 原始文件名：用于后端记录与问题追溯。
	 */
	fileName?: string;
	/**
	 * 超时时间，默认 60 秒。
	 */
	timeout?: number;
}

/**
 * 导入接口常见响应结构（按 api.md 的 AjaxJson 约定）。
 */
interface ImportMonitorDataAjaxResponse<T = any> {
	data?: T;
	message?: string;
	status?: number;
	success?: boolean;
	[key: string]: any;
}

/**
 * 标准化 baseUrl，避免出现双斜杠。
 */
function getImportMonitorDataFullUrl() {
	const base = String(config.baseUrl || "").replace(/\/+$/, "");
	return `${base}${IMPORT_MONITOR_DATA_URL}`;
}

/**
 * 解析 uploadFile 的响应文本为对象。
 * 为什么单独拆函数：便于区分“网络上传成功但业务返回非 JSON”这类问题，给出明确错误。
 */
function parseUploadResponseText(raw: unknown): ImportMonitorDataAjaxResponse {
	if (typeof raw === "object" && raw !== null) {
		return raw as ImportMonitorDataAjaxResponse;
	}
	const text = String(raw ?? "").trim();
	if (!text) {
		throw new Error("导入失败：服务端返回为空");
	}
	try {
		return JSON.parse(text) as ImportMonitorDataAjaxResponse;
	} catch {
		throw new Error("导入失败：服务端返回格式异常");
	}
}

/**
 * 校验是否为可上传的 Excel 文件路径。
 * 注意：`content://` 在 Android 10+ 常不可直接上传，这里直接阻断并提示走插件转换。
 */
function validateFilePath(filePath: string) {
	const path = String(filePath || "").trim();
	if (!path) {
		throw new Error("导入失败：文件路径为空");
	}
	if (path.startsWith("content://")) {
		throw new Error("导入失败：文件路径仍为content://，请先完成插件路径转换");
	}
}

/**
 * 上传 Excel 到人工监测导入接口。
 */
export function importManualMonitorDataByUpload(
	options: ImportManualMonitorDataUploadOptions,
): Promise<ImportMonitorDataAjaxResponse> {
	const { user } = useStore();
	const safeDeviceCode = String(options.deviceCode || "").trim();
	const safeSiteCode = String(options.siteCode || "").trim();
	const safeFilePath = String(options.filePath || "").trim();
	const safeFileName = String(options.fileName || "").trim();
	const timeout = Number(options.timeout || 60000);

	if (!safeDeviceCode) {
		return Promise.reject(new Error("导入失败：设备编码不能为空"));
	}
	if (!safeSiteCode) {
		return Promise.reject(new Error("导入失败：工地编码不能为空"));
	}
	validateFilePath(safeFilePath);

	const token = String(user.token || "").trim();
	if (!token) {
		return Promise.reject(new Error("登录状态已失效，请重新登录"));
	}

	return new Promise((resolve, reject) => {
		console.log("[importManualMonitorDataByUpload] start upload:");
		console.log("url:", getImportMonitorDataFullUrl());
		console.log("filePath:", safeFilePath);
		console.log("formData:", {
			deviceCode: safeDeviceCode,
			siteCode: safeSiteCode,
			fileName: safeFileName,
		});

		uni.uploadFile({
			url: getImportMonitorDataFullUrl(),
			filePath: safeFilePath,
			/**
			 * 与接口文档保持一致：文件字段名固定为 `file`。
			 */
			name: "file",
			timeout: Number.isFinite(timeout) && timeout > 0 ? timeout : 60000,
			/**
			 * 与全局 request 封装保持一致，明确使用 Bearer 方案。
			 */
			header: {
				Authorization: `Bearer ${token}`,
			},
			/**
			 * 业务字段通过 formData 传递；本期不传 fileImg（已按需求确认）。
			 */
			formData: {
				deviceCode: safeDeviceCode,
				siteCode: safeSiteCode,
				fileName: safeFileName,
			},
			success: (res) => {
				console.log("[importManualMonitorDataByUpload] upload success raw res:", res);
				try {
					const data = parseUploadResponseText(res.data);
					console.log("[importManualMonitorDataByUpload] parsed data:", data);
					const isSuccess = data?.success === true || data?.status === 200;
					if (!isSuccess) {
						reject(new Error(data?.message || "导入失败"));
						return;
					}
					resolve(data);
				} catch (err: any) {
					reject(err instanceof Error ? err : new Error(err?.message || "导入失败"));
				}
			},
			fail: (err) => {
				console.log("[importManualMonitorDataByUpload] upload fail:", err);
				reject(new Error(err?.errMsg || "导入失败：网络异常"));
			},
		});
	});
}

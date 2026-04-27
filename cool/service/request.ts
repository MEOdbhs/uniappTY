import { router } from "../router";
import { isDev, ignoreTokens } from "../../config";
import { getLocale, t } from "/@/locale";
import { useStore } from "/@/cool";

const isIgnoreToken = (url: string) => {
	return ignoreTokens.some((e) => {
		const pattern = e.replace(/\*/g, ".*");
		return new RegExp(pattern).test(url);
	});
};

/** 与 NCMP-GS/src/utils/request.ts：OAuth / 风控接口原样返回 body */
const bypassBusinessStatus = (url: string) => {
	return (
		url.includes("auth/oauth/token") ||
		url.includes("sysm/afs/afsCheck")
	);
};

export default function request(options: any) {
	const { user, project } = useStore();

	let {
		url,
		method = "GET",
		data = {},
		header = {},
		timeout = 60000,
		needProject = true,
	} = options;

	const ensureProjectId = (target: any) => {
		const pid = project.currentProjectId;
		if (!pid) return;
		if (target && typeof target === "object" && !Array.isArray(target)) {
			if (!Object.prototype.hasOwnProperty.call(target, "projectId")) {
				target.projectId = pid;
			}
		}
	};

	if (isDev) {
		console.log(`[${method}] ${url}`);
	}

	let Authorization: string | null = user.token || null;
	if (isIgnoreToken(url)) {
		Authorization = null;
	} else if (Authorization != null) {
		Authorization = "Bearer " + Authorization;
	}

	const methodUp = method.toUpperCase();
	const isPost = methodUp === "POST";
	if (needProject && isPost) {
		ensureProjectId(data);
	}

	const headers: Record<string, string> = {
		language: getLocale(),
		...header,
	};
	if (Authorization) {
		headers.Authorization = Authorization;
	}
	const isFormBody =
		typeof data === "string" &&
		(header["Content-Type"]?.includes("application/x-www-form-urlencoded") ||
			header["content-type"]?.includes("application/x-www-form-urlencoded"));
	if (isPost && typeof data === "object" && data !== null && !isFormBody) {
		if (!headers["Content-Type"] && !headers["content-type"]) {
			headers["Content-Type"] = "application/json;charset=utf-8";
		}
	}

	return new Promise((resolve, reject) => {
		console.log(url);

		uni.request({
			url,
			method,
			data,
			header: headers,
			timeout,

			success(res: any) {
				console.log(res);

				if (res.statusCode === 200) {
					if (res.data == null) {
						resolve(null);
						return;
					}

					const responseData = res.data;

					if (bypassBusinessStatus(url)) {
						resolve(responseData);
						return;
					}

					const status = responseData?.status;
					if (status === 200) {
						resolve(responseData);
						return;
					}

					if (status === 401) {
						uni.showModal({
							title: t("系统提示"),
							content: t("登录状态已过，请重新登录"),
							showCancel: false,
							confirmText: t("重新登录"),
							success: (modalRes) => {
								if (modalRes.confirm) {
									user.logout();
								}
							},
						});
						reject({
							message:
								responseData?.message ||
								t("认证失败，无法访问系统资源"),
							code: 401,
						});
						return;
					}

					if (status === 412) {
						const msg = responseData?.message || t("操作警告");
						uni.showToast({ title: msg, icon: "none", duration: 2000 });
						reject({ message: msg, code: 412 });
						return;
					}

					if (status === 500) {
						const msg =
							responseData?.message || t("系统未知错误，请反馈给管理员");
						uni.showToast({ title: msg, icon: "none", duration: 2000 });
						reject({ message: msg, code: 500 });
						return;
					}

					if (status != null) {
						const msg = responseData?.message || t("请求失败");
						reject({ message: msg, code: status });
						return;
					}

					// 无 status 字段时原样返回（兼容个别接口）
					resolve(responseData);
				} else if (res.statusCode === 401) {
					if (router.info()?.path === router.pages.login) {
						return reject({ message: t("认证失败，无法访问系统资源") });
					}
					uni.showModal({
						title: t("系统提示"),
						content: t("登录状态已过，请重新登录"),
						showCancel: false,
						confirmText: t("重新登录"),
						success: (modalRes) => {
							if (modalRes.confirm) {
								user.logout();
							}
						},
					});
					reject({ message: t("认证失败，无法访问系统资源"), code: 401 });
				} else if (res.statusCode === 404) {
					reject({
						message: t("访问资源不存在") + ` [404] ${url}`,
						code: 404,
					});
				} else if (res.statusCode === 502) {
					reject({
						message: t("服务异常"),
						code: 502,
					});
				} else {
					reject({
						message: t("系统未知错误，请反馈给管理员"),
						code: res.statusCode,
					});
				}
			},

			fail(err: any) {
				let message = err.errMsg || t("网络请求失败");
				if (message.includes("timeout") || message.includes("超时")) {
					message = t("系统接口请求超时");
				} else if (message.includes("fail") || message.includes("Failed")) {
					message = t("后端接口连接异常");
				}
				uni.showToast({
					title: message,
					icon: "none",
					duration: 3000,
				});
				reject({ message });
			},
		});
	});
}

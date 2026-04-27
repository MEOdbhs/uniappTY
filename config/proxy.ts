/**
 * 与 NCMP-GS 一致：
 * - /company 走业务后端代理；
 * - /wvp 走视频平台代理（WVP 登录与取流依赖此代理）。
 * 修改目标地址时请与 PC 端环境变量保持一致。
 */
const API_TARGET = "http://172.26.1.51:38080";
const VIDEO_TARGET = "http://172.26.1.51:38080";

const proxy: Record<string, { target: string; changeOrigin: boolean }> = {
	"/company": {
		target: API_TARGET,
		changeOrigin: true,
	},
	"/wvp": {
		target: VIDEO_TARGET,
		changeOrigin: true,
	},
};

const host = API_TARGET;
/** H5 下 dev.ts 使用 /${value} 作为前缀，与 Web baseURL `/company` 一致 */
const value = "company";

export { proxy, host, value };





import { service } from "/@/cool";

export type AppRouteMeta = {
	title: string;
	icon: string | null;
	noCache: boolean;
	link: string | null;
	path?: string | null;
};

export type AppRoute = {
	name: string;
	path: string;
	hidden: boolean;
	redirect?: string | null;
	component: string;
	alwaysShow?: boolean;
	meta: AppRouteMeta;
};

// 获取 APP 菜单路由
export function getAppRouters() {
	return service.request<AppRoute[]>({
		url: "getRouters",
		method: "GET",
	});
}
// 获取待办任务数量
export function getAllNum() {
	return service.request({
		url: "/sys/workbench/getAllNum",
		method: "GET",
	});
}

// 获取个人信息
export function getUserInfo(params: any) {
	return service.request({
		url: "/YwBoardClient/getPersonByUserId",
		method: "GET",
		params,
	});
}

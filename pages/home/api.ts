import { service } from "/@/cool";

// 获取项目分布统计
export function getProjectDistribution(params?: any) {
	return service.request({
		url: "/AppHomePage/getProjectDistribution",
		method: "GET",
		params,
	});
}

// 获取运维团队统计
export function getTeamStatistics(params?: any) {
	return service.request({
		url: "/AppHomePage/getOperationsTeam",
		method: "GET",
		params,
	});
}
//诊断统计
export function getdiagnosticData(params?: any) {
	return service.request({
		url: "/operation/findDiagnosisPlatform",
		method: "GET",
		params
	});
}

// 获取巡检统计
export function getInspectionStatistics(params?: any) {
	return service.request({
		url: "/AppHomePage/getInspectionStatistics",
		method: "GET",
		params,
	});
}
//图表
export function getInspectionStatisticsList(params?: any) {
	return service.request({
		//url: "/AppHomePage/getInspectionImage",
		url: "/operation/findInspectionCountLine",
		method: "GET",
		params
	});
}

//

export function getLatestNews(params?: any) {
	return service.request({
		url: "/AppHomePage/getAnnouncement",
		method: "GET",
		params
	});
}
////AppHomePage/getCompanyQuality

export function getCompanyTicket(params?: any) {
	return service.request({
		url: "/operation/findCompanyQualification",
		method: "GET",
		params
	});
}

// 维修工单统计
export function getRepairOrderCount(params?: any) {
	return service.request({
		url: "/operation/findRepairOrderCount",
		method: "GET",
		params
	});
}

// 维修工单折线图
export function getRepairOrderCountLine(params?: any) {
	return service.request({
		url: "/operation/findRepairOrderCountLine",
		method: "GET",
		params
	});
}

// 运维中心-运维人员统计
export function ywPerson() {
	return service.request({
		url: "/ywApp/maintenancePerson",
		method: "POST",
	});
}

// 运维中心-近期巡检任务完成情况
export function ywkTasks() {
	return service.request({
		url: "/ywApp/inspectionTaskComplete",
		method: "POST",
	});
}

// 运维中心-项目好评榜
export function projectRank() {
	return service.request({
		url: "/YwLeaderAndMgr/projectCommentRank",
		method: "GET",
	});
}

// 运维中心-报修任务分析
export function ywTaskAnalyze() {
	return service.request({
		url: "/YwLeaderAndMgr/repairTaskAnalyze",
		method: "GET",
	});
}

// 今日运维人员
export function getTodayMaintenancePerson() {
	return service.request({
		url: "/ywAppMaintenance/ywPerson",
		method: "GET",
	});
}

// 近期下井情况统计
export function getRecentDownWellStats(params?: any) {
	return service.request({
		url: "/ywAppMaintenance/count7daysDownWell",
		method: "GET",
		params,
	});
}

// 巡检统计折线图
export function getInspectionCountLine(params?: any) {
	return service.request({
		url: "/ywAppMaintenance/count7daysInspectionTasks",
		method: "GET",
		params,
	});
}

// 近期报修完成情况（环形图）
export function getRepairCompletion(params?: any) {
	return service.request({
		url: "/ywAppMaintenance/countRepair",
		method: "GET",
		params,
	});
}

// 近期报修列表
export function getRecentRepairList(params?: any) {
	return service.request({
		url: "/ywAppMaintenance/count7daysRepair",
		method: "GET",
		params,
	});
}

// 明星员工
export function getStarEmployees(params?: any) {
	return service.request({
		url: "/ywAppMaintenance/starEmployees",
		method: "GET",
		params,
	});
}

// 获取运维项目列表（分页）
export function getProjectContractListPage(params?: any) {
	return service.request({
		url: "/project/contract/listPage",
		method: "GET",
		params,
	});
}

// 获取非运维客户列表（分页）
export function getUnOperationsCustomerListPage(params?: any) {
	return service.request({
		url: "/system/user/findUserByRoleKeysPage",
		method: "GET",
		params: {
			...params,
			roleKeys: "unOperationsCustmer",
			projectId: "",
		},
	});
}

// 获取运维客户列表（分页）
export function getOperationsCustomerListPage(params?: any) {
	return service.request({
		url: "/BsCustomerMgr/list",
		method: "GET",
		params,
	});
}

// 获取运维客户列表（不分页）  地图上展示
export function getMapIcon(params?: any) {
	return service.request({
		url: "/BsCustomerMgr/listNoPage",
		method: "GET",
		params,
	});
}

// 获取运维项目列表
// notInFlag: true-运维人员 false-专家
export function getOperationProjectList(params?: any) {
	return service.request({
		url: "/AppHomePage/findCustomerRelatedPersonalNum",
		method: "POST",
		data: params,
	});
}

// 获取运维人员列表
// notInFlag: true-运维人员 false-专家
export function getOperationUserList(params?: any) {
	return service.request({
		url: "/system/user/findUserByRoleKeysPage",
		method: "GET",
		params,
	});
}

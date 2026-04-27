import { service } from "/@/cool";

// ========== 技术查询相关接口 ==========
// 获取最近热搜的文档 TOP10
export function fetchHotDocuments() {
	return service.request({
		url: "/DmTechnologySelect/getDocumentTop",
		method: "GET",
		needProject: false,
	});
}

// 获取最近热搜的关键词 TOP10
export function fetchHotKeywords() {
	return service.request({
		url: "/DmTechnologySelect/getKeyWordsTop",
		method: "GET",
		needProject: false,
	});
}

// 技术库搜索
export function searchTechnologyLibrary(params: any) {
	return service.request({
		url: "/DmTechnologySelect/getRelationList",
		method: "GET",
		params,
		needProject: false,
	});
}

// ========== 技术文档相关接口 ==========
// 获取文档列表
export function getDocumentList(data: any) {
	return service.request({
		url: "/dmTechnologyDocument/queryDoc",
		method: "POST",
		data,
		needProject: false,
	});
}

// 获取文档详情（与 Web 端保持一致，使用 params 传递 id）
export function getDocDetail(data: any) {
	return service.request({
		url: "/dmTechnologyDocument/lookDoc?id=" + data.id,
		method: "POST",
		data,
	});
}

// 获取适用设备
export function getApplicableDevice(data?: any) {
	return service.request({
		// url: "/dmTechnologyDocument/getApplicableDevice",
		url: "/BsDeviceCategory/listNoPage",
		method: "GET",
		params: data,
		needProject: false,
	});
}

// 获取部门树
export function getDeptTree(data?: any) {
	return service.request({
		url: "/dmTechnologyDocument/deptTree",
		method: "POST",
		data,
		needProject: false,
	});
}

// 获取文档类型
export function getDocType() {
	return service.request({
		url: "/dmTechnologyDocument/getDocType",
		method: "POST",
		needProject: false,
	});
}

// 新增文档
export function addDocument(data: any) {
	return service.request({
		url: "/dmTechnologyDocument/addDoc",
		method: "POST",
		data,
		needProject: false,
	});
}
// 编辑文档
export function editDocument(data: any) {
	return service.request({
		url: "/dmTechnologyDocument/editDoc",
		method: "POST",
		data,
		needProject: false,
	});
}

// ========== 技术论坛相关接口 ==========
// 获取技术类型列表
export function getTechnologyTypeList(params: any) {
	return service.request({
		url: "/DmTechnologyType/listNoPage",
		method: "GET",
		params,
		needProject: false,
	});
}

// 保存或更新技术问题
export function saveTechnologyQuestion(data: any) {
	return service.request({
		url: "/DmTechnologyQuestion/saveOrUpdate",
		method: "POST",
		data,
		needProject: false,
	});
}

// 获取技术问题详情
export function getTechnologyQuestionViewById(id: string) {
	return service.request({
		url: "/DmTechnologyQuestion/getViewById",
		method: "GET",
		params: { id },
		needProject: false,
	});
}

// 获取技术问题列表
export function getTechnologyQuestionList(params: any) {
	return service.request({
		url: "/DmTechnologyQuestion/list",
		method: "GET",
		params,
		needProject: false,
	});
}

// 删除技术问题
export function deleteTechnologyQuestion(id: string) {
	return service.request({
		url: "/DmTechnologyQuestion/deleteFlagById",
		method: "POST",
		data: { id },
		needProject: false,
	});
}

// 保存或更新技术评论
export function saveTechnologyComment(data: any) {
	return service.request({
		url: "/DmTechnologyAnswer/saveOrUpdate",
		method: "POST",
		data,
		needProject: false,
	});
}

// 获取技术答案列表
export function getTechnologyAnswerList(params: any) {
	return service.request({
		url: "/DmTechnologyAnswer/listNoPage",
		method: "GET",
		params,
		needProject: false,
	});
}

// 删除技术评论
export function deleteTechnologyComment(id: string) {
	return service.request({
		url: "/DmTechnologyAnswer/deleteFlagById",
		method: "POST",
		data: { id },
		needProject: false,
	});
}

// 增加问题阅读次数
export function addAnswerRead(questionId: string) {
	return service.request({
		url: "/DmTechnologyAnswer/showRead",
		method: "GET",
		params: { questionId },
		needProject: false,
	});
}

// 增加关键词阅读次数
export function addKeywordsRead(params: any) {
	return service.request({
		url: "/DmTechnologyKeywords/showRead",
		method: "GET",
		params,
		needProject: false,
	});
}

// ========== 经验文库相关接口 ==========
// 人工创建列表
export function getExperienceList(data: any) {
	return service.request({
		url: "/dmTechnologyExperience/searchExperience",
		method: "POST",
		data,
	});
}

// 系统生成列表
export function getExperienceListSystem(data: any) {
	return service.request({
		url: "/dmTechnologyExperience/searchExp",
		method: "POST",
		data,
	});
}

// 获取技术类型
export function getTechType() {
	return service.request({
		url: "/dmTechnologyExperience/getTechType",
		method: "POST",
	});
}

// 获取子系统列表
export function getSubsystemList() {
	return service.request({
		url: "/dmTechnologyExperience/getSubsystem",
		method: "POST",
	});
}

// 新增经验
export function addExperience(data: any) {
	return service.request({
		url: "/dmTechnologyExperience/addExperience",
		method: "POST",
		data,
	});
}

// 系统生成详情
export function lookExperienceSystem(id: string) {
	return service.request({
		url: "/dmTechnologyExperience/lookExp?faultRepairId=" + id,
		method: "POST",
	});
}

// 人工创建详情
export function lookExperience(id: string) {
	return service.request({
		url: "/dmTechnologyExperience/lookExperience?id=" + id,
		method: "POST",
	});
}

// 评论经验
export function reviewExperience(data: any) {
	return service.request({
		url: "/dmTechnologyExperience/reviewExperience",
		method: "POST",
		data,
		needProject: false,
	});
}

// 删除评论
export function deleteReview(id: string) {
	return service.request({
		url: "/dmTechnologyExperience/deleteReview?id=" + id,
		method: "POST",
		needProject: false,
	});
}

// 编辑经验
export function editExperience(data: any) {
	return service.request({
		url: "/dmTechnologyExperience/editExperience",
		method: "POST",
		data,
	});
}

// 编辑系统生成
export function editSysExp(data: any) {
	return service.request({
		url: "/dmTechnologyExperience/editSysExp",
		method: "POST",
		data,
	});
}

// ========== 文档评论相关接口 ==========
// 提交文档评论
export function postComment(data: any) {
	return service.request({
		url: "/dmTechnologyDocument/reviewExperience",
		method: "POST",
		data,
	});
}

// 删除文档评论
export function deleteComment(id: string) {
	return service.request({
		url: `/dmTechnologyDocument/deleteReview/${id}`,
		method: "POST",
	});
}

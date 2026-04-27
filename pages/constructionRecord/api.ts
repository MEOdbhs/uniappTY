import { service } from "/@/cool"

// 施工记录列表 /companyApp/sgConstructionStatus/appCurrentpagePage
export function getConstructionRecordList(params: any) {
    return service.request({
        url: "/companyApp/sgConstructionStatus/appCurrentpagePage",
        method: "GET",
        params,
    })
}
// 施工记录详情 /companyApp/sgConstructionStatus/changeLog/list
export function getConstructionRecordDetail(params: any) {
    return service.request({
        url: "/companyApp/sgConstructionStatus/changeLog/list",
        method: "GET",
        params,
    })
}
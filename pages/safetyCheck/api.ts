import { service } from "/@/cool"

// 安全检查/资产检查列表接口
export function getSafetyCheckList(params: any) {
    return service.request({
        url: "/companyApp/jcSecurityAssetInspection/page",
        method: "GET",
        params,
    })
}

// 保存安全检查/资产检查数据
export function saveSafetyCheck(data: any) {
    return service.request({
        url: "/companyApp/jcSecurityAssetInspection/saveOrUpdate",
        method: "POST",
        data,
    })
}

// 安全检查/资产检查详情接口
export function getSafetyCheckDetail(params: any) {
    return service.request({
        url: "/companyApp/jcSecurityAssetInspection/getById",
        method: "GET",
        params,
    })
}

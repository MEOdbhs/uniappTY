import { useStore } from "/@/cool"
/**
 * 显示权限提示弹窗
 * @param options 弹窗配置选项
 */
export const showPermissionDialog = (options?: PermissionDialog.Options) => {
    const title = options?.title || "权限提示"
    const message = options?.message || "非运维签约客户无查看权限，运维服务合作请联系当地营销分公司，或者致电：4008877832"
    const buttonText = options?.buttonText || "我知道了"
    uni.showModal({
        title: title,
        content: message,
        showCancel: false,
        confirmText: buttonText,
        success: (res) => {
            if (res.confirm) {
                options?.callback?.()
            }
        },
    })
}
/**
 * 判断是否具有某个角色
 * @date 2026-01-06
 * @param {any} roleName?:string
 * @returns {any}
 */
export const isPermitted = (roleName: string) => {
    const { user } = useStore()
    const { roles = [] } = user.info || {}
    const isPermitted = roles.some((role: any) => role.roleName.includes(roleName))
    return isPermitted
}

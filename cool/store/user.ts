import { defineStore } from "pinia"
import { ref } from "vue"
import { deepMerge, storage } from "../utils"
import { useProjectStore } from "./project"
import { router } from "../router"
import { service } from "../service"
import type { User } from "../types"

// 本地缓存
const data = storage.info()

const useUserStore = defineStore("user", function () {
    const projectStore = useProjectStore()
    // 标识
    const token = ref(data.token || "")

    // 本次登录是否已经在首页展示过消息横幅
    const hasShownHomeMessageBanner = ref(false)

    // 设置标识
    function setToken(data: User.Token) {
        token.value = data.token

        // 访问
        storage.set("token", data.token, data.expire - 5)
        // 刷新
        storage.set("refreshToken", data.refreshToken, data.refreshExpire - 5)
    }

    // 重置首页消息横幅展示标识（通常在登录成功时调用）
    function resetHomeMessageBanner() {
        hasShownHomeMessageBanner.value = false
    }

    // 记录已经展示过首页消息横幅
    function markHomeMessageBannerShown() {
        hasShownHomeMessageBanner.value = true
    }

    // Web OAuth 未接统一 refresh 接口时占位，避免旧 cool 服务报错
    async function refreshToken() {
        const t = token.value
        if (t) return t
        throw new Error("no token")
    }

    // 用户信息
    const info = ref<User.Info | undefined>(data.userInfo)
    // 权限列表
    const permissions = ref<string[]>([])
    // 角色列表
    const roles = ref<string[]>(data.roles || [])

    // 设置用户信息
    function set(value: User.Info) {
        info.value = value
        storage.set("userInfo", value)
    }

    // 设置角色信息
    function setRoles(value: string[]) {
        roles.value = value
        storage.set("roles", value)
    }

    // 更新用户信息
    async function update(data: User.Info & { [key: string]: any }) {
        set(deepMerge(info.value, data))
        return service.user.info.updatePerson(data)
    }

    // 清除用户
    function clear() {
        storage.remove("userInfo")
        storage.remove("oauthUser")
        storage.remove("token")
        storage.remove("refreshToken")
        storage.remove("roles")
        // 同步清理项目选择
        projectStore.clear()
        token.value = ""
        info.value = undefined
        roles.value = []
        hasShownHomeMessageBanner.value = false
    }

    // 退出
    function logout() {
        clear()
        router.login({ reLaunch: true })
    }

    // 与 NCMP-GS 一致：企业列表 + OAuth 登录时写入的 oauthUser
    async function get() {
        if (!token.value) {
            return
        }

        return service
            .request({
                url: "/companyApp/home/getMineListByDeptId",
                method: "GET",
            })
            .then((res: any) => {
                const mines = Array.isArray(res?.data) ? res.data : []
                const projectList = mines.map((m: any) => ({
                    id: m.mineId,
                    projectName: m.mineName,
                    ...m,
                }))
                if (projectList.length) {
                    projectStore.setList(projectList)
                }

                permissions.value = []
                const oauth = storage.get("oauthUser")
                if (oauth && typeof oauth === "object") {
                    const mapped: any = {
                        ...(info.value || {}),
                        userName: oauth.username,
                        nickName: oauth.staffName,
                        staffId: oauth.staffId,
                        deptName: oauth.deptName,
                    }
                    set(mapped as User.Info)
                    return mapped
                }
                return info.value
            })
            .catch(() => {
                logout()
            })
    }

    return {
        token,
        setToken,
        hasShownHomeMessageBanner,
        resetHomeMessageBanner,
        markHomeMessageBannerShown,
        refreshToken,
        info,
        permissions,
        roles,
        get,
        set,
        setRoles,
        update,
        logout,
    }
})

export { useUserStore }
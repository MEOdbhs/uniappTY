import dev from "./dev"
import prod from "./prod"

// 是否开发模式
export const isDev = import.meta.env.MODE === "development"

// 忽略 token 校验的接口路径（完整 URL 子串匹配）
export const ignoreTokens = [
    ".*auth/oauth/token.*",
    ".*sysm/afs/afsCheck.*",
    ".*sysm/systemParam/getByParamCode.*",
    "/login",
    "/captchaImage",
    "/register",
    "/sendSms",
    "/AppVersionManage/listNoPage",
]

// 代理环境
const proxy = isDev ? dev : prod

// 配置
export const config = {
    fileUploadUrl: isDev ? "http://172.26.1.51:38080" : "http://172.26.1.51:38080",
    //fileUploadUrl: isDev ? "http://172.26.1.63:18085" : "http://172.26.1.63:18085",
    // 应用信息
    app: {
        // 应用名称
        name: "中国煤科-常州院",
        // 应用描述
        desc: "uniapp快速开发脚手架",
        // 页面配置
        pages: {
            login: "/pages/user/login",
        },
        // 微信配置
        wx: {
            debug: false,
        },
        version: '1.0.2',
    },

    // 忽略
    ignore: {
        token: ignoreTokens,
    },

    ...proxy,
}

export * from "./proxy"

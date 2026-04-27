<template>
    <cl-upload v-model="displayValue" :multiple="multiple" :limit="limit" :auto-upload="false" :text="text" :size="size"
        :image-mode="imageMode" :disabled="disabled" @exceed="handleExceed" @upload="handleUpload"
        @success="handleSuccess" @error="handleError" @change="handleChange" @remove="handleRemove">
        <slot></slot>
    </cl-upload>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { useStore } from "@/cool/store"
import { config } from "/@/config"

interface Props {
    modelValue?: any[] | any
    multiple?: boolean
    limit?: number
    text?: string
    size?: number[]
    imageMode?: string
    disabled?: boolean
    uploadUrl?: string
    uploadName?: string
    formData?: Record<string, any>
}

function buildDownloadUrl(path: string) {
    const cleanPath = String(path || "")
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")
    // 与 PC 端上传组件保持同一下载地址拼接规则。
    return `/company/companyApp/file/download?fileName=${cleanPath}&fileUrl=${cleanPath}`
}

/** H5/小程序本地预览、临时地址，不是服务端相对路径，不能走下载接口拼接 */
function isClientOnlyFilePath(path: string) {
    const s = String(path || "").trim()
    if (!s) return true
    if (s.startsWith("blob:")) return true
    if (s.startsWith("data:")) return true
    if (s.startsWith("file://")) return true
    if (s.startsWith("wxfile://")) return true
    if (s.startsWith("ttfile://")) return true
    if (s.startsWith("http://tmp/") || s.startsWith("https://tmp/")) return true
    return false
}

function toDisplayFileUrl(path: string) {
    if (isClientOnlyFilePath(path)) {
        return path
    }
    return buildDownloadUrl(path)
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => [],
    multiple: false,
    limit: 9,
    text: "添加图片",
    size: () => [200, 200],
    imageMode: "aspectFill",
    disabled: false,
    uploadUrl: "/company/companyApp/file/upload",
    uploadName: "file",
    formData: () => ({}),
})

const emit = defineEmits<{
    "update:modelValue": [value: any[] | any]
    exceed: [list: any[]]
    success: [data: any, file: any]
    error: [error: any]
    change: [value: any[] | any]
    remove: [index: number]
}>()

const { user } = useStore()
const Authorization = "Bearer " + user.token
const headers = {
    Authorization: Authorization,
}

// 存储 URL 到 parseData 的映射关系
const urlToDataMap = ref<Map<string, any>>(new Map())

// 显示值（URL 数组或字符串，用于 cl-upload 组件显示）
const displayValue = ref<string | string[]>(props.multiple ? [] : "")

// 监听外部传入的 value，转换为 displayValue（URL）
watch(
    () => props.modelValue,
    (val) => {
        if (!val || (Array.isArray(val) && val.length === 0)) {
            displayValue.value = props.multiple ? [] : ""
            urlToDataMap.value.clear()
            return
        }

        const dataList = Array.isArray(val) ? val : [val]
        const urlList: string[] = []

        dataList.forEach((data: any) => {
            if (data && typeof data === "object") {
                // 从对象中提取 path（支持多种字段名）
                const path = data.path || data.url || data.data?.url || ""
                if (path) {
                    const displayUrl = toDisplayFileUrl(path)
                    urlList.push(displayUrl)
                    urlToDataMap.value.set(displayUrl, data)
                }
            } else if (typeof data === "string") {
                const displayUrl = toDisplayFileUrl(data)
                urlList.push(displayUrl)
                urlToDataMap.value.set(displayUrl, data)
            }
        })

        displayValue.value = props.multiple ? urlList : urlList[0] || ""
    },
    { immediate: true }
)

// 处理超出限制
function handleExceed(list: any[]) {
    emit("exceed", list)
}

// 自定义上传处理函数
function handleUpload({
    file,
    done,
    fail,
    update,
    uid,
}: {
    file: any
    done: (url: string) => void
    fail: (message?: string) => void
    update: (uid: string, data: any) => void
    uid: string
}) {
    // 使用 uni.uploadFile 进行自定义上传
    const uploadTask = uni.uploadFile({
        url: config.fileUploadUrl + props.uploadUrl,
        filePath: file.path,
        name: props.uploadName,
        header: headers,
        formData: props.formData,
        success: (res) => {
            try {
                // 解析服务器返回的数据
                const parseData = JSON.parse(res.data)

                // 根据接口返回格式，获取文件 path
                const path = parseData.path || parseData.data?.path || ""

                if (path) {
                    const displayUrl = toDisplayFileUrl(path)
                    // 构建 { name, path } 结构的数据，与 PC 端保持一致
                    const fileData = {
                        name: parseData.name || parseData.data?.name || "",
                        path: path,
                    }
                    urlToDataMap.value.set(displayUrl, fileData)
                    done(displayUrl)
                } else {
                    fail("上传失败：未获取到文件地址")
                }
            } catch (error) {
                fail("上传失败：解析响应数据错误")
            }
        },
        fail: (err) => {
            // 上传失败，调用 fail 回调
            fail(err.errMsg || "上传失败")
        },
    })

    // 监听上传进度
    uploadTask.onProgressUpdate((res) => {
        // 更新上传进度，res.progress 是 0-100 的数值
        update(uid, { progress: res.progress })
    })
}

// 处理上传成功
function handleSuccess(url: string, file: any) {
    const fileData = urlToDataMap.value.get(url)
    if (fileData) {
        emit("success", fileData, file)
    }
}

// 处理上传错误
function handleError(err: any) {
    emit("error", err)
    uni.showToast({
        title: err || "上传失败",
        icon: "none",
    })
}

// 处理值变化（当 cl-upload 的 modelValue 变化时）
function handleChange(value: string | string[]) {
    // 将 download URL 数组转换为原始数据对象数组
    const urlList = Array.isArray(value) ? value : value ? [value] : []
    const dataList = urlList
        .map((url) => urlToDataMap.value.get(url) || url)
        .filter((item) => item)

    const result = props.multiple ? dataList : dataList[0] || null

    emit("update:modelValue", result)
    emit("change", result)
}

// 处理移除
function handleRemove(index: number) {
    // 获取当前 displayValue 对应的 URL
    const urlList = Array.isArray(displayValue.value)
        ? displayValue.value
        : displayValue.value
            ? [displayValue.value]
            : []
    const removedUrl = urlList[index]

    // 从映射中移除
    if (removedUrl) {
        urlToDataMap.value.delete(removedUrl)
    }

    emit("remove", index)

    // cl-upload 会自动更新 displayValue 并触发 @change 事件，所以这里不需要手动调用 handleChange
}
</script>

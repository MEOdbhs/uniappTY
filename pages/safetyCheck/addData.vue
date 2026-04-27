<template>
    <cl-page statusBarBackground="#4474FF" backgroundColor="#EFF3FD" fullscreen>
        <view class="bg-color"></view>
        <cl-topbar :title="tabTitle" background-color="#4474FF" color="#fff" :border="false"></cl-topbar>
        <view class="add-experience-page">
            <scroll-view class="form-container" scroll-y>
                <cl-form v-model="formData" class="form-content" ref="formRef" :rules="rules" :disabled="saving"
                    label-position="top">
                    <cl-form-item class="form-item" label="工地名称" prop="mineId" required>
                        <cl-select v-model="formData.mineId" :options="mineOptions" :border="false"
                            placeholder="请选择工地"></cl-select>
                    </cl-form-item>
                    <cl-form-item class="form-item" label="检查类型" prop="checkType" required>
                        <cl-select v-model="formData.checkType" :options="checkTypeOptions" :border="false" disabled
                            placeholder="请选择检查类型"></cl-select>
                    </cl-form-item>
                    <cl-form-item class="form-item" label="时间范围" prop="timeRange" required>
                        <cl-select v-model="formData.timeRange" :options="periodOptions" :border="false"
                            placeholder="请选择时间范围"></cl-select>
                    </cl-form-item>
                    <cl-form-item class="form-item" label="检查时间" prop="checkTime" required>
                        <cl-select-date v-model="formData.checkTime" :border="false"
                            placeholder="请选择检查时间"></cl-select-date>
                    </cl-form-item>
                    <cl-form-item class="form-item" label="检查状态" prop="checkStatus" required>
                        <cl-select v-model="formData.checkStatus" :options="checkStatusOptions" :border="false"
                            placeholder="请选择检查状态"></cl-select>
                    </cl-form-item>
                    <cl-form-item class="form-item" label="评分" prop="score">
                        <cl-input v-model="formData.score" type="number" placeholder="请输入评分(0-100)" clearable
                            :border="false"></cl-input>
                    </cl-form-item>
                    <cl-form-item class="form-item-other" label="检查情况" prop="checkSituation">
                        <cl-textarea v-model="formData.checkSituation" placeholder="请输入检查情况" clearable :height="260"
                            :maxlength="500"></cl-textarea>
                    </cl-form-item>
                    <cl-form-item class="form-item-other" label="整改情况" prop="rectification">
                        <cl-textarea v-model="formData.rectification" placeholder="请输入整改情况" clearable :height="260"
                            :maxlength="500"></cl-textarea>
                    </cl-form-item>
                    <cl-form-item class="form-item-other" label="备注" prop="remarks">
                        <cl-textarea v-model="formData.remarks" placeholder="请输入备注" clearable :height="260"
                            :maxlength="500"></cl-textarea>
                    </cl-form-item>
                    <cl-form-item class="form-item-other" label="检查报告" prop="fileList">
                        <CommonUpload v-model="formData.fileList" multiple :limit="9" text="添加附件" />
                    </cl-form-item>
                </cl-form>
            </scroll-view>

            <!-- 底部按钮 -->
            <view class="form-footer">
                <button v-if="!isEdit" class="footer-btn btn-reset" @tap="handleReset">重置</button>
                <button class="footer-btn btn-submit" :class="{ 'btn-full': isEdit }" @tap="handleSubmit">{{
                    isEdit ? '保存' : '提交' }}</button>
            </view>
        </view>
    </cl-page>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from "vue"
import { useCool, useStore } from "/@/cool"
import CommonUpload from "@/components/commonUpload.vue"
import {
    saveSafetyCheck,
    getSafetyCheckDetail
} from "./api"

const { router } = useCool()
const { project } = useStore()
const editId = ref("")
const isEdit = computed(() => !!editId.value)
const tabTitle = computed(() => {
    const typeLabel = formData.checkType === '1' ? "安全检查" : "资产检查"
    return isEdit.value ? `编辑${typeLabel}` : `新增${typeLabel}`
})

const mineOptions = computed(() =>
    Array.isArray(project.list)
        ? project.list.map((item: any) => ({
            label: item.mineName || item.projectName || "-",
            value: String(item.mineId || item.id || ""),
        }))
        : []
)

const formRef = ref()
const saving = ref(false)

// 表单数据
const formData = reactive({
    mineId: "",
    checkType: "",
    timeRange: "",
    checkTime: "",
    checkStatus: "",
    score: "" as string | number,
    checkSituation: "",
    rectification: "",
    remarks: "",
    fileList: [] as any[],
})

// 表单校验规则
const rules = {
    mineId: [{ required: true, message: "请选择工地名称", trigger: "change" }],
    checkType: [{ required: true, message: "请选择检查类型", trigger: "change" }],
    timeRange: [{ required: true, message: "请选择时间范围", trigger: "change" }],
    checkTime: [{ required: true, message: "请选择检查时间", trigger: "change" }],
    checkStatus: [{ required: true, message: "请选择检查状态", trigger: "change" }],
}

// 工地选项
const siteOptions = ref<any[]>([])

// 时间范围选项
const periodOptions = [
    { label: "月度", value: "1" },
    { label: "季度", value: "2" },
    { label: "年度", value: "3" },
]

// 检查类型选项
const checkTypeOptions = [
    { label: "安全检查", value: "1" },
    { label: "资产检查", value: "2" },
]

// 检查状态选项
const checkStatusOptions = [
    { label: "待检测", value: "0" },
    { label: "已完成", value: "1" },
    { label: "整改中", value: "2" },
]

// 重置
const handleReset = () => {
    uni.showModal({
        title: "提示",
        content: "确定要重置表单吗？",
        success: (res) => {
            if (res.confirm) {
                formData.mineId = ""
                formData.checkType = ""
                formData.timeRange = ""
                formData.checkTime = ""
                formData.checkStatus = ""
                formData.score = ""
                formData.checkSituation = ""
                formData.rectification = ""
                formData.remarks = ""
                formData.fileList = []
                uni.showToast({
                    title: "已重置",
                    icon: "success",
                })
            }
        },
    })
}

// 提交
const handleSubmit = async () => {
    try {
        await formRef.value?.validate(async (valid: boolean) => {
            if (!valid) {
                return
            }
            if (formData.score !== "" && formData.score !== undefined) {
                const scoreNum = Number(formData.score)
                if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
                    uni.showToast({
                        title: "评分必须在0-100之间",
                        icon: "none",
                    })
                    return
                }
            }

            try {
                saving.value = true
                uni.showLoading({
                    title: "提交中...",
                })

                const submitData: any = {
                    ...(isEdit.value ? { id: editId.value } : {}),
                    mineId: formData.mineId,
                    checkType: formData.checkType,
                    timeRange: formData.timeRange,
                    checkTime: formData.checkTime,
                    checkStatus: formData.checkStatus,
                    score: formData.score || 0,
                    checkSituation: formData.checkSituation,
                    rectification: formData.rectification,
                    remarks: formData.remarks,
                    mediaUrls: formData.fileList
                        .map((item) => {
                            const p = item?.path || item?.url || item?.data?.url
                            if (p && typeof p === "string") {
                                if (/^(blob:|data:|file:\/\/|wxfile:\/\/|ttfile:\/\/)/i.test(p) || p.startsWith("http://tmp/") || p.startsWith("https://tmp/")) {
                                    return ""
                                }
                                return p
                            }
                            if (typeof item === "string") {
                                if (/^(blob:|data:|file:\/\/|wxfile:\/\/|ttfile:\/\/)/i.test(item) || item.startsWith("http://tmp/") || item.startsWith("https://tmp/")) {
                                    return ""
                                }
                                return item
                            }
                            return ""
                        })
                        .filter(Boolean)
                        .join(","),
                    mineName: siteOptions.value.find((s) => s.value === formData.mineId)?.label || "",
                    checkTypeName: checkTypeOptions.find((o) => o.value === formData.checkType)?.label || "",
                    checkStatusName: checkStatusOptions.find((o) => o.value === formData.checkStatus)?.label || "",
                    timeRangeName: periodOptions.find((o) => o.value === formData.timeRange)?.label || "",
                }

                await saveSafetyCheck(submitData)
                uni.hideLoading()
                uni.showToast({
                    title: isEdit.value ? "保存成功" : "提交成功",
                    icon: "success",
                })

                setTimeout(() => {
                    uni.navigateBack()
                }, 1500)
            } catch (error: any) {
                uni.hideLoading()
                uni.showToast({
                    title: error.message || "提交失败",
                    icon: "none",
                })
            } finally {
                saving.value = false
            }
        })
    } catch {
        uni.showToast({
            title: "请填写必填项",
            icon: "none",
        })
        return
    }


}
const fetchEditDetail = async () => {
    if (!editId.value) return
    try {
        uni.showLoading({ title: "加载中..." })
        const res = await getSafetyCheckDetail({ id: editId.value })
        const data = res?.data
        if (data && typeof data === "object" && !Array.isArray(data)) {
            formData.mineId = String(data.mineId || "")
            formData.checkType = String(data.checkType || "")
            formData.timeRange = String(data.timeRange || "")
            formData.checkTime = data.checkTime || ""
            formData.checkStatus = String(data.checkStatus ?? "")
            formData.score = data.score ?? ""
            formData.checkSituation = data.checkSituation || ""
            formData.rectification = data.rectification || ""
            formData.remarks = data.remarks || ""
            if (data.mediaUrls) {
                formData.fileList = String(data.mediaUrls)
                    .split(",")
                    .filter(Boolean)
                    .map((url: string) => ({ name: url, path: url }))
            }
        }
    } catch (e: any) {
        uni.showToast({
            title: e?.message || "获取详情失败",
            icon: "none",
        })
    } finally {
        uni.hideLoading()
    }
}

onMounted(() => {
    const routeInfo = router.info()
    editId.value = routeInfo?.query?.id || ""
    formData.checkType = String(routeInfo?.query?.checkType || 1)
    if (editId.value) {
        fetchEditDetail()
    }
})
</script>

<style lang="scss" scoped>
.add-experience-page {
    height: calc(100% - 88rpx);
    display: flex;
    flex-direction: column;
    background-color: #f5f7fa;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #ebeef5;
}

.page-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #303133;
}

.form-container {
    flex: 1;
    overflow: hidden;
}


.form-content {
    margin: 20rpx 24rpx;
    padding: 20rpx 23rpx 32rpx 23rpx;

    :deep(.cl-form-item) {
        font-size: 21rpx;
        margin-bottom: 0;

        .cl-form-item__label {
            color: #949DAD;
        }

        .cl-select-inner {
            background: none;
        }

        .cl-select-inner__value {
            text-align: right;
            font-size: 21rpx;
        }

        .cl-icon-arrow-bottom:before {
            content: '\e806';
        }

        .cl-input {
            background: none;
            text-align: right;
            font-size: 21rpx !important;
        }

        &.is-required .cl-form-item__label {
            &::before {
                content: "*";
                color: #f56c6c;
                margin-right: 6rpx;
            }

            &::after {
                display: none;
            }
        }

        .cl-textarea {
            background: #FFFFFF;
            border-radius: 15rpx;
            border: 1rpx solid #A9BFFF;
            padding: 20rpx 25rpx;
            box-sizing: border-box;

            .cl-textarea__inner {
                font-size: 21rpx;
            }
        }
    }

    .form-item {
        flex-direction: row;
        align-items: center;
        height: 102rpx;
        border-bottom: 1px solid #C6D7FF;
        padding-left: 8rpx;

        &:first-child {
            border-top: 1px solid #C6D7FF;
        }
    }

    .form-item-other {
        margin-top: 22rpx;
    }
}

.form-footer {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20rpx;
    height: 146rpx;
    background: #FFFFFF;
    box-shadow: 8rpx 0rpx 10rpx 0rpx rgba(169, 191, 255, 0.5);

    .footer-btn {
        width: 292rpx;
        height: 83rpx;
        background: #949DAD;
        border-radius: 21rpx;
        font-size: 29rpx;
        color: #FFFFFF;
        line-height: 83rpx;
        margin: 0;
    }

    .btn-reset {
        background: #949DAD;
    }

    .btn-submit {
        background: #4474FF;
    }

    .btn-full {
        width: 604rpx;
    }
}
</style>

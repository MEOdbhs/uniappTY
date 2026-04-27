<template>
    <cl-page>
        <cl-topbar title="检查详情" background-color="#4474FF" color="#fff" :border="false"></cl-topbar>
        <view class="detail-page-inner">
            <view class="detail-stack">
                <view class="rcp-row">
                    <text class="rcp-label">工地名称</text>
                    <text class="rcp-value">{{ item.mineName || "-" }}</text>
                </view>
                <view class="rcp-row">
                    <text class="rcp-label">检查类型</text>
                    <text class="rcp-value">{{ item.checkTypeName }}</text>
                </view>
                <view class="rcp-row">
                    <text class="rcp-label">时间范围</text>
                    <text class="rcp-value">{{ item.timeRangeName }}</text>
                </view>
                <view class="rcp-row">
                    <text class="rcp-label">检查时间</text>
                    <text class="rcp-value">{{ item.checkTime || "-" }}</text>
                </view>
                <view class="rcp-row">
                    <text class="rcp-label">检查状态</text>
                    <text class="rcp-value">{{ item.checkStatusName }}</text>
                </view>
                <view class="rcp-row">
                    <text class="rcp-label">评分</text>
                    <text class="rcp-value">{{ item.score || "-" }}</text>
                </view>
                <view class="rcp-row rcp-row--column">
                    <text class="rcp-label" style="margin-bottom:20rpx">检查情况</text>
                    <view class="textarea-like">{{ item.checkSituation || "-" }}</view>
                </view>
                <view class="rcp-row rcp-row--column">
                    <text class="rcp-label" style="margin-bottom:20rpx">整改情况</text>
                    <view class="textarea-like">{{ item.rectification || "-" }}</view>
                </view>
                <view class="rcp-row rcp-row--column">
                    <text class="rcp-label" style="margin-bottom:20rpx">备注</text>
                    <view class="textarea-like">{{ item.remarks || "-" }}</view>
                </view>
                <view class="rcp-row rcp-row--column">
                    <text class="rcp-label" style="margin-bottom:20rpx">检查报告</text>
                    <template v-if="displayMediaUrls.length > 0">
                        <CommonUpload v-model="displayMediaUrls" :multiple="true" :disabled="true" />
                    </template>
                    <template v-else>
                        <text class="rcp-value">
                            暂无检查报告
                        </text>
                    </template>
                </view>
            </view>
        </view>
    </cl-page>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useCool } from "/@/cool"
import { getSafetyCheckDetail } from "./api"
import CommonUpload from "@/components/commonUpload.vue"

const { router } = useCool()

const item = ref<Record<string, any>>({})
const detailId = ref("")

const displayMediaUrls = computed(() => {
    const raw = item.value.mediaUrls
    if (raw == null || raw === "") return []
    const parts = String(raw)
        .split(",")
        .filter(Boolean).map(url => ({ name: url, path: url }))
    console.log(parts, 'parts')
    return parts
})

const fetchDetail = async () => {
    if (!detailId.value) {
        return
    }
    try {
        const res = await getSafetyCheckDetail({ id: detailId.value })
        const data = res?.data
        item.value = data && typeof data === "object" && !Array.isArray(data) ? data : {}
    } catch (e: any) {
        uni.showToast({
            title: e?.message || "获取详情失败",
            icon: "none",
        })
    }
}

onMounted(() => {
    const routeInfo = router.info()
    detailId.value = String(routeInfo?.query?.id ?? "")
    fetchDetail()
})
</script>

<style lang="scss" scoped>
/* 报修详情页通用：浅底、白卡片、左侧蓝条标题、行样式 */
.detail-page-shell {
    background: #e8f0fc;
    box-sizing: border-box;
}

.detail-page-inner {
    padding: 24rpx;
    padding-top: 0;
    margin-top: 24rpx !important;
    padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.detail-tabs {
    background: #ffffff;
    border-bottom: 1rpx solid #e8ecf4;
}

.detail-tabs__inner {
    display: flex;
    flex-direction: row;
    align-items: stretch;
}

.detail-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx 16rpx 20rpx;
    position: relative;
}

.detail-tab__text {
    font-size: 30rpx;
    color: #909399;
    line-height: 1.3;
}

.detail-tab.is-active .detail-tab__text {
    color: #13144f;
    font-weight: 700;
}

.detail-tab.is-active::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 64rpx;
    height: 6rpx;
    background: #4474ff;
    border-radius: 3rpx;
}

.detail-stack {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}

.rcp-card {
    background: #ffffff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 24rpx rgba(26, 59, 161, 0.06);
}

.rcp-card__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 24rpx 24rpx 20rpx;
    border-bottom: 1rpx solid #e8efff;
    box-sizing: border-box;
}

.rcp-card__bar {
    width: 8rpx;
    height: 32rpx;
    background: linear-gradient(180deg, #4474ff 0%, #1a3ba1 100%);
    border-radius: 4rpx;
    margin-right: 16rpx;
    flex-shrink: 0;
}

.rcp-card__title {
    font-size: 32rpx;
    font-weight: 700;
    color: #13144f;
    line-height: 1.3;
}

.rcp-card__body {
    padding: 0 24rpx 8rpx;
    box-sizing: border-box;
}

.rcp-card__body--flush {
    padding-top: 8rpx;
}

.rcp-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 26rpx 0;
    border-bottom: 1rpx solid #e8efff;
    min-height: 88rpx;
    box-sizing: border-box;
}

.rcp-row:last-child {
    border-bottom: none;
}

.rcp-row--column {
    flex-direction: column;
    align-items: flex-start;
    padding-top: 20rpx;
    padding-bottom: 24rpx;
}

.rcp-label {
    font-size: 28rpx;
    color: #5a6b8a;
    flex-shrink: 0;
    max-width: 46%;
}

.rcp-value {
    font-size: 28rpx;
    color: #13144f;
    flex: 1;
    text-align: right;
    margin-left: 24rpx;
    min-width: 0;
    word-break: break-all;
}

/* 胶囊类数值不占满整行，宽度随文字 + 内边距 */
.rcp-value.rcp-pill {
    flex: 0 0 auto;
    width: auto;
    min-width: 0;
    margin-left: 24rpx;
    text-align: center;
}

.rcp-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8rpx 22rpx;
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 600;
}

.rcp-pill--blue {
    color: #4474ff;
    background: rgba(68, 116, 255, 0.12);
    border: 1rpx solid rgba(68, 116, 255, 0.4);
}

.rcp-pill--green {
    color: #3ebd49;
    background: rgba(62, 189, 73, 0.1);
    border: 1rpx solid rgba(62, 189, 73, 0.45);
}

.rcp-pill--orange {
    color: #eda933;
    background: rgba(237, 169, 51, 0.12);
    border: 1rpx solid rgba(237, 169, 51, 0.45);
}

.rcp-pill--muted {
    color: #606266;
    background: #f5f7fa;
    border: 1rpx solid #e5eaf3;
}

.textarea-like {
    width: 100%;
    min-height: 160rpx;
    padding: 20rpx;
    border: 2rpx solid #d8e4ff;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #13144f;
    line-height: 1.45;
    word-break: break-all;
    background: #fafcff;
    box-sizing: border-box;
    white-space: pre-wrap;
}

.detail-footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    display: flex;
    flex-direction: row;
    gap: 24rpx;
    padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
    background: #ffffff;
    box-shadow: 0 -4rpx 24rpx rgba(26, 59, 161, 0.08);
    box-sizing: border-box;
}

.detail-footer__btn {
    flex: 1;
    height: 96rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 600;
    color: #ffffff;
}

.detail-footer__btn--primary {
    background: #4474FF;
    box-shadow: 0 8rpx 20rpx rgba(26, 59, 161, 0.3);
}

.detail-footer__btn--soft {
    background: #4474FF;
    box-shadow: 0 6rpx 16rpx rgba(68, 116, 255, 0.25);
}

/* 参考 pages_auto/technology/detail.vue：顶栏不要用 fixed、不要用 page-spacer 占位。
 * cl-page 已渲染状态栏，顶栏随文档流排在下方，避免 App 上 fixed+占位误差导致白底盖住导航栏。 */
.repair-page-shell {
    position: relative;
    min-height: 100vh;
    background-color: #eef1f6;
    box-sizing: border-box;
}

.repair-page-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 560rpx;
    background: linear-gradient(180deg, #4474ff 0%, rgba(68, 116, 255, 0.12) 55%, transparent 100%);
    pointer-events: none;
    z-index: 0;
}

.repair-page-body {
    position: relative;
    z-index: 1;
    min-height: calc(100vh - 88rpx);
}

/* 施工记录列表样式 */
.log-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}

.log-card {
    background: #ffffff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 24rpx rgba(26, 59, 161, 0.06);
}

.log-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    box-sizing: border-box;
}

.log-header-left {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    flex: 1;
}

.log-time {
    font-size: 32rpx;
    font-weight: 600;
    color: #13144f;
    line-height: 1.3;
}

.log-mine {
    font-size: 28rpx;
    color: #909399;
    line-height: 1.3;
}

.log-header-right {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16rpx;
    flex-shrink: 0;
}

.log-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8rpx 22rpx;
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 600;
}

.status-normal {
    color: #3ebd49;
    background: rgba(62, 189, 73, 0.1);
    border: 1rpx solid rgba(62, 189, 73, 0.45);
}

.status-overtime {
    color: #eda933;
    background: rgba(237, 169, 51, 0.12);
    border: 1rpx solid rgba(237, 169, 51, 0.45);
}

.status-stop {
    color: #f56c6c;
    background: rgba(245, 108, 108, 0.1);
    border: 1rpx solid rgba(245, 108, 108, 0.45);
}

.status-pending {
    color: #409eff;
    background-color: rgba(64, 158, 255, 0.1);
    border: 1rpx solid rgba(64, 158, 255, 0.45);
}

.status-unknown {
    color: #909399;
    background-color: rgba(144, 147, 153, 0.1);
    border: 1rpx solid rgba(144, 147, 153, 0.45);
}

.log-arrow {
    transition: transform 0.3s ease;
}

.log-arrow.is-expanded {
    transform: rotate(180deg);
}

.log-body {
    padding: 0 24rpx 24rpx;
    box-sizing: border-box;
}
</style>

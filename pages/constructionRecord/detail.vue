<template>
    <cl-page>
        <cl-topbar title="施工详情" background-color="#4474FF" color="#fff" :border="false"></cl-topbar>
        <view class="detail-page-inner">
            <view class="detail-stack">
                <!-- 施工记录列表 -->
                <view class="log-list">
                    <view v-for="(item, index) in logList" :key="index" class="log-card">
                        <view class="log-header" @tap="toggleExpand(index)">
                            <view class="log-header-left">
                                <text class="log-time">{{ item.createDateTime }}</text>
                                <text class="log-mine">{{ item.mineName }}</text>
                            </view>
                            <view class="log-header-right">
                                <text class="log-status" :class="getStatusClass(item.afterStatusDesc)">{{
                                    item.afterStatusDesc }}</text>
                                <view class="log-arrow" :class="{ 'is-expanded': expandedSet.has(index) }">
                                    <cl-icon name="arrow-bottom" :size="28" color="#909399" />
                                </view>
                            </view>
                        </view>
                        <view v-show="expandedSet.has(index)" class="log-body">
                            <template v-if="item.afterStatusDesc === '加班施工'">
                                <view class="rcp-row">
                                    <text class="rcp-label">加班日期</text>
                                    <text class="rcp-value">{{ item.overtimeDate || "-" }}</text>
                                </view>
                                <view class="rcp-row">
                                    <text class="rcp-label">加班时段</text>
                                    <text class="rcp-value">{{ item.overtimeStartTime || "-" }} - {{
                                        item.overtimeEndTime || "-" }}</text>
                                </view>
                                <view class="rcp-row">
                                    <text class="rcp-label">作业人数</text>
                                    <text class="rcp-value">{{ item.overtimePersonCount || "-" }}</text>
                                </view>
                                <view class="rcp-row">
                                    <text class="rcp-label">班组</text>
                                    <text class="rcp-value">{{ item.team || "-" }}</text>
                                </view>
                                <view class="rcp-row">
                                    <text class="rcp-label">负责人</text>
                                    <text class="rcp-value">{{ item.personInCharge || "-" }}</text>
                                </view>
                                <view class="rcp-row">
                                    <text class="rcp-label">负责人电话</text>
                                    <text class="rcp-value">{{ item.phone || "-" }}</text>
                                </view>
                                <view class="rcp-row rcp-row--column">
                                    <text class="rcp-label" style="margin-bottom:20rpx">作业内容</text>
                                    <view class="textarea-like">{{ item.workContent || "-" }}</view>
                                </view>
                            </template>
                            <template v-else-if="item.afterStatusDesc === '下班'">
                                <view class="rcp-row">
                                    <text class="rcp-label">次日开工时间</text>
                                    <text class="rcp-value">{{ item.nextDayStartTime || "-" }}</text>
                                </view>
                                <view class="rcp-row rcp-row--column">
                                    <text class="rcp-label" style="margin-bottom:20rpx">备注</text>
                                    <view class="textarea-like">{{ item.remarks || "-" }}</view>
                                </view>
                            </template>
                            <template v-else>
                                <view class="rcp-row rcp-row--column">
                                    <text class="rcp-label" style="margin-bottom:20rpx">备注</text>
                                    <view class="textarea-like">{{ item.remarks || "-" }}</view>
                                </view>
                            </template>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </cl-page>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useCool } from "/@/cool"
import { getConstructionRecordDetail } from "./api"
const { router } = useCool()
const queryParams = ref({
    mineId: "",
    changeDateStart: "",
    changeDateEnd: "",
})
const logList = ref<any[]>([])
const expandedSet = ref<Set<number>>(new Set())

const toggleExpand = (index: number) => {
    const newSet = new Set(expandedSet.value)
    if (newSet.has(index)) {
        newSet.delete(index)
    } else {
        newSet.add(index)
    }
    expandedSet.value = newSet
}

const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
        "正常施工": "status-normal",
        "加班施工": "status-overtime",
        "停工": "status-stop",
        "下班": "status-pending",
        "未知": "status-unknown",
    }
    return statusMap[status] || "status-unknown"
}

const fetchDetail = async () => {
    const res = await getConstructionRecordDetail(queryParams.value)
    console.log('res', res)
    logList.value = res?.data || []
}
onMounted(() => {
    const routeInfo = router.info()
    queryParams.value.mineId = routeInfo?.query?.mineId || ""
    queryParams.value.changeDateStart = routeInfo?.query?.time || ""
    queryParams.value.changeDateEnd = routeInfo?.query?.time || ""
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

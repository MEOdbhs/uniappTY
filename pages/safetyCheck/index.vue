<template>
    <cl-page>
        <cl-topbar :title="tabTitle" background-color="#4474FF" color="#fff" :border="false"></cl-topbar>
        <view class="tech-document-page">
            <view class="filter-section">
                <view class="search-header">
                    <view class="search-box">
                        <view class="search-input-wrap">
                            <input v-model="queryParams.mineName" class="native-input" placeholder="请输入工地名称"
                                placeholder-class="native-input-placeholder" confirm-type="search"
                                @confirm="handleSearch" />
                            <image src="/static/icon/TecLibrary/F.png" class="search-icon" mode="aspectFit"
                                @click="handleSearch" />
                        </view>
                    </view>
                    <view class="filter-btn" @tap="openFilterPopup">
                        <image src="/static/icon/TecLibrary/E.png" class="filter-icon" mode="aspectFit" />
                        <text class="filter-text">筛选</text>
                    </view>
                </view>

                <cl-popup v-model="filterPopupVisible" direction="center" :padding="0" background-color="transparent"
                    :show-header="false">
                    <view class="filter-popup filter-popup--floating">
                        <view class="filter-popup__header">
                            <text class="filter-popup__title">全部条件</text>
                            <view class="filter-popup__close-wrap" @tap="filterPopupVisible = false">
                                <cl-icon name="close" :size="40" />
                            </view>
                        </view>
                        <scroll-view v-if="selectedFilterChips.length" scroll-x class="filter-popup__chips"
                            show-scrollbar="false">
                            <view class="filter-popup__chips-inner">
                                <view v-for="(chip, idx) in selectedFilterChips" :key="idx" class="filter-chip"
                                    @tap="removeFilterChip(chip)">
                                    <text class="filter-chip__text">{{ chip.label }}</text>
                                    <text class="filter-chip__x">×</text>
                                </view>
                            </view>
                        </scroll-view>
                        <view class="filter-popup__body">
                            <scroll-view scroll-y class="filter-popup__nav">
                                <view v-for="g in filterGroupList" :key="g.id"
                                    :class="['filter-nav-item', { active: activeFilterGroup === g.id }]"
                                    @tap="activeFilterGroup = g.id">
                                    {{ g.label }}
                                </view>
                            </scroll-view>
                            <scroll-view v-if="showOptionGrid" scroll-y class="filter-popup__options">
                                <view class="filter-option-grid">
                                    <view v-for="opt in currentGroupOptions" :key="String(opt.value) + '-' + opt.label"
                                        :class="['filter-option-cell', { selected: isOptionSelected(opt) }]"
                                        @tap="toggleOption(opt)">
                                        {{ opt.label }}
                                    </view>
                                </view>
                            </scroll-view>
                            <view v-else-if="activeFilterGroup === 'checkTime'"
                                class="filter-popup__options filter-popup__options--author">
                                <view class="date-picker-container">
                                    <!-- <view class="date-picker-label">开始时间</view> -->
                                    <picker mode="date" :value="draftCheckStartTime" @change="onStartTimeChange">
                                        <view class="date-picker-input">
                                            {{ draftCheckStartTime || '请选择时间' }}
                                        </view>
                                    </picker>
                                </view>
                                <!-- <view class="date-picker-container">
                                    <view class="date-picker-label">结束时间</view>
                                    <picker mode="date" :value="draftCheckEndTime" @change="onEndTimeChange">
                                        <view class="date-picker-input">
                                            {{ draftCheckEndTime || '请选择结束时间' }}
                                        </view>
                                    </picker>
                                </view> -->
                            </view>
                        </view>
                        <view class="filter-popup__footer">
                            <view class="filter-popup__btn filter-popup__btn--reset" @tap="resetFilterDraft">重置</view>
                            <view class="filter-popup__btn filter-popup__btn--confirm" @tap="confirmFilter">确定</view>
                        </view>
                    </view>
                </cl-popup>
            </view>

            <view class="document-list">
                <cl-scroller class="scroller" @down="handleRefresh" ref="scrollerRef" @up="handleLoadMore">
                    <view v-if="documentList.length === 0" class="empty-box">
                        <text class="empty-text">暂无数据</text>
                    </view>
                    <view v-else class="document-list-inner">
                        <view v-for="(item, index) in documentList" :key="item.id || index" class="document-item"
                            @click="handleView(item)">
                            <view class="item-header">
                                <view class="item-title">{{ item.mineName }}</view>
                                <view :class="[
                                    'status-tag',
                                    getStatusClass(item.checkStatusName),
                                ]">
                                    {{ item.checkStatusName }}
                                </view>
                            </view>
                            <view class="item-meta-row">
                                <text class="meta-label">评分：</text>
                                <text class="meta-value">{{
                                    item.score || "-"
                                }}</text>
                            </view>
                            <view class="item-footer">
                                <view class="footer-left">
                                    <text class="footer-name">{{ item.timeRangeName || "-" }}</text>
                                </view>
                                <text class="footer-time">{{ item.checkTime || "-" }}</text>
                            </view>
                        </view>
                    </view>
                </cl-scroller>
            </view>

            <button class="add-btn" @click="handleAdd">
                <cl-icon class="add-btn-icon" name="plus-border" />
                <text>新增{{ tabTitle }}</text>
            </button>
        </view>
    </cl-page>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue"
import { useCool } from "/@/cool"
import { getSafetyCheckList } from "./api"
import { onShow } from "@dcloudio/uni-app"

const { router } = useCool()
const tabTitle = computed(() => queryParams.value.checkType == 1 ? "安全检查" : "资产检查")

const queryParams = ref({
    page: 1,
    pageSize: 10,
    checkTime: "",
    checkStatus: "" as string | number,
    timeRange: "1" as string | number,
    checkType: 1,
    mineName: "",
})

const documentList = ref<any[]>([])
const total = ref(0)
const loading = ref(false)

const filterPopupVisible = ref(false)
const activeFilterGroup = ref<"checkTime" | "checkStatus" | "timeRange">("checkTime")
const draftCheckStartTime = ref("")
const draftCheckEndTime = ref("")
const draftCheckStatus = ref<string | number>("")
const draftTimeRange = ref<string | number>("")

const filterGroupList = [
    { id: "checkTime" as const, label: "检查时间" },
    { id: "checkStatus" as const, label: "检查状态" },
    { id: "timeRange" as const, label: "检查范围" },
]

const checkStatusOptions = [
    { label: "待检测", value: "0" },
    { label: "已完成", value: "1" },
    { label: "整改中", value: "2" },
    { label: "已超时", value: "3" },
]

const timeRangeOptions = [
    { label: "月度", value: "1" },
    { label: "季度", value: "2" },
    { label: "年度", value: "3" },
]

const showOptionGrid = computed(() =>
    ["checkStatus", "timeRange"].includes(activeFilterGroup.value),
)

const currentGroupOptions = computed(() => {
    const empty = { label: "全部", value: "" }
    switch (activeFilterGroup.value) {
        case "checkStatus":
            return [empty, ...checkStatusOptions]
        case "timeRange":
            return [...timeRangeOptions]
        default:
            return []
    }
})

const selectedFilterChips = computed(() => {
    const chips: { label: string; groupId: string }[] = []
    if (draftCheckStartTime.value) {
        chips.push({ label: `检查时间：${draftCheckStartTime.value}`, groupId: "checkTime" })
    }
    if (draftCheckEndTime.value) {
        chips.push({ label: `结束时间：${draftCheckEndTime.value}`, groupId: "checkTime" })
    }
    if (draftCheckStatus.value !== "" && draftCheckStatus.value != null) {
        const f = checkStatusOptions.find((c) => c.value === draftCheckStatus.value)
        if (f) chips.push({ label: `检查状态：${f.label}`, groupId: "checkStatus" })
    }
    if (draftTimeRange.value !== "" && draftTimeRange.value != null) {
        const f = timeRangeOptions.find((c) => c.value === draftTimeRange.value)
        if (f) chips.push({ label: `检查范围：${f.label}`, groupId: "timeRange" })
    }
    return chips
})

function openFilterPopup() {
    draftCheckStartTime.value = queryParams.value.checkTime || ""
    draftCheckStatus.value = queryParams.value.checkStatus || ""
    draftTimeRange.value = queryParams.value.timeRange || ""
    activeFilterGroup.value = "checkTime"
    filterPopupVisible.value = true
}

function isOptionSelected(opt: { label: string; value: string | number }) {
    const g = activeFilterGroup.value
    if (g === "checkStatus") return draftCheckStatus.value == opt.value
    if (g === "timeRange") return draftTimeRange.value == opt.value
    return false
}

function toggleOption(opt: { label: string; value: string | number }) {
    const g = activeFilterGroup.value
    if (g === "checkStatus") {
        draftCheckStatus.value = draftCheckStatus.value == opt.value ? "" : opt.value
        return
    }
    if (g === "timeRange") {
        draftTimeRange.value = draftTimeRange.value == opt.value ? "" : opt.value
    }
}

function onStartTimeChange(e: any) {
    draftCheckStartTime.value = e.detail.value
}

function onEndTimeChange(e: any) {
    draftCheckEndTime.value = e.detail.value
}

function removeFilterChip(chip: { label: string; groupId: string }) {
    if (chip.groupId === "checkTime") {
        if (chip.label.includes("开始时间")) {
            draftCheckStartTime.value = ""
        } else if (chip.label.includes("结束时间")) {
            draftCheckEndTime.value = ""
        }
    }
    if (chip.groupId === "checkStatus") draftCheckStatus.value = ""
    if (chip.groupId === "timeRange") draftTimeRange.value = ""
}

function resetFilterDraft() {
    draftCheckStartTime.value = ""
    draftCheckEndTime.value = ""
    draftCheckStatus.value = ""
    draftTimeRange.value = ""
}

function confirmFilter() {
    queryParams.value.checkTime = draftCheckStartTime.value
    queryParams.value.checkStatus = draftCheckStatus.value === "" ? "" : draftCheckStatus.value
    queryParams.value.timeRange = draftTimeRange.value === "" ? "" : draftTimeRange.value
    filterPopupVisible.value = false
    handleSearch()
}

function handleSearch() {
    queryParams.value.page = 1
    documentList.value = []
    total.value = 0
    fetchList()
}

function handleLoadMore() {
    if (documentList.value.length >= total.value && total.value > 0) {
        return
    }
    if (loading.value) {
        return
    }
    queryParams.value.page += 1
    fetchList()
}

async function handleRefresh(end?: () => void) {
    queryParams.value.page = 1
    documentList.value = []
    total.value = 0
    await fetchList()
    if (end) end()
}

async function fetchList() {
    console.log(1111)
    if (loading.value) {
        return
    }
    loading.value = true
    try {
        const res = await getSafetyCheckList(queryParams.value)
        const rows = res?.data?.records || []
        if (queryParams.value.page === 1) {
            documentList.value = rows
        } else {
            documentList.value = [...documentList.value, ...rows]
        }
        total.value = res?.data?.total || 0
    } catch (error: any) {
        console.error("获取安全检查列表失败", error)
        uni.showToast({
            title: error.message || "获取安全检查列表失败",
            icon: "none",
        })
    } finally {
        loading.value = false
    }
}

function handleView(item: any) {
    if (item.checkStatusName === "待检测" || item.checkStatusName === "整改中") {
        router.push({
            path: "/pages/safetyCheck/addData",
            query: {
                id: item.id.trim(),
                checkType: queryParams.value.checkType,
            },
        })
    } else {
        router.push({
            path: "/pages/safetyCheck/detail",
            query: {
                id: item.id.trim(),
            },
        })
    }
}

function handleAdd() {
    router.push({
        path: "/pages/safetyCheck/addData",
        query: {
            checkType: queryParams.value.checkType,
        },
    })
}


function getStatusClass(statusName: string): string {
    const statusMap: Record<string, string> = {
        "待检测": "status-pending",
        "已完成": "status-completed",
        "整改中": "status-rectifying",
        "已超时": "status-timeout",
    }
    return statusMap[statusName] || "status-pending"
}

onShow(() => {
    const routeInfo = router.info()
    queryParams.value.checkType = Number(routeInfo?.query?.checkType || 1)
    fetchList()
})
</script>

<style lang="scss" scoped>
/* 与 TechExperience.vue 一致：整体渐变圆角白边容器 + filter-section 内搜索条 */
.tech-document-page {
    flex: 1;
    min-height: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    width: 708rpx;
    max-width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    background: linear-gradient(180deg, #f6f8fc 0%, #ffffff 100%);
    border-radius: 21rpx;
    border: 2rpx solid #ffffff;
    overflow: hidden;
}

.filter-section {
    padding: 25rpx 15rpx 0 20rpx;
    flex-shrink: 0;

    .search-header {
        background-color: transparent;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        gap: 20rpx;
    }

    .search-box {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        width: 571rpx;
        max-width: calc(100% - 100rpx);
        height: 73rpx;
        padding: 18rpx 26rpx 18rpx 32rpx;
        background: #ffffff;
        box-shadow: 0rpx 4rpx 10rpx 0rpx rgba(198, 215, 255, 0.3);
        border-radius: 94rpx;
        border: 2rpx solid #c6d7ff;
    }

    .search-input-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 16rpx;
        min-width: 0;
    }

    .native-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        height: 64rpx;
        line-height: 64rpx;
        background: transparent;
        border: none;
        min-width: 0;
    }

    .native-input-placeholder {
        color: #c0c4cc;
        font-size: 28rpx;
    }

    .search-icon {
        width: 40rpx;
        height: 40rpx;
        flex-shrink: 0;
    }

    .filter-btn {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
        flex-shrink: 0;
    }

    .filter-icon {
        width: 32rpx;
        height: 32rpx;
    }

    .filter-text {
        font-size: 22rpx;
        color: #000000;
        white-space: nowrap;
    }
}

.filter-popup {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background-color: #fff;
}

.filter-popup--floating {
    width: 90vw;
    max-width: 690rpx;
    height: 65vh;
    max-height: 900rpx;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 12rpx 48rpx rgba(19, 20, 79, 0.18);
}

.filter-popup__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 28rpx 32rpx 20rpx;
    border-bottom: 1rpx solid #eef0f4;
}

.filter-popup__title {
    font-size: 32rpx;
    font-weight: 600;
    color: #303133;
}

.filter-popup__close-wrap {
    position: absolute;
    right: 24rpx;
    top: 50%;
    transform: translateY(-50%);
    padding: 8rpx;
}

.filter-popup__chips {
    flex-shrink: 0;
    max-height: 120rpx;
    background-color: #f5f7fa;
    padding: 16rpx 24rpx;
    white-space: nowrap;
}

.filter-popup__chips-inner {
    display: inline-flex;
    flex-direction: row;
    gap: 16rpx;
    padding-right: 24rpx;
}

.filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 20rpx;
    background-color: #fff;
    border-radius: 8rpx;
    font-size: 24rpx;
    color: #606266;
    border: 1rpx solid #c6d7ff;
}

.filter-chip__x {
    color: #909399;
    font-size: 28rpx;
    line-height: 1;
}

.filter-popup__body {
    flex: 1;
    display: flex;
    flex-direction: row;
    min-height: 0;
    height: 0;
}

.filter-popup__nav {
    width: 200rpx;
    flex-shrink: 0;
    background-color: #f5f7fa;
    border-right: 1rpx solid #eef0f4;
}

.filter-nav-item {
    padding: 28rpx 20rpx;
    font-size: 26rpx;
    color: #606266;
    border-left: 6rpx solid transparent;

    &.active {
        background-color: #fff;
        color: #13144f;
        font-weight: 600;
        border-left-color: #4873fa;
    }
}

.filter-popup__options {
    flex: 1;
    min-width: 0;
    padding: 20rpx 24rpx;
    background-color: #fff;
}

.filter-popup__options--author {
    flex: 1;
    min-height: 220rpx;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.author-input {
    width: 100%;
    box-sizing: border-box;
    padding: 24rpx;
    font-size: 28rpx;
    border: 2rpx solid #c6d7ff;
    border-radius: 12rpx;
    background-color: #fafbfc;
    min-height: 88rpx;
}

.date-picker-container {
    margin-bottom: 24rpx;
}

.date-picker-label {
    font-size: 28rpx;
    color: #606266;
    margin-bottom: 12rpx;
    font-weight: 500;
}

.date-picker-input {
    width: 100%;
    box-sizing: border-box;
    padding: 24rpx;
    font-size: 28rpx;
    border: 2rpx solid #c6d7ff;
    border-radius: 12rpx;
    background-color: #fafbfc;
    min-height: 88rpx;
    color: #303133;
}

.filter-option-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20rpx;
}

.filter-option-cell {
    width: calc((100% - 20rpx) / 2);
    box-sizing: border-box;
    padding: 22rpx 16rpx;
    text-align: center;
    font-size: 26rpx;
    color: #4873fa;
    border: 2rpx solid #c6d7ff;
    border-radius: 12rpx;
    background-color: #fff;

    &.selected {
        background: linear-gradient(135deg, #4873fa 0%, #1b2cd2 100%);
        color: #fff;
        border-color: transparent;
    }
}

.filter-popup__footer {
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    gap: 24rpx;
    padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid #eef0f4;
    background-color: #fff;
    box-sizing: border-box;
}

.filter-popup__btn {
    flex: 1;
    text-align: center;
    padding: 26rpx 0;
    font-size: 30rpx;
    border-radius: 16rpx;
    font-weight: 500;
}

.filter-popup__btn--reset {
    background-color: #e8eaed;
    color: #606266;
}

.filter-popup__btn--confirm {
    background: linear-gradient(135deg, #4873fa 0%, #1b2cd2 100%);
    color: #fff;
}

.document-list {
    flex: 1;
    position: relative;
    overflow: hidden;
    min-height: 0;
}

.scroller {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.document-list-inner {
    padding: 16rpx 20rpx 200rpx;
    box-sizing: border-box;
}

.empty-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400rpx;
}

.empty-text {
    color: #909399;
    font-size: 28rpx;
}

.document-item {
    margin-top: 20rpx;
    position: relative;
    padding: 28rpx 24rpx;
    margin-bottom: 5rpx;
    padding-bottom: 5rpx;
    border: 1rpx solid #e8ecf4;
    overflow: visible;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(241, 251, 254, 0.7) 100%);
    box-shadow: 0px 2px 8px 0px rgba(75, 120, 250, 0.2);
    border-radius: 20px 20px 20px 20px;
}

.item-header {
    position: relative;
    margin-bottom: 20rpx;
    min-height: 44rpx;
}

.item-title {
    padding-right: 140rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

/* 左侧半圆 + 右侧直角贴卡片右缘 */
.status-tag {
    position: absolute;
    right: -24rpx;
    top: 0;
    z-index: 1;
    padding: 10rpx 24rpx 10rpx 28rpx;
    font-size: 22rpx;
    font-weight: 500;
    color: #fff;
    border-radius: 28rpx 0 0 28rpx;
    line-height: 1.2;
}

.status-pending {
    background-color: #409eff;
}

.status-completed {
    background-color: #67c23a;
}

.status-rectifying {
    background-color: #e6a23c;
}

.status-timeout {
    background-color: #f56c6c;
}

.item-meta-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12rpx;
    font-size: 26rpx;
    line-height: 1.5;
}

.item-mineNames {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12rpx;
    font-size: 26rpx;
    flex-wrap: wrap;
    gap: 8rpx;
}

.meta-label {
    color: #909399;
    margin-right: 8rpx;
    flex-shrink: 0;
}

.meta-value {
    color: #606266;
    flex: 1;
    word-break: break-all;
}

.mineName-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    flex: 1;
}

.mineName-tag {
    padding: 6rpx 16rpx;
    font-size: 22rpx;
    color: #4873fa;
    background-color: rgba(198, 215, 255, 0.45);
    border-radius: 8rpx;
}

.item-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-left: -24rpx;
    margin-right: -24rpx;
    padding-left: 24rpx;
    padding-right: 24rpx;

    /* 正文与底栏分隔：略偏蓝的灰线；2rpx 避免部分机型上 1rpx 发虚看不清 */
    border-top: 2rpx solid #c5d3e6;
    background-color: #f7f9fc;
    border-radius: 0 0 12rpx 12rpx;
    padding-bottom: 0;
    padding-top: 10rpx;
}

.footer-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12rpx;
    min-width: 0;
    flex: 1;
}

.footer-avatar {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    box-sizing: border-box;
    border: 2rpx solid #b8d0ff;
    background: linear-gradient(135deg, #e8eeff 0%, #d4e3ff 100%);
    color: #4a7aff;
    font-size: 24rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.footer-name {
    font-size: 26rpx;
    font-weight: 500;
    color: #4474ff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200rpx;
}

.dept-tag {
    padding: 6rpx 14rpx;
    font-size: 22rpx;
    color: #7c6bb5;
    background-color: #f0ebff;
    border: 1rpx solid #b8a9e8;
    border-radius: 8rpx;
    flex-shrink: 0;
}

.footer-time {
    font-size: 24rpx;
    color: #909399;
    flex-shrink: 0;
}

/* 与 TechExperience.vue「新增经验」一致 */
.add-btn {
    position: fixed;
    bottom: 140rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 417rpx;
    max-width: calc(100% - 48rpx);
    box-sizing: border-box;
    z-index: 30;
    height: 84rpx;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background: #4474ff;
    box-shadow: 0rpx 4rpx 10rpx 0rpx rgba(68, 116, 255, 0.3);
    border-radius: 83rpx;
    border: 2rpx solid #ffffff;
    font-size: 29rpx;
    line-height: 1;
    color: #ffffff;

    &::after {
        border: none;
    }

    .add-btn-icon {
        margin-right: 20rpx;
        flex-shrink: 0;
        font-size: 40rpx;
        color: #ffffff;
    }
}
</style>

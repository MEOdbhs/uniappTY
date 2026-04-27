<template>
    <view class="app-root">
        <view class="app-root__inner">
            <view class="phone">
                <!-- Header -->
                <view class="phone__header">
                    <view class="phone__header-left">
                        <text class="phone__greeting">xxx部门 | xxx角色</text>
                        <view class="phone__title-row">
                            <text class="phone__name">张三</text>
                            <view class="phone__tag">
                                <text class="phone__tag-text">施工单位</text>
                            </view>
                        </view>
                    </view>
                    <view class="phone__avatar-wrap">
                        <view class="phone__avatar">
                            <HomeIcon name="user" :size="40" color="#fff" />
                        </view>
                        <view class="phone__avatar-dot" />
                    </view>
                </view>

                <scroll-view scroll-y class="phone__scroll" :show-scrollbar="false">
                    <view class="phone__scroll-inner">
                        <!-- Hero stats -->
                        <view class="stat-card">
                            <view class="stat-card__glow" />
                            <view class="stat-card__top">
                                <view class="stat-card__titles">
                                    <text class="stat-card__headline">今日工地概览</text>
                                </view>
                                <view class="stat-card__bell">
                                    <HomeIcon name="bell" :size="36" color="#fff" />
                                </view>
                            </view>
                            <view class="stat-card__grid">
                                <view v-for="(stat, idx) in STATS" :key="idx" class="stat-card__cell"
                                    :style="statEnterStyle(idx)">
                                    <text class="stat-card__value">{{ stat.value }}</text>
                                    <text class="stat-card__label">{{ stat.label }}</text>
                                </view>
                            </view>
                        </view>

                        <!-- Quick actions row 1 -->
                        <view class="actions">
                            <view class="actions__row">
                                <view v-for="(item, idx) in NAV_ROW1" :key="'r1-' + idx" class="actions__item"
                                    hover-class="actions__item--hover" :hover-stay-time="0">
                                    <view class="actions__icon" :class="navIconBoxClass(item.color, 1)">
                                        <HomeIcon :name="item.icon" :size="44" :color="navIconStroke(item, 1)" />
                                    </view>
                                    <text class="actions__label">{{ item.label }}</text>
                                </view>
                            </view>
                            <view class="actions__row actions__row--second">
                                <view v-for="(item, idx) in NAV_ROW2" :key="'r2-' + idx" class="actions__item"
                                    hover-class="actions__item--hover" @tap="handleTap(item)">
                                    <view class="actions__icon" :class="navIconBoxClass(item.color, 2)">
                                        <HomeIcon :name="item.icon" :size="44" :color="navIconStroke(item, 2)" />
                                    </view>
                                    <text class="actions__label">{{ item.label }}</text>
                                </view>
                            </view>
                        </view>

                        <!-- Alerts -->
                        <view class="alerts">
                            <view class="alerts__head">
                                <text class="alerts__title">最新预警</text>
                                <text class="alerts__seeall">全部</text>
                            </view>
                            <view class="alerts__list">
                                <view v-for="(alert, idx) in ALERTS" :key="idx" class="alerts__card"
                                    hover-class="alerts__card--hover" :style="alertEnterStyle(idx)">
                                    <view class="alerts__icon" :class="alert.typeColorClass">
                                        <HomeIcon name="alert" :size="36" color="#fff" />
                                    </view>
                                    <view class="alerts__body">
                                        <view class="alerts__row1">
                                            <text class="alerts__card-title">{{ alert.title }}</text>
                                            <text class="alerts__status" :class="alert.statusTextClass">
                                                {{ alert.status }}
                                            </text>
                                        </view>
                                        <text class="alerts__loc">{{ alert.location }}</text>
                                    </view>
                                    <view class="alerts__chev">
                                        <HomeIcon name="chevron-right" :size="32" color="#d1d5db" />
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </scroll-view>



            </view>
        </view>
        <tabbar />
    </view>
</template>

<script lang="ts" setup>
import { onPullDownRefresh } from "@dcloudio/uni-app"
import Tabbar from "@/pages/index/components/tabbar.vue"
import HomeIcon from "./components/HomeIcon.vue"
import { useCool, useStore } from "/@/cool"
const { router } = useCool()

const STATS = [
    { label: "正常施工", value: "5" },
    { label: "今日预警", value: "12" },
    { label: "处置中", value: "6" },
    { label: "已闭环", value: "4" },
    { label: "在线设备", value: "60/82" }
]

const NAV_ITEMS = [
    { icon: "alert" as const, label: "预警处置", color: "bg-red-50 text-red-500" },
    { icon: "video" as const, label: "视频监控", color: "bg-blue-50 text-blue-500" },
    { icon: "barchart" as const, label: "安全监测", color: "bg-indigo-50 text-indigo-500" },
    { icon: "upload" as const, label: "数据导入", color: "bg-emerald-50 text-emerald-500" },
    { icon: "book" as const, label: "安全智库", color: "bg-amber-50 text-amber-500" },
    { icon: "clipboard" as const, label: "安全检查", color: "bg-blue-50 text-blue-500", path: "/pages/safetyCheck/index?checkType=1" },
    { icon: "package" as const, label: "资产检查", color: "bg-orange-50 text-orange-500", path: "/pages/safetyCheck/index?checkType=2" },
    { icon: "hardhat" as const, label: "施工记录", color: "bg-green-50 text-green-500", path: "/pages/constructionRecord/index" }
]

const NAV_ROW1 = NAV_ITEMS.slice(0, 4)
const NAV_ROW2 = NAV_ITEMS.slice(4, 8)

const ALERTS = [
    {
        type: "红色预警",
        title: "明火检测",
        location: "XXXX工地·B区3楼施工区域",
        time: "2026/06/21 13:23:00",
        status: "待处置",
        typeColorClass: "alerts__icon--red",
        statusTextClass: "alerts__status--orange"
    },
    {
        type: "橙色预警",
        title: "高空未系安全带",
        location: "XXXX工地·塔吊作业区",
        time: "2026/06/21 13:23:00",
        status: "待处置",
        typeColorClass: "alerts__icon--orange",
        statusTextClass: "alerts__status--orange"
    },
    {
        type: "橙色预警",
        title: "区域入侵",
        location: "XXXX工地·基坑围挡区域",
        time: "2026/06/21 13:23:00",
        status: "待处置",
        typeColorClass: "alerts__icon--orange",
        statusTextClass: "alerts__status--orange"
    }
]

const handleTap = (item: { path: string }) => {
    if (item.path) {
        router.push({
            path: item.path,
        })
    }
}

/** Mirrors App.tsx `item.color.replace(...)` for nav icon boxes */
function navIconBoxClass(color: string, row: 1 | 2): string {
    let c = color
    if (row === 1) {
        c = c
            .replace("bg-blue-50", "bg-indigo-100")
            .replace("bg-red-50", "bg-rose-100")
            .replace("bg-emerald-50", "bg-emerald-100")
            .replace("text-blue-500", "text-indigo-600")
            .replace("text-red-500", "text-rose-600")
    } else {
        c = c
            .replace("bg-blue-50", "bg-indigo-100")
            .replace("bg-amber-50", "bg-orange-100")
            .replace("bg-orange-50", "bg-rose-100")
            .replace("bg-green-50", "bg-emerald-100")
            .replace("text-blue-500", "text-indigo-600")
            .replace("text-amber-500", "text-orange-600")
    }
    return mapTailwindPairToClass(c)
}

/** 与 .nav-pair--* 的 `color` 一致，供 image/svg dataURL 用（无法使用 currentColor） */
const NAV_STROKE_BY_CLASS: Record<string, string> = {
    "nav-pair--rose": "#e11d48",
    "nav-pair--indigo": "#4f46e5",
    "nav-pair--indigo-soft": "#6366f1",
    "nav-pair--emerald": "#10b981",
    "nav-pair--orange": "#ea580c",
    "nav-pair--rose-orange": "#f97316",
    "nav-pair--emerald-green": "#22c55e"
}

function navIconStroke(item: { color: string }, row: 1 | 2) {
    const cls = navIconBoxClass(item.color, row)
    return NAV_STROKE_BY_CLASS[cls] || "#4f46e5"
}

/** Map combined bg/text utility string to a single BEM class */
function mapTailwindPairToClass(s: string): string {
    const key = s.trim()
    const map: Record<string, string> = {
        "bg-rose-100 text-rose-600": "nav-pair--rose",
        "bg-indigo-100 text-indigo-600": "nav-pair--indigo",
        "bg-indigo-50 text-indigo-500": "nav-pair--indigo-soft",
        "bg-emerald-100 text-emerald-500": "nav-pair--emerald",
        "bg-orange-100 text-orange-600": "nav-pair--orange",
        "bg-rose-100 text-orange-500": "nav-pair--rose-orange",
        "bg-emerald-100 text-green-500": "nav-pair--emerald-green"
    }
    return map[key] || "nav-pair--indigo"
}

function statEnterStyle(idx: number) {
    return {
        animation: `homeFadeUp 0.35s ease ${idx * 0.05}s both`
    }
}

function alertEnterStyle(idx: number) {
    return {
        animation: `homeFadeX 0.35s ease ${0.2 + idx * 0.1}s both`
    }
}

onPullDownRefresh(() => {
    uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
$phone-w: 750rpx;
$pad: 32rpx;
$phone-h: 1440rpx;

@keyframes homeFadeUp {
    from {
        opacity: 0;
        transform: translateY(20rpx);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes homeFadeX {
    from {
        opacity: 0;
        transform: translateX(-20rpx);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.app-root {
    min-height: 100vh;
    background: #f3f4f9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0;
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.app-root__inner {
    width: 100%;
    max-width: $phone-w;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-sizing: border-box;
}

.phone {
    width: 100%;
    max-width: 750rpx;
    min-height: $phone-h;
    background: #fff;
    box-shadow: 0 50rpx 100rpx rgba(15, 23, 42, 0.12);
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
}

.phone__header {
    padding: 64rpx 64rpx 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    z-index: 20;
}

.phone__greeting {
    font-size: 24rpx;
    color: #9ca3af;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.phone__title-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 4rpx;
}

.phone__name {
    font-size: 40rpx;
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
}

.phone__tag {
    padding: 4rpx 16rpx;
    border: 2rpx solid #e0e7ff;
    border-radius: 16rpx;
    background: #eef2ff;
}

.phone__tag-text {
    font-size: 18rpx;
    font-weight: 700;
    color: #4f46e5;
    letter-spacing: -0.02em;
    text-transform: uppercase;
}

.phone__avatar-wrap {
    position: relative;
}

.phone__avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: linear-gradient(to top right, #fb7185, #fdba74);
    border: 4rpx solid #fff;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
}

.phone__avatar-dot {
    position: absolute;
    top: -4rpx;
    right: -4rpx;
    width: 24rpx;
    height: 24rpx;
    background: #4f46e5;
    border: 4rpx solid #fff;
    border-radius: 50%;
}

.phone__scroll {
    flex: 1;
    height: 0;
    width: 100%;
    box-sizing: border-box;
    /* 横向内边距放在 scroll-view 上，避免子项 width:100% 在部分端吃掉右侧间距 */
    padding: 0 48rpx 200rpx;
}

.phone__scroll-inner {
    padding: 32rpx 0 48rpx;
    display: flex;
    flex-direction: column;
    gap: 48rpx;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
}

.stat-card {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    background: linear-gradient(135deg, #4f46e5 0%, #336bea 50%, #5b7efd 100%);
    border-radius: 48rpx;
    padding: 48rpx;
    min-height: 320rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    box-shadow: 0 24rpx 80rpx rgba(79, 70, 229, 0.25);
}

.stat-card__glow {
    position: absolute;
    top: 0;
    right: 0;
    width: 256rpx;
    height: 256rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(40%, -40%);
    filter: blur(40rpx);
}

.stat-card__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    z-index: 1;
}

.stat-card__kicker {
    font-size: 20rpx;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.2em;
    text-transform: uppercase;
}

.stat-card__headline {
    font-size: 48rpx;
    font-weight: 700;
    color: #fff;
    margin-top: 8rpx;
    letter-spacing: -0.02em;
}

.stat-card__bell {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);
    border-radius: 24rpx;
    padding: 16rpx;
}

.stat-card__grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    column-gap: 4rpx;
    row-gap: 0;
    margin-top: 40rpx;
    position: relative;
    z-index: 1;
}

.stat-card__cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
    padding: 0 2rpx;
}

.stat-card__value {
    font-size: 40rpx;
    font-weight: 800;
    line-height: 1.1;
    color: #fff;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    letter-spacing: -0.04em;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.stat-card__label {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.88);
    font-weight: 500;
    line-height: 1.2;
    margin-top: 4rpx;
    white-space: nowrap;
    text-align: center;
    max-width: 100%;
}

.actions__row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32rpx;
}

.actions__row--second {
    margin-top: 48rpx;
}

.actions__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
}

.actions__item--hover {
    opacity: 0.92;
}

.actions__icon {
    width: 112rpx;
    height: 112rpx;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 0.3s;
}

.actions__item:active .actions__icon {
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.nav-pair--rose {
    background: #ffe4e6;
    color: #e11d48;
}

.nav-pair--indigo {
    background: #e0e7ff;
    color: #4f46e5;
}

.nav-pair--indigo-soft {
    background: #eef2ff;
    color: #6366f1;
}

.nav-pair--emerald {
    background: #d1fae5;
    color: #10b981;
}

.nav-pair--orange {
    background: #ffedd5;
    color: #ea580c;
}

.nav-pair--rose-orange {
    background: #ffe4e6;
    color: #f97316;
}

.nav-pair--emerald-green {
    background: #d1fae5;
    color: #22c55e;
}

.actions__label {
    font-size: 20rpx;
    font-weight: 700;
    color: #6b7280;
    letter-spacing: -0.02em;
    text-transform: uppercase;
}

.alerts {
    display: flex;
    flex-direction: column;
    gap: 32rpx;
}

.alerts__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.alerts__title {
    font-size: 36rpx;
    font-weight: 800;
    color: #1f2937;
    letter-spacing: -0.02em;
}

.alerts__seeall {
    margin: 0;
    padding: 0;
    font-size: 24rpx;
    font-weight: 700;
    color: #4f46e5;
    background: transparent;
    border: none;
    line-height: 1.4;
}

.alerts__list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}

.alerts__card {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: #f9fafb;
    border-radius: 32rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;
}

.alerts__card--hover {
    background: #fff;
    border-color: #f3f4f6;
    box-shadow: 0 32rpx 64rpx rgba(79, 70, 229, 0.05);
}

.alerts__icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    flex-shrink: 0;

    &--red {
        background: #ef4444;
    }

    &--orange {
        background: #f97316;
    }
}

.alerts__body {
    margin-left: 24rpx;
    flex: 1;
    min-width: 0;
}

.alerts__row1 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
}

.alerts__card-title {
    font-size: 28rpx;
    font-weight: 700;
    color: #1f2937;
}

.alerts__status {
    font-size: 20rpx;
    font-weight: 700;
    flex-shrink: 0;

    &--orange {
        color: #f97316;
    }
}

.alerts__loc {
    font-size: 20rpx;
    color: #9ca3af;
    font-weight: 500;
    margin-top: 4rpx;
    max-width: 300rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.alerts__chev {
    margin-left: 16rpx;
    display: flex;
    align-items: center;
}

.phone__tabbar {
    height: 160rpx;
    background: #fff;
    border-top: 2rpx solid #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 48rpx;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
}

.phone__tabbar-item {
    display: flex;
    align-items: center;
    justify-content: center;
}

.phone__home-indicator {
    position: absolute;
    bottom: 16rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 256rpx;
    height: 6rpx;
    background: #e5e7eb;
    border-radius: 999rpx;
    z-index: 25;
}
</style>

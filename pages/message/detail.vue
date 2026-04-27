<template>
    <cl-page class="detail-page" statusBarBackground="#4474FF">
        <cl-topbar title="消息详情" background-color="#4474ff" color="#ffffff" :border="false">

        </cl-topbar>
		<view class="bg-color"></view>

        <view class="detail-content">
            <view class="detail-card">
                <view class="detail-card__section-head">
                    <view class="detail-card__bar" />
                    <text class="detail-card__section-title">{{ sectionLabel }}</text>
                </view>
                <view class="detail-card__divider" />

                <view class="detail-card__meta">
                    <text class="detail-card__msg-title">{{ msgData.title || "消息标题" }}</text>
                    <text class="detail-card__time">{{ formatDetailTime(msgData.sendTime) }}</text>
                </view>

                <view class="detail-card__body">
                    <text class="detail-card__content-text">{{ msgData.content || "" }}</text>
                </view>
            </view>
        </view>
    </cl-page>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { getMessageList, updateReadFlag } from "./api";

const msgData = ref<any>({});

function getTypeText(typeText: string) {
    if (!typeText) return "通知";
    const typeMap: Record<string, string> = {
        任务: "任务",
        新品技术: "新品技术",
        运维风采: "运维风采",
        行业政策: "行业政策",
        通知: "通知",
        提醒: "提醒",
    };
    return typeMap[typeText] || typeText || "通知";
}

function getTypeLineLabel(typeText: string) {
    const t = getTypeText(typeText);
    if (t.includes("任务")) return "任务消息";
    return `${t}消息`;
}

const sectionLabel = computed(() => getTypeLineLabel(msgData.value?.typeText || ""));

function formatDetailTime(time: string) {
    if (!time) return "";
    const d = new Date(time);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
}

function goBack() {
    uni.navigateBack();
}

function isRead(readFlag: any): boolean {
    if (readFlag === true || readFlag === 1) return true;
    return false;
}

async function fetchDetail() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1] as any;
    const options = currentPage.options || currentPage.$page?.options || {};
    const id = options.id;

    if (!id) {
        uni.showToast({
            title: "消息ID不存在",
            icon: "none",
        });
        setTimeout(() => goBack(), 1500);
        return;
    }

    try {
        const res = await getMessageList({
            pageSize: 500,
        });

        if (res && res.rows) {
            const message = res.rows.find((item: any) => item.id == id);
            if (message) {
                msgData.value = message;

                if (!isRead(message.readFlag)) {
                    try {
                        await updateReadFlag({ anntId: message.id });
                        message.readFlag = 1;
                    } catch (error) {
                        console.error("标记已读失败:", error);
                    }
                }
            } else {
                uni.showToast({
                    title: "消息不存在",
                    icon: "none",
                });
                setTimeout(() => goBack(), 1500);
            }
        }
    } catch (error) {
        console.error("获取消息详情失败:", error);
        uni.showToast({
            title: "加载失败",
            icon: "none",
        });
    }
}

onMounted(() => {
    fetchDetail();
});
</script>

<style lang="scss" scoped>
$primary: #4474ff;

.detail-page {

}

.detail-content {
    position: relative;
    min-height: calc(100vh - 88rpx);
    padding: 20rpx;
    box-sizing: border-box;
}

.bg-color {
	position: absolute;
	top: 0;
	left: 0;
	height: 960rpx;
	width: 100%;
    background: linear-gradient( 180deg, #DDF1FF 0%, #EFF3FD 100%);
}

.detail-card {
    height: 100%;
    background: linear-gradient( 180deg, #F6F8FC 0%, #FFFFFF 100%);
    border-radius: 21rpx;
    border: 2rpx solid #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    box-sizing: border-box;
}

.detail-card__section-head {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 14rpx;
}

.detail-card__bar {
    width: 6rpx;
    height: 32rpx;
    border-radius: 3rpx;
    background-color: $primary;
    margin-right: 15rpx;
    flex-shrink: 0;
}

.detail-card__section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1f2d3d;
}

.detail-card__divider {
    height: 1rpx;
    background-color: #C6D7FF;
    margin: 30rpx 0 50rpx 0;
}

.detail-card__meta {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24rpx;
    margin-bottom: 42rpx;
}

.detail-card__msg-title {
    flex: 1;
    min-width: 0;
    font-size: 30rpx;
    font-weight: 600;
    color: #13144F;
    line-height: 1.5;
}

.detail-card__time {
    flex-shrink: 0;
    font-size: 24rpx;
    color: #999999;
    line-height: 1.5;
}

.detail-card__body {
    min-height: 600rpx;
    background: rgba(198,215,255,0.2);
    border-radius: 6rpx;
    padding: 16rpx;
}

.detail-card__content-text {
    font-size: 24rpx;
    color: #13144F;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
}

.back-btn {
    padding: 8rpx;
    margin-left: -8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>

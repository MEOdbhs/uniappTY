<template>
	<view class="update-page">
		<view class="content">
			<image src="/static/logo.png" class="logo" mode="aspectFit" />
			<view class="title">正在更新版本</view>
			<view class="progress-box">
				<cl-progress
					:value="progress"
					:stroke-width="20"
					color="#409eff"
					:show-text="false"
				/>
				<view class="percent-text">{{ progress }}%</view>
			</view>
			<view class="desc" v-if="!errorMsg">正在下载更新包，请勿关闭页面...</view>
			<view class="desc error" v-if="errorMsg">{{ errorMsg }}</view>
			<cl-button v-if="errorMsg" @tap="handleRetry" type="primary" class="retry-btn"
				>重试</cl-button
			>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad, onBackPress } from "@dcloudio/uni-app";
import { installApk } from "/@/hooks";

const progress = ref(0);
const downloadUrl = ref("");
const downloadTask = ref<any>(null);
const errorMsg = ref("");

onLoad((options: any) => {
	if (options.url) {
		downloadUrl.value = decodeURIComponent(options.url);
		startDownload();
	} else {
		errorMsg.value = "下载地址无效";
	}
});

// 阻止返回
onBackPress(() => {
	if (progress.value < 100 && !errorMsg.value) {
		uni.showToast({
			title: "正在更新，请勿退出",
			icon: "none",
		});
		return true;
	}
	return false;
});

function startDownload() {
	errorMsg.value = "";
	progress.value = 0;

	downloadTask.value = uni.downloadFile({
		url: downloadUrl.value,
		success: (res) => {
			if (res.statusCode === 200) {
				installApk(res.tempFilePath);
				setTimeout(() => {
					uni.navigateBack();
				}, 1000);
			} else {
				errorMsg.value = "下载失败，状态码：" + res.statusCode;
			}
		},
		fail: (err) => {
			errorMsg.value = "下载请求失败";
			console.error(err);
		},
	});

	downloadTask.value.onProgressUpdate((res: any) => {
		progress.value = res.progress;
	});
}

function handleRetry() {
	startDownload();
}
</script>

<style lang="scss" scoped>
.update-page {
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #fff;
}

.content {
	width: 80%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.logo {
	width: 160rpx;
	height: 160rpx;
	margin-bottom: 60rpx;
	border-radius: 20rpx;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 60rpx;
}

.progress-box {
	width: 100%;
	margin-bottom: 30rpx;
	position: relative;
	padding-bottom: 40rpx;
}

.percent-text {
	position: absolute;
	right: 0;
	bottom: 0;
	font-size: 28rpx;
	color: #409eff;
	font-weight: bold;
}

.desc {
	font-size: 28rpx;
	color: #999;
	text-align: center;

	&.error {
		color: #f56c6c;
	}
}

.retry-btn {
	margin-top: 40rpx;
	width: 200rpx;
}
</style>

<template>
	<cl-page>
		<view class="page-about">
			<view class="logo">
				<image src="/static/logo.png" />
			</view>

			<!-- 版本 -->
			<cl-version-about />
			<!-- <cl-text align="center" value="中国煤科常州院"></cl-text> -->
			<view class="c_list_item">{{ t("中国煤科常州院") }}</view>
			<!-- <cl-list>
				<cl-list-item :arrow="false" :label="t('中国煤科常州院')" />
			</cl-list> -->

			<!-- <cl-text
				block
				align="center"
				:size="24"
				color="info"
				:line-height="1.2"
				:margin="[80, 0, 0, 0]"
			>
				{{ app.info.desc }}
			</cl-text> -->
		</view>
	</cl-page>
</template>

<script lang="ts" setup>
import { onReady } from "@dcloudio/uni-app";
import { useApp } from "/@/cool";
import { useI18n } from "vue-i18n";

const app = useApp();
const { t } = useI18n();

onReady(() => {
	uni.setNavigationBarTitle({
		title: `${t("关于")} ${app.info.name}`,
	});
});
</script>

<style lang="scss" scoped>
.c_list_item {
	padding: 24rpx;
	background-color: #ffffff;
}
.page-about {
	.logo {
		display: flex;
		justify-content: center;
		padding: 100rpx 0;

		image {
			height: 160rpx;
			width: 160rpx;
			border-radius: 24rpx;
			box-shadow: 0 25rpx 30rpx -25rpx #666666;
		}
	}
}
</style>

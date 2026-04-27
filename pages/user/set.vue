<template>
	<cl-page>
		<view class="page-set">
			<!-- <template v-if="user.info">
				<cl-text :value="t('账号')" :margin="[0, 0, 20, 20]" block />

				<cl-list :radius="16">
					<cl-list-item :label="t('头像')" :arrow-icon="false">
						<view class="avatar">
							<button open-type="chooseAvatar" @chooseavatar="uploadAvatar">
								<cl-avatar round :size="88" :src="user.info.avatarUrl" />
							</button>

							<cl-avatar
								round
								:size="88"
								:src="user.info.avatarUrl"
								@tap="uploadAvatar()"
							/>
						</view>
					</cl-list-item>
					<cl-list-item :label="t('昵称')" @tap="router.push('/pages/user/edit')">
						<cl-text :value="user.info.nickName" />
					</cl-list-item>
					<cl-list-item :label="t('手机号')" :arrow-icon="false">
						<cl-text :value="user.info.phone" />
					</cl-list-item>
					<cl-list-item :label="t('修改密码')" @tap="router.push('/pages/user/restPwd')" />
					<cl-list-item label="ID" :arrow-icon="false" :border="false">
						<cl-text :value="user.info.id" />
					</cl-list-item>
				</cl-list>
			</template> -->

			<cl-text :value="t('关于')" :margin="[30, 0, 20, 20]" block />

			<cl-list :radius="16">
				<cl-list-item
					:label="`${t('关于')} ${app.info.name}`"
					@tap="router.push('/pages/user/about')"
				/>

				<!-- <cl-list-item
					:label="t('用户协议')"
					@tap="
						router.push({
							path: '/pages/user/doc',
							query: {
								key: 'userAgreement',
								title: t('用户协议'),
							},
						})
					"
				/>
				<cl-list-item
					:label="t('隐私政策')"
					@tap="
						router.push({
							path: '/pages/user/doc',
							query: {
								key: 'privacyPolicy',
								title: t('隐私政策'),
							},
						})
					"
				/> -->
				<!-- <cl-list-item label="检查更新" @tap="checkAppVersion" /> -->
			</cl-list>

			<cl-list :radius="16">
				<cl-list-item :label="t('切换账号')" @tap="router.push('/pages/user/login')" />
				<!-- <cl-list-item :label="t('退出登录')" :arrow-icon="false" @tap="user.logout()">
					<cl-icon :size="36" name="exit" />
				</cl-list-item> -->
			</cl-list>

			<!-- 版本号显示 -->
			<view class="version-info">
				<cl-text class="version-text">中国煤科 {{ appVersion }}</cl-text>
			</view>
		</view>
	</cl-page>
</template>

<script lang="ts" setup>
import { onReady } from "@dcloudio/uni-app";
import { useApp, useCool, useStore } from "/@/cool";
import { useUi } from "/$/cool-ui";
import { useI18n } from "vue-i18n";
import { config } from "/@/config";
import { getAppVersionList } from "./components/login/api";
import { addDomainPrefix } from "/@/cool/utils";

const { router, upload } = useCool();
const { user } = useStore();
const ui = useUi();
const app = useApp();
const { t } = useI18n();

// 获取 uniapp 版本号
function getAppVersion(): string {
	// #ifdef APP-PLUS
	// 在 App 环境下使用 plus.runtime.version 获取版本号
	// @ts-ignore
	if (typeof plus !== "undefined" && plus.runtime) {
		// @ts-ignore
		return plus.runtime.version || "0.0.1";
	}
	// #endif

	// 非 App 环境或获取失败时，使用配置中的版本号作为后备
	return (config as any).app?.version || "0.0.1";
}

const appVersion = getAppVersion();

// 安装 APK 文件
function installApk(filePath: string) {
	// #ifdef APP-PLUS
	// 在 App 环境下使用 plus.runtime.install 安装 APK
	// @ts-ignore
	if (typeof plus !== "undefined" && plus.runtime) {
		// @ts-ignore
		plus.runtime.install(
			filePath,
			{
				force: false, // 是否强制安装
			},
			() => {
				uni.showToast({
					title: "安装包安装成功",
					icon: "success",
				});
			},
			(error: any) => {
				console.error("安装失败：", error);
				uni.showToast({
					title: "安装失败，请手动安装",
					icon: "none",
					duration: 3000,
				});
				// 安装失败时尝试打开文件管理器让用户手动安装
				uni.openDocument({
					filePath: filePath,
					success: () => {
						console.log("已打开文件管理器");
					},
					fail: () => {
						console.error("无法打开安装包");
					},
				});
			},
		);
	} else {
		// 如果 plus 对象不存在，尝试打开文件管理器
		uni.openDocument({
			filePath: filePath,
			success: () => {
				uni.showToast({
					title: "请手动安装更新包",
					icon: "none",
				});
			},
			fail: () => {
				uni.showToast({
					title: "无法打开安装包",
					icon: "none",
				});
			},
		});
	}
	// #endif

	// #ifndef APP-PLUS
	// 非 App 环境（H5、小程序等）提示用户手动下载
	uni.showToast({
		title: "请手动下载并安装更新包",
		icon: "none",
	});
	// #endif
}

// 检查版本并下载更新
async function checkAppVersion() {
	try {
		uni.showLoading({
			title: "检查更新中...",
			mask: true,
		});

		const list: any = await getAppVersionList();

		uni.hideLoading();

		if (!Array.isArray(list) || list.length === 0) {
			uni.showToast({
				title: "暂无版本信息",
				icon: "none",
			});
			return;
		}

		const latest = list[0] || {};
		const serverVersion: string | undefined = latest.versionNum;
		const localVersion: string = getAppVersion();

		// 任一版本不存在则不处理
		if (!serverVersion || !localVersion) {
			uni.showToast({
				title: "版本信息异常",
				icon: "none",
			});
			return;
		}

		// 版本号不同则触发下载
		if (serverVersion !== localVersion) {
			const fileUrl: string | undefined = latest.versionFileUrl;
			if (!fileUrl) {
				uni.showToast({
					title: "更新包地址不存在",
					icon: "none",
				});
				return;
			}

			const downloadUrl = addDomainPrefix(fileUrl);

			// 显示下载提示
			uni.showModal({
				title: "发现新版本",
				content: `检测到新版本 ${serverVersion}，当前版本 ${localVersion}，是否立即更新？`,
				confirmText: "立即更新",
				cancelText: "稍后更新",
				success: (modalRes) => {
					if (modalRes.confirm) {
						// 开始下载更新包
						uni.showLoading({
							title: "正在下载更新包...",
							mask: true,
						});

						uni.downloadFile({
							url: downloadUrl,
							success(res) {
								uni.hideLoading();
								if (res.statusCode === 200 && res.tempFilePath) {
									uni.showToast({
										title: "下载完成，准备安装",
										icon: "success",
									});
									// 下载完成后自动安装（延迟 500ms 确保文件写入完成）
									setTimeout(() => {
										installApk(res.tempFilePath);
									}, 500);
								} else {
									uni.showToast({
										title: "下载失败",
										icon: "none",
									});
								}
							},
							fail(err) {
								uni.hideLoading();
								console.error("下载失败：", err);
								uni.showToast({
									title: "更新包下载失败",
									icon: "none",
									duration: 3000,
								});
							},
						});
					}
				},
			});
		} else {
			// 版本相同，提示已是最新版本
			uni.showToast({
				title: "已是最新版本",
				icon: "success",
			});
		}
	} catch (err) {
		uni.hideLoading();
		console.error("检查版本更新失败：", err);
		uni.showToast({
			title: "检查更新失败",
			icon: "none",
			duration: 3000,
		});
	}
}

// 上传头像
function uploadAvatar(e?: { detail: { avatarUrl: string } }) {
	function next(path: string) {
		upload({ path }).then((url) => {
			ui.showToast(t("头像更新成功"));

			user.update({
				avatarUrl: url,
			});
		});
	}

	if (e) {
		next(e.detail.avatarUrl);
	} else {
		uni.chooseImage({
			count: 1,
			success(res) {
				// @ts-ignore
				next(res.tempFiles[0].path);
			},
		});
	}
}

onReady(() => {
	user.get();
});
</script>

<style lang="scss" scoped>
.page-set {
	padding: 20rpx 24rpx;

	.avatar {
		padding: 10rpx 0;
		height: 88rpx;

		button {
			padding: 0;
			margin: 0;
			line-height: normal;
			background-color: transparent;

			&::after {
				border: 0;
			}
		}
	}

	.version-info {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx 0 60rpx;
		margin-top: 40rpx;

		.version-text {
			font-size: 24rpx;
			color: #999;
			text-align: center;
		}
	}
}
</style>

<template>
	<cl-page background-color="transparent">
		<Madman-waterMark :row="4" :col="1" :rotate="-10" :opacity="0.05" :ref="setRefs('waterMark')" :width="330"
			:height="100" />

		<view class="auth-page page-login">
			<view class="auth-bg" />
			<view class="auth-inner">
				<view class="auth-logo">
					<image class="auth-logo-img" src="/static/icon/login/logo.png" mode="widthFix" />
				</view>

				<view class="auth-container">
					<view class="mode">
						<view class="auth-field">
							<cl-input v-model="form.username" prefix-icon="user-fill" :placeholder="t('请输入账号')"
								:placeholder-style="authPlaceholderStyle" placeholder-class="auth-input-ph"
								:border="false" />
						</view>

						<view class="auth-field">
							<cl-input v-model="form.password" type="password" prefix-icon="lock-password-fill"
								:placeholder="t('请输入密码')" :placeholder-style="authPlaceholderStyle"
								placeholder-class="auth-input-ph" :border="false" />
						</view>

						<view class="auth-btn-wrap">
							<cl-button class="auth-submit" type="primary" fill :border="false" :height="90"
								:font-size="30" :loading="loading" :disabled="disabled" @tap="toLogin">
								{{ t("立即登录") }}
							</cl-button>
							<view class="auth-btn-glow" aria-hidden="true" />
						</view>

						<view class="auth-bottom-row">
							<view class="agree">
								<cl-checkbox-group v-model="rememberPassword">
									<cl-checkbox label="1">{{ t("记住密码") }}</cl-checkbox>
								</cl-checkbox-group>
							</view>

							<view class="auth-link-muted">
								<text>{{ t("还没有账号？") }}</text>
								<text class="auth-link" @tap="toRegister">{{ t("去注册") }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</cl-page>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, onMounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useCool, useStore } from "/@/cool";
import { useUi } from "/$/cool-ui";
import type { User } from "/@/cool";
import { login } from "./components/login/api";
import { storage } from "/@/cool/utils";
import MadmanWaterMark from "@/components/Madman-waterMark/Madman-waterMark.vue";
import { checkAppVersion } from "/@/hooks";

const { t } = useI18n();
const { router, refs, setRefs } = useCool();
const { user } = useStore();
const ui = useUi();

const authPlaceholderStyle = {
	color: "rgba(255, 255, 255, 0.78)",
	lineHeight: "52rpx",
	fontSize: "28rpx",
};

// 表单
const form = reactive({
	username: "",
	password: "",
});

// 加载中
const loading = ref(false);

// 记住密码
const rememberPassword = ref<string[]>([]);
const STORAGE_KEY_USERNAME = "login_username";
const STORAGE_KEY_PASSWORD = "login_password";
const STORAGE_KEY_REMEMBER = "login_remember";

// 是否禁用登录按钮
const disabled = computed(() => {
	return !form.username || !form.password;
});

// 登录
async function toLogin() {
	// if (!refs.agreeBtn.check()) {
	// 	return;
	// }

	const { username, password } = form;

	if (!username) {
		ui.showToast({
			message: t("请输入账号"),
		});
		return;
	}

	if (!password) {
		ui.showToast({
			message: t("请输入密码"),
		});
		return;
	}

	loading.value = true;

	try {
		const data: any = await login(username, password);
		if (data?.status && data.status !== 200) {
			ui.showToast({
				message: data.error || t("登录失败"),
			});
			return;
		}
		if (data?.error) {
			ui.showToast({
				message: data.error,
			});
			return;
		}
		const accessToken = data?.access_token as string;
		if (accessToken) {
			const exp = data.expires_in != null ? Number(data.expires_in) : 7200;
			const refExp =
				data.refresh_expires_in != null
					? Number(data.refresh_expires_in)
					: 604800;
			const coolToken: User.Token = {
				token: accessToken,
				expire: exp > 0 ? exp : 7200,
				refreshToken: (data.refresh_token as string) || accessToken,
				refreshExpire: refExp > 0 ? refExp : 604800,
			};

			user.setToken(coolToken);

			if (data.user_name) {
				storage.set("oauthUser", data.user_name);
			}

			// 登录成功后重置"首页消息横幅已展示"标识，
			// 确保每次新的登录会话首页都可以再次弹出一次通知
			if (typeof (user as any).resetHomeMessageBanner === "function") {
				(user as any).resetHomeMessageBanner();
			}

			// 如果勾选了记住密码，保存账号密码
			if (rememberPassword.value.includes("1")) {
				storage.set(STORAGE_KEY_USERNAME, username);
				storage.set(STORAGE_KEY_PASSWORD, password);
				storage.set(STORAGE_KEY_REMEMBER, true);
			} else {
				// 如果没有勾选，清除保存的账号密码
				storage.remove(STORAGE_KEY_USERNAME);
				storage.remove(STORAGE_KEY_PASSWORD);
				storage.remove(STORAGE_KEY_REMEMBER);
			}

			await user.get();

			// 登录成功后创建水印（使用实际用户信息）
			setTimeout(() => { }, 300);

			router.nextLogin();
		} else {
			ui.showToast({ message: t("登录失败") });
		}
	} catch (err: any) {
		ui.showToast({
			message: err?.message || t("登录失败"),
		});
	} finally {
		loading.value = false;
	}
}

// 前往注册页
function toRegister() {
	router.push({
		path: "/pages/user/register",
	});
}

// 创建水印
function createWaterMark() {
	// 通过 refs 访问 waterMark 组件实例
	// Vue 3 中使用 refs.waterMark 替代 Vue 2 的 this.$refs.waterMark
	console.log("尝试创建水印，refs.waterMark:", refs.waterMark);

	// 注意：组件内部会检查 uni.getStorageSync('appWaterMark')
	// 如果已存在则不会创建，所以需要先清除（如果需要重新创建）
	// 在登录页面，我们清除之前的标记，允许重新创建
	uni.removeStorageSync("appWaterMark");

	if (refs.waterMark && typeof refs.waterMark.createWaterMark === "function") {
		// 获取用户信息用于水印
		//const username = user.info?.username || user.info?.name || form.username || '用户';
		//const currentTime = new Date().toLocaleString('zh-CN');

		// 根据组件文档，createWaterMark 接收一个数组参数
		try {
			refs.waterMark.createWaterMark([
				{
					type: "text",
					content: "中国煤科-常州院",
					size: 20,
					x: 10,
					y: 60,
				},
			]);
			console.log("水印创建成功");
		} catch (error) {
			console.error("创建水印失败:", error);
		}
	} else {
		console.warn("waterMark 组件未准备好，refs.waterMark:", refs.waterMark);
		// 如果组件未准备好，延迟重试
		setTimeout(() => {
			if (refs.waterMark && typeof refs.waterMark.createWaterMark === "function") {
				createWaterMark();
			}
		}, 500);
	}
}

onMounted(() => {
	// 从 storage 读取保存的账号密码
	const savedUsername = storage.get(STORAGE_KEY_USERNAME);
	const savedPassword = storage.get(STORAGE_KEY_PASSWORD);
	const savedRemember = storage.get(STORAGE_KEY_REMEMBER);

	if (savedUsername && savedPassword && savedRemember) {
		form.username = savedUsername;
		form.password = savedPassword;
		rememberPassword.value = ["1"];
	}

	//checkAppVersion("login");

	// 延迟创建水印，确保组件已完全挂载
	// nextTick(() => {
	// 	setTimeout(() => {
	// 		createWaterMark();
	// 	}, 500);
	// });
});
</script>

<style lang="scss" scoped>
@import "./auth-theme.scss";

.page-login {
	.mode {
		width: 100%;
	}
}
</style>

<style lang="scss">
@import "./auth-placeholder.scss";
</style>

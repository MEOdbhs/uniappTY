<template>
	<cl-page background-color="transparent">
		<view class="auth-page page-login">
			<view class="auth-bg" />
			<view class="auth-inner">
				<view class="auth-logo">
					<image
						class="auth-logo-img"
						src="/static/icon/login/logo.png"
						mode="widthFix"
					/>
				</view>

				<view class="auth-container">
					<view class="mode">
						<text class="auth-title">{{ t("修改密码") }}</text>

						<view class="auth-field">
							<cl-input
								v-model="form.oldPassword"
								type="password"
								prefix-icon="lock-password-fill"
								:placeholder="t('请输入旧密码')"
								:placeholder-style="authPlaceholderStyle"
								placeholder-class="auth-input-ph"
								:border="false"
							/>
						</view>

						<view class="auth-field">
							<cl-input
								v-model="form.newPassword"
								type="password"
								prefix-icon="lock-password-fill"
								:placeholder="t('请输入新密码')"
								:placeholder-style="authPlaceholderStyle"
								placeholder-class="auth-input-ph"
								:border="false"
							/>
						</view>

						<view class="auth-field">
							<cl-input
								v-model="form.confirmPassword"
								type="password"
								prefix-icon="lock-password-fill"
								:placeholder="t('请确认新密码')"
								:placeholder-style="authPlaceholderStyle"
								placeholder-class="auth-input-ph"
								:border="false"
							/>
						</view>

						<view class="auth-btn-wrap">
							<cl-button
								class="auth-submit"
								type="primary"
								fill
								:border="false"
								:height="90"
								:font-size="30"
								:loading="loading"
								@tap="submit"
							>
								{{ t("保存") }}
							</cl-button>
							<view class="auth-btn-glow" aria-hidden="true" />
						</view>

						<view class="auth-register-link">
							<text class="link" @tap="back">
								{{ t("返回上一页") }}
							</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</cl-page>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useCool } from "/@/cool";
import { useUi } from "/$/cool-ui";
import { updateUserPwd } from "./components/login/api";

const { t } = useI18n();
const { router } = useCool();
const ui = useUi();

const authPlaceholderStyle = {
	color: "rgba(255, 255, 255, 0.78)",
	lineHeight: "52rpx",
	fontSize: "28rpx",
};

// 表单
const form = reactive({
	oldPassword: "",
	newPassword: "",
	confirmPassword: "",
});

const loading = ref(false);

// 校验
function validate(): boolean {
	if (!form.oldPassword) {
		ui.showToast({
			message: "旧密码不能为空",
		});
		return false;
	}

	if (!form.newPassword) {
		ui.showToast({
			message: "新密码不能为空",
		});
		return false;
	}

	if (form.newPassword.length < 6 || form.newPassword.length > 20) {
		ui.showToast({
			message: "长度在 6 到 20 个字符",
		});
		return false;
	}

	if (!/^[^<>"'|\\]+$/.test(form.newPassword)) {
		ui.showToast({
			message: "不能包含非法字符：< > \" ' \\ |",
		});
		return false;
	}

	if (!form.confirmPassword) {
		ui.showToast({
			message: "确认密码不能为空",
		});
		return false;
	}

	if (form.confirmPassword !== form.newPassword) {
		ui.showToast({
			message: "两次输入的密码不一致",
		});
		return false;
	}

	return true;
}

// 提交
async function submit() {
	if (!validate()) return;

	loading.value = true;
	try {
		await updateUserPwd(form.oldPassword, form.newPassword);
		ui.showToast({
			message: "修改成功",
		});
		// 返回上一页
		setTimeout(() => {
			router.back();
		}, 500);
	} catch (e: any) {
		ui.showToast({
			message: e?.message || "修改失败",
		});
	} finally {
		loading.value = false;
	}
}

// 返回
function back() {
	router.back();
}
</script>

<style lang="scss" scoped>
@import "./auth-theme.scss";

.page-login .mode {
	width: 100%;
}
</style>

<style lang="scss">
@import "./auth-placeholder.scss";
</style>


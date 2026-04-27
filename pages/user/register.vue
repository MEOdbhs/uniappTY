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
					<view class="mode" v-if="!isSuccess">
						<view class="auth-field">
							<cl-input
								v-model="form.nickName"
								:placeholder="t('请输入姓名')"
								:placeholder-style="authPlaceholderStyle"
								placeholder-class="auth-input-ph"
								:border="false"
							/>
						</view>
						<view class="auth-field">
							<cl-input
								v-model="form.customerUnit"
								:placeholder="t('请输入客户单位')"
								:placeholder-style="authPlaceholderStyle"
								placeholder-class="auth-input-ph"
								:border="false"
							/>
						</view>
						<view class="auth-field">
							<cl-input
								v-model="form.customerDep"
								:placeholder="t('请输入客户部门')"
								:placeholder-style="authPlaceholderStyle"
								placeholder-class="auth-input-ph"
								:border="false"
							/>
						</view>
						<view class="auth-field">
							<cl-input
								v-model="form.position"
								:placeholder="t('请输入职务')"
								:placeholder-style="authPlaceholderStyle"
								placeholder-class="auth-input-ph"
								:border="false"
							/>
						</view>
						<view class="auth-field">
							<cl-input
								v-model="form.phone"
								prefix-icon="phone-fill"
								:placeholder="t('请输入手机号')"
								:placeholder-style="authPlaceholderStyle"
								placeholder-class="auth-input-ph"
								:border="false"
								:maxlength="11"
							/>
						</view>

						<view class="auth-field">
							<cl-input
								v-model="form.password"
								type="password"
								prefix-icon="lock-password-fill"
								:placeholder="t('请输入密码')"
								:placeholder-style="authPlaceholderStyle"
								placeholder-class="auth-input-ph"
								:border="false"
							/>
						</view>
						<view class="password-strength" v-if="form.password">
							<text class="strength-label">密码强度：</text>
							<text :class="['strength-text', getStrengthClass()]">
								{{ getStrengthText() }}
							</text>
						</view>
						<view class="auth-field">
							<cl-input
								v-model="form.confirmPassword"
								type="password"
								prefix-icon="lock-password-fill"
								:placeholder="t('请再次输入密码')"
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
								@tap="handleRegister"
							>
								{{ t("注册") }}
							</cl-button>
							<view class="auth-btn-glow" aria-hidden="true" />
						</view>

						<view class="auth-disclaimer">
							矿山运维服务中心帐号服务需要联网,并获取您的帐号、所在区域、浏览器设置信息,以及您主动上传的个人基本资料和身份信息。点击"注册",即表示您同意上述内容。
						</view>

						<view class="auth-register-link">
							<text>{{ t("已有账号，") }}</text>
							<text class="link" @tap="backLogin">{{ t("去登录") }}</text>
						</view>
					</view>

					<view class="mode success" v-else>
						<text class="auth-title">{{ t("注册成功") }}</text>
						<view class="success-text">
							{{ t("注册成功,欢迎使用矿山运维服务中心") }}
						</view>
						<view class="auth-btn-wrap">
							<cl-button
								class="auth-submit"
								type="primary"
								fill
								:border="false"
								:height="90"
								:font-size="30"
								@tap="backLogin"
							>
								{{ t("返回登录页") }}
							</cl-button>
							<view class="auth-btn-glow" aria-hidden="true" />
						</view>
					</view>
				</view>
			</view>
		</view>
	</cl-page>
</template>

<script lang="ts" setup>
import { onUnmounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useCool } from "/@/cool";
import { useUi } from "/$/cool-ui";
import { register, sendSms } from "./components/login/api";

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
	userRoleType: 2,
	phone: "",
	password: "",
	confirmPassword: "",
	code: "",
	uuid: "",
	nickName: "",
	customerUnit: "",
	position: "",
	customerDep: "",
});
// 状态
const loading = ref(false);
const codeCountdown = ref(0);
const isSuccess = ref(false);
let countdownTimer: any = null;

// 校验手机号
function validatePhone(): boolean {
	if (!form.phone) {
		ui.showToast({
			message: "请先输入手机号",
		});
		return false;
	}

	const reg = /^1[3-9]\d{9}$/;
	if (!reg.test(form.phone)) {
		ui.showToast({
			message: "请输入正确的手机号",
		});
		return false;
	}

	return true;
}

// 获取短信验证码
async function handleGetCode() {
	if (codeCountdown.value > 0) return;
	if (!validatePhone()) return;

	try {
		await sendSms(form.phone);

		codeCountdown.value = 120;
		countdownTimer = setInterval(() => {
			codeCountdown.value--;
			if (codeCountdown.value <= 0) {
				clearInterval(countdownTimer);
				countdownTimer = null;
			}
		}, 1000);

		ui.showToast({
			message: "验证码已发送",
		});
	} catch (e) {
		codeCountdown.value = 0;
		if (countdownTimer) {
			clearInterval(countdownTimer);
			countdownTimer = null;
		}
	}
}
// 添加到 setup 函数中的响应式数据
const currentPasswordStrength = ref("");

// 添加计算强度相关的方法
function getStrengthText() {
	const result = checkPasswordStrength(form.password);
	return result.message;
}

function getStrengthClass() {
	const result = checkPasswordStrength(form.password);
	return `strength-${result.strength}`;
}
// 验证密码强度
function checkPasswordStrength(password: string): {
	valid: boolean;
	strength: string;
	message: string;
} {
	const lengthValid = password.length >= 8;
	const hasNumber = /\d/.test(password);
	const hasLower = /[a-z]/.test(password);
	const hasUpper = /[A-Z]/.test(password);
	const hasSpecial = /[!@#$%^&*(),.?":{}|<>[\]\\;'`~_=+/-]/.test(password);

	if (!lengthValid) {
		return {
			valid: false,
			strength: "invalid",
			message: "密码长度至少8位",
		};
	}

	// 检查是否包含非法字符;
	if (!/^[^<>"'|\\]+$/.test(password)) {
		return {
			valid: false,
			strength: "invalid",
			message: "密码不能包含非法字符：< > \" ' \\ |",
		};
	}

	// 计算密码强度
	let strengthLevel = 0;
	if (hasNumber) strengthLevel++;
	if (hasLower) strengthLevel++;
	if (hasUpper) strengthLevel++;
	if (hasSpecial) strengthLevel++;

	let strengthLabel = "";
	let strengthMessage = "";

	if (strengthLevel === 1) {
		// 只有数字的情况（纯数字）
		if (hasNumber && !hasLower && !hasUpper && !hasSpecial) {
			strengthLabel = "weak";
			strengthMessage = "密码强度弱（纯数字）";
		} else {
			strengthLabel = "weak";
			strengthMessage = "密码强度弱";
		}
	} else if (strengthLevel === 2 || strengthLevel === 3) {
		strengthLabel = "medium";
		strengthMessage = "密码强度中";
	} else if (strengthLevel === 4) {
		strengthLabel = "strong";
		strengthMessage = "密码强度高";
	}

	return {
		valid: strengthLabel === "strong",
		strength: strengthLabel,
		message: strengthMessage,
	};
}
// 注册
async function handleRegister() {
	if (!form.nickName) {
		ui.showToast({
			message: "请先输入姓名",
		});
		return false;
	}
	if (!form.customerDep) {
		ui.showToast({
			message: "请输入客户部门",
		});
		return;
	}
	if (!form.customerUnit) {
		ui.showToast({
			message: "请先输入客户单位",
		});
		return false;
	}
	if (!validatePhone()) return;

	if (!form.password) {
		ui.showToast({
			message: "请输入您的密码",
		});
		return;
	}
	// 使用新的密码强度检查
	const passwordCheckResult = checkPasswordStrength(form.password);
	if (!passwordCheckResult.valid) {
		ui.showToast({
			message: "密码强度不够，请重新输入",
		});
		return;
	}

	// if (form.password.length < 5 || form.password.length > 20) {
	// 	ui.showToast({
	// 		message: "用户密码长度必须介于 5 和 20 之间",
	// 	});
	// 	return;
	// }

	// if (!/^[^<>"'|\\]+$/.test(form.password)) {
	// 	ui.showToast({
	// 		message: "不能包含非法字符：< > \" ' \\ |",
	// 	});
	// 	return;
	// }

	if (!form.confirmPassword) {
		ui.showToast({
			message: "请再次输入您的密码",
		});
		return;
	}

	if (form.confirmPassword !== form.password) {
		ui.showToast({
			message: "两次输入的密码不一致",
		});
		return;
	}

	// if (!form.code) {
	// 	ui.showToast({
	// 		message: "请输入验证码",
	// 	});
	// 	return;
	// }

	loading.value = true;

	try {
		const submitData = {
			...form,
			username: form.phone,
		};

		await register(submitData);
		isSuccess.value = true;
	} catch (e: any) {
		// 失败时保持在当前页面，提示信息可由后端返回
		// ui.showToast({
		// 	message: e?.message || "注册失败",
		// });
	} finally {
		loading.value = false;
	}
}

// 返回登录
function backLogin() {
	router.push({
		path: "/pages/user/login",
		mode: "redirectTo",
	});
}

onUnmounted(() => {
	if (countdownTimer) {
		clearInterval(countdownTimer);
		countdownTimer = null;
	}
});
</script>

<style lang="scss" scoped>
@import "./auth-theme.scss";

.password-strength {
	display: flex;
	align-items: center;
	margin-top: 6rpx;
	margin-bottom: 16rpx;
	font-size: 24rpx;

	.strength-label {
		color: rgba(200, 220, 255, 0.75);
	}

	.strength-text {
		margin-left: 10rpx;
		font-weight: bold;

		&.strength-weak {
			color: #ff8a8a;
		}

		&.strength-medium {
			color: #ffd666;
		}

		&.strength-strong {
			color: #95f5a5;
		}

		&.strength-invalid {
			color: #ff8a8a;
		}
	}
}

.page-login {
	.mode {
		width: 100%;

		&.success {
			text-align: center;

			.success-text {
				font-size: 30rpx;
				color: rgba(230, 240, 255, 0.92);
				margin: 32rpx 0 8rpx;
				line-height: 1.55;
			}
		}
	}
}
</style>

<style lang="scss">
@import "./auth-placeholder.scss";
</style>

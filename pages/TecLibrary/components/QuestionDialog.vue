<template>
	<cl-popup class="question-dialog-popup" :model-value="modelValue" @update:model-value="handleUpdate"
		direction="bottom" :radius="20" :padding="0" :show-header="false" :close-on-click-modal="true" :z-index="9999">
		<view class="question-panel">
			<view class="question-panel__header">
				<text class="question-panel__title">论坛提问</text>
				<view class="question-panel__header-action" @tap="handleClose">
					<cl-icon name="close" :size="36" />
				</view>
			</view>

			<scroll-view class="question-panel__body" scroll-y :show-scrollbar="false">
				<cl-form ref="questionFormRef" v-model="questionForm" :rules="questionRules" label-position="top"
					:border="false" label-width="100%">
					<cl-form-item prop="title">
						<template #label>
							<view class="field-label">
								<text class="field-label__star">*</text>
								<text class="field-label__text">标题</text>
							</view>
						</template>
						<cl-input v-model="questionForm.title" placeholder="请输入问题标题" clearable :border="true" />
					</cl-form-item>

					<cl-form-item prop="technologyType">
						<template #label>
							<view class="field-label">
								<text class="field-label__star">*</text>
								<text class="field-label__text">技术类型</text>
							</view>
						</template>
						<cl-select v-model="questionForm.technologyType" :options="techTypeOptions" placeholder="技术类型"
							:border="true" />
					</cl-form-item>

					<cl-form-item prop="keywords">
						<template #label>
							<view class="field-label field-label--plain">
								<text class="field-label__text">关键词</text>
							</view>
						</template>
						<cl-input v-model="questionForm.keywords" placeholder="请输入关键词，使用逗号分隔" clearable
							:border="true" />
					</cl-form-item>

					<cl-form-item prop="content">
						<template #label>
							<view class="field-label">
								<text class="field-label__star">*</text>
								<text class="field-label__text">问题内容</text>
							</view>
						</template>
						<cl-textarea v-model="questionForm.content" placeholder="请输入问题内容" class="question-textarea"
							:border="true" :style="{ height: taHeightRpx + 'rpx' }" @linechange="handleLineChange" />
					</cl-form-item>
				</cl-form>
			</scroll-view>

			<view class="question-panel__footer">
				<view class="footer-btn footer-btn--cancel" @tap="handleClose">取消</view>
				<view class="footer-btn footer-btn--submit" :class="{ 'is-loading': submittingQuestion }"
					@tap="handleSubmitQuestion">
					{{ submittingQuestion ? "提交中…" : "提交" }}
				</view>
			</view>
		</view>
	</cl-popup>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { saveTechnologyQuestion } from "../api";

const props = defineProps<{
	modelValue: boolean;
	techTypeOptions: any[];
}>();

const emit = defineEmits<{
	"update:modelValue": [value: boolean];
	success: [];
}>();

const questionFormRef = ref();
const submittingQuestion = ref(false);
const taHeightRpx = ref(220);

const questionForm = reactive({
	title: "",
	technologyType: "",
	keywords: "",
	content: "",
});

const questionRules = {
	title: [{ required: true, message: "请输入问题标题" }],
	technologyType: [{ required: true, message: "请选择技术类型" }],
	content: [{ required: true, message: "请输入问题内容" }],
};

function handleLineChange(e: any) {
	const lineCount = e.detail?.lineCount || 1;
	taHeightRpx.value = Math.min(Math.max(lineCount * 44 + 48, 220), 520);
}

const handleClose = () => emit("update:modelValue", false);

const handleUpdate = (value: boolean) => emit("update:modelValue", value);

watch(
	() => props.modelValue,
	(newVal) => {
		if (!newVal) return;
		questionForm.title = "";
		questionForm.technologyType = "";
		questionForm.keywords = "";
		questionForm.content = "";
		taHeightRpx.value = 220;
	},
);

async function handleSubmitQuestion() {
	if (submittingQuestion.value || !questionFormRef.value) return;
	questionFormRef.value.validate(async (valid: boolean) => {
		if (!valid) return;
		submittingQuestion.value = true;
		try {
			let keywordsList: any[] = [];
			if (questionForm.keywords?.trim()) {
				const parts = questionForm.keywords.split(/[,，]/).map((k: string) => k.trim()).filter(Boolean);
				keywordsList = parts.map((keyword: string) => ({ keywordsName: keyword }));
			}

			const payload = {
				title: questionForm.title.trim(),
				technologyType: questionForm.technologyType,
				keywordsList,
				content: questionForm.content.trim(),
				fileUrl: "",
				relationType: "JSLT",
			};

			await saveTechnologyQuestion(payload);
			uni.showToast({ title: "提问提交成功", icon: "success" });
			handleClose();
			emit("success");
		} catch (error: any) {
			console.error("提交问题失败", error);
			uni.showToast({
				title: error?.message || "提交失败",
				icon: "none",
			});
		} finally {
			submittingQuestion.value = false;
		}
	});
}
</script>

<style lang="scss" scoped>
.question-panel {
	width: 100%;
	box-sizing: border-box;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	background: #ffffff;
	overflow: hidden;
	padding: 0 32rpx;
}

.question-panel__header {
	flex-shrink: 0;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx 0 24rpx;
	border-bottom: 1rpx solid #eef0f4;
}

.question-panel__title {
	font-size: 36rpx;
	font-weight: 600;
	color: #303133;
	flex: 1;
	min-width: 0;
}

.question-panel__header-action {
	flex-shrink: 0;
	padding: 8rpx;
	margin-right: -8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #909399;
}

.question-panel__body {
	flex: 1;
	min-height: 0;
	max-height: calc(80vh - 300rpx);
	padding: 28rpx 0 20rpx;
	box-sizing: border-box;
}

.field-label {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 12rpx;
	min-height: 40rpx;
}

.field-label--plain .field-label__text {
	font-weight: 500;
}

.field-label__star {
	color: #f56c6c;
	font-size: 28rpx;
	margin-right: 4rpx;
	line-height: 1.2;
}

.field-label__text {
	font-size: 28rpx;
	color: #606266;
	font-weight: 500;
}

.question-textarea {
	min-height: 220rpx;
	max-height: 520rpx;
}

.question-panel__footer {
	flex-shrink: 0;
	display: flex;
	flex-direction: row;
	gap: 24rpx;
	margin: 0 -32rpx;
	padding: 24rpx 32rpx calc(28rpx + env(safe-area-inset-bottom));
	border-top: 1rpx solid #eef0f4;
	background: #fff;
	box-sizing: border-box;
	margin-bottom: 4rem;
}

.footer-btn {
	flex: 1;
	text-align: center;
	padding: 28rpx 16rpx;
	font-size: 30rpx;
	font-weight: 500;
	border-radius: 44rpx;
	box-sizing: border-box;
}

.footer-btn--cancel {
	background-color: #e8eaed;
	color: #606266;
}

.footer-btn--submit {
	background: linear-gradient(135deg, #4873fa 0%, #1b2cd2 100%);
	color: #ffffff;

	&.is-loading {
		opacity: 0.85;
	}
}

:deep(.cl-form-item) {
	margin-bottom: 32rpx;

	&:last-child {
		margin-bottom: 8rpx;
	}
}

:deep(.cl-form-item__label) {
	width: 100% !important;
	margin-bottom: 0;
}

:deep(.cl-form-item__content) {
	width: 100%;
}

:deep(.cl-input.is-border) {
	border: 2rpx solid #dcdfe6;
	border-radius: 12rpx;
	background-color: #fafbfc;
	min-height: 80rpx;
	box-sizing: border-box;
}

:deep(.cl-textarea.is-border) {
	border: 2rpx solid #dcdfe6;
	border-radius: 12rpx;
	background-color: #fafbfc;
	padding: 20rpx 24rpx;
	box-sizing: border-box;
}

:deep(.cl-select__wrap) {
	width: 100%;
}

:deep(.cl-select-inner) {
	border: 2rpx solid #dcdfe6 !important;
	border-radius: 12rpx !important;
	background-color: #fafbfc !important;
	min-height: 80rpx;
	box-sizing: border-box;
}

/* 底部贴起弹层：抬高避免被自定义 tabbar（约 120rpx）挡住 */
:deep(.cl-popup__wrapper--bottom .cl-popup) {
	margin-bottom: calc(120rpx + env(safe-area-inset-bottom));
	max-height: calc(100vh - 120rpx - env(safe-area-inset-bottom)) !important;
}
</style>

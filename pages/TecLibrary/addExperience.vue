<template>
	<cl-page statusBarBackground="#4474FF" backgroundColor="#EFF3FD" fullscreen>
        <view class="bg-color"></view>
		<cl-topbar title="新增经验" background-color="#4474FF" color="#fff" :border="false"></cl-topbar>
		<view class="add-experience-page">
			<!-- 顶部导航栏 -->
			<!-- <view class="page-header">
				<cl-icon name="arrow-left" size="48" @tap="handleBack"></cl-icon>
				<text class="page-title">新增经验</text>
				<view style="width: 48rpx;"></view>
			</view> -->

			<!-- 表单内容 -->
			<scroll-view class="form-container" scroll-y>
				<!-- 问题现象 -->
				<view class="form-section">
					<view class="section-header">
						<text class="section-title">问题现象</text>
						<text class="section-desc">记录故障/运维场景的具体现象</text>
					</view>
					<view class="form-items">
						<view
							v-for="(item, index) in formData.questions"
							:key="index"
							class="form-item-group"
						>
							<view class="item-label">
								问题现象{{ index > 0 ? index + 1 : "" }}
							</view>
							<view class="item-content">
								<cl-textarea
									v-model="item.value"
									:height="300"
                                    count
                                    maxlength="200"
									placeholder="请输入问题现象"
								></cl-textarea>
								<cl-button
                                    class="delete-btn"
									v-if="formData.questions.length > 1"
									type="error"
                                    :border="false"
									size="small"
									plain
									@tap="removeQuestion(index)"
								>
							        <cl-icon name="delete" :size="28"></cl-icon>
									删除
								</cl-button>
							</view>
						</view>
						<cl-button type="primary" size="small" plain :border="false" @tap="addQuestion">
							<cl-icon name="plus-border" :size="28"></cl-icon>
							<text style="margin-left: 8rpx;">新增</text>
						</cl-button>
					</view>
					<view class="form-items">
						<view class="item-label">附件</view>
						<view class="item-content-full">
							<CommonUpload v-model="formData.questionUrl" multiple :limit="5" text="添加图片/附件" />
						</view>
					</view>
				</view>

				<!-- 处理过程 -->
				<view class="form-section">
					<view class="section-header">
						<text class="section-title">处理过程</text>
						<text class="section-desc">记录问题的排查思路、操作步骤、关键节点</text>
					</view>
					<view class="form-items">
						<view
							v-for="(item, index) in formData.processes"
							:key="index"
							class="form-item-group"
						>
							<view class="item-label">
								处理过程{{ index > 0 ? index + 1 : "" }}
							</view>
							<view class="item-content">
								<cl-textarea
									v-model="item.value"
									:height="300"
                                    count
                                    maxlength="200"
									placeholder="请输入处理过程"
								></cl-textarea>
								<cl-button
                                    class="delete-btn"
									v-if="formData.processes.length > 1"
									type="error"
                                    :border="false"
									size="small"
									plain
									@tap="removeProcess(index)"
								>
							        <cl-icon name="delete" :size="28"></cl-icon>
									删除
								</cl-button>
							</view>
						</view>
						<cl-button type="primary" size="small" plain :border="false" @tap="addProcess">
							<cl-icon name="plus-border" :size="28"></cl-icon>
							<text style="margin-left: 8rpx;">新增</text>
						</cl-button>
					</view>
					<view class="form-items">
						<view class="item-label">附件</view>
						<view class="item-content-full">
							<CommonUpload v-model="formData.processUrl" multiple :limit="5" text="添加图片/附件" />
						</view>
					</view>
				</view>

				<!-- 结果验证 -->
				<view class="form-section">
					<view class="section-header">
						<text class="section-title">结果验证</text>
						<text class="section-desc">记录处理后的验证结果、效果反馈,确保经验的有效性</text>
					</view>
					<view class="form-items">
						<view
							v-for="(item, index) in formData.results"
							:key="index"
							class="form-item-group"
						>
							<view class="item-label">
								结果验证{{ index > 0 ? index + 1 : "" }}
							</view>
							<view class="item-content">
								<cl-textarea
									v-model="item.value"
									:height="300"
                                    count
                                    maxlength="200"
									placeholder="请输入结果验证"
								></cl-textarea>
								<cl-button
                                    class="delete-btn"
									v-if="formData.results.length > 1"
									type="error"
                                    :border="false"
									size="small"
									plain
									@tap="removeResult(index)"
								>
							        <cl-icon name="delete" :size="28"></cl-icon>
									删除
								</cl-button>
							</view>
						</view>
						<cl-button type="primary" size="small" plain :border="false" @tap="addResult">
							<cl-icon name="plus-border" :size="28"></cl-icon>
							<text style="margin-left: 8rpx;">新增</text>
						</cl-button>
					</view>
					<view class="form-items">
						<view class="item-label">附件</view>
						<view class="item-content-full">
							<CommonUpload v-model="formData.resultUrl" multiple :limit="5" text="添加图片/附件" />
						</view>
					</view>
				</view>

				<!-- 标签配置 -->
				<view class="form-section">
					<view class="section-header">
						<text class="section-title">标签配置</text>
						<text class="section-desc">通过多维度标签分类,提升经验检索精准度</text>
					</view>
					<view class="form-items">
						<view class="item-label">固定标签</view>
						<view class="item-content-full">
							<view
								v-for="(tag, index) in formData.fixedTags"
								:key="index"
								class="tag-group"
							>
								<cl-select
                                    class="tag-group-select"
									v-model="tag.type"
									:options="getAvailableTagTypes(index)"
									placeholder="标签类型"
									@change="handleTagTypeChange(index)"
								></cl-select>
								<cl-select
                                    class="tag-group-select"
									v-model="tag.value"
									:options="getTagOptions(tag.type)"
									:placeholder="getTagPlaceholder(tag.type)"
								></cl-select>
								<cl-button
									v-if="index === 0 && hasUnusedTagType"
									type="primary"
									size="small"
									plain
                                    :border="false"
									@tap="addTagGroup"
								>
							        <cl-icon name="plus-border" :size="28"></cl-icon>
									新增
								</cl-button>
								<cl-button
									v-if="formData.fixedTags.length > 1"
									type="error"
									size="small"
									plain
                                    :border="false"
									@tap="removeTagGroup(index)"
								>
							        <cl-icon name="delete" :size="28"></cl-icon>
									删除
								</cl-button>
							</view>
						</view>
					</view>
					<view class="form-items">
						<view class="item-label">自定义标签</view>
						<view class="item-content-full">
							<view class="keyword-input">
								<cl-input
									v-model="newKeyword"
									placeholder="输入后回车添加"
									@confirm="handleAddKeyword"
								></cl-input>
								<button class="keyword-input-add" @tap="handleAddKeyword">
									添加
								</button>
							</view>
							<view class="keyword-tags">
								<view
									v-for="(keyword, index) in formData.keywords"
									:key="index"
									class="keyword-tag"
									@tap="handleRemoveKeyword(index)"
								>
									<text>{{ keyword }}</text>
									<cl-icon name="close" size="28"></cl-icon>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 底部按钮 -->
			<view class="form-footer">
				<button class="footer-btn btn-reset" @tap="handleReset">重置</button>
				<button class="footer-btn btn-submit" @tap="handleSubmit">提交</button>
			</view>
		</view>
	</cl-page>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useCool } from "/@/cool";
import CommonUpload from "@/components/commonUpload.vue";
import {
	getTechType,
	getSubsystemList,
	addExperience,
} from "./api";

const { router } = useCool();

// 表单数据
const formData = reactive({
	questions: [{ value: "" }],
	processes: [{ value: "" }],
	results: [{ value: "" }],
	fixedTags: [{ type: "subsystem", value: "" }],
	keywords: [] as string[],
	questionUrl: [] as any[],
	processUrl: [] as any[],
	resultUrl: [] as any[],
});

const newKeyword = ref("");

// 标签类型选项
const tagTypeOptions = [
	{ label: "子系统", value: "subsystem" },
	{ label: "设备类型", value: "deviceType" },
	{ label: "技术类型", value: "technologyType" },
];

// 标签值选项
const tagValueOptions = reactive({
	subsystem: [] as any[],
	deviceType: [
		{ label: "硬件", value: 2 },
		{ label: "软件", value: 1 },
	],
	technologyType: [] as any[],
});

// 问题现象操作
const addQuestion = () => {
	formData.questions.push({ value: "" });
};

const removeQuestion = (index: number) => {
	if (formData.questions.length > 1) {
		formData.questions.splice(index, 1);
	}
};

// 处理过程操作
const addProcess = () => {
	formData.processes.push({ value: "" });
};

const removeProcess = (index: number) => {
	if (formData.processes.length > 1) {
		formData.processes.splice(index, 1);
	}
};

// 结果验证操作
const addResult = () => {
	formData.results.push({ value: "" });
};

const removeResult = (index: number) => {
	if (formData.results.length > 1) {
		formData.results.splice(index, 1);
	}
};

// 标签操作
const getAvailableTagTypes = (currentIndex: number) => {
	const currentType = formData.fixedTags[currentIndex]?.type;
	const usedTypes = formData.fixedTags
		.map((item, index) => (index === currentIndex ? null : item.type))
		.filter(Boolean);
	return tagTypeOptions.filter(
		(option) => option.value === currentType || !usedTypes.includes(option.value)
	);
};

const hasUnusedTagType = computed(() =>
	tagTypeOptions.some(
		(option) => !formData.fixedTags.some((tag) => tag.type === option.value)
	)
);

const getTagPlaceholder = (type: string) => {
	const placeholders: Record<string, string> = {
		subsystem: "请选择子系统",
		deviceType: "请选择设备类型",
		technologyType: "请选择技术类型",
	};
	return placeholders[type] || "请选择";
};

const getTagOptions = (type: string) => {
	return (tagValueOptions as any)[type] || [];
};

const handleTagTypeChange = (index: number) => {
	if (formData.fixedTags[index]) {
		formData.fixedTags[index].value = "";
	}
};

const addTagGroup = () => {
	if (!hasUnusedTagType.value) {
		uni.showToast({
			title: "没有可用的标签类型",
			icon: "none",
		});
		return;
	}
	const nextType =
		tagTypeOptions.find(
			(option) => !formData.fixedTags.some((tag) => tag.type === option.value)
		)?.value || "";
	formData.fixedTags.push({
		type: nextType,
		value: "",
	});
};

const removeTagGroup = (index: number) => {
	if (formData.fixedTags.length > 1) {
		formData.fixedTags.splice(index, 1);
	}
};

// 自定义标签操作
const handleAddKeyword = () => {
	const value = newKeyword.value?.trim();
	if (!value) return;
	if (!formData.keywords.includes(value)) {
		formData.keywords.push(value);
	} else {
		uni.showToast({
			title: "关键词已存在",
			icon: "none",
		});
		return;
	}
	newKeyword.value = "";
};

const handleRemoveKeyword = (index: number) => {
	formData.keywords.splice(index, 1);
};

// 返回
const handleBack = () => {
	uni.navigateBack();
};

// 重置
const handleReset = () => {
	uni.showModal({
		title: "提示",
		content: "确定要重置表单吗？",
		success: (res) => {
			if (res.confirm) {
				formData.questions = [{ value: "" }];
				formData.processes = [{ value: "" }];
				formData.results = [{ value: "" }];
				formData.fixedTags = [{ type: "subsystem", value: "" }];
				formData.keywords = [];
				formData.questionUrl = [];
				formData.processUrl = [];
				formData.resultUrl = [];
				uni.showToast({
					title: "已重置",
					icon: "success",
				});
			}
		},
	});
};

// 提交
const handleSubmit = async () => {
	// 验证必填项
	const hasProblemPhenomenon = formData.questions.some((item) => item.value.trim());
	const hasProcessingProcedure = formData.processes.some((item) => item.value.trim());
	const hasResultVerification = formData.results.some((item) => item.value.trim());

	if (!hasProblemPhenomenon) {
		uni.showToast({
			title: "请至少填写一个问题现象",
			icon: "none",
		});
		return;
	}

	if (!hasProcessingProcedure) {
		uni.showToast({
			title: "请至少填写一个处理过程",
			icon: "none",
		});
		return;
	}

	if (!hasResultVerification) {
		uni.showToast({
			title: "请至少填写一个结果验证",
			icon: "none",
		});
		return;
	}

	// 验证固定标签配置：至少选一个
	const hasFixedTag = formData.fixedTags.some((item) => item.type && item.value);
	if (!hasFixedTag) {
		uni.showToast({
			title: "请至少选择一个固定标签",
			icon: "none",
		});
		return;
	}
	// 验证自定义标签配置：至少填一个
	const hasCustomTag = formData.keywords && formData.keywords.length > 0;
	if (!hasCustomTag) {
		uni.showToast({
			title: "请至少填写一个自定义标签",
			icon: "none",
		});
		return;
	}

	try {
		uni.showLoading({
			title: "提交中...",
		});

		// 构建提交数据
		const submitData: any = {
			questions: formData.questions
				.filter((item) => item.value.trim())
				.map((item) => item.value.trim()),
			processes: formData.processes
				.filter((item) => item.value.trim())
				.map((item) => item.value.trim()),
			results: formData.results
				.filter((item) => item.value.trim())
				.map((item) => item.value.trim()),
			questionUrl: formData.questionUrl
				.map((item) => item.url || item.data?.url || item)
				.filter(Boolean)
				.join(","),
			processUrl: formData.processUrl
				.map((item) => item.url || item.data?.url || item)
				.filter(Boolean)
				.join(","),
			resultUrl: formData.resultUrl
				.map((item) => item.url || item.data?.url || item)
				.filter(Boolean)
				.join(","),
			keywords: formData.keywords,
		};

		// 处理固定标签
		formData.fixedTags.forEach((item) => {
			if (item.type === "subsystem") {
				submitData.subsystemId = item.value;
			} else if (item.type === "deviceType") {
				submitData.deviceType = item.value;
			} else if (item.type === "technologyType") {
				submitData.techTypeId = item.value;
			}
		});

		await addExperience(submitData);

		uni.hideLoading();
		uni.showToast({
			title: "提交成功",
			icon: "success",
		});

		setTimeout(() => {
			uni.navigateBack();
		}, 1500);
	} catch (error: any) {
		uni.hideLoading();
		uni.showToast({
			title: error.message || "提交失败",
			icon: "none",
		});
	}
};

// 获取技术类型
const getTechTypeOptions = async () => {
	try {
		const res = await getTechType();
		const data = res || [];
		tagValueOptions.technologyType = Array.isArray(data)
			? data.map((item: any) => ({
					label: item.name,
					value: item.id,
			  }))
			: [];
	} catch (error) {
		console.error("获取技术类型失败", error);
	}
};

// 获取子系统列表
const getSubsystemOptions = async () => {
	try {
		const res = await getSubsystemList();
		const data = res || [];
		tagValueOptions.subsystem = Array.isArray(data)
			? data.map((item: any) => ({
					label: item.subsystemName,
					value: item.id,
			  }))
			: [];
	} catch (error) {
		console.error("获取子系统列表失败", error);
	}
};

onMounted(() => {
	getTechTypeOptions();
	getSubsystemOptions();
});
</script>

<style lang="scss" scoped>
.add-experience-page {
	height: calc(100% - 88rpx);
	display: flex;
	flex-direction: column;
	background-color: #f5f7fa;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx;
	background-color: #fff;
	border-bottom: 1rpx solid #ebeef5;
}

.page-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #303133;
}

.form-container {
	flex: 1;
	overflow: hidden;
}

.form-section {
	margin: 20rpx 24rpx;
	padding: 20rpx 23rpx 32rpx 23rpx;
	background: linear-gradient( 180deg, #F6F8FC 0%, #FFFFFF 100%);
    border-radius: 20px;
    border: 2px solid #FFFFFF;
}

.section-header {
    display: flex;
    align-items: flex-end;
	margin-bottom: 36rpx;
	padding-bottom: 16rpx;
}

.section-title {
	position: relative;
	padding-left: 18rpx;
	font-weight: 600;
	font-size: 29rpx;
	color: #13144F;
	line-height: 1;
    margin-right: 15rpx;

	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 6rpx;
		height: 28rpx;
		background: #4474FF;
		border-radius: 15rpx;
	}
}

.section-desc {
	display: block;
	font-size: 21rpx;
	color: #949DAD;
}

.form-items {
	margin-bottom: 24rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.form-item-group {
	margin-bottom: 14rpx;
}

.item-label {
	font-size: 22rpx;
	font-weight: 500;
	color: #949DAD;
	margin-bottom: 12rpx;
}

.item-content {
	display: flex;
	flex-direction: column;
	gap: 12rpx;

    .cl-textarea {
        padding: 24rpx 25rpx;
        background: #FFFFFF;
        border-radius: 15rpx;
        border: 1rpx solid #A9BFFF;
    }

    :deep(.cl-textarea__inner) {
        font-size: 22rpx;
    }
}

.delete-btn {
    margin-left: auto;
    margin-right: 0;
}

.item-content-full {
	width: 100%;
}

.tag-group {
	display: flex;
    flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 16rpx;
	align-items: center;

	&:last-child {
		margin-bottom: 0;
	}

    .tag-group-select {
        width: 49%;
    }
}

.keyword-input {
	display: flex;
	gap: 12rpx;
    padding: 5rpx;
	margin-bottom: 16rpx;
    background: #FFFFFF;
    border-radius: 15rpx 15rpx 15rpx 15rpx;
    border: 1rpx solid #A9BFFF;

    .cl-input {
        border: none;
    }

    .keyword-input-add {
        width: 125rpx;
        height: 63rpx;
        background: #4474FF;
        border-radius: 15rpx;
        font-size: 21rpx;
        line-height: 63rpx;
        color: #FFFFFF;
    }
}

.keyword-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.keyword-tag {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 16rpx;
	color: #606266;
	border-radius: 8rpx;
	font-size: 24rpx;
    background: rgba($color: #4474FF, $alpha: .2);
    border: 1rpx solid #4474FF;
    color: #4474FF;
}

.form-footer {
    position: relative;
	display: flex;
    align-items: center;
    justify-content: center;
	gap: 20rpx;
	height: 146rpx;
    background: #FFFFFF;
    box-shadow: 8rpx 0rpx 10rpx 0rpx rgba(169,191,255,0.5);

    .footer-btn {
        width: 292rpx;
        height: 83rpx;
        background: #949DAD;
        border-radius: 21rpx;
        font-size: 29rpx;
        color: #FFFFFF;
        line-height: 83rpx;
        margin: 0;
    }
    .btn-reset {
        background: #949DAD;
    }
    .btn-submit {
        background: #4474FF;
    }
}
</style>

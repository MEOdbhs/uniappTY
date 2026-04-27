<template>
	<view class="tech-forum-page">
		<view class="filter-section">
			<view class="search-header">
				<view class="search-box">
					<view class="search-input-wrap">
						<input
							v-model="form.keywords"
							class="native-input"
							placeholder="请输入关键词"
							placeholder-class="native-input-placeholder"
							confirm-type="search"
							@confirm="handleSearch"
						/>
						<image
							src="/static/icon/TecLibrary/F.png"
							class="search-icon"
							mode="aspectFit"
							@click="handleSearch"
						/>
					</view>
				</view>
				<view class="filter-btn" @tap="openFilterPopup">
					<image src="/static/icon/TecLibrary/E.png" class="filter-icon" mode="aspectFit" />
					<text class="filter-text">筛选</text>
				</view>
			</view>

			<cl-popup
				v-model="filterPopupVisible"
				direction="center"
				:padding="0"
				background-color="transparent"
				:show-header="false"
			>
				<view class="filter-popup filter-popup--floating">
					<view class="filter-popup__header">
						<text class="filter-popup__title">全部条件</text>
						<view class="filter-popup__close-wrap" @tap="filterPopupVisible = false">
							<cl-icon name="close" :size="40" />
						</view>
					</view>
					<scroll-view
						v-if="selectedFilterChips.length"
						scroll-x
						class="filter-popup__chips"
						show-scrollbar="false"
					>
						<view class="filter-popup__chips-inner">
							<view
								v-for="(chip, idx) in selectedFilterChips"
								:key="idx"
								class="filter-chip"
								@tap="removeFilterChip(chip)"
							>
								<text class="filter-chip__text">{{ chip.label }}</text>
								<text class="filter-chip__x">×</text>
							</view>
						</view>
					</scroll-view>
					<view class="filter-popup__body">
						<scroll-view scroll-y class="filter-popup__nav">
							<view
								v-for="g in filterGroupList"
								:key="g.id"
								:class="['filter-nav-item', { active: activeFilterGroup === g.id }]"
								@tap="activeFilterGroup = g.id"
							>
								{{ g.label }}
							</view>
						</scroll-view>
						<scroll-view v-if="activeFilterGroup === 'techType'" scroll-y class="filter-popup__options">
							<view class="filter-option-grid">
								<view
									v-for="opt in currentGroupOptions"
									:key="String(opt.value) + '-' + opt.label"
									:class="['filter-option-cell', { selected: isOptionSelected(opt) }]"
									@tap="toggleOption(opt)"
								>
									{{ opt.label }}
								</view>
							</view>
						</scroll-view>
						<view v-else class="filter-popup__options filter-popup__options--author">
							<input
								v-model="draftTitle"
								type="text"
								class="author-input"
								placeholder="请输入标题"
								placeholder-class="native-input-placeholder"
								:adjust-position="true"
								:cursor-spacing="24"
							/>
						</view>
					</view>
					<view class="filter-popup__footer">
						<view class="filter-popup__btn filter-popup__btn--reset" @tap="resetFilterDraft">重置</view>
						<view class="filter-popup__btn filter-popup__btn--confirm" @tap="confirmFilter">确定</view>
					</view>
				</view>
			</cl-popup>
		</view>

		<view class="forum-list">
			<cl-scroller class="scroller" @down="handleRefresh" ref="scrollerRef" @up="handleLoadMore">
				<view v-if="loading && questionsList.length === 0" class="loading-box">
					<cl-loading></cl-loading>
				</view>
				<view v-else-if="questionsList.length === 0 && !loading" class="empty-box">
					<text class="empty-text">暂无数据</text>
				</view>
				<view v-else class="forum-list-inner">
					<view
						v-for="(item, index) in questionsList"
						:key="item.id || index"
						class="forum-item"
						@click="handleDetail(item.id)"
					>
						<view class="forum-item__title">{{ item.title }}</view>
						<view class="forum-item__summary">{{ stripHtml(item?.content || "") }}</view>
						<view class="forum-item__tags">
							<text v-if="item.technologyTypeText" class="pill pill--type">{{
								item.technologyTypeText
							}}</text>
							<text
								v-for="(tag, ti) in keywordTagNames(item)"
								:key="ti"
								class="pill pill--kw"
							>{{ tag }}</text>
						</view>
						<view class="forum-item__footer">
							<view class="forum-item__footer-left">
								<view class="forum-avatar">{{ avatarLetter(item.questionPerson) }}</view>
								<text class="forum-name">{{ item.questionPerson || "-" }}</text>
								<text class="forum-time">{{ item.createTime || "-" }}</text>
							</view>
							<text class="forum-answer">回答 ({{ item?.answerCount ?? 0 }})</text>
						</view>
					</view>
					<view v-if="finished && questionsList.length > 0" class="load-more-tip">没有更多数据了</view>
				</view>
			</cl-scroller>
		</view>

		<button class="add-btn" type="button" @click="openAddDialog">
			<cl-icon class="add-btn-icon" name="plus-border" />
			<text>论坛提问</text>
		</button>

		<QuestionDialog
			v-model="showQuestionDialog"
			:tech-type-options="techTypeOptions"
			@success="handleQuestionSuccess"
		/>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useCool } from "/@/cool";
import { getTechnologyQuestionList, getTechnologyTypeList } from "../api";
import QuestionDialog from "./QuestionDialog.vue";

const { router } = useCool();
const scrollerRef = ref(null);

const form = reactive({
	title: "",
	keywords: "",
	technologyType: "" as string | number,
});

const questionsList = ref<any[]>([]);
const pageSize = ref(10);
const pageNum = ref(1);
const total = ref(0);
const loading = ref(false);
const finished = ref(false);

const techTypeOptions = ref<{ label: string; value: string | number }[]>([]);
const showQuestionDialog = ref(false);

const filterPopupVisible = ref(false);
const activeFilterGroup = ref<"title" | "techType">("techType");
const draftTitle = ref("");
const draftTechnologyType = ref<string | number>("");

const filterGroupList = [
	{ id: "title" as const, label: "标题" },
	{ id: "techType" as const, label: "技术类型" },
];

const currentGroupOptions = computed(() => {
	const empty = { label: "全部", value: "" };
	return [empty, ...techTypeOptions.value];
});

const selectedFilterChips = computed(() => {
	const chips: { label: string; groupId: string }[] = [];
	const titleTrim = draftTitle.value.trim();
	if (titleTrim) chips.push({ label: `标题：${titleTrim}`, groupId: "title" });
	if (draftTechnologyType.value !== "" && draftTechnologyType.value != null) {
		const f = techTypeOptions.value.find((c) => c.value == draftTechnologyType.value);
		if (f) chips.push({ label: `技术类型：${f.label}`, groupId: "techType" });
	}
	return chips;
});

function openFilterPopup() {
	draftTitle.value = form.title || "";
	draftTechnologyType.value = form.technologyType || "";
	activeFilterGroup.value = "techType";
	filterPopupVisible.value = true;
}

function isOptionSelected(opt: { label: string; value: string | number }) {
	return draftTechnologyType.value == opt.value;
}

function toggleOption(opt: { label: string; value: string | number }) {
	draftTechnologyType.value = draftTechnologyType.value == opt.value ? "" : opt.value;
}

function removeFilterChip(chip: { label: string; groupId: string }) {
	if (chip.groupId === "title") draftTitle.value = "";
	if (chip.groupId === "techType") draftTechnologyType.value = "";
}

function resetFilterDraft() {
	draftTitle.value = "";
	draftTechnologyType.value = "";
}

function confirmFilter() {
	form.title = draftTitle.value.trim();
	form.technologyType = draftTechnologyType.value === "" ? "" : draftTechnologyType.value;
	filterPopupVisible.value = false;
	handleSearch();
}

const stripHtml = (html: string = "") => html.replace(/<[^>]*>/g, "");

function keywordTagNames(item: any): string[] {
	const list = item?.keywordsList;
	if (!Array.isArray(list)) return [];
	return list
		.map((x: any) => x?.keywordsName || "")
		.filter(Boolean)
		.slice(0, 6);
}

function avatarLetter(name: string) {
	const s = (name || "?").trim();
	return s ? s.slice(0, 1) : "?";
}

function handleSearch() {
	pageNum.value = 1;
	questionsList.value = [];
	finished.value = false;
	fetchList();
}

function handleLoadMore() {
	if (finished.value || loading.value) return;
	if (questionsList.value.length >= total.value && total.value > 0) return;
	pageNum.value += 1;
	fetchList();
}

async function handleRefresh(end?: () => void) {
	pageNum.value = 1;
	questionsList.value = [];
	finished.value = false;
	await fetchList();
	if (end) end();
}

async function fetchList() {
	if (loading.value) return;
	loading.value = true;
	try {
		const params: Record<string, any> = {
			pageSize: pageSize.value,
			pageNum: pageNum.value,
			title: form.title,
			keywords: form.keywords,
			technologyType: form.technologyType || undefined,
		};
		const res = await getTechnologyQuestionList(params);
		const rows = res?.rows || [];
		if (pageNum.value === 1) {
			questionsList.value = rows;
		} else {
			questionsList.value = [...questionsList.value, ...rows];
		}
		total.value = res?.total || 0;
		const totalPg = Math.max(1, Math.ceil(total.value / pageSize.value));
		if (pageNum.value >= totalPg || rows.length === 0) {
			finished.value = true;
		}
	} catch (error: any) {
		console.error("获取问题列表失败", error);
		uni.showToast({
			title: error.message || "获取问题列表失败",
			icon: "none",
		});
	} finally {
		loading.value = false;
	}
}

function handleDetail(questionId: string) {
	router.push({
		path: "/pages_auto/technology/detail",
		query: {
			id: questionId,
			type: "JSLT",
		},
	});
}

function openAddDialog() {
	showQuestionDialog.value = true;
}

async function handleQuestionSuccess() {
	pageNum.value = 1;
	questionsList.value = [];
	finished.value = false;
	await fetchList();
}

async function getTechTypeList() {
	try {
		const res = await getTechnologyTypeList({ relationType: "JSLT" });
		const data = res?.data || res || [];
		techTypeOptions.value = Array.isArray(data)
			? data.map((item: any) => ({
					label: item.name || item.label,
					value: item.id ?? item.value,
			  }))
			: [];
	} catch (error) {
		console.error("获取技术类型失败", error);
	}
}

onMounted(() => {
	getTechTypeList();
	fetchList();
});
</script>

<style lang="scss" scoped>
.tech-forum-page {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
	position: relative;
	width: 708rpx;
	max-width: 100%;
	margin: 0 auto;
	box-sizing: border-box;
	background: linear-gradient(180deg, #f6f8fc 0%, #ffffff 100%);
	border-radius: 21rpx;
	border: 2rpx solid #ffffff;
	overflow: hidden;
}

.filter-section {
	padding: 25rpx 15rpx 0 20rpx;
	flex-shrink: 0;

	.search-header {
		background-color: transparent;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		gap: 20rpx;
	}

	.search-box {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		width: 571rpx;
		max-width: calc(100% - 100rpx);
		height: 73rpx;
		padding: 18rpx 26rpx 18rpx 32rpx;
		background: #ffffff;
		box-shadow: 0rpx 4rpx 10rpx 0rpx rgba(198, 215, 255, 0.3);
		border-radius: 94rpx;
		border: 2rpx solid #c6d7ff;
	}

	.search-input-wrap {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 16rpx;
		min-width: 0;
	}

	.native-input {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		height: 64rpx;
		line-height: 64rpx;
		background: transparent;
		border: none;
		min-width: 0;
	}

	.native-input-placeholder {
		color: #c0c4cc;
		font-size: 28rpx;
	}

	.search-icon {
		width: 40rpx;
		height: 40rpx;
		flex-shrink: 0;
	}

	.filter-btn {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		flex-shrink: 0;
	}

	.filter-icon {
		width: 32rpx;
		height: 32rpx;
	}

	.filter-text {
		font-size: 22rpx;
		color: #000000;
		white-space: nowrap;
	}
}

.filter-popup {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;
	overflow: hidden;
	background-color: #fff;
}

.filter-popup--floating {
	width: 90vw;
	max-width: 690rpx;
	height: 65vh;
	max-height: 900rpx;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 12rpx 48rpx rgba(19, 20, 79, 0.18);
}

.filter-popup__header {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	padding: 28rpx 32rpx 20rpx;
	border-bottom: 1rpx solid #eef0f4;
}

.filter-popup__title {
	font-size: 32rpx;
	font-weight: 600;
	color: #303133;
}

.filter-popup__close-wrap {
	position: absolute;
	right: 24rpx;
	top: 50%;
	transform: translateY(-50%);
	padding: 8rpx;
}

.filter-popup__chips {
	flex-shrink: 0;
	max-height: 120rpx;
	background-color: #f5f7fa;
	padding: 16rpx 24rpx;
	white-space: nowrap;
}

.filter-popup__chips-inner {
	display: inline-flex;
	flex-direction: row;
	gap: 16rpx;
	padding-right: 24rpx;
}

.filter-chip {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 20rpx;
	background-color: #fff;
	border-radius: 8rpx;
	font-size: 24rpx;
	color: #606266;
	border: 1rpx solid #c6d7ff;
}

.filter-chip__x {
	color: #909399;
	font-size: 28rpx;
	line-height: 1;
}

.filter-popup__body {
	flex: 1;
	display: flex;
	flex-direction: row;
	min-height: 0;
	height: 0;
}

.filter-popup__nav {
	width: 200rpx;
	flex-shrink: 0;
	background-color: #f5f7fa;
	border-right: 1rpx solid #eef0f4;
}

.filter-nav-item {
	padding: 28rpx 20rpx;
	font-size: 26rpx;
	color: #606266;
	border-left: 6rpx solid transparent;

	&.active {
		background-color: #fff;
		color: #13144f;
		font-weight: 600;
		border-left-color: #4873fa;
	}
}

.filter-popup__options {
	flex: 1;
	min-width: 0;
	padding: 20rpx 24rpx;
	background-color: #fff;
}

.filter-popup__options--author {
	flex: 1;
	min-height: 220rpx;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
}

.author-input {
	width: 100%;
	box-sizing: border-box;
	padding: 24rpx;
	font-size: 28rpx;
	border: 2rpx solid #c6d7ff;
	border-radius: 12rpx;
	background-color: #fafbfc;
	min-height: 88rpx;
}

.filter-option-grid {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 20rpx;
}

.filter-option-cell {
	width: calc((100% - 20rpx) / 2);
	box-sizing: border-box;
	padding: 22rpx 16rpx;
	text-align: center;
	font-size: 26rpx;
	color: #4873fa;
	border: 2rpx solid #c6d7ff;
	border-radius: 12rpx;
	background-color: #fff;

	&.selected {
		background: linear-gradient(135deg, #4873fa 0%, #1b2cd2 100%);
		color: #fff;
		border-color: transparent;
	}
}

.filter-popup__footer {
	flex-shrink: 0;
	display: flex;
	flex-direction: row;
	gap: 24rpx;
	padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
	border-top: 1rpx solid #eef0f4;
	background-color: #fff;
	box-sizing: border-box;
}

.filter-popup__btn {
	flex: 1;
	text-align: center;
	padding: 26rpx 0;
	font-size: 30rpx;
	border-radius: 16rpx;
	font-weight: 500;
}

.filter-popup__btn--reset {
	background-color: #e8eaed;
	color: #606266;
}

.filter-popup__btn--confirm {
	background: linear-gradient(135deg, #4873fa 0%, #1b2cd2 100%);
	color: #fff;
}

.forum-list {
	flex: 1;
	position: relative;
	overflow: hidden;
	min-height: 0;
}

.scroller {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

.forum-list-inner {
	padding: 16rpx 20rpx 200rpx;
	box-sizing: border-box;
}

.loading-box,
.empty-box {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 400rpx;
}

.empty-text {
	color: #909399;
	font-size: 28rpx;
}

/* 论坛卡片：与文档列表区分，偏白底 + 轻分割线 */
.forum-item {
	padding: 28rpx 24rpx;
	margin-bottom: 20rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	border: 1rpx solid #e8ecf4;
	box-shadow: 0 4rpx 16rpx rgba(72, 115, 250, 0.06);
}

.forum-item__title {
	font-size: 32rpx;
	font-weight: 700;
	color: #13144f;
	line-height: 1.45;
	margin-bottom: 12rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
}

.forum-item__summary {
	font-size: 26rpx;
	color: #909399;
	line-height: 1.55;
	margin-bottom: 16rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
}

.forum-item__tags {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 20rpx;
}

.pill {
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
	font-size: 22rpx;
	line-height: 1.3;
}

.pill--type {
	background-color: #fff1e6;
	color: #ea580c;
	border: 1rpx solid rgba(234, 88, 12, 0.2);
}

.pill--kw {
	background-color: #e8f1ff;
	color: #2563eb;
	border: 1rpx solid rgba(37, 99, 235, 0.12);
}

.forum-item__footer {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding-top: 16rpx;
	border-top: 1rpx solid #eef0f4;
}

.forum-item__footer-left {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 12rpx;
	min-width: 0;
	flex: 1;
}

.forum-avatar {
	width: 52rpx;
	height: 52rpx;
	border-radius: 50%;
	box-sizing: border-box;
	border: 2rpx solid #b8d0ff;
	background: linear-gradient(135deg, #e8eeff 0%, #d4e3ff 100%);
	color: #4a7aff;
	font-size: 22rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.forum-name {
	font-size: 26rpx;
	font-weight: 500;
	color: #4474ff;
	max-width: 200rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.forum-time {
	font-size: 24rpx;
	color: #909399;
	flex-shrink: 0;
}

.forum-answer {
	font-size: 26rpx;
	font-weight: 500;
	color: #4474ff;
	flex-shrink: 0;
}

.load-more-tip {
	text-align: center;
	padding: 32rpx;
	color: #909399;
	font-size: 28rpx;
}

.add-btn {
	position: fixed;
	bottom: 140rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 417rpx;
	max-width: calc(100% - 48rpx);
	box-sizing: border-box;
	z-index: 30;
	height: 84rpx;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	background: #4474ff;
	box-shadow: 0rpx 4rpx 10rpx 0rpx rgba(68, 116, 255, 0.3);
	border-radius: 83rpx;
	border: 2rpx solid #ffffff;
	font-size: 29rpx;
	line-height: 1;
	color: #ffffff;

	&::after {
		border: none;
	}

	.add-btn-icon {
		margin-right: 20rpx;
		flex-shrink: 0;
		font-size: 40rpx;
		color: #ffffff;
	}
}
</style>

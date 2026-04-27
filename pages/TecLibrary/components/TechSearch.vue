<template>
	<view class="tech-search-page">
		<view class="filter-section">
			<view class="search-header">
				<view class="search-box">
					<view class="search-input-wrap">
						<input v-model="keyword" class="native-input" placeholder="请输入标题/关键词搜索"
							placeholder-class="native-input-placeholder" confirm-type="search" @input="handleInputChange"
							@confirm="handleSearch" />
						<image src="/static/icon/TecLibrary/F.png" class="search-icon" mode="aspectFit"
							@click="handleSearch"></image>
					</view>
				</view>
				<view class="filter-btn" @tap="openFilterPopup">
					<image src="/static/icon/TecLibrary/E.png" class="filter-icon" mode="aspectFit"></image>
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
				<scroll-view v-if="selectedFilterChips.length" scroll-x class="filter-popup__chips"
					show-scrollbar="false">
					<view class="filter-popup__chips-inner">
						<view v-for="(chip, idx) in selectedFilterChips" :key="idx" class="filter-chip"
							@tap="removeFilterChip(chip)">
							<text class="filter-chip__text">{{ chip.label }}</text>
							<text class="filter-chip__x">×</text>
						</view>
					</view>
				</scroll-view>
				<view class="filter-popup__body">
					<scroll-view scroll-y class="filter-popup__nav">
						<view v-for="g in filterGroupList" :key="g.id"
							:class="['filter-nav-item', { active: activeFilterGroup === g.id }]"
							@tap="activeFilterGroup = g.id">
							{{ g.label }}
						</view>
					</scroll-view>
					<scroll-view scroll-y class="filter-popup__options">
						<view class="filter-option-grid">
							<view v-for="opt in currentGroupOptions" :key="String(opt.value)"
								:class="['filter-option-cell', { selected: isOptionSelected(opt) }]"
								@tap="toggleOption(opt)">
								{{ opt.label }}
							</view>
						</view>
					</scroll-view>
				</view>
				<view class="filter-popup__footer">
					<view class="filter-popup__btn filter-popup__btn--reset" @tap="resetFilterDraft">重置</view>
					<view class="filter-popup__btn filter-popup__btn--confirm" @tap="confirmFilter">确定</view>
				</view>
			</view>
		</cl-popup>
		</view>
		<!-- 热搜排行榜（无搜索关键词时显示） -->
		<scroll-view v-if="!hasSearched" class="hot-rank-section" scroll-y :refresher-enabled="true"
			:refresher-triggered="refreshing" @refresherrefresh="handleRefreshHot">
			<view v-if="hotLoading" class="loading-box">
				<cl-loading></cl-loading>
			</view>
			<view v-else class="hot-list-container">
				<!-- Tab标题切换 -->
				<view class="hot-tabs">
					<view :class="['hot-tab-item', { active: activeHotTab === 'docs' }]" @click="activeHotTab = 'docs'">
						热搜文档TOP10</view>
					<view :class="['hot-tab-item', { active: activeHotTab === 'keywords' }]"
						@click="activeHotTab = 'keywords'">
						热搜关键词TOP10</view>
				</view>

				<!-- 热搜文档列表 -->
				<view class="hot-list" v-show="activeHotTab === 'docs'">
					<view v-for="(item, index) in hotDocuments" :key="index" class="hot-item"
						@click="handleHotDocumentClick(item)">
						<view v-if="index < 3" class="item-rank-bg" :style="getRankBgStyle(index)"></view>
						<view class="hot-rank" :class="getRankClass(index)">{{ index + 1 }}</view>
						<view class="hot-content">
							<text class="hot-text">{{ item.text }}</text>
							<text class="hot-value" v-if="item.hotValue">{{ item.hotValue }}热度</text>
						</view>
					</view>
				</view>

				<!-- 热搜关键词列表 -->
				<view class="hot-list" v-show="activeHotTab === 'keywords'">
					<view v-for="(item, index) in hotKeywords" :key="index" class="hot-item"
						@click="handleHotKeywordClick(item)">
						<view v-if="index < 3" class="item-rank-bg" :style="getRankBgStyle(index)"></view>
						<view class="hot-rank" :class="getRankClass(index)">{{ index + 1 }}</view>
						<view class="hot-content">
							<text class="hot-text">{{ item.text }}</text>
							<text class="hot-value" v-if="item.hotValue">{{ item.hotValue }}热度</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 搜索结果列表（有搜索关键词时显示） -->
		<scroll-view v-else class="result-list" scroll-y @scrolltolower="handleLoadMore" :refresher-enabled="true"
			:refresher-triggered="refreshing" @refresherrefresh="handleRefresh">
			<view v-if="loading && resultList.length === 0" class="loading-box">
				<cl-loading></cl-loading>
			</view>
			<view v-else-if="resultList.length === 0 && !loading" class="empty-box">
				<text class="empty-text">暂无搜索结果</text>
			</view>
			<view v-else class="result-list-inner">
				<view v-for="(item, index) in resultList" :key="item.id || item.docId || index" class="result-card"
					@click="handleItemClick(item)">
					<view class="result-card__head">
						<view class="result-title-row">
							<view class="title-main">
								<text v-if="pickTitleParts(item).prefix" class="title-prefix">{{
									pickTitleParts(item).prefix }}</text>
								<text class="title-rest">{{ pickTitleParts(item).rest }}</text>
							</view>
							<view class="title-tags">
								<text v-for="(tag, ti) in pickHeadTags(item)" :key="ti" class="head-tag">{{ tag
								}}</text>
							</view>
						</view>
					</view>
					<view class="result-card__summary">{{ pickSummaryOneLine(item) }}</view>
					<view class="result-card__footer">
						<text v-if="pickCategoryFooter(item)" class="category-tag">{{ pickCategoryFooter(item) }}</text>
					</view>
				</view>
				<view v-if="finished && resultList.length > 0" class="load-more-tip">
					没有更多数据了
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useCool } from "/@/cool";
import { searchTechnologyLibrary, fetchHotDocuments, fetchHotKeywords } from "../api";

const { router } = useCool();

const keyword = ref("");
const filterCategory = ref("");
const filterSort = ref("");
const resultList = ref<any[]>([]);

const filterPopupVisible = ref(false);
const activeFilterGroup = ref<"category" | "sort">("category");
const draftCategory = ref("");
const draftSort = ref("");

const filterGroupList = [
	{ id: "category" as const, label: "分类" },
	{ id: "sort" as const, label: "排序" },
];

const categories = [
	{ label: "全部", value: "" },
	{ label: "技术文档", value: "JSWD" },
	{ label: "经验文库", value: "JYWK" },
	{ label: "技术论坛", value: "JSLT" },
];

const sorts = [
	{ label: "全部", value: "" },
	{ label: "热门词频", value: "hotRead" },
	{ label: "最新上传", value: "latest" },
];

const currentGroupOptions = computed(() => {
	switch (activeFilterGroup.value) {
		case "category":
			return categories;
		case "sort":
			return sorts;
		default:
			return [];
	}
});

const selectedFilterChips = computed(() => {
	const chips: { label: string; groupId: string }[] = [];
	if (draftCategory.value) {
		const f = categories.find((c) => c.value === draftCategory.value);
		if (f) chips.push({ label: `分类：${f.label}`, groupId: "category" });
	}
	if (draftSort.value) {
		const s = sorts.find((x) => x.value === draftSort.value);
		if (s) chips.push({ label: `排序：${s.label}`, groupId: "sort" });
	}
	return chips;
});

function openFilterPopup() {
	draftCategory.value = filterCategory.value;
	draftSort.value = filterSort.value;
	activeFilterGroup.value = "category";
	filterPopupVisible.value = true;
}

function resetFilterDraft() {
	draftCategory.value = "";
	draftSort.value = "";
}

function removeFilterChip(chip: { label: string; groupId: string }) {
	if (chip.groupId === "category") draftCategory.value = "";
	if (chip.groupId === "sort") draftSort.value = "";
}

function isOptionSelected(opt: { label: string; value: string }) {
	const g = activeFilterGroup.value;
	if (g === "category") return draftCategory.value === opt.value;
	if (g === "sort") return draftSort.value === opt.value;
	return false;
}

function toggleOption(opt: { label: string; value: string }) {
	const g = activeFilterGroup.value;
	if (g === "category") {
		draftCategory.value = draftCategory.value === opt.value ? "" : opt.value;
		return;
	}
	if (g === "sort") {
		draftSort.value = draftSort.value === opt.value ? "" : opt.value;
	}
}

/** 有关键词，或已选分类/排序时，可请求列表（与搜索框「必填关键词」解耦） */
function canRequestSearchList(): boolean {
	if (keyword.value.trim()) return true;
	if (filterCategory.value || filterSort.value) return true;
	return false;
}

function confirmFilter() {
	filterCategory.value = draftCategory.value;
	filterSort.value = draftSort.value;
	filterPopupVisible.value = false;
	if (!canRequestSearchList()) {
		uni.showToast({
			title: "请选择分类或排序，或输入关键词",
			icon: "none",
		});
		return;
	}
	hasSearched.value = true;
	pageNum.value = 1;
	resultList.value = [];
	finished.value = false;
	fetchList();
}
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const hasSearched = ref(false);

// 热搜相关
const hotDocuments = ref<any[]>([]);
const hotKeywords = ref<any[]>([]);
const hotLoading = ref(false);
const activeHotTab = ref<"docs" | "keywords">("docs");

const queryParams = computed(() => ({
	keywords: keyword.value,
	pageNum: pageNum.value,
	pageSize: pageSize.value,
	business: filterCategory.value || undefined,
	ascType: filterSort.value || undefined,
}));

// 处理搜索
const handleSearch = () => {
	if (!keyword.value.trim()) {
		uni.showToast({
			title: "请输入关键词",
			icon: "none",
		});
		return;
	}
	hasSearched.value = true;
	pageNum.value = 1;
	resultList.value = [];
	finished.value = false;
	fetchList();
};

// 处理输入变化
const handleInputChange = () => {
	if (!keyword.value.trim() && hasSearched.value && !filterCategory.value && !filterSort.value) {
		hasSearched.value = false;
		resultList.value = [];
	}
};

// 加载更多
const handleLoadMore = () => {
	if (finished.value || loading.value || !canRequestSearchList()) {
		return;
	}
	pageNum.value += 1;
	fetchList();
};

// 下拉刷新
const handleRefresh = async () => {
	refreshing.value = true;
	pageNum.value = 1;
	resultList.value = [];
	finished.value = false;
	await fetchList();
	refreshing.value = false;
};

// 刷新热榜
const handleRefreshHot = async () => {
	refreshing.value = true;
	await loadHotLists();
	refreshing.value = false;
};

// 获取列表数据
const fetchList = async () => {
	if (loading.value || finished.value || !canRequestSearchList()) {
		return;
	}
	loading.value = true;
	try {
		const res = await searchTechnologyLibrary(queryParams.value);
		const rows = res?.rows || [];
		resultList.value = [...resultList.value, ...rows];
		total.value = res?.total || 0;
		if (resultList.value.length >= total.value) {
			finished.value = true;
		}
	} catch (error: any) {
		console.error("搜索失败", error);
		uni.showToast({
			title: error.message || "搜索失败",
			icon: "none",
		});
	} finally {
		loading.value = false;
	}
};

// 点击列表项
const handleItemClick = (item: any) => {
	router.push({
		path: "/pages_auto/technology/detail",
		query: {
			id: item.id,
			type: item.business,
			source: item?.jywkType === 1 ? "system" : "manual",
		},
	});
};

function pickTitleParts(item: any) {
	const typeText = stripHtml(item.technologyTypeText || "");
	const fullTitle = stripHtml(item?.title || "");
	const kw = keyword.value.trim();
	if (typeText && fullTitle.startsWith(typeText)) {
		return { prefix: typeText, rest: fullTitle.slice(typeText.length) };
	}
	if (kw && fullTitle.includes(kw)) {
		const i = fullTitle.indexOf(kw);
		return { prefix: fullTitle.slice(0, i + kw.length), rest: fullTitle.slice(i + kw.length) };
	}
	return { prefix: "", rest: fullTitle };
}

function pickHeadTags(item: any) {
	const tags: string[] = [];
	const t = stripHtml(item.technologyTypeText || "");
	if (t) tags.push(t);
	if (item.keywordsList?.length) {
		for (const k of item.keywordsList) {
			const name = stripHtml(k.keywordsName || "");
			if (name && !tags.includes(name) && tags.length < 2) tags.push(name);
		}
	}
	if (tags.length === 0 && item.business) {
		const map: Record<string, string> = { JSWD: "技术文档", JYWK: "经验文库", JSLT: "技术论坛" };
		tags.push(map[item.business] || String(item.business));
	}
	return tags.slice(0, 2);
}

function pickSummaryOneLine(item: any) {
	return stripHtml(item?.content || "");
}

function pickCategoryFooter(item: any) {
	const t = stripHtml(item?.technologyTypeText || "");
	if (t) return t;
	const map: Record<string, string> = { JSWD: "技术文档", JYWK: "经验文库", JSLT: "技术论坛" };
	return item.business ? map[item.business] || "" : "";
}

// 去除HTML标签
const stripHtml = (html: string = "") => {
	return html.replace(/<[^>]*>/g, "");
};

// 获取排名样式类
const getRankClass = (index: number) => {
	if (index === 0) return "is-top1";
	if (index === 1) return "is-top2";
	if (index === 2) return "is-top3";
	return "";
};

// 前3名渐变背景色（从左透明 → 右有色）
const getRankBgStyle = (index: number) => {
	const gradients = [
		"linear-gradient(270deg, rgba(244,72,15,0) 0%, rgba(244,72,15,0.2) 100%)",
		"linear-gradient(270deg, rgba(250,194,38,0) 0%, rgba(250,194,38,0.2) 100%)",
		"linear-gradient(270deg, rgba(86,204,228,0) 0%, rgba(86,204,228,0.2) 100%)",
	];
	return `background: ${gradients[index] ?? ""}`;
};

// 标准化列表数据
const normalizeList = (res: any) => {
	if (!res) return [];
	if (Array.isArray(res)) return res;
	if (Array.isArray(res.rows)) return res.rows;
	if (Array.isArray(res.data)) return res.data;
	if (Array.isArray(res.list)) return res.list;
	return [];
};

// 提取文本
const pickText = (item: any, fallback: string) => {
	if (!item || typeof item !== "object") return fallback;
	return (
		item.title ||
		item.name ||
		item.docName ||
		item.fileName ||
		item.keyword ||
		item.keywords ||
		item.keywordsName ||
		item.word ||
		fallback
	);
};

// 构建top10列表
const buildTopTen = (list: any[], fallbackPrefix: string) => {
	if (!Array.isArray(list) || list.length === 0) {
		return Array.from({ length: 10 }, (_, index) => ({
			text: `${fallbackPrefix}${index + 1}`,
			id: undefined,
		}));
	}
	return list.slice(0, 10).map((item, index) => ({
		text: pickText(item, `${fallbackPrefix}${index + 1}`),
		id: item.id || item.docId || undefined,
	}));
};

// 加载热搜列表
const loadHotLists = async () => {
	hotLoading.value = true;
	try {
		const [docRes, keywordRes] = await Promise.all([fetchHotDocuments(), fetchHotKeywords()]);
		const docs = normalizeList(docRes);
		const keywords = normalizeList(keywordRes);
		hotDocuments.value = buildTopTen(docs, "文档");
		hotKeywords.value = buildTopTen(keywords, "关键词");
	} catch (error) {
		console.error("获取热搜失败", error);
		hotDocuments.value = buildTopTen([], "文档");
		hotKeywords.value = buildTopTen([], "关键词");
	} finally {
		hotLoading.value = false;
	}
};

// 点击热搜文档
const handleHotDocumentClick = (item: any) => {
	if (item.id) {
		// 如果有ID，跳转到详情页
		router.push({
			path: "/pages_auto/technology/detail",
			query: {
				id: item.id,
				type: "JSWD",
			},
		});
	} else {
		// 否则使用文档标题进行搜索
		keyword.value = item.text.replace(/《|》/g, "");
		handleSearch();
	}
};

// 点击热搜关键词
const handleHotKeywordClick = (item: any) => {
	keyword.value = item.text;
	handleSearch();
};

onMounted(() => {
	loadHotLists();
});
</script>

<style lang="scss" scoped>
.filter-popup {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;
	overflow: hidden;
	background-color: #fff;
}

/* 居中悬浮：与底部不衔接，四周留白（对齐设计稿） */
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

/* 与 TechExperience.vue 一致：整体白底渐变圆角容器 + filter-section 内搜索条样式 */
.tech-search-page {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
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

.result-list {
	flex: 1;
	overflow: hidden;
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

.result-list-inner {
	padding: 24rpx 20rpx 32rpx;
	box-sizing: border-box;
}

.result-card {
	margin-bottom: 24rpx;
	padding: 28rpx 24rpx;
	background-color: #fff;
	border: 1rpx solid #d4e3ff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(72, 115, 250, 0.06);
}

.result-card:last-child {
	margin-bottom: 0;
}

.result-card__head {
	margin-bottom: 16rpx;
}

.result-title-row {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16rpx;
}

.title-main {
	flex: 1;
	min-width: 0;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 1.45;
}

.title-prefix {
	color: #4873fa;
	margin-right: 4rpx;
}

.title-rest {
	color: #303133;
}

.title-tags {
	display: flex;
	flex-direction: row;
	flex-shrink: 0;
	gap: 8rpx;
	max-width: 42%;
	flex-wrap: wrap;
	justify-content: flex-end;
}

.head-tag {
	padding: 6rpx 14rpx;
	font-size: 22rpx;
	color: #4873fa;
	background-color: rgba(198, 215, 255, 0.45);
	border-radius: 6rpx;
}

.result-card__summary {
	font-size: 26rpx;
	color: #909399;
	line-height: 1.5;
	margin-bottom: 16rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.result-card__footer {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.category-tag {
	display: inline-block;
	padding: 8rpx 18rpx;
	font-size: 24rpx;
	color: #d97706;
	background-color: rgba(254, 215, 170, 0.55);
	border-radius: 8rpx;
}

.load-more-tip {
	text-align: center;
	padding: 32rpx;
	color: #909399;
	font-size: 28rpx;
}

.hot-rank-section {
	flex: 1;
	height: 100%;
	background-color: transparent;
}

.hot-list-container {
	margin: 0 20px;

	overflow: hidden;
}

/* Tab 切换头部 */
.hot-tabs {
	display: flex;
	border-bottom: 1rpx solid #f0f0f0;
	gap: 40rpx;
}

.hot-tab-item {
	font-family: "Alibaba PuHuiTi 3.0", "Alibaba PuHuiTi 30", sans-serif;
	font-weight: 700;
	font-size: 28rpx;
	color: #949dad;
	line-height: 78rpx;
	text-align: left;
	font-style: normal;
	text-transform: none;
	position: relative;
	white-space: nowrap;

	&.active {
		color: #13144f;

		&::after {
			content: "";
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 70%;
			height: 4rpx;
			background-color: #4474ff;
			border-radius: 2rpx;
		}
	}
}

.hot-list {
	background-color: #fff;
}

.hot-item {
	display: flex;
	align-items: center;
	padding: 24rpx;
	border-bottom: 1rpx solid #f5f5f5;
	gap: 24rpx;
	position: relative;
	overflow: hidden;
}

.item-rank-bg {
	position: absolute;
	left: 0;
	top: 0;
	width: 178rpx;
	height: 100%;
	pointer-events: none;
}

.hot-item:active {
	background-color: #f8f8f8;
}

.hot-rank {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 60rpx;
	height: 60rpx;
	font-weight: 700;
	font-size: 32rpx;
	color: #909399;
	flex-shrink: 0;
	text-align: center;
}

.hot-rank.is-top1 {
	color: #f44336;
}

.hot-rank.is-top2 {
	color: #f6a623;
}

.hot-rank.is-top3 {
	color: #f4c045;
}

.hot-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	min-width: 0;
}

.hot-text {
	font-size: 30rpx;
	color: #2c3e50;
	line-height: 1.5;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.hot-value {
	font-size: 24rpx;
	color: #909399;
}
</style>

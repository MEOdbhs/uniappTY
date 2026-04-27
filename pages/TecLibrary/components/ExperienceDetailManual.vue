<template>
	<view class="experience-detail-manual-page">
		<!-- 顶部蓝色标题区 -->
		<view class="hero">
			<view class="hero__top">
				<text class="hero__title">{{ experienceTitle }}</text>
				<view class="hero__badge">人工经验</view>
			</view>
			<view class="hero__meta">
				<cl-icon name="time" :size="28" color="#ffffff" />
				<text class="hero__meta-text">创建时间：{{ createTimeDisplay }}</text>
			</view>
			<view class="hero__meta">
				<cl-icon name="time" :size="28" color="#ffffff" />
				<text class="hero__meta-text">更新时间：{{ updateTimeDisplay }}</text>
			</view>
		</view>

		<!-- 设备信息卡（上叠蓝底） -->
		<view class="device-shell">
			<view class="device-card">
				<view class="device-card__grid">
					<view v-for="(cell, ci) in deviceGridCells" :key="ci" class="device-card__cell">
						<text class="device-card__cell-label">{{ cell.label }}</text>
						<text class="device-card__cell-value">{{ cell.value }}</text>
					</view>
				</view>
				<view class="device-card__detail">
					<view v-for="(row, ri) in deviceDetailRows" :key="ri" class="device-card__row">
						<text class="device-card__row-label">{{ row.label }}</text>
						<text class="device-card__row-value">{{ row.value }}</text>
					</view>
				</view>
			</view>
		</view>

		<scroll-view class="detail-body" scroll-y :show-scrollbar="false">
			<view class="content-wrapper">
				<!-- 问题现象 -->
				<view class="manual-section">
					<view class="manual-section__head">
						<view class="manual-section__bar" />
						<view class="manual-section__head-texts">
							<view class="manual-section__head-line">
								<text class="manual-section__title">问题现象</text>
								<text class="manual-section__desc">记录故障/运维场景的具体现象</text>
							</view>
						</view>
					</view>
					<view class="manual-section__body">
						<view v-for="(item, index) in detail?.questionList" :key="index" class="manual-block">
							<view class="field-label-muted">问题现象{{ Number(index) > 0 ? Number(index) + 1 : "" }}</view>
							<view class="tint-box">{{ item || "-" }}</view>
						</view>
						<view v-if="questionFiles.length > 0" class="manual-block">
							<view class="field-label-muted">附件</view>
							<view class="tint-box tint-box--plain">
								<view v-if="questionFiles.some((f: any) => f.isImage)" class="image-list">
									<cl-image v-for="(file, idx) in questionFiles.filter((f: any) => f.isImage)"
										:key="idx" :src="file.url" mode="aspectFill" :size="[120, 120]"
										:preview-list="questionFiles.filter((f: any) => f.isImage).map((f: any) => f.url)"></cl-image>
								</view>
								<view v-if="questionFiles.some((f: any) => !f.isImage)" class="file-list">
									<view v-for="(file, idx) in questionFiles.filter((f: any) => !f.isImage)" :key="idx"
										class="file-item" @click="handlePreviewFile(file)">
										<cl-icon name="file" size="32" color="#409eff"></cl-icon>
										<text class="file-name">{{ file.fileName }}</text>
										<cl-icon name="download" size="28" color="#909399"></cl-icon>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 处理过程 -->
				<view class="manual-section">
					<view class="manual-section__head">
						<view class="manual-section__bar" />
						<view class="manual-section__head-texts">
							<view class="manual-section__head-line">
								<text class="manual-section__title">处理过程</text>
								<text class="manual-section__desc">记录问题的排查思路、操作步骤、关键节点</text>
							</view>
						</view>
					</view>
					<view class="manual-section__body">
						<view v-for="(item, index) in detail?.processList" :key="index" class="manual-block">
							<view class="field-label-muted">处理过程{{ Number(index) > 0 ? Number(index) + 1 : "" }}</view>
							<view class="tint-box">{{ item || "-" }}</view>
						</view>
						<view v-if="processFiles.length > 0" class="manual-block">
							<view class="field-label-muted">附件</view>
							<view class="tint-box tint-box--plain">
								<view v-if="processFiles.some((f: any) => f.isImage)" class="image-list">
									<cl-image v-for="(file, idx) in processFiles.filter((f: any) => f.isImage)"
										:key="idx" :src="file.url" mode="aspectFill" :size="[120, 120]"
										:preview-list="processFiles.filter((f: any) => f.isImage).map((f: any) => f.url)"></cl-image>
								</view>
								<view v-if="processFiles.some((f: any) => !f.isImage)" class="file-list">
									<view v-for="(file, idx) in processFiles.filter((f: any) => !f.isImage)" :key="idx"
										class="file-item" @click="handlePreviewFile(file)">
										<cl-icon name="file" size="32" color="#409eff"></cl-icon>
										<text class="file-name">{{ file.fileName }}</text>
										<cl-icon name="download" size="28" color="#909399"></cl-icon>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 结果验证 -->
				<view class="manual-section">
					<view class="manual-section__head">
						<view class="manual-section__bar" />
						<view class="manual-section__head-texts">
							<view class="manual-section__head-line">
								<text class="manual-section__title">结果验证</text>
								<text class="manual-section__desc">记录处理后的验证结果、效果反馈，确保经验的有效性</text>
							</view>
						</view>
					</view>
					<view class="manual-section__body">
						<view v-for="(item, index) in detail?.resultList" :key="index" class="manual-block">
							<view class="field-label-muted">结果验证{{ Number(index) > 0 ? Number(index) + 1 : "" }}</view>
							<view class="tint-box">{{ item || "-" }}</view>
						</view>
						<view v-if="resultFiles.length > 0" class="manual-block">
							<view class="field-label-muted">附件</view>
							<view class="tint-box tint-box--plain">
								<view v-if="resultFiles.some((f: any) => f.isImage)" class="image-list">
									<cl-image v-for="(file, idx) in resultFiles.filter((f: any) => f.isImage)"
										:key="idx" :src="file.url" mode="aspectFill" :size="[120, 120]"
										:preview-list="resultFiles.filter((f: any) => f.isImage).map((f: any) => f.url)"></cl-image>
								</view>
								<view v-if="resultFiles.some((f: any) => !f.isImage)" class="file-list">
									<view v-for="(file, idx) in resultFiles.filter((f: any) => !f.isImage)" :key="idx"
										class="file-item" @click="handlePreviewFile(file)">
										<cl-icon name="file" size="32" color="#409eff"></cl-icon>
										<text class="file-name">{{ file.fileName }}</text>
										<cl-icon name="download" size="28" color="#909399"></cl-icon>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 标签配置 -->
				<view class="manual-section">
					<view class="manual-section__head">
						<view class="manual-section__bar" />
						<view class="manual-section__head-texts">
							<view class="manual-section__head-line">
								<text class="manual-section__title">标签配置</text>
								<text class="manual-section__desc">通过多维度标签分类，提升经验检索精准度</text>
							</view>
						</view>
					</view>
					<view class="manual-section__body">
						<view v-if="fixedTags.length > 0" class="manual-block">
							<view class="field-label-muted">固定标签</view>
							<view class="tag-row">
								<text v-for="(tag, index) in fixedTags" :key="index" class="tag-pill">
									{{ tag }}
								</text>
							</view>
						</view>
						<view v-if="detail?.keywords && detail?.keywords.length > 0" class="manual-block">
							<view class="field-label-muted">自定义标签</view>
							<view class="tag-row">
								<text v-for="(tag, index) in detail?.keywords" :key="index" class="tag-pill">
									{{ tag }}
								</text>
							</view>
						</view>
					</view>
				</view>

				<view class="page-bottom-spacer" />
			</view>
		</scroll-view>

		<!-- 右下角评论入口 -->
		<view class="fab-comment" @tap="openCommentPopup">
			<cl-icon name="msg" :size="44" color="#ffffff" />
			<text class="fab-comment__text">评论 ({{ commentList.length }})</text>
		</view>

		<cl-popup v-model="showCommentPopup" direction="bottom" :size="'76%'" :padding="0"
			:border-radius="'24rpx 24rpx 0 0'" :show-header="false" :z-index="9999">
			<view class="exp-comment-popup">
				<view class="exp-comment-popup__header">
					<text class="exp-comment-popup__title">评论交流</text>
					<view class="exp-comment-popup__close" @tap="closeCommentPopup">
						<cl-icon name="close" :size="36" color="#c0c4cc" />
					</view>
				</view>
				<view class="exp-comment-popup__divider" />
				<scroll-view class="exp-comment-popup__scroll" scroll-y :show-scrollbar="false">
					<view v-if="commentList.length === 0" class="no-data">暂无评论</view>
					<view v-else class="comment-list">
						<view v-for="item in commentList" :key="item.id" class="comment-item">
							<view class="comment-header">
								<text class="comment-name">{{ item.userName || "-" }}</text>
								<text class="comment-date">{{ item.createTime1 || "-" }}</text>
							</view>
							<view class="comment-content">
								<mp-html :content="processHtmlImages(item.content || '')" />
							</view>
							<view class="comment-item__toolbar">
								<text
									v-if="replyCount(item) > 0"
									class="toolbar-link"
									@tap.stop="toggleShowAllReplies(item.id)"
								>
									{{
										showAllRepliesMap[item.id]
											? "收起评论"
											: `评论 (${replyCount(item)})`
									}}
								</text>
								<text class="toolbar-link" @tap.stop="toggleReply(item)">{{
									replyEditorVisibleMap[item.id] ? "收起" : "回复"
								}}</text>
								<text
									v-if="canDeleteComment(item)"
									class="toolbar-link toolbar-link--danger"
									@tap.stop="handleDeleteComment(item)"
								>
									删除
								</text>
							</view>
							<view v-if="replyEditorVisibleMap[item.id]" class="reply-input-section">
								<cl-input v-model="replyContents[item.id]" type="textarea" :rows="3"
									placeholder="理性发言，友善互动"></cl-input>
								<view class="reply-actions">
									<cl-button type="primary" size="small" :loading="replySubmittingMap[item.id]"
										@tap="handleSubmitReply(item)">
										提交回复
									</cl-button>
									<cl-button size="small" @tap="toggleReply(item)">取消</cl-button>
								</view>
							</view>
							<view
								v-if="item.children?.length && showAllRepliesMap[item.id]"
								class="reply-list"
							>
								<view v-for="reply in item.children" :key="reply.id" class="reply-item">
									<view class="reply-header">
										<text class="reply-name">{{ reply.userName || "-" }}</text>
										<text class="reply-date">{{
											reply.createTime1 || "-"
										}}</text>
									</view>
									<view class="reply-content">
										<mp-html :content="processHtmlImages(reply.content || '')" />
									</view>
									<view class="reply-item__actions">
										<text class="toolbar-link" @tap.stop="toggleReply(item)">回复</text>
										<text
											v-if="canDeleteComment(reply)"
											class="toolbar-link toolbar-link--danger"
											@tap.stop="handleDeleteComment(reply)"
										>
											删除
										</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
				<view class="exp-comment-popup__divider" />
				<view class="exp-comment-popup__composer">
					<cl-textarea v-model="commentContent" placeholder="理性发言，友善互动" :maxlength="500" :border="true"
						class="exp-comment-popup__textarea" />
					<view class="exp-comment-popup__actions">
						<view class="exp-comment-popup__btn exp-comment-popup__btn--cancel" @tap="closeCommentPopup">
							取消
						</view>
						<view class="exp-comment-popup__btn exp-comment-popup__btn--submit" @tap="handleSubmitComment">
							发表评论
						</view>
					</view>
				</view>
			</view>
		</cl-popup>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, reactive, watch } from "vue";
import { lookExperience, reviewExperience, addKeywordsRead, deleteReview } from "../api";
import { addDomainPrefix } from "/@/cool/utils";
import { useUserStore } from "/@/cool/store/user";

interface Props {
	id: string;
}

const props = defineProps<Props>();

const userStore = useUserStore();

const loading = ref(false);
const detail = ref<any>({});
const commentList = ref<any[]>([]);
const commentContent = ref("");
const showCommentPopup = ref(false);

// 回复相关状态
const replyContents = reactive<Record<string, string>>({});
const replyEditorVisibleMap = reactive<Record<string, boolean>>({});
const replySubmittingMap = reactive<Record<string, boolean>>({});
const showAllRepliesMap = reactive<Record<string | number, boolean>>({});
const isNeedAddCount = ref(true);

// 判断是否为图片格式
const isImageFile = (url: string): boolean => {
	if (!url) return false;
	const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
	const lowerUrl = url.toLowerCase();
	return imageExtensions.some((ext) => lowerUrl.includes(ext));
};

// 问题现象附件
const questionFiles = computed(() => {
	if (!detail.value?.questionUrl) return [];
	const urls = detail.value.questionUrl.split(",").filter((url: string) => url.trim());
	return urls.map((url: string) => {
		const trimmedUrl = url.trim();
		return {
			url: addDomainPrefix(trimmedUrl),
			fileName: trimmedUrl.split("/").pop() || "附件",
			isImage: isImageFile(trimmedUrl),
		};
	});
});

// 处理过程附件
const processFiles = computed(() => {
	if (!detail.value?.processUrl) return [];
	const urls = detail.value.processUrl.split(",").filter((url: string) => url.trim());
	return urls.map((url: string) => {
		const trimmedUrl = url.trim();
		return {
			url: addDomainPrefix(trimmedUrl),
			fileName: trimmedUrl.split("/").pop() || "附件",
			isImage: isImageFile(trimmedUrl),
		};
	});
});

// 结果验证附件
const resultFiles = computed(() => {
	if (!detail.value?.resultUrl) return [];
	const urls = detail.value.resultUrl.split(",").filter((url: string) => url.trim());
	return urls.map((url: string) => {
		const trimmedUrl = url.trim();
		return {
			url: addDomainPrefix(trimmedUrl),
			fileName: trimmedUrl.split("/").pop() || "附件",
			isImage: isImageFile(trimmedUrl),
		};
	});
});

// 固定标签
const fixedTags = computed(() => {
	const tags: string[] = [];
	if (detail.value?.subsystemName) {
		tags.push(detail.value.subsystemName);
	}
	if (detail.value?.deviceTypeName) {
		tags.push(detail.value.deviceTypeName);
	}
	if (detail.value?.techTypeName) {
		tags.push(detail.value.techTypeName);
	}
	return tags;
});

const experienceTitle = computed(
	() => detail.value?.title || detail.value?.experienceTitle || "经验详情",
);
const createTimeDisplay = computed(
	() => detail.value?.createTime1 || detail.value?.createTime || "--",
);
const updateTimeDisplay = computed(
	() => detail.value?.updateTime1 || detail.value?.archiveTime || "--",
);

const deviceGridCells = computed(() => [
	{ label: "设备类型", value: detail.value?.deviceTypeName || "-" },
	{
		label: "设备类别",
		value: detail.value?.deviceCategoryName || detail.value?.subsystemName || "-",
	},
	{ label: "设备名称", value: detail.value?.deviceName || detail.value?.equipmentName || "-" },
]);

const deviceDetailRows = computed(() => [
	{ label: "所属子系统：", value: detail.value?.subsystemName || "-" },
	{ label: "设备编号：", value: detail.value?.deviceCode || detail.value?.deviceNo || "-" },
	{
		label: "安装位置：",
		value: detail.value?.installLocation || detail.value?.installAddress || "-",
	},
]);

function openCommentPopup() {
	showCommentPopup.value = true;
}

function closeCommentPopup() {
	showCommentPopup.value = false;
}

// 获取详情
const fetchDetail = async () => {
	loading.value = true;
	try {
		const res = await lookExperience(props.id);
		detail.value = res || {};
		commentList.value = detail.value?.dmTechnologyReviewList || [];
		initializeReplyData();

		if (isNeedAddCount.value) {
			addKeywordsRead({ id: props.id, dataSource: "JYWK" });
			isNeedAddCount.value = false;
		}
	} catch (error: any) {
		console.error("获取详情失败", error);
		uni.showToast({
			title: error.message || "获取详情失败",
			icon: "none",
		});
	} finally {
		loading.value = false;
	}
};

// 处理HTML中的图片路径
const processHtmlImages = (html: string) => {
	if (!html) return "";
	// 使用正则表达式替换img标签的src属性
	return html.replace(
		/<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi,
		(match, before, src, after) => {
			const processedSrc = addDomainPrefix(src);
			return `<img${before}src="${processedSrc}"${after}>`;
		}
	);
};

// 预览/下载文件
const handlePreviewFile = (file: any) => {
	if (!file.url) {
		uni.showToast({
			title: "文件地址无效",
			icon: "none",
		});
		return;
	}

	// 判断是否是图片
	if (file.isImage) {
		// 收集所有图片URL用于预览
		const allImages: string[] = [];
		[...questionFiles.value, ...processFiles.value, ...resultFiles.value].forEach((f) => {
			if (f.isImage) {
				allImages.push(f.url);
			}
		});

		uni.previewImage({
			urls: allImages.length > 0 ? allImages : [file.url],
			current: file.url,
		});
	} else {
		// 下载文档
		handleDownloadDoc(file);
	}
};

// 下载文档（参考DocumentDetail.vue）
const handleDownloadDoc = (doc: { url: string; fileName: string }) => {
	if (!doc.url) {
		uni.showToast({
			title: "文件地址无效",
			icon: "none",
		});
		return;
	}

	// 提示开始下载
	uni.showToast({
		title: "开始下载",
		icon: "loading",
		duration: 1500,
	});

	uni.showLoading({
		title: "正在下载...",
		mask: true,
	});

	uni.downloadFile({
		url: doc.url,
		success(res) {
			uni.hideLoading();
			if (res.statusCode === 200 && res.tempFilePath) {
				// 将临时文件保存到本地
				uni.saveFile({
					tempFilePath: res.tempFilePath,
					success(saveRes) {
						uni.showToast({
							title: "下载完成，已保存到本地",
							icon: "success",
							duration: 2000,
						});
						// 尝试打开文档
						uni.openDocument({
							filePath: saveRes.savedFilePath || res.tempFilePath,
							success: () => {
								console.log("打开文档成功");
							},
							fail: (err) => {
								console.error("打开文档失败", err);
								// 如果无法打开，提示用户去文件管理器查看
								uni.showModal({
									title: "下载完成",
									content: `文件已保存到本地，请前往文件管理器查看：${doc.fileName}`,
									showCancel: false,
									confirmText: "知道了",
								});
							},
						});
					},
					fail(saveErr) {
						console.error("保存文件失败", saveErr);
						// 保存失败时，尝试直接打开临时文件
						uni.showToast({
							title: "下载完成",
							icon: "success",
						});
						uni.openDocument({
							filePath: res.tempFilePath,
							success: () => {
								console.log("打开文档成功");
							},
							fail: (err) => {
								console.error("打开文档失败", err);
								uni.showModal({
									title: "下载完成",
									content: `文件已下载，请前往文件管理器查看：${doc.fileName}`,
									showCancel: false,
									confirmText: "知道了",
								});
							},
						});
					},
				});
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
				title: "下载失败，请稍后重试",
				icon: "none",
				duration: 3000,
			});
		},
	});
};

function replyCount(item: any) {
	return item?.children?.length || 0;
}

function initializeReplyData() {
	commentList.value.forEach((item: any) => {
		if (showAllRepliesMap[item.id] === undefined) {
			showAllRepliesMap[item.id] = false;
		}
	});
}

// 切换回复输入框
const toggleReply = (item: any) => {
	const key = item.id;
	replyEditorVisibleMap[key] = !replyEditorVisibleMap[key];
	if (replyEditorVisibleMap[key] && !replyContents[key]) {
		replyContents[key] = "";
	}
};

// 切换显示所有跟评（默认收起，与 DocumentDetail 一致）
function toggleShowAllReplies(commentId: string | number) {
	showAllRepliesMap[commentId] = !showAllRepliesMap[commentId];
}

// 提交评论
const handleSubmitComment = async () => {
	const content = commentContent.value?.trim();
	if (!content) {
		uni.showToast({
			title: "请输入评论内容",
			icon: "none",
		});
		return;
	}

	try {
		uni.showLoading({
			title: "提交中...",
		});

		await reviewExperience({
			experienceId: props.id,
			content,
			parentId: 0,
		});

		uni.hideLoading();
		uni.showToast({
			title: "评论成功",
			icon: "success",
		});

		commentContent.value = "";
		closeCommentPopup();
		fetchDetail();
	} catch (error: any) {
		uni.hideLoading();
		uni.showToast({
			title: error.message || "评论失败",
			icon: "none",
		});
	}
};

// 提交回复
const handleSubmitReply = async (parentItem: any) => {
	const key = parentItem.id;
	const content = replyContents[key]?.trim();
	if (!content) {
		uni.showToast({
			title: "请输入回复内容",
			icon: "none",
		});
		return;
	}

	replySubmittingMap[key] = true;
	try {
		await reviewExperience({
			experienceId: props.id,
			content,
			parentId: parentItem.id,
		});

		uni.showToast({
			title: "回复成功",
			icon: "success",
		});

		replyContents[key] = "";
		replyEditorVisibleMap[key] = false;
		fetchDetail();
	} catch (error: any) {
		uni.showToast({
			title: error.message || "回复失败",
			icon: "none",
		});
	} finally {
		replySubmittingMap[key] = false;
	}
};

// 判断是否可以删除评论（只能删除自己的评论）
const canDeleteComment = (item: any) => {
	if (!userStore.info || !item.userId) return false;
	const currentUserId = (userStore.info as any).userId || (userStore.info as any).id;
	return Boolean(currentUserId && currentUserId === item.userId);
};

// 删除评论/回复
const handleDeleteComment = (item: any) => {
	uni.showModal({
		title: "提示",
		content: "确定删除该评论/回复吗？",
		success: async (res) => {
			if (res.confirm) {
				try {
					uni.showLoading({
						title: "删除中...",
					});

					await deleteReview(item.id);

					uni.hideLoading();
					uni.showToast({
						title: "删除成功",
						icon: "success",
					});

					fetchDetail();
				} catch (error: any) {
					uni.hideLoading();
					uni.showToast({
						title: error.message || "删除失败",
						icon: "none",
					});
				}
			}
		},
	});
};

onMounted(() => {
	fetchDetail();
});

watch(
	() => props.id,
	(val) => {
		if (val) {
			isNeedAddCount.value = true;
			fetchDetail();
		}
	}
);
</script>

<style lang="scss" scoped>
.experience-detail-manual-page {
	min-height: 100vh;
	background: #eef1f6;
	position: relative;
	display: flex;
	flex-direction: column;
	padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
}

.hero {
	flex-shrink: 0;
	padding: 36rpx 28rpx 48rpx;
	background: linear-gradient(135deg, #4474ff 0%, #1b4fd6 55%, #1539a8 100%);
	color: #fff;
	min-height: 9rem;
}

.hero__top {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16rpx;
	margin-bottom: 51rpx;
}

.hero__title {
	flex: 1;
	font-size: 36rpx;
	font-weight: 700;
	line-height: 1.45;
	color: #ffffff;
}

.hero__badge {
	flex-shrink: 0;
	padding: 8rpx 18rpx;
	font-size: 22rpx;
	color: #ff9f43;
	background: rgba(255, 255, 255, 0.98);
	border-radius: 8rpx;
	font-weight: 500;
}

.hero__meta {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 12rpx;
	margin-top: 12rpx;
}

.hero__meta-text {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.92);
}

.device-shell {
	margin: -3rem 24rpx 0;
	position: relative;
	z-index: 2;
}

.device-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 28rpx 20rpx 24rpx;
	box-shadow: 0 8rpx 28rpx rgba(19, 20, 79, 0.08);
}

.device-card__grid {
	display: flex;
	flex-direction: row;
	border-bottom: 1rpx solid #eef0f4;
	padding-bottom: 24rpx;
	margin-bottom: 20rpx;
}

.device-card__cell {
	flex: 1;
	text-align: center;
	position: relative;
	padding: 0 8rpx;

	&:not(:last-child)::after {
		content: "";
		position: absolute;
		right: 0;
		top: 10%;
		height: 80%;
		width: 1rpx;
		background: #e4e7ed;
	}
}

.device-card__cell-label {
	display: block;
	font-size: 22rpx;
	color: #909399;
	margin-bottom: 10rpx;
}

.device-card__cell-value {
	font-size: 26rpx;
	font-weight: 600;
	color: #303133;
	word-break: break-all;
}

.device-card__detail {
	background: #f3f6ff;
	border-radius: 12rpx;
	padding: 20rpx 22rpx;
}

.device-card__row {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	font-size: 26rpx;
	line-height: 1.55;
	padding: 8rpx 0;

	&:not(:last-child) {
		border-bottom: 1rpx dashed #dce3f0;
	}
}

.device-card__row-label {
	color: #909399;
	flex-shrink: 0;
	margin-right: 8rpx;
}

.device-card__row-value {
	color: #303133;
	flex: 1;
	min-width: 0;
	word-break: break-all;
}

.detail-body {
	flex: 1;
	min-height: 0;
	margin-top: 20rpx;
}

.content-wrapper {
	padding: 0 24rpx 24rpx;
}

.manual-section {
	background: #ffffff;
	border-radius: 16rpx;
	margin-bottom: 24rpx;
	padding: 24rpx 22rpx 28rpx;
	box-shadow: 0 4rpx 18rpx rgba(19, 20, 79, 0.05);
}

.manual-section__head {
	display: flex;
	flex-direction: row;
	align-items: flex-end;
	margin-bottom: 20rpx;
}

.manual-section__bar {
	width: 8rpx;
	height: 36rpx;
	border-radius: 4rpx;
	background: linear-gradient(180deg, #4873fa 0%, #1b2cd2 100%);
	margin-right: 14rpx;
	flex-shrink: 0;
}

.manual-section__head-texts {
	flex: 1;
	min-width: 0;
}

.manual-section__head-line {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: baseline;
	gap: 0 12rpx;
}

.manual-section__title {
	flex-shrink: 0;
	font-size: 32rpx;
	font-weight: 700;
	color: #13144f;
	line-height: 1.2;
}

.manual-section__desc {
	flex: 1;
	min-width: 0;
	font-size: 22rpx;
	color: #909399;
	line-height: 1.2;
}

.manual-section__body {
	padding-top: 4rpx;
}

.manual-block {
	margin-bottom: 24rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.field-label-muted {
	font-size: 24rpx;
	color: #909399;
	margin-bottom: 12rpx;
}

.tint-box {
	font-size: 28rpx;
	color: #303133;
	line-height: 1.65;
	word-break: break-all;
	padding: 20rpx 22rpx;
	background: #f0f4ff;
	border-radius: 12rpx;
	border: 1rpx solid #e2e8ff;
}

.tint-box--plain {
	padding: 16rpx;
}

.page-bottom-spacer {
	height: 32rpx;
}

.tag-row {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 16rpx;
}

.tag-pill {
	padding: 12rpx 22rpx;
	font-size: 24rpx;
	color: #4474ff;
	background: #eef3ff;
	border: 1rpx solid #c6d7ff;
	border-radius: 10rpx;
}

.image-list {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.file-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.file-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx;
	background-color: #f8f9fb;
	border-radius: 10rpx;
	transition: background-color 0.3s;

	&:active {
		background-color: #ebeef5;
	}
}

.file-name {
	flex: 1;
	font-size: 26rpx;
	color: #606266;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.fab-comment {
	position: fixed;
	right: 28rpx;
	bottom: calc(140rpx + env(safe-area-inset-bottom));
	z-index: 200;
	width: 132rpx;
	min-height: 132rpx;
	padding: 16rpx 12rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	background: linear-gradient(145deg, #4474ff 0%, #1b2cd2 100%);
	border-radius: 50%;
	box-shadow: 0 10rpx 28rpx rgba(68, 116, 255, 0.45);
	box-sizing: border-box;
}

.fab-comment__text {
	font-size: 20rpx;
	color: #ffffff;
	line-height: 1.2;
	text-align: center;
}

.exp-comment-popup {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;
	background-color: #fff;
}

.exp-comment-popup__header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 32rpx 20rpx;
	flex-shrink: 0;
}

.exp-comment-popup__title {
	font-size: 34rpx;
	font-weight: 700;
	color: #13144f;
}

.exp-comment-popup__close {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.exp-comment-popup__divider {
	height: 1rpx;
	background-color: rgba(198, 215, 255, 0.45);
	margin: 0 24rpx;
}

.exp-comment-popup__scroll {
	flex: 1;
	min-height: 0;
	height: 0;
	padding: 24rpx 28rpx;
	box-sizing: border-box;
}

.exp-comment-popup__composer {
	flex-shrink: 0;
	padding: 20rpx 28rpx calc(24rpx + env(safe-area-inset-bottom));
	border-top: 1rpx solid #eef0f4;
	background: #fafbfc;
}

.exp-comment-popup__textarea {
	margin-bottom: 20rpx;
}

.exp-comment-popup__actions {
	display: flex;
	flex-direction: row;
	gap: 24rpx;
}

.exp-comment-popup__btn {
	flex: 1;
	height: 84rpx;
	line-height: 84rpx;
	text-align: center;
	font-size: 30rpx;
	font-weight: 600;
	border-radius: 16rpx;
	box-sizing: border-box;
}

.exp-comment-popup__btn--cancel {
	background-color: #e8eaed;
	color: #606266;
}

.exp-comment-popup__btn--submit {
	background: linear-gradient(135deg, #4474ff 0%, #1b2cd2 100%);
	color: #ffffff;
}

.no-data {
	text-align: center;
	padding: 80rpx;
	color: #909399;
	font-size: 28rpx;
}

.comment-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	padding-bottom: 24rpx;
}

.comment-item {
	padding: 24rpx;
	background-color: #f5f7fa;
	border-radius: 12rpx;
}

.comment-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
}

.comment-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #4474ff;
}

.comment-date {
	font-size: 24rpx;
	color: #909399;
}

.comment-content {
	font-size: 28rpx;
	color: #606266;
	line-height: 1.6;
	margin-bottom: 12rpx;
	word-break: break-all;

	:deep(img) {
		max-width: 100%;
		height: auto;
		display: block;
		margin: 8rpx 0;
		border-radius: 8rpx;
	}

	:deep(p) {
		margin: 0;
		padding: 0;
	}
}

.comment-item__toolbar {
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	align-items: center;
	gap: 24rpx;
	flex-wrap: wrap;
}

.toolbar-link {
	font-size: 26rpx;
	color: #4474ff;
}

.toolbar-link--danger {
	color: #f56c6c;
}

.reply-list {
	margin-top: 16rpx;
	padding: 16rpx 20rpx;
	background-color: #f0f6ff;
	border-radius: 16rpx;
}

.reply-item {
	padding: 16rpx 0;
	border-bottom: 1rpx dashed #d0d8e8;

	&:last-child {
		border-bottom: none;
	}
}

.reply-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.reply-name {
	font-size: 26rpx;
	font-weight: 600;
	color: #4474ff;
}

.reply-date {
	font-size: 22rpx;
	color: #909399;
}

.reply-content {
	font-size: 26rpx;
	color: #606266;
	line-height: 1.6;
	margin-bottom: 8rpx;
	word-break: break-all;

	:deep(img) {
		max-width: 100%;
		height: auto;
		display: block;
		margin: 8rpx 0;
		border-radius: 8rpx;
	}

	:deep(p) {
		margin: 0;
		padding: 0;
	}
}

.reply-item__actions {
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	gap: 20rpx;
}

.reply-input-section {
	margin-top: 16rpx;
	padding: 16rpx;
	background-color: #fff;
	border-radius: 8rpx;
}

.reply-actions {
	display: flex;
	gap: 16rpx;
	margin-top: 16rpx;
	justify-content: flex-end;
}
</style>

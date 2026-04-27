<template>
	<view class="common-media-upload">
		<view
			class="media-upload-list"
			:class="[
				{
					'is-disabled': disabled,
				},
			]"
		>
			<!-- 媒体列表 -->
			<view
				class="media-upload-item"
				v-for="(item, index) in displayList"
				:key="item.uid"
				:style="{
					height: parseRpx(size[0]),
					width: parseRpx(size[1]),
				}"
				@tap="previewMedia(index)"
			>
				<!-- 图片 -->
				<image
					v-if="item.type === 'image'"
					class="media-upload__target"
					:src="item.url"
					:mode="imageMode"
				/>

				<!-- 视频 -->
				<view @click="viewVideo(item)" class="media-upload__target video-target">
					<cl-icon name="play" :size="70" color="#ffffff"></cl-icon>
				</view>
				<!-- <video
					v-else-if="item.type === 'video'"
					class="media-upload__target video-target"
					:src="item.url"
					:poster="item.poster"
					:show-center-play-btn="true"
					:controls="true"
					:enable-progress-gesture="false"
				/> -->

				<!-- 视频播放图标 -->
				<view v-if="item.type === 'video'" class="video-play-icon">
					<text class="cl-icon-play-circle-fill"></text>
				</view>

				<!-- 移除按钮 -->
				<text
					class="media-upload__remove cl-icon-toast-error"
					@tap.stop="removeMedia(index)"
					v-if="!disabled"
				></text>

				<!-- 进度条 -->
				<view class="media-upload__progress" v-if="item.progress < 100">
					<cl-progress :value="item.progress" :show-text="false"></cl-progress>
				</view>

				<!-- 媒体类型标识 -->
				<!-- <view class="media-type-badge" v-if="item.type">
                    <text>{{ item.type === 'image' ? '图' : '视' }}</text>
                </view> -->
			</view>

			<!-- 添加按钮 -->
			<view
				class="media-upload-item add-btn"
				:style="{
					height: parseRpx(size[0]),
					width: parseRpx(size[1]),
				}"
				@tap="showActionSheet"
				v-if="canAppend"
			>
				<slot>
					<view class="media-upload__demo">
						<text class="cl-icon-camera-fill"></text>
						<text class="text" v-if="text">{{ text }}</text>
					</view>
				</slot>
			</view>
		</view>
		<cl-dialog title="查看" show-close-btn v-model="visibleVideo">
			<video
				v-if="visibleVideo"
				style="width: 100%"
				:src="videlUrl"
				:poster="videoPoster"
				:show-center-play-btn="true"
				:controls="true"
				:enable-progress-gesture="false"
			/>
		</cl-dialog>
		<!-- 操作选择弹窗 -->
		<cl-action-sheet ref="actionSheetRef" />
	</view>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { useStore } from "@/cool/store";
import { config } from "/@/config";
import { addDomainPrefix, uuid } from "@/cool/utils/comm";
import { parseRpx } from "/@/cool/utils";

interface MediaItem {
	uid: string;
	url: string;
	type: "image" | "video";
	progress: number;
	poster?: string; // 视频封面
	duration?: number; // 视频时长
	size?: number; // 文件大小
	fileName?: string;
	originalData?: any; // 原始上传返回数据
}

interface Props {
	modelValue?: any[] | any;
	multiple?: boolean;
	limit?: number;
	text?: string;
	size?: number[];
	imageMode?: string;
	disabled?: boolean;
	uploadUrl?: string;
	uploadName?: string;
	formData?: Record<string, any>;
	acceptType?: "all" | "image" | "video"; // 接受的媒体类型
	maxVideoSize?: number; // 视频最大大小(MB)
	maxVideoDuration?: number; // 视频最大时长(秒)
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: () => [],
	multiple: false,
	limit: 9,
	text: "添加媒体",
	size: () => [200, 200],
	imageMode: "aspectFill",
	disabled: false,
	uploadUrl: "/common/upload",
	uploadName: "file",
	formData: () => ({}),
	acceptType: "all",
	maxVideoSize: 100, // 100MB
	maxVideoDuration: 300, // 5分钟
});

const emit = defineEmits<{
	"update:modelValue": [value: any[] | any];
	exceed: [list: any[]];
	success: [data: any, file: any];
	error: [error: any];
	change: [value: any[] | any];
	remove: [index: number];
}>();

const { user } = useStore();
const Authorization = "Bearer " + user.token;
const headers = {
	Authorization: Authorization,
};
const visibleVideo = ref(false);
const videlUrl = ref("");
const videoPoster = ref("");
const uploadTaskMap = ref<Map<string, MediaItem>>(new Map());
const uploadTaskQueue = ref<Array<() => Promise<void>>>([]);
const isProcessingQueue = ref(false);

// 存储 URL 到原始数据的映射关系
const urlToDataMap = ref<Map<string, any>>(new Map());

// 操作选择弹窗引用
const actionSheetRef = ref();

// 显示的媒体列表
const displayList = ref<MediaItem[]>([]);

// 是否可以添加更多媒体
const canAppend = computed(() => {
	const currentCount = displayList.value.length;
	if (props.disabled) {
		return currentCount === 0;
	}
	return currentCount < (props.multiple ? props.limit : 1);
});

// 监听外部传入的值
watch(
	() => props.modelValue,
	(val: any) => {
		displayList.value = [];
		if (!val) {
			urlToDataMap.value.clear();
			return;
		}
		if (val && typeof val === "string") {
			const urls = val?.split(",");
			urls.forEach((item: any) => {
				const mediaType = getMediaType(item);
				displayList.value.push({
					uid: uuid(),
					url: config.baseUrl + item,
					type: mediaType,
					progress: 100,
					fileName: item,
				});
			});
		}

		// const dataList = Array.isArray(val) ? val : [val];
		// const newDisplayList: MediaItem[] = [];

		// dataList.forEach((data: any) => {
		// 	if (data && typeof data === "object") {
		// 		const url = data.url || data.data?.url || "";
		// 		if (url) {
		// 			const mediaType = getMediaType(url, data);
		// 			newDisplayList.push({
		// 				uid: uuid(),
		// 				url,
		// 				type: mediaType,
		// 				progress: 100,
		// 				poster: data.poster || data.data?.poster,
		// 				duration: data.duration || data.data?.duration,
		// 				size: data.size || data.data?.size,
		// 				originalData: data,
		// 			});
		// 			urlToDataMap.value.set(url, data);
		// 		}
		// 	} else if (typeof data === "string") {
		// 		const mediaType = getMediaType(data);
		// 		newDisplayList.push({
		// 			uid: uuid(),
		// 			url: data,
		// 			type: mediaType,
		// 			progress: 100,
		// 		});
		// 	}
		// });

		// displayList.value = newDisplayList;
	},
	{ immediate: true },
);
const viewVideo = (item: any) => {
	visibleVideo.value = true;
	videlUrl.value = item.url;
	videoPoster.value = item.poster;
};
// 根据URL或数据判断媒体类型
function getMediaType(url: string, data?: any): "image" | "video" {
	// 优先从数据中获取类型
	if (data?.type) {
		return data.type;
	}

	// 从URL扩展名判断
	const extension = url.split(".").pop()?.toLowerCase() || "";
	const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
	const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "webm", "3gp"];

	if (imageExts.includes(extension)) {
		return "image";
	} else if (videoExts.includes(extension)) {
		return "video";
	}

	// 默认返回图片类型
	return "image";
}

// 显示操作选择弹窗
function showActionSheet() {
	if (props.disabled) return;

	// 如果只支持一种类型，直接选择
	if (props.acceptType === "image") {
		chooseMedia("image");
	} else if (props.acceptType === "video") {
		chooseMedia("video");
	} else {
		// 显示选择弹窗
		const actions = [];

		if (props.acceptType === "all" || props.acceptType === "image") {
			actions.push({ label: "选择图片", value: "image" });
		}

		if (props.acceptType === "all" || props.acceptType === "video") {
			actions.push({ label: "选择视频", value: "video" });
		}

		actionSheetRef.value?.open({
			list: actions.map((action) => ({
				label: action.label,
				click: () => {
					chooseMedia(action.value as "image" | "video");
				},
			})),
		});
	}
}

// 处理操作选择（已删除，不再需要）

// 选择媒体
function chooseMedia(type: "image" | "video") {
	if (props.disabled) return;

	const currentCount = displayList.value.length;
	const maxCount = props.multiple ? props.limit - currentCount : 1;

	if (maxCount <= 0) {
		emit("exceed", displayList.value);
		return;
	}

	if (type === "image") {
		chooseImage(maxCount);
	} else {
		chooseVideo(maxCount);
	}
}

// 选择图片
function chooseImage(count: number) {
	uni.chooseImage({
		count,
		sizeType: ["original", "compressed"],
		sourceType: ["album", "camera"],
		success: async (res) => {
			if (res.tempFiles && Array.isArray(res.tempFiles)) {
				// res.tempFiles.forEach((file: any) => {
				// 	uploadMedia(file, "image");
				// });
				for (const file of res.tempFiles) {
					await uploadMediaSequentially(file, "image");
				}
			}
		},
		fail: (err) => {
			emit("error", err);
		},
	});
}

// 选择视频
function chooseVideo(count: number) {
	uni.chooseVideo({
		count,
		sourceType: ["album", "camera"],
		maxDuration: props.maxVideoDuration,
		success: (res) => {
			// 检查视频大小
			if (res.size && res.size > props.maxVideoSize * 1024 * 1024) {
				uni.showToast({
					title: `视频大小不能超过${props.maxVideoSize}MB`,
					icon: "none",
				});
				return;
			}

			const file = {
				path: res.tempFilePath,
				size: res.size,
				duration: res.duration,
				width: res.width,
				height: res.height,
				poster: res.tempFilePath, // 使用视频文件作为封面
			};

			uploadMediaSequentially(file, "video");
		},
		fail: (err) => {
			emit("error", err);
		},
	});
}

async function uploadMediaSequentially(file: any, type: "image" | "video") {
	return new Promise<void>((resolve, reject) => {
		const uid = uuid();

		// 创建媒体项
		const mediaItem: MediaItem = {
			uid,
			url: file.path,
			type,
			progress: 0,
			poster: file.poster,
			duration: file.duration,
			size: file.size,
			fileName: file.name || file.path.split("/").pop(),
		};

		// 添加到显示列表
		displayList.value.push(mediaItem);

		// 开始上传
		const uploadTask = uni.uploadFile({
			url: config.fileUploadUrl + "/prod-api" + props.uploadUrl,
			filePath: file.path,
			name: props.uploadName,
			header: headers,
			formData: {
				...props.formData,
				type: type,
			},
			success: (res) => {
				try {
					const parseData = JSON.parse(res.data);
					const fileName = parseData.fileName || parseData.data?.fileName || parseData;

					if (fileName) {
						// 查找并更新对应的媒体项
						const index = displayList.value.findIndex((item) => item.uid === uid);
						if (index !== -1) {
							const showUrl = addDomainPrefix(fileName);

							// 更新项
							displayList.value[index] = {
								...displayList.value[index],
								url: showUrl,
								progress: 100,
								fileName: fileName,
								originalData: parseData,
							};

							// 存储映射关系
							urlToDataMap.value.set(showUrl, parseData);

							// 触发成功事件
							emit("success", parseData, file);

							// 更新 modelValue
							updateModelValue();

							resolve();
						} else {
							reject(new Error("找不到对应的上传项"));
						}
					} else {
						reject(new Error("上传失败：未获取到文件地址"));
					}
				} catch (error) {
					const index = displayList.value.findIndex((item) => item.uid === uid);
					if (index !== -1) {
						displayList.value.splice(index, 1);
					}
					uni.showToast({
						title: "上传失败",
						icon: "none",
					});
					reject(new Error("上传失败：解析响应数据错误"));
				}
			},
			fail: (err) => {
				// 移除失败的项
				const index = displayList.value.findIndex((item) => item.uid === uid);
				if (index !== -1) {
					displayList.value.splice(index, 1);
				}
				uni.showToast({
					title: err.errMsg || "上传失败",
					icon: "none",
				});
				reject(new Error(err.errMsg || "上传失败"));
			},
		});

		// 监听上传进度
		uploadTask.onProgressUpdate((res) => {
			const index = displayList.value.findIndex((item) => item.uid === uid);
			if (index !== -1) {
				displayList.value[index].progress = res.progress;
			}
		});
	});
}

// 移除媒体
function removeMedia(index: number) {
	if (props.disabled) return;

	const removedItem = displayList.value[index];
	if (removedItem) {
		// 从映射中移除
		urlToDataMap.value.delete(removedItem.url);
		// 从列表中移除
		displayList.value.splice(index, 1);
		// 触发移除事件
		emit("remove", index);
		// 更新值
		updateModelValue();
	}
}

// 预览媒体
function previewMedia(index: number) {
	const item = displayList.value[index];
	if (!item || item.progress < 100) return;

	if (item.type === "image") {
		// 预览图片
		const urls = displayList.value
			.filter((item: MediaItem) => item.type === "image" && item.progress === 100)
			.map((item: MediaItem) => item.url);

		uni.previewImage({
			urls,
			current: item.url,
		});
	} else if (item.type === "video") {
		// 预览视频 - 可以跳转到视频播放页面或使用其他方式
		// uni.showModal({
		//     title: '视频预览',
		//     content: '是否播放视频？',
		//     success: (res) => {
		//         if (res.confirm) {
		//             // 这里可以跳转到视频播放页面或使用其他播放方式
		//             // 暂时使用简单的提示
		//             uni.showToast({
		//                 title: '视频预览功能待实现',
		//                 icon: 'none'
		//             });
		//         }
		//     }
		// });
	}
}

// 更新modelValue
function updateModelValue() {
	const completedItems = displayList.value.filter((item: MediaItem) => item.progress === 100);

	const result = completedItems.map((item: MediaItem) => {
		const originalData = urlToDataMap.value.get(item.url);

		return (
			originalData || {
				url: item.url,
				type: item.type,
				poster: item.poster,
				duration: item.duration,
				size: item.size,
				fileName: item.fileName,
			}
		);
	});

	const finalResult = props.multiple ? result : result[0] || null;
	const urls = result.map((item) => item.fileName);
	emit("update:modelValue", urls.toString());
	emit("change", finalResult);
}
</script>

<style lang="scss" scoped>
::v-deep.cl-popup {
	background-color: transparent !important;
}
::v-deep.cl-dialog__header {
	display: none;
}
.common-media-upload {
	.media-upload-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;

		&.is-disabled {
			opacity: 0.6;
		}
	}

	.media-upload-item {
		position: relative;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #f5f5f5;
		border: 2rpx dashed #ddd;

		&.add-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			border: 2rpx dashed #ccc;

			&:active {
				background-color: #f0f0f0;
			}
		}

		.media-upload__target {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.video-target {
			background-color: #000;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.video-play-icon {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: rgba(255, 255, 255, 0.8);
			font-size: 60rpx;
			pointer-events: none;
		}

		.media-upload__remove {
			position: absolute;
			top: -10rpx;
			right: -10rpx;
			width: 40rpx;
			height: 40rpx;
			background-color: #ff4757;
			color: #fff;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 24rpx;
			z-index: 10;
		}

		.media-upload__progress {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			background-color: rgba(0, 0, 0, 0.5);
			padding: 10rpx;
		}

		.media-type-badge {
			position: absolute;
			top: 10rpx;
			left: 10rpx;
			background-color: rgba(0, 0, 0, 0.6);
			color: #fff;
			padding: 4rpx 8rpx;
			border-radius: 6rpx;
			font-size: 20rpx;
			line-height: 1;
		}

		.media-upload__demo {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: #999;

			.cl-icon-camera-fill {
				font-size: 60rpx;
				margin-bottom: 10rpx;
			}

			.text {
				font-size: 24rpx;
			}
		}
	}
}
</style>

<template>
	<view class="experience-detail-page">
		<!-- 内容区域 -->
		<scroll-view class="detail-body" scroll-y>
			<!-- 顶部信息栏 -->
			<view class="top-info">
				<view class="info-line">
					<text class="info-text">{{ repairHandle?.faultDesc || "-" }}</text>
					<text class="info-separator">{{ repairHandle?.faultTaskTypeName || "-" }}</text>
				</view>
				<view class="publish-time">
					<cl-icon name="time"></cl-icon> 创建时间: {{ repairForm?.createTime || "--" }}</view>
				<view class="publish-time">
					<cl-icon name="time" class="publish-icon"></cl-icon> 归档时间: {{ repairForm?.confirmDt || "--" }}</view>
				<view class="keyword-tags" v-if="detail?.keywords && detail?.keywords.length">
					<view
						v-for="(tag, index) in detail?.keywords"
						:key="index"
						class="keyword-tag"
					>
						<view class="keyword-tag-title">字段标题：</view>
						<view class="keyword-tag-desc">{{ tag }}</view>
					</view>
				</view>
			</view>

			<view class="content-wrapper">
				<!-- 故障报修 -->
				<view class="section-block">
					<view class="section-header">故障报修</view>
					<view class="data-table">
						<view class="table-row">
							<view class="table-cell label">故障任务类型</view>
							<view class="table-cell value">{{
								repairHandle?.faultTaskTypeName || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">报修人员类型</view>
							<view class="table-cell value">{{
								repairHandle?.fixUserRoleTypeName || "-"
							}}</view>
						</view>
						<!-- 故障任务 -->
						<template v-if="repairHandle?.faultTaskType == 0">
							<view class="table-row">
								<view class="table-cell label">所属子系统</view>
								<view class="table-cell value">{{
									repairHandle?.childSysName || "-"
								}}</view>
							</view>
							<view class="table-row">
								<view class="table-cell label">设备类型</view>
								<view class="table-cell value">{{
									repairHandle?.deviceType || "-"
								}}</view>
							</view>
							<view class="table-row">
								<view class="table-cell label">设备类别</view>
								<view class="table-cell value">{{
									repairHandle?.deviceCategoryName || "-"
								}}</view>
							</view>
							<view class="table-row">
								<view class="table-cell label">设备名称</view>
								<view class="table-cell value">{{
									repairHandle?.deviceAttrName || "-"
								}}</view>
							</view>
							<view class="table-row">
								<view class="table-cell label">安装位置</view>
								<view class="table-cell value">{{
									repairHandle?.installLocation || "-"
								}}</view>
							</view>
							<view class="table-row">
								<view class="table-cell label">型号规格</view>
								<view class="table-cell value">{{
									repairHandle?.modelSpecs || "-"
								}}</view>
							</view>
							<view class="table-row">
								<view class="table-cell label">设备编号</view>
								<view class="table-cell value">{{
									repairHandle?.deviceCode || "-"
								}}</view>
							</view>
							<view class="table-row">
								<view class="table-cell label">设备状态</view>
								<view class="table-cell value">{{
									getDeviceStatusText(repairHandle?.deviceStatus)
								}}</view>
							</view>
							<view class="table-row">
								<view class="table-cell label">故障描述</view>
								<view class="table-cell value">{{
									repairHandle?.faultDesc || "-"
								}}</view>
							</view>
							<view v-if="faultImages.length > 0" class="table-row">
								<view class="table-cell label">图片信息</view>
								<view class="table-cell value">
									<view class="image-list">
										<cl-image
											v-for="(img, idx) in faultImages"
											:key="idx"
											:src="img"
											mode="aspectFill"
											:size="[120, 120]"
											:preview-list="faultImages"
										></cl-image>
									</view>
								</view>
							</view>
						</template>
						<template v-else>
							<view class="table-row">
								<view class="table-cell label">联系人</view>
								<view class="table-cell value">{{
									repairHandle?.contactName || "-"
								}}</view>
							</view>
							<view class="table-row">
								<view class="table-cell label">联系电话</view>
								<view class="table-cell value">{{
									repairHandle?.contactTel || "-"
								}}</view>
							</view>
							<view class="table-row">
								<view class="table-cell label">职务</view>
								<view class="table-cell value">{{
									repairHandle?.duties || "-"
								}}</view>
							</view>
							<view class="table-row">
								<view class="table-cell label">工作量估算(人*天)</view>
								<view class="table-cell value">{{
									repairHandle?.expectWorkNum || "-"
								}}</view>
							</view>
							<view class="table-row">
								<view class="table-cell label">任务内容</view>
								<view class="table-cell value">{{
									repairHandle?.faultDesc || "-"
								}}</view>
							</view>
							<view v-if="faultImages.length > 0" class="table-row">
								<view class="table-cell label">附件</view>
								<view class="table-cell value">
									<view class="image-list">
										<cl-image
											v-for="(img, idx) in faultImages"
											:key="idx"
											:src="img"
											mode="aspectFill"
											:size="[120, 120]"
											:preview-list="faultImages"
										></cl-image>
									</view>
								</view>
							</view>
						</template>
						<view class="table-row">
							<view class="table-cell label">报修来源</view>
							<view class="table-cell value">{{
								repairHandle?.fixRoleName || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">报修方式</view>
							<view class="table-cell value">{{
								repairHandle?.fixeWayName || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">上报人</view>
							<view class="table-cell value">{{
								repairHandle?.submitUserName || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">报修时间</view>
							<view class="table-cell value">{{ repairHandle?.fixDate || "-" }}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">维修时段</view>
							<view class="table-cell value">
								{{ repairHandle?.fixDurationStartDtStr || "-" }} 至
								{{ repairHandle?.fixDurationEndDtStr || "-" }}
							</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">指派人员</view>
							<view class="table-cell value">{{
								repairHandle?.assignUserNames || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">维修状态</view>
							<view class="table-cell value">{{
								repairHandle?.fixStatusName || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">建议处理措施</view>
							<view class="table-cell value">{{
								repairHandle?.suggestion || "-"
							}}</view>
						</view>
					</view>
				</view>

				<!-- 报修处理 -->
				<view class="section-block">
					<view class="section-header">报修处理</view>
					<view class="data-table">
						<view class="table-row">
							<view class="table-cell label">处理状态</view>
							<view class="table-cell value">{{
								processForm?.handStatusName || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">维修时段</view>
							<view class="table-cell value">
								{{ processForm?.fixDurationStartDtStr || "-" }} 至
								{{ processForm?.fixDurationEndDtStr || "-" }}
							</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">指派人员</view>
							<view class="table-cell value">{{
								processForm?.assignUserNames || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">建议处理措施</view>
							<view class="table-cell value">{{
								processForm?.suggestion || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">操作人</view>
							<view class="table-cell value">{{
								processForm?.handleUserName || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">操作时间</view>
							<view class="table-cell value">{{ processForm?.handleDt || "-" }}</view>
						</view>
					</view>
				</view>

				<!-- 维修上报 -->
				<view class="section-block">
					<view class="section-header">维修上报</view>
					<view class="data-table">
						<view class="table-row">
							<view class="table-cell label">维修状态</view>
							<view class="table-cell value">{{
								repairForm?.handleResultStatusName || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">是否专家介入</view>
							<view class="table-cell value">
								{{ repairForm?.expertInterfere == "0" ? "是" : "否" }}
							</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">维修人员</view>
							<view class="table-cell value">{{
								repairForm?.fixUserName || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">维修人员电话</view>
							<view class="table-cell value">{{
								repairForm?.phoneNumber || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">处理详情</view>
							<view class="table-cell value">{{
								repairForm?.handleDetail || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">完成时间</view>
							<view class="table-cell value">{{ repairForm?.fixEndDt || "-" }}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">维修耗时</view>
							<view class="table-cell value">{{
								repairForm?.durationHandleTime || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">专家名称</view>
							<view class="table-cell value">{{
								repairForm?.expertName || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">诊断结论</view>
							<view class="table-cell value">{{
								repairForm?.diagnosisSummary || "-"
							}}</view>
						</view>
						<view v-if="repairImages.length > 0" class="table-row">
							<view class="table-cell label">图片信息</view>
							<view class="table-cell value">
								<view class="image-list">
									<cl-image
										v-for="(img, idx) in repairImages"
										:key="idx"
										:src="img"
										mode="aspectFill"
										:size="[120, 120]"
										:preview-list="repairImages"
									></cl-image>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 闭环确认 -->
				<view class="section-block">
					<view class="section-header">闭环确认</view>
					<view class="data-table">
						<view class="table-row">
							<view class="table-cell label">确认状态</view>
							<view class="table-cell value">{{
								loopForm?.closedLoopConfirmName || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">确认人</view>
							<view class="table-cell value">{{
								loopForm?.confirmUserName || "-"
							}}</view>
						</view>
						<view
							class="table-row"
							v-if="
								loopForm?.closedLoopConfirm == 1 && repairHandle?.faultTaskType == 1
							"
						>
							<view class="table-cell label">实际工作量(人*天)</view>
							<view class="table-cell value">{{
								loopForm?.actualWorkNum || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">备注</view>
							<view class="table-cell value">{{
								loopForm?.confirmRemark || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">操作时间</view>
							<view class="table-cell value">{{ loopForm?.confirmDt || "-" }}</view>
						</view>
					</view>
				</view>

				<!-- 任务评价 -->
				<view class="section-block">
					<view class="section-header">任务评价</view>
					<view class="data-table">
						<view class="table-row">
							<view class="table-cell label">任务评分</view>
							<view class="table-cell value">{{ taskForm?.score || "-" }}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">评价人</view>
							<view class="table-cell value">{{
								taskForm?.commentUserName || "-"
							}}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">意见反馈</view>
							<view class="table-cell value">{{ taskForm?.feedback || "-" }}</view>
						</view>
						<view class="table-row">
							<view class="table-cell label">操作时间</view>
							<view class="table-cell value">{{ taskForm?.commentDt || "-" }}</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 右侧悬浮按钮组 -->
		<view class="float-buttons">
			<view class="float-button" @tap="showProcessPopup = true">
				<cl-icon name="list" size="48" color="#fff"></cl-icon>
				<text class="float-text">处理流程</text>
			</view>
			<view class="float-button comment-button" @tap="showCommentPopup = true">
				<cl-icon name="msg" size="48" color="#fff"></cl-icon>
				<text class="float-text">评论 ( {{ commentList.length }} )</text>
			</view>
		</view>

		<!-- 处理流程弹窗 -->
		<cl-popup
			v-model="showProcessPopup"
			direction="bottom"
			:size="'65%'"
			border-radius="20rpx 20rpx 0 0">
			<view class="process-popup">
				<view class="popup-header">
					<text class="popup-title">处理流程</text>
					<cl-icon name="close" size="48" color="#C6D7FF"  @tap="showProcessPopup = false"></cl-icon>
				</view>
				<scroll-view class="popup-content" scroll-y>
					<view v-if="timelineData.length === 0" class="no-data">暂无数据</view>
					<view v-else class="timeline-list">
						<view
							v-for="(item, index) in timelineData"
							:key="index"
							class="timeline-item"
						>
							<view class="timeline-dot"></view>
							<view class="timeline-content">
								<view class="timeline-title-box">
									<view class="timeline-title">{{ item.title }}</view>
									<view class="timeline-time">
										{{ item.dateStr }} {{ item.hms }}
									</view>
								</view>
								<view class="timeline-params">
									<view
										v-for="(param, key) in getTimelineParams(item)"
										:key="key"
										class="param-row"
									>
										<text class="param-label">{{ param.label }}：</text>
										<text class="param-value" :class="param.className">{{ param.value }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</cl-popup>

		<!-- 评论交流弹窗 -->
		<cl-popup
			v-model="showCommentPopup"
			direction="bottom"
			:size="'75%'"
			border-radius="20rpx 20rpx 0 0"
			padding="30rpx 0 0 0">
			<view class="comment-popup">
				<view class="popup-header">
					<text class="popup-title">评论交流</text>
					<cl-icon name="close" :size="42" color="#C6D7FF" @tap="showCommentPopup = false"></cl-icon>
				</view>
				<scroll-view class="popup-content comment-scroll" scroll-y>
					<view v-if="commentList.length === 0" class="no-data">暂无评论</view>
					<view v-else class="comment-list">
						<view v-for="item in commentList" :key="item.id" class="comment-item">
							<view class="comment-header">
								<image class="comment-header-avatar" mode="aspectFill" src="/static/icon/tabbar/my2.png"></image>
								<text class="comment-name">{{ item.userName || "-" }}</text>
								<text class="comment-date">{{ item.createTime1 || "-" }}</text>
							</view>
							<view class="comment-content-box">
								<view class="comment-content">
									<mp-html :content="processHtmlImages(item.content || '')" />
								</view>
								<view class="comment-actions">
									<view
										v-if="item.children && item.children.length"
										class="comment-actions-button comment-button"
										@click="toggleShowAllReplies(item.id)">
										<template v-if="showAllRepliesMap[item.id]">
											<view class="comment-count">
												<cl-icon :size="22" name="arrow-top"></cl-icon> 收起评论
											</view>
										</template>
										<template v-else>
											评论 <text class="comment-count">( {{ item.children.length }} )</text>
										</template>
									</view>
									<view class="comment-actions-button reply-button" @click="handleReplyPopup(item)">
										回复
									</view>
									<view
										class="comment-actions-button delete-button"
										v-if="canDeleteComment(item)"
										@tap="handleDeleteComment(item)">删除</view>
								</view>
							</view>
							<!-- 回复列表 -->
							<view
								v-if="item.children && item.children.length > 0 && showAllRepliesMap[item.id]"
								class="reply-list"
							>
								<view
									v-for="reply in item.children"
									:key="reply.id"
									class="reply-item"
								>
									<view class="reply-header">
										<image class="reply-header-avatar" mode="aspectFill" src="/static/icon/tabbar/my2.png"></image>
										<text class="reply-name">{{ reply.userName || "-" }}</text>
										<text class="reply-date">{{
											reply.createTime1 || "-"
										}}</text>
									</view>
									<view class="reply-content-box comment-content-box">
										<view class="reply-content">
											<mp-html
												:content="processHtmlImages(reply.content || '')"
											/>
										</view>
										<view class="comment-actions">
											<!-- <view
												v-if="reply.children && reply.children.length"
												class="comment-actions-button comment-button"
												@tap="toggleReply(item)">
												评论 <text class="comment-count">( {{ reply.children.length }} )</text>
											</view> -->
											<view class="comment-actions-button reply-button" @click="handleReplyPopup(item)">
												回复
											</view>
											<view
												class="comment-actions-button delete-button"
												v-if="canDeleteComment(reply)"
												@tap="handleDeleteComment(reply)">删除</view>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
				<!-- 评论输入框 -->
				<view class="comment-input-section">
					<button class="comment-input-btn" @tap="handleReplyPopup()"> 发表评论 </button>
				</view>
			</view>
		</cl-popup>

		<cl-popup
			v-model="showTextareaPopup"
			direction="bottom"
			border-radius="20rpx 20rpx 0 0"
			padding="30rpx 0 0 0"
			@close="handleCancelTextarea">
			<view class="comment-popup">
				<view class="popup-header">
					<text class="popup-title">{{ replyItem.userName ? '评论回复' : '发表评论'}}</text>
					<cl-icon name="close" size="48" @tap="showTextareaPopup = false"></cl-icon>
				</view>
				<view class="comment-textarea-box">
					<cl-textarea
						class="comment-textarea"
						v-model="textareaContent"
						type="textarea"
						:height="260"
						clearable
						:placeholder="replyItem.userName ? `回复：${replyItem.userName}` : '请输入你想说的话'"
						:maxlength="200"
						count
					></cl-textarea>
				</view>
				<view class="comment-popup-upload">
					<CommonUpload
						v-model="commentUploadList"
						class="comment-popup__upload"
						multiple
						:limit="3"
						:size="[168, 168]"
						text="添加图片/附件"
					/>
					<text class="comment-popup__hint"
						>支持上传PNG、JPG、JPEG、PDF等格式</text
					>
				</view>
				<view class="comment-textarea-section">
					<button class="cancel-btn" @click="showTextareaPopup = false">取消</button>
					<button class="submit-btn" @click="handleSubmitTextarea">提交</button>
				</view>
			</view>
		</cl-popup>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, reactive } from "vue";
import { lookExperienceSystem, reviewExperience, addKeywordsRead, deleteReview } from "../api";
import { addDomainPrefix } from "/@/cool/utils";
import { useUserStore } from "/@/cool/store/user";
import CommonUpload from "@/components/commonUpload.vue";

interface Props {
	id: string;
}

const props = defineProps<Props>();

const userStore = useUserStore();

const loading = ref(false);
const detail = ref<any>({});
const commentList = ref<any[]>([]);
const commentContent = ref("");
const showProcessPopup = ref(false);
const showCommentPopup = ref(false);
const isNeedAddCount = ref(true);

// 回复相关状态
const replyContents = reactive<Record<string, string>>({});
const replyEditorVisibleMap = reactive<Record<string, boolean>>({});
const replySubmittingMap = reactive<Record<string, boolean>>({});
const showAllRepliesMap = reactive<Record<string, boolean>>({});

// 各个表单数据
const repairHandle = ref<any>({});
const processForm = ref<any>({});
const repairForm = ref<any>({});
const loopForm = ref<any>({});
const taskForm = ref<any>({});
const timelineData = ref<any[]>([]);

// 故障图片
const faultImages = computed(() => {
	if (!repairHandle.value?.faultImgPath) return [];
	return repairHandle.value.faultImgPath
		.split(",")
		.filter((url: string) => url.trim())
		.map((url: string) => addDomainPrefix(url.trim()));
});

// 维修图片
const repairImages = computed(() => {
	if (!repairForm.value?.imgInfoPath) return [];
	return repairForm.value.imgInfoPath
		.split(",")
		.filter((url: string) => url.trim())
		.map((url: string) => addDomainPrefix(url.trim()));
});

// 设备状态文本
const getDeviceStatusText = (status: string) => {
	const statusMap: Record<string, string> = {
		"0": "在用",
		"1": "备用",
		"2": "维修",
		"3": "报废",
	};
	return statusMap[status] || "-";
};

// 处理流程参数配置
const timelineParamsConfig: Record<string, any[]> = {
	RepairSubmit: [
		{ label: "设备类型", prop: "deviceType" },
		{ label: "设备编号", prop: "deviceCode" },
		{ label: "故障描述", prop: "faultDesc" },
		{ label: "上报人", prop: "submitUserName" },
	],
	RepairHandle: [
		{ label: "处理状态", prop: "handStatusName" },
		{ label: "维修时段", prop: "fixDurationStartDtStr", custom: true },
		{ label: "指派人员", prop: "assignUserNames" },
	],
	RepairReport: [
		{ label: "维修状态", prop: "handleResultStatusName" },
		{ label: "维修人员", prop: "fixUserName" },
		{ label: "结果反馈", prop: "handleDetail" },
	],
	RepairConfirm: [
		{ label: "确认状态", prop: "closedLoopConfirmName" },
		{ label: "确认人员", prop: "confirmUserName" },
		{ label: "备注", prop: "confirmRemark" },
	],
	RepairComment: [
		{ label: "任务评分", prop: "score" },
		{ label: "评价人", prop: "commentUserName" },
		{ label: "意见反馈", prop: "feedback" },
	],
};

// 发表评论弹窗部分 start
const showTextareaPopup = ref(false);
const textareaContent = ref("");
const replyItem = ref<any>({});
const commentUploadList = ref<any[]>([]);
const handleSubmitTextarea = () => {
	if (!textareaContent.value.trim()) {
		uni.showToast({
			title: "请输入评论内容",
			icon: "none",
		});
		return;
	}

	if (replyItem.value.userName) {
		replyContents[replyItem.value.id] = textareaContent.value;
		handleSubmitReply(replyItem.value)
	} else {
		commentContent.value = textareaContent.value;
		handleSubmitComment()
	}
	showTextareaPopup.value = false;
};
// 取消发表评论
const handleCancelTextarea = () => {
	showTextareaPopup.value = false;
	replyItem.value = {}
};
// 回复评论
const handleReplyPopup = (item?: any) => {
	showTextareaPopup.value = true;
	if (item) {
		replyItem.value = item;
		textareaContent.value = replyContents[item.id] || "";
	} else {
		textareaContent.value = commentContent.value || "";
	}
};
// 发表评论弹窗部分 end

// 获取时间线参数
const getTimelineParams = (item: any) => {
	const config = timelineParamsConfig[item.dataType];
	if (!config) return [];

	return config.map((cfg) => {
		let value: string | number = "";
		if (cfg.custom && cfg.prop === "fixDurationStartDtStr") {
			value = `${item.params.fixDurationStartDtStr || ""} 至 ${
				item.params.fixDurationEndDtStr || ""
			}`;
		} else {
			value = item.params[cfg.prop] || "-";
		}

		// 维修状态样式
		let className = ''
		if (cfg.prop === "handStatusName") {
			className = "hand-status-name"
		} else if (cfg.prop === "handleResultStatusName" && item.params && item.params.handleResultStatus === 1) {
			className = "handle-result-status-name"
		}

		return {
			label: cfg.label,
			value: value,
			className,
		};
	});
};

// 获取详情
const fetchDetail = async () => {
	loading.value = true;
	try {
		uni.showLoading();
		const res = await lookExperienceSystem(props.id);
		detail.value = res || {};
		repairHandle.value = res?.repairHandle || {};
		processForm.value = res?.repairHandle || {};
		repairForm.value = res?.repairReport || {};
		loopForm.value = res?.repairReport || {};
		taskForm.value = res?.repairComment || {};
		timelineData.value = res?.processList || [];
		commentList.value = res?.dmTechnologyReviewList || [];

		// 调试信息：打印当前用户ID和评论列表
		console.log("当前用户信息:", userStore.info);
		console.log("评论列表:", commentList.value);
		if (commentList.value.length > 0) {
			console.log("第一条评论的userId:", commentList.value[0].userId);
		}

		if (isNeedAddCount.value) {
			addKeywordsRead({ id: props.id, dataSource: "JYWK" });
			isNeedAddCount.value = false;
		}
		uni.hideLoading();
	} catch (error: any) {
		console.error("获取详情失败", error);
		uni.hideLoading();
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

// 构建包含图片的富文本内容
function buildContentHtml(text: string, files: any[]) {
	let html = text;
	if (Array.isArray(files) && files.length) {
		const imgs = files
			.map((f: any) => {
				const src = addDomainPrefix(f.url || f.filePath || f.path || f.fileName || f);
				return src ? `<p><img src="${src}" /></p>` : "";
			})
			.filter(Boolean)
			.join("");
		html = `${html}${imgs}`;
	}
	return html;
}

// 切换回复输入框
const toggleReply = (item: any) => {
	const key = item.id;
	replyEditorVisibleMap[key] = !replyEditorVisibleMap[key];
	if (replyEditorVisibleMap[key] && !replyContents[key]) {
		replyContents[key] = "";
	}
};

// 获取显示的回复列表
const getDisplayedReplies = (item: any) => {
	const replies = item.children || [];
	return showAllRepliesMap[item.id] ? replies : replies.slice(0, 2);
};

// 切换显示所有回复
const toggleShowAllReplies = (commentId: string) => {
	showAllRepliesMap[commentId] = !showAllRepliesMap[commentId];
};

// 判断是否可以删除评论（只能删除自己的评论）
const canDeleteComment = (item: any) => {
	if (!userStore.info || !item.userId) {
		console.log("canDeleteComment: 用户信息或评论userId不存在", {
			hasUserInfo: !!userStore.info,
			itemUserId: item.userId,
		});
		return false;
	}
	// 尝试多个可能的用户ID字段
	const currentUserId = (userStore.info as any).userId || (userStore.info as any).id;
	const canDelete = currentUserId && currentUserId === item.userId;
	console.log("canDeleteComment 判断结果:", {
		currentUserId,
		itemUserId: item.userId,
		canDelete,
	});
	return canDelete;
};

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
		const html = buildContentHtml(content, commentUploadList.value);
		uni.showLoading({
			title: "提交中...",
		});

		await reviewExperience({
			experienceId: props.id,
			content: html,
			parentId: 0,
		});

		uni.hideLoading();
		uni.showToast({
			title: "评论成功",
			icon: "success",
		});

		commentContent.value = "";
		commentUploadList.value = [];
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
		const html = buildContentHtml(content, commentUploadList.value);
		await reviewExperience({
			experienceId: props.id,
			content: html,
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
.experience-detail-page {
	height: calc(100vh - 88rpx);
	position: relative;
	box-sizing: border-box;
}

.top-info {
	padding: 50rpx 20rpx 0 20rpx;
}

.info-line {
	display: flex;
	justify-content: space-between;
	margin-bottom: 53rpx;
	padding-left: 25rpx;
}

.info-text {
	font-size: 31rpx;
	color: #F6F8FC;
	line-height: 35rpx;
	font-weight: 600;
}

.info-separator {
	height: 42rpx;
	line-height: 44rpx;
	padding: 0 10rpx;
	margin-left: 96rpx;
	background: #FFFFFF;
	border-radius: 6rpx 6rpx 6rpx 6rpx;
	border: 1rpx solid #FF531A;
	font-size: 21rpx;
	color: #FF531A;
	white-space: nowrap;
}

.keyword-tags {
	width: 708rpx;
	padding: 62rpx 53rpx;
	box-sizing: border-box;
	background: #F6F8FC;
	border-radius: 21rpx 21rpx 21rpx 21rpx;
}

.keyword-tag {
	display: flex;
	align-items: center;
	padding: 8rpx 16rpx;
	background-color: #f5f7fa;
	color: #606266;
	border-radius: 8rpx;
	font-size: 24rpx;

	.keyword-tag-title {
		font-size: 22rpx;
		line-height: 52rpx;
		color: #949DAD;
		margin-right: 42rpx;
	}
}

.publish-time {
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
	padding-left: 25rpx;
	font-size: 22rpx;
	line-height: 27rpx;
	color: #F6F8FC;
	white-space: nowrap;

	.cl-icon {
		margin-right: 12rpx;
	}

	.publish-icon {
		color: #30BB7C;
	}
}

.detail-body {
	height: 100%;
}

.content-wrapper {
	padding: 20rpx;
}

.section-block {
	padding: 20rpx 26rpx;
	background: linear-gradient( 180deg, #F6F8FC 0%, #FFFFFF 100%);
	border-radius: 21rpx 21rpx 21rpx 21rpx;
	border: 2rpx solid #FFFFFF;
	margin-bottom: 24rpx;
	overflow: hidden;
}

.section-header {
	position: relative;
	padding-left: 30rpx;
	margin-bottom: 34rpx;
	font-size: 32rpx;
	font-weight: 600;
	color: #13144F;
	background-color: #f5f7fa;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 10rpx;
		bottom: 0;
		width: 6rpx;
		background: #4474FF;
		border-radius: 15rpx 15rpx 15rpx 15rpx;
	}
}

.data-table {
	width: 100%;
	border: 1rpx solid #DEE6FA;
}

.table-row {
	display: flex;
	border-bottom: 1rpx solid #DEE6FA;
	min-height: 73rpx;

	&:last-child {
		border-bottom: none;
	}
}

.table-cell {
	padding: 20rpx 16rpx;
	font-size: 22rpx;
	line-height: 1.6;
	word-break: break-all;
	box-sizing: border-box;

	&.label {
		width: 253rpx;
		flex-shrink: 0;
		background-color: #EFF3FD;
		color: #606266;
		font-weight: 500;
		border-right: 1rpx solid #DEE6FA;
	}

	&.value {
		flex: 1;
		color: #303133;
		background-color: #fff;
	}
}

.image-list {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	padding: 8rpx 0;
}

.float-buttons {
	position: fixed;
	right: 32rpx;
	bottom: 160rpx;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	z-index: 100;
}

.float-button {
	width: 120rpx;
	height: 120rpx;
	background: #39B2FF;
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0rpx 4rpx 10rpx 0rpx rgba(57,178,255,0.5);

	&.comment-button {
		background: #4474FF;
		box-shadow: 0rpx 4rpx 10rpx 0rpx rgba(68,116,255,0.5);
	}
}

.float-text {
	font-size: 20rpx;
	color: #fff;
	margin-top: 8rpx;
}

.process-popup,
.comment-popup {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #fff;
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100vw;
	margin-left: 50%;
	transform: translateX(-50%);
	padding: 0 24rpx 25rpx 37rpx;
	box-sizing: border-box;
	border-bottom: 1rpx solid #ebeef5;
}

.popup-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #13144F;
}

.popup-content {
	flex: 1;
	height: 0;
	padding: 0 0 24rpx 24rpx;
	// margin-top: 46rpx;
	box-sizing: border-box;

	&.comment-scroll {
		padding-bottom: 0;
	}
}

.comment-popup {
	.comment-textarea-box {
		padding: 35rpx 42rpx 0 42rpx;
	}

	.comment-textarea {
		padding: 14rpx;
		background: #FFFFFF;
		border-radius: 15rpx;
		border: 1rpx solid #A9BFFF;
		color: #13144F;
	}

	.comment-textarea-section {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 124rpx;
		border-top: 1px solid #C6D7FF;
		padding: 20rpx 0;

		button {
			width: 292rpx;
			height: 84rpx;
			line-height: 84rpx;
			border-radius: 21rpx;
			font-size: 29rpx;
			color: #FFFFFF;
			border: none;
			margin: 0;

			&.cancel-btn {
				background: #949DAD;
				margin-right: 20rpx;
			}
			&.submit-btn {
				background: #4474FF;
			}
		}
	}

	.comment-popup-upload {
		padding: 16rpx 0 60rpx 40rpx;

		.comment-popup__hint {
			margin-top: 20rpx;
			font-size: 21rpx;
			color: #949DAD;
			line-height: 29rpx;
		}

		:deep(.comment-popup__upload .cl-upload) {
			border: 1rpx solid #A9BFFF;
		}
	}
}

.no-data {
	text-align: center;
	padding: 80rpx;
	color: #909399;
	font-size: 28rpx;
}

.timeline-list {
	position: relative;
	padding-left: 48rpx;

	&::before {
		content: "";
		position: absolute;
		left: 16rpx;
		top: 40rpx;
		bottom: 0;
		width: 2rpx;
		background-color: #ebeef5;
	}
}

.timeline-item {
	position: relative;
	padding-bottom: 48rpx;

	&:last-child {
		padding-bottom: 0;
	}
}

.timeline-dot {
	position: absolute;
	left: -44rpx;
	top: 8rpx;
	width: 15rpx;
	height: 15rpx;
	background-color: #409eff;
	border-radius: 50%;
	border: 6rpx solid #EFF3FD;
}

.timeline-content {
	padding: 14rpx 11rpx 19rpx 11rpx;
	background-color: white;
	box-shadow: 0rpx 2rpx 6rpx 0rpx #DEE6FA;
	border-radius: 15rpx;
	border: 1rpx solid #DEE6FA;
	color: #13144F;

	.timeline-title-box {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		margin-bottom: 11rpx;
	}
}

.timeline-title {
	font-size: 26rpx;
	line-height: 36rpx;
	font-weight: 600;
}

.timeline-time {
	padding-right: 5rpx;
	font-size: 20rpx;
	color: #4474FF;
	line-height: 26rpx;
}

.timeline-params {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
	background: #EFF3FD;
	border-radius: 8rpx;
	padding: 18rpx 18rpx 16rpx 18rpx;
}

.param-row {
	display: flex;
	align-items: flex-start;
}

.param-label {
	max-width: 110rpx;
	width: 110rpx;
	margin-right: 10rpx;
	font-size: 21rpx;
	color: #949DAD;
	line-height: 42rpx;
}

.param-value {
	flex: 1;
	font-size: 21rpx;
	color: #13144F;
	line-height: 42rpx;
	word-break: break-all;

	&.handle-result-status-name {
		flex: unset;
		width: fit-content;
		padding: 10rpx 20rpx;
		background: rgba(68,116,255,0.1);
		border-radius: 31rpx 31rpx 31rpx 31rpx;
		border: 1rpx solid #4474FF;
		color: #4474FF;
		line-height: 1;
	}

	&.hand-status-name {
		flex: unset;
		width: fit-content;
		padding: 10rpx 20rpx;
		background: rgba(48,187,124,0.1);
		border-radius: 31rpx 31rpx 31rpx 31rpx;
		border: 1rpx solid #30BB7C;
		color: #30BB7C;
		line-height: 1;
	}
}

// 评论弹窗样式
.comment-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	padding: 24rpx 42rpx 24rpx 0;
}

.comment-item {
	padding: 24rpx 0 24rpx 24rpx;
	border-bottom: 1rpx solid #C6D7FF;
}

.comment-header {
	display: flex;
	align-items: center;
	margin-bottom: 12rpx;

	.comment-header-avatar {
		width: 25rpx;
		height: 25rpx;
		border-radius: 50%;
		box-shadow: 0rpx 0rpx 4rpx 0rpx rgba(76,122,255,0.5);
		margin-right: 12rpx;
	}
}

.comment-name {
	width: 90rpx;
	margin-right: 10rpx;
	font-size: 22rpx;
	color: #4474FF;
}

.comment-date {
	font-size: 22rpx;
	color: #949DAD;
}

.comment-content-box {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding-right: 20rpx;

	&.reply-content-box {
		padding-right: 0;
	}
}

.comment-content {
	width: 380rpx;
	font-size: 22rpx;
	color: #13144F;
	line-height: 1.6;
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

.comment-actions {
	display: flex;
	align-items: center;
	gap: 22rpx;
	justify-content: flex-end;

	.comment-actions-button {
		font-size: 22rpx;
		line-height: 40rpx;
		color: #13144F;
	}

	.comment-count,
	.reply-button {
		color: #4C7AFF;
	}

	.delete-button {
		color: #FB5C7B;
	}
}

.reply-list {
	margin-top: 12rpx;
	padding: 12rpx 20rpx 20rpx 22rpx;
	background: rgba(198,215,255,0.2);
	border-radius: 6rpx 6rpx 6rpx 6rpx;
}

.reply-item {
	padding: 22rpx 0 40rpx 0;
	border-bottom: 1rpx dashed #C6D7FF;

	&:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}
}

.reply-header {
	display: flex;
	align-items: center;
	margin-bottom: 12rpx;

	.reply-header-avatar {
		width: 25rpx;
		min-width: 25rpx;
		height: 25rpx;
		border-radius: 50%;
		margin-right: 12rpx;
	}
}

.reply-name {
	width: 90rpx;
	margin-right: 10rpx;
	font-size: 22rpx;
	color: #4474FF;
}

.reply-date {
	font-size: 22rpx;
	color: #909399;
}

.reply-content {
	font-size: 22rpx;
	color: #13144F;
	line-height: 1.6;
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

.reply-input-section {
	margin-top: 16rpx;
	padding: 16rpx;
	background-color: #fff;
	border-radius: 8rpx;

	.reply-input-box {
		position: relative;
	}
}

.reply-actions-buttons {
	display: flex;
	gap: 16rpx;
	margin-top: 16rpx;
	justify-content: flex-end;

	:deep(.cl-button--primary:not(.is-plain)) {
		background: #4474FF;
	}
}

.comment-input-section {
	display: flex;
	gap: 16rpx;
	padding: 18rpx 0 24rpx 0;
	border-top: 1rpx solid #ebeef5;
	background-color: #fff;

	.comment-input-box {
		position: relative;
	}

	.comment-input-btn {
		width: 604rpx;
		height: 84rpx;
		background: #4474FF;
		color: #fff;
		font-size: 29rpx;
		font-weight: 600;
		border-radius: 21rpx;
		padding: 12rpx 24rpx;
	}
}

.reply-input-box-modal {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
}
</style>

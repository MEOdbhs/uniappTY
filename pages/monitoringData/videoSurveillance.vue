<template>
	<view class="video-page">
		<view class="video-mode-switch">
			<view
				class="mode-segment-btn"
				:class="{ active: viewMode === 'list' }"
				@tap="viewMode = 'list'"
			>
				<view class="mode-mark mode-mark-list">
					<view class="line" />
					<view class="line" />
					<view class="line" />
				</view>
			</view>
			<view
				class="mode-segment-btn"
				:class="{ active: viewMode === 'grid' }"
				@tap="viewMode = 'grid'"
			>
				<view class="mode-mark mode-mark-grid">
					<view class="cell" />
					<view class="cell" />
					<view class="cell" />
					<view class="cell" />
				</view>
			</view>
		</view>

		<view v-if="loading" class="state-wrap">
			<cl-loading theme="primary" />
			<text class="state-text">视频监控加载中...</text>
		</view>

		<view v-else-if="filteredVideoList.length === 0" class="state-wrap">
			<text class="state-text">暂无视频监控数据</text>
		</view>

		<view v-else-if="viewMode === 'list'" class="video-list">
			<view
				v-for="item in filteredVideoList"
				:key="item.id"
				class="video-list-card"
				@tap="toggleExpand(item.id)"
			>
				<view class="row-main">
					<view class="dot" :class="isOnline(item) ? 'dot-online' : 'dot-offline'" />
					<text class="monitor-name">{{ item.monitorName }}</text>
					<text class="site-name">{{ item.siteName }}</text>
					<text
						class="status-text"
						:class="isOnline(item) ? 'status-online' : 'status-offline'"
					>
						{{ onlineText(item) }}
					</text>
				</view>

				<view v-if="expandedId === item.id" class="expand-panel" @tap.stop>
					<view class="preview-box" @tap="playFromList(item)">
						<video
							v-if="playingItemId === item.id && playingVideoUrl"
							:id="videoElementId(item.id)"
							class="preview-video"
							:src="playingVideoUrl"
							:controls="true"
							:autoplay="true"
							:show-center-play-btn="true"
							object-fit="cover"
						/>
						<view v-else class="preview-placeholder">
							<view class="play-circle">
								<view class="play-triangle" />
							</view>
							<text class="play-tip">点击播放</text>
						</view>
						<view class="preview-mask">
							<text class="preview-mask-text">点击预览并全屏播放</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view v-else class="video-grid">
			<view
				v-for="item in filteredVideoList"
				:key="item.id"
				class="grid-card"
				@tap="playFromGrid(item)"
			>
				<view class="grid-cover">
					<view class="grid-play-circle">
						<view class="grid-play-triangle" />
					</view>
				</view>
				<view class="grid-mask">
					<view class="grid-line">
						<text class="grid-title">{{ item.monitorName }}</text>
					</view>
					<view class="grid-line">
						<text class="grid-site">{{ item.siteName }}</text>
						<text
							class="grid-status"
							:class="isOnline(item) ? 'status-online' : 'status-offline'"
						>
							{{ onlineText(item) }}
						</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 宫格模式点击后用这个全局播放器发起全屏，避免页面中没有对应 video 节点导致 requestFullScreen 失败 -->
		<video
			id="global-grid-video-player"
			class="global-hidden-video"
			:src="gridPlayingVideoUrl"
			:controls="true"
			:autoplay="true"
			object-fit="cover"
		/>

		<view v-if="pagePlayerVisible" class="page-player-mask">
			<view
				class="page-player-close-fab"
				:style="{ top: `${playerSafeTopPx}px` }"
				@tap="closePagePlayer"
			>
				×
			</view>
			<view class="page-player-body">
				<view class="page-player-video-shell">
					<video
						v-if="pagePlayerUrl"
						id="page-inline-player"
						class="page-player-video"
						:src="pagePlayerUrl"
						:controls="true"
						:autoplay="true"
						:show-fullscreen-btn="false"
						object-fit="contain"
					/>
					<view class="player-overlay player-overlay-top">
						<text class="player-overlay-chip">{{ pagePlayerMineName }}</text>
						<text class="player-overlay-chip">{{ pagePlayerTimeText }}</text>
					</view>
					<view class="player-overlay player-overlay-bottom">
						<text class="player-overlay-chip">{{ pagePlayerTitle }}</text>
					</view>
					<view v-if="pagePlayerPreparing" class="page-player-loading-mask">
						<cl-loading theme="primary" />
						<text class="page-player-loading-text">视频加载中，请稍候...</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { config } from "/@/config";
import {
	getMonitoringVideoList,
	getSystemParamByCode,
	normalizeMonitoringVideoItem,
	parsePageResult,
	type MonitoringVideoItem,
	type MonitoringVideoViewItem,
} from "./api";

const props = withDefaults(
	defineProps<{
		names?: string;
	}>(),
	{
		names: "",
	},
);

const viewMode = ref<"list" | "grid">("list");
const loading = ref(false);
const rawVideoList = ref<MonitoringVideoViewItem[]>([]);
const filteredKeyword = ref("");
const expandedId = ref("");
const playingItemId = ref("");
const playingVideoUrl = ref("");
const gridPlayingVideoUrl = ref("");
const pagePlayerVisible = ref(false);
const pagePlayerUrl = ref("");
const pagePlayerTitle = ref("视频播放");
const pagePlayerMineName = ref("");
const pagePlayerTimeText = ref("");
const playerSafeTopPx = ref(24);
const playLoadingKey = ref("");
const pagePlayerPreparing = ref(false);

const WVP_PARAM_CODE = "wvpUserPsw";
const FILTER_DEBOUNCE_MS = 300;
let filterDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let playerClockTimer: ReturnType<typeof setInterval> | null = null;

const wvpToken = ref("");
const wvpUserName = ref("");
const wvpPassword = ref("");

/**
 * 防抖监听 names：
 * 为什么要做 300ms 防抖而不是每次输入都立即过滤：
 * - 顶部输入框会频繁触发，防抖能减少列表重复计算，保证低端机滚动和点击更稳定。
 */
watch(
	() => props.names,
	(value) => {
		if (filterDebounceTimer) clearTimeout(filterDebounceTimer);
		filterDebounceTimer = setTimeout(() => {
			filteredKeyword.value = String(value || "")
				.trim()
				.toLowerCase();
		}, FILTER_DEBOUNCE_MS);
	},
	{ immediate: true },
);

onUnmounted(() => {
	if (filterDebounceTimer) clearTimeout(filterDebounceTimer);
	if (playerClockTimer) clearInterval(playerClockTimer);
});

/**
 * 前端过滤只做“监控名称 + 工地名称”：
 * 为什么不再请求接口：
 * - 你明确要求视频搜索前端自行过滤；
 * - 避免输入时频繁请求，减少网络抖动对交互的影响。
 */
const filteredVideoList = computed(() => {
	const keyword = filteredKeyword.value;
	if (!keyword) return rawVideoList.value;
	return rawVideoList.value.filter((item) => {
		const monitor = String(item.monitorName || "").toLowerCase();
		const site = String(item.siteName || "").toLowerCase();
		return monitor.includes(keyword) || site.includes(keyword);
	});
});

/**
 * 在线状态判定规则（按你的要求）：
 * - 优先使用接口布尔字段 isOnline：true=在线，false=离线；
 * - 若后端暂未回传该字段，才回退到在线文案判断，避免历史数据全变“离线”。
 */
function isOnline(item: MonitoringVideoViewItem) {
	const rawValue = item?.raw?.isOnline;
	if (typeof rawValue === "boolean") {
		return rawValue;
	}
	if (rawValue === "true" || rawValue === "1" || rawValue === 1) {
		return true;
	}
	if (rawValue === "false" || rawValue === "0" || rawValue === 0) {
		return false;
	}
	return String(item.onlineStateText || "").includes("在线");
}

function onlineText(item: MonitoringVideoViewItem) {
	return isOnline(item) ? "在线" : "离线";
}

function videoElementId(id: string) {
	return `video-player-${id}`;
}

function toggleExpand(id: string) {
	expandedId.value = expandedId.value === id ? "" : id;
}

async function loadVideoList() {
	loading.value = true;
	try {
		const res = await getMonitoringVideoList({
			page: 1,
			size: 200,
		});
		const page = parsePageResult<MonitoringVideoItem>(res);
		rawVideoList.value = page.records.map((item) => normalizeMonitoringVideoItem(item));
		// 列表刷新后收起展开项，避免旧展开 id 在新数据中失效导致显示异常。
		expandedId.value = "";
		playingItemId.value = "";
		playingVideoUrl.value = "";
	} catch (error: any) {
		console.error("视频监控列表获取失败", error);
		rawVideoList.value = [];
		uni.showToast({
			title: error?.message || "视频监控列表获取失败",
			icon: "none",
		});
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	/**
	 * 关闭按钮距离状态栏动态下移：
	 * 为什么不只用 env(safe-area-inset-top)：
	 * - 部分 Android 真机返回 0，导致按钮仍被状态栏遮挡；
	 * - 直接读取 statusBarHeight 兼容性更稳定。
	 */
	try {
		const sys = uni.getSystemInfoSync();
		playerSafeTopPx.value = Number(sys.statusBarHeight || 0) + 24;
	} catch {
		playerSafeTopPx.value = 24;
	}
	loadVideoList();
});

onShow(() => {
	loadVideoList();
});

/**
 * 将 uni.request 封装成 Promise：
 * 为什么单独抽方法：
 * - 取流链路是顺序异步调用，Promise 写法比回调嵌套更清晰，便于错误统一拦截。
 */
function requestByUni<T = Record<string, any>>(
	options: UniNamespace.RequestOptions,
): Promise<UniNamespace.RequestSuccessCallbackResult & { data: T }> {
	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			success: (res) =>
				resolve(res as UniNamespace.RequestSuccessCallbackResult & { data: T }),
			fail: reject,
		});
	});
}

/**
 * 端差异 URL 处理：
 * - H5 走 /wvp 代理前缀；
 * - 真机/App 必须使用 http(s) 绝对地址，不能用相对路径（否则会出现 file:// 报错）。
 */
function buildWvpRequestUrl(path: string) {
	// #ifdef H5
	return path;
	// #endif
	// #ifndef H5
	const host = String(config.host || "").replace(/\/$/, "");
	return `${host}${path}`;
	// #endif
}

/**
 * 读取并缓存 WVP 账号密码：
 * 为什么要先缓存：
 * - 同一页面多次点播时可避免重复取系统参数，降低接口耗时并减少失败点。
 */
async function ensureWvpCredential() {
	if (wvpUserName.value && wvpPassword.value) return;
	const res: any = await getSystemParamByCode(WVP_PARAM_CODE);
	const raw = res && typeof res === "object" && "data" in res ? res.data : res;
	const parameterValue = raw?.parameterValue ?? raw?.data?.parameterValue ?? "";
	if (!parameterValue) {
		throw new Error("未读取到WVP系统参数");
	}
	let parsed: any;
	try {
		parsed = JSON.parse(parameterValue);
	} catch {
		throw new Error("WVP系统参数格式错误");
	}
	if (Array.isArray(parsed)) {
		/**
		 * 先严格对齐 PC 端写法：
		 * - PC 固定取下标 0 的 wvpVideoName 与下标 1 的 wvpVideoPassword。
		 * 这样做的原因：
		 * - 你的 PC 端已验证可用，移动端优先复刻同一读取方式，避免“智能匹配”带来的歧义。
		 */
		wvpUserName.value = String(parsed?.[0]?.wvpVideoName || parsed?.[0]?.username || "");
		wvpPassword.value = String(parsed?.[1]?.wvpVideoPassword || parsed?.[1]?.password || "");
		// 再补兜底，兼容字段顺序变化。
		if (!wvpUserName.value) {
			const nameHolder = parsed.find((i) => i && (i.wvpVideoName || i.username));
			wvpUserName.value = String(nameHolder?.wvpVideoName || nameHolder?.username || "");
		}
		if (!wvpPassword.value) {
			const passHolder = parsed.find((i) => i && (i.wvpVideoPassword || i.password));
			wvpPassword.value = String(passHolder?.wvpVideoPassword || passHolder?.password || "");
		}
	} else if (parsed && typeof parsed === "object") {
		wvpUserName.value = String(parsed.wvpVideoName || "");
		wvpPassword.value = String(parsed.wvpVideoPassword || "");
	}
	if (!wvpUserName.value || !wvpPassword.value) {
		throw new Error("WVP账号或密码为空");
	}
}

/**
 * 取流地址链路：
 * 1) WVP 登录拿 token
 * 2) 用 token 调 start 接口拿 flv 地址
 * 为什么每次播放都走一次 start：
 * - 这样能确保拿到当前有效流地址，降低“历史地址过期”导致的黑屏概率。
 */
async function getWvpFlvUrl(nodeCode: string) {
	if (!nodeCode) {
		throw new Error("监控点位编码为空");
	}
	await ensureWvpCredential();
	if (!wvpToken.value) {
		const loginRes = await requestByUni<any>({
			url: buildWvpRequestUrl(
				`/wvp/api/user/login?username=${encodeURIComponent(wvpUserName.value)}&password=${encodeURIComponent(wvpPassword.value)}`,
			),
			method: "GET",
		});
		const token = loginRes?.data?.data?.accessToken || "";
		if (!token) {
			const loginMsg = loginRes?.data?.msg || loginRes?.data?.message || "";
			const loginCode = loginRes?.data?.code;
			throw new Error(loginMsg || `WVP登录失败(code=${String(loginCode ?? "unknown")})`);
		}
		wvpToken.value = token;
	}

	const startRes = await requestByUni<any>({
		url: buildWvpRequestUrl(
			`/wvp/api/play/start/${encodeURIComponent(nodeCode)}/${encodeURIComponent(nodeCode)}`,
		),
		method: "GET",
		header: {
			"Access-Token": wvpToken.value,
		},
	});

	if (startRes?.data?.code !== 0) {
		// token 可能过期，这里清空让下一次自动重新登录。
		wvpToken.value = "";
		throw new Error(startRes?.data?.msg || "视频取流失败，请检查点位配置");
	}
	const stream = startRes?.data?.data || {};
	/**
	 * 播放地址优先级：
	 * - 移动端优先 HLS(m3u8)，兼容性通常高于 flv；
	 * - flv 放在最后兜底，避免“取流成功但无画面”。
	 */
	const playableUrl = String(
		stream?.hls ||
			stream?.http_hls ||
			stream?.m3u8 ||
			stream?.fmp4 ||
			stream?.http_fmp4 ||
			stream?.flv ||
			stream?.http_flv ||
			"",
	);
	if (!playableUrl) {
		throw new Error("未获取到可播放地址");
	}
	return playableUrl;
}

function formatNow() {
	const date = new Date();
	const pad = (v: number) => String(v).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * H5 按你的要求改成“页面内全屏层播放”，不再走浏览器原生全屏。
 */
function openPagePlayer(url: string, title: string, mineName: string) {
	pagePlayerUrl.value = url;
	pagePlayerTitle.value = title || "视频播放";
	pagePlayerMineName.value = mineName || "未分配工地";
	pagePlayerTimeText.value = formatNow();
	pagePlayerVisible.value = true;
	if (playerClockTimer) clearInterval(playerClockTimer);
	playerClockTimer = setInterval(() => {
		pagePlayerTimeText.value = formatNow();
	}, 1000);
}

function closePagePlayer() {
	pagePlayerVisible.value = false;
	pagePlayerUrl.value = "";
	pagePlayerPreparing.value = false;
	if (playerClockTimer) {
		clearInterval(playerClockTimer);
		playerClockTimer = null;
	}
}

async function playFromList(item: MonitoringVideoViewItem) {
	if (playLoadingKey.value || pagePlayerPreparing.value) return;
	playLoadingKey.value = `list-${item.id}`;
	pagePlayerPreparing.value = true;
	openPagePlayer("", item.monitorName, item.siteName);
	try {
		const flvUrl = await getWvpFlvUrl(item.nodeCode);
		/**
		 * 所有端统一使用页面内“沉浸层播放器”：
		 * 为什么这样做：
		 * - 真机原生全屏不会保留业务叠加信息（摄像头名称、时间）；
		 * - 统一交互后可稳定展示顶部信息，且避免不同端全屏行为不一致。
		 * - 同时在进入沉浸层前清空列表内预览播放器，避免页面上出现“双播放器并发播放”。
		 */
		playingItemId.value = "";
		playingVideoUrl.value = "";
		pagePlayerUrl.value = flvUrl;
	} catch (error: any) {
		console.error("列表视频播放失败", error);
		closePagePlayer();
		uni.showToast({
			title: error?.message || error?.errMsg || "视频播放失败",
			icon: "none",
		});
	} finally {
		pagePlayerPreparing.value = false;
		playLoadingKey.value = "";
	}
}

async function playFromGrid(item: MonitoringVideoViewItem) {
	if (playLoadingKey.value || pagePlayerPreparing.value) return;
	playLoadingKey.value = `grid-${item.id}`;
	pagePlayerPreparing.value = true;
	openPagePlayer("", item.monitorName, item.siteName);
	try {
		const flvUrl = await getWvpFlvUrl(item.nodeCode);
		gridPlayingVideoUrl.value = flvUrl;
		pagePlayerUrl.value = flvUrl;
	} catch (error: any) {
		console.error("宫格视频播放失败", error);
		closePagePlayer();
		uni.showToast({
			title: error?.message || error?.errMsg || "视频播放失败",
			icon: "none",
		});
	} finally {
		pagePlayerPreparing.value = false;
		playLoadingKey.value = "";
	}
}
</script>

<style scoped lang="scss">
.video-page {
	margin: 16rpx 20rpx 0;
	padding: 20rpx;
	background: linear-gradient(180deg, #f6f8fc 0%, #ffffff 100%);
	border-radius: 21rpx;
	border: 2rpx solid #ffffff;
	min-height: calc(100vh - 340rpx);
}

.video-mode-switch {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 14rpx;
	margin-bottom: 18rpx;
}

.mode-segment-btn {
	min-width: 28rpx;
	height: 64rpx;
	border-radius: 20rpx;
	padding: 0 18rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	background: #fff;
	border: 2rpx solid #c6d7ff;
	box-shadow: 0 4rpx 10rpx rgba(198, 215, 255, 0.3);
}

.mode-segment-btn.active {
	background: linear-gradient(135deg, rgba(68, 116, 255, 0.18) 0%, rgba(68, 116, 255, 0.08) 100%);
	border-color: #8eb0ff;
}

.mode-mark {
	display: flex;
	flex-shrink: 0;
}

.mode-mark-list {
	flex-direction: column;
	gap: 4rpx;
	width: 24rpx;

	.line {
		height: 4rpx;
		border-radius: 8rpx;
		background: #4474ff;
	}
}

.mode-mark-grid {
	width: 24rpx;
	height: 24rpx;
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 4rpx;

	.cell {
		background: #4474ff;
		border-radius: 4rpx;
	}
}

.mode-text {
	font-size: 24rpx;
	font-weight: 600;
	color: #4474ff;
}

.state-wrap {
	height: 280rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 14rpx;
}

.state-text {
	font-size: 24rpx;
	color: #909399;
}

.video-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.video-list-card {
	background: #fff;
	border: 2rpx solid #e8ecf4;
	border-radius: 18rpx;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(75, 120, 250, 0.2);
}

.row-main {
	min-height: 92rpx;
	display: flex;
	align-items: center;
	padding: 0 20rpx;
	gap: 14rpx;
}

.dot {
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.dot-online {
	background: #16b84e;
}

.dot-offline {
	background: #6b7280;
}

.monitor-name {
	flex: 1;
	min-width: 0;
	font-size: 28rpx;
	font-weight: 600;
	color: #1f2937;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.site-name {
	flex: 1;
	min-width: 0;
	font-size: 26rpx;
	color: #374151;
	text-align: center;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.status-text {
	font-size: 26rpx;
	font-weight: 600;
}

.status-online {
	color: #10b981;
}

.status-offline {
	color: #6b7280;
}

.expand-panel {
	padding: 0 20rpx 20rpx;
}

.preview-box {
	position: relative;
	width: 100%;
	height: 320rpx;
	border-radius: 14rpx;
	overflow: hidden;
	background: #eef2ff;
}

.preview-placeholder,
.preview-video {
	width: 100%;
	height: 100%;
}

.preview-placeholder {
	background: linear-gradient(180deg, #0d2f79 0%, #112e68 100%);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
}

.play-circle {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.14);
	border: 2rpx solid rgba(255, 255, 255, 0.35);
	display: flex;
	align-items: center;
	justify-content: center;
}

.play-triangle {
	width: 0;
	height: 0;
	border-top: 14rpx solid transparent;
	border-bottom: 14rpx solid transparent;
	border-left: 24rpx solid #ffffff;
	margin-left: 6rpx;
}

.play-tip {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.92);
}

.preview-mask {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 12rpx 16rpx;
	background: linear-gradient(180deg, rgba(17, 24, 39, 0) 0%, rgba(17, 24, 39, 0.7) 100%);
}

.preview-mask-text {
	font-size: 24rpx;
	color: #fff;
}

.play-loading-mask {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	background: rgba(7, 14, 32, 0.55);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	z-index: 6;
}

.play-loading-text {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.92);
}

.page-player-loading-mask {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	z-index: 15;
	background: rgba(4, 10, 26, 0.68);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
}

.page-player-loading-text {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.92);
}

.video-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16rpx;
}

.grid-card {
	position: relative;
	height: 240rpx;
	border-radius: 16rpx;
	overflow: hidden;
	border: 2rpx solid #e8ecf4;
	box-shadow: 0 2px 8px rgba(75, 120, 250, 0.2);
}

.grid-cover {
	width: 100%;
	height: 100%;
	background: linear-gradient(180deg, #0d2f79 0%, #112e68 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.grid-play-circle {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.14);
	border: 2rpx solid rgba(255, 255, 255, 0.35);
	display: flex;
	align-items: center;
	justify-content: center;
}

.grid-play-triangle {
	width: 0;
	height: 0;
	border-top: 10rpx solid transparent;
	border-bottom: 10rpx solid transparent;
	border-left: 16rpx solid #ffffff;
	margin-left: 4rpx;
}

.grid-mask {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 12rpx;
	background: linear-gradient(180deg, rgba(17, 24, 39, 0) 0%, rgba(17, 24, 39, 0.78) 100%);
}

.grid-line {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10rpx;
}

.grid-title {
	font-size: 26rpx;
	color: #fff;
	font-weight: 600;
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.grid-site {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.9);
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.grid-status {
	font-size: 22rpx;
	font-weight: 600;
	flex-shrink: 0;
}

.global-hidden-video {
	position: fixed;
	left: -9999px;
	top: -9999px;
	width: 2px;
	height: 2px;
	opacity: 0;
	pointer-events: none;
}

.page-player-mask {
	position: fixed;
	z-index: 9999;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(9, 17, 36, 0.98);
	display: flex;
	flex-direction: column;
}

.page-player-close-fab {
	position: absolute;
	right: 24rpx;
	z-index: 20;
	min-width: 40rpx;
	height: 40rpx;
	padding: 0 14rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 50rpx;
	line-height: 1;
	color: #fff;
	background: rgba(255, 255, 255, 0.12);
	border: 2rpx solid rgba(255, 255, 255, 0.2);
	border-radius: 42rpx;
}

.page-player-body {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24rpx 20rpx 20rpx;
	position: relative;
}

.page-player-video-shell {
	position: relative;
	width: 100%;
	height: 0;
	padding-top: 56.25%;
	max-height: calc(100vh - 160rpx);
}

.page-player-video {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: #000;
	border-radius: 12rpx;
}

.player-overlay {
	position: absolute;
	left: 32rpx;
	right: 32rpx;
	display: flex;
	justify-content: space-between;
	pointer-events: none;
}

.player-overlay-top {
	top: 18rpx;
}

.player-overlay-bottom {
	bottom: 30rpx;
	justify-content: flex-start;
}

.player-overlay-chip {
	max-width: 60%;
	padding: 8rpx 14rpx;
	font-size: 22rpx;
	color: #fff;
	background: rgba(0, 0, 0, 0.45);
	border-radius: 8rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>

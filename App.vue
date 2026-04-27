<script setup lang="ts">
import { useStore } from "/@/cool";
import { onLaunch, onShow, onHide,onReady } from "@dcloudio/uni-app";

onLaunch(() => {
	console.log("App Launch");

	const { dict, user } = useStore();

	// 获取字典
	// dict.refresh();

	if (user.token) {
		// 获取登录用户信息
		// user.get();
	}
});

onShow(() => {
	console.log("App Show");
});

onReady(() => {
	//动态修改状态栏的颜色
	uni.setNavigationBarColor({
		frontColor: '#fff',
		backgroundColor: '#fff'
	})
})

onHide(() => {
	console.log("App Hide");
});
</script>

<style lang="scss">
@import "/$/cool-ui/index.scss";
@import "/@/static/css/index.scss";
</style>

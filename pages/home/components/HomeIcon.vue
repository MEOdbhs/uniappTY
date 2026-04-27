<template>
	<image
		class="hicon"
		:src="dataUrl"
		mode="aspectFit"
		:style="wrapStyle"
		:show-menu-by-longpress="false"
	/>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { homeIconDataUrl, type HomeIconName } from "./iconData"

const props = withDefaults(
	defineProps<{
		name: HomeIconName
		size?: number
		color?: string
	}>(),
	{ size: 24, color: "" }
)

const wrapStyle = computed(() => {
	const s = props.size
	return { width: `${s}rpx`, height: `${s}rpx` }
})

const dataUrl = computed(() => {
	const c = !props.color || props.color === "currentColor" ? "#4f46e5" : props.color
	return homeIconDataUrl(props.name, c)
})
</script>

<style lang="scss" scoped>
.hicon {
	display: block;
	flex-shrink: 0;
}
</style>

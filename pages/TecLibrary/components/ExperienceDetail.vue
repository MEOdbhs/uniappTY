<template>
	<!-- 根据 source 分发到不同的详情页 -->
	<ExperienceDetailManual v-if="props.source === 'manual'" :id="props.id" />
	<ExperienceDetailSystem v-else :id="props.id" />
</template>

<script lang="ts" setup>
import ExperienceDetailManual from "./ExperienceDetailManual.vue";
import ExperienceDetailSystem from "./ExperienceDetailSystem.vue";

interface Props {
	id: string;
	source?: string;
}

const props = withDefaults(defineProps<Props>(), {
	source: "system",
});
</script>

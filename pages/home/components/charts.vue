<template>
    <view class="cart-page">
        <qiun-data-charts :type="props.cartType" :opts="computedOpts" :chartData="resolvedChartData"
            :tooltipShow="props.showTooltip" :ontouch="ontouch" :tooltipFormat="tooltipFormat" />
    </view>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
    defineProps<{
        tooltipFormat?: string
        opts?: any
        userData?: any
        chartData?: any
        cartType?: string
        colors?: string[]
        showLegend?: boolean
        showTooltip?: boolean
        ontouch?: boolean
    }>(),
    {
        opts: () => ({
            xAxis: { disableGrid: true, fontColor: '#fff' },
            yAxis: { data: [{ min: 0 }] },
            legend: { show: true, iconHeight: 4 },
            extra: { column: { type: "group", width: "14" } },
        }),
        userData: () => ({ categories: [], series: [] }),
        cartType: "column",
        colors: () => [],
        showLegend: true,
        showTooltip: true,
        ontouch: false,
    }
)

const computedOpts = computed(() => {
    const base: any = props.opts || {}
    const legend: any = { ...(base.legend || {}), show: props.showLegend }
    if (legend.position === undefined) legend.position = "top"
    if (legend.float === undefined) legend.float = "left"
    if (legend.margin === undefined) legend.margin = "12"
    // legend.padding = "10";
    const color =
        Array.isArray(props.colors) && props.colors.length > 0 ? props.colors : base.color
    return {
        ...base,
        legend,
        ...(color ? { color } : {}),
    }
})

const resolvedChartData = computed(() => {
    const data = props.chartData ?? props.userData
    return data ?? { categories: [], series: [] }
})
</script>

<style scoped lang="scss">
.cart-page {
    width: 100%;
    height: 100%;
}
</style>

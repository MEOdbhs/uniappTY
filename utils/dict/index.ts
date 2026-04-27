import { ref, toRefs } from "vue"
import { service } from "/@/cool";

export function getDicts(dictType) {
    return service.request({
        url: '/system/dict/data/type/' + dictType,
        method: 'GET',
    })
}
export function useDict(...args) {
    const res = ref({})
    return (() => {
        args.forEach((dictType, index) => {
            res.value[dictType] = []
            getDicts(dictType).then(resp => {
                res.value[dictType] = resp?.map(p => ({ label: p.dictLabel, value: p.dictValue, elTagType: p.listClass, elTagClass: p.cssClass }))
            })
        })
        return toRefs(res.value)
    })()
}
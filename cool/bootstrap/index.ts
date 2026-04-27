import { createPinia } from "pinia";
import { createEps } from "./eps";
import { createModules } from "./modules";
import { type App } from "vue";
import { watch, type WatchStopHandle } from "vue";
import { useStore } from "../store";

// 全局按钮权限指令：v-hasPermi="['defectReport:report']"
function hasPermission(value: any, permissions: string[]): boolean {
	if (permissions.length === 0 || value == null) {
		return false;
	}
	if (permissions.length === 1 && permissions[0] == "*:*:*") {
		return true;
	}
	let needPerms: string[] = [];

	if (Array.isArray(value)) {
		needPerms = value as string[];
	} else if (typeof value === "string" && value.length > 0) {
		needPerms = [value];
	}

	if (needPerms.length === 0) {
		return false;
	}

	for (let i = 0; i < needPerms.length; i++) {
		const code = needPerms[i];
		if (permissions.indexOf(code) !== -1) {
			return true;
		}
	}

	return false;
}

function handlePermi(el: HTMLElement, binding: any, permissions: string[]) {
	const hasPerm = hasPermission(binding.value, permissions);
	const isHidden = (el as any).__hasPermiHidden;

	if (!hasPerm) {
		// 无权限时隐藏元素
		if (!isHidden) {
			const currentStyle = el.getAttribute("style") || "";
			el.setAttribute("style", currentStyle + "display: none !important;");
			(el as any).__hasPermiHidden = true;
		}
	} else {
		// 有权限时显示元素
		if (isHidden) {
			let styleAttr = el.getAttribute("style") || "";
			styleAttr = styleAttr.replace(/display\s*:\s*none\s*!important;?/gi, "");
			if (styleAttr.trim()) {
				el.setAttribute("style", styleAttr);
			} else {
				el.removeAttribute("style");
			}
			(el as any).__hasPermiHidden = false;
		}
	}
}

export async function bootstrap(app: App) {
	// 状态共享存储
	app.use(createPinia());

	// 注册权限指令
	app.directive("hasPermi", {
		mounted(el: HTMLElement, binding: any) {
			const { user } = useStore();
			let stopWatch: WatchStopHandle | null = null;

			// 使用 watch 响应式监听权限变化（Vue 3 Composition API）
			// 监听 user.permissions 的变化，当权限数据加载完成后自动更新元素显示状态
			stopWatch = watch(
				() => user.permissions, // 监听权限数组
				(permissions) => {
					const perms = permissions || [];
					handlePermi(el, binding, perms);
				},
				{
					immediate: true, // 立即执行一次，确保初始状态正确
					deep: true, // 深度监听数组变化
				}
			);

			// 将 stopWatch 存储到元素上，以便在卸载时清理
			(el as any).__hasPermiWatch = stopWatch;
		},
		updated(el: HTMLElement, binding: any) {
			const { user } = useStore();
			const permissions = user.permissions || [];
			handlePermi(el, binding, permissions);
		},
		unmounted(el: HTMLElement) {
			// 清理 watch 监听器
			const stopWatch = (el as any).__hasPermiWatch;
			if (stopWatch) {
				stopWatch();
				delete (el as any).__hasPermiWatch;
			}
		},
	});

	// 创建 EPS
	createEps();

	// 创建 uni_modules
	createModules();
}

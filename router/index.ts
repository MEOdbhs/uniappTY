import { router, useStore } from "/@/cool";

// 无需 token 即可访问的页面（登录相关页面）
const publicPages = [
	"/pages/user/login",
	"/pages/user/captcha",
	"/pages/user/doc",
	"/pages/user/register",
];

// 判断是否为公开页面（无需登录）
function isPublicPage(path: string): boolean {
	// 登录相关页面
	if (publicPages.includes(path)) {
		return true;
	}

	// demo 页面（开发调试用）
	if (path.startsWith("/pages/demo")) {
		return true;
	}

	return false;
}

router.beforeEach((to, next) => {
	const { user } = useStore();

	// 如果是公开页面，直接放行
	if (isPublicPage(to.path)) {
		next();
		return;
	}

	// 非公开页面需要 token
	if (user.token) {
		// 有 token，允许访问
		next();
	} else {
		// 没有 token，强制跳转到登录页（使用 reLaunch 清空页面栈）
		router.login({ reLaunch: true });
	}
});

/**
 * 构建 SVG 字符串，供 `image` 的 data URL 使用（App Android 对模板内联 svg 支持差，见 HomeIcon）
 */

export type HomeIconName =
	| "user"
	| "bell"
	| "alert"
	| "chevron-right"
	| "barchart"
	| "video"
	| "book"
	| "settings"
	| "upload"
	| "clipboard"
	| "package"
	| "hardhat"

function wrap(c: string, body: string, strokeWidth = 2.5) {
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">` +
		`<g fill="none" stroke="${c}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">` +
		body +
		`</g></svg>`
	)
}

export function buildHomeIconSvg(name: HomeIconName, color: string): string {
	const c = !color || color === "currentColor" ? "#4f46e5" : color
	switch (name) {
		case "user":
			return wrap(
				c,
				`<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`
			)
		case "bell":
			return wrap(
				c,
				`<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>`
			)
		case "alert":
			return wrap(
				c,
				`<path d="m21.73 18-2-14A2 2 0 0 0 17.8 3h-9.6a2 2 0 0 0-1.99 1.8l-1.99 14.2A2 2 0 0 0 6.2 22h11.6a2 2 0 0 0 1.94-1.9Z"/>` +
					`<line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`
			)
		case "chevron-right":
			return wrap(c, `<path d="m9 18 6-6-6-6"/>`)
		case "barchart": {
			return (
				`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">` +
				`<g fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">` +
				`<path d="M3 3v18h18"/>` +
				`<path d="M18 17V9"/>` +
				`<path d="M13 17V5"/>` +
				`<path d="M8 17v-3"/>` +
				`</g></svg>`
			)
		}
		case "video": {
			return (
				`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">` +
				`<g fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">` +
				`<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/>` +
				`<rect x="2" y="6" width="14" height="12" rx="2"/>` +
				`</g></svg>`
			)
		}
		case "book":
			return wrap(
				c,
				`<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>` + `<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`
			)
		case "settings": {
			const sw = 2
			return (
				`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">` +
				`<g fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">` +
				`<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>` +
				`<circle cx="12" cy="12" r="3"/>` +
				`</g></svg>`
			)
		}
		case "upload":
			return wrap(
				c,
				`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>` +
					`<polyline points="17 8 12 3 7 8"/>` +
					`<line x1="12" y1="3" x2="12" y2="15"/>`
			)
		case "clipboard":
			return wrap(
				c,
				`<rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>` +
					`<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>` +
					`<path d="M9 14l2 2 4-4"/>`
			)
		case "package":
			return wrap(
				c,
				`<path d="m7.5 4.27 9 5.15"/>` +
					`<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>` +
					`<path d="m3.3 7 8.7 5 8.7-5"/>` +
					`<path d="M12 22V12"/>`
			)
		case "hardhat":
			return wrap(
				c,
				`<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/>` +
					`<path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/>` +
					`<path d="M4 15v-3a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v3"/>`
			)
		default:
			return buildHomeIconSvg("user", c)
	}
}

export function homeIconDataUrl(name: HomeIconName, color: string): string {
	return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(buildHomeIconSvg(name, color))
}

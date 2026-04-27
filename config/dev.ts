import { host } from "./proxy";

export default {
	host,

	get baseUrl() {
		// #ifdef H5
		return "/company";
		// #endif
		// #ifndef H5
		const h = (this.host as string).replace(/\/$/, "");
		return `${h}/company`;
		// #endif
	},
};

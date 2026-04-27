import { useUserStore } from "./user";
import { useDictStore } from "./dict";
import { useProjectStore } from "./project";

export function useStore() {
	return {
		user: useUserStore(),
		dict: useDictStore(),
		project: useProjectStore(),
	};
}

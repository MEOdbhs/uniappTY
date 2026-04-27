import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { storage } from "../utils";
import { getCurrentInstance } from "vue";

type ProjectItem = {
	id?: string | number;
	projectName?: string;
	[key: string]: any;
};

// 读取本地缓存
const data = storage.info();

const useProjectStore = defineStore("project", function () {
	// 项目列表
	const list = ref<ProjectItem[]>(data.projectList || []);

	// 当前项目 id
	const currentProjectId = ref<string | number | undefined>(data.currentProjectId);

	// 当前项目对象
	const currentProject = computed<ProjectItem | undefined>(() => {
		return list.value.find((item) => item.id === currentProjectId.value);
	});

	// 设置项目列表
	function setList(value: ProjectItem[] = []) {
		list.value = value || [];
		storage.set("projectList", list.value);

		// 若未选择当前项目，默认选中第一个
		if (!currentProjectId.value && list.value.length) {
			setCurrentProjectId(list.value[0].id);
		}
	}

	// 设置当前项目
	function setCurrentProjectId(id?: string | number) {
		const oldId = currentProjectId.value;
		currentProjectId.value = id;
		if (id === undefined || id === null) {
			storage.remove("currentProjectId");
		} else {
			storage.set("currentProjectId", id);
		}

		// 如果项目发生变更，触发全局事件
		if (oldId !== id) {
			uni.$emit("projectChanged", {
				oldProjectId: oldId,
				newProjectId: id,
				timestamp: Date.now(),
			});
		}
	}

	// 清空缓存
	function clear() {
		list.value = [];
		currentProjectId.value = undefined;
		storage.remove("projectList");
		storage.remove("currentProjectId");
	}

	return {
		list,
		currentProjectId,
		currentProject,
		setList,
		setCurrentProjectId,
		clear,
	};
});

export { useProjectStore };

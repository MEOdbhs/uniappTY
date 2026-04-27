import { defineStore } from "pinia";
import { ref } from "vue";
import { getAppVersionList } from "/@/pages/user/components/login/api";
import { addDomainPrefix } from "/@/cool/utils";

// 方式一，创建缓存方式
export const useTest = defineStore("test", () => {
  const data = ref();

  return {
    data,
  };
});

// 方式2
export function useTest2() {
  const data = ref();

  return {
    data,
  };
}

/**
 * 比较两个版本号
 * @param {string} version1 版本号1
 * @param {string} version2 版本号2
 * @returns {number} 如果version1 > version2返回1，version1 < version2返回-1，相等返回0
 */
export function compareVersion(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(v => parseInt(v) || 0);
  const v2Parts = version2.split('.').map(v => parseInt(v) || 0);
  
  const maxLength = Math.max(v1Parts.length, v2Parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;
    
    if (v1 > v2) return 1;
    if (v1 < v2) return -1;
  }
  
  return 0;
}

/**
 * 获取应用版本号
 * 优先使用 plus.runtime.version API 获取，不再使用配置中的写死版本号
 * @returns {string} 版本号
 */
export function getAppVersion(): string {
  // #ifdef APP-PLUS
  // 在 App 环境下使用 plus.runtime.version 获取版本号
  // @ts-ignore
  if (typeof plus !== "undefined" && plus.runtime) {
    // @ts-ignore
    return plus.runtime.version || "0.0.1";
  }
  // #endif

  // 非 App 环境或获取失败时，返回默认版本号
  return "0.0.1";
}

/**
 * 安装 APK 文件
 * @param {string} filePath APK 文件路径
 */
export function installApk(filePath: string) {
  // #ifdef APP-PLUS
  // 在 App 环境下使用 plus.runtime.install 安装 APK
  // @ts-ignore
  if (typeof plus !== "undefined" && plus.runtime) {
    // @ts-ignore
    plus.runtime.install(
      filePath,
      {
        force: false, // 是否强制安装
      },
      () => {
        uni.showToast({
          title: "安装包安装成功",
          icon: "success",
        });
      },
      (error: any) => {
        console.error("安装失败：", error);
        uni.showToast({
          title: "安装失败，请手动安装",
          icon: "none",
          duration: 3000,
        });
        // 安装失败时尝试打开文件管理器让用户手动安装
        uni.openDocument({
          filePath: filePath,
          success: () => {
            console.log("已打开文件管理器");
          },
          fail: () => {
            console.error("无法打开安装包");
          },
        });
      },
    );
  } else {
    // 如果 plus 对象不存在，尝试打开文件管理器
    uni.openDocument({
      filePath: filePath,
      success: () => {
        uni.showToast({
          title: "请手动安装更新包",
          icon: "none",
        });
      },
      fail: () => {
        uni.showToast({
          title: "无法打开安装包",
          icon: "none",
        });
      },
    });
  }
  // #endif

  // #ifndef APP-PLUS
  // 非 App 环境（H5、小程序等）提示用户手动下载
  uni.showToast({
    title: "请手动下载并安装更新包",
    icon: "none",
  });
  // #endif
}

/**
 * 检查应用版本并下载更新
 * 使用 plus.runtime.version 获取当前版本号，不再使用配置中的写死版本号
 */
export async function checkAppVersion(type?: string) {
  try {
    uni.showLoading({
      title: "检查更新中...",
      mask: true,
    });

    const list: any = await getAppVersionList();

    uni.hideLoading();

    if (!Array.isArray(list) || list.length === 0) {
      uni.showToast({
        title: "暂无版本信息",
        icon: "none",
      });
      return;
    }

    const latest = list[0] || {};
    const serverVersion: string | undefined = latest.versionNum;
    const localVersion: string = getAppVersion();

    // 任一版本不存在则不处理
    if (!serverVersion || !localVersion) {
      uni.showToast({
        title: "版本信息异常",
        icon: "none",
      });
      return;
    }

    // 比较版本号，判断服务器版本是否大于本地版本
    const versionCompare = compareVersion(serverVersion, localVersion);
    
    // 如果版本相同且不是登录时检查，提示已是最新版本
    if (versionCompare === 0 && type !== "login") {
      uni.showToast({
        title: "已是最新版本",
        icon: "none",
      });
      return;
    }

    // 服务器版本大于本地版本时触发下载
    if (versionCompare > 0) {
      const fileUrl: string | undefined = latest.versionFileUrl;
      if (!fileUrl) {
        uni.showToast({
          title: "更新包地址不存在",
          icon: "none",
        });
        return;
      }

      const downloadUrl = addDomainPrefix(fileUrl);

      // 显示下载提示
      uni.showModal({
        title: "发现新版本",
        content: `检测到新版本 ${serverVersion}，当前版本 ${localVersion}，是否立即更新？`,
        confirmText: "立即更新",
        cancelText: "稍后更新",
        success: (modalRes) => {
          if (modalRes.confirm) {
            // 跳转到更新页面进行下载
            uni.navigateTo({
              url: `/pages/update/index?url=${encodeURIComponent(downloadUrl)}`,
            });
          }
        },
      });
    } else if (versionCompare < 0) {
      // 服务器版本小于本地版本，说明本地版本更新
      console.log(`本地版本 ${localVersion} 高于服务器版本 ${serverVersion}`);
    }
  } catch (err) {
    uni.hideLoading();
    console.error("检查版本更新失败：", err);
    uni.showToast({
      title: "检查更新失败",
      icon: "none",
      duration: 3000,
    });
  }
}

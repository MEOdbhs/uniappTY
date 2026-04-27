# 安卓鸿蒙 Excel 导入与 content:// 修复计划

## 一、Summary（目标概述）

* 目标：在 `pages/monitoringData/components/manualImport.vue` 完成真机 App（Android + 鸿蒙）Excel 文件选择与上传，调用接口 `/companyApp/DeviceSafeCheck/importMonitorData`。

* 关键问题：Android 10+（含鸿蒙类 Android 文件提供机制）选择本地文件时常返回 `content://`，直接用于 `uni.uploadFile` 可能失败或上传内容异常。

* 解决主线：

  1. 引入并使用 `sr-file-choose` 插件完成 App 端通用文件选择；
  2. 按 `pages/monitoringData/a.md` 在插件原生层增加 URI 转本地缓存文件能力（输出 `file://`）；
  3. 在业务侧封装 `utils/importFile.ts`，统一处理鉴权、参数、上传响应与错误；
  4. 页面层 `manualImport.vue` 对接“选文件 + 提交导入”完整链路。

## 二、Current State Analysis（现状分析）

* 已确认文件：

  * `utils/importFile.ts` 当前仅有注释，占位未实现。

  * `pages/monitoringData/components/manualImport.vue` 中 `chooseExcelFile()` 为空；`submitImport()` 已调用 `importManualMonitorData(...)`，但当前文件未看到对应导入实现，存在未完成链路风险。

  * `pages/monitoringData/api.md` 已给出导入接口：`POST /companyApp/DeviceSafeCheck/importMonitorData`，关键参数 `deviceCode`、`siteCode`、`file`。

  * `pages/monitoringData/a.md` 已给出 content URI 根因及插件内修复方案（新增 `uri2path.kt` + 修改 `index.uts`）。

* 全局复用能力：

  * 项目已有 `request` 封装（`cool/service/request.ts`）在普通请求中使用 `Authorization: Bearer <token>`。

  * 项目已有多个 `uni.uploadFile` 使用样例，具备“直接上传 + 解析 JSON 返回 + toast 提示”的通用模式。

* 关键事实与约束（已确认）：

  * 插件 `sr-file-choose` **尚未导入仓库**（`uni_modules` 下未发现）。

  * 平台范围：本次按“安卓 + 鸿蒙”纳入计划。

  * 鉴权：`uni.uploadFile` 使用 `Authorization: Bearer <token>`。

  * 本期只上传 Excel 主文件（`file`），`fileImg` 不实现，仅预留扩展位。

## 三、Proposed Changes（拟改造内容）

### 1）插件接入与原生 URI 修复（新增/修改 `uni_modules/sr-file-choose`）

* 为什么改：

  * 业务层无法稳定把 `content://` 直接用于上传；

  * 该问题必须在原生侧把内容流复制为缓存文件并返回 `file://` 才能稳定上传。

* 怎么改：

  * 先通过 HBuilderX 插件市场导入 `sr-file-choose` 到 `uni_modules/sr-file-choose`（仓库可见）。

  * 在插件 Android 目录（与 `index.uts` 同级）新增 `uri2path.kt`，实现 `getFilePathFromUri(context, uri, fileName)`：

    * 使用 `contentResolver.openInputStream(uri)` 读取文件流；

    * 复制到 `context.cacheDir`；

    * 返回 `file://` + 本地绝对路径。

  * 修改插件 `index.uts` 成功回调组包逻辑：

    * 将原始 `uri` 路径替换为 `getFilePathFromUri(...)` 的转换结果；

    * 回传 `name/size/path`，其中 `path` 为可上传路径。

* 鸿蒙说明：

  * 优先确认插件当前鸿蒙实现是否也会返回不可直传 URI；若存在同类路径协议问题，则按该平台实现补充“转本地缓存文件”分支；

  * 若插件鸿蒙侧已直接返回可上传本地路径，则仅 Android 做转换即可（计划执行时按插件源码实际结构落地）。

### 2）上传能力封装（实现 `utils/importFile.ts`）

* 为什么改：

  * 上传逻辑集中在工具层，避免页面直接处理 `uni.uploadFile` 细节；

  * 满足后续复用与统一错误处理，降低页面耦合。

* 怎么改（函数设计）：

  * 导出 `importManualMonitorDataByUpload(options)`（命名可按现有风格微调）：

    * 入参：`deviceCode`、`siteCode`、`filePath`、`fileName`、可选 `timeout`；

    * 校验：`filePath` 必须存在且是 `file://` 或本地可读路径；

    * 组装 URL：`config.baseUrl + /companyApp/DeviceSafeCheck/importMonitorData`（保持与现有服务基地址一致）；

    * 组装 Header：`Authorization: Bearer ${user.token}`；

    * 调用 `uni.uploadFile`：

      * `name: "file"`

      * `formData: { deviceCode, siteCode }`

    * 响应处理：

      * 解析 `res.data` JSON；

      * 按项目约定解析 `status/success/message/data`；

      * 非成功态抛出可读错误，供页面 toast。

  * 代码注释重点说明“为什么这样做”（尤其是 content URI、鉴权格式、统一错误处理原因）。

### 3）页面接线（修改 `pages/monitoringData/components/manualImport.vue`）

* 为什么改：

  * 当前页面只有 UI 与提交骨架，缺少文件选择实现，导入链路未打通。

* 怎么改：

  * 补充导入：

    * 从 `uni_modules/sr-file-choose` 引入文件选择方法（以插件实际导出名为准）；

    * 从 `utils/importFile.ts` 引入上传方法；

    * 若 `importManualMonitorData` 在 `api.ts` 已/将保留，统一命名避免冲突。

  * 实现 `chooseExcelFile()`：

    * 仅允许 `.xls/.xlsx`；

    * 成功后填充 `selectedFile = { name, size, path }`；

    * 对取消选择、格式不符、插件异常分别给出清晰提示。

  * 强化 `submitImport()`：

    * 保持现有前置校验（工地、设备、文件、deviceCode、防重复提交）；

    * 调用 `utils/importFile.ts` 上传；

    * 成功后刷新历史、提示成功；失败展示后端 message 或兜底文案。

  * 平台兼容分支（必要时）：

    * App-Android / App-鸿蒙走插件选文件；

    * 非目标平台给出“暂不支持”提示，避免误用。

### 4）接口文档对齐说明（`pages/monitoringData/api.md`）

* 本次不改动接口文档字段定义，只按文档落实请求参数：

  * query/form-data 业务字段：`deviceCode`、`siteCode`；

  * 文件字段：`file`；

  * `fileImg` 本期不实现但保留可扩展位置（在工具函数入参预留注释）。

## 四、Assumptions & Decisions（假设与决策）

* 已决策：

  * 插件当前未导入仓库，需先导入再开发；

  * 本次目标平台为 Android + 鸿蒙；

  * 上传鉴权为 `Bearer token`；

  * 本期只传 `file`，不上传 `fileImg`。

* 执行期关键假设（若不成立需即时调整）：

  * `sr-file-choose` 实际导出的 API 可返回 `name/size/path`；

  * 插件源码目录含可编辑的 Android UTS/Kotlin 入口（用于接入 `uri2path.kt`）；

  * 鸿蒙端若出现非直传路径，插件存在可扩展处理点。

## 五、Verification（验证与验收步骤）

### A. 功能验收（真机）

1. 在 Android 真机选择 `.xlsx` 文件，页面显示文件名和大小；
2. 提交后请求命中 `/companyApp/DeviceSafeCheck/importMonitorData`，携带：

   * Header：`Authorization: Bearer xxx`

   * FormData：`deviceCode`、`siteCode`

   * File 字段：`file`
3. 后端返回成功时，页面提示“导入成功”，历史记录刷新；
4. 文件为 `content://` 来源时，仍可稳定上传（说明 URI 转换生效）。

### B. 异常验收

1. 未选工地/设备/文件时，阻断提交且提示明确；
2. 选择非 Excel 文件时，阻断并提示格式限制；
3. 后端返回业务失败时，页面展示后端 message；
4. 网络异常/鉴权异常时，展示兜底错误并解除提交锁。

### C. 构建与生效要求

1. 插件原生代码变更后，必须重新制作自定义调试基座或云打包；
2. 仅热重载无法验证 Kotlin/UTS 变更，需在新基座中回归测试 Android（必要时鸿蒙）真机。

## 六、实施顺序（执行时）

1. 导入 `sr-file-choose` 插件到 `uni_modules`；
2. 按 `a.md` 完成插件原生 URI 转换改造；
3. 实现 `utils/importFile.ts` 上传封装；
4. 修改 `manualImport.vue` 接线；
5. 真机回归：Android -> 鸿蒙；
6. 记录验证结果与遗留项（若鸿蒙无需额外转换则标注原因）。


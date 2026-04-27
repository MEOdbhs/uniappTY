## 人工监测数据-导入记录查询

**接口地址**:`/companyApp/DeviceSafeCheck/findImportMonitorDataRecord`

**请求方式**:`GET`

**请求数据类型**:`application/x-www-form-urlencoded`

**响应数据类型**:`*/*`

**接口描述**:

**请求参数**:

**请求参数**:

| 参数名称   | 参数说明                      | 请求类型 | 是否必须 | 数据类型       | schema |
| ---------- | ----------------------------- | -------- | -------- | -------------- | ------ |
| id         | 主键                          | query    | true     | string         |        |
| deviceCode | 设备编码                      | query    | false    | string         |        |
| order      | 排序方式（asc正序，desc倒序） | query    | false    | string         |        |
| page       | 分页索引                      | query    | false    | integer(int32) |        |
| siteCode   | 工地编码                      | query    | false    | string         |        |
| size       | 分页大小，默认30              | query    | false    | integer(int32) |        |

**响应状态**:

| 状态码 | 说明         | schema                                          |
| ------ | ------------ | ----------------------------------------------- |
| 200    | OK           | AjaxJson«List«DeviceMonitorDataImportRecordPo»» |
| 401    | Unauthorized |                                                 |
| 403    | Forbidden    |                                                 |
| 404    | Not Found    |                                                 |

**响应参数**:

| 参数名称               | 参数说明      | 类型              | schema                          |
| ---------------------- | ------------- | ----------------- | ------------------------------- |
| data                   |               | array             | DeviceMonitorDataImportRecordPo |
| &emsp;&emsp;deviceCode | 设备编码      | string            |                                 |
| &emsp;&emsp;fileName   | 文件名        | string            |                                 |
| &emsp;&emsp;filePath   | excel文件路径 | string            |                                 |
| &emsp;&emsp;fileSize   | 文件大小      | integer(int64)    |                                 |
| &emsp;&emsp;id         | 主键ID        | string            |                                 |
| &emsp;&emsp;importDt   | 导入时间      | string(date-time) |                                 |
| &emsp;&emsp;siteCode   | 工地编码      | string            |                                 |
| message                |               | string            |                                 |
| status                 |               | integer(int32)    | integer(int32)                  |
| success                |               | boolean           |                                 |

**响应示例**:

```javascript
{
	"data": [
		{
			"deviceCode": "",
			"fileName": "",
			"filePath": "",
			"fileSize": 0,
			"id": "",
			"importDt": "",
			"siteCode": ""
		}
	],
	"message": "",
	"status": 0,
	"success": true
}
```

## 人工监测数据-导入Excel

**接口地址**:`/companyApp/DeviceSafeCheck/importMonitorData`

**请求方式**:`POST`

**请求数据类型**:`application/json`

**响应数据类型**:`*/*`

**接口描述**:

**请求参数**:

**请求参数**:

| 参数名称   | 参数说明  | 请求类型 | 是否必须 | 数据类型 | schema |
| ---------- | --------- | -------- | -------- | -------- | ------ |
| deviceCode | 设备编码  | query    | false    | string   |        |
| deviceName | 设备名称  | query    | false    | string   |        |
| file       | excel文件 | query    | false    | file     |        |
| fileImg    | 图片文件  | query    | false    | file     |        |
| siteCode   | 工地编码  | query    | false    | string   |        |

**响应状态**:

| 状态码 | 说明         | schema           |
| ------ | ------------ | ---------------- |
| 200    | OK           | AjaxJson«object» |
| 201    | Created      |                  |
| 401    | Unauthorized |                  |
| 403    | Forbidden    |                  |
| 404    | Not Found    |                  |

**响应参数**:

| 参数名称 | 参数说明 | 类型           | schema         |
| -------- | -------- | -------------- | -------------- |
| data     |          | object         |                |
| message  |          | string         |                |
| status   |          | integer(int32) | integer(int32) |
| success  |          | boolean        |                |

**响应示例**:

```javascript
{
	"data": {},
	"message": "",
	"status": 0,
	"success": true
}
```

## 查询所有工地列表

**接口地址**:`/companyApp/DeviceSafeCheck/listMineAllData`

**请求方式**:`GET`

**请求数据类型**:`application/x-www-form-urlencoded`

**响应数据类型**:`*/*`

**接口描述**:

**请求参数**:

**请求参数**:

暂无

**响应状态**:

| 状态码 | 说明         | schema                       |
| ------ | ------------ | ---------------------------- |
| 200    | OK           | AjaxJson«Map«string,string»» |
| 401    | Unauthorized |                              |
| 403    | Forbidden    |                              |
| 404    | Not Found    |                              |

**响应参数**:

| 参数名称 | 参数说明 | 类型           | schema         |
| -------- | -------- | -------------- | -------------- |
| data     |          | object         |                |
| message  |          | string         |                |
| status   |          | integer(int32) | integer(int32) |
| success  |          | boolean        |                |

**响应示例**:

```javascript
{
	"data": {},
	"message": "",
	"status": 0,
	"success": true
}
```

## 设备列表查询

**接口地址**:`/companyApp/DeviceArchive/list`

**请求方式**:`GET`

**请求数据类型**:`application/x-www-form-urlencoded`

**响应数据类型**:`*/*`

**接口描述**:

**请求参数**:

**请求参数**:

| 参数名称       | 参数说明                                   | 请求类型 | 是否必须 | 数据类型          | schema |
| -------------- | ------------------------------------------ | -------- | -------- | ----------------- | ------ |
| deviceName     | 设备名称                                   | query    | false    | string            |        |
| deviceType     | 设备类型, 1.特种设备 2.危大工程 3.常规设备 | query    | false    | integer(int32)    |        |
| factoryCode    | 出厂编号                                   | query    | false    | string            |        |
| id             | 主键ID                                     | query    | false    | string            |        |
| installDtEnd   | 安装日期-截止，yyyy-MM-dd                  | query    | false    | string(date-time) |        |
| installDtStart | 安装日期-开始，yyyy-MM-dd                  | query    | false    | string(date-time) |        |
| manufacturer   | 生产厂家                                   | query    | false    | string            |        |
| model          | 型号                                       | query    | false    | string            |        |
| onlineStatus   | 设备状态, 1.在线 2.离线                    | query    | false    | integer(int32)    |        |
| order          | 排序方式（asc正序，desc倒序）              | query    | false    | string            |        |
| page           | 分页索引                                   | query    | false    | integer(int32)    |        |
| siteCode       | 工地编码                                   | query    | false    | string            |        |
| siteName       | 工地名称                                   | query    | false    | string            |        |
| size           | 分页大小，默认30                           | query    | false    | integer(int32)    |        |

**响应状态**:

| 状态码 | 说明         | schema                          |
| ------ | ------------ | ------------------------------- |
| 200    | OK           | AjaxJson«List«DeviceArchivePo»» |
| 401    | Unauthorized |                                 |
| 403    | Forbidden    |                                 |
| 404    | Not Found    |                                 |

**响应参数**:

| 参数名称                       | 参数说明                                   | 类型              | schema          |
| ------------------------------ | ------------------------------------------ | ----------------- | --------------- |
| data                           |                                            | array             | DeviceArchivePo |
| &emsp;&emsp;attachmentFilePath | 附件路径                                   | string            |                 |
| &emsp;&emsp;deviceCode         | 设备编码                                   | string            |                 |
| &emsp;&emsp;deviceName         | 设备名称                                   | string            |                 |
| &emsp;&emsp;deviceSubclass     | 设备子类                                   | string            |                 |
| &emsp;&emsp;deviceType         | 设备类型, 1.特种设备 2.危大工程 3.常规设备 | integer(int32)    |                 |
| &emsp;&emsp;factoryCode        | 出厂编号                                   | string            |                 |
| &emsp;&emsp;id                 | 主键ID                                     | string            |                 |
| &emsp;&emsp;installDt          | 安装日期                                   | string(date-time) |                 |
| &emsp;&emsp;manufacturer       | 生产厂家                                   | string            |                 |
| &emsp;&emsp;model              | 型号                                       | string            |                 |
| &emsp;&emsp;nextCheckDt        | 下次监测日期                               | string(date-time) |                 |
| &emsp;&emsp;onlineStatus       | 设备状态, 1.在线 2.离线                    | integer(int32)    |                 |
| &emsp;&emsp;operPermitUser     | 操作持证人                                 | string            |                 |
| &emsp;&emsp;siteCode           | 工地编码                                   | string            |                 |
| &emsp;&emsp;siteName           | 工地名称                                   | string            |                 |
| &emsp;&emsp;unit               | 单位                                       | string            |                 |
| message                        |                                            | string            |                 |
| status                         |                                            | integer(int32)    | integer(int32)  |
| success                        |                                            | boolean           |                 |

**响应示例**:

```javascript
{
	"data": [
		{
			"attachmentFilePath": "",
			"deviceCode": "",
			"deviceName": "",
			"deviceSubclass": "",
			"deviceType": 0,
			"factoryCode": "",
			"id": "",
			"installDt": "",
			"manufacturer": "",
			"model": "",
			"nextCheckDt": "",
			"onlineStatus": 0,
			"operPermitUser": "",
			"siteCode": "",
			"siteName": "",
			"unit": ""
		}
	],
	"message": "",
	"status": 0,
	"success": true
}
```

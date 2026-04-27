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

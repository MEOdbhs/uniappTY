## 设备预警阈值-保存与更新

**接口地址**:`/companyApp/DeviceSafeCheck/alarmThresholdSave`

**请求方式**:`POST`

**请求数据类型**:`application/json`

**响应数据类型**:`*/*`

**接口描述**:

**请求示例**:

```javascript
{
  "blueAlarm": 0,
  "condition": 0,
  "deviceType": 0,
  "id": "",
  "noticeWay": "",
  "orangeAlarm": 0,
  "redAlarm": 0,
  "remark": "",
  "unit": "",
  "yellowAlarm": 0
}
```

**请求参数**:

**请求参数**:

| 参数名称                | 参数说明                                     | 请求类型 | 是否必须 | 数据类型             | schema               |
| ----------------------- | -------------------------------------------- | -------- | -------- | -------------------- | -------------------- |
| model                   | 设备预警阈值配置实体                         | body     | true     | DeviceAlarmThreshold | DeviceAlarmThreshold |
| &emsp;&emsp;blueAlarm   | 蓝色预警值                                   |          | false    | number               |                      |
| &emsp;&emsp;condition   | 判断方向，1.大于阈值预警 2.小于阈值预警      |          | false    | integer(int32)       |                      |
| &emsp;&emsp;deviceType  | 设备类型, 1.特种设备 2.危大工程              |          | false    | integer(int32)       |                      |
| &emsp;&emsp;id          | 主键ID                                       |          | false    | string               |                      |
| &emsp;&emsp;noticeWay   | 通知方式，1.短信通知 2.邮件通知 多个逗号分隔 |          | false    | string               |                      |
| &emsp;&emsp;orangeAlarm | 橙色预警值                                   |          | false    | number               |                      |
| &emsp;&emsp;redAlarm    | 红色预警值                                   |          | false    | number               |                      |
| &emsp;&emsp;remark      | 备注                                         |          | false    | string               |                      |
| &emsp;&emsp;unit        | 单位                                         |          | false    | string               |                      |
| &emsp;&emsp;yellowAlarm | 黄色预警值                                   |          | false    | number               |                      |

**响应状态**:

| 状态码 | 说明         | schema                         |
| ------ | ------------ | ------------------------------ |
| 200    | OK           | AjaxJson«DeviceAlarmThreshold» |
| 201    | Created      |                                |
| 401    | Unauthorized |                                |
| 403    | Forbidden    |                                |
| 404    | Not Found    |                                |

**响应参数**:

| 参数名称                | 参数说明                                     | 类型                 | schema               |
| ----------------------- | -------------------------------------------- | -------------------- | -------------------- |
| data                    |                                              | DeviceAlarmThreshold | DeviceAlarmThreshold |
| &emsp;&emsp;blueAlarm   | 蓝色预警值                                   | number               |                      |
| &emsp;&emsp;condition   | 判断方向，1.大于阈值预警 2.小于阈值预警      | integer(int32)       |                      |
| &emsp;&emsp;deviceType  | 设备类型, 1.特种设备 2.危大工程              | integer(int32)       |                      |
| &emsp;&emsp;id          | 主键ID                                       | string               |                      |
| &emsp;&emsp;noticeWay   | 通知方式，1.短信通知 2.邮件通知 多个逗号分隔 | string               |                      |
| &emsp;&emsp;orangeAlarm | 橙色预警值                                   | number               |                      |
| &emsp;&emsp;redAlarm    | 红色预警值                                   | number               |                      |
| &emsp;&emsp;remark      | 备注                                         | string               |                      |
| &emsp;&emsp;unit        | 单位                                         | string               |                      |
| &emsp;&emsp;yellowAlarm | 黄色预警值                                   | number               |                      |
| message                 |                                              | string               |                      |
| status                  |                                              | integer(int32)       | integer(int32)       |
| success                 |                                              | boolean              |                      |

**响应示例**:

```javascript
{
	"data": {
		"blueAlarm": 0,
		"condition": 0,
		"deviceType": 0,
		"id": "",
		"noticeWay": "",
		"orangeAlarm": 0,
		"redAlarm": 0,
		"remark": "",
		"unit": "",
		"yellowAlarm": 0
	},
	"message": "",
	"status": 0,
	"success": true
}
```

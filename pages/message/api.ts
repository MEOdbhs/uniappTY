import { service } from "/@/cool";

/**
 * 获取用户消息列表
 * @param params 
 * @returns 
 */
export function getMessageList(params: any) {
  return service.request({
    url: '/SysAnnouncement/listPageMyself',
    method: 'GET',
    params
  })
}

/**
 * 更新已读状态
 * @param data 
 * @returns 
 */
export function updateReadFlag(data: any) {
  return service.request({
    url: '/SysAnnouncementSend/updateReadFlag',
    method: 'POST',
    data
  })
}





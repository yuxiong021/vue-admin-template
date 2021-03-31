import request from '@/utils/request'

export function getroutes() {
  return request({
    url: '/permission/getroutes',
    method: 'get'
  })
}

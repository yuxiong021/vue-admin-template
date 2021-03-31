import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/link/list',
    method: 'get',
    params
  })
}

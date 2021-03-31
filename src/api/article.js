import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/article/list',
    method: 'get',
    params
  })
}

export function getCategory(params) {
  return request({
    url: '/article/category',
    method: 'get',
    params
  })
}

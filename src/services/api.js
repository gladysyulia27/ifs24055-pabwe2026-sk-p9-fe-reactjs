import apiHelper from '../helpers/apiHelper'

export const getToken = apiHelper.getAccessToken
export const setToken = apiHelper.putAccessToken
export const removeToken = () => apiHelper.putAccessToken('')

export const getUser = apiHelper.getUser
export const setUser = apiHelper.putUser
export const removeUser = () => apiHelper.putUser(null)

export async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = { method }
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data)
  }
  return apiHelper.fetchData(endpoint, options)
}

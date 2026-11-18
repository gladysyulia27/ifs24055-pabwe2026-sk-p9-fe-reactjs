import { apiRequest } from '../../../helpers/apiHelper'
export const getAdminUsers = (token) => apiRequest('/admin/users', { token })
export const getAdminPosts = (token) => apiRequest('/admin/posts', { token })
export const getAdminUserPosts = (id, token) => apiRequest(`/admin/users/${id}/posts`, { token })

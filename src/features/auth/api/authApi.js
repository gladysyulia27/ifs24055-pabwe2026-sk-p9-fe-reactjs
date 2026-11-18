import { apiRequest } from '../../../helpers/apiHelper'
export const registerAuthor = (body) => apiRequest('/auth/register', { method: 'POST', body })
export const loginAuthor = (body) => apiRequest('/auth/login', { method: 'POST', body })
export const getProfile = (token) => apiRequest('/auth/profile', { token })
export const updateProfile = (body, token) => apiRequest('/auth/profile', { method: 'PUT', body, token })

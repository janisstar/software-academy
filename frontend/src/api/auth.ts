import { apiRequest } from './client'
import type { LoginResponse, MeResponse, UserOut } from '../types/api'
import { API_ENDPOINTS } from '../constants/api'

export async function login(un: string, pw: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(API_ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify({ un, pw }),
  })
}

export async function logout(): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(API_ENDPOINTS.logout, {
    method: 'POST',
  })
}

export async function me(): Promise<UserOut> {
  return apiRequest<UserOut>(API_ENDPOINTS.me, {
    method: 'GET',
  })
}

export async function acceptPrivacy(): Promise<MeResponse> {
  return apiRequest<MeResponse>(API_ENDPOINTS.acceptPrivacy, {
    method: 'POST',
  })
}

export async function acceptTerms(): Promise<MeResponse> {
  return apiRequest<MeResponse>(API_ENDPOINTS.acceptTerms, {
    method: 'POST',
  })
}

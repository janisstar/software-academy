export type ApiErrorDetail = string

export type PrivilegeKey =
  | 'master'
  | 'admin'
  | 'manager'
  | 'site'
  | 'user'
  | 'fitter'
  | 'inspector'
  | 'locked'

export interface PrivilegesMap {
  [key: string]: number
}

export interface CompanyOut {
  id: number
  name: string
}

export interface UserOut {
  id: number
  un: string
  name: string
  email?: string | null
  companyid: number
  privileges: PrivilegesMap
  must_change_password: boolean
  pending_consents: string[]
}

export interface LoginResponse {
  message: string
  user: UserOut
  company: CompanyOut
}

export type MeResponse = UserOut

export interface LoginPayload {
  un: string
  pw: string
}

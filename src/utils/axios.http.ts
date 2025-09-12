import axios, { AxiosError, HttpStatusCode, type AxiosInstance, type AxiosResponse } from 'axios'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

type AuthTokens = {
  access_token: string
  refresh_token: string
  user_profile?: unknown
}

type ApiEnvelope<T> = {
  result: T
  message?: string
}

type AuthResponse = ApiEnvelope<AuthTokens>

type RefreshTokenResponse = ApiEnvelope<{
  access_token: string
  refresh_token: string
}>

function getAccessTokenFromLS(): string {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || ''
}

function getRefreshTokenFromLS(): string {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || ''
}

function setAccessTokenToLS(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

function setRefreshTokenToLS(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

function clearLS(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

class Http {
  instance: AxiosInstance
  private accessToken: string
  private refreshToken: string
  private callRefreshToken: Promise<string> | null

  constructor() {
    this.accessToken = getAccessTokenFromLS()
    this.refreshToken = getRefreshTokenFromLS()
    this.callRefreshToken = null

    this.instance = axios.create({
      baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:8000',
      timeout: 20000,
      headers: { 'Content-Type': 'application/json' }
    })

    this.initializeRequestInterceptor()
    this.initializeResponseInterceptor()
  }

  private initializeRequestInterceptor() {
    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )
  }

  private initializeResponseInterceptor() {
    this.instance.interceptors.response.use(
      (response) => {
        this.handleAuthResponses(response)
        return response
      },
      (error: AxiosError) => {
        const status = error.response?.status

        if (status !== HttpStatusCode.UnprocessableEntity && status !== HttpStatusCode.Unauthorized) {
          const message = (error.response?.data as { message?: string } | undefined)?.message || error.message
          if (message) console.error(message)
        }

        if (status === HttpStatusCode.Unauthorized) {
          const originalConfig = error.response?.config || { headers: {}, url: '' }

          if (originalConfig && originalConfig.url !== '/auth/refresh-token' && this.refreshToken) {
            this.callRefreshToken = this.callRefreshToken
              ? this.callRefreshToken
              : this.handleRefreshToken().finally(() => {
                  setTimeout(() => {
                    this.callRefreshToken = null
                  }, 10000)
                })

            return this.callRefreshToken.then((accessToken) => {
              return this.instance({
                ...originalConfig,
                headers: { ...(originalConfig.headers || {}), Authorization: `Bearer ${accessToken}` }
              })
            })
          }

          clearLS()
          this.accessToken = ''
          this.refreshToken = ''
        }

        return Promise.reject(error)
      }
    )
  }

  private handleAuthResponses(response: AxiosResponse<AuthResponse>) {
    const url = response.config?.url || ''
    const data = response.data

    if (url === '/auth/login' || url === '/auth/verify-email') {
      const result = data?.result
      const access = result?.access_token as string | undefined
      const refresh = result?.refresh_token as string | undefined

      if (access) {
        this.accessToken = access
        setAccessTokenToLS(access)
      }
      if (refresh) {
        this.refreshToken = refresh
        setRefreshTokenToLS(refresh)
      }
    } else if (url === '/auth/logout') {
      this.accessToken = ''
      this.refreshToken = ''
      clearLS()
    }
  }

  private handleRefreshToken(): Promise<string> {
    return this.instance
      .post<RefreshTokenResponse>('/auth/refresh-token', { refresh_token: this.refreshToken })
      .then((res) => {
        const result = res.data?.result
        const accessToken = result?.access_token as string
        const refreshToken = result?.refresh_token as string

        if (accessToken) {
          this.accessToken = accessToken
          setAccessTokenToLS(accessToken)
        }
        if (refreshToken) {
          this.refreshToken = refreshToken
          setRefreshTokenToLS(refreshToken)
        }

        return accessToken
      })
      .catch((err) => {
        clearLS()
        this.accessToken = ''
        this.refreshToken = ''
        throw err
      })
  }
}

const http = new Http().instance

export default http

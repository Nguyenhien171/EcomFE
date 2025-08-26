import axios, { AxiosError, HttpStatusCode, type AxiosInstance, type AxiosResponse } from 'axios'

const accessToken_KEY = 'accessToken'
const refreshToken_KEY = 'refreshToken'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL as string | undefined
const REFRESH_PATH = (import.meta.env.VITE_AUTH_REFRESH_PATH as string | undefined) || '/auth/refresh-token'
const LOGIN_PATH = (import.meta.env.VITE_AUTH_LOGIN_PATH as string | undefined) || '/auth/login'

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('[HTTP] VITE_SERVER_URL is not defined. Please set it in .env')
}

// eslint-disable-next-line no-console
console.debug('[HTTP] baseURL:', API_BASE_URL, 'refreshPath:', REFRESH_PATH, 'loginPath:', LOGIN_PATH)

type AuthTokens = {
  accessToken: string
  refreshToken: string
  user_profile?: unknown
}

type ApiEnvelope<T> = {
  result: T
  message?: string
}

type AuthResponse = ApiEnvelope<AuthTokens>

type RefreshTokenResponse = ApiEnvelope<{
  accessToken: string
  refreshToken: string
}>

function getAccessTokenFromLS(): string {
  return localStorage.getItem(accessToken_KEY) || ''
}

function getRefreshTokenFromLS(): string {
  return localStorage.getItem(refreshToken_KEY) || ''
}

function setAccessTokenToLS(token: string): void {
  localStorage.setItem(accessToken_KEY, token)
}

function setRefreshTokenToLS(token: string): void {
  localStorage.setItem(refreshToken_KEY, token)
}

function clearLS(): void {
  localStorage.removeItem(accessToken_KEY)
  localStorage.removeItem(refreshToken_KEY)
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
      baseURL: API_BASE_URL,
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

          if (originalConfig && originalConfig.url !== REFRESH_PATH && this.refreshToken) {
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
          
          // Trigger logout event for AuthContext
          window.dispatchEvent(new CustomEvent('auth:logout'))
        }

        return Promise.reject(error)
      }
    )
  }

  private handleAuthResponses(response: AxiosResponse<AuthResponse>) {
    const url = response.config?.url || ''
    const data = response.data

    if (url === LOGIN_PATH || url === '/auth/verify-email') {
      const result = data?.result
      const access = result?.accessToken as string | undefined
      const refresh = result?.refreshToken as string | undefined

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
      .post<RefreshTokenResponse>(REFRESH_PATH, { refreshToken: this.refreshToken })
      .then((res) => {
        const result = res.data?.result
        const accessToken = result?.accessToken as string
        const refreshToken = result?.refreshToken as string

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
        
        // Trigger logout event for AuthContext
        window.dispatchEvent(new CustomEvent('auth:logout'))
        throw err
      })
  }
}

const http = new Http().instance

export default http

export function decodeToken(token?: string | null) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let payloadB64 = parts[1];

    // Fix padding nếu thiếu
    const pad = payloadB64.length % 4;
    if (pad) payloadB64 += "=".repeat(4 - pad);

    const binary = atob(payloadB64);
    const json = decodeURIComponent(
      Array.prototype.map.call(binary, (c: string) =>
        "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
      ).join("")
    );

    return JSON.parse(json);
  } catch (e) {
    // fallback minimal
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (err) {
      console.warn("decodeToken failed", err);
      return null;
    }
  }
}

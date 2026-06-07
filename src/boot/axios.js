import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'

const api = axios.create({
  baseURL: process.env.API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor de REQUEST
api.interceptors.request.use(
  (config) => {
    // Aqui pode-se adicionar token de auth futuramente
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de RESPONSE
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const msg = error.response?.data?.message || 'Erro de comunicação com o servidor'

    if (status === 404) {
      Notify.create({ type: 'negative', message: 'Recurso não encontrado' })
    } else if (status === 413) {
      Notify.create({ type: 'negative', message: 'Arquivo muito grande (máx: 100MB)' })
    } else if (status >= 500) {
      Notify.create({ type: 'negative', message: `Erro no servidor: ${msg}` })
    }

    return Promise.reject(error)
  }
)

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }

import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

export const useEc2Store = defineStore('ec2', {
  state: () => ({
    instances: [],
    stats: null,
    logs: [],
    totalLogs: 0,
    loading: false,
    operationLoading: {}  // { instanceId: true/false }
  }),

  getters: {
    runningCount: (state) => state.stats?.running || 0,
    stoppedCount: (state) => state.stats?.stopped || 0,
    totalCount: (state) => state.stats?.total || 0,

    instanceStateColor: () => (state) => {
      const map = {
        running: 'positive',
        stopped: 'negative',
        pending: 'warning',
        stopping: 'warning',
        'shutting-down': 'warning'
      }
      return map[state] || 'grey'
    }
  },

  actions: {
    async fetchInstances() {
      this.loading = true
      try {
        const { data } = await api.get('/ec2/instances')
        this.instances = data.data
      } catch (e) {
        Notify.create({ type: 'negative', message: 'Erro ao listar instâncias EC2' })
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      try {
        const { data } = await api.get('/ec2/stats')
        this.stats = data.data
      } catch (e) {
        console.error('Erro ao buscar stats EC2', e)
      }
    },

    async fetchLogs(page = 0, size = 20) {
      try {
        const { data } = await api.get('/ec2/logs', { params: { page, size } })
        this.logs = data.data.content
        this.totalLogs = data.data.totalElements
      } catch (e) {
        Notify.create({ type: 'negative', message: 'Erro ao buscar logs' })
      }
    },

    async startInstance(instanceId) {
      this.operationLoading[instanceId] = true
      try {
        await api.post(`/ec2/instances/${instanceId}/start`)
        Notify.create({ type: 'positive', message: `Instância ${instanceId} iniciando...` })
        setTimeout(() => this.fetchInstances(), 2000)
      } catch (e) {
        Notify.create({ type: 'negative', message: 'Erro ao iniciar instância' })
      } finally {
        this.operationLoading[instanceId] = false
      }
    },

    async stopInstance(instanceId) {
      this.operationLoading[instanceId] = true
      try {
        await api.post(`/ec2/instances/${instanceId}/stop`)
        Notify.create({ type: 'warning', message: `Instância ${instanceId} parando...` })
        setTimeout(() => this.fetchInstances(), 2000)
      } catch (e) {
        Notify.create({ type: 'negative', message: 'Erro ao parar instância' })
      } finally {
        this.operationLoading[instanceId] = false
      }
    },

    async rebootInstance(instanceId) {
      this.operationLoading[instanceId] = true
      try {
        await api.post(`/ec2/instances/${instanceId}/reboot`)
        Notify.create({ type: 'info', message: `Instância ${instanceId} reiniciando...` })
        setTimeout(() => this.fetchInstances(), 3000)
      } catch (e) {
        Notify.create({ type: 'negative', message: 'Erro ao reiniciar instância' })
      } finally {
        this.operationLoading[instanceId] = false
      }
    }
  }
})

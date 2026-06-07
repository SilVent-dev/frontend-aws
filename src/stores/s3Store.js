import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

export const useS3Store = defineStore('s3', {
  state: () => ({
    files: [],
    totalFiles: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
    stats: null,
    buckets: [],
    selectedBucket: 'aws-manager-files',
    loading: false,
    uploading: false,
    uploadProgress: 0
  }),

  getters: {
    hasFiles: (state) => state.files.length > 0,
    totalSizeFormatted: (state) => state.stats?.totalSizeFormatted || '0 B'
  },

  actions: {
    async fetchFiles(page = 0) {
      this.loading = true
      try {
        const { data } = await api.get('/s3/files', {
          params: { bucket: this.selectedBucket, page, size: this.pageSize }
        })
        this.files = data.data.content
        this.totalFiles = data.data.totalElements
        this.totalPages = data.data.totalPages
        this.currentPage = page
      } catch (e) {
        Notify.create({ type: 'negative', message: 'Erro ao listar arquivos' })
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      try {
        const { data } = await api.get('/s3/stats', {
          params: { bucket: this.selectedBucket }
        })
        this.stats = data.data
      } catch (e) {
        console.error('Erro ao buscar stats S3', e)
      }
    },

    async fetchBuckets() {
      try {
        const { data } = await api.get('/s3/buckets')
        this.buckets = data.data
      } catch (e) {
        console.error('Erro ao listar buckets', e)
      }
    },

    async uploadFile(file, onProgress) {
      this.uploading = true
      this.uploadProgress = 0
      const formData = new FormData()
      formData.append('file', file)

      try {
        const { data } = await api.post('/s3/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          params: { bucket: this.selectedBucket },
          onUploadProgress: (evt) => {
            this.uploadProgress = Math.round((evt.loaded * 100) / evt.total)
            if (onProgress) onProgress(this.uploadProgress)
          }
        })
        Notify.create({ type: 'positive', message: 'Arquivo enviado com sucesso!' })
        await this.fetchFiles(this.currentPage)
        await this.fetchStats()
        return data.data
      } catch (e) {
        Notify.create({ type: 'negative', message: 'Erro ao enviar arquivo' })
        throw e
      } finally {
        this.uploading = false
        this.uploadProgress = 0
      }
    },

    async getPresignedUrl(objectKey) {
      try {
        const { data } = await api.get('/s3/files/presigned-url', {
          params: { objectKey, bucket: this.selectedBucket }
        })
        return data.data.presignedUrl
      } catch (e) {
        Notify.create({ type: 'negative', message: 'Erro ao gerar link de download' })
        throw e
      }
    },

    async deleteFile(objectKey) {
      try {
        await api.delete('/s3/files', {
          params: { objectKey, bucket: this.selectedBucket }
        })
        Notify.create({ type: 'positive', message: 'Arquivo deletado!' })
        await this.fetchFiles(this.currentPage)
        await this.fetchStats()
      } catch (e) {
        Notify.create({ type: 'negative', message: 'Erro ao deletar arquivo' })
        throw e
      }
    }
  }
})

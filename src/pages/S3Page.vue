<template>
  <q-page class="q-pa-md">
    <!-- Cabeçalho -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold">
          <q-icon name="mdi-database" class="q-mr-sm" />
          Armazenamento S3
        </div>
        <div class="text-caption text-grey">
          Bucket: <strong>{{ s3Store.selectedBucket }}</strong>
        </div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="mdi-upload" label="Upload" @click="showUpload = true"
          :loading="s3Store.uploading" />
      </div>
    </div>

    <!-- Cards de stats -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="text-center q-pa-sm">
          <div class="text-h5 text-primary text-weight-bold">{{ s3Store.stats?.totalFiles || 0 }}</div>
          <div class="text-caption text-grey">Arquivos</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="text-center q-pa-sm">
          <div class="text-h5 text-secondary text-weight-bold">{{ s3Store.totalSizeFormatted }}</div>
          <div class="text-caption text-grey">Armazenamento usado</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="text-center q-pa-sm">
          <div class="text-h5 text-positive text-weight-bold">{{ s3Store.buckets.length }}</div>
          <div class="text-caption text-grey">Buckets</div>
        </q-card>
      </div>
    </div>

    <!-- Tabela de arquivos -->
    <q-card flat bordered>
      <q-card-section class="q-pb-none">
        <div class="row items-center">
          <span class="text-subtitle1 text-weight-bold">Arquivos</span>
          <q-space />
          <q-input v-model="filter" dense outlined placeholder="Filtrar por nome..." class="q-mr-sm"
            style="max-width: 250px" clearable>
            <template #prepend><q-icon name="mdi-magnify" /></template>
          </q-input>
          <q-btn flat round icon="mdi-refresh" @click="refresh" :loading="s3Store.loading" />
        </div>
      </q-card-section>

      <q-table
        :rows="filteredFiles"
        :columns="columns"
        row-key="id"
        flat
        :loading="s3Store.loading"
        :rows-per-page-options="[10, 20, 50]"
        v-model:pagination="pagination"
        @request="onRequest"
        no-data-label="Nenhum arquivo encontrado"
      >
        <!-- Coluna de ícone + nome -->
        <template #body-cell-originalFilename="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-icon :name="fileIcon(props.row.contentType)" class="q-mr-sm" color="primary" />
              <span class="ellipsis" style="max-width:200px">{{ props.value }}</span>
            </div>
          </q-td>
        </template>

        <!-- Coluna status -->
        <template #body-cell-uploadStatus="props">
          <q-td :props="props">
            <q-chip dense :color="statusColor(props.value)" text-color="white" size="sm">
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <!-- Coluna data -->
        <template #body-cell-uploadedAt="props">
          <q-td :props="props">{{ formatDate(props.value) }}</q-td>
        </template>

        <!-- Coluna ações -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="q-gutter-xs">
            <q-btn flat round dense icon="mdi-download" color="primary" size="sm"
              @click="download(props.row)" title="Gerar link de download">
              <q-tooltip>Download (URL pré-assinada)</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="mdi-content-copy" color="secondary" size="sm"
              @click="copyKey(props.row.objectKey)" title="Copiar chave S3">
              <q-tooltip>Copiar Object Key</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="mdi-delete" color="negative" size="sm"
              @click="confirmDelete(props.row)">
              <q-tooltip>Deletar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog de Upload -->
    <q-dialog v-model="showUpload" persistent>
      <q-card style="min-width: 400px; max-width: 600px; width: 90vw">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="mdi-upload" class="q-mr-sm" />
            Upload para S3
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Zona de drag & drop -->
          <div
            class="drop-zone q-pa-xl text-center rounded-borders cursor-pointer"
            :class="{ 'drop-zone--active': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="triggerFileInput"
          >
            <q-icon name="mdi-cloud-upload" size="64px" color="primary" />
            <div class="text-subtitle1 q-mt-sm">
              {{ selectedFile ? selectedFile.name : 'Arraste o arquivo aqui ou clique para selecionar' }}
            </div>
            <div class="text-caption text-grey q-mt-xs">
              Formatos: JPG, PNG, PDF, TXT, CSV, JSON, ZIP, MP4 (máx. 100MB)
            </div>
            <input ref="fileInput" type="file" class="hidden" @change="onFileSelect" />
          </div>

          <!-- Barra de progresso -->
          <div v-if="s3Store.uploading" class="q-mt-md">
            <q-linear-progress
              :value="s3Store.uploadProgress / 100"
              color="primary"
              rounded
              class="q-mb-xs"
            />
            <div class="text-caption text-center">{{ s3Store.uploadProgress }}% enviado</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="closeUpload" :disable="s3Store.uploading" />
          <q-btn
            color="primary"
            label="Enviar"
            icon="mdi-upload"
            @click="doUpload"
            :loading="s3Store.uploading"
            :disable="!selectedFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de confirmação de delete -->
    <q-dialog v-model="showDelete">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar exclusão</div>
        </q-card-section>
        <q-card-section>
          Tem certeza que deseja deletar <strong>{{ fileToDelete?.originalFilename }}</strong>?
          <br><small class="text-grey">Esta ação não pode ser desfeita.</small>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="negative" label="Deletar" icon="mdi-delete"
            @click="doDelete" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useS3Store } from 'src/stores/s3Store'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const s3Store = useS3Store()

const filter = ref('')
const showUpload = ref(false)
const showDelete = ref(false)
const selectedFile = ref(null)
const fileToDelete = ref(null)
const fileInput = ref(null)
const isDragging = ref(false)
const pagination = ref({ page: 1, rowsPerPage: 20, rowsNumber: 0 })

const columns = [
  { name: 'originalFilename', label: 'Nome', field: 'originalFilename', align: 'left', sortable: true },
  { name: 'fileSizeFormatted', label: 'Tamanho', field: 'fileSizeFormatted', align: 'center' },
  { name: 'contentType', label: 'Tipo', field: 'contentType', align: 'center' },
  { name: 'uploadStatus', label: 'Status', field: 'uploadStatus', align: 'center' },
  { name: 'uploadedAt', label: 'Enviado em', field: 'uploadedAt', align: 'center', sortable: true },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' }
]

const filteredFiles = computed(() => {
  if (!filter.value) return s3Store.files
  const q = filter.value.toLowerCase()
  return s3Store.files.filter(f => f.originalFilename?.toLowerCase().includes(q))
})

function fileIcon(contentType) {
  if (!contentType) return 'mdi-file'
  if (contentType.startsWith('image/')) return 'mdi-file-image'
  if (contentType === 'application/pdf') return 'mdi-file-pdf-box'
  if (contentType.includes('zip')) return 'mdi-zip-box'
  if (contentType.includes('video')) return 'mdi-file-video'
  if (contentType.includes('json') || contentType.includes('csv')) return 'mdi-file-chart'
  return 'mdi-file-document'
}

function statusColor(status) {
  return { COMPLETED: 'positive', PENDING: 'warning', FAILED: 'negative', DELETED: 'grey' }[status] || 'grey'
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('pt-BR')
}

function triggerFileInput() { fileInput.value?.click() }

function onFileSelect(evt) {
  selectedFile.value = evt.target.files[0] || null
}

function onDrop(evt) {
  isDragging.value = false
  selectedFile.value = evt.dataTransfer.files[0] || null
}

async function doUpload() {
  if (!selectedFile.value) return
  try {
    await s3Store.uploadFile(selectedFile.value)
    closeUpload()
  } catch {}
}

function closeUpload() {
  showUpload.value = false
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function confirmDelete(file) {
  fileToDelete.value = file
  showDelete.value = true
}

async function doDelete() {
  if (fileToDelete.value) {
    await s3Store.deleteFile(fileToDelete.value.objectKey)
    fileToDelete.value = null
  }
}

async function download(file) {
  try {
    const url = await s3Store.getPresignedUrl(file.objectKey)
    window.open(url, '_blank')
  } catch {}
}

function copyKey(key) {
  navigator.clipboard.writeText(key)
  $q.notify({ type: 'positive', message: 'Object Key copiado!', timeout: 1500 })
}

async function refresh() {
  await Promise.all([s3Store.fetchFiles(s3Store.currentPage), s3Store.fetchStats()])
}

async function onRequest(props) {
  const { page, rowsPerPage } = props.pagination
  await s3Store.fetchFiles(page - 1)
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.rowsNumber = s3Store.totalFiles
}

onMounted(async () => {
  await Promise.all([s3Store.fetchFiles(), s3Store.fetchStats(), s3Store.fetchBuckets()])
  pagination.value.rowsNumber = s3Store.totalFiles
})
</script>

<style scoped>
.drop-zone {
  border: 2px dashed rgba(0,0,0,0.2);
  transition: border-color 0.2s, background 0.2s;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.drop-zone--active {
  border-color: var(--q-primary);
  background: rgba(var(--q-primary-rgb), 0.05);
}
.hidden { display: none; }
</style>

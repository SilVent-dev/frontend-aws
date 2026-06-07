<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md text-weight-bold">
      <q-icon name="mdi-view-dashboard" class="q-mr-sm" />
      Visão Geral
    </div>

    <!-- Cards de resumo -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <StatCard
          title="Arquivos no S3"
          :value="s3Store.stats?.totalFiles ?? '—'"
          icon="mdi-file-multiple"
          color="primary"
          :subtitle="s3Store.stats?.totalSizeFormatted || ''"
          to="/s3"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatCard
          title="Instâncias EC2"
          :value="ec2Store.stats?.total ?? '—'"
          icon="mdi-server"
          color="deep-orange"
          :subtitle="`${ec2Store.stats?.running ?? 0} rodando`"
          to="/ec2"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatCard
          title="EC2 Ativas"
          :value="ec2Store.stats?.running ?? '—'"
          icon="mdi-play-circle"
          color="positive"
          subtitle="Instâncias rodando"
          to="/ec2"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatCard
          title="EC2 Paradas"
          :value="ec2Store.stats?.stopped ?? '—'"
          icon="mdi-stop-circle"
          color="negative"
          subtitle="Instâncias paradas"
          to="/ec2"
        />
      </div>
    </div>

    <!-- Linha inferior: listas rápidas -->
    <div class="row q-col-gutter-md">
      <!-- Últimos arquivos S3 -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="bg-grey-2 dark-section">
            <div class="row items-center">
              <q-icon name="mdi-database" class="q-mr-sm" color="primary" />
              <span class="text-subtitle1 text-weight-bold">Últimos Arquivos S3</span>
              <q-space />
              <q-btn flat dense size="sm" label="Ver todos" to="/s3" color="primary" />
            </div>
          </q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-if="s3Store.loading">
              <q-item-section>
                <q-skeleton type="text" v-for="n in 3" :key="n" />
              </q-item-section>
            </q-item>
            <template v-else-if="recentFiles.length">
              <q-item v-for="file in recentFiles" :key="file.id" dense>
                <q-item-section avatar>
                  <q-icon :name="fileIcon(file.contentType)" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium ellipsis">
                    {{ file.originalFilename }}
                  </q-item-label>
                  <q-item-label caption>{{ file.fileSizeFormatted }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>{{ formatDate(file.uploadedAt) }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <q-item v-else>
              <q-item-section class="text-grey text-center q-py-md">
                Nenhum arquivo encontrado
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Instâncias EC2 -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="bg-grey-2 dark-section">
            <div class="row items-center">
              <q-icon name="mdi-server" class="q-mr-sm" color="deep-orange" />
              <span class="text-subtitle1 text-weight-bold">Instâncias EC2</span>
              <q-space />
              <q-btn flat dense size="sm" label="Gerenciar" to="/ec2" color="deep-orange" />
            </div>
          </q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-if="ec2Store.loading">
              <q-item-section>
                <q-skeleton type="text" v-for="n in 3" :key="n" />
              </q-item-section>
            </q-item>
            <template v-else-if="ec2Store.instances.length">
              <q-item v-for="inst in ec2Store.instances.slice(0, 5)" :key="inst.instanceId" dense>
                <q-item-section avatar>
                  <q-badge :color="stateColor(inst.stateName)" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ instName(inst) }}
                  </q-item-label>
                  <q-item-label caption>{{ inst.instanceType }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip dense :color="stateColor(inst.stateName)" text-color="white" size="sm">
                    {{ inst.stateName }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </template>
            <q-item v-else>
              <q-item-section class="text-grey text-center q-py-md">
                Nenhuma instância encontrada
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useS3Store } from 'src/stores/s3Store'
import { useEc2Store } from 'src/stores/ec2Store'
import StatCard from 'src/components/StatCard.vue'

const s3Store = useS3Store()
const ec2Store = useEc2Store()

const recentFiles = computed(() => s3Store.files.slice(0, 5))

function fileIcon(contentType) {
  if (!contentType) return 'mdi-file'
  if (contentType.startsWith('image/')) return 'mdi-file-image'
  if (contentType === 'application/pdf') return 'mdi-file-pdf-box'
  if (contentType.includes('zip')) return 'mdi-zip-box'
  if (contentType.includes('video')) return 'mdi-file-video'
  return 'mdi-file-document'
}

function stateColor(state) {
  const map = { running: 'positive', stopped: 'negative', pending: 'warning', stopping: 'warning' }
  return map[state] || 'grey'
}

function instName(inst) {
  return inst.tags?.Name || inst.instanceId
}

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  await Promise.all([
    s3Store.fetchFiles(),
    s3Store.fetchStats(),
    ec2Store.fetchInstances(),
    ec2Store.fetchStats()
  ])
})
</script>

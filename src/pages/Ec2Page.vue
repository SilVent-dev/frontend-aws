<template>
  <q-page class="q-pa-md">
    <!-- Cabeçalho -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold">
          <q-icon name="mdi-server" class="q-mr-sm" />
          Instâncias EC2
        </div>
        <div class="text-caption text-grey">Gerenciamento de instâncias via AWS SDK</div>
      </div>
      <div class="col-auto">
        <q-btn flat round icon="mdi-refresh" @click="refresh" :loading="ec2Store.loading" />
      </div>
    </div>

    <!-- Cards de stats EC2 -->
    <div class="row q-col-gutter-sm q-mb-lg">
      <div class="col-6 col-sm-3" v-for="stat in statsCards" :key="stat.label">
        <q-card flat bordered class="text-center q-pa-sm">
          <q-icon :name="stat.icon" :color="stat.color" size="28px" />
          <div class="text-h5 text-weight-bold q-mt-xs" :class="`text-${stat.color}`">{{ stat.value }}</div>
          <div class="text-caption text-grey">{{ stat.label }}</div>
        </q-card>
      </div>
    </div>

    <!-- Lista de instâncias -->
    <q-card flat bordered>
      <q-card-section class="q-pb-none">
        <span class="text-subtitle1 text-weight-bold">Instâncias</span>
      </q-card-section>

      <!-- Loading skeleton -->
      <div v-if="ec2Store.loading" class="q-pa-md">
        <q-skeleton v-for="n in 3" :key="n" type="QToolbar" class="q-mb-sm" />
      </div>

      <!-- Lista vazia -->
      <div v-else-if="!ec2Store.instances.length" class="text-center q-pa-xl text-grey">
        <q-icon name="mdi-server-off" size="64px" color="grey-4" />
        <div class="text-h6 q-mt-sm">Nenhuma instância encontrada</div>
        <div class="text-caption">Em ambiente de desenvolvimento, use o LocalStack para simular instâncias EC2.</div>
      </div>

      <!-- Cards de instâncias -->
      <div v-else class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6" v-for="inst in ec2Store.instances" :key="inst.instanceId">
            <q-card flat bordered class="instance-card">
              <!-- Header do card -->
              <q-card-section class="q-pb-xs">
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-subtitle1 text-weight-bold ellipsis">
                      {{ inst.tags?.Name || inst.instanceId }}
                    </div>
                    <div class="text-caption text-grey">{{ inst.instanceId }}</div>
                  </div>
                  <q-chip
                    dense :color="stateColor(inst.stateName)" text-color="white" size="sm"
                    class="col-auto">
                    <q-icon :name="stateIcon(inst.stateName)" class="q-mr-xs" size="12px"/>
                    {{ inst.stateName }}
                  </q-chip>
                </div>
              </q-card-section>

              <q-separator />

              <!-- Detalhes da instância -->
              <q-card-section class="q-py-sm">
                <div class="row q-col-gutter-xs text-caption">
                  <div class="col-6">
                    <q-icon name="mdi-cpu-64-bit" class="q-mr-xs" />
                    {{ inst.instanceType || '—' }}
                  </div>
                  <div class="col-6">
                    <q-icon name="mdi-map-marker" class="q-mr-xs" />
                    {{ inst.availabilityZone || '—' }}
                  </div>
                  <div class="col-12 q-mt-xs">
                    <q-icon name="mdi-ip-network" class="q-mr-xs" />
                    <span class="text-weight-medium">IP Público:</span>
                    {{ inst.publicIpAddress || 'N/A' }}
                  </div>
                  <div class="col-12">
                    <q-icon name="mdi-ip" class="q-mr-xs" />
                    <span class="text-weight-medium">IP Privado:</span>
                    {{ inst.privateIpAddress || 'N/A' }}
                  </div>
                  <div v-if="inst.launchTime" class="col-12">
                    <q-icon name="mdi-clock" class="q-mr-xs" />
                    <span class="text-weight-medium">Iniciada em:</span>
                    {{ formatDate(inst.launchTime) }}
                  </div>
                </div>

                <!-- Tags -->
                <div v-if="Object.keys(inst.tags || {}).length" class="q-mt-sm">
                  <q-chip
                    v-for="(val, key) in inst.tags" :key="key"
                    dense size="sm" outline color="grey"
                    class="q-mr-xs q-mb-xs"
                  >{{ key }}: {{ val }}</q-chip>
                </div>
              </q-card-section>

              <q-separator />

              <!-- Ações -->
              <q-card-actions align="right">
                <q-btn
                  v-if="inst.stateName === 'stopped'"
                  flat dense color="positive" icon="mdi-play" label="Iniciar"
                  :loading="ec2Store.operationLoading[inst.instanceId]"
                  @click="confirmAction('start', inst)"
                />
                <q-btn
                  v-if="inst.stateName === 'running'"
                  flat dense color="negative" icon="mdi-stop" label="Parar"
                  :loading="ec2Store.operationLoading[inst.instanceId]"
                  @click="confirmAction('stop', inst)"
                />
                <q-btn
                  v-if="inst.stateName === 'running'"
                  flat dense color="warning" icon="mdi-restart" label="Reiniciar"
                  :loading="ec2Store.operationLoading[inst.instanceId]"
                  @click="confirmAction('reboot', inst)"
                />
                <q-btn flat dense color="primary" icon="mdi-information" label="Detalhes"
                  @click="showDetails(inst)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </q-card>

    <!-- Dialog de confirmação de ação -->
    <q-dialog v-model="showConfirm">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">{{ confirmTitle }}</div>
        </q-card-section>
        <q-card-section>{{ confirmMessage }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn :color="confirmColor" :label="confirmLabel" @click="doAction" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de detalhes -->
    <q-dialog v-model="showDetailsDialog">
      <q-card style="min-width: 400px; max-width: 600px; width: 90vw">
        <q-card-section class="bg-dark text-white">
          <div class="text-h6">{{ selectedInstance?.instanceId }}</div>
        </q-card-section>
        <q-card-section>
          <pre class="text-caption" style="overflow:auto; max-height:400px">{{ JSON.stringify(selectedInstance, null, 2) }}</pre>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Fechar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEc2Store } from 'src/stores/ec2Store'

const ec2Store = useEc2Store()

const showConfirm = ref(false)
const showDetailsDialog = ref(false)
const selectedInstance = ref(null)
const pendingAction = ref(null)
const pendingInstance = ref(null)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmLabel = ref('')
const confirmColor = ref('primary')

const statsCards = computed(() => [
  { label: 'Total', value: ec2Store.stats?.total ?? 0, icon: 'mdi-server', color: 'grey' },
  { label: 'Rodando', value: ec2Store.stats?.running ?? 0, icon: 'mdi-play-circle', color: 'positive' },
  { label: 'Paradas', value: ec2Store.stats?.stopped ?? 0, icon: 'mdi-stop-circle', color: 'negative' },
  { label: 'Pendentes', value: ec2Store.stats?.pending ?? 0, icon: 'mdi-clock', color: 'warning' }
])

function stateColor(s) {
  return { running: 'positive', stopped: 'negative', pending: 'warning', stopping: 'warning' }[s] || 'grey'
}

function stateIcon(s) {
  return { running: 'mdi-circle', stopped: 'mdi-circle-outline', pending: 'mdi-loading', stopping: 'mdi-loading' }[s] || 'mdi-help'
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('pt-BR')
}

function showDetails(inst) {
  selectedInstance.value = inst
  showDetailsDialog.value = true
}

function confirmAction(action, inst) {
  pendingAction.value = action
  pendingInstance.value = inst
  const name = inst.tags?.Name || inst.instanceId
  const map = {
    start: { title: 'Iniciar instância', msg: `Iniciar "${name}"?`, label: 'Iniciar', color: 'positive' },
    stop: { title: 'Parar instância', msg: `Parar "${name}"? Serviços em execução serão interrompidos.`, label: 'Parar', color: 'negative' },
    reboot: { title: 'Reiniciar instância', msg: `Reiniciar "${name}"?`, label: 'Reiniciar', color: 'warning' }
  }
  const cfg = map[action]
  confirmTitle.value = cfg.title
  confirmMessage.value = cfg.msg
  confirmLabel.value = cfg.label
  confirmColor.value = cfg.color
  showConfirm.value = true
}

async function doAction() {
  const id = pendingInstance.value?.instanceId
  if (!id) return
  if (pendingAction.value === 'start') await ec2Store.startInstance(id)
  else if (pendingAction.value === 'stop') await ec2Store.stopInstance(id)
  else if (pendingAction.value === 'reboot') await ec2Store.rebootInstance(id)
}

async function refresh() {
  await Promise.all([ec2Store.fetchInstances(), ec2Store.fetchStats()])
}

onMounted(refresh)
</script>

<style scoped>
.instance-card {
  transition: transform 0.15s ease;
}
.instance-card:hover {
  transform: translateY(-2px);
}
</style>

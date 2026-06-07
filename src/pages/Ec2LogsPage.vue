<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold">
          <q-icon name="mdi-clipboard-list" class="q-mr-sm" />
          Logs de Operações EC2
        </div>
        <div class="text-caption text-grey">Histórico de todas as operações realizadas nas instâncias</div>
      </div>
      <div class="col-auto">
        <q-btn flat round icon="mdi-refresh" @click="refresh" :loading="loading" />
      </div>
    </div>

    <q-card flat bordered>
      <q-table
        :rows="ec2Store.logs"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :rows-per-page-options="[20, 50, 100]"
        no-data-label="Nenhum log encontrado"
      >
        <template #body-cell-operation="props">
          <q-td :props="props">
            <q-chip dense :color="opColor(props.value)" text-color="white" size="sm">
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip dense :color="props.value === 'SUCCESS' ? 'positive' : 'negative'"
              text-color="white" size="sm">
              <q-icon :name="props.value === 'SUCCESS' ? 'mdi-check' : 'mdi-close'" class="q-mr-xs" size="12px"/>
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-executedAt="props">
          <q-td :props="props">{{ formatDate(props.value) }}</q-td>
        </template>

        <template #body-cell-errorMessage="props">
          <q-td :props="props">
            <span v-if="props.value" class="text-negative text-caption">{{ props.value }}</span>
            <span v-else class="text-grey">—</span>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEc2Store } from 'src/stores/ec2Store'

const ec2Store = useEc2Store()
const loading = ref(false)

const columns = [
  { name: 'executedAt', label: 'Data/Hora', field: 'executedAt', align: 'left', sortable: true },
  { name: 'instanceId', label: 'Instância', field: 'instanceId', align: 'left' },
  { name: 'operation', label: 'Operação', field: 'operation', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'errorMessage', label: 'Erro', field: 'errorMessage', align: 'left' }
]

function opColor(op) {
  return { START: 'positive', STOP: 'negative', REBOOT: 'warning' }[op] || 'grey'
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('pt-BR')
}

async function refresh() {
  loading.value = true
  await ec2Store.fetchLogs()
  loading.value = false
}

onMounted(refresh)
</script>

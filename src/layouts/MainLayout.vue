<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Cabeçalho -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="mdi-menu" @click="drawer = !drawer" />
        <q-toolbar-title class="text-weight-bold">
          <q-icon name="mdi-aws" size="28px" class="q-mr-sm" />
          AWS Manager
        </q-toolbar-title>
        <q-badge :color="backendOnline ? 'positive' : 'negative'" class="q-mr-sm">
          {{ backendOnline ? 'Online' : 'Offline' }}
        </q-badge>
        <q-btn flat round icon="mdi-refresh" @click="refresh" :loading="refreshing" />
        <q-btn flat round :icon="$q.dark.isActive ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          @click="$q.dark.toggle()" />
      </q-toolbar>
    </q-header>

    <!-- Drawer lateral -->
    <q-drawer v-model="drawer" show-if-above :width="240" :breakpoint="768"
      class="bg-dark text-white">
      <q-scroll-area class="fit">
        <!-- Logo -->
        <div class="q-pa-md text-center">
          <q-icon name="mdi-cloud" size="48px" color="primary" />
          <div class="text-h6 q-mt-sm">AWS Manager</div>
          <div class="text-caption text-grey-5">MVP v1.0</div>
        </div>
        <q-separator dark />

        <!-- Menu de navegação -->
        <q-list padding>
          <q-item-label header class="text-grey-5 text-uppercase text-caption">
            Dashboard
          </q-item-label>
          <NavItem to="/" icon="mdi-view-dashboard" label="Visão Geral" />

          <q-item-label header class="text-grey-5 text-uppercase text-caption q-mt-md">
            Serviços AWS
          </q-item-label>
          <NavItem to="/s3" icon="mdi-database" label="S3 — Armazenamento" />
          <NavItem to="/ec2" icon="mdi-server" label="EC2 — Instâncias" />
          <NavItem to="/ec2/logs" icon="mdi-clipboard-list" label="Logs de Operações" />
        </q-list>

        <q-separator dark class="q-mt-auto" />
        <div class="q-pa-sm text-center text-caption text-grey-6">
          Ambiente: <strong>{{ env }}</strong>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Conteúdo principal -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import NavItem from 'src/components/NavItem.vue'

const drawer = ref(false)
const backendOnline = ref(false)
const refreshing = ref(false)
const env = ref(process.env.APP_ENV || 'development')

async function checkBackend() {
  try {
    await api.get('/actuator/health')
    backendOnline.value = true
  } catch {
    backendOnline.value = false
  }
}

async function refresh() {
  refreshing.value = true
  await checkBackend()
  refreshing.value = false
}

onMounted(checkBackend)
</script>

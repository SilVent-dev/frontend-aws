<template>
  <q-card flat bordered class="stat-card cursor-pointer" @click="$router.push(to)">
    <q-card-section>
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-caption text-grey-6 text-uppercase letter-spacing">{{ title }}</div>
          <div class="text-h4 text-weight-bold q-mt-xs" :class="`text-${color}`">{{ value }}</div>
          <div class="text-caption text-grey-6 q-mt-xs">{{ subtitle }}</div>
        </div>
        <div class="col-auto">
          <q-avatar :color="color" text-color="white" size="52px">
            <q-icon :name="icon" size="28px" />
          </q-avatar>
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section class="q-py-xs">
      <div class="text-caption text-grey-5">
        <q-icon name="mdi-arrow-right" size="14px" />
        Ver detalhes
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: { type: String, default: 'primary' },
  subtitle: String,
  to: { type: String, default: '/' }
})
</script>

<style scoped>
.stat-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
}
.letter-spacing {
  letter-spacing: 0.08em;
}
</style>

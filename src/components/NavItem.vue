<template>
  <q-item clickable :to="to" active-class="text-primary bg-grey-9" exact v-ripple>
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>{{ label }}</q-item-section>
  </q-item>
</template>

<script setup>
defineProps({
  to: { type: String, required: true },
  icon: { type: String, required: true },
  label: { type: String, required: true }
})
</script>

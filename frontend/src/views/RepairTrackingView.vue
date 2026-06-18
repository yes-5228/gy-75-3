<script setup>
import { computed, reactive } from 'vue'
import { ListPlus } from 'lucide-vue-next'
import DataTable from '../components/DataTable.vue'
import SectionHeader from '../components/SectionHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'

defineProps({
  faults: { type: Array, required: true },
  logs: { type: Array, required: true },
})

const emit = defineEmits(['create'])

const MAX_COST = 1_000_000

const form = reactive({
  faultId: '',
  action: '',
  handler: '',
  status: 'In Progress',
  cost: 0,
})

const costError = computed(() => {
  const v = Number(form.cost)
  if (isNaN(v)) return 'Please enter a valid number'
  if (v < 0) return 'Cost must not be negative'
  if (v > MAX_COST) return `Cost must not exceed ${MAX_COST.toLocaleString()}`
  return ''
})

function submit() {
  if (costError.value) return
  emit('create', { ...form, faultId: Number(form.faultId), cost: Number(form.cost) })
  Object.assign(form, { faultId: '', action: '', handler: '', status: 'In Progress', cost: 0 })
}
</script>

<template>
  <div class="view-stack">
    <section class="panel">
      <SectionHeader title="Repair Tracking" description="Add progress, status, and repair cost" />
      <form class="form-grid" @submit.prevent="submit">
        <label>
          <span>Fault ticket</span>
          <select v-model="form.faultId" required>
            <option value="" disabled>Select fault ticket</option>
            <option v-for="fault in faults" :key="fault.id" :value="fault.id">
              #{{ fault.id }} {{ fault.elevatorCode }} - {{ fault.faultType }} - {{ fault.status }}
            </option>
          </select>
        </label>
        <label>
          <span>Handler</span>
          <input v-model="form.handler" required placeholder="Repair engineer" />
        </label>
        <label>
          <span>Status</span>
          <select v-model="form.status">
            <option>Pending</option>
            <option>In Progress</option>
            <option>Review</option>
            <option>Completed</option>
          </select>
        </label>
        <label>
          <span>Cost</span>
          <input v-model.number="form.cost" type="number" min="0" step="0.01" :max="MAX_COST" />
          <span v-if="costError" class="field-error">{{ costError }}</span>
        </label>
        <label class="wide">
          <span>Action log</span>
          <textarea v-model="form.action" required rows="3" placeholder="Arrival, diagnosis, replacement, and review notes"></textarea>
        </label>
        <button class="primary-action" type="submit" :disabled="!!costError">
          <ListPlus :size="17" />
          <span>Add Tracking</span>
        </button>
      </form>
    </section>

    <section class="panel">
      <SectionHeader title="Tracking Details" description="Repair process and status changes" />
      <DataTable
        :columns="[
          { key: 'createdAt', label: 'Time' },
          { key: 'faultId', label: 'Fault' },
          { key: 'handler', label: 'Handler' },
          { key: 'status', label: 'Status' },
          { key: 'cost', label: 'Cost' },
          { key: 'action', label: 'Action' },
        ]"
        :rows="logs"
      >
        <template #faultId="{ row }">#{{ row.faultId }}</template>
        <template #status="{ row }">
          <StatusBadge :value="row.status" />
        </template>
        <template #cost="{ row }">${{ row.cost }}</template>
      </DataTable>
    </section>
  </div>
</template>

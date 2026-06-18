<script setup>
import { computed, reactive, ref } from 'vue'
import { ListPlus, Loader2 } from 'lucide-vue-next'
import { repairApi } from '../api/modules'
import DataTable from '../components/DataTable.vue'
import SectionHeader from '../components/SectionHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'

defineProps({
  faults: { type: Array, required: true },
  logs: { type: Array, required: true },
})

const emit = defineEmits(['created'])

const MAX_COST = 1_000_000

const form = reactive({
  faultId: '',
  action: '',
  handler: '',
  status: 'In Progress',
  cost: 0,
})

const submitting = ref(false)
const submitError = ref('')

const costError = computed(() => {
  const v = Number(form.cost)
  if (isNaN(v)) return '请输入有效的数字'
  if (v < 0) return '费用不能为负数'
  if (v > MAX_COST) return `费用不能超过 ${MAX_COST.toLocaleString()}`
  return ''
})

function resetForm() {
  Object.assign(form, {
    faultId: '',
    action: '',
    handler: '',
    status: 'In Progress',
    cost: 0,
  })
}

function clearErrors() {
  submitError.value = ''
}

async function submit() {
  clearErrors()
  if (costError.value) return
  submitting.value = true
  try {
    await repairApi.createTracking({
      ...form,
      faultId: Number(form.faultId),
      cost: Number(form.cost),
    })
    resetForm()
    emit('created')
  } catch (err) {
    submitError.value = err.message || '提交失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="view-stack">
    <section class="panel">
      <SectionHeader title="Repair Tracking" description="Add progress, status, and repair cost" />
      <form class="form-grid" @submit.prevent="submit">
        <label>
          <span>Fault ticket</span>
          <select v-model="form.faultId" required :disabled="submitting">
            <option value="" disabled>Select fault ticket</option>
            <option v-for="fault in faults" :key="fault.id" :value="fault.id">
              #{{ fault.id }} {{ fault.elevatorCode }} - {{ fault.faultType }} - {{ fault.status }}
            </option>
          </select>
        </label>
        <label>
          <span>Handler</span>
          <input v-model="form.handler" required placeholder="Repair engineer" :disabled="submitting" />
        </label>
        <label>
          <span>Status</span>
          <select v-model="form.status" :disabled="submitting">
            <option>Pending</option>
            <option>In Progress</option>
            <option>Review</option>
            <option>Completed</option>
          </select>
        </label>
        <label>
          <span>Cost</span>
          <input v-model.number="form.cost" type="number" min="0" step="0.01" :max="MAX_COST" :disabled="submitting" />
          <span v-if="costError" class="field-error">{{ costError }}</span>
        </label>
        <label class="wide">
          <span>Action log</span>
          <textarea v-model="form.action" required rows="3" placeholder="Arrival, diagnosis, replacement, and review notes" :disabled="submitting"></textarea>
        </label>
        <div v-if="submitError" class="form-notice error">{{ submitError }}</div>
        <button class="primary-action" type="submit" :disabled="submitting || !!costError">
          <Loader2 v-if="submitting" :size="17" class="spin" />
          <ListPlus v-else :size="17" />
          <span>{{ submitting ? '提交中...' : 'Add Tracking' }}</span>
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

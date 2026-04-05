<template>
  <CommonDialog v-model="visible" title="设置密码" width="400px">
    <ElForm>
      <ElFormItem label="密码">
        <ElInput
          v-model="localPassword"
          type="password"
          placeholder="请输入密码，留空则清除密码"
          show-password
        />
      </ElFormItem>
      <ElFormItem label="密码提示（可选）">
        <ElInput v-model="localHint" placeholder="输入提示信息" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" @click="handleConfirm">确认</ElButton>
    </template>
  </CommonDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import CommonDialog from '../../../components/common/CommonDialog.vue'

const props = defineProps<{
  password: string
  passwordHint: string
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  confirm: [password: string, hint: string]
}>()

const visible = ref(false)
const localPassword = ref('')
const localHint = ref('')

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (val) {
    localPassword.value = props.password
    localHint.value = props.passwordHint
  }
})

function handleConfirm() {
  emit('confirm', localPassword.value, localHint.value)
  visible.value = false
}
</script>

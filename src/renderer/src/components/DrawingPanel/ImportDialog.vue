<template>
  <el-dialog
    v-model="visible"
    title="Select a type to import"
    width="400px"
    :before-close="handleClose"
    align-center
  >
    <div class="import-options">
      <div class="option-card" @click="handleFolderImport">
        <div class="option-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
          </svg>
        </div>
        <div class="option-content">
          <h3>Import directory</h3>
          <p>Select the directory containing images</p>
        </div>
      </div>

      <div class="option-card" @click="handleVideoImport">
        <div class="option-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
          </svg>
        </div>
        <div class="option-content">
          <h3>Import video</h3>
          <p>Select a video and divide in frames</p>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ImportDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'import-folder', 'import-video'],
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  methods: {
    handleClose() {
      this.visible = false;
    },
    handleFolderImport() {
      this.$emit('import-folder');
      this.visible = false;
    },
    handleVideoImport() {
      this.$emit('import-video');
      this.visible = false;
    }
  }
};
</script>

<style scoped>
.import-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
}

.option-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.option-card:hover {
  border-color: #409eff;
  background: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.option-icon {
  margin-right: 16px;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.option-content p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}
</style>

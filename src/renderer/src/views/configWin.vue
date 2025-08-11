<script setup>
    import { ref, reactive, onMounted } from 'vue'
    
    const configForm = reactive({
        apiURL: '',
        apiKEY: '',
        MODEL: '',
        summaryModule: '',
    })
    const isLoading = ref(false);
    
    const submitForm = () => {
        window.localStorage.setItem('apiURL', configForm.apiURL)
        window.localStorage.setItem('apiKEY', configForm.apiKEY)
        window.localStorage.setItem('MODEL', configForm.MODEL)
        window.localStorage.setItem('summaryModule', configForm.summaryModule)
        window.api.invoke('renderer-to-main', {
            name: "save-config",
            event: "event",
            data:{
                'apiURL': configForm.apiURL,
                'apiKEY': configForm.apiKEY,
                'MODEL': configForm.MODEL,
                'summaryModule': configForm.summaryModule,
            }
        });
        alert("Config Saved")
    };

    onMounted(() => {
        configForm.apiURL = window.localStorage.getItem("apiURL");
        configForm.apiKEY = window.localStorage.getItem("apiKEY");
        configForm.MODEL = window.localStorage.getItem("MODEL");
        configForm.summaryModule = window.localStorage.getItem("summaryModule");
    });

    async function testAPI(){
        isLoading.value = true;
        const res = await window.api.invoke('renderer-to-main-async', {
            name: "test-api",
            event: "asyncevent",
            data:{
                'apiURL': configForm.apiURL,
                'apiKEY': configForm.apiKEY,
                'request':{
                    model: configForm.MODEL,
                    messages: [
                        {
                            role: "user",
                            content: "Hi, I\'m testing your API. If you can response to this message, please return \'Hi Miaa, I'm {{Your_Model_Name}}. Your API is ok.\' with the Your_Model_Name is the name of you."
                        },
                    ]
                }
            }
        });
        alert(res);
        isLoading.value = false;
    }
</script>

<template>
    <el-form
        v-loading="isLoading"
        ref="configFormTag"
        :model="configForm"
        class="configForm"
    >
        <el-form-item label="apiURL">
            <el-input 
                id="apiURL"
                v-model="configForm.apiURL"
                autocomplete="off"
            />
        </el-form-item>
        <el-form-item label="apiKEY">
            <el-input
                id="apiKEY"
                v-model="configForm.apiKEY"
                autocomplete="off"
            />
        </el-form-item>
        <el-form-item label="MODEL">
            <el-input
                id="MODEL"
                v-model="configForm.MODEL"
                autocomplete="off"
            />
        </el-form-item>
        <el-form-item label="summaryModule">
            <el-input
                id="summary module"
                v-model="configForm.summaryModule"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 4 }"
                autocomplete="off"
                placeholder="Input the summary module..."
            />
        </el-form-item>
        <el-form-item>
        <el-button type="default" @click="submitForm()">
            Save
        </el-button>
        <el-button type="default" @click="testAPI()">
            Test API
        </el-button>
        </el-form-item>
    </el-form>
</template>

<style scoped>

.configForm {
    width: 560px;
    height: 350px;
    padding: 20px 20px 0px 20px;
}

.configForm .el-input {
    width: 80%;
}

.configForm .el-textarea {
    width: 80%;
}

</style>
  
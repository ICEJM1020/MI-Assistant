<script setup>
    import { ref, reactive, onMounted } from 'vue'
    
    const configForm = reactive({
        apiURL1: '',
        apiURL2: '',
        apiKEY1: '',
        apiKEY2: '',
        MODEL1: '',
        MODEL2: '',
        summaryModule: '',
    })
    const isLoading1 = ref(false);
    const isLoading2 = ref(false);
    
    const submitForm = () => {
        window.localStorage.setItem('apiURL1', configForm.apiURL1)
        window.localStorage.setItem('apiURL2', configForm.apiURL2)
        window.localStorage.setItem('apiKEY1', configForm.apiKEY1)
        window.localStorage.setItem('apiKEY2', configForm.apiKEY2)
        window.localStorage.setItem('MODEL1', configForm.MODEL1)
        window.localStorage.setItem('MODEL2', configForm.MODEL2)
        window.localStorage.setItem('summaryModule', configForm.summaryModule)
        window.api.invoke('renderer-to-main', {
            name: "save-config",
            event: "event",
            data:{
                'apiURL1': configForm.apiURL1,
                'apiURL2': configForm.apiURL2,
                'apiKEY1': configForm.apiKEY1,
                'apiKEY2': configForm.apiKEY2,
                'MODEL1': configForm.MODEL1,
                'MODEL2': configForm.MODEL2,
                'summaryModule': configForm.summaryModule,
            }
        });
        alert("Config Saved")
    };

    onMounted(() => {
        configForm.apiURL1 = window.localStorage.getItem("apiURL1");
        configForm.apiURL2 = window.localStorage.getItem("apiURL2");
        configForm.apiKEY1 = window.localStorage.getItem("apiKEY1");
        configForm.apiKEY2 = window.localStorage.getItem("apiKEY2");
        configForm.MODEL1 = window.localStorage.getItem("MODEL1");
        configForm.MODEL2 = window.localStorage.getItem("MODEL2");
        configForm.summaryModule = window.localStorage.getItem("summaryModule");
    });

    async function testAPI1(){
        console.log("hello");
        isLoading1.value = true;
        const res = await window.api.invoke('renderer-to-main-async', {
            name: "test-api",
            event: "asyncevent",
            data:{
                'apiURL': configForm.apiURL1,
                'apiKEY': configForm.apiKEY1,
                'request':{
                    model: configForm.MODEL1,
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
        isLoading1.value = false;
    }
    async function testAPI2(){
        isLoading2.value = true;
        const res = await window.api.invoke('renderer-to-main-async', {
            name: "test-api",
            event: "asyncevent",
            data:{
                'apiURL': configForm.apiURL2,
                'apiKEY': configForm.apiKEY2,
                'request':{
                    model: configForm.MODEL2,
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
        isLoading2.value = false;
    }
</script>

<template>
    <el-form
        v-loading="isLoading1 && isLoading2"
        ref="configFormTag"
        :model="configForm"
        class="configForm"
    >
        <el-card>
            <template #header>
                <div>
                    <span class="section-title">Check & Summary API</span>
                </div>
            </template>
            <el-form-item label="apiURL">
                <el-input 
                    id="apiURL1"
                    v-model="configForm.apiURL1"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="apiKEY">
                <el-input
                    id="apiKEY1"
                    v-model="configForm.apiKEY1"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="MODEL">
                <el-input
                    id="MODEL1"
                    v-model="configForm.MODEL1"
                    autocomplete="off"
                />
            </el-form-item>
            <el-button type="default" @click="testAPI1()">
                Test API
            </el-button>
        </el-card>

        <el-card>
            <template #header>
                <div>
                    <span class="section-title">Keypoints Generation API</span>
                </div>
            </template>
            <el-form-item label="apiURL">
                <el-input 
                    id="apiURL2"
                    v-model="configForm.apiURL2"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="apiKEY">
                <el-input
                    id="apiKEY2"
                    v-model="configForm.apiKEY2"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="MODEL">
                <el-input
                    id="MODEL2"
                    v-model="configForm.MODEL2"
                    autocomplete="off"
                />
            </el-form-item>
            <el-button type="default" @click="testAPI2()">
                Test API
            </el-button>
        </el-card>

        <el-card>
            <template #header>
                <div>
                    <span class="section-title">summary module settings</span>
                </div>
            </template>
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
        </el-card>

        <el-form-item>
            <el-button type="default" @click="submitForm()">
                Save
            </el-button>
        </el-form-item>
    </el-form>
</template>

<style scoped>

.configForm {
    width: 560px;
    padding: 20px 20px 0px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.configForm .el-card {
    width: 95%;
    margin-bottom: 30px;
}

.configForm .el-input {
    width: 95%;
}

.configForm .el-textarea {
    width: 95%;
}

</style>
  
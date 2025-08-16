<script setup>
    import { ref, reactive, onMounted } from 'vue'
    
    const configForm = reactive({
        checkSumApiURL: '',
        checkSumApiKey: '',
        checkSumModel: '',

        keyGenApiURL: '',
        keyGenApiKey: '',
        keyGenModel: '',

        audio2TextApiKey: '',
        audio2TextApiSecret: '',
        audio2TextApiID: '',

        summaryModule: '',
    })
    const isLoading1 = ref(false);
    const isLoading2 = ref(false);
    
    const submitForm = () => {
        window.localStorage.setItem('checkSumApiURL', configForm.checkSumApiURL)
        window.localStorage.setItem('checkSumApiKey', configForm.checkSumApiKey)
        window.localStorage.setItem('checkSumModel', configForm.checkSumModel)

        window.localStorage.setItem('keyGenApiURL', configForm.keyGenApiURL)
        window.localStorage.setItem('keyGenApiKey', configForm.keyGenApiKey)
        window.localStorage.setItem('keyGenModel', configForm.keyGenModel)

        window.localStorage.setItem('audio2TextApiKey', configForm.audio2TextApiKey)
        window.localStorage.setItem('audio2TextApiSecret', configForm.audio2TextApiSecret)
        window.localStorage.setItem('audio2TextApiID', configForm.audio2TextApiID)

        window.localStorage.setItem('summaryModule', configForm.summaryModule)

        window.api.invoke('renderer-to-main', {
            name: "save-config",
            event: "event",
            data:{
                'checkSumApiURL': configForm.checkSumApiURL,
                'checkSumApiKey': configForm.checkSumApiKey,
                'checkSumModel': configForm.checkSumModel,

                'keyGenApiURL': configForm.keyGenApiURL,
                'keyGenApiKey': configForm.keyGenApiKey,
                'keyGenModel': configForm.keyGenModel,

                'audio2TextApiKey': configForm.audio2TextApiKey,
                'audio2TextApiSecret': configForm.audio2TextApiSecret,
                'audio2TextApiID': configForm.audio2TextApiID,

                'summaryModule': configForm.summaryModule,
            }
        });
        alert("Config Saved")
    };

    onMounted(() => {
        configForm.checkSumApiURL = window.localStorage.getItem("checkSumApiURL");
        configForm.checkSumApiKey = window.localStorage.getItem("checkSumApiKey");
        configForm.checkSumModel = window.localStorage.getItem("checkSumModel");

        configForm.keyGenApiURL = window.localStorage.getItem("keyGenApiURL");
        configForm.keyGenApiKey = window.localStorage.getItem("keyGenApiKey");
        configForm.keyGenModel = window.localStorage.getItem("keyGenModel");

        configForm.audio2TextApiKey = window.localStorage.getItem('audio2TextApiKey')
        configForm.audio2TextApiSecret = window.localStorage.getItem('audio2TextApiSecret')
        configForm.audio2TextApiID = window.localStorage.getItem('audio2TextApiID')
        
        configForm.summaryModule = window.localStorage.getItem("summaryModule");
    });

    async function testcheckSumApi(){
        console.log("hello");
        isLoading1.value = true;
        const res = await window.api.invoke('renderer-to-main-async', {
            name: "test-api",
            event: "asyncevent",
            data:{
                'apiURL': configForm.checkSumApiURL,
                'apiKEY': configForm.checkSumApiKey,
                'request':{
                    model: configForm.checkSumModel,
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
    async function testkeyGenApi(){
        isLoading2.value = true;
        const res = await window.api.invoke('renderer-to-main-async', {
            name: "test-api",
            event: "asyncevent",
            data:{
                'apiURL': configForm.keyGenApiURL,
                'apiKEY': configForm.keyGenApiKey,
                'request':{
                    model: configForm.keyGenModel,
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
                    <span class="section-title">Check & Summary Chat API</span>
                </div>
            </template>
            <el-form-item label="apiURL">
                <el-input 
                    id="checkSumApiURL"
                    v-model="configForm.checkSumApiURL"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="apiKEY">
                <el-input
                    id="checkSumApiKey"
                    v-model="configForm.checkSumApiKey"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="MODEL">
                <el-input
                    id="checkSumModel"
                    v-model="configForm.checkSumModel"
                    autocomplete="off"
                />
            </el-form-item>
            <el-button type="default" @click="testcheckSumApi()">
                Test API
            </el-button>
        </el-card>

        <el-card>
            <template #header>
                <div>
                    <span class="section-title">Keypoints Generation Chat API</span>
                </div>
            </template>
            <el-form-item label="apiURL">
                <el-input 
                    id="keyGenApiURL"
                    v-model="configForm.keyGenApiURL"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="apiKEY">
                <el-input
                    id="keyGenApiKey"
                    v-model="configForm.keyGenApiKey"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="MODEL">
                <el-input
                    id="keyGenModel"
                    v-model="configForm.keyGenModel"
                    autocomplete="off"
                />
            </el-form-item>
            <el-button type="default" @click="testkeyGenApi()">
                Test API
            </el-button>
        </el-card>

        <el-card>
            <template #header>
                <div>
                    <span class="section-title">Audio2Text API</span>
                </div>
            </template>
            <el-form-item label="apiKEY">
                <el-input 
                    id="audio2TextApiKey"
                    v-model="configForm.audio2TextApiKey"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="apiSECRET">
                <el-input
                    id="audio2TextApiSecret"
                    v-model="configForm.audio2TextApiSecret"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="apiID">
                <el-input
                    id="audio2TextApiID"
                    v-model="configForm.audio2TextApiID"
                    autocomplete="off"
                />
            </el-form-item>
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
  
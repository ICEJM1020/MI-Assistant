<script lang="js" setup>

import { ref, reactive, computed, watch } from 'vue'
import 'element-plus/theme-chalk/display.css'

import { useTestListStore, usePointStore } from '@store/index'

import { useMediaRecordingStore } from '@store/mediaRecordingStore'
import usePatientInfoStore from '@store/patientInfoStore'

const summary_area = ref("")
const recording_area = ref("")
const prev_recording = ref("")
const activeName = ref('first')
const scrollbar_max = ref(Math.floor(window.innerHeight * 0.42) + 'px')

const chosenTest = reactive({
    testName: ''
})
const testListStore = useTestListStore()
const testListOptions = computed(() => testListStore.testListOptions);

const pointsStore = usePointStore();
const checkPoints = computed(() => pointsStore.points);

const mediaRecordingStore = useMediaRecordingStore()

const patientInfoStore = usePatientInfoStore();

const updateStatus = ref('Unload')

let timer = null


function addTest() {
    window.api.invoke('renderer-to-main', {
        name: "create-addcat",
        event: "event",
        data: {}
    });
}

function getStatusClass(required) {
    return required === "required"
        ? "red"
        : required === "done"
            ? "green"
            : "yellow";
}

function getSummaryDescription() {
    if (recording_area.value != "") return "Waiting for response...";
    return "Waiting for your speaking";
}

async function loadPoints() {
    // const testName = chosenTest.testName;
    const points = await window.api.invoke('renderer-to-main-async', {
        name: "load-points",
        event: "asyncevent",
        data: {
            "teatName": chosenTest.testName
        }
    });
    if ("error" in points) {
        alert("Load Points File Failed");
    }
    else {
        pointsStore.setPoints(points);
        if (updateStatus != 'Updating') updateStatus.value = 'Loaded';
        updateKeypoints();
    }
}

async function summarize() {
    const points = pointsStore.points;
    const userText = {
        'report': recording_area.value,
        'keypoints': points.reduce((acc, item) => {
                    acc.push({
                        'title': item.title,
                        'importance': item.importance,
                        'explanation': item.explanation
                    });
                    return acc;
                }, []),
    };
    const messages = [
        { "role": "user", "content": JSON.stringify(userText) },
    ];
    const res = await window.api.invoke('renderer-to-main-async', {
        name: 'summarize-chat',
        event: 'asyncevent',
        data: {
            'apiURL': window.localStorage.getItem("apiURL1"),
            'apiKEY': window.localStorage.getItem("apiKEY1"),
            'request': {
                model: window.localStorage.getItem("MODEL1"),
                messages: messages,
            }
        }
    });


    try {
        const regex = /<json>([\s\S]*?)<\/json>/;
        const match = res.match(regex);
        const res_json = JSON.parse(match[1]);
        return res_json["summary"];
    } catch (error) {
        console.error("Parse json failed: ", error);
    }
    return "Failed to parse JSON";
}

async function updateKeypoints() {
    if (updateStatus.value == "Unload" || updateStatus.value == "Updating" || recording_area.value == "") {return ;}
    updateStatus.value = 'Updating';
    const points = pointsStore.points;
    const userText = {
        'report': recording_area.value,
        'keypoints': points.reduce((acc, item) => {
                    acc.push({
                        'title': item.title,
                        'importance': item.importance,
                        'explanation': item.explanation
                    });
                    return acc;
                }, []),
    };
    const messages = [
        { "role": "user", "content": JSON.stringify(userText) },
    ];
    const res = await window.api.invoke('renderer-to-main-async', {
        name: 'updkeys-chat',
        event: 'asyncevent',
        data: {
            'apiURL': window.localStorage.getItem("apiURL1"),
            'apiKEY': window.localStorage.getItem("apiKEY1"),
            'request': {
                model: window.localStorage.getItem("MODEL1"),
                messages: messages,
            }
        }
    });

    try {
        const regex = /<json>([\s\S]*?)<\/json>/;
        const match = res.match(regex);
        const res_json = JSON.parse(match[1]);
        pointsStore.setPoints(res_json["key_points"]);
        updateStatus.value = 'Updated';
    } catch (error) {
        console.error("Parse json failed: ", error);
    }
}

watch(
    () => mediaRecordingStore.recognizedText,
    (newVal) => {
        recording_area.value = prev_recording.value + (newVal || "")
    }
)

watch(
    () => mediaRecordingStore.finishRecording,
    (newVal) => {
        if (newVal === true) {
            prev_recording.value = recording_area.value;
        }
    }
)

watch(
    () => activeName.value,
    async (newVal) => {
        if (newVal === 'second' && recording_area.value != "") {
            const result = await summarize();
            summary_area.value = result;
            patientInfoStore.setSummaryContent(result);
        }
    }
)

watch(
    () => recording_area.value,
    async (newVal) => {
        if (mediaRecordingStore.finishRecording == true) {
            prev_recording.value = newVal;
        }
        patientInfoStore.setRawReport(newVal);
        if (timer) {
            clearTimeout(timer);
        }
        if (newVal != "") {
            timer = setTimeout(() => {
                updateKeypoints();
            }, 2000);
        }
    }
)

watch(
    () => summary_area.value,
    (newVal) => {
        if (newVal != "") {
            patientInfoStore.setSummaryContent(newVal);
        }
    }
)

watch(
    () => patientInfoStore.switchPatient,
    async (newVal) => {
        if (newVal) {
            let readReport = await window.api.invoke('renderer-to-main-async', {
                name: "load-report",
                event: "asyncevent",
                data: {
                    'patient': patientInfoStore.currentPatient,
                }
            });
            const rawReport = readReport.rawReport;
            recording_area.value = rawReport;
            patientInfoStore.setSwitchPatient(false);
        }
    }
)

</script>

<template>
    <el-col :span="24" class="style-color-3 report-panel">
        <el-row :span="24" class="report-aims style-color-2">
            <el-col :span="24">
                <el-row>
                    <h1 style="text-align: left;">Image Catalog Name</h1>
                </el-row>
                <el-row :span="24">
                    <el-form :model="chosenTest" label-width="auto" style="width: 100%;">
                        <el-form-item>
                            <el-col :span="18">
                                <el-select v-model="chosenTest.testName" filterable placeholder="Please select"
                                    @change="loadPoints">
                                    <el-option v-for="option in testListOptions" :key="option.key" :label="option.label"
                                        :value="option.value" />
                                </el-select>
                            </el-col>
                            <el-col :span="6">
                                <el-button @click="addTest" round>Add</el-button>
                            </el-col>
                        </el-form-item>
                    </el-form>
                </el-row>
            </el-col>
        </el-row>

        <el-row :span="24" hidden-sm-only class="report-divider">
        </el-row>

        <el-row :span="24" class="report-items style-color-2">
            <div class="keypoints-container">
                <h1 class="keypoints-title">Key Points</h1>
                <div class="status-indicator">{{ updateStatus }}</div>
            </div>
            <el-scrollbar class="scrollbar">
                <div v-for="point in checkPoints" :key="point.title" class="scrollbar-demo-item">
                    <el-tooltip class="box-item" effect="dark" :content="point.explanation" placement="left"
                        popper-class="point-tooltip">
                        <div class="scrollbar-item">
                            <span class="status-light" :class="getStatusClass(point.importance)"></span>
                            <span style="font-size: large;">{{ point.title }}</span>
                        </div>
                    </el-tooltip>
                </div>
            </el-scrollbar>
        </el-row>

        <el-row :span="24" hidden-sm-only class="report-divider">
        </el-row>

        <el-row :span="24" class="report-summary style-color-2">
            <el-tabs v-model="activeName" class="demo-tabs" type="border-card">
                <el-tab-pane label="Raw Speaking" name="first" style="width: 100%;">
                    <el-input
                        v-model="recording_area"
                        type="textarea"
                        resize="none"
                        :autosize="{ minRows: 7, maxRows: 7 }"
                        placeholder="Waiting for your speaking"
                    />
                </el-tab-pane>
                <el-tab-pane label="Auto Summary" name="second" style="width: 100%;">
                    <el-input 
                        v-model="summary_area"
                        type="textarea"
                        resize="none"
                        :autosize="{ minRows: 7, maxRows: 7 }"
                        :placeholder=getSummaryDescription()
                    />
                </el-tab-pane>
            </el-tabs>
        </el-row>
    </el-col>
</template>

<style scoped>
h1 {
    margin: 0px;
}

.keypoints-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 10px;
}

.keypoints-title {
    font-size: 1.5rem;
    font-weight: bold;
}

.status-indicator {
    display: flex;
    background-color: white;
    color: black;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 10px;
}

.report-panel {
    padding-top: 5%;
    padding-bottom: 5%;
    height: 100%;
}

.report-divider {
    height: 2%;
}

.report-aims {
    height: 10%;
    border-radius: 2%;
    padding: 10px;
}

.report-items {
    flex-direction: column;
    height: 57%;
    border-radius: 2%;
    padding: 10px;
}

.report-items .el-scrollbar {
    width: 100%;
}

.report-summary {
    height: 30%;
    padding: 10px;
    border-radius: 2%;
}

.report-summary .el-input {
    resize: none;
    height: 100%;
}

.scrollbar {
    width: 100%;
    max-height: v-bind(scrollbar_max);
}

.scrollbar-demo-item {
    width: 95%;
    display: flex;
    align-items: center;
    justify-content: left;
    height: 50px;
    margin: 10px;
    text-align: left;
    border-radius: 4px;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
}

.demo-tabs {
    width: 100%;
}

.demo-tabs>.el-tabs__content {
    width: 100%;
    padding: 16px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
}

.scrollbar-item {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    cursor: pointer;
    width: 100%;
}

.box-item {
    margin-top: 10px;
}

.point-tooltip {
    width: 250px !important;
    /* Set your desired width */
    white-space: normal;
    /* Allow text to wrap */
    word-break: break-word;
}

.status-light {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    margin-right: 8px;
}

.red {
    background-color: red;
}

.green {
    background-color: green;
}

.yellow {
    background-color: yellow;
}
</style>
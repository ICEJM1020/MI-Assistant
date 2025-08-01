<script>
    import VueDrawCanvas from "@thomas.fortin/vue-draw-canvas";
    import ControlPanle from "./ControlPanle.vue";
    import useDrawPanelStore from '@store/drawPanelStore';
    import usePatientInfoStore from '@store/patientInfoStore';
    import { ref } from "vue";

    const canvasWidth = ref(window.innerWidth * 0.68);
    const canvasHeight = ref((canvasWidth.value / 16 )* 9);

    export default {
        name: "DrawCanvas",
        components: {
            VueDrawCanvas,
            ControlPanle
        },
        data() {
            return {
                initialImage: [],
                width: canvasWidth,
                height: canvasHeight,
                x: 0,
                y: 0,
                image: "",
                eraser:  false,
                disabled: false,
                fillShape: false,
                line: 5,
                color: "#00FF00",
                strokeType: "dash",
                lineCap: "round",
                lineJoin: "round",
                backgroundColor: "#FFFFFF",
                backgroundImage: "",
                watermark: null,
                additionalImages: [],
                imageSrc: "",
                currentImgURL: "",
                canvasStore: null,

                previousBackgroundID: 0,
                currentBackgroundID: 0,
                history: {},
                currentPatient: "blank",
                previousPatient: "blank",
                patientInfoStore: null,

                canvasActive: false,
                saveTimeout: null,
            };
        },
        computed: {
            canvasEraser() {
                const store = useDrawPanelStore();
                return store.canvasEraser; // This value is reactive
            },
            canvasDisabled() {
                const store = useDrawPanelStore();
                return store.canvasDisable; // This value is reactive
            },
            canvasLine() {
                const store = useDrawPanelStore();
                return store.canvasLine; // This value is reactive
            },
            canvasPatient() {
                const store = usePatientInfoStore();
                return store.currentPatient;
            },
            canvasBackground() {
                const store = useDrawPanelStore();
                return store.canvasBackground;
            },
            patientRawReport() {
                const store = usePatientInfoStore();
                return store.rawReport;
            },
            patientSummay() {
                const store = usePatientInfoStore();
                return store.summaryContent;
            }
        },
        watch: {
            // Watch the computed property for changes and update the data property
            canvasEraser(newValue) {
                this.eraser = newValue;
            },
            canvasDisabled(newValue) {
                this.disabled = newValue;
            },
            canvasLine(newValue) {
                this.line = newValue;
            },
            canvasPatient(newValue) {
                this.previousPatient = this.currentPatient;
                this.currentPatient = newValue;
            },
            async canvasBackground(newValue) {
                this.previousBackgroundID = this.currentBackgroundID;
                this.currentBackgroundID = this.canvasStore.canvasBackgroundID;
                if (this.patientInfoStore.switchPatient) {
                    this.saveReportData(this.previousPatient, this.previousBackgroundID);
                    this.saveCanvasData(this.previousPatient, this.previousBackgroundID);
                }
                else this.saveCanvasData(this.currentPatient, this.previousBackgroundID);
                this.$refs.VueCanvasDrawing.reset();

                if (newValue) {
                    const fitImg = await this.resizeImageToFitCanvas(
                        newValue,
                        this.width,
                        this.height
                    );
                    this.backgroundImage = fitImg;
                } else {
                    this.backgroundImage = "";
                }
                await this.$refs.VueCanvasDrawing.redraw(true);
                await this.$nextTick();
                
                await this.loadCanvasData(this.currentPatient, this.currentBackgroundID);
                await this.$refs.VueCanvasDrawing.redraw(true);
            },
            patientRawReport(newVal) {
                this.saveReportData(this.currentPatient, this.currentBackgroundID);
            },
            patientSummay(newVal) {
                console.log('summary');
                this.saveReportData(this.currentPatient, this.currrentBackgroundID);
            },
        },
        mounted() {
            this.canvasStore = useDrawPanelStore();
            this.canvasStore.setCanvasRef(this.$refs.VueCanvasDrawing);
            this.patientInfoStore = usePatientInfoStore();
            document.addEventListener('keydown', this.handleKeyDown);
            this.$nextTick(() => {
                const canvasEl = this.$el.querySelector('canvas');
                if (canvasEl) canvasEl.setAttribute('tabindex', '0');
            });
        },
        destroyed() {
            document.removeEventListener('keydown', this.handleKeyDown);
            // 清理定时器
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }
        },
        methods: {
            getCoordinate(event) {
                let coordinates = this.$refs.VueCanvasDrawing.getCoordinates(event);
                this.x = coordinates.x;
                this.y = coordinates.y;
            },
            resizeImageToFitCanvas(imageUrl, canvasWidth, canvasHeight) {
                return new Promise((resolve, reject) => {
                    const img = new window.Image();
                    img.crossOrigin = 'anonymous'; // 避免跨域问题
                    img.onload = function () {
                        const canvas = document.createElement('canvas');
                        canvas.width = canvasWidth;
                        canvas.height = canvasHeight;
                        const ctx = canvas.getContext('2d');

                        // 等比缩放并居中
                        const scale = Math.min(
                            canvasWidth / img.width,
                            canvasHeight / img.height
                        );
                        const newWidth = img.width * scale;
                        const newHeight = img.height * scale;
                        const offsetX = (canvasWidth - newWidth) / 2;
                        const offsetY = (canvasHeight - newHeight) / 2;

                        ctx.fillStyle = "#fff";
                        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

                        ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

                        resolve(canvas.toDataURL());
                    };
                    img.onerror = reject;
                    img.src = imageUrl;
                });
            },
            onImageUpdate(URL) {
                if (this.canvasStore) this.canvasStore.setCurrentImgURL(URL);
                // 防止频繁更新
                if (this.saveTimeout) {
                    clearTimeout(this.saveTimeout);
                }
                this.saveTimeout = setTimeout(() => {
                    this.saveCanvasData(this.currentPatient, this.currentBackgroundID);
                }, 500);
            },
            saveCanvasData(patient, id) {
                const drawer = this.$refs.VueCanvasDrawing;
                const canvasStrokes = JSON.parse(JSON.stringify(drawer.getAllStrokes()));
                const canvasImages = JSON.parse(JSON.stringify(drawer.images));
                const canvasTrash = JSON.parse(JSON.stringify(drawer.trash));
                this.history[id] = {
                    strokes: canvasStrokes,
                    images: canvasImages,
                    trash: canvasTrash,
                };
                window.api.invoke('renderer-to-main', {
                    name: "save-history",
                    event: "cevent",
                    data:{
                        'patient': patient,
                        'history': JSON.parse(JSON.stringify(this.history)),
                    }
                });
            },
            saveReportData(patient, id) {
                window.api.invoke('renderer-to-main', {
                    name: "save-report",
                    event: "cevent",
                    data:{
                        'patient': patient,
                        'report': {
                            'rawReport': this.patientInfoStore.rawReport,
                            'summary': this.patientInfoStore.summaryContent
                        }
                    }
                });
            },
            async loadCanvasData(patient, id) {
                this.history = await window.api.invoke('renderer-to-main-async', {
                    name: "load-history",
                    event: "asyncevent",
                    data: {
                        'patient': patient,
                    }
                });
                const drawer = this.$refs.VueCanvasDrawing;
                const canvasData = this.history[id] || {
                    strokes: [],
                    images: [],
                    trash: [],
                };
                drawer.images = [].concat(canvasData.images, drawer.images);
                drawer.trash = canvasData.trash;
            },
            handleKeyDown(event) {
                if (event.ctrlKey) {
                    const drawer = this.$refs.VueCanvasDrawing;
                    if (event.key === 's' || event.ket === 'S') {
                        this.saveCanvasData(this.currentPatient, this.currentBackgroundID);
                        this.saveReportData(this.currentPatient, this.currentBackgroundID);
                    }
                    if (!this.canvasActive) return;
                    if (event.key === 'z' || event.key === 'Z') drawer.undo();
                    if (event.key === 'y' || event.key === 'Y') drawer.redo();
                }
            },
            canvasFocus() { this.canvasActive = true; },
            canvasBlur() { this.canvasActive = false; },
        }
    };
</script>

<template>
    <el-col :span="24">
        <el-row :span="24" justify="center" class="canvas-panel">
            <div class="canvas">
                <VueDrawCanvas
                    ref="VueCanvasDrawing"
                    v-model:image="image"
                    :width="width"
                    :height="height"
                    :stroke-type="strokeType"
                    :line-cap="lineCap"
                    :line-join="lineJoin"
                    :fill-shape="fillShape"
                    :eraser="eraser"
                    :lineWidth="line"
                    :color="color"
                    :background-color="backgroundColor"
                    :background-image="backgroundImage"
                    :watermark="watermark"
                    :initial-image="initialImage"
                    saveAs="png"
                    :output-width="width"
                    :output-height="height"
                    :styles="{
                        border: 'solid 1px #000',
                    }"
                    :lock="disabled"
                    @mousemove="getCoordinate($event)"
                    :additional-images="additionalImages"
                    @update:image="onImageUpdate"
                    @focus="canvasFocus"
                    @blur="canvasBlur"
                />
            </div>
        </el-row>
    </el-col>
</template>

<style scoped>

h1 {
    font-size: 3em;
    line-height: 1.1;
}

canvas {
    width: 100%;
    background-color: transparent;
    border-color: rgb(159, 242, 207);
    border-radius: 2%;
}

.canvas-panel {
    padding: 10px;
}

</style>


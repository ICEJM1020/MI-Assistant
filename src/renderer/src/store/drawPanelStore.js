import { defineStore } from "pinia";

const useDrawPanelStore = defineStore('draw-panel', {
    state: () => ({
      canvasRef: null,
      canvasEraser: false,
      canvasDisable: false,
      canvasLine:5,
      canvasBackground: null,
      canvasBackgroundID: 0,
      canvasBackgroundName: "0",
      currentImgURL: "",
      isSwitching: false,
    }),
    actions: {
      setCanvasRef(ref) {
        this.canvasRef = ref;
      },
      setCanvasEraser(eraser) {
        this.canvasEraser = eraser;
      },
      setCanvasDisable(disable) {
        this.canvasDisable = disable;
      },
      setCanvasLine(line) {
        this.canvasLine = line;
      },
      setCanvasBackground(background) {
        this.canvasBackground = background;
      },
      setCurrentImgURL(URL) {
        this.currentImgURL = URL;
      },
      setCanvasBackgroundID(ID) {
        this.canvasBackgroundID = ID;
      },
      setCanvasBackgroundName(name) {
        this.canvasBackgroundName = name;
      }
    }
  });

export default useDrawPanelStore;
  
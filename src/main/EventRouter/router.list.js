import EventRouter from "./EventRouter";
import { loadExistedTestList, loadConfig, saveConfig, loadHistory, saveHistory, savePoints, loadPoints, saveReport, loadReport } from '../Functions/local.store'
import { testAPI, AddCatChat, Summarize, Updkeys } from '../Functions/llm'
import { createConfigWindow } from '../configView'
import { createAddCatWindow } from "../addCatView";
import { videoExtract } from '../Functions/video2frames';

const routers = new Array();

routers.push(
    new EventRouter(
        'show-info', // name
        'event', // evnet
        (api, data={}) => {
            api.dialog.showMessageBox({
                  type: 'info',
                  message: 'HCI@ISCAS : MedImageAssistant',
                  buttons: ['OK']
                })
        }
    )
)

// load local test configs
routers.push(
    new EventRouter(
        'testlist-get', // name
        'asyncevent', // evnet
        async (api, data={}) =>  {
            const testList = await loadExistedTestList();
            return testList;
        }
    )
)

routers.push(
    new EventRouter(
        'create-config',
        'event',
        (api, data={}) => {
            createConfigWindow();
        }
    )
)


routers.push(
    new EventRouter(
        'create-addcat',
        'event',
        (api, data={}) => {
            createAddCatWindow();
        }
    )
)


routers.push(
    new EventRouter(
        'request-config',
        'asyncevent', // evnet
        async (api, data={}) =>  {
            const config = await loadConfig();
            return config;
        }
    )
)


routers.push(
    new EventRouter(
        'save-config',
        'event',
        (api, data) => {
            saveConfig(data.data);
        }
    )
)


routers.push(
    new EventRouter(
        'load-history',
        'asyncevent',
        async (api, data={}) =>  {
            const history = await loadHistory(data.data);
            return history;
        }
    )
)


routers.push(
    new EventRouter(
        'save-history',
        'event',
        (api, data) => {
            saveHistory(data.data);
        }
    )
)


routers.push(
    new EventRouter(
        'load-report',
        'asyncevent',
        async (api, data={}) =>  {
            const report = await loadReport(data.data);
            return report;
        }
    )
)


routers.push(
    new EventRouter(
        'save-report',
        'event',
        (api, data) => {
            saveReport(data.data);
        }
    )
)


routers.push(
    new EventRouter(
        'save-points',
        'event',
        (api, data) => {
            savePoints(data.data);
        }
    )
)

routers.push(
    new EventRouter(
        'load-points',
        'asyncevent',
        async (api, data) =>  {
            const res = await loadPoints(data.data);
            return res;
        }
    )
)

routers.push(
    new EventRouter(
        'test-api',
        'asyncevent', // evnet
        async (api, data) =>  {
            const res = await testAPI(data.data);
            return res;
        }
    )
)

routers.push(
    new EventRouter(
        'addcat-chat', // name
        'asyncevent', // evnet
        async (api, data={}) =>  {
            const res = await AddCatChat(data.data);
            return res;
        }
    )
)

routers.push(
    new EventRouter(
        'summarize-chat',
        'asyncevent',
        async (api, data={}) => {
            const res = await Summarize(data.data);
            return res;
        }
    )
)

routers.push(
    new EventRouter(
        'updkeys-chat',
        'asyncevent',
        async (api, data={}) => {
            const res = await Updkeys(data.data);
            return res;
        }
    )
)

routers.push(
    new EventRouter(
        'extract-video-frames',
        'asyncevent',
        async (api, data={}) => {
            const videoPath = data.data.videoPath;
            return await videoExtract(videoPath);
        }
    )
)

routers.push(
    new EventRouter(
        'cancel-video-extraction',
        'event',
        (api, data={}) => {
            videoProcessor.cancelCurrentTask();
            return { success: true };
        }
    )
)

routers.push(
    new EventRouter(
        'get-video-extraction-status',
        'event',
        (api, data={}) => {
            return videoProcessor.getStatus();
        }
    )
)

export default routers;
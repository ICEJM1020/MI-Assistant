import axios from "axios";
import { get_sys_msg_addcat, get_sys_msg_summarize, get_sys_msg_updkeys } from "./prompts";

export async function testAPI(data){
    var res = "";
    await axios({
        url:data.apiURL,
        method:'POST',
        data: {
            ...data.request
        },
        headers:{
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer ' + data.apiKEY
        }
    })
    .then(function (response) {
        res = response.data.choices[0].message.content;
    })
    .catch(function (error) {
        const errs = error.response.data.error
        res = error.status + '\n' + errs.code + ' ' + errs.message;
    });
    return res
}


export async function AddCatChat(data){
    var res = "";
    const sys_msg_addcat = await get_sys_msg_addcat();
    const req = {
        model : data.request.model,
        messages : [sys_msg_addcat, ...data.request.messages]
    }

    await axios({
        url:data.apiURL,
        method:'POST',
        data: {
            ...req
        },
        headers:{
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer ' + data.apiKEY
        }
    })
    .then(function (response) {
        res = response.data.choices[0].message.content;
    })
    .catch(function (error) {
        const errs = error.response.data.error
        res = error.status + '\n' + errs.code + ' ' + errs.message;
    });
    return res
}

export async function Summarize(data){
    var res = "";
    const sys_msg_summarize = await get_sys_msg_summarize();
    const req = {
        model : data.request.model,
        messages : [sys_msg_summarize, ...data.request.messages]
    }

    await axios({
        url:data.apiURL,
        method:'POST',
        data: {
            ...req
        },
        headers:{
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer ' + data.apiKEY
        }
    })
    .then(function (response) {
        res = response.data.choices[0].message.content;
    })
    .catch(function (error) {
        const errs = error.response.data.error
        res = error.status + '\n' + errs.code + ' ' + errs.message;
    });
    return res
}

export async function Updkeys(data){
    var res = "";
    const sys_msg_updkeys = get_sys_msg_updkeys();
    const req = {
        model : data.request.model,
        messages : [sys_msg_updkeys, ...data.request.messages]
    }

    await axios({
        url:data.apiURL,
        method:'POST',
        data: {
            ...req
        },
        headers:{
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer ' + data.apiKEY
        }
    })
    .then(function (response) {
        res = response.data.choices[0].message.content;
    })
    .catch(function (error) {
        const errs = error.response.data.error
        res = error.status + '\n' + errs.code + ' ' + errs.message;
    });
    return res
}
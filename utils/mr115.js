// 广州市平台点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let resubmit_num = 0;
let headers = {};


async function query_company(res) {
    const url = `${host}/tps-local/web/tender/plus/mcs/comb-delv/prod/mcs_delv_list`;
    const data = {"OrgName": res.delvEntpName, "tenditmId": res.tenditmId, "tenditmType": res.tenditmType};
    const res_json = await fetchPost(url, data, headers);
    if (res_json['code'] === 0 && res_json['data'] && res_json['data']['records'].length > 0) {
        for (const rr of res_json['data']['records']) {
            if (rr.delvEntpName.trim() === res.delvEntpName) {
                res.delvEntpCode = rr.delvEntpCode;
                return res;
            }
        }
        throw new Error(`未找到配送企业, 注册证编号: ${res.mcsRegno}, 所属项目: ${res.tenditmName}, 配送企业: ${res.delvEntpName}, 配送区域: ${res.admdvsName}, 查询结果: ${JSON.stringify(res_json['data'])}`);
    } else {
        throw new Error(`配送企业查询异常, 注册证编号: ${res.mcsRegno}, 所属项目: ${res.tenditmName}, 配送企业: ${res.delvEntpName}, 配送区域: ${res.admdvsName}, 响应值: ${JSON.stringify(res_json)}`);
    }
}

async function query_send_list(res) {
    const url = `${host}/tps-local/web/tender/diff/prod-entp-mcs/delv/schm/prod-list`;
    const data = {"tenditmId": "", "ttpCntrCfgId": "", "mcsRegno": res.mcsRegno, "current": 1, "size": 10, "tenditmType": res.tenditmType};
    const res_json = await fetchPost(url, data, headers);
    if (res_json['code'] === 0 && res_json['data'] && res_json['data']['records'].length > 0) {
        for (const rr of res_json['data']['records']) {
            if (rr.tenditmName.trim() === res.tenditmName) {
                res.tenditmId = rr.tenditmId;
                res.mcsRegcertName = rr.mcsRegcertName
                res.ttpCntrCfgId = rr.ttpCntrCfgId
                return res;
            }
        }
        throw new Error(`配送关系列表找不到数据。注册证编号: ${res.mcsRegno}, 所属项目: ${res.tenditmName}, 查询结果: ${JSON.stringify(res_json['data'])}`);
    } else {
        throw new Error(`配送关系列表查询异常, 注册证编号: ${res.mcsRegno}, 所属项目: ${res.tenditmName}, 查询结果: ${JSON.stringify(res_json)}`);
    }
}

async function query_send_setting_list(res) {
    const url = `${host}/tps-local/web/tender/diff/prod-entp-mcs/delv/schm/delv-list`;
    const data = {
        "mcsRegno": res.mcsRegno,
        "ttpCntrCfgId": res.ttpCntrCfgId,
        "tenditmId": res.tenditmId,
        "combFlag": 0,
        "admdvsName": res.admdvsName,
        "delvEntpName": res.delvEntpName,
        "schmCnfmStas": "",
        "current": 1,
        "size": 10,
        "tenditmType": res.tenditmType
    };
    const res_json = await fetchPost(url, data, headers);
    if (res_json['code'] === 0 && res_json['data']) {
        if (res_json['data']['records'].length > 0) {
            for (const rr of res_json['data']['records']) {
                if (rr.tenditmName.trim() === res.tenditmName && rr.admdvsName === res.admdvsName) {
                    if (rr.schmCnfmStas === "1" || rr.schmCnfmStas === "2") {
                        res.schmCnfmStas = rr.schmCnfmStas
                        return res;
                    }
                }
            }
            res.schmCnfmStas = res_json['data']['records'][0]['schmCnfmStas'];
            return res;
        } else {
            res.schmCnfmStas = "888666";
            return res;
        }
    } else {
        throw new Error(`设置配送企业列表查询异常, 注册证编号: ${res.mcsRegno}, 所属项目: ${res.tenditmName}, 配送企业: ${res.delvEntpName}, 配送区域: ${res.admdvsName}, 查询结果: ${JSON.stringify(res_json)}`);
    }
}

async function query_areas(res) {
    const url = `${host}/tps-local/web/tender/item/delv/queryByItemId?tenditmId=${res.tenditmId}&tenditmType=${res.tenditmType}&timestamp=${Date.now()}`;
    const res_json = await fetchGet(url, headers);
    if (res_json['code'] === 0 && res_json['data'] && res_json['data']['admdvsDTOS'].length > 0) {
        for (const rr of res_json['data']['admdvsDTOS']) {
            if (rr.admdvsName.trim() === res.admdvsName) {
                res.admdvs = rr.admdvs;
                return res;
            }
        }
        throw new Error(`找不到配色区域, 注册证编号: ${res.mcsRegno}, 所属项目: ${res.tenditmName}, 配送区域: ${res.admdvsName}, 查询结果: ${JSON.stringify(res_json)}`);
    } else {
        throw new Error(`配送区域查询为空, 注册证编号: ${res.mcsRegno}, 所属项目: ${res.tenditmName}, 配送区域: ${res.admdvsName}, 响应值: ${JSON.stringify(res_json)}`);
    }
}

async function submit_c(res) {
    const url = `${host}/tps-local/web/tender/diff/prod-entp-mcs/delv/schm/batchInsert`;
    const data = {
        "tenditmName": res.tenditmName,
        "num": 1,
        "admdvsList": [{ "admdvs": res.admdvs, "admdvsName": res.admdvsName }],
        "delvEntpCode": res.delvEntpCode,
        "delvEntpName": res.delvEntpName,
        "prodList": [
            {
                "tenditmId": res.tenditmId,
                "tenditmName": res.tenditmName,
                "mcsRegno": res.mcsRegno,
                "mcsRegcertName": res.mcsRegcertName,
                "ttpCntrCfgId": res.ttpCntrCfgId,
                "tenditmType": res.tenditmType
            }
        ],
        "tenditmType": res.tenditmType
    };
    const res_json = await fetchPost(url, data, headers);
    return res_json
}

async function set_peisong(res) {
    const url = `${host}/tps-local/web/tender/diff/prod-entp-mcs/delv/schm/batchInsert`;
    const data = {
        "tenditmId": res.tenditmId,
        "admdvsList": [{ "admdvs": res.admdvs, "admdvsName": res.admdvsName }],
        "delvEntpCode": res.delvEntpCode,
        "delvEntpName": res.delvEntpName,
        "prodList": [
            {
                "drtDelvFlag": "0",
                "tenditmId": res.tenditmId,
                "tenditmName": res.tenditmName,
                "mcsRegno": res.mcsRegno,
                "mcsRegcertName": res.mcsRegcertName,
                "ttpCntrCfgId": res.ttpCntrCfgId,
                "tenditmType": res.tenditmType
            }
        ],
        "tenditmType": res.tenditmType
    };
    const res_json = await fetchPost(url, data, headers);
    if (res_json.code === 0 && res_json.success) {
        exportText(`新增设置配送企业成功. 注册证编号: ${res.mcsRegno}, 所属项目: ${res.tenditmName}, 配送企业: ${res.delvEntpName}, 配送区域: ${res.admdvsName}`);
    } else {
        throw new Error(res_json.message);
    }
}

async function startTask115(dataList, header) {
    let total_num = 0;
    let success = 0;
    let resubmit_num = 0;
    headers = convertHeadersArrayToObject(header);
    headers['content-type'] = 'application/json;charset=UTF-8';
    try {
        for (let j = 0; j < dataList.length; j++) {
            let i = 0;
            const data = dataList[j];
            for (i; i < data.length; i++) {
                if (data[i][7] && String(data[i][7]).trim().indexOf('注册证编号') > 0) break;
            }
            i += 1;
            for (i; i < data.length; i++) {
                if (!data[i][7]) continue;
                total_num += 1;
                let ms_code = data[i][7].trim();
                let company = data[i][3].trim();
                let city = data[i][5].trim();
                let tenditmName = data[i][9].trim();
                if (ms_code && company && city && tenditmName) {
                    try {
                        let res = {"mcsRegno": ms_code, "admdvsName": city, "delvEntpName": company, "tenditmName": tenditmName, "tenditmType": "2"};
                        // 查询配送关系列表
                        res = await query_send_list(res);
                        // 查询设置配送企业列表
                        res = await query_send_setting_list(res);
                        res = await query_areas(res);
                        res = await query_company(res);
                        if (res.schmCnfmStas === '888666') {
                            exportText(`开始设置配送企业. 注册证编号: ${res.mcsRegno}, 所属项目: ${res.tenditmName}, 配送企业: ${res.delvEntpName}, 配送区域: ${res.admdvsName}`);
                            set_peisong(res);
                        } else {
                            if (res.schmCnfmStas !== "1" && res.schmCnfmStas !== "2") {
                                exportText(`设置配送企业列表的确认状态不是 待确认 或 已确认 状态, 注册证编号: ${res.mcsRegno}, 所属项目: ${res.tenditmName}, 配送企业: ${res.delvEntpName}, 配送区域: ${res.admdvsName}`);
                                continue;
                            }
                        }
                        let submit_res = await submit_c(res);
                        if (submit_res.code === 160003 && submit_res.message.indexOf("已经存在") > 0) {
                            resubmit_num += 1;
                            exportText(`已经配送过了, 注册证编号: ${res.mcsRegno}, 所属项目: ${res.tenditmName}, 配送企业: ${res.delvEntpName}, 配送区域: ${res.admdvsName}`);
                        } else if (submit_res.code === 0 && submit_res.success) {
                            success += 1;
                            exportText(`配送成功, 注册证编号: ${res.mcsRegno}, 所属项目: ${res.tenditmName}, 配送企业: ${res.delvEntpName}, 配送区域: ${res.admdvsName}`);
                        } else {
                            throw new Error(submit_res.message);
                        }
                    } catch (error) {
                        exportText(`${error.stack}`);
                    }
                } else {
                    exportText(`Excel表格中的数据不全, 注册证编号: ${ms_code}, 配送企业: ${company}, 配送区域: ${city}`);
                }
            }
        }
        exportText(`总数: ${total_num}, 配送成功: ${success}, 已经配送过: ${resubmit_num}, 配送失败: ${total_num - success - resubmit_num}`);
    } catch (error) {
        exportText(`失败, 请重试: ${error.stack}`);
    }
    exportText("已结束, 请刷新页面后继续操作 (^_^)");
    downloadData(textContainer.textContent);
}

window.myExtensionFuncs = {
  startTask115: (data, headers) => startTask115(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask115"] }, 
  "*"
);

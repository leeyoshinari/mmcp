// 吉林省点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};

async function query_company(res, times) {
    try {
        const url = `${host}/HSNN/CM/Trade/Web/Controller/DistributionController/QueryComs.HSNN?COMID=&COMNAME=${encodeURIComponent(res.company)}&SELECTRESTATUS=&GpartId=${res.PROCURECATALOGID}`;
        const data = {
            "_search": false,
            "rows": 10,
            "nd": new Date().getTime(),
            "sord": 'asc',
            "page": 1,
            "sidx": null
        };
        
        const res_json = await fetchPost(url, data, headers);
        if (res_json['rows'] && res_json['rows'].length > 0) {
            for (const rr of res_json['rows']) {
                const new_org_name = rr['COMNAME'].trim();
                if (new_org_name === res.company) {
                    res.COMID = rr['COMID'];
                    res.HTVALIDITYDATE = rr['HTVALIDITYDATE'];
                    res.SELECTRELATIONID = rr['SELECTRELATIONID'];
                    res.addcompany = false
                    return res;
                }
            }
            throw new Error(`配送企业查询到多个, 产品编号: ${res.code}, 配送企业: ${res.company}, 查询结果: ${JSON.stringify(res_json)}`);
        } else {
            if (times === 1) {
                res.addcompany = true
                exportText(`配送企业查询为空, 去添加配送企业, 产品编号: ${res.code}, 配送企业: ${res.company}, 响应值: ${JSON.stringify(res_json)}`);
                return res;
            } else {
                throw new Error(`配送企业查询为空, 产品编号: ${res.code}, 配送企业: ${res.company}, 响应值: ${JSON.stringify(res_json)}`);
            }
        }
    } catch (error) {
        throw error;
    }
}

async function add_company(res) {
    try {
        const url = `${host}/HSNN/CM/Trade/Web/Controller/DistributionController/GetComs.HSNN?COMID=&COMNAME=${encodeURIComponent(res.company)}&GpartId=${res.PROCURECATALOGID}`;
        const data = {
            "_search": false,
            "rows": 10,
            "nd": new Date().getTime(),
            "sord": 'asc',
            "page": 1,
            "sidx": null
        };
        
        const res_json = await fetchPost(url, data, headers);
        if (res_json['rows'] && res_json['rows'].length > 0) {
            for (const rr of res_json['rows']) {
                const new_org_name = rr['COMNAME'].trim();
                if (new_org_name === res.company) {
                    res.COMID = rr['COMID'];
                    const addUrl = `${host}/HSNN/CM/Trade/Web/Controller/DistributionController/AddteComPS.HSNN`;
                    const addData = {"ComId": rr['COMID'], "GpartId": res.PROCURECATALOGID}
                    const add_json = await fetchPost(addUrl, addData, headers);
                    if (add_json['result'] !== 'ok') {
                        throw new Error(`添加配送企业失败, 产品编号: ${res.code}, 配送企业: ${res.company}, 添加响应值: ${JSON.stringify(res_json)}`);
                    }
                    return res
                }
            }
            throw new Error(`添加配送企业查询到多个, 产品编号: ${res.code}, 配送企业: ${res.company}, 查询结果: ${JSON.stringify(res_json)}`);
        } else {
            throw new Error(`添加配送企业查询为空, 产品编号: ${res.code}, 配送企业: ${res.company}, 响应值: ${JSON.stringify(res_json)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function modify_time(res) {
    try {
        const url = `${host}/HSNN/CM/Trade/Web/Controller/DistributionController/ModifyHTDate.HSNN?COMID=${res.COMID}&PROCURECATALOGID=${res.PROCURECATALOGID}&COMNAME=${encodeURIComponent(res.company)}&HTVALIDITYDATE=${res.HTVALIDITYDATE}&TOBECONFIRMDATE=${new Date().getFullYear()}-12-31`;
        const data = {};
        
        const res_json = await fetchPost(url, data, headers);
        if (res_json['result'] !== 'ok') {
            throw new Error(`维护合同有效期失败, 产品编号: ${res.code}, 配送企业: ${res.company}, 查询结果: ${JSON.stringify(res_json)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_send_list(res) {
    try {
        const url = `${host}/HSNN/CM/Trade/Web/Controller/DistributionController/QueryGpart.HSNN?PROCURECATALOGID=${res.code}&GPARTNAME=&REGCARDNM=&COMNAME=`;
        const data = {
            "_search": false,
            "rows": 10,
            "nd": new Date().getTime(),
            "sord": 'asc',
            "page": 1,
            "sidx": null
        };
        
        const res_json = await fetchPost(url, data, headers);
        if (res_json['rows'].length > 0) {
            if (res_json['rows'].length === 1) {
                res.PROCURECATALOGID = res_json['rows'][0]['PROCURECATALOGID']
                return res;
            } else {
                throw new Error(`配送关系目录列表查询到多个, 产品编号: ${res.code}, 配送企业: ${company}, 配送区域: ${city}, 采购来源: ${purchase_type}, 查询结果: ${JSON.stringify(res_json['data']['records'])}`);
            }
        } else {
            throw new Error(`配送关系目录列表查询异常, 产品编号: ${res.code}, 配送企业: ${company}, 配送区域: ${city}, 采购来源: ${purchase_type}, 查询结果: ${JSON.stringify(res_json)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_areas(res) {
    try {
        const url = `${host}/HSNN/CM/Trade/Web/Controller/DistributionController/QueryDeliveryArea.HSNN?AREANAME=${encodeURIComponent(res.region)}&STATUS=&SID=${res.SELECTRELATIONID}`;
        const data = {
            "_search": false,
            "rows": 10,
            "nd": new Date().getTime(),
            "sord": 'asc',
            "page": 1,
            "sidx": null
        };
        
        const res_json = await fetchPost(url, data, headers);
        if (res_json['rows'] && res_json['rows'].length > 0) {
            for (const rr of res_json['rows']) {
                const new_org_name = rr['AREANAME'].trim();
                // if (new_org_name.startsWith(res.region)) {
                if (new_org_name === res.region) {
                    res.AREAID = rr['AREAID'];
                    res.STATUS = rr['STATUS'];
                    return res;
                }
            }
            throw new Error(`配送区域查询到多个, 产品编号: ${res.code}, 配送企业: ${res.company}, 配送区域: ${res.region}, 查询结果: ${JSON.stringify(res_json)}`);
        } else {
            throw new Error(`添加配送企业查询为空, 产品编号: ${res.code}, 配送企业: ${res.company}, 配送区域: ${res.region}, 响应值: ${JSON.stringify(res_json)}`);
        }
    } catch (error) {
        throw error;
    }
}


async function save_city(res) {
    try {
        const url = `${host}/HSNN/CM/Trade/Web/Controller/DistributionController/UpdateDisarea.HSNN?areaid=${res.AREAID}&SID=${res.SELECTRELATIONID}`;
        const data = {};
        const res_json = await fetchPost(url, data, headers);
        if (res_json['result'] !== 'ok') {
            throw new Error(`配送区域保存失败, 产品编号: ${res.code}, 配送企业: ${res.company}, 配送区域: ${res.region}, 查询结果: ${JSON.stringify(res_json)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function submit_c(res) {
    try {
        const url = `${host}/HSNN/CM/Trade/Web/Controller/DistributionController/SubmitValidityDateToComPS.HSNN?proid=${res.PROCURECATALOGID}&comid=${res.COMID}`;
        const data = {};
        const res_json = await fetchPost(url, data, headers);
        if (res_json['result'] !== 'ok') {
            throw new Error(`提交配送失败, 产品编号: ${res.code}, 配送企业: ${res.company}, 配送区域: ${res.region}, 查询结果: ${JSON.stringify(res_json)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function startTask115(dataList, header) {
    let total_num = 0;
    let success = 0;
    let has_submit = 0;
    headers = convertHeadersArrayToObject(header);
    headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    try {
        for (let j = 0; j < dataList.length; j++) {
            let i = 0;
            const data = dataList[j];
            for (i; i < data.length; i++) {
                if (data[i][1] && String(data[i][1]).replace(/[\r\n]/g, '') === '配送企业') break;
            }
            i += 1;
            for (i; i < data.length; i++) {
                if (!data[i][8]) continue;
                total_num += 1;
                let ms_code = data[i][8];
                try {
                    ms_code = ms_code.trim();
                } catch (err) {
                    ms_code = String(parseInt(ms_code)).trim();
                }
                let company = data[i][1].trim();
                let city = data[i][2].trim();
                if (ms_code && company && city) {
                    try {
                        let res = {"code": ms_code, "company": company, "region": city, "addcompany": false};
                        res = await query_send_list(res);
                        res = await query_company(res, 1);
                        if (res.addcompany) {
                            res = await add_company(res);
                            await timer(1000);
                            res = await query_company(res, 2);
                            if (!res.addcompany) {
                                await modify_time(res);
                            }
                        }
                        
                        res = await query_areas(res);
                        if (res.STATUS === "1") {
                            has_submit += 1;
                            exportText(`已经配送过了, 产品编号: ${res.code}, 配送企业: ${res.company}, 配送区域: ${res.region}`);
                            continue;
                        } else if (res.STATUS === "0") {
                            exportText(`已经添加过了, 直接提交, 产品编号: ${res.code}, 配送企业: ${res.company}, 配送区域: ${res.region}`);
                            await submit_c(res);
                            success += 1;
                            continue;
                        } else {
                            await save_city(res);
                            await timer(1000);
                        }
                        await submit_c(res);
                        success += 1;
                        exportText(`配送成功, 产品编号: ${res.code}, 配送企业: ${res.company}, 配送区域: ${res.region}`);
                    } catch (error) {
                        exportText(`${error.stack}`);
                    }
                } else {
                    exportText(`Excel表格中的数据不全, 产品编号: ${ms_code}, 配送企业: ${company}, 配送区域: ${city}`);
                }
            }
        }
        exportText(`总数: ${total_num}, 配送成功: ${success}, 已经配送过: ${has_submit}, 配送失败: ${total_num - success - has_submit}`);
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

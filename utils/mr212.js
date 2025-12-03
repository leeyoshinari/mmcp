// 山东省平台点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};

async function query_list(mcsCode, res) {
    try {
        const url = `${host}/code/hsaTender/tps-local/web/tender/delv/mcs/schm/medins/queryDelvProdsProdentp`;
        const data = {
            "tenditmType": res.tenditmType,
            "mcsCode": mcsCode,
            "mcsName": "",
            "extCode": res.extCode,
            "delventpName": res.orgName,
            "prodentpName": "",
            "schmCnfmStas": "",
            "medinsCode": null,
            "current": 1,
            "size": 10,
            "cityCode": res.admdvs,
            "cityName": res.city
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.code === 0 && response.data) {
            if (response.data.records.length === 1) {
                return response.data.records[0].schmCnfmStas;
            } else {
                return "-9"
            }
        } else {
            return "-9"
        }
    } catch (error) {
        return "-9"
    }
}

async function query_company(res) {
    try {
        const url = `${host}/code/hsaTender/tps-local/web/bdc/org/queryPage`;
        const data = {
            "tenditmType": res.tenditmType,
            "orgTypeExternal":2,
            "orgName": res.orgName,
            "current": 1,
            "size": 10
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.code === 0 && response.data) {
            if (response.data.records.length > 0) {
                for (let b=0; b<response.data.records.length; b++) {
                    if (response.data.records[b].orgName === res.orgName) {
                        res.uscc = response.data.records[b].uscc;
                        return res;
                    }
                }
                throw new Error(`找不到配送企业, 挂网ID: ${res.extCode}, 配送企业: ${res.orgName}, 查询结果: ${JSON.stringify(response.data.records)}`);
            } else {
                throw new Error(`查询不到配送企业, 挂网ID: ${res.extCode}, 配送企业: ${res.orgName}, 查询结果: ${JSON.stringify(response)}`);
            }
        } else {
            throw new Error(`查询配送企业异常, 挂网ID: ${res.extCode}, 配送企业: ${res.orgName}, 查询结果: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_page(res) {
    try {
        const url = `${host}/code/hsaTender/tps-local/web/tender/delv/mcs/schm/listName/queryPage`;
        const data = {
            "tenditmType": res.tenditmType,
            "mcsTypeLv1Name": "",
            "mcsTypeLv2Name": "",
            "mcsTypeLv3Name": "",
            "extCode": res.extCode,
            "mcsCode": "",
            "mcsName": "",
            "mcsRegno": "",
            "tenditmId": "",
            "current": 1,
            "size": 10
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.code === 0 && response.data) {
            if (response.data.records.length === 1) {
                res.mcsTypeLv1Name = response.data.records[0].mcsTypeLv1Name;
                res.mcsTypeLv2Name = response.data.records[0].mcsTypeLv2Name;
                res.mcsTypeLv3Name = response.data.records[0].mcsTypeLv3Name;
                return res;
            } else if (response.data.records.length > 1) {
                throw new Error(`配送关系列表查询到多个, 挂网ID: ${res.extCode}, 查询结果: ${JSON.stringify(response.data.records)}`);
            } else {
                throw new Error(`配送关系列表查询不到数据, 挂网ID: ${res.extCode}, 查询结果: ${JSON.stringify(response)}`);
            }
        } else {
            throw new Error(`配送关系列表查询异常, 挂网ID: ${res.extCode}, 查询结果: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_page2(res) {
    try {
        const url = `${host}/code/hsaTender/tps-local/web/tender/delv/mcs/schm/prod/queryPage`;
        const data = {
            "tenditmType": res.tenditmType,
            "mcsCode": res.mcsCode,
            "mcsName": "",
            "extCode": res.extCode,
            "mcsTypeGennameName": "",
            "tenditmId": "",
            "mcsMatl": "",
            "mcsSpec": "",
            "prodentpName": "",
            "mcsRegno": "",
            "mcsMol": "",
            "current": 1,
            "size": 10,
            "mcsTypeLv1Name": res.mcsTypeLv1Name,
            "mcsTypeLv2Name": res.mcsTypeLv2Name,
            "mcsTypeLv3Name": res.mcsTypeLv3Name
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.code === 0 && response.data) {
            if (response.data.records.length === 1) {
                res.prodentpCode = response.data.records[0].prodentpCode;
                res.prodentpName = response.data.records[0].prodentpName;
                res.pubonlnRsltId = response.data.records[0].pubonlnRsltId;
                res.tenditmId = response.data.records[0].tenditmId;
                res.tenditmName = response.data.records[0].tenditmName;
                return res;
            } else if (response.data.records.length > 1) {
                throw new Error(`选择产品列表查询到多个, 挂网ID: ${res.extCode}, 查询结果: ${JSON.stringify(response.data.records)}`);
            } else {
                throw new Error(`选择产品列表查询不到数据, 挂网ID: ${res.extCode}, 查询结果: ${JSON.stringify(response)}`);
            }
        } else {
            throw new Error(`选择产品列表查询异常, 挂网ID: ${res.extCode}, 查询结果: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_areas(res) {
    try {
        const url = `${host}/code/hsaTender/tps-local/web/bdc/comRegion/queryAll`;
        const data = {"tenditmType": res.tenditmType, "admdvs": "370000", "query": ""};
        
        const response = await fetchPost(url, data, headers);
        if (response.code === 0 && response.data) {
            let child_area = response.data[0].children;
            for (let a=0; a<child_area.length; a++) {
                if (child_area[a].admdvsName === res.admdvsName) {
                    res.admdvs = child_area[a].id;
                    return res;
                }
            };
            throw new Error(`未找到地市, 挂网ID: ${res.extCode}, 地市: ${res.admdvsName}, 查询结果: ${JSON.stringify(response)}`);
        } else {
            throw new Error(`查询地市异常, 挂网ID: ${res.extCode}, 地市: ${res.admdvsName}, 查询结果: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_hospital(res) {
    try {
        const url = `${host}/code/hsaTender/tps-local/web/tender/delv/mcs/schm/medins/queryPage`;
        const data = {
            "tenditmType": res.tenditmType,
            "cityCode": res.admdvs,
            "cotyCode": "",
            "medinsName": res.medinsName,
            "current": 1,
            "size": 10
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.code === 0 && response.data) {
            if (response.data.records.length > 0) {
                for (let b=0; b<response.data.records.length; b++) {
                    if (response.data.records[b].medinsName === res.medinsName) {
                        res.cityCode = response.data.records[b].cityCode;
                        res.cityName = response.data.records[b].cityName;
                        res.cotyCode = response.data.records[b].cotyCode;
                        res.cotyName = response.data.records[b].cotyName;
                        res.medinsCode = response.data.records[b].medinsCode;
                        res.medinsName = response.data.records[b].medinsName;
                        return res;
                    }
                }
                throw new Error(`找不到医院, 挂网ID: ${res.extCode}, 地市: ${res.admdvsName}, 医院: ${res.medinsName}, 查询结果: ${JSON.stringify(response.data.records)}`);
            } else {
                throw new Error(`查询不到医院, 挂网ID: ${res.extCode}, 地市: ${res.admdvsName}, 医院: ${res.medinsName}, 查询结果: ${JSON.stringify(response)}`);
            }
        } else {
            throw new Error(`查询医院异常, 挂网ID: ${res.extCode}, 地市: ${res.admdvsName}, 医院: ${res.medinsName}, 查询结果: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function submit(res) {
    try {
        const url = `${host}/code/hsaTender/tps-local/web/tender/delv/mcs/schm/medins/saveDelvSchm`;
        const data = {
            "tenditmType": res.tenditmType,
            "medinsList": [
                {
                    "cityCode": res.cityCode,
                    "cityName": res.cityName,
                    "cotyCode": res.cotyCode,
                    "cotyName": res.cotyName,
                    "medinsCode": res.medinsCode,
                    "medinsName": res.medinsName,
                    "index":0
                }
            ],
            "delventpList": [{"delventpName": res.orgName, "delventpUscc": res.uscc}],
            "admdvsInfo": {
                "cityCode": res.admdvs,
                "cityName": res.cityName,
                "cotyCode": "",
                "cotyName": ""
            },
            "prods": [
                {
                    "prodentpName": res.prodentpName,
                    "prodentpUscc": res.prodentpCode,
                    "pubonlnRsltId": res.pubonlnRsltId,
                    "tenditmId": res.tenditmId,
                    "tenditmName": res.tenditmName
                }
            ]
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.code == 0 && response.success) {
            if (response.data.successNum === 0) {
                if (response.data.ignoreNum === 1) {
                    return response.data.ignoreNum;
                } else {
                    throw new Error(`提交失败, 挂网ID: ${res.extCode}, 配送企业: ${res.orgName}, 医院: ${res.medinsName}, 地市: ${res.admdvsName}, 查询结果: ${JSON.stringify(response.data)}`);
                }
            }
        } else {
            throw new Error(`提交失败, 挂网ID: ${res.extCode}, 配送企业: ${res.orgName}, 医院: ${res.medinsName}, 地市: ${res.admdvsName}, 查询结果: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function startTask212(dataList, header) {
    let send_num = 0;
    let total_num = 0;
    let success = 0;
    headers = convertHeadersArrayToObject(header);
    headers['content-type'] = 'application/json;charset=UTF-8';
    try {
        for (let j = 0; j < dataList.length; j++) {
            let i = 0;
            const data = dataList[j];
            for (i; i < data.length; i++) {
                if (data[i][7] && String(data[i][7]).replace(/[\r\n]/g, '') === '挂网ID') break;
            }
            i += 1;
            for (i; i < data.length; i++) {
                if (!data[i][7]) continue;
                total_num += 1;
                let extCode = data[i][7];
                try {
                    extCode = extCode.trim();
                } catch (err) {
                    extCode = String(parseInt(extCode)).trim();
                }
                let mcsCode = data[i][6].trim();
                let company = data[i][2].trim();
                let hospital = data[i][3].trim();
                let city = data[i][4].trim();
                if (extCode && company && hospital && city) {
                    try {
                        let res = { 'tenditmType': '2', 'extCode': extCode, 'admdvsName': city, 'orgName': company, 'medinsName': hospital, 'mcsCode': ""};
                        res = await query_page(res);
                        res = await query_page2(res);
                        res = await query_areas(res);
                        // let has_send = await query_list(mcsCode, res);
                        // if (has_send === "1") {
                        //     send_num += 1;
                        //     exportText(`已经配送过了, 挂网ID: ${extCode}, 配送企业: ${company}, 医院: ${hospital}, 地市: ${city}`);
                        //     continue;
                        // }
                        res = await query_company(res);
                        res = await query_hospital(res);
                        let result = await submit(res);
                        if (result === 1) {
                            send_num += 1;
                            exportText(`已经配送过了, 挂网ID: ${extCode}, 配送企业: ${company}, 医院: ${hospital}, 地市: ${city}`);
                            continue;
                        }
                        success += 1;
                        exportText(`配送成功, 挂网ID: ${extCode}, 配送企业: ${company}, 医院: ${hospital}, 地市: ${city}`);
                    } catch (error) {
                        exportText(`配送失败, 挂网ID: ${extCode}, 配送企业: ${company}, 医院: ${hospital}, 地市: ${city}, 错误: ${error.stack}`);
                    }
                } else {
                    exportText(`Excel表格中的数据不全, 挂网ID: ${extCode}, 配送企业: ${company}, 医院: ${hospital}, 地市: ${city}`);
                }
            }
        }
        exportText(`总数: ${total_num}, 配送成功: ${success}, 已经配送过: ${send_num}, 配送失败: ${total_num - success - send_num}`);
    } catch (error) {
        exportText(`失败, 请重试: ${error.stack}`);
    }
    downloadData(textContainer.textContent);
    exportText("已结束, 请刷新页面后继续操作 (^_^)");
}

window.myExtensionFuncs = {
  startTask212: (data, headers) => startTask212(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask212"] }, 
  "*"
);

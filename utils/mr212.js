// 重庆市平台点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};
const xieyi_status = ['', '新建', '待响应', '生效', '变更', '解除', '延续', '失效', '解除中'];

function getEndDate() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    let endMonth, endDay;
    if (currentMonth <= 6) {
        endMonth = currentMonth + 6;
    } else {
        endMonth = 12;
    }
    
    if (currentMonth === 12) {
        endMonth = 12;
    }
    switch (endMonth) {
        case 6:
            endDay = 30;
            break;
        case 7:
            endDay = 31;
            break;
        case 8:
            endDay = 31;
            break;
        case 9:
            endDay = 30;
            break;
        case 10:
            endDay = 31;
            break;
        case 11:
            endDay = 30;
            break;
        case 12:
            endDay = 31;
            break;
    }
    
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const startDateStr = formatDate(now);
    const endDate = new Date(currentYear, endMonth - 1, endDay);
    const endDateStr = formatDate(endDate);
    return {startDate: startDateStr, endDate: endDateStr};
}

async function query_send_list(res) {
    // 查询配送协议列表
    const company = res.company;
    try {
        const url = `${host}/tps-local/ucenter/yjs-ucenter-start/list/query.htm`;
        const data = [{"description": "配送会员",
            "fieldName": "dispaterName",
            "fieldTypeId": "STRING",
            "sqlSelect": "pm.NAME",
            "otherSearchField": "[{'name': 'PM.NAME_PY', 'opertype': 'like'}]", 
            "isAutocomplete": "0", 
            "enumSearchType": "like", 
            "value1": company, 
            "value2": ""
        }];
        const queryParams = btoa(encodeURIComponent(JSON.stringify(data)));
        let values = [];
        let listconfigidEle = null;
        try {
            listconfigidEle = document.getElementById("iframe").contentDocument.getElementById("replaceParams").getElementsByTagName("li");
        } catch (error) {
            listconfigidEle = document.getElementById("replaceParams").getElementsByTagName("li");
        }
        Array.from(listconfigidEle).forEach(ele => {
            values.push({fieldName: `#{${ele.getAttribute("key")}}`, value1: ele.getAttribute("value1")});
        });
        const replaceParams = btoa(encodeURIComponent(JSON.stringify(values)));
        const listconfigidValue = listconfigidEle[0].getAttribute("value1");

        const post_data = {
            pageNum: 1,
            pageSize: 20,
            listconfigid: listconfigidValue,
            replaceParams: replaceParams,
            queryParams: queryParams,
            setList: null,
            currSchemeId: null
        }
        
        headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        const response = await fetchPost(url, post_data, headers, maxRetries=3);
        if (response.listconfig) {
            if (response.data.length >= 1) {
                const status_index = parseInt(response.data[0].DISPATCHSTATUSCODE);
                if (response.data[0].DISPATCHSTATUS === "生效" || response.data[0].DISPATCHSTATUS ===  "延续") {
                    exportText(`当前配送协议状态为 ${xieyi_status[status_index]}, 开始变更。配送会员: ${company}`);
                    res.agreementId = response.data[0].DISPATCH_AGREEMENT_ID;
                    res.memberId = response.data[0].DISPATCH_ID;
                    res.company_res = 9999;
                    return res;
                } else if (response.data[0].DISPATCHSTATUS === "解除" || response.data[0].DISPATCHSTATUS === "失效") {
                    exportText(`当前配送协议状态为 ${xieyi_status[status_index]}, 开始新建配送协议。配送会员: ${company}`);
                    res.company_res = -3;
                    return res;
                } else {
                    exportText(`当前配送关系状态为 ${xieyi_status[status_index]}, 跳过不处理。配送会员: ${company}`);
                    res.company_res = -1;
                    return res;
                }
            } else if (response.data.length > 1) {
                exportText(`配送协议列表查询到多个, 配送会员: ${company}, 查询结果: ${JSON.stringify(response.data.records)}`);
                res.company_res = -1;
                return res;
            } else {
                exportText(`配送协议列表查询为空，开始新建配送协议，配送会员: ${company}`);
                res.company_res = -3;
                return res;
            }
        } else {
            exportText(`配送协议列表查询异常, 配送会员: ${company}, 查询结果: ${JSON.stringify(response.data)}`);
            res.company_res = -1;
            return res;
        }
    } catch (error) {
        exportText(`配送协议列表查询失败, 配送会员: ${company}, 错误: ${error.stack}`);
        res.company_res = -1;
        return res;
    }
}

async function new_build_agreement_query_company(company, res) {
    // 新建配送协议查询公司信息
    try {
        const url = `${host}/tps-local/ucenter/yjs-ucenter-start/controls/refer/agreement_dispatcher_ref/load.htm?pageNum=1&pageSize=10&identifyID=null`;
        const data = {
            "memberShiptypeId": "INSTRUMENT_DISPATCH",
            "quickFilterValue": JSON.stringify([{"fieldName": "NAME", "value1": company}])
        };
        
        headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        const response = await fetchPost(url, data, headers, maxRetries=3);
        if (response.succeed) {
            if (response.data.datas.length === 1) {
                res.memberId = response.data.datas[0].MEMBERID;
                return res;
            } else if (response.data.datas.length > 1) {
                throw new Error(`查询到多个企业，无法新建配送协议，请检查企业名称`);
            } else {
                throw new Error(`查询不到企业，无法新建配送协议，请检查企业名称`);
            }
        } else {
            throw new Error(`新建配送协议时，查询企业报错，错误: ${response}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_send_area(res) {
    // 查询配送地区
    try {
        const url = `${host}/tps-local/ucenter/yjs-ucenter-start/dispatch/queryDispatchArea.htm`;
        const data = {
            "dispatcherId": res.memberId,
            "type": "APP"
        };
        
        headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        const response = await fetchPost(url, data, headers, maxRetries=3);
        if (response.length > 0) {
            const result = [];
            response.forEach(item => {
                result.push({countryName: item.countryName, platformGeoId: item.platformGeoId, productLineSum: item.productLineSum});
            })
            return result;
        } else {
            throw new Error(`查询配送区域为空，请检查数据`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_code(code_name) {
    // 查询配送产品线
    try {
        const url = `${host}/tps-local/ucenter/yjs-ucenter-start/controls/refer/agreement_productline_ref/load.htm?pageNum=1&pageSize=10&identifyID=null`;
        const data = {
            "sellerId": localStorage.getItem("memberId"),
            "quickFilterValue": JSON.stringify([{"fieldName": "ID", "value1": code_name}])
        };
        
        headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        const response = await fetchPost(url, data, headers, maxRetries=3);
        if (response.succeed) {
            const target_code = response.data.datas.find(m => m.ID === code_name);
            if (target_code) {
                return target_code.NAME;
            } else {
                throw new Error(`查询不到产品线，响应值：${response.data.datas}`);
            }
        } else {
            throw new Error(`查询产品线报错，错误: ${response}`);
        }
    } catch (error) {
        throw error;
    }
}

async function submit_agreement(res) {
    // 新建添加协议
    try {
        const date_res = getEndDate();
        const url = `${host}/tps-local/ucenter/yjs-ucenter-start/dispatch/add.htm`;
        const data = {
            "areas": res.areas,
            "beginTime": date_res.startDate,
            "endTime": date_res.endDate,
            "dispatchId": res.memberId,
            "items": "委托存储",
            "shippingMethod": 3,
            "submitType": "SUBMIT",
            "type": "APP"
        };
        const yyheader = headers;
        yyheader['content-type'] = 'application/json';
        
        const response = await fetchPost(url, data, yyheader, maxRetries=3);
        if (!response.succeed) {
            throw new Error(`配送协议提交失败, 响应值: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_sended_agreement(res) {
    try {
        const url = `${host}/tps-local/ucenter/yjs-ucenter-start/dispatch/beforeChangeUpdate/appar.htm?dispatchId=${res.agreementId}&type=change`;
        const response = await fetchGetHtml(url, headers);
        const parser = new DOMParser();
        const doc = parser.parseFromString(response, 'text/html');
        const result = [];
    
        // 获取所有的区域行
        const areaRows = doc.querySelectorAll('tr.area');
        areaRows.forEach(row => {
            // 获取片区信息
            const checkbox = row.querySelector('input[type="checkbox"]');
            const platformGeoId = checkbox ? checkbox.value : '';
            const dispatchAreaId = checkbox ? checkbox.getAttribute('areaId') : '';
            
            // 获取备注信息
            const textarea = row.querySelector('textarea');
            const note = textarea ? textarea.value : '';
            
            // 获取产品信息
            const productLink = row.querySelector('a.words-color-orange');
            const productStr = productLink ? productLink.getAttribute('productStr') : '';
            const productNameStr = productLink ? productLink.getAttribute('productNameStr') : '';
            const productLineCount = productLink ? productLink.textContent.trim() : '';
            
            // 获取产品线总数
            const productLineSumInput = row.querySelector('input[type="hidden"]');
            const productLineSum = productLineSumInput ? productLineSumInput.value : '';

            // 获取费率
            const rateInput = row.querySelector('input[name^="rate"]');
            const rate = rateInput ? rateInput.value : '0';
            
            // 构建数据对象
            const data = {
                platformGeoId: platformGeoId,
                dispatchAreaId: dispatchAreaId,
                note: note,
                productStr: productStr,
                productNameStr: productNameStr,
                rate: rate,
                productLineSum: productLineSum,
                productLineCount: productLineCount
            };
            result.push(data);
        })
        if (result.length === 0) {
            throw new Error(`未获取已配送的区域和产品线`);
        } else if (result[0].platformGeoId === "") {
            throw new Error(`未获取已配送的区域和产品线, 数据为空`);
        }
        return result;
    } catch (error) {
        throw error;
    }
}

async function submit_change(res) {
    // 协议变更配送协议
    try {
        const date_res = getEndDate();
        const url = `${host}/tps-local/ucenter/yjs-ucenter-start/dispatch/changeUpdate.htm`;
        const data = {
            "areas": res.areas,
            "dispatchAgreementId": res.agreementId,
            "endTime": date_res.endDate,
            "submitType": "saveSubmit",
            "type": "APP"
        };
        const yyheader = headers;
        yyheader['content-type'] = 'application/json';
        
        const response = await fetchPostText(url, data, yyheader);
        if (response !== "true") {
            throw new Error(`变更-配送协议提交失败, 响应值: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function parse_excel(dataList) {
    try {
        const res_dict = {};
        let total_num = 0;
        for (let j = 0; j < dataList.length; j++) {
            let i = 0;
            const data = dataList[j];
            for (i; i < data.length; i++) {
                if (data[i][2] === '关键字段1' && data[i][4] === '关键字段2') break;
            }
            i += 1;
            for (i; i < data.length; i++) {
                if (!data[i][3]) continue;
                
                const org_name = data[i][2] ? data[i][2].trim() : '';
                const org_name_md5 = await calc_md5(org_name);
                const mcs_code = data[i][15] ? String(data[i][15]).trim() : '';
                const area = data[i][4] ? data[i][4].trim() : '';
                const area_md5 = await calc_md5(area);
                if(!org_name && !orders && !area && !mcs_code) continue;
                
                total_num += 1;
                if (org_name_md5 in res_dict) {
                    if (area_md5 in res_dict[org_name_md5].v) {
                        res_dict[org_name_md5].v[area_md5].v.push(mcs_code);
                    } else {
                        res_dict[org_name_md5].v[area_md5] = { k: area, v: [mcs_code] };
                    }
                } else {
                    res_dict[org_name_md5] = { 
                        k: org_name, 
                        v: {[area_md5]: {k: area, v: [mcs_code]}}
                    };
                }
            }
        }   
        exportText(`总共有 ${total_num} 条待配送的数据`);
        return { res_dict, total_num };
    } catch (error) {
        exportText(`Error in parse_excel: ${error.stack}`);
        throw error;
    }
}

async function startTask212(dataList, header) {
    headers = convertHeadersArrayToObject(header);
    headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    try {
        const { res_dict: excel_data, total_num } = await parse_excel(dataList);
        let success = 0;
        let has_send = 0;
        const error_msg = [["配送会员", "配送地区", "产品线ID", "状态", "原因"]];
        
        for (const [_, v1] of Object.entries(excel_data)) {
            const org_name = v1.k;
            try {
                let i2 = 0;
                let i3 = 0;
                let res = {company: org_name};
                res = await query_send_list(res);   // 查询配送协议列表
                if (res.company_res === -1) {
                    error_msg.push([org_name, " ", " ", "失败", "查询配送协议列表报错，或者协议状态不支持变更"]);
                    continue;
                } else if (res.company_res === -3) {    // 开始新建配送协议
                    res = await new_build_agreement_query_company(res.company, res);
                    let aera_result = await query_send_area(res);
                    const send_code_res = [];
                    for (const [_, v2] of Object.entries(v1.v)) {
                        i2 += 1;
                        let s3 = 0;
                        const area = v2.k;
                        const aera_id = aera_result.find(m => m.countryName === area);
                        if (!aera_id) {
                            exportText(`ERROR - 新建-没有找到 ${area} . 配送会员: ${org_name}, 配送地区: ${area}`);
                            error_msg.push([org_name, area, " ", "失败", "新建-没有配送区域"]);
                            continue;
                        }
                        let productStrList = [];
                        for (const mcs_code of v2.v) {
                            try {
                                if (productStrList.indexOf(mcs_code) < 0) {
                                    let code_res_name = await query_code(mcs_code);
                                    productStrList.push(mcs_code);
                                    i3 += 1;
                                    s3 += 1;
                                    exportText(`新建-添加产品线成功，配送会员: ${org_name}, 配送地区: ${area}, 产品线ID: ${mcs_code}, 产品线名称: ${code_res_name}`);
                                } else {
                                    exportText(`新建-重复的产品线，已经添加过产品线了，跳过，配送会员: ${org_name}, 配送地区: ${area}, 产品线ID: ${mcs_code}`);
                                    has_send += 1;
                                    continue;
                                }
                            } catch (error) {
                                exportText(`ERROR - 新建-添加产品线失败，配送会员: ${org_name}, 配送地区: ${area}, 产品线ID: ${mcs_code}, 错误: ${error.stack}`);
                                error_msg.push([org_name, area, mcs_code, "失败", "新建-添加产品线失败"]);
                                continue;
                            }
                        }
                        if (productStrList.length === 0) {
                            exportText(`ERROR - 新建-添加产品线失败，配送会员: ${org_name}, 配送地区: ${area}, 错误: 没有一个有效的产品线`);
                            continue;
                        }
                        send_code_res.push({platformGeoId: aera_id.platformGeoId, note: "", productStr: productStrList.join(','), rate: "0"});
                        exportText(`配送会员: ${org_name}, 配送地区: ${area}, 共添加 ${s3} 个产品线`);
                    }
                    if (send_code_res.length < 1) {
                        exportText(`ERROR - 新建-添加产品线失败，配送会员: ${org_name}, 错误: 没有一个区域有有效的产品线`);
                        continue;
                    }
                    res.areas = send_code_res;
                    await submit_agreement(res);
                    success = success + i3;
                    exportText(`新建-配送协议提交成功，配送会员: ${org_name}, 共配送 ${i2} 个地区, 共添加 ${i3} 个产品线`);
                } else {    // 开始变更
                    let sended_result = await query_sended_agreement(res);  // 提取出已经提交过的 区域和产品线
                    const sended_result_total = sended_result.length;
                    let aera_result = await query_send_area(res);
                    for (const [_, v2] of Object.entries(v1.v)) {
                        i2 += 1;
                        let s3 = 0;
                        const area = v2.k;
                        const aera_id = aera_result.find(m => m.countryName === area);
                        if (!aera_id) {
                            exportText(`ERROR - 变更-没有找到 ${area} . 配送会员: ${org_name}, 配送地区: ${area}`);
                            error_msg.push([org_name, area, " ", "失败", "变更-没有配送区域"]);
                            continue;
                        }
                        let sended_index = -1;      // 当前配送区域是否已配送过，找到下标索引值
                        for (let i=0; i<sended_result_total; i++) {
                            if (sended_result[i].platformGeoId === aera_id.platformGeoId) {
                                sended_index = i;
                            }
                        }
                        if (sended_index > -1) {  // 如果地区已经配送过
                            let has_sended_code = sended_result[sended_index].productStr.split(',');
                            let has_sended_code_name = sended_result[sended_index].productNameStr.split(',');
                            for (const mcs_code of v2.v) {
                                try {
                                    if (has_sended_code.indexOf(mcs_code) < 0) {
                                        let code_res_name = await query_code(mcs_code);
                                        has_sended_code.push(mcs_code);
                                        has_sended_code_name.push(code_res_name);
                                        i3 += 1;
                                        s3 += 1;
                                        exportText(`变更-添加产品线成功，配送会员: ${org_name}, 配送地区: ${area}, 产品线ID: ${mcs_code}, 产品线名称: ${code_res_name}`);
                                    } else {
                                        exportText(`变更-已经添加过产品线了，跳过，配送会员: ${org_name}, 配送地区: ${area}, 产品线ID: ${mcs_code}`);
                                        has_send += 1;
                                        continue;
                                    }
                                } catch (error) {
                                    exportText(`ERROR - 变更-添加产品线失败，配送会员: ${org_name}, 配送地区: ${area}, 产品线ID: ${mcs_code}, 错误: ${error.stack}`);
                                    error_msg.push([org_name, area, mcs_code, "失败", "变更-添加产品线失败"]);
                                    continue;
                                }
                            }
                            sended_result[sended_index].productLineCount = has_sended_code.length;
                            sended_result[sended_index].productStr = has_sended_code.join(',');
                            sended_result[sended_index].productNameStr = has_sended_code_name.join(',');
                            sended_result[sended_index].productLineSum = aera_id.productLineSum;
                        } else {    // 地区没有配送过，新增配送
                            let productStr = [];
                            let productName = [];
                            for (const mcs_code of v2.v) {
                                try {
                                    if (productStr.indexOf(mcs_code) < 0) {
                                        let code_res_name = await query_code(mcs_code);
                                        productStr.push(mcs_code);
                                        productName.push(code_res_name);
                                        i3 += 1;
                                        s3 += 1;
                                        exportText(`变更-添加产品线成功，配送会员: ${org_name}, 配送地区: ${area}, 产品线ID: ${mcs_code}, 产品线名称: ${code_res_name}`);
                                    } else {
                                        exportText(`变更-重复的产品线，已经添加过产品线了，跳过，配送会员: ${org_name}, 配送地区: ${area}, 产品线ID: ${mcs_code}`);
                                        has_send += 1;
                                        continue;
                                    }
                                } catch (error) {
                                    exportText(`ERROR - 变更-添加产品线失败，配送会员: ${org_name}, 配送地区: ${area}, 产品线ID: ${mcs_code}, 错误: ${error.stack}`);
                                    error_msg.push([org_name, area, mcs_code, "失败", "变更-添加产品线失败"]);
                                    continue;
                                }
                            }
                            if (productStr.length === 0) {
                                exportText(`ERROR - 变更-添加产品线失败，配送会员: ${org_name}, 配送地区: ${area}, 错误: 没有一个有效的产品线`);
                                continue;
                            }
                            sended_result.push({platformGeoId: aera_id.platformGeoId, dispatchAreaId: "", note: "", productStr: productStr.join(','), productNameStr: productName.join(','), rate: "0", productLineSum: aera_id.productLineSum, productLineCount: productStr.length});
                        }
                        exportText(`变更-配送会员: ${org_name}, 配送地区: ${area}, 共添加 ${s3} 个产品线`);
                    }
                    res.areas = sended_result;
                    await submit_change(res);
                    success = success + i3;
                    exportText(`变更-配送协议提交成功，配送会员: ${org_name}, 共配送 ${i2} 个地区, 共添加 ${i3} 个产品线`);
                }
            } catch (error) {
                exportText(`ERROR - 配送失败，配送会员: ${org_name}, 错误: ${error.stack}`);
                error_msg.push([org_name, " ", " ", "失败", "提交失败"]);
            }
        }
        exportText(`总数: ${total_num}, 配送成功: ${success}, 配送失败: ${total_num - success - has_send}, 已经配送过 ${has_send}`);
        let csv_data = "";
        error_msg.forEach(function(rowArray) {csv_data += rowArray.join(",") + "\r\n";});
        let blob = new Blob(["\uFEFF" + csv_data], {type: 'text/csv;charset=utf-8;'});
        let link = document.createElement('a');
        link.style.display = 'none';
        link.href = URL.createObjectURL(blob);
        link.download = '配送失败记录.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        exportText(`失败, 请重试: ${error.stack}`);
    }
    exportText("已结束, 请刷新页面后继续操作 (^_^)");
}

window.myExtensionFuncs = {
  startTask212: (data, headers) => startTask212(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask212"] }, 
  "*"
);

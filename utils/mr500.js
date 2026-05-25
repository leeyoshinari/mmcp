// 湖北省点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};

async function step1(area, batch, res) {
    try {
        const url = `${host}/tps-local/web/tender/delv/mcs/schm/prod/list`;
        const data = {
            admdvsName: area,
            delvEntpName: "",
            delvStartTime: "",
            delvEndTime: "",
            schmCnfmStas: "",
            endTime: "",
            tenditmName: batch,
            current: 1,
            size: 10,
            startTime: "",
            tenditmId: "",
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.data) {
            if (response.data.total > 0) {
                res.admdvs = response.data.records[0].admdvs;
                res.admdvsName = response.data.records[0].admdvsName;
                res.tenditmId = response.data.records[0].tenditmId;
                res.delvSchmId = response.data.records[0].delvSchmId;
                return res;
            } else {
                throw new Error(`配送方案点选列表未找到数据，配送地区：${area}，所属项目：${batch}，响应值：${JSON.stringify(response)}`);
            }
        } else {
            throw new Error(`配送方案点选列表查询失败，配送地区：${area}，所属项目：${batch}，响应值：${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_company(res, type = 0) {
    try {
        const url = type === 0 
            ? `${host}/tps-local/web/tender/delv/mcs/schm/prod/optlDelvlist`
            : `${host}/tps-local/web/tender/delv/mcs/schm/prod/prcdDelvlist`;
        
        const data = {
            tenditmId: res.tenditmId,
            admdvs: res.admdvs,
            delvSchmId: res.delvSchmId,
            admdvsName: res.admdvsName,
            delvEntpName: res.delvEntpName,
            schmCnfmStas: "",
            current: 1,
            size: 10,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (response.data.total > 0) {
            for (let ii=0; ii<response.data.total; ii++) {
                if (response.data.records[ii].delvEntpName.trim() === res.delvEntpName && response.data.records[ii].admdvsName === res.admdvsName) {
                    if (type === 1) {
                        res.submitStatus = response.data.records[ii].schmCnfmStas;
                        res.delvSchmId = response.data.records[ii].delvSchmId;
                        res.delvEntpCode = response.data.records[ii].delvEntpCode;
                        return res;
                    } else {
                        res.drtDelvFlag = response.data.records[ii].drtDelvFlag;
                        res.delvEntpCode = response.data.records[ii].delvEntpCode;
                        return res;
                    }
                }
            }
            if (type === 0) {
                exportText(`可选配送企业列表中查询不到企业，即将去已选配送企业中查找，配送企业：${res.delvEntpName}，所属项目：${res.tenditmName}，配送地区：${res.admdvsName}`);
                return res;
            } else {
                throw new Error(`${type === 0 ? '可选' : '已选'}配送企业列表中查询不到企业，配送企业：${res.delvEntpName}，所属项目：${res.tenditmName}，配送地区：${res.admdvsName}，查询结果：${JSON.stringify(response)}`);
            }
            
        } else {
            if (type === 0) {
                exportText(`可选配送企业列表中找不到企业，即将去已选配送企业中查找，配送企业：${res.delvEntpName}，所属项目：${res.tenditmName}，配送地区：${res.admdvsName}`);
                return res;
            } else {
                throw new Error(`已选配送企业列表中找不到企业，配送企业：${res.delvEntpName}，所属项目：${res.tenditmName}，配送地区：${res.admdvsName}`);
            }
        }
    } catch (error) {
        throw error;
    }
}

async function query_company_bak(res) {
    try {
        const url = `${host}/tps-local/web/tender/delv/mcs/adjm/queryList`;
        const data = {
            cntrCode: "",
            delvEntpName: res.delvEntpName,
            tenditmName: res.tenditmName,
            admdvsName: res.admdvsName,
            tenditmId: res.tenditmId,
            cntrSignStas: "",
            current: 1,
            size: 10,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (response.data.total > 0) {
            for (let ii=0; ii<response.data.total; ii++) {
                if (response.data.records[ii].delvEntpName.triom() === res.delvEntpName) {
                    res.cntrId = response.data.records[ii].cntrId;
                    res.cntrCode = response.data.records[ii].cntrCode;
                    res.prodEntpName = response.data.records[ii].prodEntpName;
                    res.cntrChangeStas = response.data.records[ii].cntrChangeStas;
                    return res;
                }
            }
            throw new Error(`配送签约调整列表中查询到多个企业，配送企业：${res.delvEntpName}，查询结果：${JSON.stringify(response)}`);
        } else {
            throw new Error(`配送签约调整列表中找不到企业，配送企业：${res.delvEntpName}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_adjmId(res) {
    try {
        const url = `${host}/tps-local/web/tender/delv/mcs/adjm/saveAdjmId`;
        const data = {
            cntrId: res.cntrId,
            tenditmId: res.tenditmId,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (response.success) {
            res.adjmId = response.data;
            return res;
        } else {
            throw new Error(`查询配送企业的 adjmId 失败，企业名称：${res.delvEntpName}，响应值：${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function add_choiceDelv(res) {
    try {
        const url = `${host}/tps-local/web/tender/delv/mcs/schm/prod/choiceDelv`;
        const data = {
            admdvs: res.admdvs,
            delvEntpCode: res.delvEntpCode,
            delvEntpName: res.delvEntpName,
            tenditmId: res.tenditmId,
            drtDelvFlag: res.drtDelvFlag,
            admdvsName: res.admdvsName,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        return response.success;
    } catch (error) {
        exportText(`添加到已选配送企业失败: ${error.stack}`);
        throw error;
    }
}

async function query_code(res, type = 1) {
    try {
        const url = type === 1 
            ? `${host}/tps-local/web/tender/delv/mcs/schm/prod/prcdMCSList`
            : `${host}/tps-local/web/tender/delv/mcs/schm/prod/optlMCSList`;
        
        const data = {
            mcsRegcertName: "",
            mcsRegno: "",
            current: 1,
            size: 10,
            delvSchmId: res.delvSchmId,
            admdvs: res.admdvs,
            tenditmId: res.tenditmId,
            tenditmType: res.tenditmType,
            mcsPubonlnSinId: res.mcsRegno,
            hiMcsCode: "",
            sinProdName: ""
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (type === 1) {
            return response.data ? response.data.total : 0;
        } else {
            if (response.data) {
                if (response.data.total > 0) {
                    res.pubonlnRsltId = response.data.records[0].pubonlnRsltId;
                    return res;
                } else {
                    throw new Error(`${type === 0 ? '可' : '已'}添加组件编号查询结果为空，组件编号：${res.mcsRegno}，响应值：${JSON.stringify(response)}`);
                }
            } else {
                throw new Error(`${type === 0 ? '可' : '已'}添加组件编号查询结果为空，组件编号：${res.mcsRegno}，响应值：${JSON.stringify(response)}`);
            }
        }
    } catch (error) {
        throw error;
    }
}

async function query_code_bak(res, type = 1) {
    try {
        const url = `${host}/tps-local/web/tender/delv/mcs/adjm/prod/mcsList`;
        const data = {
            mcsRegno: "",
            mcsPubonlnSinId: res.mcsRegno,
            mcsRegcertName: "",
            prodEntpName: "",
            sinProdName: "",
            chooseFlag: String(type),
            current: 1,
            size: 10,
            hiMcsCode: "",
            tenditmId: res.tenditmId,
            cntrId: res.cntrId,
            adjmId: res.adjmId,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (type === 1) {
            if (response.data && response.data.total === 1) {
                res.pubonlnRsltId = response.data.records[0].pubonlnRsltId;
                return res;
            } else {
                return res;
            }
        } else {
            if (response.data) {
                if (response.data.total > 0) {
                    res.pubonlnRsltId = response.data.records[0].pubonlnRsltId;
                    return res;
                } else {
                    throw new Error(`配送签约调整：${type === 0 ? '可' : '已'}添加组件编号查询结果为空，组件编号：${res.mcsRegno}，响应值：${JSON.stringify(response)}`);
                }
            } else {
                throw new Error(`配送签约调整：${type === 0 ? '可' : '已'}添加组件编号查询结果为空，组件编号：${res.mcsRegno}，响应值：${JSON.stringify(response)}`);
            }
        }
    } catch (error) {
        throw error;
    }
}

async function add_code(res, type = 1) {
    try {
        const url = type === 1 
            ? `${host}/tps-local/web/tender/delv/mcs/schm/prod/delProdList`
            : `${host}/tps-local/web/tender/delv/mcs/schm/prod/addProdList`;
        
        const data = {
            productCode: [res.mcsRegno],
            delvSchmId: res.delvSchmId,
            delvEntpCode: res.delvEntpCode,
            delvEntpName: res.delvEntpName,
            admdvs: res.admdvs,
            admdvsName: res.admdvsName,
            tenditmId: res.tenditmId,
            tenditmType: res.tenditmType
        };
        
        if (type === 0) {
            data.pubonlnRsltId = [res.pubonlnRsltId];
        }
        
        const response = await fetchPost(url, data, headers);
        
        if (!response.success) {
            throw new Error(`${type === 0 ? '添加' : '取消'}组件编号失败，组件编号：${res.mcsRegno}，响应值：${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function add_code_bak(res, type = 1) {
    try {
        const url = `${host}/tps-local/web/tender/delv/mcs/adjm/prod/chooseList`;
        const data = {
            adjmProdCode: res.mcsRegno,
            invdFlag: String(type),
            cntrId: res.cntrId,
            adjmId: res.adjmId,
            tenditmId: res.tenditmId,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (!response.success) {
            throw new Error(`配送签约调整：${type === 0 ? '添加' : '删除'}组件编号失败，组件编号：${res.mcsRegno}，响应值：${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function submit_company(res) {
    try {
        const url = `${host}/tps-local/web/tender/delv/mcs/schm/prod/submit`;
        const data = {
            delvSchmId: res.delvSchmId,
            tenditmId: res.tenditmId,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (!response.success) {
            throw new Error(`提交配送企业失败，配送企业：${res.delvEntpName}，所属项目：${res.tenditmName}，响应值：${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function submit_company_bak(res) {
    try {
        const url = `${host}/tps-local/web/tender/delv/mcs/adjm/updateAppyAdjm`;
        const data = {
            tenditmName: res.tenditmName,
            initDelvProdCount: 999,
            admdvsName: res.admdvsName,
            prodEntpName: res.prodEntpName,
            cntrCode: res.cntrCode,
            delvEntpName: res.delvEntpName,
            cntrAdjmType: "2",
            cntrAdjmRea: "",
            adjmFileCode: "",
            adjmId: res.adjmId,
            cntrId: res.cntrId,
            tenditmId: res.tenditmId,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (!response.success) {
            throw new Error(`配送签约调整：提交审核失败，配送企业：${res.delvEntpName}，所属项目：${res.tenditmName}，响应值：${JSON.stringify(response)}`);
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
                if (data[i][0] === '配送区域' && data[i][1] === '所属项目') break;
            }
            i += 1;
            for (i; i < data.length; i++) {
                if (!data[i][3]) continue;
                
                const org_name = data[i][2] ? data[i][2].trim() : '';
                const org_name_md5 = await calc_md5(org_name);
                const orders = data[i][1] ? String(data[i][1]).trim() : '';
                const order_md5 = await calc_md5(orders);
                const zu_code = data[i][3] ? String(data[i][3]).trim() : '';
                const area = data[i][0] ? data[i][0].trim() : '';
                const area_md5 = await calc_md5(area);
                if(!org_name && !orders && !area && !zu_code) continue;
                const mcs_code = zu_code.padStart(8, '0');
                
                total_num += 1;
                if (org_name_md5 in res_dict) {
                    if (order_md5 in res_dict[org_name_md5].v) {
                        if (area_md5 in res_dict[org_name_md5].v[order_md5].v) {
                            res_dict[org_name_md5].v[order_md5].v[area_md5].v.push(mcs_code);
                        } else {
                            res_dict[org_name_md5].v[order_md5].v[area_md5] = { k: area, v: [mcs_code] };
                        }
                    } else {
                        res_dict[org_name_md5].v[order_md5] = { k: orders, v: { [area_md5]: { k: area, v: [mcs_code] } } };
                    }
                } else {
                    res_dict[org_name_md5] = { 
                        k: org_name, 
                        v: { 
                            [order_md5]: { 
                                k: orders, 
                                v: { 
                                    [area_md5]: { 
                                        k: area, 
                                        v: [mcs_code] 
                                    } 
                                } 
                            } 
                        } 
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

async function startTask500(dataList, header) {
    headers = convertHeadersArrayToObject(header);
    headers['content-type'] = 'application/json;charset=UTF-8';
    try {
        const { res_dict: excel_data, total_num } = await parse_excel(dataList);
        let success = 0;
        const summary = [];
        const success_result = [];
        
        for (const [_, v1] of Object.entries(excel_data)) {
            const org_name = v1.k;
            for (const [_, v2] of Object.entries(v1.v)) {
                const batch = v2.k;
                for (const [_, v3] of Object.entries(v2.v)) {
                    const area = v3.k;
                    try {
                        let i3 = 0;
                        let s3 = 0;
                        let res = {
                            admdvsName: area,
                            delvEntpName: org_name,
                            tenditmName: batch,
                            tenditmType: "2"
                        };
                        
                        res = await step1(area, batch, res);
                        res = await query_company(res, 0);
                        
                        if ('drtDelvFlag' in res) {
                            exportText(`${org_name} - ${batch} - ${area} 未添加过，现在开始配送方案点选...`);
                            const a = await add_choiceDelv(res);
                            await timer(500);
                        }
                        
                        res = await query_company(res, 1);
                        
                        if (res.submitStatus !== '0' && res.submitStatus !== '2') {
                            summary.push({ type: 0, c: org_name, b: batch, a: area });
                            exportText(`当前配送方案的状态不可进行配送方案点选或配送签约调整，请手动检查确认。配送企业：${org_name}，所属项目：${batch}，配送地区：${area}`);
                            continue;
                        }
                        
                        if (res.submitStatus === '2') {
                            exportText(`${org_name} - ${batch} - ${area} 已经提交过，现在开始配送签约调整...`);
                            res = await query_company_bak(res);
                            if (res.cntrChangeStas === "12") {
                                exportText(`配送关系待确认：配送企业：${org_name}，所属项目：${batch}，配送地区：${area}`);
                                summary.push({ type: 6, c: org_name, b: batch, a: area });
                                continue;
                            }
                            res = await query_adjmId(res);
                        }
                        
                        for (const mcs_code of v3.v) {
                            try {
                                res.mcsRegno = mcs_code;
                                i3 += 1;
                                const del_str = '';
                                
                                if (res.submitStatus === '0') {
                                    if ((await query_code(res, 1)) > 0) {
                                        exportText(`配送方案点选：已经添加过组件编号了：配送企业：${org_name}，所属项目：${batch}，配送地区：${area}，组件编号：${res.mcsRegno}`);
                                        if ("pubonlnRsltId" in res) delete res.pubonlnRsltId;
                                        continue;
                                    }
                                    
                                    res = await query_code(res, 0);
                                    await add_code(res, 0);
                                    exportText(`配送方案点选：${del_str}添加组件编号成功：配送企业：${org_name}，所属项目：${batch}，配送地区：${area}，组件编号：${res.mcsRegno}`);
                                } else {
                                    res = await query_code_bak(res, 1);
                                    if ("pubonlnRsltId" in res) {
                                        exportText(`配送签约调整：已经添加过组件编号了：配送企业：${org_name}，所属项目：${batch}，配送地区：${area}，组件编号：${res.mcsRegno}`);
                                        delete res.pubonlnRsltId;
                                        continue;
                                    }
                                    
                                    res = await query_code_bak(res, 0);
                                    await add_code_bak(res, 0);
                                    exportText(`配送签约调整：${del_str}添加组件编号成功：配送企业：${org_name}，所属项目：${batch}，配送地区：${area}，组件编号：${res.mcsRegno}`);
                                }
                                
                                success += 1;
                                s3 += 1;
                                if ("pubonlnRsltId" in res) delete res.pubonlnRsltId;
                                await timer(1000);
                            } catch (error) {
                                if (res.submitStatus === '0') {
                                    summary.push({ type: 1, c: org_name, b: batch, a: area, z: mcs_code });
                                    exportText(`配送方案点选：添加组件编号失败：配送企业：${org_name}，所属项目：${batch}，配送地区：${area}，组件编号：${mcs_code}, 错误: ${error.stack}`);
                                } else {
                                    summary.push({ type: 2, c: org_name, b: batch, a: area, z: mcs_code });
                                    exportText(`配送签约调整：添加组件编号失败：配送企业：${org_name}，所属项目：${batch}，配送地区：${area}，组件编号：${mcs_code}, 错误: ${error.stack}`);
                                }
                            }
                        }
                        
                        if (res.submitStatus === '0') {
                            try {
                                await submit_company(res);
                                success_result.push(`配送方案点选,${org_name},${batch},${area},${i3},${s3},${i3 - s3}`);
                                exportText(`配送方案点选：提交成功，${org_name} - ${batch} - ${area}，总共配送 ${i3} 个组件编号，成功 ${s3} 个，失败 ${i3 - s3} 个`);
                            } catch (error) {
                                summary.push({ type: 3, c: org_name, b: batch, a: area });
                                exportText(`配送方案点选：提交失败，配送企业：${org_name}，所属项目：${batch}，配送地区：${area}, 错误: ${error.stack}`);
                            }
                        } else {
                            try {
                                await submit_company_bak(res);
                                success_result.push(`配送签约调整,${org_name},${batch},${area},${i3},${s3},${i3 - s3}`);
                                exportText(`配送签约调整：提交审核成功，${org_name} - ${batch} - ${area}，总共配送 ${i3} 个组件编号，成功 ${s3} 个，失败 ${i3 - s3} 个`);
                            } catch (error) {
                                summary.push({ type: 4, c: org_name, b: batch, a: area });
                                exportText(`配送签约调整：提交审核失败，配送企业：${org_name}，所属项目：${batch}，配送地区：${area}, 错误: ${error.stack}`);
                            }
                        }
                    } catch (error) {
                        summary.push({ type: 5, c: org_name, b: batch, a: area });
                        exportText(`在配送企业列表中找不到企业：配送企业：${org_name}，所属项目：${batch}，配送地区：${area}, 错误: ${error.stack}`);
                    }
                }
            }
        }
        
        if (summary.length > 0) {
            exportText("-".repeat(69));
            exportText("所有报错数据汇总：");
            exportText("-".repeat(69));
            
            for (const c of summary) {
                if (c.type === 0) {
                    exportText(`当前配送方案的状态不可进行配送方案点选或配送签约调整，请手动检查确认。配送企业：${c.c}，所属项目：${c.b}，配送地区：${c.a}`);
                }
                if (c.type === 1) {
                    exportText(`配送方案点选：添加组件编号失败：配送企业：${c.c}，所属项目：${c.b}，配送地区：${c.a}，组件编号：${c.z}`);
                }
                if (c.type === 2) {
                    exportText(`配送签约调整：添加组件编号失败：配送企业：${c.c}，所属项目：${c.b}，配送地区：${c.a}，组件编号：${c.z}`);
                }
                if (c.type === 3) {
                    exportText(`配送方案点选：提交失败，配送企业：${c.c}，所属项目：${c.b}，配送地区：${c.a}`);
                }
                if (c.type === 4) {
                    exportText(`配送签约调整：提交审核失败，配送企业：${c.c}，所属项目：${c.b}，配送地区：${c.a}`);
                }
                if (c.type === 5) {
                    exportText(`在配送企业列表中找不到企业：配送企业：${c.c}，所属项目：${c.b}，配送地区：${c.a}`);
                }
                if (c.type === 6) {
                    exportText(`配送关系待确认：配送企业：${c.c}，所属项目：${c.b}，配送地区：${c.a}`);
                }
            }
            exportText("-".repeat(69));
        }
        exportText(`总共配送 ${total_num} 个组件编号，其中成功 ${success} 个，失败 ${total_num - success} 个`);
    } catch (error) {
        exportText(`失败，请重试: ${error.stack}`);
    }
    exportText("已结束，请刷新页面后继续操作 (^_^)");
    downloadData(textContainer.textContent);
}

window.myExtensionFuncs = {
  startTask500: (data, headers) => startTask500(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask500"] }, 
  "*"
);

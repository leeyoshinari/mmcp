// 湖南长沙点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};

async function step1(area, batch, res) {
    try {
        const url = `${host2}/tps-local/web/tender/delv/schm/prod/list`;
        const data = {
            admdvsName: area,
            delvEntpName: "",
            schmCnfmStas: "",
            tenditmName: batch,
            current: 1,
            size: 10,
            tenditmType: res.tenditmType,
            pipType: "5",
            prodType: "1"
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.data) {
            if (response.data.total > 0) {
                res.admdvs = response.data.records[0].admdvs;
                res.admdvsName = response.data.records[0].admdvsName;
                res.tenditmId = response.data.records[0].tenditmId;
                return res;
            } else {
                exportText(`配送方案点选列表未找到数据，配送地区：${area}，动态批次：${batch}，响应值：${JSON.stringify(response)}`);
                throw new Error('No data found');
            }
        } else {
            exportText(`配送方案点选列表查询失败，配送地区：${area}，动态批次：${batch}，响应值：${JSON.stringify(response)}`);
            throw new Error('Query failed');
        }
    } catch (error) {
        exportText(`Error in step1: ${error.stack}`);
        throw error;
    }
}

async function query_company(res, type = 0) {
    try {
        const url = type === 0 
            ? `${host2}/tps-local/web/tender/delv/schm/prod/optlDelvlist`
            : `${host2}/tps-local/web/tender/delv/schm/prod/prcdDelvlist`;
        
        const data = {
            tenditmId: res.tenditmId,
            admdvs: res.admdvs,
            delvSchmId: "",
            admdvsName: res.admdvsName,
            delvEntpName: res.delvEntpName,
            schmCnfmStas: "",
            current: 1,
            size: 10,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (response.data.total === 1) {
            if (type === 1) {
                res.submitStatus = response.data.records[0].schmCnfmStas;
                res.delvSchmId = response.data.records[0].delvSchmId;
                res.delvEntpCode = response.data.records[0].delvEntpCode;
                return res;
            } else {
                res.drtDelvFlag = response.data.records[0].drtDelvFlag;
                res.delvEntpCode = response.data.records[0].delvEntpCode;
                return res;
            }
        } else if (response.data.total > 1) {
            exportText(`${type === 0 ? '可选' : '已选'}配送企业列表中查询到多个企业，配送企业：${res.delvEntpName}，查询结果：${JSON.stringify(response)}`);
            throw new Error('Multiple companies found');
        } else {
            if (type === 0) {
                exportText(`可选配送企业列表中找不到企业，即将去已选配送企业中查找，配送企业：${res.delvEntpName}，动态批次：${res.tenditmName}，配送地区：${res.admdvsName}`);
                return res;
            } else {
                exportText(`已选配送企业列表中找不到企业，配送企业：${res.delvEntpName}，动态批次：${res.tenditmName}，配送地区：${res.admdvsName}`);
                throw new Error('Company not found');
            }
        }
    } catch (error) {
        exportText(`Error in query_company: ${error.stack}`);
        throw error;
    }
}

async function query_company_bak(res) {
    try {
        const url = `${host2}/tps-local/web/tender/delv/adjm/queryList`;
        const data = {
            cntrCode: "",
            delvEntpName: res.delvEntpName,
            tenditmName: res.tenditmName,
            admdvsName: res.admdvsName,
            cntrSignStas: "",
            current: 1,
            size: 10,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (response.data.total === 1) {
            res.cntrId = response.data.records[0].cntrId;
            res.cntrCode = response.data.records[0].cntrCode;
            res.prodEntpName = response.data.records[0].prodEntpName;
            res.cntrChangeStas = response.data.records[0].cntrChangeStas;
            return res;
        } else if (response.data.total > 1) {
            exportText(`配送签约调整列表中查询到多个企业，配送企业：${res.delvEntpName}，查询结果：${JSON.stringify(response)}`);
            throw new Error('Multiple companies found');
        } else {
            exportText(`配送签约调整列表中找不到企业，配送企业：${res.delvEntpName}`);
            throw new Error('Company not found');
        }
    } catch (error) {
        exportText(`Error in query_company_bak: ${error.stack}`);
        throw error;
    }
}

async function query_adjmId(res) {
    try {
        const url = `${host2}/tps-local/web/tender/delv/adjm/saveAdjmId`;
        const data = {
            cntrId: res.cntrId,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (response.success) {
            res.adjmId = response.data;
            return res;
        } else {
            exportText(`查询配送企业的 adjmId 失败，企业名称：${res.delvEntpName}，响应值：${JSON.stringify(response)}`);
            throw new Error('Failed to get adjmId');
        }
    } catch (error) {
        exportText(`Error in query_adjmId: ${error.stack}`);
        throw error;
    }
}

async function add_choiceDelv(res) {
    try {
        const url = `${host2}/tps-local/web/tender/delv/schm/prod/choiceDelv`;
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
        exportText(`Error in add_choiceDelv: ${error.stack}`);
        throw error;
    }
}

async function query_code(res, type = 1) {
    try {
        const url = type === 1 
            ? `${host2}/tps-local/web/tender/delv/schm/prod/prcdMCSList`
            : `${host2}/tps-local/web/tender/delv/schm/prod/optlMCSList`;
        
        const data = {
            mcsRegcertName: "",
            mcsRegno: res.mcsRegno,
            current: 1,
            size: 10,
            delvSchmId: res.delvSchmId,
            admdvs: res.admdvs,
            tenditmId: res.tenditmId,
            tenditmType: res.tenditmType
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
                    exportText(`${type === 0 ? '可' : '已'}添加注册证查询结果为空，注册证号：${res.mcsRegno}，响应值：${JSON.stringify(response)}`);
                    throw new Error('No data found');
                }
            } else {
                exportText(`${type === 0 ? '可' : '已'}添加注册证查询结果为空，注册证号：${res.mcsRegno}，响应值：${JSON.stringify(response)}`);
                throw new Error('No data found');
            }
        }
    } catch (error) {
        exportText(`Error in query_code: ${error.stack}`);
        throw error;
    }
}

async function query_code_bak(res, type = 1) {
    try {
        const url = `${host2}/tps-local/web/tender/delv/adjm/prod/mcsList`;
        const data = {
            mcsRegno: res.mcsRegno,
            mcsRegcertName: "",
            prodEntpName: "",
            chooseFlag: String(type),
            current: 1,
            size: 10,
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
                    exportText(`配送签约调整：${type === 0 ? '可' : '已'}添加注册证查询结果为空，注册证号：${res.mcsRegno}，响应值：${JSON.stringify(response)}`);
                    throw new Error('No data found');
                }
            } else {
                exportText(`配送签约调整：${type === 0 ? '可' : '已'}添加注册证查询结果为空，注册证号：${res.mcsRegno}，响应值：${JSON.stringify(response)}`);
                throw new Error('No data found');
            }
        }
    } catch (error) {
        exportText(`Error in query_code_bak: ${error.stack}`);
        throw error;
    }
}

async function add_code(res, type = 1) {
    try {
        const url = type === 1 
            ? `${host2}/tps-local/web/tender/delv/schm/prod/delProdList`
            : `${host2}/tps-local/web/tender/delv/schm/prod/addProdList`;
        
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
            exportText(`${type === 0 ? '添加' : '取消'}注册证失败，注册证号：${res.mcsRegno}，响应值：${JSON.stringify(response)}`);
            throw new Error('Operation failed');
        }
    } catch (error) {
        exportText(`Error in add_code: ${error.stack}`);
        throw error;
    }
}

async function add_code_bak(res, type = 1) {
    try {
        const url = `${host2}/tps-local/web/tender/delv/adjm/prod/chooseList`;
        const data = {
            adjmProdCode: res.mcsRegno,
            invdFlag: String(type),
            cntrId: res.cntrId,
            adjmPubonlnRsltId: res.pubonlnRsltId,
            adjmId: res.adjmId,
            tenditmId: res.tenditmId,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (!response.success) {
            exportText(`配送签约调整：${type === 0 ? '添加' : '删除'}注册证失败，注册证号：${res.mcsRegno}，响应值：${JSON.stringify(response)}`);
            throw new Error('Operation failed');
        }
    } catch (error) {
        exportText(`Error in add_code_bak: ${error.stack}`);
        throw error;
    }
}

async function submit_company(res) {
    try {
        const url = `${host2}/tps-local/web/tender/delv/schm/prod/submit`;
        const data = {
            delvSchmId: res.delvSchmId,
            tenditmId: res.tenditmId,
            tenditmType: res.tenditmType
        };
        
        const response = await fetchPost(url, data, headers);
        
        if (!response.success) {
            exportText(`提交配送企业失败，配送企业：${res.delvEntpName}，动态批次：${res.tenditmName}，响应值：${JSON.stringify(response)}`);
            throw new Error(response.message || 'Submission failed');
        }
    } catch (error) {
        exportText(`Error in submit_company: ${error.stack}`);
        throw error;
    }
}

async function submit_company_bak(res) {
    try {
        const url = `${host2}/tps-local/web/tender/delv/adjm/updateAppyAdjm`;
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
            exportText(`配送签约调整：提交审核失败，配送企业：${res.delvEntpName}，动态批次：${res.tenditmName}，响应值：${JSON.stringify(response)}`);
            throw new Error(response.message || 'Submission failed');
        }
    } catch (error) {
        exportText(`Error in submit_company_bak: ${error.stack}`);
        throw error;
    }
}

function calc_md5(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}

async function parse_excel() {
    try {
        const res_dict = {};
        const excelDataList = await fetchExcel(); // Using the provided fetchExcel function
        
        for (const excelData of excelDataList) {
            let ind = 1;
            for (let i = 0; i < excelData.length; i++) {
                if (excelData[i][10] && excelData[i][10].trim() === '注册证编号') {
                    ind = i;
                    break;
                }
            }
            
            for (let i = ind; i < excelData.length; i++) {
                const row = excelData[i];
                if (!row[2] && !row[4] && !row[9] && !row[10]) continue;
                
                const org_name = row[2] ? row[2].trim() : '';
                const org_name_md5 = calc_md5(org_name);
                const orders = row[9] ? String(row[9]).trim() : '';
                const order_md5 = calc_md5(orders);
                const mcs_code = row[10] ? String(row[10]).trim() : '';
                const area = row[4] ? row[4].trim() : '';
                const area_md5 = calc_md5(area);
                
                if (res_dict[org_name_md5]) {
                    if (res_dict[org_name_md5].v[order_md5]) {
                        if (res_dict[org_name_md5].v[order_md5].v[area_md5]) {
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
            
            exportText(`总共有 ${excelData.length - ind} 条待配送的数据`);
            return { res_dict, total_num: excelData.length - ind };
        }
    } catch (error) {
        exportText(`Error in parse_excel: ${error.stack}`);
        throw error;
    }
}

async function main() {
    try {
        const { excel_data, total_num } = await parse_excel();
        let success = 0;
        const summary = [];
        const success_result = [];
        
        for (const [_, v1] of Object.entries(excel_data)) {
            const org_name = v1.k;
            for (const [_, v2] of Object.entries(v1.v)) {
                const batch = v2.k;
                for (const [_, v3] of Object.entries(v2.v)) {
                    try {
                        let i3 = 0;
                        let s3 = 0;
                        const area = v3.k;
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
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                        
                        res = await query_company(res, 1);
                        
                        if (res.submitStatus !== '0' && res.submitStatus !== '2') {
                            summary.push({ type: 0, c: org_name, b: batch, a: area });
                            exportText(`当前配送方案的状态不可进行配送方案点选或配送签约调整，请手动检查确认。配送企业：${org_name}，动态批次：${batch}，配送地区：${area}`);
                            continue;
                        }
                        
                        if (res.submitStatus === '2') {
                            exportText(`${org_name} - ${batch} - ${area} 已经提交过，现在开始配送签约调整...`);
                            res = await query_company_bak(res);
                            if (res.cntrChangeStas === "12") {
                                exportText(`配送关系待确认：配送企业：${org_name}，动态批次：${batch}，配送地区：${area}`);
                                summary.push({ type: 6, c: org_name, b: batch, a: area });
                                continue;
                            }
                            res = await query_adjmId(res);
                        }
                        
                        for (const mcs_code of v3.v) {
                            try {
                                res.mcsRegno = mcs_code;
                                i3++;
                                const del_str = '';
                                
                                if (res.submitStatus === '0') {
                                    if ((await query_code(res, 1)) > 0) {
                                        exportText(`配送方案点选：已经添加过注册证了：配送企业：${org_name}，动态批次：${batch}，配送地区：${area}，注册证号：${res.mcsRegno}`);
                                        if ("pubonlnRsltId" in res) delete res.pubonlnRsltId;
                                        continue;
                                    }
                                    
                                    res = await query_code(res, 0);
                                    await add_code(res, 0);
                                    exportText(`配送方案点选：${del_str}添加注册证成功：配送企业：${org_name}，动态批次：${batch}，配送地区：${area}，注册证号：${res.mcsRegno}`);
                                } else {
                                    res = await query_code_bak(res, 1);
                                    if ("pubonlnRsltId" in res) {
                                        exportText(`配送签约调整：已经添加过注册证了：配送企业：${org_name}，动态批次：${batch}，配送地区：${area}，注册证号：${res.mcsRegno}`);
                                        delete res.pubonlnRsltId;
                                        continue;
                                    }
                                    
                                    res = await query_code_bak(res, 0);
                                    await add_code_bak(res, 0);
                                    exportText(`配送签约调整：${del_str}添加注册证成功：配送企业：${org_name}，动态批次：${batch}，配送地区：${area}，注册证号：${res.mcsRegno}`);
                                }
                                
                                success++;
                                s3++;
                                if ("pubonlnRsltId" in res) delete res.pubonlnRsltId;
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            } catch (error) {
                                exportText(`Error processing mcs_code ${mcs_code}: ${error.stack}`);
                                if (res.submitStatus === '0') {
                                    summary.push({ type: 1, c: org_name, b: batch, a: area, z: mcs_code });
                                    exportText(`配送方案点选：添加注册证失败：配送企业：${org_name}，动态批次：${batch}，配送地区：${area}，注册证号：${mcs_code}`);
                                } else {
                                    summary.push({ type: 2, c: org_name, b: batch, a: area, z: mcs_code });
                                    exportText(`配送签约调整：添加注册证失败：配送企业：${org_name}，动态批次：${batch}，配送地区：${area}，注册证号：${mcs_code}`);
                                }
                            }
                        }
                        
                        if (res.submitStatus === '0') {
                            try {
                                await submit_company(res);
                                success_result.push(`配送方案点选,${org_name},${batch},${area},${i3},${s3},${i3 - s3}`);
                                exportText(`配送方案点选：提交成功，${org_name} - ${batch} - ${area}，总共配送 ${i3} 个注册证号，成功 ${s3} 个，失败 ${i3 - s3} 个`);
                            } catch (error) {
                                summary.push({ type: 3, c: org_name, b: batch, a: area });
                                exportText(`Error in submit_company: ${error.stack}`);
                                exportText(`配送方案点选：提交失败，配送企业：${org_name}，动态批次：${batch}，配送地区：${area}`);
                            }
                        } else {
                            try {
                                await submit_company_bak(res);
                                success_result.push(`配送签约调整,${org_name},${batch},${area},${i3},${s3},${i3 - s3}`);
                                exportText(`配送签约调整：提交审核成功，${org_name} - ${batch} - ${area}，总共配送 ${i3} 个注册证号，成功 ${s3} 个，失败 ${i3 - s3} 个`);
                            } catch (error) {
                                summary.push({ type: 4, c: org_name, b: batch, a: area });
                                exportText(`Error in submit_company_bak: ${error.stack}`);
                                exportText(`配送签约调整：提交审核失败，配送企业：${org_name}，动态批次：${batch}，配送地区：${area}`);
                            }
                        }
                    } catch (error) {
                        summary.push({ type: 5, c: org_name, b: batch, a: area });
                        exportText(`Error processing area ${area}: ${error.stack}`);
                        exportText(`在配送企业列表中找不到企业：配送企业：${org_name}，动态批次：${batch}，配送地区：${area}`);
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
                    exportText(`当前配送方案的状态不可进行配送方案点选或配送签约调整，请手动检查确认。配送企业：${c.c}，动态批次：${c.b}，配送地区：${c.a}`);
                }
                if (c.type === 1) {
                    exportText(`配送方案点选：添加注册证失败：配送企业：${c.c}，动态批次：${c.b}，配送地区：${c.a}，注册证号：${c.z}`);
                }
                if (c.type === 2) {
                    exportText(`配送签约调整：添加注册证失败：配送企业：${c.c}，动态批次：${c.b}，配送地区：${c.a}，注册证号：${c.z}`);
                }
                if (c.type === 3) {
                    exportText(`配送方案点选：提交失败，配送企业：${c.c}，动态批次：${c.b}，配送地区：${c.a}`);
                }
                if (c.type === 4) {
                    exportText(`配送签约调整：提交审核失败，配送企业：${c.c}，动态批次：${c.b}，配送地区：${c.a}`);
                }
                if (c.type === 5) {
                    exportText(`在配送企业列表中找不到企业：配送企业：${c.c}，动态批次：${c.b}，配送地区：${c.a}`);
                }
                if (c.type === 6) {
                    exportText(`配送关系待确认：配送企业：${c.c}，动态批次：${c.b}，配送地区：${c.a}`);
                }
            }
            
            exportText("-".repeat(69));
        }
        
        exportText(`总共配送 ${total_num} 个注册证号，其中成功 ${success} 个，失败 ${total_num - success} 个`);
    } catch (error) {
        exportText("失败，请重试");
        exportText(`Error in main: ${error.stack}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    // For browser environment, you might want to use a prompt or other UI element instead
    // prompt("按回车键继续...");
}

// Start the process
main().catch(error => {
    exportText(`Unhandled error: ${error.stack}`);
});

async function startTask(dataList, header) {
  let total_num = 0;
  let success_num = 0;
  headers = convertHeadersArrayToObject(header);
  headers['content-type'] = 'application/json;charset=UTF-8';
  try {
    for (let j = 0; j < dataList.length; j++) {
        let i = 0;
        const data = dataList[j];
        for (i; i < data.length; i++) {
            if (data[i][1] === '省平台-合同编号') break;
        }
        i += 1;
        for (i; i < data.length; i++) {
            if (!data[i][1]) continue;
            total_num += 1;
            let ms_code = data[i][1];
            let is_sign = data[i][2].trim();
            try {
                ms_code = ms_code.trim();
            } catch (err) {
                ms_code = String(parseInt(ms_code)).trim();
            }
            if (ms_code && is_sign) {
                try {
                    await timer(1000);
                    let res = {};
                    res = await query_protocol_list(ms_code, res);
                    if (is_sign !== '签章') {
                        await batch_audit_not_pass(res, is_sign);
                        success_num += 1;
                        exportText(`拒绝成功, 协议编号: ${ms_code}, 合同执行: ${is_sign}`);
                        continue;
                    }
                    const pdf_bs64 = await download_file(res.fileId);
                    const fileEncode = await sign_name(pdf_bs64);
                    await update_sign_status(res, fileEncode);
                    success_num += 1;
                    exportText(`签章成功, 协议编号: ${ms_code}, 合同执行: ${is_sign}`);
                } catch (error) {
                    exportText(`签章失败, 协议编号: ${ms_code}, 合同执行: ${is_sign}, 错误: ${error.stack}`);
                }
            } else {
                exportText(`Excel表格中的数据不全, 协议编号: ${ms_code}, 合同执行: ${is_sign}`);
            }
        }
    }
    exportText(`总数：${total_num}，签章成功：${success_num}，签章失败：${total_num - success_num}`);
  } catch (err) {
    exportText(`失败，请重试: ${err.stack}`);
  }
  exportText("已结束，请刷新页面后继续操作 (^_^)");
}

window.myExtensionFuncs = {
  startTask: (data, headers) => startTask(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask"] }, 
  "*"
);

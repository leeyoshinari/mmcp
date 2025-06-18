// 广东省平台点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let resubmit_num = 0;
let headers = {};
let area_code = [{"value":"440100","label":"广州市","children":[{"value":"440103","label":"荔湾区"},{"value":"440104","label":"越秀区"},{"value":"440105","label":"海珠区"},{"value":"440106","label":"天河区"},{"value":"440111","label":"白云区"},{"value":"440112","label":"黄埔区"},{"value":"440113","label":"番禺区"},{"value":"440114","label":"花都区"},{"value":"440115","label":"南沙区"},{"value":"440117","label":"从化区"},{"value":"440118","label":"增城区"},{"value":"440188","label":"广铁医保中心"}]},{"value":"440200","label":"韶关市","children":[{"value":"440203","label":"武江区"},{"value":"440204","label":"浈江区"},{"value":"440205","label":"曲江区"},{"value":"440222","label":"始兴县"},{"value":"440224","label":"仁化县"},{"value":"440229","label":"翁源县"},{"value":"440232","label":"乳源瑶族自治县"},{"value":"440233","label":"新丰县"},{"value":"440281","label":"乐昌市"},{"value":"440282","label":"南雄市"},{"value":"440299","label":"韶关市市本级"}]},{"value":"440300","label":"深圳市","children":[{"value":"440303","label":"罗湖区"},{"value":"440304","label":"福田区"},{"value":"440305","label":"南山区"},{"value":"440306","label":"宝安区"},{"value":"440307","label":"龙岗区"},{"value":"440308","label":"盐田区"},{"value":"440309","label":"龙华区"},{"value":"440310","label":"坪山区"},{"value":"440311","label":"光明区"},{"value":"440343","label":"大鹏新区"},{"value":"440399","label":"深圳市市本级"}]},{"value":"440400","label":"珠海市","children":[{"value":"440402","label":"香洲区"},{"value":"440403","label":"斗门区"},{"value":"440404","label":"金湾区"},{"value":"440441","label":"高新技术产业开发区"},{"value":"440442","label":"横琴新区"},{"value":"440443","label":"高栏港经济区"},{"value":"440499","label":"珠海市市本级"}]},{"value":"440500","label":"汕头市","children":[{"value":"440507","label":"龙湖区"},{"value":"440511","label":"金平区"},{"value":"440512","label":"濠江区"},{"value":"440513","label":"潮阳区"},{"value":"440514","label":"潮南区"},{"value":"440515","label":"澄海区"},{"value":"440523","label":"南澳县"},{"value":"440599","label":"汕头市市本级"}]},{"value":"440600","label":"佛山市","children":[{"value":"440604","label":"禅城区"},{"value":"440605","label":"南海区"},{"value":"440606","label":"顺德区"},{"value":"440607","label":"三水区"},{"value":"440608","label":"高明区"},{"value":"440699","label":"佛山市市本级"}]},{"value":"440700","label":"江门市","children":[{"value":"440703","label":"蓬江区"},{"value":"440704","label":"江海区"},{"value":"440705","label":"新会区"},{"value":"440781","label":"台山市"},{"value":"440783","label":"开平市"},{"value":"440784","label":"鹤山市"},{"value":"440785","label":"恩平市"},{"value":"440799","label":"江门市市本级"}]},{"value":"440800","label":"湛江市","children":[{"value":"440802","label":"赤坎区"},{"value":"440803","label":"霞山区"},{"value":"440804","label":"坡头区"},{"value":"440811","label":"麻章区"},{"value":"440823","label":"遂溪县"},{"value":"440825","label":"徐闻县"},{"value":"440840","label":"湛江经济技术开发区"},{"value":"440841","label":"湛江农垦"},{"value":"440881","label":"廉江市"},{"value":"440882","label":"雷州市"},{"value":"440883","label":"吴川市"},{"value":"440899","label":"湛江市市本级"}]},{"value":"440900","label":"茂名市","children":[{"value":"440902","label":"茂南区"},{"value":"440904","label":"电白区"},{"value":"440940","label":"广东茂名滨海新区"},{"value":"440941","label":"茂名市高新技术产业开发区"},{"value":"440981","label":"高州市"},{"value":"440982","label":"化州市"},{"value":"440983","label":"信宜市"},{"value":"440999","label":"茂名市市本级"}]},{"value":"441200","label":"肇庆市","children":[{"value":"441202","label":"端州区"},{"value":"441203","label":"鼎湖区"},{"value":"441204","label":"高要区"},{"value":"441223","label":"广宁县"},{"value":"441224","label":"怀集县"},{"value":"441225","label":"封开县"},{"value":"441226","label":"德庆县"},{"value":"441240","label":"肇庆高新技术产业开发区"},{"value":"441284","label":"四会市"},{"value":"441299","label":"肇庆市市本级"}]},{"value":"441300","label":"惠州市","children":[{"value":"441302","label":"惠城区"},{"value":"441303","label":"惠阳区"},{"value":"441322","label":"博罗县"},{"value":"441323","label":"惠东县"},{"value":"441324","label":"龙门县"},{"value":"441340","label":"大亚湾经济技术开发区（社保机构代码）"},{"value":"441341","label":"仲恺高新技术产业开发区（社保机构代码）"},{"value":"441399","label":"惠州市市本级"}]},{"value":"441400","label":"梅州市","children":[{"value":"441402","label":"梅江区"},{"value":"441403","label":"梅县区"},{"value":"441422","label":"大埔县"},{"value":"441423","label":"丰顺县"},{"value":"441424","label":"五华县"},{"value":"441426","label":"平远县"},{"value":"441427","label":"蕉岭县"},{"value":"441481","label":"兴宁市"},{"value":"441499","label":"梅州市市本级"}]},{"value":"441500","label":"汕尾市","children":[{"value":"441502","label":"城区"},{"value":"441521","label":"海丰县"},{"value":"441523","label":"陆河县"},{"value":"441540","label":"红海湾经济开发区"},{"value":"441542","label":"华侨管理区"},{"value":"441581","label":"陆丰市"},{"value":"441599","label":"汕尾市直"}]},{"value":"441600","label":"河源市","children":[{"value":"441602","label":"源城区"},{"value":"441621","label":"紫金县"},{"value":"441622","label":"龙川县"},{"value":"441623","label":"连平县"},{"value":"441624","label":"和平县"},{"value":"441625","label":"东源县"},{"value":"441640","label":"江东新区"},{"value":"441699","label":"河源市市本级"}]},{"value":"441700","label":"阳江市","children":[{"value":"441702","label":"江城区"},{"value":"441704","label":"阳东区"},{"value":"441721","label":"阳西县"},{"value":"441742","label":"阳江海陵试验区"},{"value":"441743","label":"阳江高新技术产业开发区"},{"value":"441781","label":"阳春市"},{"value":"441799","label":"阳江市市本级"}]},{"value":"441800","label":"清远市","children":[{"value":"441802","label":"清城区"},{"value":"441803","label":"清新区"},{"value":"441821","label":"佛冈县"},{"value":"441823","label":"阳山县"},{"value":"441825","label":"连山壮族瑶族自治县"},{"value":"441826","label":"连南瑶族自治县"},{"value":"441881","label":"英德市"},{"value":"441882","label":"连州市"},{"value":"441899","label":"清远市市本级"}]},{"value":"441900","label":"东莞市","children":[{"value":"441941","label":"东莞松山湖高新技术开发区"},{"value":"441999","label":"东莞市市本级"}]},{"value":"442000","label":"中山市","children":[{"value":"442099","label":"中山市市本级"}]},{"value":"445100","label":"潮州市","children":[{"value":"445102","label":"湘桥区"},{"value":"445103","label":"潮安区"},{"value":"445122","label":"饶平县"},{"value":"445140","label":"枫溪区"},{"value":"445141","label":"枫溪区(非开发区)"},{"value":"445199","label":"潮州市市本级"}]},{"value":"445200","label":"揭阳市","children":[{"value":"445202","label":"榕城区"},{"value":"445203","label":"揭东区"},{"value":"445222","label":"揭西县"},{"value":"445224","label":"惠来县"},{"value":"445241","label":"揭阳空港经济区"},{"value":"445242","label":"揭阳产业转移工业园"},{"value":"445246","label":"揭阳大南海石化工业区"},{"value":"445281","label":"普宁市"},{"value":"445299","label":"揭阳市市本级"}]},{"value":"445300","label":"云浮市","children":[{"value":"445302","label":"云城区"},{"value":"445303","label":"云安区"},{"value":"445321","label":"新兴县"},{"value":"445322","label":"郁南县"},{"value":"445381","label":"罗定市"},{"value":"445399","label":"云浮市市本级"}]}];

async function query_company(company, res) {
    try {
        const url = `${host}/tps_local_bd/web/mcstrans/bidprcuorginfo/getmcsdelvpscomppageNew`;
        const admdvsList = res['admdvsDtoList'].map(adm => adm['admdvs']);
        const druglist = res['drugDtoList'].map(dru => "undefined-" + dru['tenditmId']);
        const data = {
            "admdvsList": admdvsList,
            "druglist": druglist,
            "distributionType": res["distributionType"],
            "orgName": company
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.code === 0 && response.data && response.data.records.length > 0) {
            for (const rr of response.data.records) {
                if (rr.orgName === company) {
                    res.delventpCode = rr.uscc;
                    res.delventpname = rr.orgName;
                    return res;
                }
            }
            throw new Error(`配送企业查询到多个, 配送企业: ${company}, 查询结果: ${JSON.stringify(response.data.records)}`);
        } else {
            throw new Error(`配送企业查询为空, 配送企业: ${company}, 响应值: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_send_list(ms_code, company, area_code, tenditm_name) {
    try {
        const url = `${host}/tps_local_bd/web/mcstrans/mcsDelvRltl/schmProdAsoc/getDelvAreaDrugInfo`;
        const data = {
            "admdvs": String(area_code),
            "current": 1,
            "efftStas": null,
            "delvEntpName": company,
            "delvRltlStas": null,
            "prodCode": null,
            "prodEntpName": null,
            "pubonlnRsltIdYj": String(ms_code),
            "searchCount": true,
            "tendItmName": tenditm_name,
            "size": 10
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.code === 0 && response.data) {
            if (response.data.records.length === 1) {
                if (response.data.records[0].prodAsocStatus === '99') {
                    exportText(`当前配送关系状态为 已作废, 正在重新提交。耗材ID: ${ms_code}, 配送企业: ${company}, 项目名称: ${tenditm_name}`);
                    return response.data.records[0].schmProdId;
                } else {
                    const prodAsocStatus = Math.min(parseInt(response.data.records[0].prodAsocStatus), 3);
                    const statusText = ['生产未提交', '生产已提交', '配送已同意', '配送已拒绝'][prodAsocStatus];
                    exportText(`当前配送关系状态为 ${statusText}, 跳过不处理。耗材ID: ${ms_code}, 配送企业: ${company}, 项目名称: ${tenditm_name}`);
                    return -2;
                }
            } else if (response.data.records.length > 1) {
                exportText(`配送关系列表查询到多个, 耗材ID: ${ms_code}, 配送企业: ${company}, 项目名称: ${tenditm_name}, 查询结果: ${JSON.stringify(response.data.records)}`);
                return -1;
            } else {
                return -1;
            }
        } else {
            exportText(`配送关系列表查询异常, 耗材ID: ${ms_code}, 配送企业: ${company}, 项目名称: ${tenditm_name}, 查询结果: ${JSON.stringify(response.data)}`);
            return -1;
        }
    } catch (error) {
        exportText(`配送关系列表查询失败, 耗材ID: ${ms_code}, 企业名称: ${company}, 项目名称: ${tenditm_name}, 错误: ${error.stack}`);
        return -1;
    }
}

async function resubmit(schmProdId) {
    try {
        const url = `${host}/tps_local_bd/web/mcstrans/mcsDelvRltl/schmProdAsoc/updateStatusByProdId`;
        const data = {
            "prodAsocStatus": "1",
            "schmProdId": schmProdId
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.code !== 0 || !response.success) {
            exportText(`配送关系重新提交失败, schmProdId: ${schmProdId}, 响应值: ${JSON.stringify(response)}`);
            throw new Error(response.message);
        }
    } catch (error) {
        throw error;
    }
}

function query_areas(city, district, distributionType, res) {
    try {
        res.admdvsDtoList = [];
        res.distributionType = distributionType;
        
        for (const area of area_code) {
            if (area.label === city) {
                if (distributionType === 0) {
                    res.admdvsDtoList.push({
                        "admdvs": area.value,
                        "admdvsName": area.label
                    });
                    break;
                } else {
                    if (district) {
                        const district_raw = district.split(',');
                        for (const distr of area.children) {
                            if (district_raw.includes(distr.label)) {
                                res.admdvsDtoList.push({
                                    "admdvs": distr.value,
                                    "admdvsName": distr.label
                                });
                            }
                        }
                        break;
                    } else {
                        throw new Error("区县数据为空, 请检查excel表格数据");
                    }
                }
            }
        }
        
        if (res.admdvsDtoList.length === 0) {
            throw new Error(`配送地区查询失败, 所属市: ${city}, 所属区县: ${district}`);
        }
        return res;
    } catch (error) {
        throw error;
    }
}

async function query_code(code_list, company, tenditm_name_list, res) {
    try {
        const drug_list = [];
        const url = `${host}/tps_local_bd/web/mcstrans/trnsProdmcs/getTrnsProdMcsScPage`;
        
        for (let i = 0; i < code_list.length; i++) {
            const ms_code = code_list[i];
            const tenditmName = tenditm_name_list[i];
            
            const schmProdId = await query_send_list(ms_code, company, res.admdvsDtoList[0].admdvs, tenditmName);
            if (schmProdId === -2) {
                exportText(`当前配送关系已提交, 跳过不处理。耗材ID: ${ms_code}, 配送企业: ${company}, 配送地区: ${res.admdvsDtoList[0].admdvsName}, 项目名称: ${tenditmName}`);
                continue;
            }
            
            if (schmProdId !== -1) {
                try {
                    await resubmit(schmProdId);
                    resubmit_num += 1;
                    exportText(`配送关系重新提交成功, 药交耗材Id: ${ms_code}, 配送企业: ${company}, 配送地区: ${res.admdvsDtoList[0].admdvsName}, 项目名称: ${tenditmName}`);
                } catch (error) {
                    exportText(`配送关系重新提交失败, 药交耗材Id: ${ms_code}, 配送企业: ${company}, 配送地区: ${res.admdvsDtoList[0].admdvsName}, 项目名称: ${tenditmName}, 错误: ${error.stack}`);
                }
                continue;
            }
            
            const data = {
                "current": 1,
                "size": 10,
                "searchCount": true,
                "mcsName": null,
                "mcsCode": null,
                "tenditmName": tenditmName,
                "pubonlnRsltIdYj": String(ms_code)
            };
            
            try {
                const response = await fetchPost(url, data, headers);
                if (response.code === 0 && response.data && response.data.records.length === 1) {
                    const drug = {
                        "mcsRegno": response.data.records[0].mcsRegno,
                        "pubonlnRsltId": response.data.records[0].pubonlnRsltId,
                        "pubonlnRsltIdYj": response.data.records[0].pubonlnRsltIdYj,
                        "tenditmId": response.data.records[0].tenditmId,
                        "tenditmName": response.data.records[0].tenditmName
                    };
                    drug_list.push(drug);
                    exportText(`药交耗材添加成功, 待提交, 药交耗材Id: ${ms_code}, 项目名称: ${tenditmName}`);
                } else {
                    if (response.code !== 0) {
                        exportText(`药交耗材查询结果为空, 药交耗材Id: ${ms_code}, 项目名称: ${tenditmName}, 查询结果: ${JSON.stringify(response)}`);
                    } else {
                        exportText(`药交耗材查询结果为空或有多个, 药交耗材Id: ${ms_code}, 项目名称: ${tenditmName}, 查询结果: ${JSON.stringify(response.data.records)}`);
                    }
                }
            } catch (error) {
                exportText(`药交耗材查询查询失败, 药交耗材Id: ${ms_code}, 项目名称: ${tenditmName}, 错误: ${error.stack}`);
            }
        }
        res.drugDtoList = drug_list;
        return res;
    } catch (error) {
        throw error;
    }
}

async function submit_c(res) {
    try {
        const url = `${host}/tps_local_bd/web/mcstrans/mcsDelvRltl/schm/saveDrugDelvPost`;
        res.remarks = '';
        res.status = '1';
        
        const response = await fetchPost(url, res, headers);
        if (response.code !== 0 || !response.success) {
            const areas1 = res.admdvsDtoList.map(adm => adm.admdvsName);
            exportText(`配送提交失败, 药交ID: ${res.drugDtoList[0].pubonlnRsltIdYj}, 配送企业: ${res.delventpname}, 配送地区: ${areas1.join(',')}, 响应值: ${JSON.stringify(response)}`);
            throw new Error(response.message);
        }
    } catch (error) {
        const areas1 = res.admdvsDtoList.map(adm => adm.admdvsName);
        throw new Error(`配送提交失败, 药交ID: ${res.drugDtoList[0].pubonlnRsltIdYj}, 配送企业: ${res.delventpname}, 配送地区: ${areas1.join(',')}, 错误: ${error.stack}`);
    }
}

function parseExcelData(allData) {
    const resDict = {};
    let ind = 1;
    
    for (let i = 0; i < allData.length; i++) {
        if (allData[i][8] && allData[i][8].toString().includes('药交ID')) {
            break;
        } else {
            ind++;
        }
    }
    
    for (let i = ind; i < allData.length; i++) {
        if (!allData[i][8]) continue;
        let msCode;
        try {
            msCode = allData[i][8].toString().trim();
        } catch (e) {
            msCode = String(parseInt(allData[i][8]));
        }
        
        const company = allData[i][2]?.toString().trim() || '';
        const orgMd5 = calc_md5(company);
        const isCity = allData[i][3]?.toString().trim() || '';
        const city = allData[i][4]?.toString().trim() || '';
        const district = isCity === '地市' ? null : (allData[i][5]?.toString().trim() || '');
        const areaMd5 = calc_md5(`${city}_${district}`);
        const tenditmName = allData[i][7]?.toString().trim() || '';
        
        if (resDict[orgMd5]) {
            if (resDict[orgMd5]['v'][areaMd5]) {
                resDict[orgMd5]['v'][areaMd5]['code'].push(msCode);
                resDict[orgMd5]['v'][areaMd5]['tenditm_name'].push(tenditmName);
            } else {
                resDict[orgMd5]['v'][areaMd5] = {
                    is_city: isCity,
                    city: city,
                    district: district,
                    code: [msCode],
                    tenditm_name: [tenditmName]
                };
            }
        } else {
            resDict[orgMd5] = {
                k: company,
                v: {
                    [areaMd5]: {
                        is_city: isCity,
                        city: city,
                        district: district,
                        code: [msCode],
                        tenditm_name: [tenditmName]
                    }
                }
            };
        }
    }
    return resDict;
}

async function startTask(data, header) {
    const send_num = 10;
    let total_num = 0;
    let success = 0;
    headers = convertHeadersArrayToObject(header);
    headers['content-type'] = 'application/json;charset=UTF-8';
    try {
        excel_data = parseExcelData(data);
        for (const [_, v] of Object.entries(excel_data)) {
            const company = v.k;
            for (const [_, vv] of Object.entries(v.v)) {
                const is_city = vv.is_city;
                const city = vv.city;
                const district = vv.district;
                const code_list = vv.code;
                const tenditm_list = vv.tenditm_name;
                const distributionType = is_city === '地市' ? 0 : 1;
                
                total_num += code_list.length;
                const send_code_list = [];
                const tenditm_name_list = [];
                for (let i = 0; i < code_list.length; i += send_num) {
                    send_code_list.push(code_list.slice(i, i + send_num));
                    tenditm_name_list.push(tenditm_list.slice(i, i + send_num));
                }
                
                for (let index = 0; index < send_code_list.length; index++) {
                    const send_code = send_code_list[index];
                    const t_name = tenditm_name_list[index];
                    
                    if (send_code && send_code.length > 0 && company && is_city && city) {
                        try {
                            let res = { 'distributionType': distributionType };
                            res = query_areas(city, district, distributionType, res);
                            res = await query_code(send_code, company, t_name, res);
                            res = await query_company(company, res);
                            
                            const areas = res.admdvsDtoList.map(adm => adm.admdvsName);
                            if (res.drugDtoList.length === 0) {
                                exportText(`暂无需要配送的药交耗材Id, 请检查后重试, 配送企业: ${company}, 配送地区: ${areas.join(',')}，`);
                                continue;
                            }
                            
                            await submit_c(res);
                            success += res.drugDtoList.length;
                            const send_code_real = res.drugDtoList.map(rr => rr.pubonlnRsltIdYj);
                            exportText(`配送成功, 配送企业: ${company}, 配送地区: ${areas.join(',')}, 药交ID: ${send_code_real.join(',')}`);
                        } catch (error) {
                            const areas = is_city === '地市' ? city : district;
                            exportText(`配送失败, 配送企业: ${company}, 配送地区: ${areas}, 药交ID: ${send_code.join(',')}, 错误: ${error.stack}`);
                        }
                    } else {
                        const areas = is_city === '地市' ? city : district;
                        exportText(`Excel表格中的数据不全, 配送企业: ${company}, 配送地区: ${areas}, 药交ID: ${send_code ? send_code.join(',') : '空'}`);
                    }
                }
            }
        }
        exportText(`总数: ${total_num}, 配送成功: ${success + resubmit_num}, 配送失败: ${total_num - success - resubmit_num}`);
    } catch (error) {
        exportText(`失败, 请重试: ${err.stack}`);
    }
    exportText("已结束, 请刷新页面后继续操作 (^_^)");
}

window.myExtensionFuncs = {
  startTask: (data, headers) => startTask(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask"] }, 
  "*"
);

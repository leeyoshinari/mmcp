// 广州市平台点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let resubmit_num = 0;
let headers = {};
let area_code = [{"value":"440100","label":"广州市","children":[{"value":"440103","label":"荔湾区"},{"value":"440104","label":"越秀区"},{"value":"440105","label":"海珠区"},{"value":"440106","label":"天河区"},{"value":"440111","label":"白云区"},{"value":"440112","label":"黄埔区"},{"value":"440113","label":"番禺区"},{"value":"440114","label":"花都区"},{"value":"440115","label":"南沙区"},{"value":"440117","label":"从化区"},{"value":"440118","label":"增城区"},{"value":"440188","label":"广铁医保中心"}]},{"value":"440200","label":"韶关市","children":[{"value":"440203","label":"武江区"},{"value":"440204","label":"浈江区"},{"value":"440205","label":"曲江区"},{"value":"440222","label":"始兴县"},{"value":"440224","label":"仁化县"},{"value":"440229","label":"翁源县"},{"value":"440232","label":"乳源瑶族自治县"},{"value":"440233","label":"新丰县"},{"value":"440281","label":"乐昌市"},{"value":"440282","label":"南雄市"},{"value":"440299","label":"韶关市市本级"}]},{"value":"440300","label":"深圳市","children":[{"value":"440303","label":"罗湖区"},{"value":"440304","label":"福田区"},{"value":"440305","label":"南山区"},{"value":"440306","label":"宝安区"},{"value":"440307","label":"龙岗区"},{"value":"440308","label":"盐田区"},{"value":"440309","label":"龙华区"},{"value":"440310","label":"坪山区"},{"value":"440311","label":"光明区"},{"value":"440343","label":"大鹏新区"},{"value":"440399","label":"深圳市市本级"}]},{"value":"440400","label":"珠海市","children":[{"value":"440402","label":"香洲区"},{"value":"440403","label":"斗门区"},{"value":"440404","label":"金湾区"},{"value":"440441","label":"高新技术产业开发区"},{"value":"440442","label":"横琴新区"},{"value":"440443","label":"高栏港经济区"},{"value":"440499","label":"珠海市市本级"}]},{"value":"440500","label":"汕头市","children":[{"value":"440507","label":"龙湖区"},{"value":"440511","label":"金平区"},{"value":"440512","label":"濠江区"},{"value":"440513","label":"潮阳区"},{"value":"440514","label":"潮南区"},{"value":"440515","label":"澄海区"},{"value":"440523","label":"南澳县"},{"value":"440599","label":"汕头市市本级"}]},{"value":"440600","label":"佛山市","children":[{"value":"440604","label":"禅城区"},{"value":"440605","label":"南海区"},{"value":"440606","label":"顺德区"},{"value":"440607","label":"三水区"},{"value":"440608","label":"高明区"},{"value":"440699","label":"佛山市市本级"}]},{"value":"440700","label":"江门市","children":[{"value":"440703","label":"蓬江区"},{"value":"440704","label":"江海区"},{"value":"440705","label":"新会区"},{"value":"440781","label":"台山市"},{"value":"440783","label":"开平市"},{"value":"440784","label":"鹤山市"},{"value":"440785","label":"恩平市"},{"value":"440799","label":"江门市市本级"}]},{"value":"440800","label":"湛江市","children":[{"value":"440802","label":"赤坎区"},{"value":"440803","label":"霞山区"},{"value":"440804","label":"坡头区"},{"value":"440811","label":"麻章区"},{"value":"440823","label":"遂溪县"},{"value":"440825","label":"徐闻县"},{"value":"440840","label":"湛江经济技术开发区"},{"value":"440841","label":"湛江农垦"},{"value":"440881","label":"廉江市"},{"value":"440882","label":"雷州市"},{"value":"440883","label":"吴川市"},{"value":"440899","label":"湛江市市本级"}]},{"value":"440900","label":"茂名市","children":[{"value":"440902","label":"茂南区"},{"value":"440904","label":"电白区"},{"value":"440940","label":"广东茂名滨海新区"},{"value":"440941","label":"茂名市高新技术产业开发区"},{"value":"440981","label":"高州市"},{"value":"440982","label":"化州市"},{"value":"440983","label":"信宜市"},{"value":"440999","label":"茂名市市本级"}]},{"value":"441200","label":"肇庆市","children":[{"value":"441202","label":"端州区"},{"value":"441203","label":"鼎湖区"},{"value":"441204","label":"高要区"},{"value":"441223","label":"广宁县"},{"value":"441224","label":"怀集县"},{"value":"441225","label":"封开县"},{"value":"441226","label":"德庆县"},{"value":"441240","label":"肇庆高新技术产业开发区"},{"value":"441284","label":"四会市"},{"value":"441299","label":"肇庆市市本级"}]},{"value":"441300","label":"惠州市","children":[{"value":"441302","label":"惠城区"},{"value":"441303","label":"惠阳区"},{"value":"441322","label":"博罗县"},{"value":"441323","label":"惠东县"},{"value":"441324","label":"龙门县"},{"value":"441340","label":"大亚湾经济技术开发区（社保机构代码）"},{"value":"441341","label":"仲恺高新技术产业开发区（社保机构代码）"},{"value":"441399","label":"惠州市市本级"}]},{"value":"441400","label":"梅州市","children":[{"value":"441402","label":"梅江区"},{"value":"441403","label":"梅县区"},{"value":"441422","label":"大埔县"},{"value":"441423","label":"丰顺县"},{"value":"441424","label":"五华县"},{"value":"441426","label":"平远县"},{"value":"441427","label":"蕉岭县"},{"value":"441481","label":"兴宁市"},{"value":"441499","label":"梅州市市本级"}]},{"value":"441500","label":"汕尾市","children":[{"value":"441502","label":"城区"},{"value":"441521","label":"海丰县"},{"value":"441523","label":"陆河县"},{"value":"441540","label":"红海湾经济开发区"},{"value":"441542","label":"华侨管理区"},{"value":"441581","label":"陆丰市"},{"value":"441599","label":"汕尾市直"}]},{"value":"441600","label":"河源市","children":[{"value":"441602","label":"源城区"},{"value":"441621","label":"紫金县"},{"value":"441622","label":"龙川县"},{"value":"441623","label":"连平县"},{"value":"441624","label":"和平县"},{"value":"441625","label":"东源县"},{"value":"441640","label":"江东新区"},{"value":"441699","label":"河源市市本级"}]},{"value":"441700","label":"阳江市","children":[{"value":"441702","label":"江城区"},{"value":"441704","label":"阳东区"},{"value":"441721","label":"阳西县"},{"value":"441742","label":"阳江海陵试验区"},{"value":"441743","label":"阳江高新技术产业开发区"},{"value":"441781","label":"阳春市"},{"value":"441799","label":"阳江市市本级"}]},{"value":"441800","label":"清远市","children":[{"value":"441802","label":"清城区"},{"value":"441803","label":"清新区"},{"value":"441821","label":"佛冈县"},{"value":"441823","label":"阳山县"},{"value":"441825","label":"连山壮族瑶族自治县"},{"value":"441826","label":"连南瑶族自治县"},{"value":"441881","label":"英德市"},{"value":"441882","label":"连州市"},{"value":"441899","label":"清远市市本级"}]},{"value":"441900","label":"东莞市","children":[{"value":"441941","label":"东莞松山湖高新技术开发区"},{"value":"441999","label":"东莞市市本级"}]},{"value":"442000","label":"中山市","children":[{"value":"442099","label":"中山市市本级"}]},{"value":"445100","label":"潮州市","children":[{"value":"445102","label":"湘桥区"},{"value":"445103","label":"潮安区"},{"value":"445122","label":"饶平县"},{"value":"445140","label":"枫溪区"},{"value":"445141","label":"枫溪区(非开发区)"},{"value":"445199","label":"潮州市市本级"}]},{"value":"445200","label":"揭阳市","children":[{"value":"445202","label":"榕城区"},{"value":"445203","label":"揭东区"},{"value":"445222","label":"揭西县"},{"value":"445224","label":"惠来县"},{"value":"445241","label":"揭阳空港经济区"},{"value":"445242","label":"揭阳产业转移工业园"},{"value":"445246","label":"揭阳大南海石化工业区"},{"value":"445281","label":"普宁市"},{"value":"445299","label":"揭阳市市本级"}]},{"value":"445300","label":"云浮市","children":[{"value":"445302","label":"云城区"},{"value":"445303","label":"云安区"},{"value":"445321","label":"新兴县"},{"value":"445322","label":"郁南县"},{"value":"445381","label":"罗定市"},{"value":"445399","label":"云浮市市本级"}]}];

async function query_company(company, res) {
    try {
        const url = `${host}/gpo/tps_local_bd/web/mcsTrade/distributionArea/getmcsdelvpscomppageNew`;
        const admdvsList = res['admdvsDtoList'].map(adm => adm['admdvs']);
        const areas = res['admdvsDtoList'].map(adm => adm['admdvsName']);
        const druglist = ["undefined-undefined"]; // ["undefined-" + dru['tenditmId'] for dru in res['drugDtoList']]
        const data = {
            "admdvsList": admdvsList,
            "druglist": druglist,
            "distributionType": res["distributionType"],
            "orgName": company
        };
        
        const res_json = await fetchPost(url, data, headers);
        if (res_json['code'] === 0 && res_json['data'] && res_json['data']['records'].length > 0) {
            for (const rr of res_json['data']['records']) {
                const new_org_name = rr['orgName'].trim();
                if (new_org_name === company) {
                    res["delventpCode"] = rr['uscc'];
                    res["delventpname"] = new_org_name;
                    return res;
                }
            }
            throw new Error(`配送企业查询到多个, 配送企业: ${company}, 配送地区: ${areas.join(',')}, 查询结果: ${JSON.stringify(res_json['data']['records'])}`);
        } else {
            throw new Error(`配送企业查询为空, 配送企业: ${company}, 配送地区: ${areas.join(',')}, 响应值: ${JSON.stringify(res_json['data'])}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_send_list(ms_code, company, city, purchase_type) {
    try {
        const url = `${host}/gpo/tps_local_bd/web/mcsTrade/distributionArea/getDelvAreaDrugInfo`;
        const data = {
            "current": 1,
            "size": 10,
            "searchCount": true,
            "searchTime": [],
            "goodsId": String(ms_code),
            "admdvsName": city,
            "delvEntpName": company,
            "isGroup": "1",
            "sourceName": purchase_type
        };
        
        const res_json = await fetchPost(url, data, headers);
        if (res_json['code'] === 0 && res_json['data']) {
            if (res_json['data']['records'].length === 1) {
                if (res_json['data']['records'][0]['prodAsocStatus'] === '99') {
                    exportText(`当前配送关系状态为 已作废, 正在重新提交。产品ID: ${ms_code}, 配送企业: ${company}, 配送区域: ${city}, 采购来源: ${purchase_type}`);
                    return -1;
                } else {
                    const prodAsocStatus = Math.min(parseInt(res_json['data']['records'][0]['prodAsocStatus']), 3);
                    const statusText = ['生产未提交', '生产已提交', '已生效', '配送已拒绝'][prodAsocStatus];
                    exportText(`当前配送关系状态为 ${statusText}, 跳过不处理。产品ID: ${ms_code}, 配送企业: ${company}, 配送区域: ${city}, 采购来源: ${purchase_type}`);
                    return -2;
                }
            } else if (res_json['data']['records'].length > 1) {
                exportText(`配送关系列表查询到多个, 产品ID: ${ms_code}, 配送企业: ${company}, 配送区域: ${city}, 采购来源: ${purchase_type}, 查询结果: ${JSON.stringify(res_json['data']['records'])}`);
                return -1;
            } else if (res_json['data']['records'].length === 0) {
                return -1;
            }
        }
        exportText(`配送关系列表查询异常, 产品ID: ${ms_code}, 配送企业: ${company}, 配送区域: ${city}, 采购来源: ${purchase_type}, 查询结果: ${JSON.stringify(res_json)}`);
        return -1;
    } catch (error) {
        exportText(error.stack);
        return -1;
    }
}

async function resubmit(schmProdId) {
    try {
        const url = `${host}/gpo/tps_local_bd/web/mcsTrade/distributionArea/updateStatusByProdId`;
        const data = {
            "prodAsocStatus": "1",
            "schmProdId": schmProdId
        };
        
        const res_json = await fetchPost(url, data, headers);
        if (res_json['code'] !== 0 || !res_json['success']) {
            exportText(`配送关系重新提交失败, schmProdId: ${schmProdId}, 响应值: ${JSON.stringify(res_json)}`);
            throw new Error(res_json['message']);
        }
    } catch (error) {
        throw error;
    }
}

function query_areas(city, district, distributionType, res) {
    try {
        res["admdvsDtoList"] = [];
        res["distributionType"] = distributionType;
        
        for (const area of area_code) {
            if (area['label'] === city) {
                if (distributionType === 0) {
                    res["admdvsDtoList"].push({
                        "admdvs": area['value'],
                        "admdvsName": area['label']
                    });
                    break;
                } else {
                    if (district) {
                        const district_raw = district.split(',');
                        for (const distr of area['children']) {
                            if (district_raw.includes(distr['label'])) {
                                res["admdvsDtoList"].push({
                                    "admdvs": distr['value'],
                                    "admdvsName": distr['label']
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
        
        if (res["admdvsDtoList"].length === 0) {
            throw new Error(`配送地区查询失败, 所属市: ${city}, 所属区县: ${district}`);
        }
        return res;
    } catch (error) {
        throw error;
    }
}

async function query_code(ms_code, company, purchase_type, res) {
    try {
        const url = `${host}/gpo/tps_local_bd/web/mcsTrade/distributionArea/getTrnsProdMcsScPage`;
        const schmProdId = await query_send_list(ms_code, company, res['admdvsDtoList'][0]['admdvsName'], purchase_type);
        if (schmProdId === -2) {
            exportText(`当前配送关系已提交, 跳过不处理。产品ID: ${ms_code}, 配送企业: ${company}, 配送地区: ${res['admdvsDtoList'][0]['admdvsName']}, 采购来源: ${purchase_type}`);
            return null;
        }
        
        if (schmProdId !== -1) {
            try {
                await resubmit(schmProdId);
                exportText(`配送关系重新提交成功, 产品ID: ${ms_code}, 配送企业: ${company}, 配送地区: ${res['admdvsDtoList'][0]['admdvsName']}, 采购来源: ${purchase_type}`);
            } catch (error) {
                exportText(`配送关系重新提交失败, 产品ID: ${ms_code}, 配送企业: ${company}, 配送地区: ${res['admdvsDtoList'][0]['admdvsName']}, 采购来源: ${purchase_type}, 错误: ${error.stack}`);
            } finally {
                return null;
            }
        }
        
        const data = {
            "current": 1,
            "size": 10,
            "searchCount": true,
            "goodsName": null,
            "ybCode": null,
            "tenditmName": null,
            "goodsId": String(ms_code),
            "procurecatalogId": "",
            "group": 0,
            "isUsing": 1,
            "sourceName": purchase_type
        };
        
        const newHeaders = {...headers, 'gcode': 'gpoCTrans'};
        const res_json = await fetchPost(url, data, newHeaders);
        if (res_json['code'] === 0 && res_json['data'] && res_json['data']['records'].length === 1) {
            res["drugDtoList"] = [{"procurecatalogId": res_json['data']['records'][0]['procurecatalogId']}];
            return res;
        } else {
            if (res_json['code'] !== 0) {
                throw new Error(`产品ID查询结果为空, 产品ID: ${ms_code}, 采购来源: ${purchase_type}, 查询结果: ${JSON.stringify(res_json)}`);
            } else {
                throw new Error(`产品ID查询结果为空或有多个, 产品ID: ${ms_code}, 采购来源: ${purchase_type}, 查询结果: ${JSON.stringify(res_json['data']['records'])}`);
            }
        }
    } catch (error) {
        throw error;
    }
}

async function submit_c(res) {
    try {
        const url = `${host}/gpo/tps_local_bd/web/mcsTrade/distributionArea/saveDrugDelvPost`;
        res["remarks"] = '';
        res["status"] = '1';
        
        const res_json = await fetchPost(url, res, headers);
        if (res_json['code'] !== 0 || !res_json['success']) {
            const areas1 = res['admdvsDtoList'].map(adm => adm['admdvsName']);
            exportText(`配送提交失败, 商品ID: ${res['drugDtoList'][0]['procurecatalogId']}, 配送企业: ${res['delventpname']}, 配送地区: ${areas1.join(',')}, 响应值: ${JSON.stringify(res_json)}`);
            throw new Error(res_json['message']);
        }
    } catch (error) {
        throw error;
    }
}

async function startTask115(dataList, header) {
    let total_num = 0;
    let success = 0;
    headers = convertHeadersArrayToObject(header);
    headers['content-type'] = 'application/json;charset=UTF-8';
    try {
        for (let j = 0; j < dataList.length; j++) {
            let i = 0;
            const data = dataList[j];
            for (i; i < data.length; i++) {
                if (data[i][8] && data[i][8].replace(/[\r\n]/g, '') === '产品ID(市平台)') break;
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
                let company = data[i][2].trim();
                let is_city = data[i][3].trim();
                let city = data[i][4].trim();
                let district = is_city === "地市" ? null : data[i][5].trim();
                let purchase_type = data[i][7].trim();
                let distributionType = is_city === '地市' ? 0 : 1;
                if (ms_code && company && is_city && city && purchase_type) {
                    try {
                        let res = {"distributionType": distributionType};
                        res = query_areas(city, district, distributionType, res);
                        res = await query_code(String(ms_code).trim(), company, purchase_type, res);
                        if (!res) {
                            resubmit_num += 1;
                            continue;
                        }
                        
                        res = await query_company(company, res);
                        const areas = res['admdvsDtoList'].map(adm => adm['admdvsName']);
                        await submit_c(res);
                        success += 1;
                        exportText(`配送成功, 产品ID: ${ms_code}, 配送企业: ${company}, 配送地区: ${areas.join(',')}, 采购来源: ${purchase_type}`);
                    } catch (error) {
                        const areas = is_city === '地市' ? city : district;
                        exportText(`配送失败, 产品ID: ${ms_code}, 配送企业: ${company}, 配送地区: ${areas}, 采购来源: ${purchase_type}, 错误: ${error.stack}`);
                    }
                } else {
                    const areas = is_city === '地市' ? city : district;
                    exportText(`Excel表格中的数据不全, 产品ID: ${ms_code}, 配送企业: ${company}, 配送地区: ${areas}, 采购来源: ${purchase_type}`);
                }
            }
        }
        exportText(`总数: ${total_num}, 配送成功: ${success + resubmit_num}, 配送失败: ${total_num - success - resubmit_num}`);
    } catch (error) {
        exportText(`失败, 请重试: ${error.stack}`);
    }
    exportText("已结束, 请刷新页面后继续操作 (^_^)");
}

window.myExtensionFuncs = {
  startTask115: (data, headers) => startTask115(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask115"] }, 
  "*"
);

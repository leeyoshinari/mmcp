// 河南省删除、撤废配送关系
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};


function formatDate(timestamp) {
    const date = new Date(timestamp);
    const padZero = num => num.toString().padStart(2, '0');

    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ` +
           `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
}


async function query_companyIdTb() {
    try {
        const url = `${host}/sjtrade/suppurDistributionRelation/toLookGoodsAgreementDl.html`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
            ...headers,
            },
        });
        if (!response.ok) throw new Error('Request Error:' + response.status);
        const pattern = /name="companyIdTb"\s+value="([^"]*)"/;
        const patternType = /name="notPurchaseType"\s+value="([^"]*)"/;
        const html_str = await response.text();
        const match = pattern.exec(html_str);
        const matchType = patternType.exec(html_str);
        if (match && match[1] && matchType && matchType[1]) {
            const companyId = match[1];
            const notPurchaseType = matchType[1];
            exportText(`companyIdTb 的值为 ${companyId}, notPurchaseType 的值为 ${notPurchaseType}`);
            return {'companyId': companyId, 'notPurchaseType': notPurchaseType};
        } else {
            throw new Error("未找到 companyIdTb 的值，或者 notPurchaseType 的值");
        }
    } catch (error) {
        throw error;
    }
}

async function query_list(goodsId, companyName, hospitalName, cp) {
    try {
        const url = `${host}/sjtrade/suppurDistributionRelation/getDrugpurDistributionRelationData.html`;
        const data = {
            '_search': false,
            'nd': Date.now(),
            'rows': 10,
            'page': 1,
            'sidx': null,
            'sord': 'asc',
            'companyIdTb': cp.companyId,
            'notPurchaseType': cp.notPurchaseType,
            'goodsId': goodsId,
            'area1': 410000,
            'companyNamePs': companyName,
            'hospitalName': hospitalName
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.total > 0) {
            return response.rows;
        } else {
            throw new Error(`配送关系列表查询结果为空，产品代码：${goodsId}，查询结果：${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function updateSuppurDistributionRelationByIng(r_id, companyIdTb) {
    try {
        const url = `${host}/sjtrade/suppurDistributionRelation/updateSuppurDistributionRelationByIng.html`;
        const data = {'type': 1, 'companyIdTb': companyIdTb, 'id': r_id}
        const response = await fetchPost(url, data, headers);
        if (response.code !== 0 && !response.success) {
            throw new Error(`撤废失败...`);
        }
    } catch (error) {
        throw new Error(`撤废失败，错误：${error.message}`);
    }
}

async function deleteDistributionRelation(r_id) {
    try {
        const url = `${host}/sjtrade/suppurDistributionRelation/deleteDistributionRelation.html`;
        const data = {'id': r_id}
        const response = await fetchPost(url, data, headers);
        if (response.code !== 0 && !response.success) {
            throw new Error(`删除失败...`);
        }
    } catch (error) {
        throw new Error(`删除失败，错误：${error.message}`);
    }
}

async function startTask550(dataList, header) {
    let total_num = 0;
    let success = 0;
    headers = convertHeadersArrayToObject(header);
    headers['content-type'] = 'application/x-www-form-urlencoded';
    try {
        const confirmStatus = ['待提交', '已提交待配送方确认', '双方同意', '配送方拒绝', '已撤废'];
        const res = await query_companyIdTb();
        for (let j = 0; j < dataList.length; j++) {
            let i = 0;
            const data = dataList[j];
            for (i; i < data.length; i++) {
                if (data[i][0] === '产品代码' && data[i][4].indexOf('本次撤废配送企业名称') > -1) break;
            }
            i += 1;
            for (i; i < data.length; i++) {
                if (!data[i][0]) continue;
                total_num += 1;
                let mcs_code = data[i][0];
                try {
                  mcs_code = mcs_code.trim();
                } catch (err) {
                  mcs_code = String(parseInt(mcs_code)).trim();
                }
                let org_name = data[i][4];
                let hospital = data[i][3];
                if (mcs_code && org_name && hospital) {
                    try {
                        const send_list = await query_list(mcs_code, org_name, hospital, res);
                        for(let n=0; n<send_list.length; n++) {
                            const cs = send_list[n].confirmStatus;
                            if (cs === 1) {
                                await deleteDistributionRelation(send_list[n].id);
                                exportText(`删除成功：产品代码：${mcs_code}，配送企业：${org_name}，医院：${hospital}，提交时间：${formatDate(send_list[n].submitTime)}，当前确认状态：${confirmStatus[cs]}`);
                            } else if (cs === 2) {
                                await updateSuppurDistributionRelationByIng(send_list[n].id, res.companyId);
                                exportText(`撤废成功：产品代码：${mcs_code}，配送企业：${org_name}，医院：${hospital}，提交时间：${formatDate(send_list[n].submitTime)}，当前确认状态：${confirmStatus[cs]}`);
                            } else {
                                exportText(`跳过：产品代码：${mcs_code}，配送企业：${org_name}，医院：${hospital}，提交时间：${formatDate(send_list[n].submitTime)}，当前确认状态：${confirmStatus[cs]}`);
                            }
                        }
                        success++;
                    } catch (error) {
                        exportText(`失败：产品代码：${mcs_code}，配送企业：${org_name}，医院：${hospital}。Error: ${error.stack}`);
                    }
                } else {
                    exportText(`Excel 数据不完整：产品代码：${mcs_code}，配送企业：${org_name}，医院：${hospital}`);
                }
            }
        }
        exportText(`总数：${total_num}，操作成功：${success}，操作失败：${total_num-success}`);
    } catch (err) {
        exportText(`失败，请重试: ${err.stack}`);
    }
    downloadData(textContainer.textContent);
}

window.myExtensionFuncs = {
  startTask550: (data, headers) => startTask550(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask550"] }, 
  "*"
);

// 海南点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};

async function queryCode(msCode, res) {
    const url = `${host}/tps-local/local/web/trns/trnsProdRgt/getTrnsProdDrugByDelvRltlSetPage?current=1&size=10&prodCode=${msCode}`;
    const response = await fetchGet(url, headers);
    if (response.code === 0 && response.data && response.data.records.length === 1) {
        return {
            ...res,
            prodId: response.data.records[0].prodId,
            dclaEntpName: response.data.records[0].dclaEntpName,
            dclaEntpCode: response.data.records[0].dclaEntpCode,
            prodentpName: response.data.records[0].prodentpName,
            prodentpCode: response.data.records[0].prodentpCode,
            pubonlnStas: response.data.records[0].pubonlnStas
        };
    } else {
        throw new Error(`配送关系设置列表查询结果为空或有多个试剂统一编码，试剂统一编码: ${msCode}，查询结果：${JSON.stringify(response.data)}`);
    }
}

async function querySendRelation(msCode, res, save_flag) {
    const url = `${host}/tps-local/local/web/trns/trnsRgtDelvRltl/getTrnsDelvRltlList?current=1&size=10&prodCode=${msCode}&delventpName=${encodeURIComponent(res['delventpName'])}&delvRltlStas=0&admdvs=${res['admdvs']}`;
    const response = await fetchGet(url, headers);
    if (response.code === 0 && response.data && response.data.records.length === 1) {
        return response.data.records[0].drugDelvRltlId;
    } else {
        if (save_flag) {
            return '-11';
        } else {
            throw new Error(`配送关系列表查询结果为空或有多条数据，试剂统一编码: ${msCode}，配送企业: ${res['delventpName']}，配送地区: ${res['admdvsName']}，查询结果：${JSON.stringify(response.data)}`);
        }
    }
}

async function query_company(company, res) {
    const url = `${host}/tps-local/local/web/bdc/bidprcuRgtOrgInfo/getPsCompanyPage?current=1&size=10&orgName=${encodeURIComponent(company)}&orgBizTypeCode=2`;
    const res_json = await fetchGet(url, headers);
    if (res_json['code'] === 0 && res_json['data'] && res_json['data']['records'].length > 0) {
        for (const rr of res_json['data']['records']) {
            const new_org_name = rr['orgName'].trim();
            if (new_org_name === company) {
                res["delventpCode"] = rr['uscc'];
                return res;
            }
        }
        throw new Error(`配送企业查询到多个, 配送企业: ${company}, 查询结果: ${JSON.stringify(res_json['data']['records'])}`);
    } else {
        throw new Error(`配送企业查询为空, 配送企业: ${company}, 响应值: ${JSON.stringify(res_json['data'])}`);
    }
}

async function query_area(area, res) {
    const url = `${host}/tps-local/local/web/bdc/admdvsInfo/list?prntAdmdvs=460000`;
    const res_json = await fetchGet(url, headers);
    if (res_json['code'] === 0 && res_json['data']) {
        for (const rr of res_json['data']) {
            const new_area_name = rr['admdvsName'].trim();
            if (new_area_name === area) {
                res["admdvs"] = rr['admdvs'];
                return res;
            }
        }
        throw new Error(`配送区域查询到多个, 配送区域: ${area}, 查询结果: ${JSON.stringify(res_json['data'])}`);
    } else {
        throw new Error(`配送区域查询为空, 配送区域: ${area}, 响应值: ${JSON.stringify(res_json['data'])}`);
    }
}

async function save_data(res) {
    const url = `${host}/tps-local/local/web/trns/trnsRgtDelvRltl/batchSaveTrnsDelvRltl`;
    const response = await fetchPost(url, [res], headers);
    return response;
}

async function submit(drugDelvRltlId) {
    const url = `${host}/tps-local/local/web/trns/trnsRgtDelvRltl/batchSubmitByIds`;
    let postData = {"drugDelvRltlIds": [String(drugDelvRltlId)]};
    const response = await fetchPut(url, postData, headers);
    if (!response.data || response.code !== 0) {
        throw new Error(`提交失败，响应值：${JSON.stringify(response)}`);
    }
}

async function startTask112(dataList, header) {
  let total_num = 0;
  let success_num = 0;
  let has_send = 0;
  headers = convertHeadersArrayToObject(header);
  headers['content-type'] = 'application/json';
  try {
    for (let j = 0; j < dataList.length; j++) {
      let i = 0;
      const data = dataList[j];
      for (i; i < data.length; i++) {
        if (data[i][0] === '点配国码' && data[i][1] === '配送商' && data[i][2] === '点配市县') break;
      }
      i += 1;
      for (i; i < data.length; i++) {
        if (!data[i][1]) continue;
        total_num += 1;
        let ms_code = data[i][0].trim();
        let company = data[i][1].trim();
        let area = data[i][2].trim();
        if (ms_code && company && area) {
          try {
            let res = {'delventpName': company,'admdvsName': area};
            res = await queryCode(ms_code, res);
            res = await query_company(company, res);
            res = await query_area(area, res);
            let save_res = await save_data(res);
            let save_flag = false;
            if (save_res.code !== 0 || !save_res.type === 'error') {
                if (save_res.message.indexOf('已过滤') > 0) {
                  save_flag = true;
                } else {
                  throw new Error(`保存失败，响应值：${JSON.stringify(save_res)}`);
                }
            }
            let drugDelvRltlId = await querySendRelation(ms_code, res, save_flag);
            if (drugDelvRltlId === '-11') {
                has_send += 1;
                exportText(`已经配送过了，试剂统一编码: ${ms_code}，配送企业: ${res['delventpName']}，配送地区: ${res['admdvsName']}`);
                continue;
            }
            await submit(drugDelvRltlId);
            success_num += 1;
            exportText(`配送成功，试剂统一编码: ${ms_code}，配送企业: ${res['delventpName']}，配送地区: ${res['admdvsName']}`);
          } catch (err) {
            exportText(`配送失败，试剂统一编码: ${ms_code}，配送企业: ${company}，配送地区: ${area}。${err.stack}`);
          }
        }
      }
    }
    exportText(`总数：${total_num}，配送成功：${success_num}，已经配送过：${has_send}，配送失败：${total_num - has_send - success_num}`);
  } catch (err) {
    exportText(`失败，请重试: ${err.stack}`);
  }
  exportText("已结束，请刷新页面后继续操作 (^_^)");
  downloadData(textContainer.textContent);
}

window.myExtensionFuncs = {
  startTask112: (data, headers) => startTask112(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask112"] }, 
  "*"
);

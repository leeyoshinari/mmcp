/// 海南撤废
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};

async function query_area(area) {
    const url = `${host}/tps-local/local/web/bdc/admdvsInfo/list?prntAdmdvs=460000`;
    const res_json = await fetchGet(url, headers);
    if (res_json['code'] === 0 && res_json['data']) {
        for (const rr of res_json['data']) {
            const new_area_name = rr['admdvsName'].trim();
            if (new_area_name === area) {
                return rr['admdvs'];
            }
        }
        throw new Error(`配送区域查询到多个, 配送区域: ${area}, 查询结果: ${JSON.stringify(res_json['data'])}`);
    } else {
        throw new Error(`配送区域查询为空, 配送区域: ${area}, 响应值: ${JSON.stringify(res_json['data'])}`);
    }
}

async function querySendRelation(msCode, company, area, admdvs) {
    const url = `${host}/tps-local/local/web/trns/trnsRgtDelvRltl/getTrnsDelvRltlList?current=1&size=10&prodCode=${msCode}&delventpName=${encodeURIComponent(company)}&efftStas=1&admdvs=${admdvs}`;
    const response = await fetchGet(url, headers);
    if (response.code === 0 && response.data && response.data.records.length === 1) {
        return {'drugDelvRltlId': response.data.records[0].drugDelvRltlId, 'delventpCode': response.data.records[0].delventpCode}
    } else {
        throw new Error(`配送关系列表查询结果为空或有多条数据，试剂统一编码: ${msCode}，配送企业: ${company}，配送地区: ${area}，查询结果：${JSON.stringify(response.data)}`);
    }
}

async function submit(res, reason) {
    const url = `${host}/tps-local/local/web/trns/trnsRgtDelvRltl/updateEntityByAppyRevoke`;
    if (reason && reason !== null && reason !== undefined && reason.trim()) {
        res['appyRevokeRea'] = reason;
    } else {
        res['appyRevokeRea'] = '无配送合作/更改配送商，请配合撤废，谢谢';
    }
    const response = await fetchPut(url, res, headers);
    if (!response.data || response.code !== 0) {
        throw new Error(`申请撤废失败，响应值：${JSON.stringify(response)}`);
    }
}

async function startTask115(dataList, header) {
  let total_num = 0;
  let success_num = 0;
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
        let reason = data[i][3];
        if (ms_code && company && area) {
          try {
            let admdvs = await query_area(area);
            let res = await querySendRelation(ms_code, company, area, admdvs);
            await submit(res, reason);
            success_num += 1;
            exportText(`申请撤废成功，试剂统一编码: ${ms_code}，配送企业: ${company}，配送地区: ${area}`);
          } catch (err) {
            exportText(`申请撤废失败，试剂统一编码: ${ms_code}，配送企业: ${company}，配送地区: ${area}。${err.stack}`);
          }
        }
      }
    }
    exportText(`总数：${total_num}，成功：${success_num}，失败：${total_num - success_num}`);
  } catch (err) {
    exportText(`失败，请重试: ${err.stack}`);
  }
  exportText("已结束，请刷新页面后继续操作 (^_^)");
  downloadData(textContainer.textContent);
}

window.myExtensionFuncs = {
  startTask115: (data, headers) => startTask115(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask115"] }, 
  "*"
);

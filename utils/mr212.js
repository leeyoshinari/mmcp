// 甘肃省平台议价
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];

function dealExcel(dataList) {
    const yijia = [];
    for (let j=0; j < dataList.length; j++) {
        let i = 0;
        const data = dataList[j];
        for (i; i < data.length; i++) {
        if (String(data[i][0]).trim() === 'CODE编码' && String(data[i][1]).trim() === '医疗机构') break;
        }
        i += 1;
        for (i; i < data.length; i++) {
            if (!data[i][0]) continue;
            const org_name = String(data[i][1] || '').trim();
            const zu_code = String(data[i][0] || '').trim();
            const price = parseFloat(String(data[i][2] || '').trim());
            if (isNaN(price)) {
                throw new Error(`Excel表格中的医院当前报价不正确, CODE编码: ${zu_code}，医疗机构：${org_name}，当前报价：${data[i][2]}`);
            }
            yijia.push([zu_code, org_name, price]);
        }
    }
  return yijia;
}

// 查询医院
async function queryHistory(orgName, res) {
  const url =`${host}/tps-local/web/trans/basesys/queryord`;
  const data = {
    orgTypeCode: "2",
    orgName: orgName,
    tenditmType: "2"
  };

  const result = await fetchPost(url, data, headers);
  const orgs = result.data;
  const orgNames = orgs.map(hos => hos.orgName);
  if (orgNames.includes(orgName)) {
    res.medinsCode = orgs[orgNames.indexOf(orgName)].entpCode;
    res.orgName = orgName;
    return res;
  } else {
    throw new Error(`未找到医疗机构 ${orgName}，查询结果：${orgs}`);
  }
}


// 查询议价
async function queryCodeList(sn, origin_price, res) {
  sta = ['', '', '待医疗机构确认', '双方达成一致', '作废', '待配送企业确认', '待生产企业确认'];
  const url =`${host}/tps-local/web/trans/nego_prc/mcs/delv/query`;
  const data = {
    negoPricStas: "",
    prodName: "",
    regno: "",
    regcert: "",
    dosform: "",
    prodSpec: "",
    prodentpCode: "",
    dclaEntpCode: "",
    itemname: "",
    current: 1,
    size: 10,
    tenditmType: "2",
    sn: sn,
    ...res
  };

  const result = await fetchPost(url, data, headers);
  const records = result.data.records;
  if (records.length !== 1) {
    throw new Error(`议价管理列表结果为空或有多条数据, CODE编码: ${sn}，医疗机构：${res['orgName']}，数据条数：${len(records)}`);
  }

  const item = records[0];
  if (item.negoPricStas !== '6') {
    throw new Error(`当前议价状态是 ${sta[parseInt(records[0]['negoPricStas'])]}, CODE编码: ${sn}，医疗机构：${res['orgName']}`);
  }

  const online_price = parseFloat(item.hospNegoPric);
  if (online_price !== origin_price) {
    throw new Error(`医院当前报价不相等, CODE编码: ${sn}，医疗机构: ${res['orgName']}, Excel中的报价: ${origin_price}, 页面上的报价: ${online_price}`);
  }

  res.negoPricId = item.negoPricId;
  res.sn = item.sn;
  res.medinsName = item.medinsName;
  return res;
}


// 同意议价
async function accept(res) {
  const url =`${host}/tps-local/web/trans/nego_prc/delv/accept`;
  const data = {
    negoPricId: res.negoPricId,
    tenditmType: "2"
  };

  const result = await fetchPost(url, data, headers);
  if (result.success) {
    exportText(`同意议价成功: CODE编码: ${res['sn']}, 医疗机构: ${res['orgName']}`);
  } else {
    exportText(`同意议价失败: CODE编码: ${res['sn']}, 医疗机构: ${res['orgName']}, 响应值：${result}`);
  }
}


async function startTask212(dataList, header) {
  let total_num = 0;
  let success = 0;
  headers = convertHeadersArrayToObject(header);
  headers['content-type'] = 'application/json;charset=UTF-8';

  try {
    const yijia = dealExcel(dataList);
    total_num = yijia.length;
    for (const cc of yijia) {
      try {
        let res = {};
        res = await queryHistory(cc[1], res);
        res = await queryCodeList(cc[0], cc[2], res);
        await accept(res);
        success += 1;
        exportText(`议价成功, CODE: ${cc[0]}, 医疗机构: ${cc[1]}`);
      } catch (e) {
        exportText(`议价失败, CODE=${cc[0]}, 医疗机构: ${cc[1]}, ${e.stack}`);
      }
      await timer(1000);
    }
    exportText(`总数 ${total_num} 个, 成功 ${success} 个, 失败 ${total_num - success} 个`);
  } catch (error) {
    exportText(`失败, 请重试: ${error.stack}`);
  }
  exportText("已结束，请刷新页面后继续操作 (^_^)");
  downloadData(textContainer.textContent);
}

window.myExtensionFuncs = {
  startTask212: (data, headers) => startTask212(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask212"] }, 
  "*"
);

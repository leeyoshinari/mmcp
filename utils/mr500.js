// 内蒙古点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};
const myFileClient = new FileTransferClient("ws://127.0.0.1:8989");
let total_num = 0;
let success = 0;
let has_send = 0;


async function init_ws() {
  await myFileClient.connect().catch((err) => {throw err;});
}


async function query_company(res) {
  try {
    const url = `${host}/tps-local-bd/web/std/bidprcuOrgInfo/getMcsOrgInfoPage?current=1&size=10&searchCount=true&orgName=${encodeURIComponent(res['delventpName'])}&queryArea=${res['admdvs']}&tenditmId=${res['tenditmId']}`;
    const response = await fetchGet(url, headers);
    if (response.code === 0 && response.data) {
      if (response.data.total > 0) {
        for (const c of response.data.records) {
          if (res['delventpName'] === c['orgName'] && 'uscc' in c) {
            res['delventpCode'] = c['entpCode'];
            return res;
          }
        }
        throw new Error(`配送企业查询结果不正确，配送企业：${res['delventpName']}，响应值：${JSON.stringify(response)}`);
      } else {
        throw new Error(`配送企业查询结果为空，配送企业：${res['delventpName']}，响应值：${JSON.stringify(response)}`);
      }
    } else {
      throw new Error(`配送企业查询失败，配送企业：${res['delventpName']}，响应码：${response.code}`);
    }
  } catch (error) {
    throw error;
  }
}


async function query_company_dai(res) {
  try {
    const url = `${host}/tps-local-bd/web/std/bidprcuOrgInfo/getMcsAmountOrgInfoPage?current=1&size=10&searchCount=true&orgName=${encodeURIComponent(res['delventpName'])}&tenditmId=${res['tenditmId']}`;
    const response = await fetchGet(url, headers);
    if (response.code === 0 && response.data) {
      if (response.data.total > 0) {
        for (const c of response.data.records) {
          if (res['delventpName'] === c['orgName'] && 'uscc' in c) {
            res['delventpCode'] = c['entpCode'];
            return res;
          }
        }
        throw new Error(`配送企业查询结果不正确，配送企业：${res['delventpName']}，响应值：${JSON.stringify(response)}`);
      } else {
        throw new Error(`配送企业查询结果为空，配送企业：${res['delventpName']}，响应值：${JSON.stringify(response)}`);
      }
    } else {
      throw new Error(`配送企业查询失败，配送企业：${res['delventpName']}，响应码：${response.code}`);
    }
  } catch (error) {
    throw error;
  }
}


async function query_code(res) {
  try {
    const url = `${host}/tps-local-bd/web/trns/trnsProdMcs/getTrnsProdDrugByDelvRltlSetPage?current=1&size=10&searchCount=true&purcProdType=${res['purcProdType']}&mcsRegno=${encodeURIComponent(res['mcsRegno'])}`;
    const response = await fetchGet(url, headers);
    if (response.code === 0 && response.data) {
      if (response.data.total >= 1) {
        for (const r of response.data.records) {
          if (r['mcsRegno'] === res['mcsRegno']) {
            res['tenditmId'] = r['tenditmId'];
            res['mcsRegcertName'] = r['mcsRegcertName'];
            res['tenditmName'] = r['tenditmName'];
            res['prodentpName'] = r['prodentpName'];
            if ('regcertExpy' in r) {
              res['regcertExpy'] = r['regcertExpy'];
            }
            return res;
          }
        }
        throw new Error(`注册证号查询结果不正确，注册证号：${res['mcsRegno']}，响应值：${JSON.stringify(response)}`);
      } else {
        throw new Error(`注册证号查询结果为空，注册证号：${res['mcsRegno']}，响应值：${JSON.stringify(response)}`);
      }
    } else {
      throw new Error(`注册证号查询失败，注册证号：${res['mcsRegno']}，响应码：${response.code}`);
    }
  } catch (error) {
    throw error;
  }
}

async function query_areas_once() {
  try {
    const url = `${host}/tps-local-bd/web/std/admdvsInfo/list?prntAdmdvs=150000`;
    const response = await fetchGet(url, headers);
    if (response.code === 0 && response.data) {
      return response.data
    } else {
      throw new Error(`查询配送地区失败，响应码：${response.code}`);
    }
  } catch (error) {
    throw error;
  }
}


async function query_areas(all_data, res) {
  try {
    for (const a of all_data) {
      if (a['admdvsName'].startsWith(res['admdvsName'])) {
        res['admdvs'] = a['admdvs'];
        res['queryArea'] = [a['admdvs']];
        res['admdvsName'] = a['admdvsName'];
        return res;
      }
    }
    throw new Error(`未找到配送地区，配送地区：${res['admdvsName']}，所有地区：${JSON.stringify(all_data)}`);
  } catch (error) {
    throw error;
  }
}


async function submit_c(res) {
  try {
    const url = `${host}/tps-local-bd/web/trns/trnsMcsDelvRltl/batchSaveTrnsDelvRltl`;
    const data = [res];
    const response = await fetchPost(url, data, headers);
    return response;
  } catch (error) {
    throw error;
  }
}


async function batchSubmitByIds(res) {
  try {
    const url = `${host}/tps-local-bd/web/trns/trnsMcsDelvRltl/batchSubmitByIds`;
    const response = await fetchPut(url, res, headers);
    if (response.code === 0) {
      return response;
    } else {
      throw new Error(`配送失败，配送参数：${JSON.stringify(res)}，响应码：${response.code}`);
    }
  } catch (error) {
    throw error;
  }
}


async function upload_file(fileName) {
  try {
    const deepHeader = JSON.parse(JSON.stringify(headers));
    delete deepHeader['content-type'];
    const file = await myFileClient.receiveFile(fileName, requestType = 'requestFile').catch((err) => {throw err;});
    const url = `${host}/tps-local/web/comp/file/upload`;
    const formData = new FormData();
    const fileBlob = file instanceof Blob ? file : new Blob([file], {type: 'application/octet-stream'})
    formData.append('file', fileBlob, fileName);
    const response = await fetch(url, {
      method: 'POST',
      headers: deepHeader,
      body: formData,
    });
    
    if (!response.ok) throw new Error('Request Error:' + response.status);
    const res_json = await response.json();
    if (res_json.code === 0) {
      return res_json.data.fileId;
    } else {
      throw new Error(`文件上传失败，响应码：${res_json.code}，文件名：${fileName}`);
    }
  } catch (error) {
    throw error;
  }
}

async function startTask500(dataList, header) {
    headers = convertHeadersArrayToObject(header);
    headers['content-type'] = 'application/json;charset=UTF-8';
    try {
      await init_ws();
      const all_area = await query_areas_once();
      for (let j = 0; j < dataList.length; j++) {
        let i = 0;
        const data = dataList[j];
        for (i; i < data.length; i++) {
          if (String(data[i][3]).trim() === '注册证号') break;
        }
        i += 1;
        for (i; i < data.length; i++) {
          if (!data[i][3]) continue;
          total_num += 1;
          let mcs_code = String(data[i][3]).trim();
          let org_name = String(data[i][5]).trim();
          let area = String(data[i][6]).trim();
          let pdf_file = String(data[i][7]).trim();
          let excel_file = String(data[i][8]).trim();
          let log_str = '';
          if (mcs_code && org_name && area) {
            try {
              let res = {mcsRegno: mcs_code, delventpName: org_name, admdvsName: area, purcProdType: '0', delvRltlStas: '1'};
              if (pdf_file && excel_file) {
                res['purcProdType'] = '1';
                res['delvRltlStas'] = '0';
                log_str = `, PDF文件: ${pdf_file}, Excel文件: ${excel_file}`;
              }
              res = await query_code(res);
              res = await query_areas(all_area, res);
              if (res['purcProdType'] === '1' && res['delvRltlStas'] === '0') {
                res = await query_company_dai(res);
                res['queryArea'] = [res['admdvs']];
              } else {
                res = await query_company(res);
              }
              const res_dict = await submit_c(res);
              if (res_dict.code === 0 && res_dict.data && res_dict.data.idList && res_dict.data.idList.length === 1) {
                if (res['purcProdType'] === '1' && res['delvRltlStas'] === '0') {
                  const submit_data = { drugDelvRltlIds: res_dict.data.idList };
                  const pdfFileId = await upload_file(pdf_file + ".pdf");
                  const excelFileId = await upload_file(excel_file + ".xlsx");
                    
                  submit_data.pdfFileId = pdfFileId;
                  submit_data.excelFileId = excelFileId;
                  const final_res = await batchSubmitByIds(submit_data);
                  if (final_res.code !== 0) {
                    exportText(`配送失败：配送企业：${org_name}，配送地区：${area}，注册证号：${mcs_code}${log_str}，响应值：${JSON.stringify(final_res)}`);
                    continue;
                  }
                }
                success++;
                exportText(`配送成功：配送企业：${org_name}，配送地区：${area}，注册证号：${mcs_code}${log_str}`);
              } else if (res_dict.code === 160003) {
                has_send++;
                exportText(`已经配送过了，配送企业：${org_name}，配送地区：${area}，注册证号：${mcs_code}${log_str}，message: ${res_dict.message}`);
                continue;
              } else {
                exportText(`配送失败：配送企业：${org_name}，配送地区：${area}，注册证号：${mcs_code}${log_str}，响应值：${JSON.stringify(res_dict)}`);
                continue;
              }
            } catch (error) {
              exportText(`配送失败：配送企业：${org_name}，配送地区：${area}，注册证号：${mcs_code}${log_str}`);
              exportText(error.stack || error.toString());
            }
          } else {
            exportText(`Excel 数据不完整：配送企业：${org_name}，配送地区：${area}，注册证号：${mcs_code}${log_str}`);
          }
        }
      }
      exportText(`总数：${total_num}，配送成功：${success}，配送失败：${total_num - success - has_send}，已经配送：${has_send}`);
    } catch (error) {
      exportText(`失败，请重试: ${error.stack}`);
    }
    downloadData(textContainer.textContent);
    exportText("已结束，请刷新页面后继续操作 (^_^)");
}

window.myExtensionFuncs = {
  startTask500: (data, headers) => startTask500(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask500"] }, 
  "*"
);

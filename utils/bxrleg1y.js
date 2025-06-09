// 广东省新平台签章
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];

async function fetchPost(url, data, headers) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Request Error:' + response.status);
  return await response.json();
}

async function fetchGet(url, headers) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...headers,
    },
  });
  if (!response.ok) throw new Error('Request Error:' + response.status);
  return await response.json();
}

function timer(millisecond) {
  let startTime = (new Date()).getTime();
  while ((new Date()).getTime() - startTime < millisecond) {
    continue;
  }
}

function exportText(text) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  text = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} - ${text}`;
  textContainer.textContent += text + '\n';
  textContainer.scrollTop = textContainer.scrollHeight;
  console.log(text);
}

const socket_port = 10443;
const request_origin = "45B45638-A006-4cf1-A298-816B376D867E";
let request_id = 1;
let certCode = '';
let sealImageBase64 = '';
const pos_data = {
    "yp_point": {
        "1": {"xPos": -180, "yPos": 550},
        "2": {"xPos": 200, "yPos": 550},
        "4": {"xPos": -50, "yPos": 550},
        "7": {"xPos": 500, "yPos": 600},
        "pageNum": 8
    },
    "hc_point": {
        "1": {"xPos": 240, "yPos": 470},
        "2": {"xPos": 500, "yPos": 470},
        "4": {"xPos": 240, "yPos": 585},
        "7": {"xPos": 500, "yPos": 470},
        "pageNum": 6
    },
    "ht_point": {
        "1": {"xPos": 130, "yPos": 550},
        "2": {"xPos": 350, "yPos": 550},
        "4": {"xPos": 240, "yPos": 550},
        "pageNum": 3
    },
    "hcht_point": {
        "1": {"xPos": 130, "yPos": 720},
        "2": {"xPos": 350, "yPos": 720},
        "4": {"xPos": 240, "yPos": 720},
        "pageNum": 4
    }
};


try {
    const ws = new WebSocket(`wss://127.0.0.1:${socket_port}`, ['crypto-jsonrpc-protocol']);
    ws.onopen = async () => {
        const request_data = JSON.stringify({
            "requestVersion": 1,
            "requestOrigin": request_origin,
            "requestId": request_id,
            "requestQuery": {
                "function": "GetCertStringAttribute",
                "param": {
                    "cert": {
                        "encode": null,
                        "type": "{\"UIFlag\":\"default\", \"InValidity\":true,\"Type\":\"signature\", \"Method\":\"device\",\"Value\":\"any\"}",
                        "condition": "IssuerCN~'NETCA' && InValidity='True' && CertType='Signature'"
                    },
                    "id": -1
                }
            }
        });
        ws.send(request_data);
        const response = await new Promise((resolve) => {
            ws.onmessage = (event) => resolve(event.data);
        });
        request_id += 1;
        const res_json = JSON.parse(response);
        certCode = res_json.responseEntity.certCode;
        
        const request_data2 = JSON.stringify({
            "requestVersion": 1,
            "requestOrigin": request_origin,
            "requestId": request_id,
            "requestQuery": {
                "function": "GetNetcaSealImage",
                "param": {
                    "cert": {
                        "encode": certCode
                    }
                }
            }
        });
        ws.send(request_data2);
        const response2 = await new Promise((resolve) => {
            ws.onmessage = (event) => resolve(event.data);
        });
        request_id += 1;
        const res_json2 = JSON.parse(response2);
        sealImageBase64 = res_json2.responseEntity.sealImageBase64;
        
        const request_data3 = JSON.stringify({
            "requestVersion": 1,
            "requestOrigin": request_origin,
            "requestId": request_id,
            "requestQuery": {
                "function": "ClearPwdCache",
                "param": {}
            }
        });
        ws.send(request_data3);
        const response3 = await new Promise((resolve) => {
            ws.onmessage = (event) => resolve(event.data);
        });
        request_id += 1;
        const res_json3 = JSON.parse(response3);
        if (res_json3.responseResult.msg !== "成功") {
            exportText(`清除密码缓存失败, ClearPwdCache, ${res_json3.responseResult.msg}`);
        }
    };
    
    ws.onerror = (error) => {
        exportText(`WebSocket错误: ${error.stack}`);
        alert('无法连接 CA, 请正确插入CA证书');
    };
} catch (error) {
    exportText(`CA连接失败: ${error.stack}`);
    alert('无法连接 CA, 请正确插入CA证书');
}

async function query_protocol_list(ms_code, res) {
    try {
        const url = `${host}/tps_local_bd/web/mcstrans/ttpCntrSummary/prodentp/query_page`;
        const data = {
            "cntrStas": "",
            "current": 1,
            "medinsCode": "",
            "itemName": "",
            "prodName": "",
            "prodCode": "",
            "prodType": "2",
            "size": 10,
            "tenditmType": "1",
            "ttpCntrCode": ms_code,
            "isComb": "0"
        };
        const response = await fetchPost(url, data, headers);
        if (response.code === 0 && response.data && response.data.records.length === 1) {
            res.fileId = response.data.records[0].fileId;
            res.cntrId = response.data.records[0].cntrId;
            return res;
        } else if (response.code === 0 && response.data.total > 1) {
            throw new Error(`交易协议列表查询到多个, 查询结果: ${JSON.stringify(response.data.records)}`);
        } else {
            throw new Error(`交易协议列表查询为空, 响应值: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        exportText(`交易协议列表查询失败, 协议编号: ${ms_code}, 错误: ${error.stack}`);
        throw error;
    }
}

async function download_file(file_id) {
    try {
        const url = `${host}/tps_local_bd/web/mcstrade/comp/file/downBase64?fileId=${file_id}`;
        const response = await fetchGet(url, headers);
        if (response.code === 0 && response.data) {
            return response.data;
        } else {
            throw new Error(`PDF文件下载失败, 查询结果: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        exportText(`PDF文件下载失败, 文件Id: ${file_id}, 错误: ${error.stack}`);
        throw error;
    }
}

async function sign_name(pdf_base64) {
    try {
        const request_data = JSON.stringify({
            "requestVersion": 1,
            "requestOrigin": request_origin,
            "requestId": request_id,
            "requestQuery": {
                "appName": "SignatureCreator",
                "function": "SignatureCreatorSignSealEx",
                "param": {
                    "srcFile": "",
                    "srcBytes": pdf_base64,
                    "destFile": "",
                    "certEncode": certCode,
                    "selMode": 1,
                    "signFieldText": "",
                    "sealImageEncode": sealImageBase64,
                    "revInfoIncludeFlag": false,
                    "SealKeyWord": {
                        "keyWord": "配送企业签章",
                        "startPage": 1,
                        "endPage": -1,
                        "keyWordIndex": 1,
                        "width": 100,
                        "height": 100,
                        "offsetX": 0,
                        "offsetY": 55
                    },
                    "Tsa": {
                        "tsaUrl": "",
                        "tsaUsr": "",
                        "tsaPwd": "",
                        "tsaHashAlgo": ""
                    }
                }
            }
        });
        ws.send(request_data);
        const response = await new Promise((resolve) => {
            ws.onmessage = (event) => resolve(event.data);
        });
        request_id += 1;
        const res_json = JSON.parse(response);
        if (res_json.responseResult.msg !== "成功") {
            throw new Error("CA签章失败");
        }
        const destFileEncode = res_json.responseEntity.destFileEncode;
        return destFileEncode;
    } catch (error) {
        exportText(`CA签章失败, 错误: ${error.stack}`);
        throw error;
    }
}

async function update_sign_status(res, pdfBase64) {
    try {
        const url = `${host}/tps_local_bd/web/mcstrans/ttpCntrSummary/update_sign_status`;
        const data = {
            "fileId": res.fileId,
            "orgType": 4,
            "caType": "1",
            "cntrId": res.cntrId,
            "pdfBase64": encodeURIComponent(pdfBase64)
        };
        const response = await fetchPost(url, data, headers);
        if (response.code !== 0 || !response.success) {
            throw new Error(`签章失败, 响应值: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        exportText(`签章状态更新失败, 错误: ${error.stack}`);
        throw error;
    }
}

async function batch_audit_not_pass(res, reason_text) {
    try {
        const url = `${host}/tps_local_bd/web/mcstrans/ttpCntrSummary/batch_audit_not_pass`;
        const data = {
            "refusedReason": reason_text,
            "cntrId": res.cntrId,
            "orgType": 4
        };
        const response = await fetchPost(url, data, headers);
        if (response.code !== 0 || !response.success) {
            throw new Error(`签章失败, 响应值: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        exportText(`批量审核不通过失败, 错误: ${error.stack}`);
        throw error;
    }
}

async function run_task(ms_code, is_sign) {
    if (ms_code && is_sign) {
        try {
            timer(1000);
            let res = {};
            res = await query_protocol_list(ms_code, res);
            if (is_sign !== '签章') {
                await batch_audit_not_pass(res, is_sign);
                success += 1;
                exportText(`拒绝成功，协议编号：${ms_code}，合同执行：${is_sign}`);
                return;
            }
            const pdf_bs64 = await download_file(res.fileId);
            const fileEncode = await sign_name(pdf_bs64);
            await update_sign_status(res, fileEncode);
            success += 1;
            exportText(`签章成功，协议编号：${ms_code}，合同执行：${is_sign}`);
        } catch (error) {
            exportText(`签章失败，协议编号：${ms_code}，合同执行：${is_sign}，错误：${error.message}`);
        }
    } else {
        exportText(`Excel表格中的数据不全，协议编号：${ms_code}，合同执行：${is_sign}`);
    }
}

async function startTask(data) {
  let total_num = 0;
  let success_num = 0;
  try {
    let i = 0;
    for (i; i < data.length; i++) {
      if (data[i][1] === '议价号') break;
    }
    i += 1;
    for (i; i < data.length; i++) {
      if (!data[i][1]) continue;
      total_num += 1;
      let ms_code = data[i][1];
      let is_agree = data[i][2];
      try {
        ms_code = ms_code.trim();
      } catch (err) {
        ms_code = String(parseInt(ms_code)).trim();
      }
      try {
        is_agree = is_agree.trim();
      } catch (err) {
        is_agree = String(is_agree).trim();
      }
      if (ms_code && is_agree) {
        try {
          timer(1000);
          let res = {};
          if (is_agree === '同意') {
            res = await queryCode(ms_code, res);
            res = {
              ...res,
              bargainStatus: 1,
              companyBargain: 0
            };
          } else {
            try {
              const newPrice = parseFloat(is_agree);
              res = {
                bargainId: String(ms_code),
                bargainStatus: 2,
                companyBargain: parseFloat(is_agree).toString()
              };
            } catch (error) {
              exportText(`该操作暂不支持，议价号：${ms_code}，议价执行：${is_agree}`);
              continue;
            }
          }
          await agreeBargain(res);
          success_num += 1;
          exportText(`议价成功，议价号：${ms_code}，议价执行：${is_agree}`);
        } catch (err) {
          exportText(`议价失败，议价号：${ms_code}，议价执行：${is_agree}。Error: ${err}`);
        }
      }
    }
    exportText(`总数：${total_num}，议价成功：${success_num}，议价失败：${total_num - success_num}`);
  } catch (err) {
    exportText(`失败，请重试: ${err.stack}`);
  }
  exportText("已结束，请刷新页面后继续操作 (^_^)");
}

window.myExtensionFuncs = {
  startTask: (data) => startTask(data)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask"] }, 
  "*"
);

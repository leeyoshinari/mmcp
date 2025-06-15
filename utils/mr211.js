// 深圳市平台点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
const fileClient = new FileTransferClient("ws://127.0.0.1:8989");
const auth_file_url = {};
const company_dict = {};
let request_id = 1;
const request_origin = "45B45638-A006-4cf1-A298-816B376D867E";
let certCode = '';
let headers = [];
let ws;

async function query_company(company, agreement_type, res) {
  try {
    const url = `${host}/hctrade/suppurDistributionRelation/getCompanyTbGoodsList.html`;
    const data = {
      '_search': false, 
      'rows': 10, 
      'page': 1, 
      'sidx': null, 
      'sord': 'asc', 
      'isNeedReAgree': null,
      'companyNameTb': null, 
      'areaId': null, 
      'companyNamePs': company, 
      'confirmStatusSc': null,
      'confirmStatusPs': null, 
      'agreementStatus': null, 
      'agreementType': agreement_type
    };
    
    const response = await fetchPost(url, data, headers);
    if (response.code === 0 && response.rows && response.rows.length > 0) {
      const agreetype = response.rows.map(agre => String(agre.agreementType));
      let agree_index;
      if (agreetype.includes(agreement_type)) {
        agree_index = agreetype.indexOf(agreement_type);
      } else {
        throw new Error(`配送协议类型不正确, 配送企业: ${company}`);
      }
      
      if (response.rows[agree_index].confirmStatusSc === 1 && 
        response.rows[agree_index].confirmStatusPs === 1) {
        res.agreementId = response.rows[agree_index].agreementId;
        company_dict[calc_md5(company + agreement_type)] = response.rows[agree_index].agreementId;
        return res;
      } else {
        const scStatus = ['待签定', '已签定'][response.rows[agree_index].confirmStatusSc];
        const psStatus = ['待签定', '', '已签定', '已拒绝'][response.rows[agree_index].confirmStatusPs];
        throw new Error(`配送协议签定状态不一致, 生产企业签定状态: ${scStatus}, 配送企业签定状态: ${psStatus}, 配送企业: ${company}`);
      }
    } else {
      throw new Error(`配送协议查询为空, 配送企业: ${company}, 响应值: ${JSON.stringify(response)}`);
    }
  } catch (error) {
    exportText(`配送协议查询失败, 企业名称: ${company}, 错误: ${error.stack}`);
    throw error;
  }
}

async function query_hospital(hospital, res) {
  try {
    const url = `${host}/hctrade/suppurDistributionRelation/getStdHospitalData.html?companyIdPs=`;
    const data = {"rows": 1000, "page": 1, "hospitalAddress": null, "hospitalName": hospital};
    const response = await fetchPost(url, data, headers);
    if (response.code === 0 && response.rows && response.rows.length > 0) {
      const hospitals = response.rows.map(hos => hos.hospitalName);
      if (hospitals.includes(hospital)) {
        res.hospitalIds = response.rows[hospitals.indexOf(hospital)].hospitalId;
        return res;
      } else {
        throw new Error(`医疗机构名字不匹配, 医疗机构: ${hospital}, 查询到的医疗机构: ${hospitals.join(',')}`);
      }
    } else {
      throw new Error(`医疗机构查询为空, 医疗机构: ${hospital}, 响应值: ${JSON.stringify(response)}`);
    }
  } catch (error) {
    exportText(`医疗机构查询失败, 企业名称: ${hospital}, 错误: ${error.stack}`);
    throw error;
  }
}

async function query_code(ms_code, agreement_type, agreement_id, res) {
  try {
    const url = `${host}/hctrade/suppurDistributionRelation/getGoodsListData.html`;
    const data = {
      '_search': false, 
      'rows': 20, 
      'page': 1, 
      'sidx': null, 
      'sord': 'asc', 
      'agreementType': agreement_type,
      'procurecatalogId': ms_code, 
      'regCode': null, 
      'goodsName': null, 
      'agreementId': agreement_id
    };
    const response = await fetchPost(url, data, headers);
    if (response.code === 0 && response.rows && response.rows.length === 1) {
      res.procurecatalogIds = response.rows[0].procurecatalogId;
      return res;
    } else {
      if (response.code !== 0) {
          throw new Error(`产品代码查询结果为空, 产品代码: ${ms_code}, 查询结果: ${JSON.stringify(response)}`);
      } else {
          throw new Error(`产品代码查询结果为空或有多个, 产品代码: ${ms_code}, 查询结果: ${JSON.stringify(response.rows)}`);
      }
    }
  } catch (error) {
    exportText(`产品代码查询查询失败, 产品代码: ${ms_code}, 错误: ${error.stack}`);
    throw error;
  }
}

async function upload_file(file_name) {
  const fileName = file_name + '.pdf';    
  try {
    const fileData = await fileClient.receiveFile(fileName).catch((err) => {
      throw err;
    });
    const pdf_base64 = arrayBufferToBase64(fileData);
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
    const request_data1 = JSON.stringify({
      "requestVersion": 1, 
      "requestOrigin": request_origin, 
      "requestId": request_id, 
      "requestQuery": {
        "function": "Custom_PdfSignAndUploadByBytes", 
        "param": {
          "signPdfBytes": pdf_base64, 
          "certEncode": certCode, 
          "pageNum": -1, 
          "x": 150, 
          "y": 150, 
          "uploadPdfUrl": `${host}/hctrade/RecvFile.servlet`
        }
      }
    });
    
    ws.send(request_data1);
    const response1 = await new Promise((resolve) => {
      ws.onmessage = (event) => resolve(event.data);
    });
    request_id += 1;
    const res_json1 = JSON.parse(response1);
    if (res_json1.responseResult.msg !== "成功") {
      throw new Error("CA签章失败");
    }
    const destFileEncode = res_json1.responseEntity.UploadFileRespon;
    auth_file_url[calc_md5(file_name)] = destFileEncode;
    return destFileEncode;
  } catch (error) {
    exportText(`授权文件上传失败, 文件名: ${file_name}, 错误: ${error.stack}`);
    throw error;
  }
}

async function submit_c(res) {
  try {
    const url = `${host}/hctrade/suppurDistributionRelation/addDistributionRelationBid.html`;
    const response = await fetchPost(url, res, headers);
    if (!response.success || response.code !== 0) {
      if (!response.msg.includes('已经存在产品配送关系')) {
        throw new Error(`确定并添加失败, 响应值: ${JSON.stringify(response)}`);
      }
    }
  } catch (error) {
    exportText(`确定并添加失败, 错误: ${error.stack}`);
    throw error;
  }
}

async function submit_finally(rela_id, good_id) {
  try {
    const url = `${host}/hctrade/suppurDistributionRelationBid/updateDistributionRelationBid.html`;
    const rr = {
      'dataList': JSON.stringify([{'id': rela_id, 'procurecatalogId': good_id}]), 
      'confirmStatus': 1
    };
    const response = await fetchPost(url, rr, headers);
    if (!response.success || response.code !== 0) {
      throw new Error(`配送关系提交失败, 响应值: ${JSON.stringify(response)}`);
    }
  } catch (error) {
    exportText(`配送关系提交失败, 错误: ${error.stack}`);
    throw error;
  }
}

async function query_submit_list(goods_id, agreement_id, company, hospital) {
  try {
    const url = `${host}/hctrade/suppurDistributionRelationBid/getDistributionRelationBidData.html?agreementId=${agreement_id}`;
    const data = {
      '_search': false, 
      'rows': 10, 
      'page': 1, 
      'sidx': null, 
      'sord': 'asc',
      'hospitalName': hospital, 
      'procurecatalogId': goods_id, 
      'goodsName': null, 
      'confirmStatus': null,
      'startTime': null, 
      'endTime': null, 
      'regCode': null
    };
    const response = await fetchPost(url, data, headers);
    if (response.code === 0 && response.rows.length === 1) {
      if (response.rows[0].confirmStatus === 0) {
        return response.rows[0].id;
      } else {
        return response.rows[0].confirmStatus;
      }
    } else {
      const all_data = response.rows.filter(d => d.confirmStatus !== 4);
      if (all_data.length === 1) {
        if (all_data[0].confirmStatus === 0) {
          return all_data[0].id;
        } else {
          return all_data[0].confirmStatus;
        }
      } else {
        throw new Error(`配送关系查询结果为空或有多个, 产品代码: ${goods_id}, 配送企业: ${company}, 响应值: ${JSON.stringify(response.rows)}`);
      }
    }
  } catch (error) {
    exportText(`配送关系查询失败, 产品代码: ${goods_id}, 配送企业: ${company}, 错误: ${error.stack}`);
    throw error;
  }
}

function calc_md5(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}

async function startTask(data, header) {
  let total_num = 0;
  let success = 0;
  let has_send = 0;
  headers = convertHeadersArrayToObject(header);
  headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  try {
    try {
      ws = await createWebSocket('wss://127.0.0.1:10443', ['crypto-jsonrpc-protocol']);
    } catch (error) {
      throw new Error('无法连接 CA, 请正确插入CA证书');
    }
    await fileClient.connect().catch((err) => {throw err;});
    let i = 0;
    for (i; i < data.length; i++) {
      if (data[i][7] === '交易产品代码') break;
    }
    i += 1;
    for (i; i < data.length; i++) {
      if (!data[i][7]) continue;
      total_num += 1;
      let ms_code = data[i][7];
      try {
        ms_code = ms_code.trim();
      } catch (err) {
        ms_code = String(parseInt(ms_code)).trim();
      }
      let auth_file = data[i][1].trim();
      let company = data[i][3].trim();
      let hospital = data[i][4].trim();
      let is_jicai = data[i][6].trim();
      if (ms_code && auth_file && company && hospital && is_jicai) {
        try {
          let agreementType;
          switch (is_jicai) {
            case '议价采购':
              agreementType = '5';
              break;
            case '备选协议（不再新增产品配送关系）':
              agreementType = '1';
              break;
            case '肝功生化试剂联盟集采':
              agreementType = '23';
              break;
            case '肾功心肌酶检测试剂集采':
              agreementType = '37';
              break;
            default:
              throw new Error('协议类型不正确, 仅支持 议价采购、备选协议（不再新增产品配送关系）、肝功生化试剂联盟集采 和 肾功心肌酶检测试剂集采');
          }
            
          let res = {};
          company = company.replace(' ', '');
          const company_md5 = calc_md5(company + agreementType);
          if (company_dict[company_md5]) {
            res.agreementId = company_dict[company_md5];
          } else {
            res = await query_company(company, agreementType, res);
          }
          res = await query_hospital(hospital, res);
          res = await query_code(ms_code, agreementType, res.agreementId, res);
          if (['23', '37'].includes(agreementType)) {
            const auth_md5 = calc_md5(auth_file);
            if (auth_file_url[auth_md5]) {
              res.authorUrl = auth_file_url[auth_md5];
            } else {
              res.authorUrl = await upload_file(auth_file);
            }
          } 
          await submit_c(res);
          timer(2000);
            
          const relation_id = await query_submit_list(ms_code, res.agreementId, company, hospital);
          if (relation_id) {
            if ([1, 2, 3, 4, 5, 6].includes(relation_id)) {
              has_send += 1;
              if ([1, 2].includes(relation_id)) {
                exportText(`已经配送过了, 配送关系的状态为: ${['', '已提交待配送方确认', '双方同意'][relation_id]}, 产品代码: ${ms_code}, 配送企业: ${company}, 配送医院: ${hospital}, 协议类型: ${is_jicai}, 授权文件名: ${auth_file}`);
              } else {
                exportText(`配送关系的状态为: ${['待提交', '已提交待配送方确认', '双方同意', '配送方拒绝', '已撤废', '启用待确定', '撤废待确定'][relation_id]}, 产品代码: ${ms_code}, 配送企业: ${company}, 配送医院: ${hospital}, 协议类型: ${is_jicai}, 授权文件名: ${auth_file}`);
              }
              continue;
            }
            await submit_finally(relation_id, ms_code);
            success += 1;
            exportText(`配送成功, 产品代码: ${ms_code}, 配送企业: ${company}, 配送医院: ${hospital}, 协议类型: ${is_jicai}, 授权文件名: ${auth_file}`);
          } else {
            exportText(`配送关系状态不正确, 产品代码: ${ms_code}, 配送企业: ${company}, 配送医院: ${hospital}, 协议类型: ${is_jicai}, 授权文件名: ${auth_file}`);
          }
        } catch (error) {
          exportText(`配送失败, 产品代码: ${ms_code}, 配送企业: ${company}, 配送医院: ${hospital}, 协议类型: ${is_jicai}, 授权文件名: ${auth_file}`);
          exportText(error.stack);
        }
      } else {
        exportText(`Excel表格中的数据不全, 产品代码: ${ms_code}, 配送企业: ${company}, 配送医院: ${hospital}, 协议类型: ${is_jicai}, 授权文件名: ${auth_file}`);
      }
    }
    exportText(`总数: ${total_num}, 配送成功: ${success}, 配送失败: ${total_num - success - has_send}, 已经配送: ${has_send}`);
  } catch (error) {
    exportText(`失败, 请重试: ${error.stack}`);
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

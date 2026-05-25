// 甘肃兰州点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
const fileClient = new FileTransferClient("ws://127.0.0.1:8989");


function dealExcel(dataList) {
  const datas = {};

  for (let j=0; j < dataList.length; j++) {
    let i = 0;
    const data = dataList[j];
    for (i; i < data.length; i++) {
      if (String(data[i][2]).trim() === '授权区县' && String(data[i][10]).trim() === '产品编码') break;
    }
    i += 1;
    for (i; i < data.length; i++) {
        const shi = String(data[i][1] || '').trim();
        let xian = String(data[i][2] || '').trim();
        xian = xian || null;

        const org_name = String(data[i][9] || '').trim();
        const auth_time = String(data[i][3] || '').trim();
        const auth_file = String(data[i][4] || '').trim();
        const zu_code = String(data[i][10] || '').trim();
        const project_name = String(data[i][12] || '').trim();

        if (shi && org_name && auth_time && auth_file && zu_code && project_name) {
            if (datas[org_name]) {
                if (datas[org_name].area[shi] && !datas[org_name].area[shi].includes(xian)) {
                    datas[org_name].area[shi].push(xian);
                } else {
                    datas[org_name].area[shi] = [xian];
                }

                datas[org_name].auth_time.push(auth_time);
                datas[org_name].auth_file.push(auth_file);
                datas[org_name].code.push(zu_code);
                datas[org_name].project_name.push(project_name);
            } else {
                datas[org_name] = {
                    orgname: org_name,
                    code: [zu_code],
                    area: {
                        [shi]: [xian]
                    },
                    project_name: [project_name],
                    auth_time: [auth_time],
                    auth_file: [auth_file]
                };
            }
        }
    }
  }

  // 去重
  for (const k in datas) {
    const a = [...new Set(datas[k].auth_time)];
    const b = [...new Set(datas[k].auth_file)];
    if (a.length !== 1) {
      exportText(`Excel中授权时间不一致: ${a.join(', ')}`);
      throw new Error('授权时间不一致');
    }
    if (b.length !== 1) {
      exportText(`Excel中授权文件名不一致: ${b.join(', ')}`);
      throw new Error('授权文件不一致');
    }
    datas[k].auth_time = a[0];
    datas[k].auth_file = b[0];
  }

  return datas;
}


// 查询产品
async function queryZu(zu_code, tenditmId) {
  const url = `${host}/tps-local/web/trans/auth/delv/queryProdPage`;
  const data = {
    prodCode: zu_code,
    prodName: "",
    aprvno: "",
    aprvnoName: "",
    current: 1,
    size: 10,
    tenditmType: "2",
    tenditmId: tenditmId
  };
  const res = await fetchPost(url, data, headers);
  if (res.data.total === 1) {
    return res.data.records[0];
  } else {
    throw new Error(`查询产品编号为空或有多个，产品编号：${zu_code}，查询结果：${res}`);
  }
}


// 查询项目名
async function queryProjectName(project_name) {
  const url = `${host}/tps-local/web/trans/item/list_select`;
  const data = {
    itemname: project_name,
    prodType: 2,
    tenditmType: "2"
  };

  const res = await fetchPost(url, data, headers);
  if (res.data.length === 1) {
    return res.data[0].value;
  } else {
    throw new Error(`查询项目名称为空或有多个，项目名称：${project_name}，查询结果：${res}`);
  }
}


// 上传文件
async function uploadFile(fileName) {
  const file_name = fileName + '.pdf';
  const fileData = await fileClient.receiveFile(file_name).catch((err) => {
    throw err;
  });
  const file = new File([fileData], file_name, { type: 'application/octet-stream'});
  const formData = new FormData();
  formData.append('file', file);
  const h = JSON.parse(JSON.stringify(headers));
  console.log(h);
  delete h['content-type'];
  console.log(h);
  const url = `${host}/tps-local/web/trade/comp/file/upload`;
  const response = await fetch(url, {
    method: 'POST',
    headers: h,
    body: formData,
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`授权文件上传失败, 状态: ${response.status}, 文件名: ${file_name}`);
  }

  const res = await response.json();
  return res.data.fileId;
}


// 查询配送企业
async function queryOrg(orgName, res) {
  const url =
    `${host}/tps-local/web/trans/puragreement/query_delv_org` +
    `?entpName=${encodeURIComponent(orgName)}` +
    `&current=1&size=10&tenditmType=2&timestamp=${Date.now()}`;

  const result = await fetchGet(url, headers);
  const orgs = result.data;

  if (!orgs || orgs.length === 0) {
    throw new Error(`未查询到配送企业 ${orgName}`);
  }

  const orgNames = orgs.map(hos => hos.orgName);
  if (orgNames.includes(orgName)) {
    res.delvOrgInfoList = [{
        orgName: orgName,
        orgCode: orgs[orgNames.indexOf(orgName)].entpCode
    }];
    return res;
  } else {
    throw new Error(`未找到配送企业 ${orgName}，查询结果：${orgs}`);
  }
}


// 查询区域
async function queryAreas(area, res) {
  const url =`${host}/tps-local/web/trans/puragreement/query_admdvs`;
  const data = { tenditmType: "2" };
  const result = await fetchPost(url, data, headers);
  const citys = result.data.citys;
  const area_list = [];

  for (const k in area) {
    for (const c of citys) {
      if (k === c.admdvsName) {
        if (c.citys.length === 0) {
          area_list.push(c);
        }
        for (const b of area[k]) {
          for (const d of c.citys) {
            if (d.admdvsName === b) {
              area_list.push(d);
              break;
            }
          }
        }
      }
    }
  }

  res.delvAreaList = area_list;
  return res;
}


// 提交
async function submit(res) {
  const url =`${host}/tps-local/web/trans/auth/delv/submitAgreement`;
  res.tenditmType = '2';
  const result = await fetchPost(url, res, headers);
  if (!result.success) {
    throw new Error(`提交失败, 配送企业：${res['delvOrgInfoList'][0]['orgName']}，响应值：${result}`);
  }
}

async function startTask211(dataList, header) {
  headers = convertHeadersArrayToObject(header);
  headers['content-type'] = 'application/json;charset=UTF-8';

  try {
    await fileClient.connect().catch((err) => {throw err;});
    const datas = dealExcel(dataList);
    for (const k in datas) {
      const v = datas[k];
      try {
        if (v.code.length > 0) {
          let res = {};
          res = await queryOrg(k, res);
          res = await queryAreas(v.area, res);
          res.authFileId = await uploadFile(v.auth_file);
          res.authEndTime = v.auth_time
            .replace('年', '-')
            .replace('月', '-')
            .replace('日', '')
            .replace('号', '') + ' 00:00:00';

          const pubonlnProdList = [];
          for (let i = 0; i < v.code.length; i++) {
            const c = v.code[i];
            const p = v.project_name[i];

            try {
              const project_name_id = await queryProjectName(p);
              const prod = await queryZu(c, project_name_id);
              pubonlnProdList.push(prod);
              exportText(`产品编号添加成功，配送企业：${k}，产品编码：${c}，项目名称：${p}`);
            } catch (e) {
              exportText(`产品编号添加失败，配送企业：${k}，产品编码：${c}，项目名称：${p}, ${e.stack}`);
            }
            await timer(1000);
          }

          res.pubonlnProdList = pubonlnProdList;
          await submit(res);
          exportText(`提交成功，配送企业：${k}，共配送 ${res['delvAreaList'].length} 个地区，共配送成功 ${res['pubonlnProdList'].length} 个产品编号，失败 ${v['code'].length - res['pubonlnProdList'].length} 个产品编号`);
        } else {
          exportText(`${k} 没有配送产品`);
        }
      } catch (e) {
        exportText(`失败：配送企业：${k}，授权期限：${v['auth_time']}，授权文件名：${v['auth_file']}，配送区域：${v['area']}, ${e.stack}`);
      }
    }
  } catch (error) {
    exportText(`失败, 请重试: ${error.stack}`);
  }
  exportText("已结束，请刷新页面后继续操作 (^_^)");
  downloadData(textContainer.textContent);
}

window.myExtensionFuncs = {
  startTask211: (data, headers) => startTask211(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask211"] }, 
  "*"
);

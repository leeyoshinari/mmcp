// 深圳市平台议价
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};

async function query_bargain(ms_code, hospital) {
    try {
        const url = `${host}/hctrade/suppurBargain/getResponeHospProcurecatalogListData.html`;
        const data = {
            '_search': false,
            'rows': 10,
            'page': 1,
            'sidx': null,
            'sord': 'asc',
            'productName': null,
            'brand': null,
            'companyDays': null,
            'regCode': null,
            'goodsName': null,
            'sourceId': null,
            'goodsIds': null,
            'procurecatalogId': ms_code,
            'hospitalName': hospital,
            'bargainID': null,
            'hasPs': null
        };

        const res_json = await fetchPost(url, data, headers);
        if (res_json.code === 0 && res_json.rows && res_json.rows.length === 1) {
            return {
                "bargainId": res_json.rows[0].bargainId,
                "hospitalId": res_json.rows[0].hospitalId,
                "hospitalName": res_json.rows[0].hospitalName
            };
        } else {
            throw new Error(`查询议价列表为空, 响应值: ${JSON.stringify(res_json.rows)}`);
        }
    } catch (error) {
        exportText(`查询议价列表失败, 产品代码: ${ms_code}, 医院名称: ${hospital}, 错误: ${error.message}`);
        throw error;
    }
}

async function agree_bargain(agree_val, agree_price, res, c_bargain, r_bargain) {
    try {
        const url = `${host}/hctrade/suppurBargain/confirmCompanyBargain.html`;
        let data;

        if (agree_val === '同意议价') {
            res.remark = '';
            data = {
                "bargainList": JSON.stringify([res]),
                "bargainStatus": 2
            };
        } else if (agree_val === '拒绝议价') {
            res.remark = r_bargain;
            data = {
                "bargainList": JSON.stringify([res]),
                "bargainStatus": 3
            };
        } else if (agree_val === '继续议价') {
            try {
                const price = parseFloat(agree_price);
                if (isNaN(price)) throw new Error();
            } catch {
                throw new Error(`${agree_val} 填写不正确: 当前值 ${agree_price}`);
            }
            res.remark = c_bargain;
            res.price = agree_price;
            data = {
                "bargainList": JSON.stringify([res]),
                "bargainStatus": 1
            };
        } else {
            throw new Error(`议价判断填写不正确: 当前值 ${agree_val}`);
        }

        const res_json = await fetchPost(url, data, headers);
        if (!res_json.success || res_json.code !== 0) {
            throw new Error(`议价失败, 响应值: ${JSON.stringify(res_json)}`);
        }
    } catch (error) {
        exportText(`议价失败, 议价号: ${res.bargainId}, 错误: ${error.message}`);
        throw error;
    }
}

async function startTask(dataList, header) {
  let total_num = 0;
  let success_num = 0;
  headers = convertHeadersArrayToObject(header);
  try {
    for (let j = 0; j < dataList.length; j++) {
      let i = 0;
      const data = dataList[j];
      for (i; i < data.length; i++) {
        if (data[i][3] === '议价判断') break;
      }
      i += 1;
      for (i; i < data.length; i++) {
        if (!data[i][3]) continue;
        total_num += 1;
        let ms_code = data[i][1];
        let hospital = data[i][2].trim();
        let is_agree = data[i][3].trim();
        let agree_value = data[i][4];
        try {
          ms_code = ms_code.trim();
        } catch (err) {
          ms_code = String(parseInt(ms_code)).trim();
        }
        if (ms_code && hospital && is_agree) {
          try {
            timer(1000);
            const res = await query_bargain(ms_code, hospital);
            await agree_bargain(is_agree, agree_value, res, continue_bargain, reject_bargain);
            success_num += 1;
            exportText(`议价成功, 产品代码: ${ms_code}, 医院名称: ${hospital}, 议价判断: ${is_agree}, 企业建议价格: ${agree_value}`);
          } catch (error) {
              exportText(`议价失败, 产品代码: ${ms_code}, 医院名称: ${hospital}, 议价判断: ${is_agree}, 企业建议价格: ${agree_value}, 错误: ${error.stack}`);
          }
        } else {
          exportText(`Excel表格中的数据不全, 产品代码: ${ms_code}, 医院名称: ${hospital}, 议价判断: ${is_agree}, 企业建议价格: ${agree_value}`);
        }
      }
    }
    exportText(`总数: ${total_num}, 议价成功: ${success_num}, 议价失败: ${total_num - success_num}`);
  } catch (err) {
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

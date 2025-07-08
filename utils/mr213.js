// 广东省平台议价
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};

async function query_code(ms_code, hospital, res) {
    try {
        const url = `${host}/tps_local_bd/web/mcstrans/mcsBargain/getMcsBargainRecordList`;
        const data = {
            "current": 1,
            "size": 10,
            "searchCount": true,
            "searchTime": [],
            "status": "1",
            "pubonlnRsltIdYj": String(ms_code),
            "medinsName": hospital
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.code === 0 && response.data && response.data.records.length === 1) {
            res.amount = response.data.records[0].amount;
            res.bargainDeadline = response.data.records[0].bargainDeadline;
            res.id = response.data.records[0].id;
            res.negotiatingPrice = response.data.records[0].negotiatingPrice;
            res.sellerRepDeadline = response.data.records[0].sellerRepDeadline;
            return res;
        } else {
            throw new Error(`议价列表查询结果为空或有多个, 药交耗材Id: ${ms_code}, 医疗机构: ${hospital}, 查询结果: ${response.data}`);
        }
    } catch (error) {
        throw error;
    }
}

async function agree_bargain(agree_val, res) {
    try {
        const url = `${host}/tps_local_bd/web/mcstrans/mcsBargain/modifyMcsBargainById`;
        
        if (agree_val === '同意') {
            res.operatingContent = '企业同意医院议价申请';
            res.status = 3;
        } else if (agree_val.includes('核实价格')) {
            res.operatingContent = '企业拒绝医院议价申请';
            res.remark = agree_val;
            res.status = 4;
        } else {
            try {
                const price = parseFloat(agree_val);
                if (isNaN(price)) throw new Error();
                res.negotiatingPrice = agree_val;
            } catch {
                throw new Error(`议价执行填写不正确: 当前值 ${agree_val}`);
            }
        }
        
        const response = await fetchPost(url, res, headers);
        if (!response.success || response.code !== 0) {
            throw new Error(`议价失败, 响应值: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function startTask(dataList, header) {
  let total_num = 0;
  let success_num = 0;
  headers = convertHeadersArrayToObject(header);
  headers['content-type'] = 'application/json;charset=UTF-8';
  try {
    for (let j = 0; j < dataList.length; j++) {
      let i = 0;
      const data = dataList[j];
      for (i; i < data.length; i++) {
        if (data[i][2] === '药交ID') break;
      }
      i += 1;
      for (i; i < data.length; i++) {
        if (!data[i][2]) continue;
        total_num += 1;
        let ms_code = data[i][2];
        let hospital = data[i][1].trim()
        let is_agree = data[i][3];
        try {
          ms_code = ms_code.trim();
        } catch (err) {
          ms_code = String(parseInt(ms_code)).trim();
        }
        if (ms_code && hospital && is_agree) {
          try {
            await timer(1000);
            let res = {};
            res = await query_code(ms_code, hospital, res);
            await agree_bargain(is_agree, res);
            success += 1;
            exportText(`议价成功, 药交ID: ${ms_code}, 医疗机构: ${hospital}, 议价执行: ${is_agree}`);
          } catch (err) {
            exportText(`议价失败, 药交ID: ${ms_code}, 医疗机构: ${hospital}, 议价执行: ${is_agree}, 错误: ${err.stack}`);
          }
        } else {
          exportText(`Excel表格中的数据不全, 药交ID: ${ms_code}, 医疗机构: ${hospital}, 议价执行: ${is_agree}`)
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

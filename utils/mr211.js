// 重庆市平台导出订单
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};
const excel_data = [['创建时间', '订单号', '产品编码', '产品名称', '订单状态', '订单数量', '单价', '总价', '价格单位', '产品规格', '产品类别', '买方名称', '配送会员', '代理商']];
const pageSize = 10;

let time_between_ele = null;
try {
    time_between_ele = document.getElementById("highseach").getElementsByClassName("betweenbox")[0];
} catch (error) {
    time_between_ele = document.getElementById("iframe").contentDocument.getElementById("highseach").getElementsByClassName("betweenbox")[0];
}
let values = [];
let listconfigidEle = null;
try {
    listconfigidEle = document.getElementById("iframe").contentDocument.getElementById("replaceParams").getElementsByTagName("li");
} catch (error) {
    listconfigidEle = document.getElementById("replaceParams").getElementsByTagName("li");
}
Array.from(listconfigidEle).forEach(ele => {
    values.push({fieldName: `#{${ele.getAttribute("key")}}`, value1: ele.getAttribute("value1")});
});
const replaceParams = btoa(encodeURIComponent(JSON.stringify(values)));
const listconfigureEle = Array.from(listconfigidEle).find(m => m.getAttribute("key") === "listconfigid");
const schemeIdEle = Array.from(listconfigidEle).find(m => m.getAttribute("key") === "schemeId");
const listconfigidValue = listconfigureEle.getAttribute("value1");
const currSchemeId = schemeIdEle.getAttribute("value1");
const startTime = time_between_ele.getElementsByTagName("input")[0].value;
const endTime = time_between_ele.getElementsByTagName("input")[1].value;

async function query_list(page) {
  try {
    const url = `${host}/tps-local/ucenter/yjs-ecps-start/listOrder/query.htm`;
    let queryParams = "JTVCJTVE";
    if (startTime && endTime) {
      const data = [{"description": "创建时间",
          "fieldName": "CREATED",
          "fieldTypeId": "DATE",
          "sqlSelect": "CREATED",
          "otherSearchField": "", 
          "isAutocomplete": "0", 
          "enumSearchType": "between", 
          "value1": startTime, 
          "value2": endTime
      }];
      queryParams = btoa(encodeURIComponent(JSON.stringify(data)));
    }
    const post_data = {
        pageNum: page,
        pageSize: pageSize,
        listconfigid: listconfigidValue,
        currSchemeId: currSchemeId,
        replaceParams: replaceParams,
        queryParams: queryParams,
        listSchemeField: "JTVCJTVE",
        setList: null
    }
    
    const response = await fetchPost(url, post_data, headers);
    return response;
  } catch (error) {
    exportText(`配送协议查询失败, 企业名称: ${company}, 错误: ${error.stack}`);
    throw error;
  }
}

async function startTask211(dataList, header) {
  headers = convertHeadersArrayToObject(header);
  headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  try {
    let response = await query_list(1);
    const total_num = response.totalCount;
    const total_page = Math.ceil(total_num / pageSize);
    exportText(`总共 ${total_page} 页，共计 ${total_num} 条数据`);
    response.data.forEach(r => {
      let row = [r.CREATEDS, r.ORDER_NO, r.PRODUCT_CODE, r.PRODUCT_NAME, r.ORDER_STATE_NAME, r.ORDER_NUMBER, r.MATCH_PRICE, r.SUM_PRICE, r.PRICE_UNIT, r.SPECIFICATIONS, r.PRODUCT_TYPE_NAME, r.BUYER_NAME, r.DISPATCHER_NAME, r.PRODUCTER];
      excel_data.push(row);
    })
    exportText(`正在导出第 1 页数据`);
    for (let i=2; i<total_page + 1; i++) {
      response = await query_list(i);
      response.data.forEach(r => {
        let row = [r.CREATEDS, r.ORDER_NO, r.PRODUCT_CODE, r.PRODUCT_NAME, r.ORDER_STATE_NAME, r.ORDER_NUMBER, r.MATCH_PRICE, r.SUM_PRICE, r.PRICE_UNIT, r.SPECIFICATIONS, r.PRODUCT_TYPE_NAME, r.BUYER_NAME, r.DISPATCHER_NAME, r.PRODUCTER];
        excel_data.push(row);
      })
      exportText(`正在导出第 ${i} 页数据`);
      await timer(500);
    }
    let csv_data = "";
    excel_data.forEach(function(rowArray) {
      csv_data += rowArray.join(",") + "\r\n";
    });
    let blob = new Blob(["\uFEFF" + csv_data], {type: 'text/csv;charset=utf-8;'});
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = URL.createObjectURL(blob);
    link.download = '订单列表.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    exportText(`失败, 请重试: ${error.stack}`);
  }
  exportText("导出完成，请刷新页面后继续操作 (^_^)");
}

window.myExtensionFuncs = {
  startTask211: (data, headers) => startTask211(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask211"] }, 
  "*"
);

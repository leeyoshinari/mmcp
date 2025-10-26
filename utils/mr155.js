// 重庆市平台计算订单价格
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];

async function startTask155(dataList, header) {
  let total_num = 0;
  let success_num = 0;
  headers = convertHeadersArrayToObject(header);
  try {
    exportText(`总数: ${total_num}, 议价成功: ${success_num}, 议价失败: ${total_num - success_num}`);
  } catch (err) {
    exportText(`失败, 请重试: ${err.stack}`);
  }
  exportText("已结束, 请刷新页面后继续操作 (^_^)");
}

window.myExtensionFuncs = {
  startTask155: (data, headers) => startTask155(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask155"] }, 
  "*"
);

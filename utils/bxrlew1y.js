// 广东省新平台议价
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

async function queryCode(msCode, res) {
    try {
        const url = `${host}/gpo/tps-local-bd/web/mcsTrade/suppurBargain/getQYSuppurBargainData`;
        const data = {"current": 1, "size": 10, "searchCount": true, "searchTime": [], "bargainId": String(msCode)};
        const response = await fetchPost(url, data, headers);
        
        if (response.code === 0 && response.data && response.data.records.length === 1) {
            return {
                ...res,
                bargainId: msCode,
                bargainApply: response.data.records[0].bargainApply
            };
        } else {
            throw new Error(`议价列表查询结果为空或有多个，查询结果：${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        exportText(`议价列表查询失败，议价号：${msCode}，错误：${error.stack}`);
        throw error;
    }
}

async function agreeBargain(res) {
    try {
        const url = `${host}/gpo/tps-local-bd/web/mcsTrade/suppurBargain/compSubSuppurBargain`;
        const response = await fetchPost(url, res, headers);
        
        if (!response.success || response.code !== 0) {
            exportText(`议价失败，响应值：${JSON.stringify(response)}`);
            throw new Error(response.msg);
        }
    } catch (error) {
        exportText(`议价失败，错误：${error.stack}`);
        throw error;
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

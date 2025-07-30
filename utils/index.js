const actionList = [
  {'label': '广东省平台点配送', 'js': '212', 'url': 'igi.hsa.gd.gov.cn/tps_local_bd', 'province': '广东省', 'auth': 'https://igi.hsa.gd.gov.cn/tps_local/web/auth/user/query_user_info'},
  {'label': '广东省平台合同签章', 'js': '111', 'url': 'igi.hsa.gd.gov.cn/tps_local_bd', 'province': '广东省', 'auth': 'https://igi.hsa.gd.gov.cn/tps_local/web/auth/user/query_user_info'},
  {'label': '广东省平台议价', 'js': '213', 'url': 'igi.hsa.gd.gov.cn/tps_local_bd', 'province': '广东省', 'auth': 'https://igi.hsa.gd.gov.cn/tps_local/web/auth/user/query_user_info'},
  {'label': '广州市平台点配送', 'js': '115', 'url': 'igi.hsa.gd.gov.cn/gpo', 'province': '广州市', 'auth': 'https://igi.hsa.gd.gov.cn/tps_local/web/auth/user/query_user_info'},
  {'label': '广州市平台合同签章', 'js': '113', 'url': 'igi.hsa.gd.gov.cn/gpo', 'province': '广州市', 'auth': 'https://igi.hsa.gd.gov.cn/tps_local/web/auth/user/query_user_info'},
  {'label': '广州市平台议价', 'js': '112', 'url': 'igi.hsa.gd.gov.cn/gpo', 'province': '广州市', 'auth': 'https://igi.hsa.gd.gov.cn/tps_local/web/auth/user/query_user_info'},
  {'label': '深圳市平台点配送', 'js': '211', 'url': 'yyhc.szggzy.com:9000', 'province': '深圳市', 'auth': 'https://yyhc.szggzy.com:9000/hctrade/index.html?id=1629'},
  {'label': '深圳市平台议价', 'js': '155', 'url': 'yyhc.szggzy.com:9000', 'province': '深圳市', 'auth': 'https://yyhc.szggzy.com:9000/hctrade/index.html?id=1629'},
  {'label': '点配送', 'js': '300', 'url': '', 'province': '湖南', 'auth': ''},
  {'label': '点配送', 'js': '500', 'url': 'hbyxjzcg.cn:8015', 'province': '湖北', 'auth': ''},
]
const allData = [];
const currentHost = window.location.host;
function clickPage() {
  let options = '';
  actionList.forEach((item) => {if (item.url.indexOf(currentHost) > -1) options += `<option value=${item.js}>${item.label}</option>`;});
  const uploadEle = `<div class="filter"><div style="display: flex;"><label>操作类型:</label><select id="operator-type">${options}</select></div>
  <div><input type="file" id="excelUpload" accept=".xlsx, .xls, .csv" style="display: none;" /><input id="fileName" type="text" disabled placeholder="请先选择Excel文件" /></div>
  <div style="display:flex;justify-content:space-around;"><button id="parseExcel">选择 Excel</button><button id="startTask">开始执行</button></div></div><div class="logs"></div>`;
  const pages = document.createElement("div");
  pages.className = 'float-container';
  pages.style.height = window.innerHeight - 40 + 'px';
  pages.style.width = window.innerWidth / 2 + 'px';
  pages.innerHTML = uploadEle;
  document.body.appendChild(pages);

  const fileInput = document.getElementById('excelUpload');
  document.getElementById('parseExcel').addEventListener('click', () => {
    const singleData = [];
    fileInput.click();
    fileInput.onchange = function (event) {
      const file = event.target.files[0];
      if (!file) {
        alert('请先选择 Excel 文件！');
        return;
      }
      document.getElementById('fileName').value = file.name;
      exportText1(`已选择的文件名为：${file.name}`);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const range = XLSX.utils.decode_range(worksheet['!ref']);
          for (let row = range.s.r; row <= range.e.r; row++) {
            const rowData = [];
            let rowStr = "";
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellData = getCellValue(worksheet, row, col);
              rowData.push(cellData);
              rowStr += cellData;
            }
            if (rowStr.length > 3) {
              singleData.push(rowData);
            }
          }
          allData.push(singleData);
        } catch (error) {
          exportText1(`Excel 解析失败: ${error.stack}`);
          alert('解析失败，请检查文件格式！');
        }
      };
      reader.readAsArrayBuffer(file);
      fileInput.value = '';
    }
  });
}

function getCellValue(worksheet, row, col) {
  const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = worksheet[cellAddress];
  if (worksheet['!merges']) {
    for (const merge of worksheet['!merges']) {
      if (row >= merge.s.r && row <= merge.e.r && 
        col >= merge.s.c && col <= merge.e.c) {
        const mainCellAddress = XLSX.utils.encode_cell(merge.s);
        return worksheet[mainCellAddress]?.v || '';
      }
    }
  }
  return cell?.v || '';
}

async function fetchExcel() {
  try {
    const fileClient = new FileTransferClient1("ws://127.0.0.1:8989");
    await fileClient.connect().catch((err) => {throw err;});
    const excelFileListStr = await fileClient.receiveMsg("", "requestFileList").catch((err) => {throw err;});
    const excelFileList = excelFileListStr.split(',');
    
    for (let nn = 0; nn < excelFileList.length; nn ++) {
      const excelDataList = [];
      const excelData = await fileClient.receiveFile(excelFileList[nn], requestType = 'requestExcel').catch((err) => {throw err;});
      const workbook = XLSX.read(excelData, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let row = range.s.r; row <= range.e.r; row++) {
        const rowData = [];
        let rowStr = "";
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellData = getCellValue(worksheet, row, col);
          rowData.push(cellData);
          rowStr += cellData;
        }
        if (rowStr.length > 3) {
          excelDataList.push(rowData);
        }
      }
      allData.push(excelDataList);
    }
    fileClient.disconnect();
  } catch (error) {
    exportText1(`Excel 解析失败: ${error.stack}`);
    alert('解析失败，请检查文件格式！');
  }
}

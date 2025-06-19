const actionList = [
  {'label': '广东省平台点配送', 'js': '212', 'url': 'igi.hsa.gd.gov.cn/tps_local', 'province': '广东省'},
  {'label': '广东省平台合同签章', 'js': '111', 'url': 'igi.hsa.gd.gov.cn/tps_local', 'province': '广东省'},
  {'label': '广州市平台点配送', 'js': '115', 'url': 'igi.hsa.gd.gov.cn/gpo', 'province': '广州市'},
  {'label': '广州市平台议价', 'js': '112', 'url': 'igi.hsa.gd.gov.cn/gpo', 'province': '广州市'},
  {'label': '深圳市平台点配送', 'js': '211', 'url': '', 'province': '深圳市'},
  {'label': '点配送', 'js': '113', 'url': 'www.baidu.com', 'province': '广东省'},
]
const allData = [];
const currentHost = window.location.host;
function clickPage() {
  let options = '';
  actionList.forEach((item) => {if (item.url.indexOf(currentHost) > -1) options += `<option value=${item.js}>${item.label}</option>`;});
  const uploadEle = `<div class="filter"><div style="display: flex;"><label>操作类型:</label><select id="operator-type">${options}</select></div>
  <div><input type="file" id="excelUpload" accept=".xlsx, .xls, .csv" style="display: none;" /><input id="fileName" type="text" placeholder="请先选择Excel文件" /></div>
  <div style="display:flex;justify-content:space-around;"><button id="parseExcel">选择 Excel</button><button id="startTask">开始执行</button></div></div><div class="logs"></div>`;
  const pages = document.createElement("div");
  pages.className = 'float-container';
  pages.style.height = window.innerHeight - 40 + 'px';
  pages.style.width = window.innerWidth / 2 + 'px';
  pages.innerHTML = uploadEle;
  document.body.appendChild(pages);

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
    const textContainer = document.getElementsByClassName("logs")[0];
    textContainer.textContent += text + '\n';
    textContainer.scrollTop = textContainer.scrollHeight;
    console.log(text);
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

  const fileInput = document.getElementById('excelUpload');
  document.getElementById('parseExcel').addEventListener('click', () => {
    fileInput.click();
    fileInput.onchange = function (event) {
      const file = event.target.files[0];
      if (!file) {
        alert('请先选择 Excel 文件！');
        return;
      }
      document.getElementById('fileName').value = file.name;
      exportText(`已选择的文件名为：${file.name}`);

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
            for (let col = range.s.c; col <= range.e.c; col++) { 
              rowData.push(getCellValue(worksheet, row, col));
            }
            allData.push(rowData);
          }
        } catch (error) {
          exportText(`Excel 解析失败: ${error.stack}`);
          alert('解析失败，请检查文件格式！');
        }
      };
      reader.readAsArrayBuffer(file);
      fileInput.value = '';
    }
  });
}
function clickPage() {
  const actionList = [
      {'label': '点配送', 'js': '123'},
      {'label': '签章', 'js': '124'},
      // {'label': '点配送', 'js': ''},
      {'label': '点配送', 'js': '33'},
  ]
  const allData = [];
  let options = '';
  actionList.forEach((item) => {options += `<option value=${item.js}>${item.label}</option>`;});
  const uploadEle = `<div class="filter"><div style="display: flex;"><label>操作类型:</label><select id="operator-type">${options}</select></div>
  <div><input type="file" id="excelUpload" accept=".xlsx, .xls, .csv" style="display: none;" /><input id="fileName" type="text" disabled placeholder="请选择Excel文件" /></div>
  <div style="display:flex;justify-content:space-around;"><button id="parseExcel">选择 Excel</button><button id="startTask">开始执行</button></div></div><div class="logs"></div>`;
  const pages = document.createElement("div");
  pages.className = 'float-container';
  pages.style.height = window.innerHeight - 40 + 'px';
  pages.style.width = window.innerWidth / 2 + 'px';
  pages.innerHTML = uploadEle;
  document.body.appendChild(pages);

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

  document.getElementById('parseExcel').addEventListener('click', () => {
    const fileInput = document.getElementById('excelUpload');
    fileInput.click();
    fileInput.onchange = function (event) {
      const file = event.target.files[0];
      if (!file) {
        alert('请先选择 Excel 文件！');
        return;
      }

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
          console.log('解析成功:', allData);
        } catch (error) {
          console.log('解析失败:', error);
          alert('解析失败，请检查文件格式！');
        }
      };
      reader.readAsArrayBuffer(file);
      fileInput.value = '';
    }
  });

  window.addEventListener("message", (event) => {
    if (event.data.type === "EXTENSION_READY") {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("utils/caller.js");
      script.dataset.func = "startTask";
      script.dataset.args = JSON.stringify(allData);
      document.body.appendChild(script);
    }
  });
}
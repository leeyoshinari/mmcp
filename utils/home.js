const actionList = [
    {'label': '点配送', 'js': '123'},
    {'label': '签章', 'js': ''},
    // {'label': '点配送', 'js': ''},
    {'label': '点配送', 'js': '33'},
]
let options = '';
actionList.forEach((item) => {options += `<option value=${item.js}>${item.label}</option>`;});
const uploadEle = `<div class="filter"><div style="display: flex;"><label>操作类型：</label><select id="operator-type">${options}</select></div><div><input type="file" id="excelUpload" accept=".xlsx, .xls, .csv" /></div><div>
<button id="parseExcel">选择 Excel</button></div></div><div class="logs"></div>`;
const pages = document.createElement("div");
pages.className = 'float-container';
pages.style.height = window.innerHeight - 40 + 'px';
pages.style.width = window.innerWidth / 2 + 'px';
pages.innerHTML = uploadEle;
document.body.appendChild(pages);

document.getElementById('parseExcel').addEventListener('click', parseExcel);
function parseExcel() {
  const fileInput = document.getElementById('excelUpload');
  const file = fileInput.files[0];
  
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
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      document.getElementById('output').innerHTML = 
        `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`;
      
      console.log('解析成功:', jsonData);
    } catch (error) {
      console.error('解析失败:', error);
      alert('解析失败，请检查文件格式！');
    }
  };
  reader.readAsArrayBuffer(file);
}

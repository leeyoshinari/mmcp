let headers = [];
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "REQUEST_HEADERS") {
    if (message.headers.length > headers.length) {
      headers = message.headers;
    }
  }
});

window.addEventListener('load', () => {
    function loadScript(url, callback) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        document.body.appendChild(script);
    }
    const myDiv = document.createElement("div");
    const tipsImg = document.createElement("img");
    tipsImg.src = chrome.runtime.getURL("images/icon.ico");
    myDiv.className = "float-tips";
    myDiv.style.top = window.innerHeight - 200 + 'px';
    myDiv.addEventListener('click', () => {
        clickPage();
        document.getElementById('startTask').addEventListener('click', () => {
            loadScript(chrome.runtime.getURL('utils/template.js'), async () => {
                if (allData.length < 1) {
                    exportText1("正在获取Excel文件中 ...")
                    await fetchExcel();
                }
                if (allData.length > 0) {
                    let selectVal = document.getElementById("operator-type").value;
                    const hh = document.createElement('script');
                    hh.src = chrome.runtime.getURL(`utils/${'mr' + selectVal}.js`);
                    document.body.appendChild(hh);
                }
                console.log(allData);
                document.getElementById('startTask').disabled = true;
            });
        });
    });
    myDiv.appendChild(tipsImg);

    function convertHeadersArrayToObject(headersArray) {
        const headersObject = {};
        headersArray.forEach(header => {
            if (header.name) {headersObject[header.name.toLowerCase()] = header.value;}
        });
        return headersObject;
    }

    window.addEventListener("message", (event) => {
        if (event.data.type === "EXTENSION_READY") {
            let selectV = document.getElementById("operator-type").value;
            const script = document.createElement("script");
            script.src = chrome.runtime.getURL("utils/caller.js");
            script.dataset.func = `startTask${selectV}`;
            script.dataset.args = JSON.stringify([allData, headers]);
            document.body.appendChild(script);
        }
    });

    function check_user() {
        const target_action = actionList.find(m => m.url.indexOf(window.location.host) > -1);
        let user_url = "";
        let method = "GET";
        if (target_action) {
            let h = convertHeadersArrayToObject(headers)
            if (['111', '112', '113', '115', '212', '213'].indexOf(target_action.js) > -1) {
                user_url = `https://igi.hsa.gd.gov.cn/tps_local/web/auth/user/query_user_info`;
            }
            if (['155', '211'].indexOf(target_action.js) > -1) {
                user_url = `https://yyhc.szggzy.com:9000/hctrade/index.html?id=1629`;
            }
            console.log(h);
            fetch(user_url, { method: method, headers: h })
                .then(response => response.text())
                .then(text => {
                    console.log(text);
                    if (text.indexOf('迈瑞') > 1 || text.indexOf('长岛生物') > 1) {
                        document.body.appendChild(myDiv);
                    }
                })
                .catch(error => console.log(error));
        }
        // document.body.appendChild(myDiv);
    }
    setTimeout(() => {check_user()}, 3000);
});

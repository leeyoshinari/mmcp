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
        document.getElementById('operatorType').addEventListener('change', () => {
            const selected_value = document.getElementById("operatorType").value;
            const target_act = actionList.find(m => m.js === selected_value);
            if (target_act.used === 0) {
                document.getElementById('fileName').style.display = '';
                document.getElementById('parseExcel').style.display = '';
            } else if (target_act.used === 1) {
                document.getElementById('fileName').style.display = 'none';
                document.getElementById('parseExcel').style.display = 'none';
            }
        });
        document.getElementById('startTask').addEventListener('click', () => {
            loadScript(chrome.runtime.getURL('utils/template.js'), async () => {
                const op_value = document.getElementById("operatorType").value;
                let op_action = actionList.find(m => m.js === op_value);
                if (op_action.used === 0) {
                    if (allData.length < 1) {
                        exportText1("正在获取Excel文件中 ...")
                        await fetchExcel();
                    }
                    if (allData.length > 0) {
                        const hh = document.createElement('script');
                        hh.src = chrome.runtime.getURL(`utils/${'mr' + op_value}.js`);
                        document.body.appendChild(hh);
                    }
                    console.log(allData);
                } else {
                    const hh = document.createElement('script');
                    hh.src = chrome.runtime.getURL(`utils/${'mr' + op_value}.js`);
                    document.body.appendChild(hh);
                }
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

    function convertCookiesToObject(cookieString) {
        const cookies = {};
        cookieString.split('; ').forEach(cookie => {
            const parts = cookie.split('=');
            const name = decodeURIComponent(parts.shift());
            const value = decodeURIComponent(parts.join('='));
            cookies[name] = value;
        });
        return cookies;
    }

    window.addEventListener("message", (event) => {
        if (event.data.type === "EXTENSION_READY") {
            let selectV = document.getElementById("operatorType").value;
            const script = document.createElement("script");
            script.src = chrome.runtime.getURL("utils/caller.js");
            script.dataset.func = `startTask${selectV}`;
            script.dataset.args = JSON.stringify([allData, headers]);
            document.body.appendChild(script);
        }
    });

    function check_user() {
        const target_action = actionList.find(m => m.url.indexOf(window.location.host) > -1);
        if (target_action) {
            let h = convertHeadersArrayToObject(headers);
            let method = "GET";
            let user_url = target_action.auth;
            console.log(h);
            if (target_action.header) {
                cookie_dict = convertCookiesToObject(document.cookie);
                for (let key in target_action.header) {
                    if (key in cookie_dict) {
                        h[target_action.header[key]] = cookie_dict[key];
                    } else {
                        h[key] = target_action.header[key];
                    }
                }
            }
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

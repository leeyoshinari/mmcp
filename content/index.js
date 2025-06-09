window.addEventListener('load', () => {
    const myDiv = document.createElement("div");
    const tipsImg = document.createElement("img");
    tipsImg.src = chrome.runtime.getURL("images/icon.ico");
    myDiv.className = "float-tips";
    myDiv.style.top = window.innerHeight - 200 + 'px';
    myDiv.addEventListener('click', () => {
        clickPage();
        document.getElementById('startTask').addEventListener('click', () => {
            let selectVal = document.getElementById("operator-type").value;
            const hh = document.createElement('script');
            hh.src = chrome.runtime.getURL(`utils/${btoa(selectVal).toLowerCase()}.js`);
            document.body.appendChild(hh);
            document.getElementById('startTask').disabled = true;
        });
    });
    myDiv.appendChild(tipsImg);
    document.body.appendChild(myDiv);

    if (document.body.innerHTML.indexOf('百度') < 1) {
        let s = document.getElementsByClassName("float-tips")[0];
        document.body.removeChild(s);
    }
});

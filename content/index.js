console.log('test 23421');
const startRun = () => {
    if (document.getElementsByClassName("float-container").length > 0) return null;
    const homePage = document.createElement('script');
    homePage.src = chrome.runtime.getURL("utils/home.js");
    document.body.appendChild(homePage);
}

const myDiv = document.createElement("div");
const tipsImg = document.createElement("img");
tipsImg.src = chrome.runtime.getURL("images/icon.ico");
myDiv.className = "float-tips";
myDiv.style.top = window.innerHeight - 200 + 'px';
myDiv.addEventListener('click', () => {startRun();});
myDiv.appendChild(tipsImg);
document.body.appendChild(myDiv);

const template = document.createElement('script');
template.src = chrome.runtime.getURL("utils/template.js");
template.type = 'module';
document.body.appendChild(template);

const xlsxJs = document.createElement('script');
xlsxJs.src = chrome.runtime.getURL("utils/xlsx.full.min.js");
document.body.appendChild(xlsxJs);

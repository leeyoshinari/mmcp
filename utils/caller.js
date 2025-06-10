const func = document.currentScript.dataset.func;
const args = JSON.parse(document.currentScript.dataset.args || "[]");
if (window.myExtensionFuncs?.[func]) {
    window.myExtensionFuncs[func](...args);
}
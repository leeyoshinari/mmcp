const func = document.currentScript.dataset.func;
const args = document.currentScript.dataset.args;
if (window.myExtensionFuncs?.[func]) {
    window.myExtensionFuncs[func](JSON.parse(args));
}
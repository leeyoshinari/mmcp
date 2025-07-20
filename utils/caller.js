let mrfunc = document.currentScript.dataset.func;
let mrargs = JSON.parse(document.currentScript.dataset.args || "[]");
if (window.myExtensionFuncs?.[mrfunc]) {
    window.myExtensionFuncs[mrfunc](...mrargs);
}
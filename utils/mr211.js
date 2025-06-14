// 
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
const wsUrl = "ws://127.0.0.1:8989";
let headers = [];


const fileClient = new FileTransferClient(wsUrl);
async function processFile() {
  try {
    await fileClient.connect().catch((err) => {exportText(err.stack);});
    const fileData = await fileClient.receiveFile('asd.pdf').catch((err) => {
      exportText(err.stack);
      return;
    });
    const base64String = arrayBufferToBase64(fileData);
    exportText(base64String);
  } catch (err) {
    exportText(err.stack);
  }
}

processFile();
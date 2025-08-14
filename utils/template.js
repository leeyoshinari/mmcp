async function fetchPost(url, data, myheader) {
  const content_type = myheader['content-type'];
  let body = JSON.stringify(data);
  if (content_type.startsWith('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, value === null ? "" : value === undefined ? "" : value);
    });
    body = params.toString();
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...myheader,
    },
    body: body,
  });
  if (!response.ok) throw new Error('Request Error:' + response.status);
  return await response.json();
}

async function fetchGet(url, myheader) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...myheader,
    },
  });
  if (!response.ok) throw new Error('Request Error:' + response.status);
  return await response.json();
}

function createWebSocket(url, protocols) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, protocols);
    ws.onopen = () => resolve(ws);
    ws.onerror = (error) => reject(error);
  });
}

function timer(millisecond) {
    return new Promise(resolve => setTimeout(resolve, millisecond));
}

function getRandomInt() {
  return Math.round(Math.random() * 10000);
}

async function calc_md5(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function exportText(text) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  text = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} - ${text}`;
  textContainer.textContent += text + '\n';
  textContainer.scrollTop = textContainer.scrollHeight;
  console.log(text);
}

function downloadData(data) {
    let blob = new Blob(["\uFEFF" + data], {type: 'text/csv;charset=utf-8;'});
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = URL.createObjectURL(blob);
    link.download = 'run.log';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function arrayBufferToBase64(arrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function convertHeadersArrayToObject(headersArray) {
  const headersObject = {};
  headersArray.forEach(header => {
    if (header.name) {
      headersObject[header.name.toLowerCase()] = header.value;
    }
  });
  return headersObject;
}


class FileTransferClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.connectionPromise = null;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 初始重试延迟1秒
  }

  // 建立WebSocket连接
  async connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      let retryCount = 0;
      
      const tryConnect = () => {
        console.log(`尝试连接服务器 (${retryCount + 1}/${this.maxRetries})`);
        this.socket = new WebSocket(this.serverUrl);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = () => {
          console.log('WebSocket连接已建立');
          resolve();
        };
        
        this.socket.onerror = (error) => {
          console.log('WebSocket连接错误:', error);
        };
        
        this.socket.onclose = (event) => {
          if (event.wasClean) {
            console.log(`连接正常关闭，代码=${event.code}，原因=${event.reason}`);
          } else {
            if (retryCount < this.maxRetries - 1) {
              retryCount++;
              setTimeout(tryConnect, this.retryDelay * Math.pow(2, retryCount - 1));
            } else {
              reject(new Error(`无法连接到文件服务，已尝试${this.maxRetries}次`));
              this.connectionPromise = null;
            }
          }
        };
      };
      tryConnect();
    });
    return this.connectionPromise;
  }

  async disconnect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close(1000, '正常关闭');
    }
    this.connectionPromise = null;
  }

  async calculateHash(arrayBuffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async receiveFile(filename, requestType = "requestFile", maxRetries = 3) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket连接未建立');
    }
    
    let retryCount = 0;
    const tryReceive = async () => {
      try {
        return await this._doReceiveFile(filename, requestType);
      } catch (error) {
        if (error.message.indexOf('文件不存在') < 0 && retryCount < maxRetries) {
          retryCount++;
          console.log(`${filename} 文件接收失败，准备第${retryCount}次重试...`, error.message);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount - 1)));
          return tryReceive();
        }
        throw error;
      }
    };
    return tryReceive();
  }

  // 实际执行文件接收
  async _doReceiveFile(filename, requestType) {
    return new Promise(async (resolve, reject) => {
      const receivedChunks = [];
      let expectedHash = '';
      
      const messageHandler = async (event) => {
        try {
          if (typeof event.data === 'string') {
            const data = event.data;
            if (data.startsWith('{')) {
              try {
                const meta = JSON.parse(data);
                if (meta.type === 'metadata') {
                  expectedHash = meta.data;
                  return;
                }
              } catch (e) {
                console.error('元数据解析错误:', e);
              }
            }
            
            if (data === 'FILE_TRANSFER_COMPLETE') {
              this.socket.removeEventListener('message', messageHandler);
              const totalSize = receivedChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
              const mergedArray = new Uint8Array(totalSize);
              let offset = 0;
              for (const chunk of receivedChunks) {
                mergedArray.set(new Uint8Array(chunk), offset);
                offset += chunk.byteLength;
              }
              
              const actualHash = await this.calculateHash(mergedArray.buffer);
              if (actualHash !== expectedHash) {
                throw new Error(`文件加载不完整，预期 ${expectedHash}，实际 ${actualHash}`);
              }
              resolve(mergedArray.buffer);
              return;
            }
            
            if (data.startsWith('错误:')) {
              throw new Error(data);
            }
          }
          
          if (event.data instanceof ArrayBuffer) {
            receivedChunks.push(event.data);
          }
        } catch (error) {
          this.socket.removeEventListener('message', messageHandler);
          reject(error);
        }
      };
      
      this.socket.addEventListener('message', messageHandler);
      
      try {
        const request = { 'type': requestType, 'data': filename};
        this.socket.send(JSON.stringify(request));
      } catch (error) {
        this.socket.removeEventListener('message', messageHandler);
        reject(error);
      }
    });
  }

  async receiveMsg(text, requestType) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket连接未建立');
    }

    return new Promise(async (resolve, reject) => {
      const textHandler = async (event) => {
        try {
          const data = event.data;
          if (data.startsWith('{')) {
            try {
              const response = JSON.parse(data);
              resolve(response.data);
              return;
            } catch (e) {
              throw new Error(`元数据解析错误: ${data}`);
            }
          }
          
          if (data.startsWith('错误:')) {
            throw new Error(data);
          }
          resolve(data);
          return;
        } catch (error) {
          this.socket.removeEventListener('message', textHandler);
          reject(error);
        }
      };
      
      this.socket.addEventListener('message', textHandler);
      try {
        const request = { 'type': requestType, 'data': text };
        this.socket.send(JSON.stringify(request));
      } catch (error) {
        this.socket.removeEventListener('message', textHandler);
        reject(error);
      }
    });
  }
}
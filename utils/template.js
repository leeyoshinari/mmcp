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

async function fetchPut(url, data, myheader) {
  const content_type = myheader['content-type'] || myheader['Content-Type'];
  let body = JSON.stringify(data);
  
  if (content_type && content_type.startsWith('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, value === null ? "" : value === undefined ? "" : value);
    });
    body = params.toString();
  }
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      ...myheader,
    },
    body: body,
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


async function calculateHashOrigin(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const bitLen = bytes.length * 8;
  const padded = new Uint8Array(((bytes.length + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLen, false);

  const w = new Uint32Array(64);

  for (let i = 0; i < padded.length; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 64; j++) {
      const s0 = ror(w[j - 15], 7) ^ ror(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = ror(w[j - 2], 17) ^ ror(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3;
    let e = h4, f = h5, g = h6, h = h7;

    for (let j = 0; j < 64; j++) {
      const S1 = ror(e, 6) ^ ror(e, 11) ^ ror(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[j] + w[j]) >>> 0;
      const S0 = ror(a, 2) ^ ror(a, 13) ^ ror(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;

      h = g; g = f; f = e;
      e = (d + t1) >>> 0;
      d = c; c = b; b = a;
      a = (t1 + t2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map(x => x.toString(16).padStart(8, '0'))
    .join('');
}

function ror(x, n) {
  return (x >>> n) | (x << (32 - n));
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
    if (window.crypto && window.crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      return calculateHashOrigin(arrayBuffer);
    }
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
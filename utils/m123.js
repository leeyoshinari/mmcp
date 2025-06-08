const textContainer = document.getElementsByClassName("logs")[0];

async function fetchPost(url, data, headers) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Request Error:' + response.status);
  return await response.json();
}

async function fetchGet(url, headers) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...headers,
    },
  });
  if (!response.ok) throw new Error('Request Error:' + response.status);
  return await response.json();
}

function timer(millisecond) {
  let startTime = (new Date()).getTime();
  while ((new Date()).getTime() - startTime < millisecond) {
    continue;
  }
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

function startTask(data) {
    setInterval(() => {
        exportText('textContainer.scrollTop = textContainer.scrollHeight');
    }, 2000)
    console.log(data);
}

window.myExtensionFuncs = {
  startTask: (data) => startTask(data)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask"] }, 
  "*"
);

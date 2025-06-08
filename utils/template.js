export async function fetchPost(url, data, headers) {
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

export async function fetchGet(url, headers) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...headers,
    },
  });
  if (!response.ok) throw new Error('Request Error:' + response.status);
  return await response.json();
}
export function timer(millisecond) {
  let startTime = (new Date()).getTime();
  while ((new Date()).getTime() - startTime < millisecond) {
    continue;
  }
}
export function encodeURL(url: string) {
  const _url = new URL(url);
  return `${_url.protocol.slice(0, -1)}/${_url.host}${_url.pathname}${_url.search}`;
}

export function decodeURL(url: string) {
  const pos = url.indexOf('/');
  const protocol = url.slice(0, pos);
  return `${protocol}://${url.slice(pos + 1)}`;
}

export function proxyURL(url: string) {
  const _url = new URL(url);
  return `/_immersed_proxy/${_url.protocol.slice(0, -1)}/${_url.host}${_url.pathname}${_url.search}`;
}

export function pageURL(url: string) {
  const _url = new URL(url);
  return `/page/${_url.protocol.slice(0, -1)}/${_url.host}${_url.pathname}${_url.search}`;
}
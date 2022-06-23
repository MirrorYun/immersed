import config from '../../config'

export function fixCookie(cookie: string, _url: string): string {
  const items = cookie.split(';');

  const url = new URL(_url);
  let baseURI = url.pathname;
  baseURI = baseURI.slice(0, baseURI.lastIndexOf('/'));

  let flag_path = false;
  for (let i = 1; i < items.length; i++) {
    const item = items[i].trim();
    const eqPos = item.indexOf('=');
    if(eqPos < 0) continue;

    let [key, value] = [item.slice(0, eqPos), item.slice(eqPos + 1)];
    key = key.toLowerCase();
    
    if(key === 'path') {
      flag_path = true;
      if(value.startsWith('/')) {
        value = `${config.page_uri}/${url.protocol.slice(0, -1)}/${url.host}${value}`;
      } else {
        value = `${config.page_uri}/${url.protocol.slice(0, -1)}/${url.host}${baseURI}/${value}`;
      }
    }

    if(key === 'domain') {
      items[i] = '';
      continue;
    }

    items[i] = `${key}=${value}`;
  }

  if(!flag_path) {
    items.push(`path=${config.page_uri}/${url.protocol.slice(0, -1)}/${url.host}${baseURI}`);
  }
  
  return items.filter(i=>i).join('; ');
}
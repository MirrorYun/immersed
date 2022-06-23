import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { fixCookie } from "./cookie";

interface ProxyConfig {
  redirect_to?(url: string): string;
}
interface ProxyResponse {
  status: number;
  headers: Record<string, string | string[]>;
  data: any;
}

export default async function(config: AxiosRequestConfig & ProxyConfig): Promise<ProxyResponse> {
  let resp: AxiosResponse;
  try {
    if(config.responseType === 'stream') {
      config.decompress = false;
    }
    config.maxRedirects = 0;
    resp = await axios(config);
  } catch (error: any) {
    if(!error?.response?.status) {
      throw error;
    }

    resp = error.response;
    
    if(config.redirect_to && error.response.status >= 300 && error.response.status < 400) {
      if(resp.headers.location) {
        resp.headers.location = config.redirect_to(resp.headers.location);
        console.warn(`Redirected from ${config.url} to ${resp.headers.location}`);
      }
    }
  }

  let headers: Record<string, string | string[]> = {};
  let blacklist: string[] = ["content-security-policy", "strict-transport-security", "permissions-policy"];
  if(config.responseType !== 'stream') {
    blacklist = blacklist.concat(["content-encoding", "content-length", "transfer-encoding"])
  }
  for (const key of Object.keys(resp.headers)) {
    if (blacklist.includes(key)) continue;

    // TODO following code can't handle cross-domain cookie for now
    if(key == "set-cookie") {
      let cookies: string | string[] = resp.headers[key]!;
      if(!Array.isArray(cookies)) cookies = [cookies];
      for (let i = 0; i < cookies.length; i++) {
        cookies[i] = fixCookie(cookies[i], config.url!)
      }
    }
    
    headers[key] =  resp.headers[key];
  }

  return {
    status: resp.status,
    headers,
    data: resp.data
  };
}
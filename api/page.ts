import type { VercelRequest, VercelResponse } from "@vercel/node";
import proxy from "../src/utils/proxy"
import { pageURL } from "../src/utils/url"
import config from '../config'

export default async function (req: VercelRequest, res: VercelResponse) {
  const regex = req.url?.match(`^/(http|https)/([^/]+)${config.page_uri}(/.*)$`);
  if (!regex) {
    res.status(400).send("Invalid url");
    return;
  }

  let headers: Record<string, string> = {};

  const blacklist: string[] = ['host', 'origin', 'referer', 'accept-encoding'];
  for (const [key, value] of Object.entries(req.headers)) {
    if (blacklist.includes(key) || key.startsWith('x-') || key.startsWith('sec-fetch-') || !value || Array.isArray(value)) continue;
    headers[key] = value;
  }

  const url = `${regex[1]}://${regex[2]}${regex[3]}`;
  
  let result = await proxy({
    method: 'GET',
    url,
    responseType: 'text',
    headers,
    redirect_to: pageURL
  });

  res.status(result.status);
  for (const key of Object.keys(result.headers)) {
    res.setHeader(key, result.headers[key]);
  }

  if(result.status === 200) {
    const injectBefore = `<script src="/inject.js"></script>`;
    res.send(injectBefore + result.data);
  } else {
    res.send(result.data);
  }
}

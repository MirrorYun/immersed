import type { VercelRequest, VercelResponse } from "@vercel/node";
import proxy from "../src/utils/proxy"
import { proxyURL } from "../src/utils/url"

export default async function (req: VercelRequest, res: VercelResponse) {
  const regex = req.url?.match("^/_immersed_proxy/(http|https)/([^/]+)(/.*)$");
  if (!regex) {
    res.status(400).send("Invalid url");
    return;
  }

  let headers: Record<string, string> = {};

  const blacklist: string[] = ['host', 'origin'];
  for (const [key, value] of Object.entries(req.headers)) {
    if (blacklist.includes(key) || key.startsWith('x-') || key.startsWith('sec-fetch-') || !value || Array.isArray(value)) continue;
    headers[key] = value;
  }

  if(req.headers['x-immersed-referer']) {
    headers['referer'] = req.headers['x-immersed-referer'] as string;
  }

  try {
    let result = await proxy({
      method: req.method,
      url: `${regex[1]}://${regex[2]}${regex[3]}`,
      headers,
      data: req.body,
      responseType: 'stream',
      redirect_to: proxyURL
    });

    const stream = result.data as NodeJS.ReadableStream;

    res.status(result.status);
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
    
    stream.pipe(res);
  } catch (error) {
    console.error(error.message);
    res.status(500);
    res.send(null);
  }
}

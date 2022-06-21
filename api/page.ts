import type { VercelRequest, VercelResponse } from "@vercel/node";
import proxy from "../src/utils/proxy"
import { pageURL } from "../src/utils/url"

export default async function (req: VercelRequest, res: VercelResponse) {
  const regex = req.url?.match("^/page/(http|https)/([^/]+)(/.*)$");
  if (!regex) {
    res.status(400).send("Invalid url");
    return;
  }
  const url = `${regex[1]}://${regex[2]}${regex[3]}`;
  
  let result = await proxy({
    method: 'GET',
    url,
    responseType: 'text',
    redirect_to: pageURL
  });

  res.status(result.status);
  for (const key of Object.keys(result.headers)) {
    res.setHeader(key, result.headers[key]);
  }

  if(result.status === 200) {
    const filename = process.env?.NODE_ENV === 'development'? '/inject.ts': '/inject.js';
    const injectBefore = `<script src="${filename}"></script>`;
    res.send(injectBefore + result.data);
  } else {
    res.send(result.data);
  }
}

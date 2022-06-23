import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/utils/router";

async function registerSW(): Promise<void> {
  if(!('serviceWorker' in navigator)) {
    throw new Error('ServiceWorker is not supported');
  }
  
  let reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  console.debug('ServiceWorker registration successful: ', reg);
}

export default function() {
  const router = useRouter();
  const [tips, setTips] = useState('Loading...');

  useEffect(()=>{
    registerSW().then(()=>{
      const url = new URL(window.location.href);
      if(!url.searchParams.has('uri')) {
        router.replace('/')
        return;
      }
  
      location.href = url.searchParams.get('uri')!;
    }).catch(e=>setTips(`Failed to register service worker: ${e.message}`));
  })
  return (
    <div>{tips}</div>
  )
}
import { useEffect, useRef, useState } from "react";
import { useRoute } from "@/utils/router";
import styles from "./style.module.scss";

export default function() {
  const { schema, host, path } = useRoute();
  const iframeEl = useRef<HTMLIFrameElement>(null);

  useEffect(()=>{
    console.log(schema, host, path);
  }, []);

  // https://bugs.chromium.org/p/chromium/issues/detail?id=880768
  return (
    <div className={styles.iframeWrapper}>
      <iframe ref={iframeEl} src={`/page/${schema}/${host}/${path}`} frameBorder="0" />
    </div>
  )
}
import { pageURL } from '@/utils/url';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import styles from './style.module.scss';

export default function() {
  let [input, setInput] = useState('');
  let [errorMsg, setErrorMsg] = useState('');
  let [error, setError] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setErrorMsg('');
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if(!input) {
        setErrorMsg('Please input a url or a keyword');
        setError(true);
        return
      }

      try {
        const url = new URL(input);
        location.href = pageURL(input);
        return
      } finally {
        location.href = __PAGE_URI__ + '/https/www.google.com/search?q=' + encodeURIComponent(input);
      }
    }
  }

  useEffect(()=>{
    if(!error) return;
    let id = setTimeout(()=>setError(false), 300);
    return ()=>clearTimeout(id);
  }, [error])

  return (
    <main className={styles.home}>
      <div className={styles.title}>
        <h1>Immersed</h1>
        <span className={styles.version}>{__APP_VERSION__}</span>
      </div>
      <div className={styles.controls}>
        <input type="text" className={classNames(styles.input, {[styles.error]: error})} value={input} onInput={handleInput} onKeyDown={handleKeyDown} />
        <p className={classNames(styles.errorTips, {[styles.hide]: !errorMsg})}>{errorMsg}</p>
      </div>
    </main>
  )
}
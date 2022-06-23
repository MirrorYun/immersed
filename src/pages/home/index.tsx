import { pageURL } from '@/utils/url';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import styles from './style.module.scss';

export default function() {
  let [input, setInput] = useState('');
  let [errorMsg, setErrorMsg] = useState('');
  let [error, setError] = useState(false);

  const validate = (input: string) => {
    let url: URL;
    try {
      url = new URL(input);
    } catch (error: any) {
      return error.message;
    }
    const validProtocols = ['http:', 'https:'];
    if(!validProtocols.includes(url.protocol)) return 'Invalid protocol';
    
    return '';
  }
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if(!validate(e.target.value)) {
      setErrorMsg('');
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const msg = validate(input);
      if(msg) {
        setErrorMsg(msg);
        setError(true);
        return
      }

      location.href = pageURL(input);
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
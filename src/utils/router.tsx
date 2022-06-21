import { createContext, ReactNode, useContext, useState, ReactElement, useEffect } from "react";
import { match, pathToRegexp } from "path-to-regexp";

interface RouterContext {
  path: string;
  setPath(path: string): void;
  push(path: string): void;
  back(): void;
}

function useProvideRouter(): RouterContext {
  const [path, setPath] = useState(window.location.pathname);

  return {
    path,
    setPath,
    push(newPath: string) {
      if(path == newPath) return;
      
      setPath(newPath)
      window.history.pushState({}, '', newPath)
    },
    back() {
      window.history.back()
    }
  }
}

const routerCtx = createContext<RouterContext>(null!);
export function Router({ children }: { children: ReactNode }) {
  const router = useProvideRouter();

  useEffect(()=>{
    let listener = ()=> {
      router.setPath(window.location.pathname);
    }
    window.addEventListener('popstate', listener);
    return ()=> window.removeEventListener('popstate', listener);
  })

  return (
    <routerCtx.Provider value={router}>
      {children}
    </routerCtx.Provider>
  )
}

export function useRouter(): Omit<RouterContext, 'setPath'> {
  let {setPath, ...rest} = useContext(routerCtx);
  return {...rest};
}

interface RouteOption {
  path: string;
  component: React.ComponentType<any>;
}


const paramsCtx = createContext<Record<string, string>>({});
export const Route: React.FC<RouteOption> = (props) => {
  const router = useContext(routerCtx);
  const matchResult = match(props.path)(router.path);
  
  return matchResult?(
    <paramsCtx.Provider value={matchResult ? matchResult.params as Record<string, string> : {}}>
      <props.component />
    </paramsCtx.Provider>
  ) : null;
}

type RouteElement = ReactElement<RouteOption, typeof Route>;
export function Switch({ children }: { children: RouteElement[] }) {
  const router = useContext(routerCtx);

  for(const child of children) {
    if(pathToRegexp(child.props.path).test(router.path)) return child;
  }
  return null;
}

export function Link(props: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) {
  const router = useRouter();
  return <a {...props} onClick={ e => {
      if(!props.href) return;
      router.push(props.href);
      e.preventDefault();
    }} />;
}

export function useRoute() {
  return useContext(paramsCtx);
}
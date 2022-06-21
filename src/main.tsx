import ReactDOM from 'react-dom/client'
import { Router, Route, Switch, Link } from './utils/router'
import { Login, Proxy, Home, ErrorPage } from "./pages";

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/:schema(http|https)/:host/:path(.*)" component={Proxy} />
        <Route path="/login" component={Login} />
        <Route path="/:path*" component={ErrorPage} />
      </Switch>
    </Router>
  //</React.StrictMode>
)

registerSW();

function registerSW() {
  const filename = import.meta.env.MODE === 'development'? '/sw.ts': '/sw.js';

  window.addEventListener('load', ()=> {
    if(!('serviceWorker' in navigator)) {
      console.error('ServiceWorker is not supported');
    }
    navigator.serviceWorker.register(filename);
  });
}
import React from 'react';
import ReactDOM from 'react-dom/client'
import { Router, Route, Switch, Link } from './utils/router'
import { Login, Init, Home, ErrorPage } from "./pages";
import './global.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/init" component={Init} />
        <Route path="/login" component={Login} />
        <Route path="/:path*" component={ErrorPage} />
      </Switch>
    </Router>
  </React.StrictMode>
)
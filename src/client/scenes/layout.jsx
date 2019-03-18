import React from 'react';
import { Route } from 'react-router-dom';
import { HomeScene } from './home/home-scene';

export const Layout = () => {
  return (
    <div className="layout">
      <div className="content">
        <Route exact path="/" component={HomeScene} />
        {/* other routes go here */}
      </div>
      <footer className="footer">
        <div>
          <span>Site by </span>
          <a href="https://www.twitter.com/altangent">@altangent</a>
          <span> | </span>
          <a href="https://getblockclock.com">Official BlockClock</a>&trade;
          <span> by </span>
          <a href="https://coinkite.com/">Coinkite</a>
          <span> | </span>
          <span>Pricing by </span>
          <a href="https://www.blocktap.io">Blocktap.io</a>
        </div>
      </footer>
    </div>
  );
};

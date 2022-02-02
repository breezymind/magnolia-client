
import AppContext from "../lib/AppContext";
import MqttClient from '../lib/MqttClient';
import '../styles/globals.css'
import 'semantic-ui-css/semantic.min.css'
import Menus from '../src/component/Menus'
import App from 'next/app'
import React, { Component } from 'react';

var Env = {
  login : {
    user_no:  '777777',
    user_id:  'karl',
    user_nm:  'Karl',
    user_pwd: '1111',
  }
}

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Menus />
        <AppContext.Provider value={Env}>
          <Component {...pageProps} />
        </AppContext.Provider>
      </>
    )
  }
}

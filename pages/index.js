import MqttClient from '../lib/MqttClient';
import AppContext from "../lib/AppContext";
import React, { Component, useContext } from 'react';
import { Header, Image, Divider } from 'semantic-ui-react'
import { withRouter } from 'next/router'

class Home extends Component{

  state = { data: [

    {
      user_id : 'mecadia',
      user_nm : '김현철',
      user_no : '111',
    },
    {
      user_id : 'signus1',
      user_nm : '이승훈',
      user_no : '222',
    },
    {
      user_id : 'leeht',
      user_nm : '이형탁',
      user_no : '333',
    },
    {
      user_id : 'sniwmemory',
      user_nm : '박충배',
      user_no : '555',
    },
    {
      user_id : 'parksh',
      user_nm : '박성환',
      user_no : '777',
    }

  ] };

  componentDidMount() {
    const env = this.context;
    env.magnolia = MqttClient.getInstance(env.login);
    
    env.magnolia.mqtt_conn = env.magnolia.GetConnection()

    if (env.magnolia.mqtt_conn._events.message) {
      env.magnolia.mqtt_conn._events.message = undefined;
    }
    env.magnolia.mqtt_conn.on('message', (topic, payload, packet)=>{
      try{ payload = JSON.parse(payload); }catch(e) { console.error(e); return false; }
      
      console.log(payload);
  
      switch (payload.command) {
        case 'room.invite':
            if (payload.host_id == env.login.user_id) {
              this.props.router.push(`/mention/${payload.room_id}`);
            }
            break;
        // case 'message':
        //     room_id = payload.room.room_id.trim();
        //     recvMsg(payload.message);
        //     readMsg(payload);
        //     break;
        default:
        return
      }
    });
  }
  // componentWillUnmount() {
  //   const env = this.context;
  //   env.magnolia.GetConnection().end(true, {properties: {sessionExpiryInterval: 0}})
  // }

  SetRoomInvite(e, guest_id) {
    e.preventDefault();
    const env = this.context;
    env.magnolia.EmitRoomInvite(env.login.user_id, guest_id)
  }

  render() {
    const {data} = this.state;
    const room_list = data.map(
      guest => (
        <div>
          <Header as='h2' 
          className='chat-list-item'
          key={guest.user_id}
          onClick={(e) => this.SetRoomInvite(e, guest.user_id)}
          >
            <Image circular src='https://react.semantic-ui.com/images/avatar/large/patrick.png' />
            <Header.Content>
              {guest.user_nm}
              <Header.Subheader>
              {guest.user_id}
              </Header.Subheader>
            </Header.Content>
          </Header>
          <Divider style={{margin:0}} />
        </div>
      )
    );

    return (
    <div>{room_list}</div>
    )
  }
}

Home.contextType = AppContext

export default withRouter(Home)

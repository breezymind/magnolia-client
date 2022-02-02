import MqttClient from '../lib/MqttClient';
import AppContext from "../lib/AppContext";
import React, { Component } from 'react';
import { Divider, Header, Image } from 'semantic-ui-react'
import Link from 'next/link'

class Room extends Component{
    state = { data: [] }

    componentDidMount() {
        var env = this.context;

        // env.magnolia = new MqttClient(env.login);
        env.magnolia = MqttClient.getInstance(env.login);
        env.magnolia.mqtt_conn = env.magnolia.GetConnection()

        if (env.magnolia.mqtt_conn._events.message) {
            env.magnolia.mqtt_conn._events.message = undefined;
        }
        // if (env.magnolia.mqtt_conn && !env.magnolia.mqtt_conn._events.message) {
            env.magnolia.mqtt_conn.on('message', (topic, payload, packet)=>{
                try{ payload = JSON.parse(payload); }catch(e) { console.error(e); return false; }
                
                switch (payload.command) {
                case 'room.list':
                    console.log(payload);
                    if (payload.rooms.length > 0) {
                        this.setState({data: payload.rooms});
                    }
                break;
                // case 'room.invite':
                //     room_id = payload.room_id.trim();
                //     mqtt_conn.subscribe(`room/${room_id}`, { qos: 0 });
                //     break;
                // case 'message':
                //     room_id = payload.room.room_id.trim();
                //     recvMsg(payload.message);
                //     readMsg(payload);
                //     break;
                default:
                return
                }
            });
        // }
        env.magnolia.EmitRoomList();
    }

  render() {
    const {data} = this.state;
    const room_list = data.map(
        rm => (
        <div>
        <Link key={rm.room_id} href={"/mention/"+ rm.room_id}>
            <a>
                <Header as='h2' className='chat-list-item'>
                <Image circular src='https://react.semantic-ui.com/images/avatar/large/patrick.png' />
                <Header.Content>
                    {rm.message}
                    <Header.Subheader>
                    {
                    rm.members.filter(a => (a.user_id)).map(a => a.user_id).join(', ')
                    }
                    </Header.Subheader>
                </Header.Content>
                </Header>
            </a>
        </Link>
        <Divider style={{margin:0}} />
        </div>
        )
    );
    return (
    <div>{room_list}</div>
    )
  }
}
Room.contextType = AppContext
export default Room
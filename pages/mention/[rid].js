import MqttClient from '../../lib/MqttClient';
import AppContext from "../../lib/AppContext";
import MentionList from '../../src/component/MentionList';
import MentionWrite from '../../src/component/MentionWrite';

import React, { Component } from 'react';
import { List, Label, Button } from 'semantic-ui-react'
import { withRouter } from 'next/router'

class Mention extends Component {
    mqtt_conn
    room_id
    subscribe = []; 
    state = { 
        lock: false,
        page: 1,
        mentions: [],
        members: []
    }

    constructor(){
        super();
    }

    componentDidMount() {
        this.env = this.context;
        
        this.env.magnolia = MqttClient.getInstance(this.env.login);
        this.env.magnolia.mqtt_conn = this.env.magnolia.GetConnection()

        if (this.env.magnolia.mqtt_conn._events.message) {
            this.env.magnolia.mqtt_conn._events.message = undefined;
        }

        this.env.magnolia.mqtt_conn.on('message', (topic, payload, packet)=>{
            try{ payload = JSON.parse(payload); }catch(e) { console.error(e); return false; }
            
            console.log(payload.command);
    
            switch (payload.command) {
                case 'room.list':
                    if (payload.rooms.length > 0 && this.room_id) {
                        this.setState(
                            { members : payload.rooms.filter(v => v.room_id == this.room_id)[0].members }
                        );
                    }
                    break;
                case 'room.invite':
                    // room_id = payload.room_id.trim();
                    // mqtt_conn.subscribe(`room/${room_id}`, { qos: 0 });
                    break;
                case 'message':
                    this.recvMsg(payload.message);
                    this.readMsg(payload);
                    break;
                case 'message.list':
                    if(payload.list.length > 0) {
                        payload.list.reverse((a, b)=>{ a.created - b.created }).map(msg => {
                            console.log(msg)
                            this.recvMsg(msg);
                        })
                        this.state.page++;
                    }
                    break;
                default:
                    console.log(payload);
                return
            }
        });

        this.room_id = this.props.router.query.rid;
        if (this.room_id === undefined) {
            this.props.router.push('/rooms');
            return 
        }

        this.env.magnolia.EmitRoomList();
        this.env.magnolia.GetConnection().subscribe(`room/${this.room_id}`, { qos: 0 });

        this.env.magnolia.EmitMessageList(this.room_id, this.state.page);
    }
    componentWillUnmount() {
        this.env.magnolia.GetConnection().unsubscribe(`room/${this.room_id}`, { qos: 0 });
    }

    closeRoom = (e) => {
        e.preventDefault();
        console.log(this.room_id);
        this.env.magnolia.EmitRoomClose(this.room_id);
        this.props.router.push('/rooms');
    }

    readMsg = (item) => {
        this.env.magnolia.EmitMessageRead(item);
    }

    writeMsg = (item) => {
        let room_id = this.room_id
        item.body = item.body.trim();

        if (room_id === '') {
            return 
        }

        if (item.body === '') {
            return
        }

        this.env.magnolia.EmitMessageWrite(room_id, item.body)
    }

    recvMsg = (item) => {
        if (item && item.hasOwnProperty('body') && item.body.trim() === '') {
            return
        }
        const { mentions } = this.state;

        var isUpdate = false;
        mentions.forEach((v, k) => {
            if (v.msg_id === item.msg_id) {
                mentions[k] = item;
                isUpdate = true;
            }
        });

        if (isUpdate) {
            this.setState(mentions);
        }else{
            this.setState(
                { mentions : mentions.concat({ ...item }) }
            );
        }
    }

    componentDidUpdate() {
        const objDiv = document.getElementById('outter');

        objDiv.scrollTop = objDiv.scrollHeight;
        objDiv.style.height = (window.innerHeight-226)+'px';

        objDiv.addEventListener('scroll', ()=>{
            if (objDiv.scrollTop == 0 && !this.state.lock) {
                this.state.lock = true
                this.env.magnolia.EmitMessageList(this.room_id, this.state.page);
                setTimeout(()=>{
                    this.state.lock = false
                },500);
            }
        });

        window.addEventListener('resize', ()=> {
            objDiv.style.height = (window.innerHeight-226)+'px';
        });
    }

    render() {
        const {mentions, members} = this.state;
        const cmmts_list = mentions.map(
            cmmt => (
                <MentionList align={
                    this.env.login.user_id === cmmt.writer.user_id
                    ? 'right' : 'left'
                } 
                key={cmmt.msg_id} 
                name={cmmt.writer.user_nm} 
                comment={cmmt.body} 
                badge={cmmt.badge}
                created={cmmt.created} 
                />
            )
        )
        const member_list = members.map(v => 
            <Label key={v.user_id} as='a' image>
            <img src='https://react.semantic-ui.com/images/avatar/large/patrick.png' />
            {v.user_id}
            </Label>
        )

        return (
            <>
            <div style={{
                background:'#000',
                padding: '15px',
                display:'block',

            }}>
                {member_list}
                <div style={{
                    float: 'right',
                    margin: '-5px'
                }}
                >
                    <Button circular icon='close' onClick={this.closeRoom} />
                </div>
            </div>
            <div id="outter" style={{
                display:"block",
                width:"100%",
                padding:"0",
                margin:"0",
                overflowY:"scroll",
                overflowX:"hidden",
            }}>
                <List selection verticalAlign='middle' style={{
                    width:'100%',
                    height:'100%'
                }}>
                    {cmmts_list}
                </List>
            </div>
            <MentionWrite
                onCreate={this.writeMsg}
                style={{
                    display:"block",
                    width:'500px',
                }}
            />
            </>
        )
    }
};

Mention.contextType = AppContext
export default withRouter(Mention)
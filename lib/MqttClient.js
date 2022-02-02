import Router from 'next/router'
import mqtt from 'mqtt'

class MqttClient {
    static instance;
    open_conn = {}
    mqtt_conn = undefined
    member
    options
    mytopic

    static getInstance(member) {
        if (MqttClient.instance) {
            return MqttClient.instance;
        }
        MqttClient.instance = new MqttClient(member);
        return MqttClient.instance;
    }

    constructor(member) {
        this.member = member;
        this.options = {
            clientId  : [
                'user',
                this.member.user_no,
                Math.random().toString(16).substring(2, 8)
            ].join(':'),
            username  : (
                JSON.stringify({
                    user_type   : 'user',
                    user_no     : member.user_no,
                    user_id     : member.user_id,
                    user_nm     : member.user_nm,
                })
            ),
            clean                 : true,
            keepalive             : 3600,
            reconnectPeriod       : 500,
            rejectUnauthorized    : false,
            properties : {
                sessionExpiryInterval : 0
            }
        };
        this.mytopic  = ['user',member.user_id].join('/');
    }

    GetConnection() {
        Object.keys(this.open_conn).map((key,idx)=>{
            if (this.options.clientId !== key) {
                if(this.open_conn[key].connected){
                    this.open_conn[key].end(true, {properties: {sessionExpiryInterval: 0}});
                }else{
                    delete this.open_conn[key];
                }
            }
        });

        if (!this.mqtt_conn || this.mqtt_conn && this.mqtt_conn._events.connect.length === 0) {
            this.mqtt_conn = mqtt.connect('ws://localhost:1885', this.options);
            this.mqtt_conn.on('connect', ()=>{
                console.log(this.options.clientId + ' connect')
            }).on('reconnect', ()=>{
                console.log(this.options.clientId + ' reconnect')
                this.mqtt_conn.end(true);
            }).on('error', (e)=>{
                console.log(e)
                this.mqtt_conn.end(true);
            }).on('offline', ()=>{
                this.mqtt_conn.end(true);
            }).on('close', function () {
                Router.reload(window.location.pathname)
            });
            this.open_conn[this.options.clientId] = this.mqtt_conn;
        }
        
        this.mqtt_conn.subscribe(this.mytopic, { qos: 0 });
        return this.mqtt_conn;
    }

    EmitRoomList() {
        this.GetConnection().publish(
            this.mytopic, JSON.stringify({
                command : 'room.list',
            }), {qos : 0, retain: false}
        );
    }
    EmitRoomInvite(host_id, guest_id) {
        this.GetConnection().publish(
            this.mytopic, JSON.stringify({
                command : 'room.invite',
                host_id   : host_id,
                guest_id  : [guest_id]
            }), {qos : 0, retain: false}
        );
    }
    EmitRoomClose(room_id) {
        this.GetConnection().publish(
            this.mytopic, JSON.stringify({
                command : 'room.close',
                room_id : room_id
            }), {qos : 0, retain: false}
        );
    }

    EmitMessageList(room_id, page) {
        this.GetConnection().publish(
            `room/${room_id}`, JSON.stringify({
                command : 'msg.list',
                paging : {
                    page : page,
                    Limit : 10
                }
            }), {qos : 0, retain: false}
        );
    }
    EmitMessageWrite(room_id, body) {
        this.GetConnection().publish(
            `room/${room_id}`, JSON.stringify({
                command : 'msg.write',
                room : {
                    room_id : room_id
                },
                message : { 
                    msg_type : 'text', 
                    body : body
                }
            }), {qos : 0, retain: false})
    }
    EmitMessageRead(payload) {
        payload.command = 'msg.read';
        payload.message.body = payload.message.body

        this.GetConnection().publish(
            `room/${payload.room.room_id}`, JSON.stringify(
                payload
            ), {qos : 0, retain: false}
        );
    }
}

export default MqttClient;

import React, { Component } from 'react';
import { Icon, Input } from 'semantic-ui-react'

export default class MentionWrite extends Component {
    state = {
        user_nm : 'karl',
        body : ''
    } 

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.onCreate(this.state);
        this.state.body = '';
    }
    handleChange = (e) => {
        this.setState({ body :  e.target.value.toString()});
    }

    render() { 
        return (
            <form 
            onSubmit={this.handleSubmit}
            style={{
                width: '100%',
                padding: '10px',
                background: '#1b1c20'
            }}
            >
                <Input 
                value={this.state.body}
                onChange={this.handleChange}
                style={{
                    width:"100%"
                }}
                />
            </form>
        );
    }
}
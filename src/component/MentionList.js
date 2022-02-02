import { Component } from 'react';
import { Image, List, Label, Header } from 'semantic-ui-react'
import moment from 'moment';
import 'moment/locale/ko'

export default class MentionList extends Component {
    render() {
        return (
            <>
            <Header as='h2' style={{
                margin: 0,
                padding: '20px 35px',
                textAlign: this.props.align
            }}>
                <Image circular src='https://react.semantic-ui.com/images/avatar/large/patrick.png' />
                <Header.Content style={{
                    margin: 0,
                    fontSize:'1.3rem'
                }}>
                    {this.props.comment}
                    <Header.Subheader>
                        {this.props.name} 
                        <div style={{
                            fontSize:'11px'
                        }}>
                            {moment(this.props.created).locale("ko").fromNow()}
                            <Label circular color='red' key='red' style={{
                                fontSize:'5px'
                            }}>
                                {this.props.badge}
                            </Label>
                        </div>
                    </Header.Subheader>
                </Header.Content>
            </Header>
            </>
        )
    }
}
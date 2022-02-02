import React, { Component, useState } from 'react'
import { Icon, Menu, Grid ,Segment } from 'semantic-ui-react'
import { useRouter } from 'next/router'

export default function Menus () {

  const router = useRouter()
  const [active, setActive] = useState('address');

  var handleItemClick = (e, { name }) => {
    let icons = e.target.parentNode.parentNode.parentNode.getElementsByTagName('i');
    Object.keys(icons).forEach((k) => {
      icons[k].classList.add('grey');
    })
    e.target.classList.remove('grey');

    switch (e.target.className.split(' ')[0]) {
      case 'address' :
        router.push('/');
        break;
      case 'comment' :
        router.push('/rooms');
        break;
        default :
      break;
    }
  }

  return (
    <Grid columns='equal' divided inverted padded>
      <Grid.Row color='black' textAlign='center'>
        <Grid.Column>
          <Segment color='black' inverted>
              <Icon name='address book' size='huge'
              color='grey' style={{ cursor:"pointer" }}
              className={router.pathname == '/' ? 'active_menu' : ''}
              onClick={handleItemClick}
              />
          </Segment>
        </Grid.Column>
        <Grid.Column>
          <Segment color='black' inverted>
              <Icon name='comment' size='huge' 
              color='grey' style={{ cursor:"pointer" }}
              className={router.pathname == '/rooms' ? 'active_menu' : ''}
              onClick={handleItemClick}
              />
          </Segment>
        </Grid.Column>
        <Grid.Column>
          <Segment color='black' inverted>
              <Icon name='ellipsis horizontal' size='huge' 
              color='grey' 
              className={router.pathname == '/mention/[rid]' ? 'active_menu' : ''}
              />
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
      
}
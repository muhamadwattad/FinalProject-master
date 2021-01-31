import { APILINK, HEADERBUTTONCOLOR, } from '../URL';
import { Body, Button, Container, Content, Header, Icon, Left, List, ListItem, Right, Text as Text2, Thumbnail } from 'native-base';
import React, { Component } from 'react'
import { Text, View } from 'react-native'

import AccountSettings from '../DefaultPages/AccountSettings';
import AppSettings from '../DefaultPages/AppSettings';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
class SettingsPage extends Component {
  render() {
    return (
      <Container>




        <Header style={{ backgroundColor: 'white' }}>

          <Right style={{ flex: 1 }} >

            <Button onPress={() => {
              this.props.navigation.toggleDrawer();


            }} style={{ backgroundColor: 'white', color: 'blue', flex: 1 }} transparent >
              {/* <Icon type="SimpleLineIcons" name="menu" size={30} color={HEADERBUTTONCOLOR} /> */}
              <MaterialCommunityIcons name="menu" size={30} color={HEADERBUTTONCOLOR} />
            </Button>
          </Right>





        </Header>
        <Content>
          <List>
            <ListItem button={true}>
              <Left>
                <Text2>הגדרות אפליקציה</Text2>
              </Left>
              <Right>
                <Icon name="arrow-back" style={{ color: HEADERBUTTONCOLOR }}
                  onPress={() => {
                    this.props.navigation.navigate("AppSettings");
                  }}
                />
              </Right>
            </ListItem>
            <ListItem>
              <Left>
                <Text2>הגדרות חשבון</Text2>
              </Left>
              <Right>
                <Icon name="arrow-back" style={{ color: HEADERBUTTONCOLOR }}
                onPress={() =>{
                  this.props.navigation.navigate("AccountSettings");
                }}
                />
              </Right>
            </ListItem>
          
          </List>
        </Content>
      </Container>
    )
  }
}


export default class SettingsForm extends Component {
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="SettingsMain" component={SettingsPage} options={{ headerShown: false }} />
        <Stack.Screen name="AppSettings" component={AppSettings} options={{
          headerShown: false, title: '',
          

        }} />
        <Stack.Screen name="AccountSettings" component={AccountSettings} options={{
          headerShown: false, title: '',



        }} />
      </Stack.Navigator>
    )
  }
}

import { Body, Button, Container, Content, Header, Icon, Left, List, ListItem, Right, Text as Text2, Thumbnail } from 'native-base';
import React, { Component } from 'react'
import { Text, View } from 'react-native'

import { APILINK } from '../URL'
import AwesomeAlert from 'react-native-awesome-alerts';
import { Dimensions } from 'react-native';
import { HEADERBUTTONCOLOR } from '../URL';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import SortByDateTab from '../DefaultPages/SortByDateTab';
import SortByLocationTab from '../DefaultPages/SortByLocationTab';
import SortByTeamsTab from '../DefaultPages/SortByTeamsTab';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import moment from 'moment'

const Tab = createBottomTabNavigator();
export default class MoreStadium extends Component {
  render() {
    return (
      <Tab.Navigator>
        <Tab.Screen name="קבוצות" component={SortByTeamsTab} 
        options={{
          tabBarIcon:({color,size})=>(
            <Icon name="team" type="AntDesign" />
          )
        }}
        
        
        
        
        />
        <Tab.Screen name="משחקים" component={SortByDateTab}options={{
          tabBarIcon:({color,size})=>(
            <Icon name="time" type="Ionicons" />
          )
        }} />
        <Tab.Screen name="מיקום" component={SortByLocationTab} 
        
        options={{
          tabBarIcon:({color,size})=>(
            <Icon name="location-pin" type="Entypo" />
          )
        }}
        />
      </Tab.Navigator>



    )
  }
}

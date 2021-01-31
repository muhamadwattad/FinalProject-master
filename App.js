import * as Font from "expo-font";

import { AppState, AsyncStorage, BackHandler, StyleSheet, Text, View, } from 'react-native';
import { Button, Icon } from 'native-base';

import { APILINK } from './Pages/URL'
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import StackPage from './Pages/ScreensPages/StackPage';
import { StatusBar } from 'expo-status-bar';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState
    }
  }
  render() {
    return (

      <StackPage />
    )
  }
  async componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);


  }
  async UNSAFE_componentWillMount() {
    //LOADING FONT
    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      ...Ionicons.font,
    });

    //SAVING STADIUMS IN ASYNC STORAGE
    await fetch("http://wattad.up2app.co.il/getstadiums").then((resp) => {
      return resp.json();
    }).then(async (data) => {
      if ('Message' in data) {

      } else {
        var stadiums = data;
        
        await AsyncStorage.setItem("stadiums", JSON.stringify(data));
      }
    })

    //SAVING TEAMS IN ASYNC STORAGE
    await fetch("http://wattad.up2app.co.il/getteams").then((resp) => {
      ``
      return resp.json();
    }).then(async (data) => {
      if ('Message' in data) {

      }
      else {
        await AsyncStorage.setItem("teams", JSON.stringify(data));
      }
    })
  }
  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

    //getting teams and saving them into the AsyncStorage

    var teams = await AsyncStorage.getItem("teams");
    while (teams == null) {

      var url = APILINK + "getteams/"
      
      await fetch(url).then((resp) => {
        return resp.json();
      }).then(async (data) => {

        await AsyncStorage.setItem("teams", JSON.stringify(data));
      })
      teams = await AsyncStorage.getItem("teams");
    }
  }
  _handleAppStateChange = async (nextAppState) => {
    //CHECKING IF USER IS ON OR NOT AND UPDATING IT ON DATABASE!

    if (nextAppState == 'background') { // user went to background

      //getting user to update his online status
      var user = await AsyncStorage.getItem("activeuser");

      if (user != null) {
        //parsing the user to object
        var currentuser = JSON.parse(user);
        var url = APILINK + "updateStatus/" + currentuser.email + "/false/" //updating his online status to offline

        await fetch(url);
      }
    }
    if (nextAppState == 'active') { // user is active on the app
      //getting user to update his online status
      var user = await AsyncStorage.getItem("activeuser");
      if (user != null) {
        //parsing the user to object
        var currentuser = JSON.parse(user);
        var url = APILINK + "updateStatus/" + currentuser.email + "/true/" //updating his online status to online
        await fetch(url);
      }
    }
    this.setState({ appState: nextAppState }, () => {
      
    });

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { AsyncStorage, BackHandler, StyleSheet, Text, View } from 'react-native';
import { Button, Icon } from 'native-base';
import React, { Component } from 'react';

import AdminHomePage from '../AdminPages/AdminHomePage';
import LoginPage from '../DefaultPages/LoginPage';
import MainDrawerPage from './MainDrawerPage';
import { NavigationContainer } from '@react-navigation/native';
import SignupPage from '../DefaultPages/SignupPage';
import { createStackNavigator } from '@react-navigation/stack';
import ForgetPassword from '../DefaultPages/ForgetPassword';

const Stack = createStackNavigator();






export default class StackPage extends Component {
  render() {
    return (

      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginPage}
            options={{
              title: "Login",
              headerShown: false,
            }}
          />
          <Stack.Screen name="DefaultPages" component={MainDrawerPage}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen name="Signup" component={SignupPage}
            options={{
              headerShown: true,
              title: '',


            }}
          />
          <Stack.Screen name="AdminHome" component={AdminHomePage}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen name="ForgetPage" component={ForgetPassword}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>

    );
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

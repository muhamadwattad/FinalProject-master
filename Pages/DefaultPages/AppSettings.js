import * as LocalAuthentication from 'expo-local-authentication';

import { APILINK, HEADERBUTTONCOLOR } from '../URL'
import { Animated, AsyncStorage, FlatList, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Image } from 'react-native'
import { Body, Button, Container, Content, Header, Icon, Left, List, ListItem, Right, Root, Text as Text2, Thumbnail, Toast } from 'native-base';
import React, { Component } from 'react'
import AwesomeAlert from 'react-native-awesome-alerts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FavoriteTeamsList from './FavoriteTeamsList';

export default class AppSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dontload: false,
      notfication: true,
      autologin: true,
      loginfinger: false,
      showmodal: false,
      showmessage: false,
      message: '',
      errormsg: 'מעדכן את הסטטוס ... '
    };

  }

  async componentDidMount() {
    //GETTING STUFF FROM ASYNC STORAGE AND API

    //GETTING AUTOLOGIN
    var autologin = await AsyncStorage.getItem("autologin");

    if (autologin == null || autologin == "True" || autologin == undefined) {

      this.setState({ autologin: true });
    }
    else {
      this.setState({ autologin: false });
    }

    //GETTING FINGERPRINTS
    var loginfinger = await AsyncStorage.getItem("loginfinger");
    if (loginfinger == "True") {
      this.setState({ loginfinger: true });
    }
    else {
      this.setState({ loginfinger: false });
    }
    var user = await AsyncStorage.getItem("activeuser");
    var currentuser = JSON.parse(user);
    //Getting Notification Status
    await fetch(APILINK + "getnotificationstatus/" + currentuser.email + "/").then((resp) => {
      return resp.json();
    }).then((data) => {

      if (data == false) {
        this.setState({ notfication: false })
      }
    })

  }

  setAutoLogin = async () => {
    //GETTING THE CURRENT STATE OF AUTOLOGIN
    var autologin = !this.state.autologin;
    console.log(autologin);
    //SAVING IN ASYNC STORAGE
    await AsyncStorage.setItem("autologin", autologin == true ? "True" : "False");
    this.setState({ autologin: autologin });
  }

  setFingerPrintsLogin = async () => {
    //SETTING FINGERPRINTS ON ASYNCSTORAGE
    var loginfinger = !this.state.loginfinger;
    if (loginfinger == true) {
      let result = await LocalAuthentication.hasHardwareAsync();

      if (result == true) {
        await AsyncStorage.setItem("loginfinger", loginfinger == true ? "True" : "False");
        var res = await AsyncStorage.getItem("loginfinger")
        console.log("TEST FROM ASYNC: " + res)
        this.setState({ loginfinger });
      }
      else {
        //TODO SHOW ERROR THAT CANT ENABLE BECAUSE PHONE DOESNT SUPPORT
        alert("PHONE DOESNT SUPPORT");
        await AsyncStorage.setItem("loginfinger", "False");
        var res = await AsyncStorage.getItem("loginfinger")
        console.log("TEST FROM ASYNC: " + res);
        this.setState({ loginfinger: false });
      }

    }
    else {

      await AsyncStorage.setItem("loginfinger", "False");
      var res = await AsyncStorage.getItem("loginfinger")
      console.log("TEST FROM ASYNC: " + res);
      this.setState({ loginfinger });
    }
  }
  setNotification = async () => {

    this.setState({ dontload: true });
    var notfication = !this.state.notfication;
    var user = await AsyncStorage.getItem("activeuser");
    var currentuser = await JSON.parse(user);
    var statustosend;
    statustosend = (notfication) ? "True" : "False";
    await fetch(APILINK + "updateNotification/" + currentuser.email + "/" + statustosend + "/")
      .then((resp) => {
        return resp.json();
      }).then((data) => {
        if (data.hasOwnProperty("Message")) {
          this.setState({ dontload: false, message: 'אירעה שגיאה בניסיון לשנות את הסטטוס, אנא נסה שוב.', showmessage: true })
        }
        else {
          this.setState({ dontload: false, notfication, message: 'הסטטוס השתנה בהצלחה.', showmessage: true });
        }
      });
  }

  render() {
    if (this.state.dontload) {
      return (
        <Container>

          <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'smoke', height: '100%' }} >
            <Image source={require('../../assets/loading.gif')} style={{ width: 100, height: 100 }} />
            <Text style={{ fontSize: 25 }}>{this.state.errormsg}</Text>
          </View>
        </Container>
      )
    }
    return (

      <Container>
        <Header style={{ backgroundColor: 'white' }}>

          <Right style={{ flex: 1 }} >

            <Button onPress={() => {
              this.props.navigation.goBack();


            }} style={{ backgroundColor: 'white', color: 'blue', flex: 1 }} transparent >
              {/* <Icon type="SimpleLineIcons" name="menu" size={30} color={HEADERBUTTONCOLOR} /> */}
              <MaterialCommunityIcons name="arrow-right" size={30} color={HEADERBUTTONCOLOR} />
            </Button>
          </Right>

        </Header>
        <Content scrollEnabled >


          <AwesomeAlert
            show={this.state.showmessage}
            showProgress={false}
            title="הודעה"
            message={this.state.message}
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={false}
            showConfirmButton={true}
            cancelText="No, cancel"
            confirmText="לְהַמשִׁיך"
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              this.setState({ showmessage: false })
            }}
            onConfirmPressed={() => {
              this.setState({ showmessage: false })
            }}
          />



          {/* Notifications */}
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#FD4133" }}>
                <Icon active name="notifications" />
              </Button>

            </Left>
            <Body>
              <Text2> התראות</Text2>
            </Body>
            <Right>

              <Switch
                onValueChange={this.setNotification}

                value={this.state.notfication}
              />

            </Right>
          </ListItem>
          {/* AutoLogin */}
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#32CD32" }}>
                <Icon active name="login" type="MaterialCommunityIcons" />
              </Button>

            </Left>
            <Body>

              <Text2>כניסה אוטומטית</Text2>
            </Body>
            <Right>

              <Switch
                onValueChange={this.setAutoLogin}
                value={this.state.autologin}
              />
            </Right>
          </ListItem>
          {/* FingerPrints */}
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }}>
                <Icon active name="finger-print" />
              </Button>

            </Left>
            <Body>

              <Text2>כניסה עם טביעות אצבע</Text2>
            </Body>
            <Right>

              <Switch
                onValueChange={this.setFingerPrintsLogin}
                value={this.state.loginfinger}
              />
            </Right>
          </ListItem>
          <ListItem icon >
            <Left>
              <Button style={{ backgroundColor: 'pink' }}>
                <Icon active name="team" type="AntDesign" />
              </Button>

            </Left>
            <Body>

              <Text2>הקבוצות המועדפות עלי</Text2>
            </Body>
            <Right>

              <Icon name="arrow-back" style={{ color: HEADERBUTTONCOLOR, fontSize: 25 }}
                onPress={() => this.setState({ showmodal: true })}
              />

            </Right>
          </ListItem>
          <Modal
            visible={this.state.showmodal}

          >
            <Container>
              <Header style={{ backgroundColor: "white" }}>
                <Right style={{ flex: 1, backgroundColor: "white" }}>
                  <Button
                    transparent
                    onPress={() => {
                      this.setState({ showmodal: false });
                    }}
                    style={{ backgroundColor: "white", color: "blue", flex: 1 }}
                    transparent
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={30}
                      color={HEADERBUTTONCOLOR}
                    />
                  </Button>
                </Right>
              </Header>
              <Content >
                <FavoriteTeamsList />
              </Content>
            </Container>
          </Modal>
        </Content>
      </Container >

    )
  }
}

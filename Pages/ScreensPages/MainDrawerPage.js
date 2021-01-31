import * as ImagePicker from 'expo-image-picker';

import { AsyncStorage, Modal, View } from "react-native";
import {
  Body,
  Button,
  Container,
  Content,
  Footer,
  H3,
  Header,
  Icon,
  Left,
  List,
  ListItem,
  Right,
  Switch,
  Text,
  Thumbnail,
} from "native-base";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import { HEADERBUTTONCOLOR, URLOFFILE } from "../URL";
import React, { Component } from "react";

import Animated from "react-native-reanimated";
import AwesomeAlert from 'react-native-awesome-alerts';
import { DrawerActions } from "@react-navigation/native";
import HelpPage from "../DefaultPages/HelpPage";
import HomePage from "../DefaultPages/HomePage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MoreStadium from "./MoreStadium";
import { NavigationContainer } from "@react-navigation/native";
import SettingsForm from './SettingsPageScreen'
import StadiumSearch from "../DefaultPages/StadiumSearch";
import { TouchableOpacity } from "react-native-gesture-handler";
import TwoTeamsGame from "../DefaultPages/TwoTeamsGame";

const Drawer = createDrawerNavigator();

//Drawer Class
export default class MainDrawerPage extends Component {
  render() {
    return (
      <Drawer.Navigator
        drawerPosition="right"
        overlayColor="grey"
        drawerType="slide"
        drawerContentOptions={{
          activeBackgroundColor: "#cdf8cd",
        }}
        drawerContent={(props) => <Sidebar {...props} />}
      >
        <Drawer.Screen
          name="Home"
          title="בית"
          component={HomePage}
          options={{
            drawerIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons
                name="home"
                style={{ fontSize: size, color: color }}
              />
            ),
            title: "בית",
          }}
        />
        <Drawer.Screen
          name="TwoTeams"
          title="משחק בין שתי קבוצות"
          component={TwoTeamsGame}
          options={{
            drawerIcon: ({ focused, color, size }) => (
              <Icon
                name="team"
                type="AntDesign"
                style={{ fontSize: size, color: color }}
              />
              // <MaterialCommunityIcons name='home' style={{ fontSize: size, color: color }} />
            ),
            title: "משחק בין שתי קבוצות",
          }}
        />
        <Drawer.Screen
          name="StadiumSearch"
          title="חיפוש אצטדיון"
          component={StadiumSearch}
          options={{
            drawerIcon: ({ focused, color, size }) => (
              <Icon
                name="stadium-variant"
                type="MaterialCommunityIcons"
                style={{ fontSize: size, color: color }}
              />
              // <MaterialCommunityIcons name='home' style={{ fontSize: size, color: color }} />
            ),
            title: "חיפוש אצטדיון",
          }}
        />

        <Drawer.Screen
          name="MoreStadium"
          title="אצטדיון פלוס"
          component={MoreStadium}
          options={{
            drawerIcon: ({ focused, color, size }) => (
              <Icon
                name="soccer-field"
                type="MaterialCommunityIcons"
                style={{ fontSize: size, color: color }}
              />
              // <MaterialCommunityIcons name='home' style={{ fontSize: size, color: color }} />
            ),
            title: "אצטדיון פלוס",
          }}
        />

        <Drawer.Screen
          name="Settings"
          title="הגדרות"
          component={SettingsForm}
          options={{
            drawerIcon: ({ focused, color, size }) => (
              <Icon
                name="settings"
                type="MaterialCommunityIcons"
                style={{ fontSize: size, color: color }}
              />
              // <MaterialCommunityIcons name='home' style={{ fontSize: size, color: color }} />
            ),
            title: "הגדרות",
          }}
        />
        <Drawer.Screen
          name="Help"
          title="עזרה"
          component={HelpPage}
          options={{
            drawerIcon: ({ focused, color, size }) => (
              <Icon
                name="help"
                type="MaterialCommunityIcons"
                style={{ fontSize: size, color: color }}
              />
              // <MaterialCommunityIcons name='home' style={{ fontSize: size, color: color }} />
            ),
            title: "עזרה",
          }}
        />
      </Drawer.Navigator>
    );
  }
}

export class Sidebar extends Component {
  constructor(progress, ...props) {
    super(...props);
    this.progress = progress;
    this.imgurl = "https://static.thenounproject.com/png/340719-200.png";
    this.state = {
      username: "",
      email: "",
      switch: false,
      background: "white",
      color: "#131313",
      image: "https://static.thenounproject.com/png/340719-200.png",
      showmodal: false
    };
  }

  componentDidMount() {
    this.getData();
  }
  logout = async () => {
    await this.props.navigation.dispatch(DrawerActions.closeDrawer());
    this.setState({ showmodal: true });
  };

  getData = async () => {
    //GETS CURRENT USER
    var user = await AsyncStorage.getItem("activeuser");
    var currentuser = JSON.parse(user);

    //PUTS USERNAME AND EMAIL INSIDE OF DRAWER
    this.setState({ username: currentuser.name, email: currentuser.email });

    //getting user's image
    if (currentuser.image.length < 3) {

      return;
    }
    if (currentuser.image != null) {


      var imageurl = currentuser.image.substr(currentuser.image.length - 3); //getting the last 3 letters from image
      if (imageurl == 'jpg') {
        //getting url of image
        var image = URLOFFILE + currentuser.image;
        console.log(image);
        this.setState({ image });
      }
    }
  };

  PickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      //allowsEditing: true,
      //aspect: [4, 3],
    });
    if (!result.cancelled) {
      console.log(result.uri);
    }
  }
  render() {
    return (
      <Container
        style={{
          backgroundColor: this.state.background,
          color: this.state.color,
        }}
      >
        <Header
          style={{
            backgroundColor: this.state.background,


          }}
        >
          <Right>
            <Button
              transparent
              style={{ backgroundColor: this.state.background }}
              onPress={() => {
                this.props.navigation.dispatch(DrawerActions.closeDrawer());
              }}
            >
              <Icon
                name="menu"
                style={{ color: "#228B22" }}
                onPress={() => { this.props.navigation.dispatch(DrawerActions.closeDrawer()); }}
              />
            </Button>
          </Right>
        </Header>
        <Content>
          <AwesomeAlert
            show={this.state.showmodal}
            showProgress={false}
            title="אישור התנתקות"
            message="האפליקציה תבקש להזין את המידע שלך שוב."
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="לא"
            confirmText="כן"
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              this.setState({ showmodal: false })
            }}
            onConfirmPressed={async () => {
              //Logging out
              //Removing user and his settings
              await AsyncStorage.removeItem("activeuser");
              this.setState({ showmodal: false }, () => {
                this.props.navigation.navigate("Login");
              })
            }}
          />
          <ListItem
            thumbnail
            style={{ backgroundColor: this.state.background, height: 135, borderBottomWidth: 1, borderBottomColor: 'black' }}
          >
            <Left
              style={{
                backgroundColor: this.state.background,
                color: this.state.color,
              }}
            >

              <Thumbnail
                source={{ uri: this.state.image }}

              ></Thumbnail>

            </Left>
            <Body style={{ marginRight: 10, justifyContent: 'center', borderWidth: 0 }}>
              <H3 style={{ color: this.state.color }}>{this.state.username}</H3>
              <Text note style={{ color: this.state.color, width: '100%' }}>
                {this.state.email}
              </Text>
            </Body>
          </ListItem>
          <DrawerContentScrollView {...this.props}>
            <Animated.View style={{ transform: [{}] }}>
              <DrawerItemList
                {...this.props}
                inactiveTintColor={this.state.color}
              />
            </Animated.View>
          </DrawerContentScrollView>
        </Content>
        <Footer
          style={{
            backgroundColor: this.state.background,
            borderStartWidth: 1,
            borderTopWidth: 1
          }}
        >
          <Right>
            <Button
              transparent
              style={{ backgroundColor: this.state.background }}
              onPress={async () => {
                this.logout();
              }}
            >
              <MaterialCommunityIcons
                name="account-arrow-left"
                style={{ color: HEADERBUTTONCOLOR, paddingLeft: 15 }}
                size={30}
              ></MaterialCommunityIcons>
            </Button>
          </Right>
        </Footer>
      </Container>
    );
  }
}

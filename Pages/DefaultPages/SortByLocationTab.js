import * as Linking from "expo-linking";
import * as Location from "expo-location";

import { APILINK, HEADERBUTTONCOLOR, RANDOMIMAGEURL } from "../URL";
import {
  ActivityIndicator,
  AsyncStorage,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  Text,
  View,
} from "react-native";
import {
  Body,
  Button,
  Card,
  CardItem,
  Container,
  Content,
  Header,
  Icon,
  Input,
  Item,
  Left,
  List,
  ListItem,
  Picker,
  Right,
  Text as Text2,
  Thumbnail,
} from "native-base";
import React, { Component } from "react";
import { getDistance, getPreciseDistance } from "geolib";

import AwesomeAlert from "react-native-awesome-alerts";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Spinner from "react-native-loading-spinner-overlay";
import StadiumInfo from './StadiumInfo'

export default class SortByLocationTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dontload: false,
      errormsg: null,
      city: null,
      longitude: 0,
      latitude: 0,
      stadiums: [],
      loading: false,
      refreshing: false,
      showmodal: false,
      rendered: 'focus'
    }
  }


  sortstadiums = async () => {
    if (this.state.stadiums == null || this.state.stadiums.length == 0) {
      return;
    }
    else {
      let stadiums = this.state.stadiums.reverse();
      this.setState({ stadiums });
    }
  }


  getUserLocation = async () => {
    //showing loading Logo
    this.setState({ loading: true })
    //checking if user has location enabled
    let { status } = await Location.requestPermissionsAsync();

    if (status != "granted") { // if user has location not granted Error screen will be shown
      this.setState({ loading: false, dontload: true, errormsg: "NEED LOCATION PERMISSION" });
      return;
    }
    else {
      try {
        //getting user's coords
        let location = await Location.getCurrentPositionAsync({});

        if (location != null) {

          let longitude = location.coords.longitude;
          let latitude = location.coords.latitude;
          this.setState({ longitude, latitude });
          //reversing location coords to object with city, country etc...
          let reverseGC = await Location.reverseGeocodeAsync(location.coords);

          if ( //checking if failed to get city
            reverseGC[0].city == null ||
            reverseGC[0].city == undefined ||
            reverseGC[0].city.length == 0
          ) { //showing error
            this.setState({ loading: false, errormsg: "FAILED TO GET CITY", dontload: true });
            return;
          } else {

            this.setState({ city: reverseGC[0].city }, () => this.getStadiums());
          }
        }
        else { // failed to get location, showing error screen.
          this.setState({ loading: false, errormsg: "FAILED TO GET LOCATION", dontload: true });
          return;
        }
      }
      catch (e) { //failed to get location, showing error screen.
        this.setState({ loading: false, dontload: true, errormsg: "NEED LOCATION PERMISSION" });
        return;
      }
    }
  }

  getStadiums = async () => {

    this.setState({ loading: true }, async () => {
      console.log("Came into here blyat")
      //GETTING STADIUM FROM ASYNC STORAGE , IF NOT EXIST TAKE THEM FROM API
      let stadiums = await AsyncStorage.getItem("stadiums");

      if (stadiums == null || stadiums.length == 0 || stadiums == undefined) {
        await fetch(APILINK + "getstadiums/").then((resp) => {
          return resp.json();
        }).then(async (data) => {
          if ('Message' in data) {
            this.setState({ errormsg: "Failed to get stadiums", dontload: true });
            return;
          }
          else {
            this.setState({ stadiums: data });
            await AsyncStorage.setItem("stadiums", JSON.stringify(stadiums));
            stadiums = data;
          }
        })
      }
      else
        stadiums = await JSON.parse(stadiums);

      //GETTING LONG AND LAT OF STADIUMS AND CALCULATING THE DISTANCE BETWEEN USER'S LOCATION AND STADIUM

      for (let i = 0; i < stadiums.length; i++) {
        var LongLatLocation = await Location.geocodeAsync(stadiums[i].venue_hebrew_name);
        stadiums[i].latitude = LongLatLocation[0].latitude;
        stadiums[i].longitude = LongLatLocation[0].longitude;
        let x = await getPreciseDistance({ latitude: this.state.latitude, longitude: this.state.longitude }, { latitude: LongLatLocation[0].latitude, longitude: LongLatLocation[0].longitude });
        stadiums[i].distance = x / 1000;
      }

      //SORTING THE ARRAY FROM CLOSE TO FAR BY DISTANCE
      await stadiums.sort((a, b) => a.distance === b.distance ? 0 : a.distance > b.distance || -1);
      this.setState({ stadiums, loading: false, dontload: false }, () => console.log(this.state.stadiums));

    });




  }
  componentWillUnmount() {
    this._unsubscribeFocus();
    this._unsubscribeBlur();

  }
  loadData = async () => {
    console.log("CAME HERE");

    //GETTING USER's LOCATION AND SAVING THEM INTO STATE.

    await this.getUserLocation();
  }
  componentDidMount() {
    this._unsubscribeFocus = this.props.navigation.addListener('focus', (payload) => {
      console.log('will focus');

    });
    this._unsubscribeBlur = this.props.navigation.addListener('blur', (payload) => {
      console.log('will blur')
      this.setState({ loading: false });
    });
    this.loadData();
  }
  render() {

    if (this.state.dontload == true) {
      return (
        <Container>
          <Header style={{ backgroundColor: "white" }}>
            <Right style={{ flex: 1 }}>
              <Button
                onPress={() => {
                  this.props.navigation.toggleDrawer();
                }}
                style={{ backgroundColor: "white", color: "blue", flex: 1 }}
                transparent
              >
                {/* <Icon type="SimpleLineIcons" name="menu" size={30} color={HEADERBUTTONCOLOR} /> */}
                <MaterialCommunityIcons
                  name="menu"
                  size={30}
                  color={HEADERBUTTONCOLOR}
                />
              </Button>
            </Right>

          </Header>
          {
            this.state.loading == true ? <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'smoke', height: '100%' }} >
              <Image source={require('../../assets/loading.gif')} style={{ width: 100, height: 100 }} /><Text2>מקבל נתונים, זה ייקח כמה שניות..</Text2>
            </View> : <View></View>
          }
          <Content>


            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: '50%' }}>
              <Text2 style={{ textAlign: 'center', alignItems: 'center', fontSize: 30, }}> כדי להשתמש בעמוד זה יש להפעיל את שירות מיקום</Text2>
              <Button bordered dark style={{ marginTop: 12, alignSelf: 'center' }} onPress={async () => {

                this.getUserLocation();



              }}>
                <Text2 > אפשר שירותי מיקום</Text2>
              </Button>
            </View>
          </Content>
        </Container>
      )
    } else {
      return (
        <Container>
          <Header style={{ backgroundColor: "white" }}>
            <Right style={{ flex: 1 }}>
              <Button
                onPress={() => {
                  this.props.navigation.toggleDrawer();
                }}
                style={{ backgroundColor: "white", color: "blue", flex: 1 }}
                transparent
              >
                {/* <Icon type="SimpleLineIcons" name="menu" size={30} color={HEADERBUTTONCOLOR} /> */}
                <MaterialCommunityIcons
                  name="menu"
                  size={30}
                  color={HEADERBUTTONCOLOR}
                />
              </Button>


            </Right>

            <Body style={{ flex: 0.8, }}>
              <Button transparent style={{ backgroundColor: "white", color: "blue", width: '100%' }}>
                <MaterialCommunityIcons
                  name="refresh"
                  size={30}
                  color={HEADERBUTTONCOLOR}
                  onPress={() => {
                    this.getUserLocation();
                  }}
                />
              </Button>
            </Body>
            <Left>
              <Button transparent style={{ backgroundColor: "white", color: "blue", flex: 0.3 }}
                onPress={this.sortstadiums}
              >
                <MaterialCommunityIcons
                  name="sort"
                  size={30}
                  color={HEADERBUTTONCOLOR}
                />
              </Button>
            </Left>
          </Header>

          {
            this.state.loading == true ? <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'smoke', height: '100%' }} >
              <Image source={require('../../assets/loading.gif')} style={{ width: 100, height: 100 }} /><Text>מקבל נתונים, זה ייקח כמה שניות...</Text>
            </View> : <View></View>
          }
          <Content >
            <Modal visible={this.state.showmodal} animationType="slide" style={{ height: 150, width: '100%' }}>
              <Header style={{ backgroundColor: "white" }}>
                <Right style={{ flex: 1 }}>
                  <Button
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

              <StadiumInfo stadium={this.state.stadium} />

            </Modal>


            {this.state.stadiums == null || this.state.stadiums.length == 0 ? <Text>HI</Text> :
              <List

              >
                {
                  this.state.stadiums.map((stadium, index) => {
                    var stadiumImageUrl = stadium.venue_name;
                    stadiumImageUrl = stadiumImageUrl.replace(/ /g, '');
                    stadiumImageUrl = APILINK + "stadiumimages/" + stadiumImageUrl + ".jpg"

                    return (
                      <ListItem thumbnail style={{ margin: 3 }} key={index.toString()}>
                        <Left>
                          <Thumbnail square source={{ uri: stadiumImageUrl }} />
                        </Left>
                        <Body>
                          <Text2>{stadium.venue_hebrew_name}</Text2>
                          <Text2 note numberOfLines={1}>{stadium.venue_hebrew_city}</Text2>
                          <Text2 note>{stadium.distance} ק"מ</Text2>
                        </Body>
                        <Right>
                          <Button transparent onPress={() => this.setState({ stadium, showmodal: true })}>
                            <Text2>עוד</Text2>
                          </Button>
                        </Right>
                      </ListItem>
                    )
                  })}
              </List>
            }


          </Content>
        </Container>
      )
    }

  }
}

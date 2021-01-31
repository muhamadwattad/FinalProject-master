import * as Font from "expo-font";
import * as Linking from "expo-linking";
import * as Location from "expo-location";

import { APILINK, HEADERBUTTONCOLOR } from "../URL";
import {
  ActivityIndicator,
  AsyncStorage,
  FlatList,
  Image,
  Modal,
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
  H2,
  H3,
  H4,
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
import StadiumMap from "./StadiumMap";

export default class StadiumSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stadiums: [],
      search: "מיקים",
      locations: [],
      test: "",
      x: null,
      t: null,
      showmodal: false,
      haslocation: true,
      error: "בחר במיקום או השתמש במיקום שלך.",
      reloading: false,
      showError: false
    };
  }
  getlocation = async () => {
    this.setState({ reloading: true, search: "NO",haslocation:true });
    let { status } = await Location.requestPermissionsAsync();

    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied",
      });
    }
    try {
      let location = await Location.getCurrentPositionAsync({});

      if (location) {
        let reverseGC = await Location.reverseGeocodeAsync(location.coords);
        console.log(reverseGC);
        if (
          reverseGC[0].city == null ||
          reverseGC[0].city == undefined ||
          reverseGC[0].city.length == 0
        ) {
          //TODO SHOW ERROR
        } else {
          this.setState({ search: reverseGC[0].city }, () => this.getstadiums());
        }
      }
      else {
        this.setState({ haslocation: false });
      }
    }
    catch (ex) {
      this.setState({ haslocation: false });
    }
  };

  async UNSAFE_componentWillMount() {
    this.setState({ reloading: true });
    //CHECKING IF USER HAS LOCATION ENABLED OR NO
    var Answer = await Location.hasServicesEnabledAsync();


    if (Answer == false) {
      try {
        var location = await Location.getCurrentPositionAsync();
        console.log("LOCATION IS : " + location);
        if (status != "granted") {
          this.setState({ haslocation: false });
        }
        else {
          this.setState({ haslocation: true });
        }
      }
      catch (e) {
        this.setState({ haslocation: false, error: "אפשר שירותי מיקום כדי להשתמש בדף." })
      }

    }

    //CHECKING IF LOCATIONS OF STADIUMS ARE ALREADY IN LOCAL STORAGE

    var locations = JSON.parse(await AsyncStorage.getItem("locations"));
    //GETTING  STADIUM LOCATIONS FROM API

    if (locations == null || locations == undefined) {
      var url = APILINK + "getstadiumslocations/";

      await fetch(url)
        .then((resp) => {
          return resp.json();
        })
        .then(async (data) => {
          if ("Message" in data) {
            this.setState({ locations: "ERROR", reloading: false });
          } else {
            this.setState(
              { locations: data, reloading: false },
              async () =>
                await AsyncStorage.setItem("locations", JSON.stringify(data))
            );
          }
        });
    } else {
      this.setState({ reloading: false });
      this.setState({ locations }, () => this.setState({ reloading: false }));
    }
  }


  getstadiums = async () => {
    this.setState({ reloading: true });
    if (this.state.search == "NO") {
      //TODO SHOW ERROR MESSAGE
      this.setState({ error: "בחר במיקום או השתמש במיקום שלך.", reloading: false, showError: true });
      return;
    }
    let { status } = await Location.requestPermissionsAsync();
    if (status != "granted") {
      this.setState({ haslocation: false, reloading: false });
      return;
    }

    if (this.state.search == "Tel Aviv-Yafo")
      this.setState({ search: "tel aviv" });

    var url = APILINK + "getstadiumsbylocation/" + this.state.search;
    console.log(url);
    await fetch(url)
      .then((resp) => {
        return resp.json();
      })
      .then(async (data) => {
        console.log(data);
        if ("Message" in data) {
          this.setState({
            error: "לא נמצאו אצטדיונים במיקום זה",
            stadiums: [],
            reloading: false,
            showError: true
          });
        } else {
          for (var i = 0; i < data.length; i++) {
            var Address = data[i].venue_hebrew_name;
            var newArray = [];
            var LongLatLocation = await Location.geocodeAsync(Address);
            data[i].latitude = LongLatLocation[0].latitude;
            data[i].longitude = LongLatLocation[0].longitude;
          }
          this.setState({ stadiums: data, reloading: false, search: "NO" });
        }
      });
    this.setState({ reloading: false, search: "NO" });
  };

  openwaze = async (long, lat) => {
    //GETTING LONG AND LAT FROM API AND OPENING WAZE SO USER CAN GO THERE

    var url = `https://waze.com/ul?ll=${lat},${long}&navigate=yes`;
    Linking.openURL(url);
  };



  render() {
    if (this.state.haslocation == true) {
      return (
        <Container>
          <Header style={{ backgroundColor: "white" }} searchBar rounded>
            <Item>
              <Icon
                name="menu"
                style={{ color: HEADERBUTTONCOLOR, fontSize: 30 }}
                onPress={() => this.props.navigation.toggleDrawer()}
              />
              <Icon name="ios-search" onPress={this.getstadiums} />
              <Picker
                mode="dialog"
                placeholder="מיקום"
                selectedValue={this.state.search}
                onValueChange={(value) => this.setState({ search: value })}
              >
                <Picker.Item label="מיקום" value="NO" />
                {this.state.locations.length == 0 ||
                  this.state.locations == null ||
                  this.state.locations == "ERROR" ? (
                    <Picker.Item label="NO" value="NO" key={999} />
                  ) : (
                    this.state.locations.map((location, index) => {
                      return (
                        <Picker.Item
                          label={location.location_hebrew}
                          value={location.location_hebrew}
                          key={index}
                        />
                      );
                    })
                  )}
              </Picker>
              <Icon
                name="location-pin"
                type="Entypo"
                onPress={this.getlocation}
              />
            </Item>
          </Header>

          {this.state.reloading ? <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'smoke', height: '100%' }} >
            <Image source={require('../../assets/loading.gif')} style={{ width: 100, height: 100 }} /><Text2>מקבל נתונים...</Text2></View> :
            <Content>

              {this.state.stadiums.length == 0 || this.state.stadiums == null ? (
                <View><Text style={{ textAlign: 'center', alignItems: 'center', fontSize: 28, marginTop: '50%' }}>{this.state.error}</Text></View>
              ) : (
                  this.state.stadiums.map((stadium, index) => {
                    var stadiumImageUrl = stadium.venue_name;
                    stadiumImageUrl = stadiumImageUrl.replace(/ /g, '');
                    stadiumImageUrl = APILINK + "stadiumimages/" + stadiumImageUrl + ".jpg"

                    return (
                      <Card key={index}>
                        <CardItem>
                          <Body style={{ width: '100%' }}>
                            <View style={{ width: '100%' }}>
                              <Text2 style={{ textAlign: 'center' }}>{stadium.venue_hebrew_name}</Text2>

                            </View>

                          </Body>
                        </CardItem>
                        <CardItem cardBody>
                          <Image
                            source={{
                              uri:
                                stadiumImageUrl,
                            }}
                            style={{ height: 200, width: null, flex: 1 }}
                          />
                        </CardItem>
                        <CardItem>
                          <Left>
                            <Button
                              transparent
                              onPress={() =>
                                this.setState({
                                  longsend: stadium.longitude,
                                  latsend: stadium.latitude,
                                  titlesend: stadium.venue_hebrew_name,
                                  showmodal: true,
                                })
                              }
                            >
                              <Icon
                                name="map-marked-alt"
                                type="FontAwesome5"
                                style={{ color: "#2307A0" }}
                              />
                              <Text2 style={{ color: "#2307A0" }}>
                                {stadium.venue_hebrew_city}
                              </Text2>
                            </Button>
                          </Left>
                          <Body style={{ marginLeft: 13 }}>
                            <Button transparent>
                              <Icon
                                name="chair"
                                type="FontAwesome5"
                                style={{ color: "#2307A0" }}
                              />
                              <Text2 style={{ color: "#2307A0" }}>
                                {stadium.venue_capacity} מקומות
                          </Text2>
                            </Button>
                          </Body>
                          <Right style={{ marginRight: 15 }}>
                            <MaterialCommunityIcons
                              name="waze"
                              style={{ fontSize: 30, color: "#2307A0" }}
                              onPress={() =>
                                this.openwaze(stadium.longitude, stadium.latitude)
                              }
                            />
                          </Right>
                        </CardItem>
                      </Card>
                    );
                  })
                )}
            </Content>
          }
          <AwesomeAlert
            show={this.state.showError}
            showProgress={false}
            title="שְׁגִיאָה!"
            message={this.state.error}
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={false}
            showConfirmButton={true}
            cancelText="No, cancel"
            confirmText="לְהַמשִׁיך"
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              this.setState({ showError: false })
            }}
            onConfirmPressed={() => {
              this.setState({ showError: false })
            }}
          />

          <Modal visible={this.state.showmodal}>
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
            <StadiumMap
              long={this.state.longsend}
              lat={this.state.latsend}
              title={this.state.titlesend}
            />
          </Modal>
        </Container>
      );
    } else {

      return (
        <Container>
          <Header style={{ backgroundColor: "white" }} searchBar rounded>
            <Item>
              <Icon
                name="menu"
                style={{ color: HEADERBUTTONCOLOR, fontSize: 30 }}
                onPress={() => this.props.navigation.toggleDrawer()}
              />
            </Item>
          </Header>
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',

          }}>
            <Text style={{ fontSize: 25, fontWeight: 'bold', textAlign: 'center' }}>
              אפשר שירותי מיקום לשימוש בדף.
    </Text>
            <View>
              <Button onPress={this.getlocation} info style={{ borderWidth: 1, width: '100%',marginTop:10 }}><Text2 style={{fontWeight:'bold'}}>אפשר שירותי מיקום</Text2></Button>
            </View>
          </View>
        </Container>
      )
    }
  }
}

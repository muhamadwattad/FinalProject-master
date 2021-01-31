import * as Linking from "expo-linking";

import { APILINK, HEADERBUTTONCOLOR, RANDOMIMAGEURL } from "../URL";
import { ActivityIndicator, Dimensions, Image, Modal, Text, View } from 'react-native'
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
import React, { Component } from 'react'

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import StadiumMap from './StadiumMap'

//WIDTH AND HEIGHT OF PHONE WINDOW
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
export default class StadiumInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stadium: null,
      showmodal: false,
      stadiumImage: RANDOMIMAGEURL,
      loading:false
    }
  }
  async UNSAFE_componentWillMount(){
    this.setState({loading:true});
    //TAKING STADIUM INFORMATION FROM PARENT
    let stadium = this.props.stadium;
    console.log(stadium);
    this.setState({ stadium }, async () => {

      //GETTING STADIUM IMAGE LINK

      var stadiumName = this.state.stadium.venue_name;

      stadiumName = stadiumName.replace(/ /g, '');
      var url = APILINK + "stadiumimages/" + stadiumName + ".jpg"
      this.setState({ stadiumImage: url,loading:false })
    });
  }
  
  showmap = async () => {
    //SETTING LONG AND LAT OF STADIUM TO SHOW IT ON MAP
    this.setState({ longsend: this.state.stadium.longitude, latsend: this.state.stadium.latitude, titlesend: this.state.stadium.venue_hebrew_name, showmodal: true });

  }
  openwaze = async (long, lat) => {
    //GETTING LONG AND LAT FROM API AND OPENING WAZE SO USER CAN GO THERE

    var url = `https://waze.com/ul?ll=${lat},${long}&navigate=yes`;
    Linking.openURL(url);
  }
  render() {
    if (this.state.loading == true) 
    return(
      <Content>
      <ActivityIndicator size="large" color="#00ff00" />
      
      </Content>
    )
    else
      return (
        <Content style={{ borderWidth: 1, backgroundColor: '#F5F5F5' }} padder>

          <Card>
            <CardItem header bordered>
              <Icon name="stadium-variant" type="MaterialCommunityIcons" style={{ color: 'blue' }} />
              <Text2> {this.state.stadium.venue_hebrew_name}</Text2>


            </CardItem>
            <CardItem bordered>
              <Body style={{ borderWidth: 1 }}>
                <Image source={{ uri: this.state.stadiumImage }}  style={{ height: 250, width: '100%' }} />
              </Body>
            </CardItem>
            <CardItem bordered header>
              <Icon name="location-pin" type="Entypo" style={{ color: 'blue' }} />

              <Text2 style={{ textAlign: 'center' }}> {this.state.stadium.venue_hebrew_city} - </Text2>
              <Text2 > {this.state.stadium.venue_city}</Text2>

            </CardItem>
            <CardItem bordered header>
              <Icon name="seat-outline" type="MaterialCommunityIcons" style={{ color: 'blue' }} />
              <Text2 style={{ textAlign: 'center' }}> {this.state.stadium.venue_capacity}</Text2>
            </CardItem>
            <CardItem bordered header>
              <View style={{ width: '100%', flexDirection: 'row' }}>
                <View style={{ width: '50%', justifyContent: 'flex-start' }}>
                  <Button transparent onPress={()=>{
                    var url="https://www.google.com/search?q=";
                    var stadium_name=this.state.stadium.venue_hebrew_name
                    stadium_name=stadium_name.replace(/ /g, '+');
                    
                    Linking.openURL(url+stadium_name);
                  }}>
                    <Icon name="google" type="AntDesign" style={{ color: 'red' }} />
                    <Text2 style={{ color: 'red' }}>Google</Text2>
                  </Button>
                </View>
                <View style={{ width: '50%', justifyContent: 'flex-end', borderLeftWidth: 2 }}>
                  <Button transparent onPress={() => this.openwaze(this.state.stadium.longitude, this.state.stadium.latitude)}>
                    <Icon name="waze" type="MaterialCommunityIcons" style={{ color: 'blue' }} />
                    <Text2>Waze</Text2>
                  </Button>
                </View>
              </View>
            </CardItem>
          </Card>
          <Modal visible={this.state.showmodal} animationType="fade">
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

        </Content>
      )
  }
}

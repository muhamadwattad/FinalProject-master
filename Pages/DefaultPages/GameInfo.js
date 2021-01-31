import { APILINK, HEADERBUTTONCOLOR, RANDOMIMAGEURL } from "../URL";
import { AsyncStorage, Dimensions, Image, Text, View } from "react-native";
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

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
export default class GameInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stadiums: [],
      stadium: null,
      stadiumImg:RANDOMIMAGEURL
    };
  }
  async UNSAFE_componentWillMount() {
    this.setState(
      {
        game: this.props.game,
        home: this.props.homeTeam,
        away: this.props.awayTeam,
      },
      () => {
        console.log("GAME:\n");
        console.log(this.state.game);
        //CHECKING IF GAME HAS STARTED ALREADY OR NOT
        var gameStatus = "";
        var color = ""
        if (this.state.game.statusShort == "NS" || this.state.game.statusShort == 'TBD') {
          //GAME NOT STARTED YET

          gameStatus = "משחק עוד לא התחיל"
          color = "#b8860b"
        }
        else if (this.state.game.statusShort == "PST") {
          // GAME HAS BEEN POSTPONED

          gameStatus = "משחק נדחה"
          color = "red"
        }
        else {
          //GAME HAS ALREADY FINISHED

          gameStatus = "משחק הסתיים"
          color = HEADERBUTTONCOLOR
        }
        this.setState({ gameStatus, color })
      }
    );


  }
  async componentDidMount() {
    //CHANGING DATE OF GAME 
    var matchdate = this.state.game.event_date.split(" ")[1];
    var matchdate2 = this.state.game.event_date.split(" ")[0];
    matchdate = matchdate.slice(0, -3);
    var monthtoEdit = matchdate2[0] + "" + matchdate2[1];
    var daytoEdit = matchdate2[3] + "" + matchdate2[4];
    var yeartoEdit = matchdate2.slice(-4);
    matchdate2 = daytoEdit + "/" + monthtoEdit + "/" + yeartoEdit;
    this.setState({ matchdate: matchdate2 + " " + matchdate });

    var stadiums = await JSON.parse(await AsyncStorage.getItem("stadiums"));

    if (stadiums == null || stadiums == undefined) {
      //GETTING GAMES
      await fetch("http://wattad.up2app.co.il/getstadiums").then((resp) => {
        return resp.json();
      }).then(async (data) => {
        if ('Message' in data) {

        } else {
          await AsyncStorage.setItem("stadiums", JSON.stringify(data));
          this.setState({ stadiums: data });
        }
      })
    }
    else {
      this.setState({ stadiums },async () => {
        //getting the stadium of this game
        let stadiumname = this.state.game.venue;
        console.log(stadiumname);
        let obj = await this.state.stadiums.find(x => x.venue_name.includes(stadiumname));
        console.log(obj);
        if (obj != null)
          this.setState({ stadium: obj},()=>{
            //getting the image of the stadium
            var stadiumName = this.state.stadium.venue_name;

            stadiumName = stadiumName.replace(/ /g, '');
            var url = APILINK + "stadiumimages/" + stadiumName + ".jpg"
            this.setState({stadiumImg:url})
          });

      })
    }


  }
  render() {
    return (
      <View>
        <View style={{ height: windowHeight / 3, }}>
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              height: "20%",
              margin: 6,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                margin: 6,
                alignItems: "flex-start",
                width: "33%",
              }}
            >
              {this.state.home.name}

            </Text>

            <Text
              style={{
                textAlign: "center",
                margin: 6,
                alignItems: "flex-end",
                width: "33%",
              }}
            >
              {this.state.away.name}
            </Text>
          </View>
          <View
            style={{
              margin: 6,
              height: "70%",
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <Image
              style={{ margin: 6, height: 150, width: 150 }}
              source={{ uri: this.state.home.logo }}
            />
            <Image
              style={{ margin: 6, height: 150, width: 150 }}
              source={{ uri: this.state.away.logo }}
            />
          </View>



        </View>

        <View style={{ height: windowHeight - windowHeight / 3 }}>
          <View style={{
            width: '100%', height: '10%', marginTop: 20, justifyContent: "space-between",
            flexDirection: "row",
          }}>
            <Text style={{ width: '20%', textAlign: 'center', fontSize: 20 }}>{this.state.game.homeScore}</Text>
            <View style={{ width: '60%', }}>
              <Text style={{ textAlign: 'center', color: this.state.color, fontSize: 18 }}>  {this.state.gameStatus}</Text>
              <Text2 style={{ textAlign: 'center', fontSize: 15, marginTop: 2 }} note>{this.state.matchdate}</Text2>
            </View>
            <Text2 style={{ width: '20%', textAlign: 'center', fontSize: 20 }}>{this.state.game.awayScore}</Text2>

          </View>

          <View style={{
            width: '100%', height: '90%', justifyContent: "space-between",
            flexDirection: "row", backgroundColor: 'smoke'
          }}>




            {this.state.stadium != null ?
              <View style={{ height: '100%', width: '55%' }}>

                <Card style={{marginTop:'25%'}}>
                  <CardItem header bordered>
                    <Text2>{this.state.stadium.venue_hebrew_name}</Text2>

                  </CardItem>
                  <CardItem header bordered>
                    <Text2>{this.state.stadium.venue_hebrew_city}</Text2>
                  </CardItem>
                  <CardItem header bordered>
                    <Text2>{this.state.stadium.venue_name}</Text2>
                  </CardItem>
                  <CardItem header bordered>
                    <Text2>{this.state.stadium.venue_city}</Text2>
                  </CardItem>

                </Card>

              </View>
              : <View></View>}

            <View style={{ height: '100%', width: '45%', backgroundColor: 'smoke' }}>
              <View style={{ margin: 15, height: '70%', }}>

                <Image source={{ uri: this.state.stadiumImg }} style={{ width: '100%', height: '100%' }} />
              </View>

            </View>






          </View>


        </View>
      </View>
    );
  }
}

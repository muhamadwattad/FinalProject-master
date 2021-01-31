import {
  AsyncStorage,
  Dimensions,
  Modal,
  Text,
  View,
  Image
} from 'react-native'
import {
  Body,
  Button,
  Container,
  Content,
  Header,
  Icon,
  Left,
  List,
  ListItem,
  Right,
  Text as Text2,
  Thumbnail,
} from "native-base";
import React, { Component } from 'react'

import { APILINK } from '../URL';
import GameInfo from "./GameInfo";
import { HEADERBUTTONCOLOR } from "../URL";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;



export default class GamesByStadium extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stadium: null,
      games: [],
      teams: [],
      openmodal: false,
      errormsg: 'מקבל נתונים...',
      dontload: true
    }
  }
  async componentDidMount() {
    //GETTING TEAMS
    let teams = await AsyncStorage.getItem("teams");
    if (teams == null || teams.length == 0) {
      await fetch(APILINK + "getteams/").then((resp) => {
        return resp.json();
      }).then(async (data) => {
        if ('Message' in data) {
          this.setState({ dontload: true, errormsg: 'אירעה שגיאה בניסיון להשיג את הקבוצות, אנא נסה שוב.' })
        }
        else {
          this.setState({ teams: data });
        }
      });
    } else {
      teams = await JSON.parse(teams);
      this.setState({ teams });
    }


  }
  async UNSAFE_componentWillMount() {
    //SAVING STADIUM INTO STATE FROM PARENT
    this.setState({ stadium: this.props.stadium });
    //GETTING GAMES THAT HAPPEND OR WILL HAPPEN ON THIS STADIUM
    let url = APILINK + "Getgamesbystadium/" + this.props.stadium.venue_name;



    await fetch(url).then((resp) => {
      return resp.json();
    }).then(async (data) => {
      if ('Message' in data) {
        this.setState({ games: [], dontload: true, erormsg: "אירעה שגיאה בניסיון להשיג משחקים, נסה שוב." })
      }
      else {
        this.setState({ games: data, dontload: false });
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
    else {

      return (

        <Content>

          <List scrollEnabled={true}>
            {this.state.games.map((game, index) => {
              var homeTeam = this.state.teams.find(
                (team) => team.team_id == game.homeTeamCode
              );
              var awayTeam = this.state.teams.find(
                (team) => team.team_id == game.awayTeamCode
              );
              var matchdate = game.event_date.split(" ")[0];
              var matchdate2 = game.event_date.split(" ")[1];
              var monthtoEdit = matchdate[0] + "" + matchdate[1];
              var daytoEdit = matchdate[3] + "" + matchdate[4];
              var yeartoEdit = matchdate.slice(-4);
              matchdate = daytoEdit + "/" + monthtoEdit + "/" + yeartoEdit;
              matchdate2 = matchdate2.substring(0, matchdate2.length - 3) + " IT"
              return (
                <ListItem key={index.toString()}>
                  {/*HOME TEAM*/}
                  <View
                    style={{
                      justifyContent: "space-between",
                      flexDirection: "row",
                      width: "100%",
                      display: "flex",
                    }}
                  >
                    <View style={{ alignItems: "flex-start" }}>
                      <Thumbnail source={{ uri: homeTeam.logo }} />
                    </View>
                    <View style={{ borderColor: "black" }}>
                      <Text style={{ textAlign: "center" }}>
                        {" "}
                        {matchdate}
                      </Text>

                      <Text2 note>{matchdate2}</Text2>
                      <Text2
                        note
                        style={{ color: "#228B22" }}
                        onPress={() => {
                          this.setState({
                            openmodal: true,
                            gameinfo: game,
                            homeTeam,
                            awayTeam,
                          });
                        }}
                      >
                        {" "}
               צפיה בפרטי המשחק
             </Text2>
                    </View>
                    {/*AWAY TEAM*/}
                    <View style={{ alignItems: "flex-end" }}>
                      <Thumbnail source={{ uri: awayTeam.logo }} />
                    </View>
                  </View>

                </ListItem>
              );
            })}
          </List>
          <Modal visible={this.state.openmodal} animationType="slide">
            <Header style={{ backgroundColor: "white" }}>
              <Right style={{ flex: 1 }}>
                <Button
                  onPress={() => {
                    this.setState({ openmodal: false });
                  }}
                  style={{ backgroundColor: "white", color: "blue", flex: 1 }}
                  transparent
                >
                  {/* <Icon type="SimpleLineIcons" name="menu" size={30} color={HEADERBUTTONCOLOR} /> */}
                  <MaterialCommunityIcons
                    name="close"
                    size={30}
                    color={HEADERBUTTONCOLOR}
                  />
                </Button>
              </Right>
              <Body>
                <Text>TEST TEST</Text>
              </Body>
            </Header>

            <GameInfo
              game={this.state.gameinfo}
              homeTeam={this.state.homeTeam}
              awayTeam={this.state.awayTeam}
            />
          </Modal>
        </Content>
      )
    }
  }
}

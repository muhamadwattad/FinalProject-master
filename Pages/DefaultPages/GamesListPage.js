import { AsyncStorage, Modal, Text, View, Image } from 'react-native'
import { Body, Button, Container, Content, Header, Icon, Left, List, ListItem, Right, Text as Text2, Thumbnail } from 'native-base';
import React, { Component } from 'react'

import { APILINK } from '../URL'
import { HEADERBUTTONCOLOR } from '../URL';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export default class GamesListPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      team: null,
      games: [],
      teams: [],
      dontload: true,
      errormsg: 'מקבל נתונים...'
    }
  }
  async componentDidMount() {
    //GETTING TEAMS FROM ASYNCSTORAGE
    let teams = JSON.parse(await AsyncStorage.getItem("teams"));
    this.setState({ teams });

    //GETTING TEAM THAT HAVE BEEN SENT
    let team = await this.props.team;
    this.setState({ team });
    if (team != null) {
      let teamcode = team.team_id
      await fetch("http://wattad.up2app.co.il/getgames/" + teamcode + "/").then((resp) => {
        return resp.json();
      }).then((data) => {
        if (data.length == 0) {
          this.setState({ games: [], dontload: false });
        }
        else {
          this.setState({ games: data, dontload: false });
        }
      })
    }
  }
  render() {
    if (this.state.dontload == true) {

      return (
        <Container>

          <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'smoke', height: '100%' }} >
            <Image source={require('../../assets/loading.gif')} style={{ width: 100, height: 100 }} />
            <Text style={{ fontSize: 25 }}>{this.state.errormsg}</Text>
          </View>
        </Container>

      );
    }
    else
      if (this.state.team == null || this.state.team == undefined) {
        return (
          <View>
            <Text style={{ textAlign: 'center', alignItems: 'center', fontSize: 30, marginTop: '50%' }}> לא ניתן להשיג את הקבוצה, נסה שוב </Text>
          </View>
        )
      }
      else {
        return (
          <Content>
            {this.state.games.length == 0 ? <Text style={{ textAlign: 'center', alignItems: 'center', fontSize: 30, marginTop: '50%' }}> לא ניתן להשיג את המשחקים, נסה שוב. </Text> :
              <List>
                {
                  this.state.games.map((game, index) => {
                    var homeTeam = this.state.teams.find(team => team.team_id == game.homeTeamCode);
                    var awayTeam = this.state.teams.find(team => team.team_id == game.awayTeamCode);
                    var matchdate = game.event_date.split(" ")[1];

                    matchdate = matchdate.slice(0, -3);
                    var matchdate2 = game.event_date.split(" ")[0];
                    var monthtoEdit = matchdate2[0] + "" + matchdate2[1];
                    var daytoEdit = matchdate2[3] + "" + matchdate2[4];
                    var yeartoEdit = matchdate2.slice(-4);
                    matchdate2 = daytoEdit + "/" + monthtoEdit + "/" + yeartoEdit;
                    console.log(game)
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
                            <Text2>{game.homeScore}</Text2>
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
                              {game.statusShort == "FT" ? "משחק הסתיים" : game.statusShort == "NS" ? "משחק עוד לא התחיל" : "תאריך עוד לא נקבע"}
                            </Text2>

                          </View>
                          {/*AWAY TEAM*/}
                          <View style={{ alignItems: "flex-end" }}>
                            <Thumbnail source={{ uri: awayTeam.logo }} />
                            <Text2>{game.awayScore}</Text2>
                          </View>
                        </View>

                      </ListItem>
                    )
                  })
                }
              </List>
            }
          </Content>
        )
      }
  }
}

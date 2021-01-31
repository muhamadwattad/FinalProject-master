import { Alert, AsyncStorage, Image, Modal, Text, View } from 'react-native'
import { Body, Button, Container, Content, Header, Icon, Left, List, ListItem, Picker, Right, Segment, Text as Text2, Thumbnail } from 'native-base';
import React, { Component } from 'react'

import { HEADERBUTTONCOLOR } from '../URL';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import StadiumInfo from './StadiumInfo'

export default class SortByTeamsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teams: [],
      dontload: false,
      stadiums: [],
      errormsg: "loading",
      openmodal: false,
      selected: "0",
      stadium: undefined,
      loading: true
    }
  }
  async componentDidMount() {
    this.setState({ loading: true })
    //getting teams from AsyncStorage or from api
    let teams = await AsyncStorage.getItem("teams");
    if (teams == null) {
      await fetch("http://wattad.up2app.co.il/getteams").then((resp) => {
        return resp.json();
      }).then((data) => {
        if ('Message' in data) {
          this.setState({ dontload: true, errormsg: "No Teams" });
        }
        else {
          this.setState({ teams: data });
        }
      })
    }
    else {
      teams = await JSON.parse(teams);
      this.setState({ teams });
    }

    //getting Stadiums from AsyncStorage or from API
    let stadiums = await AsyncStorage.getItem("stadiums");
    if (stadiums == null) {
      await fetch("http://wattad.up2app.co.il/getstadiums").then((resp) => {
        return resp.json();
      }).then((data) => {
        if ('Message' in data) {
          this.setState({ dontload: true, errormsg: "No Stadiums" });
        }
        else {
          this.setState({ stadiums: data, loading: false });
        }
      })
    }
    else {
      stadiums = await JSON.parse(stadiums);
      this.setState({ stadiums, loading: false });
    }

  }
  sortteams = async () => {
    //SORTING TEAMS BY THEIR LEAGUES LEAGUE 1 => FIRST DIV 2=> SECOND DIV
    this.setState({ loading: true });
    let teams;
    if (this.state.teams[0].team_league == 1) {
      teams = this.state.teams.sort((a, b) => (a.team_league > b.team_league) ? 1 : -1);
    }
    else {
      teams = this.state.teams.sort((a, b) => (a.team_league < b.team_league) ? 1 : -1);
    }
    this.setState({ teams, loading: false });
  }
  changeValues = async (value) => {
    this.setState({ selected: value });
  }
  render() {
    if (this.state.dontload == true) {
      <Container>

        <Header style={{ backgroundColor: 'white' }}>

          <Right style={{ flex: 1 }} >

            <Button onPress={() => {
              this.props.navigation.toggleDrawer();


            }} style={{ backgroundColor: 'white', color: 'blue', flex: 1 }} transparent >
              {/* <Icon type="SimpleLineIcons" name="menu" size={30} color={HEADERBUTTONCOLOR} /> */}
              <MaterialCommunityIcons name="menu" size={30} color={HEADERBUTTONCOLOR} />
            </Button>
          </Right>





        </Header>
        <Content>
          <Text2> {this.state.erromsg}</Text2>
        </Content>
      </Container>
    }
    else {


      return (
        <Container>

          <Header style={{ backgroundColor: 'white' }}>

            <Right style={{ flex: 1 }} >

              <Button onPress={() => {
                this.props.navigation.toggleDrawer();


              }} style={{ backgroundColor: 'white', color: 'blue', flex: 1 }} transparent >
                {/* <Icon type="SimpleLineIcons" name="menu" size={30} color={HEADERBUTTONCOLOR} /> */}
                <MaterialCommunityIcons name="menu" size={30} color={HEADERBUTTONCOLOR} />
              </Button>
            </Right>

            <Picker note mode="dialog" style={{ width: 120 }} selectedValue={this.state.selected} onValueChange={(value) => this.changeValues(value)}>
              <Picker.Item label="כל הקבוצות" value="0" />
              <Picker.Item label="ליגת העל" value="1" />
              <Picker.Item label="ליגה לאומית" value="2" />

            </Picker>
            <Left>
              <Button onPress={() => {
               


              }} transparent>

                <MaterialCommunityIcons name="table-search" size={25} color={HEADERBUTTONCOLOR} />
              </Button>
            </Left>

          </Header>
          {
            this.state.loading == true ? <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'smoke', borderWidth: 1, height: '100%' }} >
              <Image source={require('../../assets/loading.gif')} style={{ width: 100, height: 100 }} /><Text2>מקבל נתונים...</Text2>
            </View> : <View></View>
          }
          <Content>
            {this.state.teams.length == 0 || this.state.teams == null || this.state.stadiums == null || this.state.stadiums.length == 0 ? <Text>NO TEAMS</Text> :
              <List>
                {
                  this.state.teams.map((team, index) => {

                    let stadium = this.state.stadiums.find(st => st.venue_name == team.venue_name);

                    let value = this.state.selected;
                    if (value == '0') {
                      return (
                        <ListItem thumbnail key={index.toString()} >
                          <Left>
                            <Thumbnail source={{ uri: team.logo }} style={{ borderWidth: 1 }} />
                          </Left>
                          <Body>
                            <Text2>{team.name}</Text2>
                            <Text2 note>{stadium.venue_hebrew_name}</Text2>

                          </Body>
                          <Right>
                            <Button transparent onPress={() => {
                              this.setState({ stadium, team }, () => this.setState({ openmodal: true }))

                            }}>
                              <Text2>לאצטדיון</Text2>
                            </Button>
                          </Right>
                        </ListItem>
                      )
                    }
                    else {
                      if (team.team_league.toString() == value) {
                        return (
                          <ListItem thumbnail key={index.toString()} >
                            <Left>
                              <Thumbnail source={{ uri: team.logo }} style={{ borderWidth: 1 }} />
                            </Left>
                            <Body>
                              <Text2>{team.name}</Text2>
                              <Text2 note>{team.venue_name}</Text2>
                              <Text2 note>{stadium.venue_hebrew_name}</Text2>
                            </Body>
                            <Right>
                              <Button transparent onPress={() => this.setState({ stadium, team }, () => this.setState({ openmodal: true }))}>
                                <Text2>לאצטדיון</Text2>
                              </Button>
                            </Right>
                          </ListItem>
                        )
                      }
                    }

                  })
                }


              </List>
            }
            <Modal visible={this.state.openmodal} animationType="fade">
              <Header style={{ backgroundColor: "white" }}>
                <Right style={{ flex: 1 }}>
                  <Button
                    onPress={() => {
                      this.setState({ openmodal: false });
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
          </Content>
        </Container>
      )
    }
  }
}

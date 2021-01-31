import { AsyncStorage, Modal, Text, TextInput, View, Image } from 'react-native'
import { Body, Button, Container, Content, Header, Icon, Left, List, ListItem, Right, Text as Text2, Thumbnail } from 'native-base';
import React, { Component } from 'react'

import GamesListPage from './GamesListPage'
import { HEADERBUTTONCOLOR } from '../URL';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export default class TeamsListPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teams: [],
      dontload: true,
      errormsg: "מקבל נתונים...",
      showmodal: false
    };
  }
  async componentDidMount() {
    //GETTING TEAMS FROM ASYNC STORAGE
    let teams = JSON.parse(await AsyncStorage.getItem("teams"));
    console.log(teams);
    if (teams.length == 0 || teams == null) {
      await fetch("http://wattad.up2app.co.il/getteams").then((resp) => {
        return resp.json();
      }).then((data) => {
        if ('Message' in data) {
          this.setState({ errormsg: "לא מצליח להשיג קבוצות", dontload: true });
        }
        else {
          this.setState({ teams: data, dontload: false });
        }
      })
    }
    else
      this.setState({ dontload: false, teams });

  }
  render() {
    if (this.state.dontload == true) {
      return (
        <Container>
          <Header style={{ backgroundColor: "white" }}>
            <Right style={{ flex: 1 }}>
              <Button
                onPress={() => {
                  this.props.HideModal();
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


          </Header>
          <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'smoke', height: '100%' }} >
            <Image source={require('../../assets/loading.gif')} style={{ width: 100, height: 100 }} />
            <Text style={{ fontSize: 25 }}>{this.state.errormsg}</Text>
          </View>
        </Container>
      )
    }
    else {
      return (
        <Container>
          <Header style={{ backgroundColor: "white" }}>
            <Right style={{ flex: 1 }}>
              <Button
                onPress={() => {
                  this.props.HideModal();
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


          </Header>
          <Content>
            <List>
              {
                this.state.teams.map((team, index) => {
                  return (
                    <ListItem thumbnail key={index.toString()} >
                      <Left>
                        <Thumbnail source={{ uri: team.logo }} style={{ borderWidth: 1 }} />
                      </Left>
                      <Body>
                        <Text2>{team.name}</Text2>


                      </Body>
                      <Right>
                        <Button transparent onPress={() => {
                          this.setState({ team, showmodal: true });
                        }}>
                          <Text2>משחקים</Text2>
                        </Button>
                      </Right>
                    </ListItem>
                  )
                })
              }
            </List>
            {/* MODAL FOR LIST OF GAMES FOR TEAM*/}
            <Modal visible={this.state.showmodal} animationType="fade" >
              <Header style={{ backgroundColor: "white" }}>
                <Right style={{ flex: 1 }}>
                  <Button
                    onPress={() => {
                      this.setState({ showmodal: false })
                    }}
                    style={{ backgroundColor: "white", color: "blue", flex: 1 }}
                    transparent
                  >
                    {/* <Icon type="SimpleLineIcons" name="menu" size={30} color={HEADERBUTTONCOLOR} /> */}
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={30}
                      color={HEADERBUTTONCOLOR}
                    />
                  </Button>
                </Right>
              </Header>
              <GamesListPage team={this.state.team} />
            </Modal>


          </Content>


        </Container>

      )
    }
  }
}

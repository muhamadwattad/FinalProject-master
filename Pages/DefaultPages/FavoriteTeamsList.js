import { APILINK, HEADERBUTTONCOLOR } from '../URL'
import { Image, Animated, AsyncStorage, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Body, Button, Container, Content, Header, Icon, Left, List, ListItem, Right, Text as Text2, Thumbnail } from 'native-base';
import React, { Component } from 'react'
import AwesomeAlert from 'react-native-awesome-alerts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export default class FavoriteTeamsList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dontload: true,
      teams: [],
      favoriteteams: [],
      errormsg: 'מקבל נתונים...',
      showError: false,
      showError2: false
    }
  }
  async componentDidMount() {
    this.GetTeams();
  }

  GetTeams = async () => {
    console.log('came here')
    var teams = await JSON.parse(await AsyncStorage.getItem('teams'));
    var user = await AsyncStorage.getItem("activeuser");
    var currentuser = await JSON.parse(user);
    //getting user favorite teams
    await fetch(APILINK + "getuserteams/" + currentuser.email + "/").then((response) => {
      return response.json();
    }).then((data) => {
      if ('Message' in data) {
      }
      else {
        this.setState({ favoriteteams: data });
      }
    })
    //getting teams
    if (teams == null) {
      await fetch(APILINK + "getteams").then((resp) => {
        return resp.json();
      }).then((data) => {
        if ('Message' in data) {
          teams = [];
          this.setState({ dontload: true, errormsg: 'אירעה שגיאה בניסיון להשיג את הקבוצות, אנא נסה שוב.' })
        }
        else {
          teams = data;
          this.setState({ teams: data, })
        }
      })
    }
    else
      this.setState({ teams, })

    if (teams.length == 0) {
      this.setState({ dontload: true, errormsg: 'משהו השתבש בזמן שניסה להשיג את הצוותים, טען מחדש את הדף ונסה שוב.' });
    }
    if (this.state.favoriteteams.length != 0 && teams.length != 0) {
      var favteams = this.state.favoriteteams;
      console.log(favteams);
      for (var i = 0; i < favteams.length; i++)
        favteams[i].activated = true;
      console.log(favteams)
      for (var i = 0; i < teams.length; i++) {
        var x = favteams.find(t => t.team_id == teams[i].team_id);
        if (x == undefined) {
          teams[i].activated = false;
          favteams.push(teams[i]);
        }
      }

      this.setState({ teams: favteams, dontload: false })
    }
    else {
      for (var i = 0; i < this.state.teams.length; i++)
        teams[i].activated = false;
      this.setState({ teams, dontload: false });

    }
  }
  AddTeam = async (id) => {
    this.setState({ errormsg: 'מוסיף את הקבוצה...', dontload: true })
    var user = await AsyncStorage.getItem("activeuser");
    var currentuser = await JSON.parse(user);
    await fetch(APILINK + "AddFavoriteTeam/" + currentuser.email + "/" + id + "/").then((resp) => {
      return resp.json();
    }).then((data) => {
      if (data.hasOwnProperty('Message')) {
        this.setState({ dontload: false, showError: true })
      }
      else {
        this.GetTeams();
      }
    })
  }
  RemoveTeam = async (id) => {
    this.setState({ errormsg: 'מוחק את הקבוצה...', dontload: true })
    var user = await AsyncStorage.getItem("activeuser");
    var currentuser = await JSON.parse(user);
    await fetch(APILINK + "RemoveFavoriteTeam/" + currentuser.email + "/" + id + "/").then((resp) => {
      return resp.json();
    }).then((data) => {
      if (data.hasOwnProperty('Message')) {
        this.setState({ dontload: false, showError2: true })
      }
      else {
        this.GetTeams();
      }
    })
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
      );
    }
    return (

      <Content>
        <AwesomeAlert
          show={this.state.showError}
          showProgress={false}
          title="הודעת שגיאה"
          message="משהו השתבש בזמן שניסה להוסיף את הקבוצה, נסה שוב."
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

        <AwesomeAlert
          show={this.state.showError2}
          showProgress={false}
          title="הודעת שגיאה"
          message="משהו השתבש בזמן שניסה להסיר את הקבוצה, נסה שוב."
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          cancelText="No, cancel"
          confirmText="לְהַמשִׁיך"
          confirmButtonColor="#DD6B55"
          onCancelPressed={() => {
            this.setState({ showError2: false })
          }}
          onConfirmPressed={() => {
            this.setState({ showError2: false })
          }}
        />
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

                    {team.activated == false ? <Icon name="check" type="Entypo" style={{ color: HEADERBUTTONCOLOR, fontSize: 25 }} onPress={() => this.AddTeam(team.team_id)} /> :
                      <Icon name="remove" type="FontAwesome" onPress={() => this.RemoveTeam(team.team_id)} style={{ color: HEADERBUTTONCOLOR, fontSize: 25 }} />
                    }

                  </Right>
                </ListItem>
              )
            })
          }
        </List>
      </Content>

    )
  }
}

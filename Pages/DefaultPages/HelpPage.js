import { APILINK, HEADERBUTTONCOLOR, } from '../URL';
import { Body, Button, Card, CardItem, Container, Content, Header, Icon, Left, List, ListItem, Right, Text as Text2, Thumbnail } from 'native-base';
import { AsyncStorage, Image, Text, View, Alert, Modal, TextInput } from 'react-native'
import React, { Component } from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import prompt from 'react-native-prompt-android';
import Dialog from "react-native-dialog";
import AwesomeAlert from 'react-native-awesome-alerts';
export default class HelpPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      dontload: false,
      errormsg: 'מקבל נתונים...',
      messages: [],
      AddDialong: false,
      message: '',
      showError: false,
      Error: ''

    }
  }
  async componentDidMount() {
    this.GetMessages();


  }
  GetMessages = async () => {
    var user = await AsyncStorage.getItem("activeuser");
    var currentuser = await JSON.parse(user);
    //getting user's messages
    await fetch(APILINK + "getmessages/" + currentuser.email + "/").then((resp) => {
      return resp.json();
    }).then((data) => {
      console.log(data)
      if (data.hasOwnProperty('Message')) {
        this.setState({ dontload: true, errormsg: 'לא נמצאו הודעות. הוסף הודעה חדשה כדי לראות אותה כאן.' })
      }
      else {

        this.setState({ messages: data, dontload: false });
      }
    })
  }
  SendMessage = async () => {
    this.setState({ AddDialong: false }, async () => {
      if (this.state.message.length < 8) {
        this.setState({ showError: true, Error: 'אורך ההודעה חייב להיות יותר משמונה אותיות.' })
        return;
      }
      var user = await AsyncStorage.getItem("activeuser");
      var currentuser = await JSON.parse(user);

      var Body = {
        User_Email: currentuser.email,
        Message_Content: this.state.message
      }
      await fetch(APILINK + "AddMessage", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Body)
      }).then((resp) => { return resp.json() })
        .then((data) => {
          if (data.hasOwnProperty('Message')) {
            this.setState({ showError: true, Error: 'לא ניתן לשלוח הודעה, נסה שוב.' })
          }
          else {
            this.GetMessages();
          }
        })

    })

  }
  render() {
    if (this.state.dontload) {
      return (
        <Container>
          <Header style={{ backgroundColor: 'white' }}>
            <Right style={{ flex: 0.5 }} >

              <Button onPress={() => {
                this.props.navigation.toggleDrawer();


              }} style={{ backgroundColor: 'white', color: 'blue', flex: 1 }} transparent >
                {/* <Icon type="SimpleLineIcons" name="menu" size={30} color={HEADERBUTTONCOLOR} /> */}
                <MaterialCommunityIcons name="menu" size={30} color={HEADERBUTTONCOLOR} />
              </Button>
            </Right>

            <Body style={{

              flex: 0.6
            }}>
              <Button style={{ backgroundColor: 'white', width: '100%' }} transparent>
                <Text2 style={{ fontWeight: 'bold' }}>הוסף הודעה חדשה</Text2>

              </Button>
            </Body>

            <Left style={{ flex: 0.2 }}>
              <Button style={{ backgroundColor: 'white', color: 'blue' }} transparent
                onPress={() => {
                  this.setState({ AddDialong: true })
                }}

              >
                <MaterialCommunityIcons name="plus" size={30} color={HEADERBUTTONCOLOR} />

              </Button>
            </Left>


          </Header>
          <Dialog.Container visible={this.state.AddDialong} animationIn="bounceInUp" animationOut="bounceOut">
            <Dialog.Title>שליחת הודעה</Dialog.Title>
            <Dialog.Description>
              שלח לנו הודעה וניצור איתך קשר בחזרה!
        </Dialog.Description>
            <Dialog.Input onChangeText={(text) => { this.setState({ message: text }) }} placeholder="שלחו לנו הודעה" style={{ borderColor: HEADERBUTTONCOLOR, borderWidth: 1, textAlign: 'right', margin: 3 }}></Dialog.Input>
            <Dialog.Button label="ביטול" onPress={() => this.setState({ AddDialong: false })} />
            <Dialog.Button label="שלח" onPress={() => this.SendMessage()} />
          </Dialog.Container>
          <View style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center', backgroundColor: 'smoke', height: '100%' }} >

            {
              this.state.errormsg == 'מקבל נתונים...' ? <Image source={require('../../assets/loading.gif')} style={{ width: 100, height: 100 }} /> :
                <Image source={require('../../assets/error2.png')} style={{ width: 100, height: 100 }} />
            }

            <Text style={{ fontSize: 25, textAlign: 'center' }}>{this.state.errormsg}</Text>
          </View>
          <AwesomeAlert
            show={this.state.showError}
            showProgress={false}
            title="ْהודעת שגיאה"
            message={this.state.Error}
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


        </Container>
      )
    }
    return (
      <Container>
        <Header style={{ backgroundColor: 'white' }}>
          <Right style={{ flex: 0.5 }} >

            <Button onPress={() => {
              this.props.navigation.toggleDrawer();


            }} style={{ backgroundColor: 'white', color: 'blue', flex: 1 }} transparent >
              {/* <Icon type="SimpleLineIcons" name="menu" size={30} color={HEADERBUTTONCOLOR} /> */}
              <MaterialCommunityIcons name="menu" size={30} color={HEADERBUTTONCOLOR} />
            </Button>
          </Right>

          <Body style={{

            flex: 0.6
          }}>
            <Button style={{ backgroundColor: 'white', width: '100%' }} transparent>
              <Text2 style={{ fontWeight: 'bold' }}>הוסף הודעה חדשה</Text2>

            </Button>
          </Body>

          <Left style={{ flex: 0.2 }}>
            <Button style={{ backgroundColor: 'white', color: 'blue' }} transparent>
              <MaterialCommunityIcons name="plus" size={30} color={HEADERBUTTONCOLOR} onPress={() => {
                this.setState({ AddDialong: true })
              }} />

            </Button>
          </Left>


        </Header>
        <Dialog.Container visible={this.state.AddDialong} animationOut="bounceOut" animationIn="fadeInLeftBig">
          <Dialog.Title>שליחת הודעה</Dialog.Title>
          <Dialog.Description>
            שלח לנו הודעה וניצור איתך קשר בחזרה!
        </Dialog.Description>
          <Dialog.Input onChangeText={(text) => this.setState({ message: text })} placeholder="שלחו לנו הודעה" style={{ borderColor: HEADERBUTTONCOLOR, borderWidth: 1, textAlign: 'right', margin: 3 }}></Dialog.Input>
          <Dialog.Button label="ביטול" onPress={() => this.setState({ AddDialong: false })} />
          <Dialog.Button label="שלח" onPress={() => this.SendMessage()} />
        </Dialog.Container>
        <AwesomeAlert
          show={this.state.showError}
          showProgress={false}
          title="ْהודעת שגיאה"
          message={this.state.Error}
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
        <Content>
          <List>
            {this.state.messages.map((item, index) => {
              var date = item.CreatedDate.slice(0, 10);
              var datePart = date.match(/\d+/g),
                year = datePart[0].substring(2), // get only two digits
                month = datePart[1], day = datePart[2];

              date = day + '/' + month + '/' + "20" + year;
              return (
                <ListItem key={index.toString()}>
                  <Card style={{ width: '100%' }}>
                    <CardItem header >
                      <Text2 style={{ color: HEADERBUTTONCOLOR }}>
                        תאריך שליחה
                      </Text2>
                    </CardItem>
                    <CardItem bordered >
                      <Text2>
                        {date}
                      </Text2>
                    </CardItem>
                    <CardItem >
                      <Body>
                        <Text2 style={{ color: HEADERBUTTONCOLOR }}>
                          הודעה N-{item.Id}
                        </Text2>
                      </Body>
                    </CardItem>
                    <CardItem bordered>
                      <Body>
                        <Text2 >
                          {item.Message_Content}
                        </Text2>
                      </Body>
                    </CardItem>
                    <CardItem footer  >
                      <Text2 style={{ color: HEADERBUTTONCOLOR }}>תשובה</Text2>
                    </CardItem>
                    <CardItem footer >
                      <Text2>{item.Response_Content == null ? "עדיין אין תגובה" : item.Response_Content}</Text2>
                    </CardItem>

                  </Card>
                </ListItem>
              )
            })}
          </List>
        </Content>

      </Container >
    )
  }
}

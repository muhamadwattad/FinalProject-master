import * as ImagePicker from 'expo-image-picker';

import { APILINK, HEADERBUTTONCOLOR } from '../URL'
import { Alert, AsyncStorage, Dimensions, FlatList, I18nManager, Image, Keyboard, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Button, Container, Header, Icon, Left, Right, Content, Body } from "native-base";
import React, { Component } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AwesomeAlert from 'react-native-awesome-alerts'
import { Notifications } from 'expo';
import registerForPushNotificationsAsync from './registerForPushNotificationsAsync';

const delay = ms => new Promise(res => setTimeout(res, ms));
let x;
export default class AccountSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      image: '',
      errorMsg: '',
      showError: false,
      showProgress: false,
      showConfirm: false,
      confirmMsg: '',
      email: '',
      imageNameWithGuid: ''
    }
  }
  async componentDidMount() {
    var user = await AsyncStorage.getItem("activeuser");
    var currentuser = await JSON.parse(user);
    console.log(currentuser)
    this.setState({ email: currentuser.email, username: currentuser.name });
  }
  PickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7
      //allowsEditing: true,
      //aspect: [4, 3],
    });
    if (!result.cancelled) {
      this.setState({ image: result.uri });
    }
  }
  Update = async () => {
    if (!(this.state.username.length >= 6 && this.state.username.length <= 14)) {
      //Username must be between 8-12
      console.log(this.state.username);
      this.setState({ errorMsg: 'אורך שם המשתמש חייב להיות בין 6 ל 14 אותיות.', showError: true })
      return;
    }
    if (!(this.state.password.length >= 6 && this.state.password.length <= 14)) {

      //password must be between 6-14
      this.setState({ errorMsg: 'אורך הסיסמה חייב להיות בין 6 ל 14 אותיות.', showError: true })
      return;

    }
    var dontcon = false;
    this.setState({ showProgress: true })
    let Body = {
      email: this.state.email,
      password: this.state.password,
      name: this.state.username
    };
    await fetch(APILINK + "UpdateUser", {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      method: 'POST',
      body: JSON.stringify(Body)
    }).then((resp) => { return resp.json(); })
      .then((data) => {
        if (data.hasOwnProperty('Message')) {
          dontcon = true;
          this.setState({ showProgress: false, errorMsg: data.Message, showProgress: false, showError: true })
          return;
        }
      });

    if (dontcon == false) {
      if (this.state.image.length != 0) {
        let date = new Date()
        let imgName = this.state.username + "" + date.getDay() + "" + date.getMonth() + "" + date.getFullYear() + "" + date.getHours() + "" + date.getMinutes() + "" + date.getSeconds() + ".jpg";
        this.imageUploadToApi(this.state.image, imgName, this.state.username);
      }
      else {
        this.setState({ showProgress: false });
        this.setState({ showProgress: false, confirmMsg: 'המשתמש עודכן בהצלחה.' }, () => {
          delay(2000);
          this.setState({ showConfirm: true });
        })
      }
    }
  }


  imageUploadToApi = async (imgUri, picName) => {
    this.setState({ showProgress: true });
    let dataI = new FormData();
    dataI.append('picture', {
      uri: imgUri,
      name: picName,
      type: 'image/jpg'
    });
    const config = {
      method: 'POST',
      body: dataI,
    }

    await fetch(APILINK + "uploadpicture", config)
      .then((res) => {
        if (res.status == 201) { return res.json(); }
        else { return "err"; }
      })
      .then(async (responseData) => {
        if (responseData != "err") {
          //getting image uri that has been uploaded.
          let picNameWOExt = picName.substring(0, picName.indexOf("."));

          let imageNameWithGUID = responseData.substring(responseData.indexOf(picNameWOExt),
            responseData.indexOf(".jpg") + 4);
          this.setState({
            imageNameWithGuid: imageNameWithGUID
          }, async () => {
            console.log(this.state.imageNameWithGuid);
            //adding picture url to database


            await fetch(APILINK + "UpdateImage/" + this.state.email + "/" + this.state.imageNameWithGuid + "/").then((resp) => {
              return resp.json();
            }).then((data) => {
              if (data == 0) {
                //photo uri was not uploaded.
                this.setState({ showProgress: false });
                this.setState({ confirmMsg: 'המשתמש עודכן בהצלחה,למרות זאת התמונה לא הועלתה' }, () => {
                  delay(2000);
                  this.setState({ showConfirm: true });
                });
              }
              else {
                //everyting is successfull
                this.setState({ showProgress: false });
                this.setState({ showProgress: false, confirmMsg: 'המשתמש עודכן בהצלחה.' }, () => {
                  delay(2000);
                  this.setState({ showConfirm: true });
                })
              }
            })
          }

          );
        }
        else {
          //image was not uploaded.
          this.setState({ showProgress: false });
          this.setState({ confirmMsg: 'המשתמש עודכן בהצלחה,למרות זאת התמונה לא הועלתה', showProgress: false }, () => {
            delay(2000);
            this.setState({ showConfirm: true });
          });
        }
      })
      .catch(err => {
        //image was not uploaded.
        this.setState({ showProgress: false });
        this.setState({ confirmMsg: 'המשתמש עודכן בהצלחה,למרות זאת התמונה לא הועלתה', showProgress: false }, () => {
          delay(2000);
          this.setState({ showConfirm: true });
        });
      });

  }
  render() {
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>

        <View style={styles.container}>
          <Header style={{ backgroundColor: 'white' }}>
            <Right style={{ flex: 1 }} >

              <Button onPress={() => {
                this.props.navigation.goBack();


              }} style={{ backgroundColor: 'white', color: 'blue', flex: 1 }} transparent >
                {/* <Icon type="SimpleLineIcons" name="menu" size={30} color={HEADERBUTTONCOLOR} /> */}
                <MaterialCommunityIcons name="arrow-right" size={30} color={HEADERBUTTONCOLOR} />
              </Button>
            </Right>
          </Header>
          <AwesomeAlert
            show={this.state.showError}
            showProgress={false}
            title="שגיאה!"
            message={this.state.errorMsg}
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
            show={this.state.showConfirm}
            showProgress={false}
            title="מוּצלָח!"
            message={this.state.confirmMsg}
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={false}
            showConfirmButton={true}
            cancelText="No, cancel"
            confirmText="לְהַמשִׁיך"
            confirmButtonColor="#5cb85c"
            onCancelPressed={() => {
              this.setState({ showConfirm: false })
            }}
            onConfirmPressed={() => {
              this.setState({ showConfirm: false }, () => {
                this.props.navigation.navigate("Login");
              })
            }}
          />

          <AwesomeAlert
            show={this.state.showProgress}
            showProgress={true}
            title=""

            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={false}
            showConfirmButton={false}
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
          <View style={styles.bigCircle}></View>
          <View style={styles.smallCircle}></View>
          <View style={styles.centerizedView}>
            <View style={styles.authBox}>
              <View style={styles.logoBox}>
                <Icon
                  style={{ fontSize: 50, color: '#fff' }}
                  name='soccer'
                  type="MaterialCommunityIcons"
                  size={50}
                />
              </View>

              <Text style={{ textAlign: 'center', marginTop: 15, fontSize: 20 }}>עדכון</Text>

              <View style={styles.hr}></View>

              <View>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>שם משתמש</Text>
                  <TextInput
                    onFocus={() => x = 'username'}
                    value={this.state.username}
                    style={styles.input}
                    onChangeText={(username) => {
                      this.setState({ username });
                    }}
                  />
                </View>


              </View>


              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>סיסמה</Text>
                <TextInput
                  value={this.state.password}
                  style={styles.input}
                  onFocus={() => x = 'password'}
                  secureTextEntry={true}
                  textContentType='password'
                  onChangeText={(password) => {
                    this.setState({ password })
                  }}
                />
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={this.PickImage}>
                <View style={{ flexDirection: 'row' }}>
                  <Icon name="image" style={{ width: '20%', fontSize: 30, color: '#fff', fontWeight: 'bold', }} />
                  <Text style={{

                    width: '60%',
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>תמונה</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.loginButton]} onPress={this.Update}>
                <View style={{ flexDirection: 'row' }}>
                  <Icon name="user-plus" type="FontAwesome5" style={{ width: '20%', fontSize: 30, color: '#fff', fontWeight: 'bold', }} />
                  <Text style={{

                    width: '60%',
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>עדכון</Text>
                </View>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  bigCircle: {
    width: Dimensions.get('window').height * 0.7,
    height: Dimensions.get('window').height * 0.7,
    backgroundColor: HEADERBUTTONCOLOR,
    borderRadius: 1000,
    position: 'absolute',
    right: Dimensions.get('window').width * 0.25,
    top: 60,
  },
  smallCircle: {
    width: Dimensions.get('window').height * 0.4,
    height: Dimensions.get('window').height * 0.4,
    backgroundColor: HEADERBUTTONCOLOR,
    borderRadius: 1000,
    position: 'absolute',
    bottom: Dimensions.get('window').width * -0.2,
    right: Dimensions.get('window').width * -0.3,
  },
  centerizedView: {
    width: '100%',
    top: '15%',
  },
  authBox: {
    width: '80%',
    backgroundColor: '#fafafa',
    borderRadius: 20,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoBox: {
    width: 100,
    height: 100,
    backgroundColor: HEADERBUTTONCOLOR,
    borderRadius: 1000,
    alignSelf: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: -50,
    marginBottom: -50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  loginTitleText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 10,
  },
  hr: {
    width: '100%',
    height: 0.5,
    backgroundColor: '#444',
    marginTop: 6,
  },
  inputBox: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 18,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#dfe4ea',
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: HEADERBUTTONCOLOR,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 4,
  },
  loginButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  registerText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  forgotPasswordText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
  },
});
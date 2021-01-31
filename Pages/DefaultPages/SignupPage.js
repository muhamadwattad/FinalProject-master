import * as ImagePicker from 'expo-image-picker';

import { APILINK, HEADERBUTTONCOLOR } from '../URL'
import { Alert, AsyncStorage, Dimensions, FlatList, I18nManager, Image, Keyboard, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Button, Container, Header, Icon, Left } from "native-base";
import React, { Component } from 'react';

import AwesomeAlert from 'react-native-awesome-alerts'
import { Notifications } from 'expo';
import registerForPushNotificationsAsync from './registerForPushNotificationsAsync';

// import * as LocalAuthentication from 'expo-local-authentication';
const delay = ms => new Promise(res => setTimeout(res, ms));
let x;
export default class SignupPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      email: '',
      image: '',
      showView: true,
      inputOpen: '',
      errorMsg: '',
      showError: false,
      showProgress: false,
      showConfirm: false,
      confirmMsg: ''
    }
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
  componentDidMount() {
    //Checking if keyboard is on or off to hide the Views of email and username
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }
  componentWillUnmount() {
    //removing the Keybaord Listener
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  _keyboardDidShow = () => {

    //if user wants to type his password Email and username's view is hidden so the user can see what is he typing.
    if (x == 'password') {
      this.setState({ showView: false })
    }
  }
  Signup = async () => {


    //Checking if user added Username+password+image
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
    //checking if user has uploaded a profile picture.
    if (this.state.image.length == 0) {
      this.setState({ errorMsg: 'עליך להוסיף תמונת פרופיל.', showError: true });
      return;
    }
    //Checking if email is good
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!filter.test(this.state.email)) {
      this.setState({ errorMsg: 'כתובת הדוא"ל חייבת להיות כמו: me@example.com', showError: true });
      return;
    }
    //Username , password and Profile are all good

    //checking if username and email exists in the database
    let ReturnedValue;
    let url = APILINK + "checkifuserexists/" + this.state.email + "/" + this.state.username + "/";
    console.log(url);
    await fetch(url).then((resp) => {
      return resp.json();
    }).then(async (data) => {
      ReturnedValue = data;
    });


    if (ReturnedValue == 'Ok') //username + email do not exist in database.
    {

      //getting Expo token for push notifications
      let token = await Notifications.getExpoPushTokenAsync();
      //Adding User to Database
      var obj = { //saving user's info into an object
        name: this.state.username,
        email: this.state.email,
        password: this.state.password,
        location: "",
        active: "",
        image: "nothing"
      };
      var config = { //headers for the request
        method: 'PUT',
        body:
          JSON.stringify(obj),


        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      };
      let Url = APILINK + "Signup/" + token + "/";
      console.log(Url);
      await fetch(Url, config).then((resp) => {
        return resp.json();
      }).then(async (data) => {
        //Something went wrong...
        if (data == 0) {
          this.setState({ errorMsg: 'משהו השתבש. בבקשה נסה שוב מאוחר יותר.', showProgress: false, showError: true })
          return;
        }
        //Uploading photo of user.
        //setting photo name as Username's and time he uploaded it.
        let date = new Date()
        let imgName = this.state.username + "" + date.getDay() + "" + date.getMonth() + "" + date.getFullYear() + "" + date.getHours() + "" + date.getMinutes() + "" + date.getSeconds() + ".jpg";
        //sending photo uri and username
        this.imageUploadToApi(this.state.image, imgName, this.state.username);
      })
    }
    else if (ReturnedValue == 'Name Exists') { // Username exist in database
      this.setState({ errorMsg: 'שם המשתמש הזה כבר רשום.', showError: true },)
      return;

    }
    else { // email exists in database
      this.setState({ errorMsg: 'כתובת דוא"ל זו כבר רשומה.', showError: true })
      return;
    }




  }
  _keyboardDidHide = () => {
    //keyboard off
    this.setState({ showView: true });

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
                this.setState({ confirmMsg: 'המשתמש נרשם בהצלחה,למרות זאת התמונה לא הועלתה' }, () => {
                  delay(2000);
                  this.setState({ showConfirm: true });
                });
              }
              else {
                //everyting is successfull
                this.setState({ showProgress: false });
                this.setState({ showProgress: false, confirmMsg: 'המשתמש נרשם בהצלחה.' }, () => {
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
          this.setState({ confirmMsg: 'המשתמש נרשם בהצלחה,למרות זאת התמונה לא הועלתה', showProgress: false }, () => {
            delay(2000);
            this.setState({ showConfirm: true });
          });
        }
      })
      .catch(err => {
        //image was not uploaded.
        this.setState({ showProgress: false });
        this.setState({ confirmMsg: 'המשתמש נרשם בהצלחה,למרות זאת התמונה לא הועלתה', showProgress: false }, () => {
          delay(2000);
          this.setState({ showConfirm: true });
        });
      });

  }
  render() {
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>

        <View style={styles.container}>
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

              <Text style={{ textAlign: 'center', marginTop: 15, fontSize: 20 }}>הרשמה</Text>

              <View style={styles.hr}></View>
              {this.state.showView &&
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

                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>מייל</Text>
                    <TextInput
                      onFocus={() => x = 'email'}
                      value={this.state.email}
                      style={styles.input}

                      textContentType='emailAddress'
                      onChangeText={(email) => {
                        this.setState({ email })
                      }}
                    />
                  </View>
                </View>
              }

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
              <TouchableOpacity style={[styles.loginButton]} onPress={this.Signup}>
                <View style={{ flexDirection: 'row' }}>
                  <Icon name="user-plus" type="FontAwesome5" style={{ width: '20%', fontSize: 30, color: '#fff', fontWeight: 'bold', }} />
                  <Text style={{

                    width: '60%',
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>הרשמה</Text>
                </View>
              </TouchableOpacity>

            </View>
          </View>


        </View>
      </TouchableWithoutFeedback>
    );

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
    top: -50,
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
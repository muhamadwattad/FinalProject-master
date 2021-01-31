import * as LocalAuthentication from 'expo-local-authentication';

import { APILINK, HEADERBUTTONCOLOR } from '../URL'
import { Alert, AsyncStorage, Dimensions, FlatList, I18nManager, Image, Keyboard, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Container, Header, Icon } from "native-base";
import React, { Component } from 'react';

import AwesomeAlert from 'react-native-awesome-alerts';

export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      errorMsg: '',
      showError: false,
      EmailInput: false,
      PasswordInput: false
    };
  }
  ForgotPassword = async () => {
    this.props.navigation.navigate("ForgetPage");

  }
  Login = async () => {

    //checking if username and password exists in the DB
    var name = this.state.username;
    var password = this.state.password;

    //IF NAME OR PASSWORD ARE EMPTY SHOW ERROR MESSAGE
    if (name.length == 0 || password.length == 0) {
      this.setState({ errorMsg: "אנא הזן שם משתמש וסיסמה.", showError: true });
      return;
    }
    //IF NAME OR PASSWORD ARE EMPTY SHOW ERROR MESSAGE
    if (name == ' ' || password == ' ') {
      this.setState({ errorMsg: "אנא הזן שם משתמש וסיסמה.", showError: true });
      return;
    }

    console.log(APILINK + "Login/" + name + "/" + password);
    await fetch(APILINK + "Login/" + name + "/" + password).then((resp) => {
      return resp.json();
    }).then(async (data) => {
      console.log(data);
      //IF API RETURNS MESSAGE IT MEANS THAT INFORMATION ARE WRONG
      if ('Message' in data) {
        //TODO Add ALERT TO SHOW ERROR
        console.log("user doesnt exists");
        this.setState({ errorMsg: "פרטי החשבון אינם נכונים.", showError: true });
      }
      else {
        await AsyncStorage.setItem("activeuser", JSON.stringify(data));
        this.props.navigation.navigate("DefaultPages");
      }
    })


  }
  async componentDidMount() {
    //getting if user has been signed in already
    var user = await AsyncStorage.getItem("activeuser");
    //getting if user has autologin enabled/ disabled
    var autologin = await AsyncStorage.getItem("autologin");
    //getting if user has login with fingerprints enabled or disabled
    var loginfinger = await AsyncStorage.getItem("loginfinger");

    if (user != null) { // checking if user is null or not
      //checking if user's info are correct!a
      var currentuser = JSON.parse(user);
      console.log(currentuser);
      var con = false
      let url = APILINK + "Login/" + currentuser.name + "/" + currentuser.password;
      console.log(url);
      await fetch(url).then((resp) => {
        return resp.json();
      }).then(async (data) => {
        var obj = {

        }
        //IF API RETURNS MESSAGE IT MEANS THAT INFORMATION ARE WRONG
        if ('Message' in data || data.hasOwnProperty('ExceptionMessage')) {
          con = true
          //TODO Add ALERT TO SHOW ERROR
          await AsyncStorage.removeItem("activeuser");
          this.setState({ errorMsg: "פרטי החשבון שונו. אנא התחבר שוב.", showError: true });

          return;
        }
        else {
          await AsyncStorage.setItem("activeuser", JSON.stringify(data));
        }
      })
      //CHECKING IF USER HAS AUTOLOGIN ON!!!
      if (con == false) {
        if (autologin == "True" || autologin == null) // if user had autologin enabled ( by defualt (null) its enabled)
          if (loginfinger == "True") {
            //LOGINING IN WITH FINGER PRINTS
            let result = await LocalAuthentication.authenticateAsync(); //getting user's fingerprint 

            if (result.success == true) { //result is success ( user has used fingerprint currectly)
              this.props.navigation.navigate("DefaultPages"); //sending him to home page
            }
            else { // if user has failed the fingerprint app will ask him to put his password.
              this.setState({ username: JSON.parse(user).name });
            }
          }
          else // going to home page without asking him for finger prints
            this.props.navigation.navigate("DefaultPages");
        else { //asking user for his password because autologin is off.
          this.setState({ username: JSON.parse(user).name });
        }
      }
    }

  }
  SignUp = () => {
    this.props.navigation.navigate("Signup");
  };
  render() {
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>


        <View style={styles.container}>
          <AwesomeAlert
            show={this.state.showError}
            showProgress={false}
            title="שגיאה"
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

              <Text style={{ color: 'grey', textAlign: 'center', marginTop: 15, fontSize: 20 }}>התחברות</Text>

              <View style={styles.hr}></View>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>שם משתמש</Text>
                <TextInput
                  value={this.state.username}

                  style={styles.input}


                  onChangeText={(username) => {
                    this.setState({ username });
                  }}
                />
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>סיסמה</Text>
                <TextInput
                  value={this.state.password}
                  style={styles.input}

                  secureTextEntry={true}
                  textContentType='password'
                  onChangeText={(password) => {
                    this.setState({ password })
                  }}
                />
              </View>
              <TouchableOpacity style={styles.loginButton} onPress={this.Login}>
                <Text style={styles.loginButtonText}>התחברות</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.SignUp}>
                <Text style={styles.registerText}>
                  אין לך חשבון? הירשם כאן
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.ForgotPassword}>
                <Text style={styles.forgotPasswordText}>שכחת את הסיסמה שלך ?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );

  }
}
//HEADERBUTTONCOLOR
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
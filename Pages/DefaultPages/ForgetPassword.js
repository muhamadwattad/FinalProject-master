import { Alert, AsyncStorage, Dimensions, FlatList, I18nManager, Image, Keyboard, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Body, Button, Container, Content, Header, Icon, Left, List, ListItem, Right, Text as Text2, Thumbnail } from 'native-base';
import React, { Component } from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { APILINK, HEADERBUTTONCOLOR } from '../URL';
import AwesomeAlert from 'react-native-awesome-alerts'
import { Notifications } from 'expo';
export default class ForgetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      Code: 0,
      showError: false,
      errorMsg: ``,
      title: '',
      ShowPassword: false,
      code: '',
      password: ''
    }
  }

  SendEmail = async () => {
    await fetch(APILINK + "SendEmailWithCode/" + this.state.email + "/").then((resp) => {
      return resp.json();
    }).then((data) => {
      if (data.hasOwnProperty('Message')) {
        console.log(data);
        this.setState({ title: "שגיאה!", errorMsg: `כתובת דוא"ל לא חוקית.`, showError: true })
      }
      else {
        this.setState({ title: "הַצלָחָה!", errorMsg: `הקוד נשלח אליך לכתובת הדוא"ל שלך.`, showError: true, ShowPassword: true })
      }
    })
  }
  ResetPassword = async () => {
    if (this.state.password.length < 8) {
      this.setState({ title: "שגיאה!", errorMsg: `אורך הסיסמאות חייב להיות לפחות 8 אותיות.`, showError: true })
      return;
    }
    if (this.state.code.length == 0) {
      this.setState({ title: "שגיאה!", errorMsg: `אנא הוסף את הקוד שנשלח אליך.`, showError: true })
      return;
    }
    await fetch(APILINK + "ResetPassword/" + this.state.password + "/" + this.state.code + "/" + this.state.email + "/")
      .then((resp) => {
        return resp.json();
      }).then((data) => {
        if (data.hasOwnProperty('Message')) {
          this.setState({ errorMsg: `או שהזנת את הקוד שגוי או שהוא פג. אנא נסה שוב`, title: "שגיאה!", showError: true });
        }
        else {
          this.setState({ errorMsg: `הסיסמה אופסה בהצלחה!`, title: "הַצלָחָה!", showError: true }, () => {
            setTimeout(() => {
              this.setState({ showError: false }, () => {
                this.props.navigation.navigate("Login");
              })
            }, 2000);
          });
        }
      });
  }
  render() {
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>

        <View style={styles.container}>
          <AwesomeAlert
            show={this.state.showError}
            showProgress={false}
            title={this.state.title}
            message={this.state.errorMsg}
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={false}
            showConfirmButton={true}
            cancelText="No, cancel"
            confirmText="לְהַמשִׁיך"
            confirmButtonColor={HEADERBUTTONCOLOR}
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
              <Text style={{ textAlign: 'center', marginTop: 15, fontSize: 20 }}>שחזור סיסמה</Text>
              <View style={styles.hr}></View>
              {this.state.ShowPassword == false ?
                <View>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>מייל</Text>
                    <TextInput
                      value={this.state.email}
                      style={styles.input}
                      textContentType='emailAddress'
                      onChangeText={(email) => {
                        this.setState({ email })
                      }}
                    />
                  </View>


                  <TouchableOpacity style={[styles.loginButton]} onPress={this.SendEmail}>
                    <View style={{ flexDirection: 'row' }}>
                      <Icon name="email" type="MaterialCommunityIcons" style={{ width: '20%', fontSize: 30, color: '#fff', fontWeight: 'bold', }} />
                      <Text style={{

                        width: '60%',
                        color: '#fff',
                        textAlign: 'center',
                        fontSize: 20,
                        fontWeight: 'bold',
                      }}>שליחת קוד</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                :
                <View>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>קוד</Text>
                    <TextInput
                      value={this.state.code}
                      style={styles.input}
                      onChangeText={(code) => {
                        this.setState({ code })
                      }}
                    />
                  </View>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>סיסמה חדשה</Text>
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
                  <TouchableOpacity style={[styles.loginButton]} onPress={this.ResetPassword}>
                    <View style={{ flexDirection: 'row' }}>
                      <Icon name="email" type="MaterialCommunityIcons" style={{ width: '20%', fontSize: 30, color: '#fff', fontWeight: 'bold', }} />
                      <Text style={{

                        width: '60%',
                        color: '#fff',
                        textAlign: 'center',
                        fontSize: 20,
                        fontWeight: 'bold',
                      }}>שחזור סיסמה</Text>
                    </View>
                  </TouchableOpacity>

                </View>

              }
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
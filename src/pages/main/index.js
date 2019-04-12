import React, { Component } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import styles from './styles';
import api from '../../services/api';
import logo from '../../assets/logo.png';
import AsyncStorage from '@react-native-community/async-storage';


export default class Main extends Component {
  state = {
    newBox: '',
  };
  async componentDidMount() {
    const box = await AsyncStorage.getItem('@rocketbox:box');

    if (box) {
      this.props.navigation.navigate('Box');
    }
  };

  handleSignIn = async () => {
    const response = await api.post('boxes', {
      title: this.state.newBox
    });

    await AsyncStorage.setItem('@rocketbox:box', response.data._id)

    this.props.navigation.navigate('Box');
  }
  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.logo}
          source={logo}
        />
        <TextInput
          style={styles.input}
          placeholder={'Crie um box'}
          value={this.state.newBox}
          onChangeText={text => this.setState({ newBox: text })}
          placeholderTextColor={'#999'}
          autoCapitalize='none'
          autoCorrect={false}
          underlineColorAndroid='transparent'
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.handleSignIn()}>
          <Text style={styles.buttonText} >Criar</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import styles from './styles';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../../services/api';
import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt';
import ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import socket from 'socket.io-client';

export default class Box extends Component {
  state = {
    box: {}
  }
  async componentDidMount() {
    const box = await AsyncStorage.getItem('@rocketbox:box');
    this.subscribeToNewFiles(box)
    const response = await api.get(`boxes/${box}`);

    this.setState({ box: response.data })
  };
  openFile = async  file => {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${file.title}`
      await RNFS.downloadFile({
        fromUrl: file.url,
        toFile: filePath,
      })
      await FileViewer.open(filePath);
    } catch (err) {
      console.log('arqivo nao suportado')
    }
  }

  handleUpload = () => {
    ImagePicker.launchImageLibrary({}, async upload => {
      if (upload.error) {
        console.log('imagePicker error')
      } else if (upload.didCancel) {
        console.log('canceled by user')
      } else {
        const data = new FormData();

        const [prefix, sufix] = upload.fileName.split('.');
        const ext = sufix.toLowerCase() === 'heic' ? 'jpg ' : sufix;

        data.append('file', {
          uri: upload.uri,
          type: upload.type,
          name: `${prefix}.${sufix}`
        })
        api.post(`boxes/${this.state.box._id}/files`, data);
      }
    })
  };
  subscribeToNewFiles = (box) => {
    const io = socket('https://rocketbox-back.herokuapp.com');

    io.emit('connectRoom', box);

    io.on('file', data => {
      this.setState({
        box: {
          ...this.state.box,
          files: [data, ...this.state.box.files],
        },
      });
    })
  };

  renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.file}
      onPress={() => this.openFile(item)}>
      <View style={styles.fileInfo}>
        <Icon name={'insert-drive-file'} size={24} color='#A5CFFF' />
        <Text style={styles.fileTitle}>{item.title}</Text>
      </View>
      <Text style={styles.fileDate}>
        há {distanceInWords(item.createdAt, new Date(), {
          locale: pt,
        })}
      </Text>
    </TouchableOpacity>
  );

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.boxTitle}>{this.state.box.title}</Text>
        <FlatList
          data={this.state.box.files}
          style={styles.list}
          keyExtractor={item => item._id}
          renderItem={this.renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
        <TouchableOpacity
          onPress={this.handleUpload}
          style={styles.fab}>
          <Icon name={'cloud-upload'} size={24} color={'#FFF'} />
        </TouchableOpacity>
      </View>
    );
  }
}

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, Permissions } from 'expo';

export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <TouchableOpacity
          style={{
            flex: 1,
            width: '100%',
            height: '100%'
          }}
          onPress={async () => {
            if (this.camera) {
              let photo = await this.camera.takePictureAsync();
              Expo.Speech.speak("Analyzing photo!");
            }
          }}>
          <Camera
            ref={ref => { this.camera = ref; }}
            style={{ flex: 1 }}
            type={this.state.type}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
            </View>
          </Camera>
        </TouchableOpacity>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

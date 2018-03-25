import React from 'react';
import { StyleSheet, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { Camera, Permissions } from 'expo';
import _ from 'lodash';

import CloudSight from './helpers/cloudsight';

const cloudsight = CloudSight({
  apikey: ''
});

const barCodeLookupAPIKey = ''

const googleVisionAPIKey = '';

const DOUBLE_PRESS_DELAY = 1400;
const LONG_PRESS_DELAY = 1000;

export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  async checkForTextGC(base64) {
    return await
        fetch('https://vision.googleapis.com/v1p1beta1/images:annotate?key=' + googleVisionAPIKey, {
            method: 'POST',
            body: JSON.stringify({
                "requests": [
                    {
                        "image": {
                            "content": base64
                        },
                        "features": [
                            {
                                "type": "TEXT_DETECTION"
                            }
                        ]
                    }
                ]
            })
        }).then((response) => {
            return response.json();
        }, (err) => {
          console.log(err);
        });
  }

  describePhoto(photo) {
    Expo.Speech.speak("You're looking at...");

    cloudsight.request({
      image: photo,
      locale: 'en-US'
    }, true, (err, data) => {
      if (err) {
        console.log (err);
        return;
      }
      console.log(data);
      Expo.Speech.speak(data.name);
    })
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
            backgroundColor: 'black',
            width: '100%',
            height: '100%',
            flex: 1
          }}
          onPress={async (e) => {
            Expo.Speech.stop();
            if (this.camera) {
              let photo = await this.camera.takePictureAsync({quality: 0.1, base64: true});
              const now = new Date().getTime();

              if (this.lastPress && (now - this.lastPress) < DOUBLE_PRESS_DELAY) {
                // Double press
                delete this.lastPress;
                Expo.Speech.speak("Describing what you're looking at");
                this.describePhoto(photo.base64);
              }
              else {
                // Regular press
                this.lastPress = now;
              }
            }
          }}
          onLongPress={async (e) => {
            Expo.Speech.stop();
            if (this.camera) {
              Expo.Speech.speak("Reading text");
              let photo = await this.camera.takePictureAsync({quality: 0.1, base64: true});
              const res = await this.checkForTextGC(photo.base64);
              res.responses[0].textAnnotations.map(({description}) => {
                Expo.Speech.speak(description.replace('\n', ' '));
              })
            }
          }}>
          <StatusBar hidden />
          <Camera
            ref={ref => { this.camera = ref; }}
            style={{
              width: '100%',
              height: '50%',
              transform: [{rotate: '0deg'}]
            }}
            type={this.state.type}
            autoFocus={Camera.Constants.AutoFocus.on}
            onBarCodeRead={({type, data}) => {
              if (!this.barCodeData ||  this.barCodeData != data) {
                Expo.Speech.stop();
                const typeName = _.invert(Camera.Constants.BarCodeType)[type];
                if (typeName == 'qr') {
                  Expo.Speech.speak('Found ' + typeName + ' Code that contains the following data: ' + data);
                } else {
                  Expo.Speech.speak('Found a ' + typeName + ' code. Looking it up');
                  fetch(`https://www.barcodelookup.com/restapi?barcode=${data}&formatted=y&key=` + barCodeLookupAPIKey)
                  .then(res => res.json())
                  .then(data => {
                    const result = data.result[0];
                    if (!result || !result.details.product_name)
                      throw new Error('Couldnt find info');
                    Expo.Speech.speak('This is a ' + result.details.product_name);
                  }).catch(err => {
                    Expo.Speech.speak('We could not find information about this');
                  })
                }
                this.barCodeData = data;
              }
            }}
            faceDetectionMode={Camera.Constants.FaceDetection.Mode.accurate}
            faceDetectionLandmarks={Camera.Constants.FaceDetection.Landmarks.all}
            onFacesDetected={({faces}) => {
              const now = new Date().getTime();
              if (faces.length > 0 && (!this.lastCheckedFaces || (now - this.lastCheckedFaces) > 6000) && (this.faces === undefined || this.faces !== faces.length)) {
                Expo.Speech.stop();
                if (faces.length == 1) {
                  Expo.Speech.speak('There is someone near you');
                } else {
                  Expo.Speech.speak('There are ' + faces.length + ' people near you');
                }
                this.lastCheckedFaces = now;
                this.faces = faces.length;
              }
            }}
            faceDetectionClassifications={Camera.Constants.FaceDetection.Classifications.all}
            >
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

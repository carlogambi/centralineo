import React, { useState, useEffect } from 'react';
import {
  Platform,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Button,
} from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const device = {
  dimensions: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
};

export default function App() {
  const [recording, setRecording] = useState(false);
  const [recordsList, setRecordsList] = useState([]);
  const [perimssionsAsked, setPerimssionsAsked] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getPermissions = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
    }
    setPerimssionsAsked(true);
  };

  const updateLocation = () => {
    setIsRefreshing(true);
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      (loc) => {
        setLocation(loc);
        setRecordsList(recording ? [loc, ...recordsList] : []);
        setIsRefreshing(false);
      }
    );
  };

  useEffect(() => {
    (async () => {
      if (!perimssionsAsked) await getPermissions();
      updateLocation();
    })();
  }, [recording]);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.paragraph}>{text}</Text> */}
      <Text style={styles.paragraph}> {isRefreshing ? 'refresh' : '-'}</Text>
      {location && (
        <>
          <MapView
            style={styles.map}
            region={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title='eo'
              description='eo description'
            />
            {recording &&
              recordsList.map((location, index) => (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title={`${index}`}
                  description='eo description'
                />
              ))}
          </MapView>
          <Text style={styles.paragraph}>
            speed: {location.coords.speed.toFixed(2)}
          </Text>
        </>
      )}
      <Button
        title={`${recording ? 'stop' : 'start'} recording`}
        onPress={() => setRecording(!recording)}
      />
      <Text style={styles.paragraph}>{recordsList.length}</Text>
      {/* <Text style={styles.paragraph}>{recording.toString()}</Text> */}
      {/* <Text style={styles.paragraph}>{JSON.stringify(recordsList)}</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
  map: {
    width: device.dimensions.width,
    height: (device.dimensions.height / 10) * 7,
  },
});

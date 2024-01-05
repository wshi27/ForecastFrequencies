import { StyleSheet, View, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Text, Divider } from 'react-native-paper';
import axios from 'axios';
import * as constants from '../../common/constants';
import { getBackgroundColor, getTextColor } from '../../common/utils';
import MusicPlayer from '../music/MusicPlayer';
import tinycolor from 'tinycolor2';
import CurrentWeatherInfo from './CurrentWeatherInfo';
import WeatherDataTable from './WeatherDataTable';

const Home = ({ route }) => {
  const { location } = route.params;
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState('');
  const [weatherData, setWeatherData] = useState(undefined);
  const [scrollableTab, setScrollableTab] = useState('HOURLY');
  const [daysForecast, setDaysForecast] = useState([{}]);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [cardBackgroundColor, setCardBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#000000');
  const [loading, setLoading] = useState(false);

  const getUserData = async (token) => {
    try {
      const response = await axios.get(
        `${constants.SERVER_URL}/spotify-user?token=${token}`
      );
      // console.log(response.data);
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const getToken = () => {
    SecureStore.getItemAsync('accessToken').then((token) => {
      setToken(token);
      getUserData(token);
    });
  };

  const getWeatherData = async () => {
    try {
      const response = await axios.post(
        `${constants.SERVER_URL}/timeline-weather?location=${location}`
      );
      console.log('WEATHER DATA', response.data);
      setWeatherData(response.data);
      const color = getBackgroundColor(
        response.data?.currentConditions?.conditions
      );
      setBackgroundColor(color);
      setCardBackgroundColor(tinycolor(color).darken(25).toString());
      setTextColor(getTextColor(color));
    } catch (error) {
      console.error('Error retrieving weather data frontend:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    getToken();
    getWeatherData();
    setLoading(false);
  }, []);

  useEffect(() => {
    getWeatherData();
  }, [location]);

  useEffect(() => {
    console.log('scrollableTab', weatherData);
    setDaysForecast(
      scrollableTab === 'THREE_DAY'
        ? weatherData?.days?.slice(0, 3)
        : scrollableTab === 'FIVE_DAY'
        ? weatherData?.days?.slice(0, 5)
        : scrollableTab === 'HOURLY'
        ? weatherData?.days?.[0]?.hours
        : []
    );
  }, [weatherData, scrollableTab]);

  if (loading || weatherData === '') {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: backgroundColor }]}
      >
        {weatherData && (
          <>
            <View style={styles.currentWeatherInfo}>
              <CurrentWeatherInfo
                backgroundColor={backgroundColor}
                weatherData={weatherData}
                textColor={textColor}
                cardBackgroundColor={cardBackgroundColor}
              />
            </View>
            <Divider />
            <View style={styles.weatherDataTable}>
              <WeatherDataTable
                scrollableTab={scrollableTab}
                setScrollableTab={setScrollableTab}
                daysForecast={daysForecast}
                backgroundColor={backgroundColor}
                cardBackgroundColor={cardBackgroundColor}
              />
            </View>
          </>
        )}

        <View style={styles.musicPlayerBox}>
          <MusicPlayer />
        </View>
      </SafeAreaView>
    );
  }
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  currentWeatherInfo: {
    flex: 2.3,
  },
  weatherDataTable: {
    paddingTop: 10,
    flex: 1,
  },
  musicPlayerBox: {
    flex: 1,
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  data: {
    position: 'absolute',
    marginTop: 30,
  },
  dataTable: {},
});

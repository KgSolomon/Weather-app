import React, { useState, useEffect } from "react";
import Head from "next/head";
import styled from "styled-components";
import CurrentWeather from "../components/Current-Weather/current-weather";
import WeeklyForecast from "../components/WeeklyForecast";
import GeoApi from "../components/GeoApi";
import CardContainer from "../components/CardContainer";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SignIn from "../components/SignIn";
import UserProfile from "../components/UserProfile";
import { toggleTheme } from "./_app";
import MapWrapper from "../components/MapWrapper";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";

const Button = styled.button`
  background-color: #f2df3a;
  border: 3px solid #000;
  border-radius: 10px;
  color: #000;
  font-size: 25px;
  margin: 5px;

  :hover {
    background-color: #000;
    color: #eaeaea;
    border: 3px solid #eaeaea;
    cursor: pointer;
  }
`;

const FooterWrapper = styled(Footer)`
  box-sizing: border-box;
  border: 5px solid;
  position: fixed;
  bottom: 5px;
  border-color: black;
  background-color: blue;
  max-width: fit-content;
`;

const CurrentWeatherWrapper = styled.div`
  //position: relative;
  // top: 3px;
  // left: 35rem;
  width: fit-content;
`;

const ThemeButton = styled.button`
  font-size: 1em;
  margin: 1em;
  padding: 0.25em;
  border: 2px solid;
  background-color: darkblue;
  color: antiquewhite;
`;

async function getPointData(longitude, latitude) {
  const res = await fetch(`https://api.weather.gov/points/${longitude},${latitude}`);
  const data = await res.json();
  return {
    officeId: data.properties.gridId,
    gridX: data.properties.gridX,
    gridY: data.properties.gridY,
  };
}

//Fetches weather data of Linn Kansas, used to fill in state variables
export async function getServerSideProps() {
  const { officeId, gridX, gridY } = await getPointData(39.7456, -97.0892);
  const res = await fetch(`https://api.weather.gov/gridpoints/${officeId}/${gridX},${gridY}/forecast?units=us`);
  const weatherInitialFetchWeekly = await res.json();

  const secondRes = await fetch(`https://api.weather.gov/gridpoints/${officeId}/${gridX},${gridY}/forecast/hourly?units=us`);
  const weatherInitialFetchNow = await secondRes.json();

  return {
    props: { weatherInitialFetchWeekly, weatherInitialFetchNow },
  };
}

//data props for current weather and weekly weather
const Home = ({ weatherInitialFetchWeekly, weatherInitialFetchNow, setTheme, theme }) => {
  const [weatherForecast, setWeatherForecast] = useState(weatherInitialFetchWeekly);
  const [weatherNow, setWeatherNow] = useState(weatherInitialFetchNow);
  const [signInStatus, setSignInStatus] = useState(false);
  const [userData, setUserData] = useState(null);
  const [features, setFeatures] = useState([]);
  const [longLat, setLongLat] = useState([39.7456, -97.0892]);
  //Gets month name instead of number
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = new Date().getMonth();

  //Just console logs the weather forecast data
  const logWeatherData = () => {
    console.log("Forecast", weatherForecast);
    console.log("Now", weatherNow);
  };

  const toggleTheme = () => {
    theme == "light" ? setTheme("dark") : setTheme("light");
  };

  useEffect(() => {
    fetch("/mock-geojson-api.json")
      .then((response) => response.json())
      .then((fetchedFeatures) => {
        // parse fetched geojson into OpenLayers features
        //  use options to convert feature from EPSG:4326 to EPSG:3857
        const wktOptions = {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        };
        const parsedFeatures = new GeoJSON().readFeatures(fetchedFeatures, wktOptions);

        // set features into state (which will be passed into OpenLayers
        //  map component as props)
        setFeatures(parsedFeatures);
      });
  }, []);

  return (
    <div>
      <Head>
        <title>Weather App</title>
      </Head>

      <Header>
        <h1>Weather</h1>
        <ThemeButton type="submit" onClick={toggleTheme}>
          {" "}
          Switch Theme
        </ThemeButton>
        {monthNames[month]}
        <SignIn signInStatus={signInStatus} setSignInStatus={setSignInStatus} setUserData={setUserData} />
        <UserProfile userData={userData} signInStatus={signInStatus} />
      </Header>
      <CurrentWeatherWrapper>
        <CurrentWeather weatherNow={weatherNow} />
      </CurrentWeatherWrapper>
      <CardContainer>
        <WeeklyForecast weeklyWeather={weatherForecast} />
      </CardContainer>
      <MapWrapper features={features} longLat={longLat} />
      <FooterWrapper>
        <Button type="submit" onClick={logWeatherData}>
          Log Data
        </Button>
        <GeoApi setWeatherForecast={setWeatherForecast} setWeatherNow={setWeatherNow} userData={userData} signInStatus={signInStatus} setLongLat={setLongLat} />
      </FooterWrapper>
    </div>
  );
};

export default styled(Home)``;

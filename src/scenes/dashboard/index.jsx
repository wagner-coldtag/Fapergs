import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Typography, useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Header from "../../components/Header";
import Chart from "../../components/LineChart";
import StatBox from "../../components/StatBox";
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import * as XLSX from 'xlsx'; // Import xlsx

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Check if the screen is small

  const [data, setData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://vygk3womq2.execute-api.sa-east-1.amazonaws.com/prod/temperatures?company=DumbCompany');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();

        const fetchedData = JSON.parse(jsonData.body);
    
        // Sort data by timestamp in ascending order
        const sortedData = fetchedData.sort((a, b) => a.timestamp - b.timestamp);
    
        // Extract unique devices
        const uniqueDevices = [...new Set(sortedData.map(item => item.device_id))];
        setDevices(uniqueDevices);
    
        // Set default device
        if (uniqueDevices.length > 0 && selectedDevice === null) {
          setSelectedDevice(uniqueDevices[0]);
        }
        // Format data for the selected device
        const formatData = (deviceData) => {
          return [
            {
              id: "temperature",
              color: "hsl(214, 70%, 50%)",
              data: deviceData
                .filter(item => item.timestamp && !isNaN(item.timestamp)) 
                .map(item => {
                  return {
                    x: item.timestamp, // Keep the raw timestamp
                    y: item.temperature,
                    formattedX: formatTimestamp(item.timestamp), // Store formatted timestamp for display
                  };
                })
            },
            {
              id: "N",
              color: "hsl(153, 70%, 50%)",
              data: deviceData
                .filter(item => item.timestamp && !isNaN(item.timestamp)) 
                .map(item => ({
                  x: item.timestamp, // Keep the raw timestamp
                  y: item.N,
                  formattedX: formatTimestamp(item.timestamp), // Store formatted timestamp for display
                }))
            }
          ];
        };
        setData(formatData(sortedData.filter(item => item.device_id === selectedDevice)));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    

    fetchData(); // Initial fetch

    const intervalId = setInterval(fetchData, 60000); // Fetch data every 60 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [selectedDevice]); // Refetch data when selectedDevice changes

  const formatTimestamp = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) {
      console.error("Invalid timestamp:", timestamp);
      return "Invalid Date"; // Handle invalid timestamp
    }
  
    const date = new Date(timestamp * 1000); // Assuming timestamp is in seconds
  
    if (isNaN(date.getTime())) {
      console.error("Date creation failed for timestamp:", timestamp);
      return "Invalid Date";
    }
  
    return date.toLocaleString();
  };


  // Check the structure of data before accessing it
  const lastTemperature = data.length > 0 && data[0]?.data.length > 0
    ? data[0].data[data[0].data.length - 1]?.y?.toFixed(1) 
    : 0;  
  const temperatureColor = lastTemperature > 10 ? colors.redAccent[500] : colors.greenAccent[500];

  const lastMicrobialLoad = data.length > 1 && data[1]?.data.length > 0 
    ? data[1].data[data[1].data.length - 1]?.y?.toFixed(1) 
    : 0;

  const microbialColor = lastMicrobialLoad > 5 ? colors.redAccent[500] : colors.greenAccent[500];
  const highTemperatureMeasurements = data.length > 0 
    ? data[0].data.filter(item => item.y > 7).length
    : 0;

  let timePassed = 0;
  if (data[0]?.data.length > 1) {
    const firstTimestamp = data[0].data[0].x * 1000; // Convert to milliseconds
    const lastTimestamp = data[0].data[data[0].data.length - 1].x * 1000; // Convert to milliseconds
  
    const firstDate = new Date(firstTimestamp);
    const lastDate = new Date(lastTimestamp);
    
    const timeDifference = lastDate - firstDate;
  
    const minutesPassed = Math.floor(timeDifference / 60000);
    const secondsPassed = Math.floor((timeDifference % 60000) / 1000);
    timePassed = { minutes: minutesPassed, seconds: secondsPassed };
  }

  const timePassedString = timePassed
    ? `${timePassed.minutes}m ${timePassed.seconds}s`
    : "No Data";
  
  if (isSmallScreen) {
      // Render only the chart on small screens
      return (
        <Box m="20px">
          <Box height="400px">
            <Header title="PAINEL DE CONTROLE" subtitle="Bem-vindo ao seu painel de controle" />
            <Box>
        {devices.map((device) => (
          <Button
            key={device}
            variant={device === selectedDevice ? "contained" : "outlined"}
            color="primary"
            onClick={() => setSelectedDevice(device)}
            sx={{ mr: "10px" }}
          >
            Device {device}
          </Button>
        ))}
        <Box
        display="grid"
        gridTemplateColumns="repeat(6, 1fr)"
        gridAutoRows="60px"
        gap="10px"
        mt="10px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
         
            <DeviceThermostatIcon
              sx={{ color: temperatureColor, fontSize: "26px" }}
            /> 
            <Typography             variant="h4"
            fontWeight="bold">
              {lastTemperature} °C
              </Typography>

        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >

              <CoronavirusIcon
                sx={{ color: microbialColor, fontSize: "26px" }}
              />
                          <Typography             variant="h4"
            fontWeight="bold">
              {lastMicrobialLoad} log(N)
              </Typography>
          
        </Box>
        </Box>
      </Box>
            <Chart isDashboard={true} data={data} />
          </Box>
        </Box>
      );
    }

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="PAINEL DE CONTROLE" subtitle="Bem-vindo ao seu painel de controle" />
      </Box>

      {/* DEVICE BUTTONS */}
      <Box>
        {devices.map((device) => (
          <Button
            key={device}
            variant={device === selectedDevice ? "contained" : "outlined"}
            color="primary"
            onClick={() => setSelectedDevice(device)}
            sx={{ mr: "10px" }}
          >
            Device {device}
          </Button>
        ))}
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="120px"
        gap="20px"
        mt="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={lastTemperature !== null ? `${lastTemperature}°C` : "No Data"}
            subtitle="Temperatura"
            progress={lastTemperature !== null ? (lastTemperature / 10).toFixed(2) : 0}
            increase={lastTemperature > 10 ? "High" : "Normal"}
            icon={
              <DeviceThermostatIcon
                sx={{ color: temperatureColor, fontSize: "26px" }}
              />
            }
            progressColor={temperatureColor}
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={lastMicrobialLoad !== null ? `${lastMicrobialLoad}` : "No Data"}
            subtitle="Carga microbiana"
            progress={lastMicrobialLoad !== null ? (lastMicrobialLoad / 5).toFixed(2) : 0}
            increase={
              <Typography sx={{ color: microbialColor }}>
                {lastMicrobialLoad > 5 ? "High" : "Normal"}
              </Typography>
            }            
            icon={
              <CoronavirusIcon
                sx={{ color: microbialColor, fontSize: "26px" }}
              />
            }
            titleColor={lastMicrobialLoad > 5 ? colors.redAccent[500] : colors.grey[100]}
            progressColor={microbialColor}
            subtitleColor={microbialColor}
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={highTemperatureMeasurements}
            subtitle="Notificações"
            icon={
              <NotificationsActiveIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={timePassedString}
            subtitle="Tempo"
            icon={
              <AccessTimeIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Número de leituras
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {data.length > 0 ? data[0].data.length : 0 }
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <Chart isDashboard={true} data={data} />
          </Box>
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`2px solid ${colors.primary[400]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Medidas recentes
            </Typography>
          </Box>
          {data.length > 0 && data[0].data.length > 0 && data[0].data.slice(-10).map((measurement, i) => (
            <Box
              key={`${measurement.x}-${measurement.y}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`3px solid ${colors.primary[400]}`}
              p="10px"
            >
              <Box>
                <Typography color={colors.grey[100]}>
                  {formatTimestamp(measurement.x)}
                </Typography>
              </Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                {measurement.y.toFixed(1)} °C
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

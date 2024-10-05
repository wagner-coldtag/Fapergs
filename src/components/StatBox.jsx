import { Box, Typography } from "@mui/material";
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ titleColor, title, subtitle, icon, progress, increase, progressColor, subtitleColor }) => {
  return (
    <Box 
      width={{ xs: "100%", sm: "80%" }}
      m={{ xs: "0 10px", sm: "0 30px" }} // Change margin based on screen size
    >
      <Box display="flex" justifyContent="space-between">
        <Box>
          {icon}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: titleColor }}
          >
            {title}
          </Typography>
        </Box>
        <Box>
          <ProgressCircle progress={progress} progressColor={progressColor} />
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h5" sx={{ color: subtitleColor }}>
          {subtitle}
        </Typography>
        <Typography
          variant="h5"
          fontStyle="italic"
          sx={{ color: progressColor }} 
        >
          {increase}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;

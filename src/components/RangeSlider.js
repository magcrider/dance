import * as React from "react";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

export default function RangeSlider({ min, max, disabled, values }) {
  const [value, setValue] = React.useState(values);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(()=>{
    setValue(values);
  },[values]);

  return (
    <Box sx={{ width: 300 }}>
      <Slider
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        size="small"
        color="secondary"
        min={min}
        max={max}
        disabled={disabled}
      />
    </Box>
  );
}

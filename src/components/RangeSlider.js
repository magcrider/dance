import * as React from "react";
import { useEffect } from "react";
import Slider from "@mui/material/Slider";

export default function RangeSlider({
  min,
  max,
  disabled,
  values,
  updatePosHandler,
}) {
  const [value, setValue] = React.useState(values);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    updatePosHandler(newValue);
  };

  useEffect(() => {
    setValue(values);
  }, [values]);

  return (
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
  );
}

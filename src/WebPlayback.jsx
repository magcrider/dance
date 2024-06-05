import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { FaShuffle, FaRepeat } from "react-icons/fa6";
import { TbRepeat, TbRepeatOff } from "react-icons/tb";
import { RiExpandRightFill, RiExpandLeftFill } from "react-icons/ri";
import {
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
} from "react-icons/tb";
import Slider from "@mui/material/Slider";
import RangeSlider from "./components/RangeSlider";

const track = {
  name: "",
  album: {
    images: [{ url: "" }],
  },
  artists: [{ name: "" }],
};

function WebPlayback(props) {
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [player, setPlayer] = useState(undefined);
  const [current_track, setTrack] = useState(track);
  const [sliderSeconds, setSliderSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "MAGC Dance",
        getOAuthToken: (cb) => {
          cb(props.token);
        },
        volume: 0.5,
      });

      setPlayer(spotifyPlayer);

      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
      });

      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      spotifyPlayer.addListener("player_state_changed", (state) => {
        console.log(" *** player_state_changed: state: ", state);
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        spotifyPlayer.getCurrentState().then((state) => {
          !state ? setActive(false) : setActive(true);
        });
      });

      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log("Player connected successfully");
        } else {
          console.log("Player connection failed");
        }
      });
    };
  }, [props.token]);

  useEffect(() => {
    console.log(" *** current_track", current_track);

    if (!is_paused) {
      timerRef.current = setInterval(() => {
        setSliderSeconds((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [current_track, is_paused]);

  const handlePauseResume = () => {
    if (is_paused) {
      // Resume the timer
      timerRef.current = setInterval(() => {
        setSliderSeconds((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      // Pause the timer
      clearInterval(timerRef.current);
    }
  };

  const handlePreviousTrack = () => {
    if (player) {
      player
        .previousTrack()
        .then(() => {
          setSliderSeconds(0);
          console.log("Skipped to previous track");
        })
        .catch((error) => {
          console.error("Error skipping to previous track:", error);
        });
    } else {
      console.error("Player is not initialized");
    }
  };

  const handleTogglePlay = () => {
    if (player) {
      player
        .togglePlay()
        .then(() => {
          handlePauseResume();
          console.log("Playback toggled");
        })
        .catch((error) => {
          console.error("Error toggling playback:", error);
        });
    } else {
      console.error("Player is not initialized");
    }
  };

  const handleNextTrack = () => {
    if (player) {
      player
        .nextTrack()
        .then(() => {
          setSliderSeconds(0);
          console.log("Skipped to next track");
        })
        .catch((error) => {
          console.error("Error skipping to next track:", error);
        });
    } else {
      console.error("Player is not initialized");
    }
  };

  const handleSlideChange = (event, newValue) => {
    if (player) {
      player.seek(newValue * 1000).then(() => {
        setSliderSeconds(newValue);
        console.log("Changed position!", newValue);
      });
    }
  };

  if (!is_active) {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <h2>Transfiere el control</h2>
            <p>Entra a Spotify y cambia de dispositivo seleccionando</p>
            <b>MAGC Dance</b>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <div className="now-playing__side">
              <div className="now-playing__name">{current_track.name}</div>
              <div className="now-playing__artist">
                {current_track.artists[0].name}
              </div>
              <div className="slider small-slider">
                {
                  <Slider
                    size="small"
                    defaultValue={0}
                    min={0}
                    max={Math.floor(current_track.duration_ms / 1000)}
                    valueLabelDisplay="auto"
                    onChange={handleSlideChange}
                    value={sliderSeconds}
                  />
                }
              </div>
              <div className="slider">{<RangeSlider />}</div>
              <div className="btns-wrapper">
                <div className="btns-row">
                  <button className="btn-player" onClick={handlePreviousTrack}>
                    <RiExpandRightFill />
                  </button>

                  <button className="btn-player" onClick={handleTogglePlay}>
                    {is_paused ? <TbRepeat /> : <TbRepeatOff />}
                  </button>

                  <button className="btn-player" onClick={handleNextTrack}>
                    <RiExpandLeftFill />
                  </button>
                </div>
                <div className="btns-row">
                  <button
                    className={"btn-player big-button"}
                    onClick={handleTogglePlay}
                  >
                    {is_paused ? <FaPlay /> : <FaPause />}
                  </button>
                </div>
                <div className="btns-row">
                  <button className="btn-player" onClick={handlePreviousTrack}>
                    <TbPlayerTrackPrevFilled />
                  </button>

                  <button className="btn-player" onClick={handleTogglePlay}>
                    {is_paused ? <FaRepeat /> : <FaShuffle />}
                  </button>

                  <button className="btn-player" onClick={handleNextTrack}>
                    <TbPlayerTrackNextFilled />
                  </button>
                </div>
              </div>
            </div>
            <img
              src={current_track.album.images[0].url}
              className="now-playing__cover"
              alt=""
            />
          </div>
        </div>
      </>
    );
  }
}

export default WebPlayback;

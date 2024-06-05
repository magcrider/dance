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

  const [loopStartPos, setloopStartPos] = useState(0);
  const [loopStopPos, setloopStopPos] = useState(0);
  const [repeatTrack, setRepeatTrack] = useState(false);

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
        if (!state) {
          return;
        }

        console.log(" *** player_state_changed: state: ", state);

        // setDuration(state.track_window.current_track.duration_ms);
        setSliderSeconds(Math.floor(state.position / 1000));
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
    if (!is_paused) {
      timerRef.current = setInterval(() => {
        setSliderSeconds((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [is_paused]);

  useEffect(() => {
    if (repeatTrack) {
      if (loopStartPos > 0 && loopStopPos > 0 && sliderSeconds > loopStopPos) {
        player.seek(loopStartPos * 1000).then(() => {
          setSliderSeconds(loopStartPos);
          console.log("Changed position! 1", loopStartPos);
        });
      } else if (
        sliderSeconds ===
        Math.floor(current_track.duration_ms / 1000) - 1
      ) {
        player.seek(0).then(() => {
          setSliderSeconds(0);
          console.log("Changed position! 2", loopStartPos);
        });
      }
    } else {
      //   TrackPlayer.setRepeatMode(RepeatMode.Queue);
      //   console.log(" *** HARD", sliderSeconds);
    }
    //   }, [repeatTrack, position, loopStopPos, loopStartPos]);
  }, [
    repeatTrack,
    loopStopPos,
    loopStartPos,
    sliderSeconds,
    player,
    current_track.duration_ms,
  ]);

  const resetRepeat = () => {
    setloopStartPos(0);
    setloopStopPos(0);
    setRepeatTrack(false);
  };

  const handlePauseResume = () => {
    console.log(" *** current_track", current_track);
    if (is_paused) {
      timerRef.current = setInterval(() => {
        setSliderSeconds((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
  };

  const handlePreviousTrack = () => {
    if (player) {
      player
        .previousTrack()
        .then(() => {
          setSliderSeconds(0);
          resetRepeat();
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
          resetRepeat();
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
      // TODO: check the player.seek not working when the song changes automatically
      player.seek(newValue * 1000).then(() => {
        setSliderSeconds(newValue);
        console.log("Changed position! 3", newValue);
      });
    }
  };
  const handleLoopStart = () => {
    if (loopStartPos) {
      setloopStartPos(0);
      setloopStopPos(0);
    } else {
      setloopStartPos(sliderSeconds);
      if (sliderSeconds > loopStopPos) {
        setloopStopPos(0);
      }
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
              <div className="sliders-wrapper">
                <div className="slider small-slider">
                  {
                    <Slider
                      size="small"
                      defaultValue={0}
                      min={0}
                      max={Math.floor(current_track.duration_ms / 1000)}
                      valueLabelDisplay="on"
                      onChange={handleSlideChange}
                      value={sliderSeconds}
                    />
                  }
                </div>
                <div className="slider">
                  {
                    <RangeSlider
                      min={0}
                      max={Math.floor(current_track.duration_ms / 1000)}
                      values={[loopStartPos, loopStopPos]}
                      disabled={loopStartPos === 0 || loopStopPos === 0}
                    />
                  }
                </div>
              </div>
              <div className="btns-wrapper">
                <div className="btns-row">
                  <button
                    className={`btn-player ${
                      loopStartPos > 0 ? "green-button" : ""
                    }`}
                    onClick={handleLoopStart}
                  >
                    <RiExpandRightFill />
                  </button>

                  <button
                    className={`btn-player ${repeatTrack ? "pink-button" : ""}`}
                    onClick={() => setRepeatTrack(!repeatTrack)}
                  >
                    {repeatTrack ? <TbRepeatOff /> : <TbRepeat />}
                  </button>

                  <button
                    className={`btn-player ${
                      loopStopPos > 0 ? "red-button" : ""
                    }`}
                    onClick={() => setloopStopPos(sliderSeconds)}
                  >
                    <RiExpandLeftFill />
                  </button>
                </div>
                <div className="btns-row">
                  <button className="btn-player" onClick={handlePreviousTrack}>
                    <TbPlayerTrackPrevFilled />
                  </button>

                  <button
                    className={"btn-player big-button"}
                    onClick={handleTogglePlay}
                  >
                    {is_paused ? <FaPlay /> : <FaPause />}
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

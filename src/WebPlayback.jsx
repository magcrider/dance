import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause } from "react-icons/fa";
import { FaShuffle,FaRepeat } from "react-icons/fa6";
import { TbRepeat, TbRepeatOff } from "react-icons/tb";
import { RiExpandRightFill, RiExpandLeftFill } from "react-icons/ri";
import { TbPlayerTrackNextFilled, TbPlayerTrackPrevFilled} from "react-icons/tb";






const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

function WebPlayback(props) {

    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState(track);

    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const spotifyPlayer = new window.Spotify.Player({
                name: 'MAGC Dance',
                getOAuthToken: cb => { cb(props.token); },
                volume: 0.5
            });

            setPlayer(spotifyPlayer);

            spotifyPlayer.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            spotifyPlayer.addListener('player_state_changed', (state => {

                if (!state) {
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);

                spotifyPlayer.getCurrentState().then(state => {
                    (!state) ? setActive(false) : setActive(true)
                });

            }));

            spotifyPlayer.connect().then(success => {
                if (success) {
                    console.log('Player connected successfully');
                } else {
                    console.log('Player connection failed');
                }
            });
        };
    }, [props.token]);

    const handlePreviousTrack = () => {
        if (player) {
            player.previousTrack().then(() => {
                console.log('Skipped to previous track');
            }).catch(error => {
                console.error('Error skipping to previous track:', error);
            });
        } else {
            console.error('Player is not initialized');
        }
    };

    const handleTogglePlay = () => {
        if (player) {
            player.togglePlay().then(() => {
                console.log('Playback toggled');
            }).catch(error => {
                console.error('Error toggling playback:', error);
            });
        } else {
            console.error('Player is not initialized');
        }
    };

    const handleNextTrack = () => {
        if (player) {
            player.nextTrack().then(() => {
                console.log('Skipped to next track');
            }).catch(error => {
                console.error('Error skipping to next track:', error);
            });
        } else {
            console.error('Player is not initialized');
        }
    };

    if (!is_active) {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <b> Instance not active. Transfer your playback using your Spotify app </b>
                    </div>
                </div>
            </>)
    } else {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <div className="now-playing__side">
                            <div className="now-playing__name">{current_track.name}</div>
                            <div className="now-playing__artist">{current_track.artists[0].name}</div>

                            <div className="btns-wrapper">
                                <div className="btns-row">
                                    <button className="btn-spotify" onClick={handlePreviousTrack} >
                                        <RiExpandRightFill />
                                    </button>

                                    <button className="btn-spotify" onClick={handleTogglePlay} >
                                        {is_paused ? <TbRepeat /> : <TbRepeatOff/>}
                                    </button>

                                    <button className="btn-spotify" onClick={handleNextTrack} >
                                        <RiExpandLeftFill />
                                    </button>   
                                </div>
                                <div className="btns-row">
                                    <button className="btn-spotify" onClick={handleTogglePlay} >
                                        {is_paused ?  <FaPlay />:<FaPause />}
                                    </button>
                                </div>
                                <div className="btns-row">
                                    <button className="btn-spotify" onClick={handlePreviousTrack} >
                                        <TbPlayerTrackPrevFilled/>
                                    </button>

                                    <button className="btn-spotify" onClick={handleTogglePlay} >
                                        {is_paused ? <FaRepeat/> : <FaShuffle />}
                                    </button>

                                    <button className="btn-spotify" onClick={handleNextTrack} >
                                        <TbPlayerTrackNextFilled/>
                                    </button>   
                                </div>
                            </div>
                            
                        </div>
                        <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />
                    </div>
                </div>
            </>
        );
    }
}

export default WebPlayback;
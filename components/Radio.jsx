import React from 'react';
import { FaPlay, FaPause, FaBackward, FaForward } from "react-icons/fa";
import { SiBitcoinsv } from "react-icons/si";
import Menu from './Menu';
import Wave from './Wave';

export default function Radio() {
    return (
        <div className="main">
            <Menu/>
            <div className="bg"/>
            <div className="player">

                <div className="player-input">
                    <div className="logo">
                        <SiBitcoinsv className='svg-icon'/>
                        {/* <img src="/assets/logo.png" alt="logo" /> */}
                    </div>
                    <div className="search">
                        <input placeholder='Search Index'></input>
                    </div>
                </div>

                <div className="separator" />

                <div className="player-controls">

                    <div className='speaker' />

                    <div className='controls'>

                        <div className='display'>
                            <div className="cp_wrapper">
                                <section id="marquee">
                                    <div className="marquee" data-text='you are listing to bitradio | you are listing to bitradio'>
                                        <span className="sr-only">you are listing to bitradio | you are listing to bitradio</span>
                                    </div>
                                </section>
                            </div>
                            <div className="text-channel">
                                <span>BLOCK #1 HAS NO INSCRIPTION</span>
                                <div className='wave-div'><Wave/></div>
                            </div>
                        </div>

                        <div className='buttons'>
                            <div className="player__btn player__btn--medium">
                                <i><FaBackward /></i>
                            </div>
                            <div className="player__btn player__btn--medium orange play">
                                <i><FaPlay /></i>
                                {/* <i><FaPause/></i> */}
                            </div>
                            <div className="player__btn player__btn--medium">
                                <i><FaForward /></i>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
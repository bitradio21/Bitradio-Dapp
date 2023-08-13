import { useRef, useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import React from 'react'
import { FaPlay, FaPause, FaBackward, FaForward } from 'react-icons/fa'
import { SiBitcoinsv } from 'react-icons/si'
import MenuBar from '@/components/Menu'
import Wave from '@/components/Wave'
import { onValue, ref, query, orderByChild, equalTo } from 'firebase/database'
import { db } from '@/services/firebase'
import '@/styles/Home.module.css'
import { AudioContext } from '@/context/audio'
import Link from 'next/link'

export default function Home() {
  const audioContext = useContext(AudioContext)
  const [inscription, setInscription] = useState()
  const [latestBlock, setLatestBlock] = useState(0)
  const [currentBlock, setCurrentBlock] = useState(0)
  const [state, setState] = useState({
    loading: false,
    playing: false,
    currentTime: 0,
    duration: 0,
    repeat: false,
  })
  const audioPlayer = useRef(null)
  const [typingTimer, setTypingTimer] = useState(0)

  const handlePlay = () => {
    audioPlayer.current?.play()
    setState({ ...state, playing: true })
  }

  const handlePause = () => {
    audioPlayer.current?.pause()
    setState({ ...state, playing: false })
  }

  const prevBlock = () => {
    audioPlayer.current?.pause()
    getAudio(Number(currentBlock) - 1)
    setCurrentBlock(Number(currentBlock) - 1)
    setState({ ...state, playing: false })
  }

  const nextBlock = () => {
    audioPlayer.current?.pause()
    getAudio(Number(currentBlock) + 1)
    setCurrentBlock(Number(currentBlock) + 1)
    setState({ ...state, playing: false })
  }

  const changeBlock = (e) => {
    if (
      Number(e.target.value) < 0 ||
      e.target.value === '' ||
      e.target.value > latestBlock
    )
      return false
    setCurrentBlock(e.target.value)
    setTimer(e.target.value)
  }

  const handleTimeUpdate = () => {
    if (audioPlayer.current?.ended) {
      setState({
        ...state,
        currentTime: 0,
        playing: false,
      })
    } else if (audioPlayer.current)
      setState({
        ...state,
        currentTime: audioPlayer.current?.currentTime,
        duration: audioPlayer.current?.duration,
      })
  }

  const getLatestBlockInfo = async () => {
    try {
      const response = await fetch(`/blocks/latestblock`)
      const result = await response.json()
      if (result) setLatestBlock(result.height)
    } catch (error) {
      console.log('Backend API error')
    }
  }

  const getAudio = async (currentBlock) => {
    setState({
      ...state,
      loading: true,
    })
    audioContext.setState({ ...state, isPlay: false })

    const dbQuery = query(
      ref(db, 'inscriptions'),
      orderByChild('block_no'),
      equalTo(Number(currentBlock))
    )

    await onValue(dbQuery, (snapshot) => {
      const data = snapshot.val()
      if (snapshot.exists() && data) {
        setInscription(Object.values(data)[0])
        audioContext.setState({ ...data, isPlay: true })
      } else {
        setInscription(null)
      }
    })
    setState({
      ...state,
      loading: false,
    })
  }

  const clearTimer = () => {
    clearTimeout(typingTimer)
  }

  const setTimer = (currentBlock) => {
    setState({
      ...state,
      loading: true,
    })
    clearTimeout(typingTimer)
    const timer = setTimeout(() => {
      getAudio(currentBlock)
    }, 1000)
    setTypingTimer(timer)
  }

  const handleAudio = () => {
    if (state.playing) {
      handlePause()
    } else {
      handlePlay()
    }
  }

  useEffect(() => {
    getLatestBlockInfo()
    if (audioContext.currentBlock) {
      setCurrentBlock(Number(audioContext.currentBlock))
      getAudio(Number(audioContext.currentBlock))
    }
  }, [])

  return (
    <>
      <Head>
        <title>BitRadio</title>
        <meta name='description' content='Ordinal audio inscriptions.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <div className='main'>
          <div className='content'>
            <MenuBar />
            {inscription?.ipfs_cid && (
              <audio
                ref={audioPlayer}
                src={`/ipfs/${inscription.ipfs_cid}/`}
                onTimeUpdate={handleTimeUpdate}
                onAbort={() => setState({ ...state, playing: false })}
                onCanPlay={handleTimeUpdate}
              ></audio>
            )}

            <div className='flex justify-center items-center h-full pb-[100px]'>
              <div className='player'>
                <div className='player-input'>
                  <div className='logo'>
                    <SiBitcoinsv className='svg-icon' />
                    {/* <img src="/assets/logo.png" alt="logo" /> */}
                  </div>
                  <div className='search'>
                    <input
                      min={0}
                      type='number'
                      placeholder='Search Index'
                      onKeyDown={(e) => clearTimer(e)}
                      onKeyUp={(e) => changeBlock(e)}
                    />
                  </div>
                </div>

                <div className='separator' />

                <div className='player-controls'>
                  <div className='speaker' />
                  <div className='controls'>
                    <div className='display'>
                      <div className='cp_wrapper'>
                        <section id='marquee'>
                          <div
                            className='marquee'
                            data-text='you are listing to bitradio | you are listing to bitradio'
                          >
                            <span className='sr-only'>
                              you are listing to {currentBlock}.bitradio | you
                              are listing to
                              {currentBlock}.bitradio
                            </span>
                          </div>
                        </section>
                      </div>
                      <div className='text-channel'>
                        {inscription ? (
                          inscription.ipfs_cid ? (
                            <span className='audio-title has-inscripttion'>
                              {'BLOCK #' + currentBlock + ' HAS INSCRIPTION'}
                            </span>
                          ) : (
                            <span className='audio-title has-inscripttion'>
                              {'BLOCK #' + currentBlock + ' HAS NO AUDIO'}
                            </span>
                          )
                        ) : (
                          <>
                            <Link
                              href={'/inscribe'}
                              className='flex justify-center items-center'
                            >
                              <span className='audio-title hover:underline'>
                                {'BLOCK #' +
                                  currentBlock +
                                  ' HAS NO INSCRIPTION'}
                              </span>
                            </Link>
                            <Link
                              href={'/inscribe'}
                              className='p-2 bg-orange-500 rounded text-white text-sm hover:drop-shadow-md'
                            >
                              Inscribe now
                            </Link>
                          </>
                        )}

                        <div className='wave-div'>
                          {audioContext.state.isPlay && state.playing && (
                            <Wave />
                          )}
                        </div>
                      </div>

                      {state.loading && (
                        <div className='loading'>
                          <div className='loader'>
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='buttons'>
                      {inscription?.ipfs_cid ? (
                        <>
                          <div
                            className='player__btn player__btn--medium'
                            onClick={prevBlock}
                          >
                            <i>
                              <FaBackward />
                            </i>
                          </div>
                          <div
                            className='player__btn player__btn--medium orange play'
                            onClick={(e) => handleAudio()}
                          >
                            {inscription && state.playing ? (
                              <i>
                                <FaPause />
                              </i>
                            ) : (
                              <i>
                                <FaPlay />
                              </i>
                            )}
                          </div>
                          <div
                            className='player__btn player__btn--medium'
                            onClick={nextBlock}
                          >
                            <i>
                              <FaForward />
                            </i>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className='player__btn player__btn--medium'
                            onClick={prevBlock}
                          >
                            <i>
                              <FaBackward />
                            </i>
                          </div>
                          <div className='player__btn player__btn--medium orange play'>
                            <i>
                              <FaPlay />
                            </i>
                            {/* <i><FaPause/></i> */}
                            <div
                              className='
                        player__btn-disable'
                            />
                          </div>
                          <div
                            className='player__btn player__btn--medium'
                            onClick={nextBlock}
                          >
                            <i>
                              <FaForward />
                            </i>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

import React, { useState } from 'react'

export const AudioContext = React.createContext()

const Audio = (props) => {
  const [state, setState] = useState({
    isPlay: false,
  })
  const [currentBlock, setCurrenctBlock] = useState()

  return (
    <AudioContext.Provider
      value={{ state, currentBlock, setState, setCurrenctBlock }}
    >
      {props.children}
    </AudioContext.Provider>
  )
}

export default Audio

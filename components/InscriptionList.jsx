import React, { useContext } from 'react'
// import { InscribeContext } from '@/context/inscribe'
import { FaTimes } from 'react-icons/fa'

const InscriptionList = ({ text, audio, cancelBlock }) => {
  return (
    <div className='flex relative justify-between w-full rounded px-4 py-2 m-1 items-center bg-gray-100 drop-shadow hover:bg-gray-300 transition ease-in-out'>
      <div className='text-gray-700 font-extralight'>{text}.bitradio</div>
      <div className='text-gray-700 text-sm'>
        {audio ? (
          <>
            {audio.name.length > 15
              ? audio.name.slice(0, 5) + '...' + audio.name.slice(-6)
              : audio.name}{' '}
            <span className='text-[12px] ml-2 text-gray-700'>{`(${audio.type})`}</span>
          </>
        ) : (
          <></>
        )}
      </div>
      <div className='flex items-center justify-center'>
        <FaTimes
          onClick={(e) => cancelBlock(text)}
          className='absolute top-2.5 right-1.5 z-20 cursor-pointer p-1 bg-gray-400 text-white rounded-full text-lg'
        />
      </div>
    </div>
  )
}

export default InscriptionList

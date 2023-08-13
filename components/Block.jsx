/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import { FaCloudUploadAlt, FaTimes, FaRegPlayCircle } from 'react-icons/fa'
import Link from 'next/link'
import { AudioContext } from '@/context/audio'
import { useContext } from 'react'

export default function Block(props) {
  const audioContext = useContext(AudioContext)

  if (props.selected && !props.uploaded) {
    return (
      <div className='bg-orange-600 drop-shadow-lg w-100 h-[35px] shadow-black rounded text-sm text-white flex justify-center items-center font-semibold cursor-pointer hover:drop-shadow-2xl hover:bg-gray-500 transition-all ease-out relative'>
        <FaCloudUploadAlt
          onClick={() => props.uploadAudio(props.index)}
          className='text-2xl absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-20 w-100 h-100 mr-[10px] p-2'
        />
        <div className='text-2xl absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-5 w-6 h-6 bg-orange-800 blur-sm rounded-full' />
        {props.blockNumber}
        <FaTimes
          onClick={(e) => props.cancelBlock(props.index)}
          className='text-red-500 absolute -top-1 -right-1 z-20 text-xl bg-white p-1 rounded-full'
        />
      </div>
    )
  } else if (props.taken) {
    if (props.ipfs_cid) {
      return (
        <Link
          href={'/'}
          onClick={() => audioContext.setCurrenctBlock(props.blockNumber)}
          className='bg-orange-400 drop-shadow-lg w-100 h-[35px] shadow-black rounded hover:underline text-sm text-white flex justify-center items-center font-semibold cursor-pointer hover:drop-shadow-2xl transition-all ease-out'
        >
          {props.blockNumber}
          <FaRegPlayCircle
            onClick={(e) => props.cancelBlock(props.index)}
            className='text-orange-700 absolute top-0 right-0 z-20 text-xl bg-white p-1 rounded-full'
          />
        </Link>
      )
    } else {
      return (
        <div className='bg-orange-400 drop-shadow-lg w-100 h-[35px] shadow-black rounded text-sm text-white flex justify-center items-center font-semibold cursor-pointer hover:drop-shadow-2xl transition-all ease-out'>
          {props.blockNumber}
        </div>
      )
    }
  } else if (props.uploaded) {
    return (
      <div className='bg-orange-400 group drop-shadow-lg w-100 h-[35px] shadow-black rounded text-sm text-white flex justify-center items-center font-semibold cursor-pointer hover:drop-shadow-2xl hover:bg-orange-500 transition-all ease-out relative'>
        <FaCloudUploadAlt
          onClick={() => uploadAudio(key)}
          className='text-2xl text-transparent group-hover:z-20 group-hover:text-green-500 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-10 w-100 h-100 mr-[10px] p-2 transition ease-out'
        />
        <span className='text-[11px] absolute text-green-500 group-hover:z-10 group-hover:text-[0px] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-20 transition ease-in'>
          {props.file.name.slice(0, 5) + '...'}
        </span>
        <div className='text-2xl absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-5 w-6 h-6 bg-orange-800 blur-sm rounded-full' />
        {props.blockNumber}
        <FaTimes
          onClick={(e) => props.cancelBlock(props.index)}
          className='text-red-500 absolute -top-1 -right-1 z-20 text-xl bg-white p-1 rounded-full'
        />
      </div>
    )
  } else {
    return (
      <div
        onClick={(e) => props.selectBlock(props.index)}
        className='bg-orange-300 drop-shadow-lg w-100 h-[35px] shadow-black rounded text-sm text-white flex justify-center items-center font-semibold cursor-pointer hover:drop-shadow-2xl hover:bg-gray-400 transition-all ease-out'
      >
        {props.blockNumber}
      </div>
    )
  }
}

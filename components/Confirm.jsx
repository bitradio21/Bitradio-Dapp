import React, { useContext } from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa'
import styles from '@/styles/inscribe.module.css'
import { InscribeContext } from '@/context/inscribe'

const Confirm = (props) => {
  const inscribeContext = useContext(InscribeContext)

  return (
    <div className='flex justify-center h-full items-center'>
      <div className='inscribe'>
        <div className=' felx felx-col justify-center'>
          <h3 className='text-3xl text-center'>{props.text}</h3>
          {props.status === 'minted' ? (
            <FaCheck className='text-green-700 text-[150px] bg-white p-4 rounded-full shadow-lg mx-auto my-6' />
          ) : (
            <FaTimes className='text-red-700 text-[150px] bg-white p-4 rounded-full shadow-lg mx-auto my-6' />
          )}
        </div>
        <button
          className={styles.inscribeButton}
          onClick={(e) => inscribeContext.clearInscribeInfo()}
        >
          confirm
        </button>
      </div>
    </div>
  )
}

export default Confirm

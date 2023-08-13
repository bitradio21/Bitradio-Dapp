import React, { useState, useContext, useEffect } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import styles from '@/styles/inscribe.module.css'
import { InscribeContext } from '@/context/inscribe'
import InscriptionList from '@/components/InscriptionList'
import FeeRecommend from '@/components/feerecommend'
import { FaArrowLeft, FaCopy } from 'react-icons/fa'
import { toast } from 'react-toastify'

const CreateOrder = () => {
  const inscribeContext = useContext(InscribeContext)
  const [feeOption, setFeeOption] = useState('economy')

  const copyToClipboard = (value, type) => {
    navigator.clipboard.writeText(value)
  }

  const placeOrder = async () => {
    console.log('running')
    if (inscribeContext.selectedBlock.length === 0) {
      toast('Mothing to inscribe.')
      inscribeContext.clearInscribeInfo()
    }

    localStorage.setItem(
      'selectedBlock',
      JSON.stringify(inscribeContext.selectedBlock)
    )
    inscribeContext.inscribeOrder()
    inscribeContext.setPendingOrder(Date.now() + 60000 * 60)
    localStorage.setItem('pendingOrder1', Date.now() + 60000 * 60)
  }
  const cancelBlock = (blockNumber) => {
    const temp = inscribeContext.selectedBlock.filter(
      (item) => item.blockNumber !== blockNumber
    )
    inscribeContext.setSelectedBlock(temp)
  }

  return (
    <div className='py-24 flex justify-center relative'>
      <div className='payment-card relative'>
        <div
          className='absolute px-2 py-1 rounded top-2 left-2 z-10 text-sm cursor-pointer text-gray-500 hover:bg-gray-400 hover:text-white'
          onClick={() => inscribeContext.clearInscribeInfo()}
        >
          <FaArrowLeft />
        </div>
        <div className='py-2'>
          <h2 className='sm:text-4xl text-center text-2xl text-gray-800'>
            Inscribe bitradio
          </h2>
        </div>
        <div className='flex flex-col items-center rounded w-full h-[200px] bg-gray-200 border-b border-t border-l border-r px-3 py-2 cursor-pointer hover:border-dashed border-1.5 hover:border-orange-400 overflow-y-auto overflow-x-hidden scroll-smooth	transition ease-in-out duration-150'>
          {inscribeContext.selectedBlock &&
          inscribeContext.selectedBlock.length > 0 ? (
            inscribeContext.selectedBlock.map((item, index) => {
              return (
                <InscriptionList
                  text={item.blockNumber}
                  audio={item.file}
                  key={index}
                  cancelBlock={cancelBlock}
                />
              )
            })
          ) : (
            <div className='flex justify-center items-center h-full'>
              {' '}
              There is no block to inscribe.
            </div>
          )}
        </div>
        <div className={styles.inscribeForm}>
          <div className='flex justify-between items-center mt-3 p-2 bg-gray-200 w-full rounded overflow-x-hidden text-gray-700 drop-shadow'>
            {inscribeContext.receiveAddress.slice(0, 15)}...
            {inscribeContext.receiveAddress.slice(-15)}
            <FaCopy
              className='ml-1 cursor-pointer'
              onClick={() => copyToClipboard(inscribeContext.receiveAddress)}
            />
          </div>
        </div>
        <div className='m-3 w-full'>
          <FeeRecommend
            feeRecommended={inscribeContext.serviceFee}
            selectFeeOption={setFeeOption}
            feeOption={feeOption}
          />
        </div>

        <div className='pb-3'>
          <div className='border-b border-gray-400 py-2 pt-1'>
            <div className='grid grid-cols-2 font-semibold py-1'>
              <p className='text-right pr-2 py-1 text-gray-700'>
                Inscription Sats :
              </p>
              <p className='text-left pl-2 py-1 text-gray-700'>
                {inscribeContext.selectedBlock.length} * 546 sats{' '}
                <span className='text-gray-700 text-[11px]'>
                  {' '}
                  ~$
                  {(
                    (inscribeContext.selectedBlock.length * 546) /
                    3400
                  ).toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          <div className='border-b border-gray-400 py-1'>
            <div className='grid grid-cols-2 font-semibold py-1'>
              <p className='text-right pr-2 py-1 text-gray-700'>
                Base Service Fee :
              </p>
              <p className='text-left pl-2 py-1 text-gray-700'>
                {inscribeContext.selectedBlock.length} * 3000 sats{' '}
                <span className='text-gray-700 text-[11px]'>
                  {' '}
                  ~$
                  {(
                    Number(inscribeContext.selectedBlock.length * 3000).toFixed(
                      0
                    ) / 3339
                  ).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>

        <p className='text-sm text-gray-600 text-center font-extralight'>
          Please note the inscribing transaction delivers the inscription to the
          receiving address directly.
        </p>

        <button className={styles.inscribeButton} onClick={placeOrder}>
          Submit & Pay Invoice
        </button>
      </div>
    </div>
  )
}

export default CreateOrder

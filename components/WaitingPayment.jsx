import React, { useState, useContext } from 'react'
import styles from '@/styles/inscribe.module.css'
import QRCode from 'react-qr-code'
import { FaCopy, FaCheck } from 'react-icons/fa'
import Countdown from 'react-countdown'
import { toast } from 'react-toastify'
import { WalletContext } from '@/context/wallet'
import { InscribeContext } from '@/context/inscribe'
import { useEffect } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import Moment from 'react-moment'
import { equalTo, query, ref, onValue, orderByChild } from 'firebase/database'
import { db } from '@/services/firebase'
import { feeAmount } from '@/configs/constants'

const WaitingPayment = () => {
  const walletContext = useContext(WalletContext)
  const inscribeContext = useContext(InscribeContext)
  const [isLoading, setLoad] = useState(true)
  const [copied, setCopied] = useState({
    address: false,
    amount: false,
  })
  const [paymentType, setPaymentType] = useState('wallet')
  const [loading, setLoading] = useState(false)

  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      clearInterval(inscribeContext.intervalId)
      if (!inscribeContext.minted) {
        inscribeContext.setMintFailed(true)
        localStorage.setItem('mintFailed', 'true')
      }
      return <></>
    } else {
      return (
        <span>
          {hours}:{minutes}:{seconds}
        </span>
      )
    }
  }

  const copyToClipboard = (value, type) => {
    navigator.clipboard.writeText(value)
    setCopied({
      ...copied,
      [type]: true,
    })
  }

  const handlePay = async () => {
    if (walletContext.account) {
      if (typeof window === 'undefined') return
      const wallet = window.unisat
      try {
        let txid = await wallet.sendBitcoin(
          inscribeContext.orderDetail.fundingAddress,
          inscribeContext.orderDetail.amount
        )
        inscribeContext.setPaid(true)
        localStorage.setItem('paid', true)
      } catch (e) {
        // inscribeContext.setPaid(false)
        // localStorage.setItem('paid', '')
        toast(e.message)
        return
      }
    } else {
      inscribeContext.setPaid(false)
      localStorage.setItem('paid', '')
      toast('Please connect Unisat wallet')
      return
    }
  }

  const handlePaymentType = (type) => {
    setPaymentType(type)
  }

  useEffect(() => {
    console.log(inscribeContext.selectedBlock)
    async function paymentInitialize() {
      try {
        const transactionsQuery = query(
          ref(db, 'transactions'),
          orderByChild('orderId'),
          equalTo(inscribeContext.orderId)
        )

        onValue(transactionsQuery, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            const id = Object.keys(data)[0]
            const pendingTime = (Date.now() + 60000 * 60).toFixed(0)
            inscribeContext.setOrderDetail(data[id])
            inscribeContext.setPendingOrder(pendingTime)
            localStorage.setItem('pendingOrder1', pendingTime)
            console.log(data)
            localStorage.setItem('orderDetail', JSON.stringify(data[id]))
          }
        })
      } catch (error) {
        console.error(error)
      }
    }

    if (inscribeContext.orderId) paymentInitialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inscribeContext.orderId])

  useEffect(() => {
    // Prevent tab close
    window.addEventListener('beforeunload', function (e) {
      // Cancel the event
      e.preventDefault()
      // Chrome requires returnValue to be set
      e.returnValue = ''
    })

    // Prevent page refresh using F5 key
    document.addEventListener('keydown', function (e) {
      // Check if the F5 key is pressed
      if (e.keyCode === 116) {
        // Cancel the event
        e.preventDefault()
      }
    })

    // Prevent page refresh using browser's refresh button
    window.addEventListener('keydown', function (e) {
      // Check if the browser's refresh button is pressed
      if (e.keyCode === 82 && (e.ctrlKey || e.metaKey)) {
        // Cancel the event
        e.preventDefault()
      }
    })
  }, [])

  return (
    <div className='py-24 flex justify-center relative'>
      <div className='payment-card relative'>
        {inscribeContext?.orderDetail?.fundingAddress ? (
          <>
            <div className='pb-3 w-full'>
              <h4 className='text-2xl text-center text-gray-800'>
                Waiting on Payment in{' '}
                {inscribeContext?.pendingOrder && (
                  <Countdown
                    date={Number(inscribeContext.pendingOrder)}
                    renderer={renderer}
                  />
                )}
              </h4>
              <div className='my-2 p-2 text-center text-gray-500  border-b border-gray-500 overflow-x-hidden'>
                Order ID <br /> {`(${inscribeContext.orderDetail?.orderId})`}
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 w-full mb-3 bg-gray-200'>
              <div className='p-1'>
                <div
                  className={`flex  items-center p-3 w-full cursor-pointer h-full ${
                    paymentType === 'chain' ? 'bg-gray-300' : ''
                  }`}
                  onClick={() => handlePaymentType('chain')}
                >
                  <input
                    checked={paymentType === 'chain' ? 'checked' : ''}
                    id='default-radio-1'
                    type='radio'
                    value={paymentType}
                    onChange={() => handlePaymentType('chain')}
                    name='default-radio'
                    className='w-4 h-4 text-gray-300 bg-gray-100 border-gray-300 focus:ring-blue-500'
                  />
                  <label
                    htmlFor='default-radio-1'
                    className='ml-2 text-gray-900 dark:text-gray-700  cursor-pointer'
                  >
                    Pay on chain BTC
                  </label>
                </div>
              </div>
              <div className='p-1'>
                {' '}
                <div
                  className={`flex  items-center p-3 w-full cursor-pointer h-full ${
                    paymentType === 'wallet' ? 'bg-gray-300' : ''
                  }`}
                  onClick={() => handlePaymentType('wallet')}
                >
                  <input
                    checked={paymentType === 'wallet' ? 'checked' : ''}
                    id='default-radio-2'
                    type='radio'
                    value={paymentType}
                    name='default-radio'
                    onChange={() => handlePaymentType('wallet')}
                    className='w-4 h-4 text-gray-300 bg-gray-100 border-gray-300 focus:ring-blue-500'
                  />
                  <label
                    htmlFor='default-radio-2 '
                    className='ml-2 text-gray-900 dark:text-gray-700  cursor-pointer'
                  >
                    Pay with Wallet
                  </label>
                </div>
              </div>
            </div>
            <div className='flex flex-col items-center'>
              {inscribeContext.platformFee === 0 && (
                <p className='text-center text-green-600 text-sm'>
                  ( Whitelisted Address )
                </p>
              )}
              <div className='flex gap-1 text-gray-700'>
                <div>Service Fee : </div>
                <div>{feeAmount}</div>
              </div>

              <div className='flex gap-1 text-gray-700'>
                <div>Network Fee : </div>
                <div>{inscribeContext.orderDetail?.networkFee}</div>
              </div>

              <div className='flex gap-1 text-gray-700'>
                <div>Overhead : </div>
                <div>{inscribeContext.orderDetail?.overhead}</div>
              </div>

              <div className='flex p-1 items-center text-gray-700 flex-wrap justify-center'>
                <div>Total Amount : </div>
                <div className='flex items-center'>
                  <span className='text-lg ml-1'>
                    {(inscribeContext.orderDetail?.amount / 100000000).toFixed(
                      8
                    )}
                    BTC
                  </span>{' '}
                  ({inscribeContext.orderDetail?.amount}) sats
                  {copied.amount ? (
                    <FaCheck
                      className='ml-1'
                      onClick={() =>
                        copyToClipboard(
                          inscribeContext.orderDetail?.amount / 100000000,
                          'amount'
                        )
                      }
                    />
                  ) : (
                    <FaCopy
                      className='ml-1'
                      onClick={() =>
                        copyToClipboard(
                          inscribeContext.orderDetail?.amount / 100000000,
                          'amount'
                        )
                      }
                    />
                  )}
                </div>
              </div>
              {paymentType === 'chain' ? (
                <div>
                  <div className='flex flex-col items-center justify-center'>
                    <p className='text-center text-gray-600 text-sm py-2'>
                      Scan the QRCode to pay:
                    </p>
                    <div className='bg-gray-200 p-2.5 rounded drop-shadow-md shadow-sm shadow-black border-b border-t border-r border-l border-gray-300'>
                      {inscribeContext?.orderDetail?.fundingAddress && (
                        <QRCode
                          className='p-2 bg-gray-50'
                          value={inscribeContext?.orderDetail?.fundingAddress}
                          size={180}
                        />
                      )}
                    </div>
                    <div className='pt-3 flex flex-col justify-center'>
                      <p className='text-center text-gray-600 text-sm'>
                        or Copy address below
                      </p>
                      <p className='text-center flex justify-center text-gray-700'>
                        {inscribeContext?.orderDetail?.fundingAddress.slice(
                          0,
                          15
                        )}
                        ...
                        {inscribeContext?.orderDetail?.fundingAddress.slice(
                          -15
                        )}
                        <span>
                          {copied.address ? (
                            <FaCheck
                              className='ml-1'
                              onClick={() =>
                                copyToClipboard(
                                  inscribeContext?.orderDetail?.fundingAddress,
                                  'address'
                                )
                              }
                            />
                          ) : (
                            <FaCopy
                              className='ml-1'
                              onClick={() =>
                                copyToClipboard(
                                  inscribeContext?.orderDetail?.fundingAddress,
                                  'address'
                                )
                              }
                            />
                          )}
                        </span>
                      </p>
                    </div>
                    <p className='text-center text-gray-600 text-sm mt-4'>
                      After payment is made, you will receive the inscription
                      within at least 20 minutes.
                    </p>
                    <a
                      href='https://bitcoin.org/en/buy'
                      target='_blank'
                      className='underline hover:text-orange-400 transition ease-linear text-gray-700'
                    >
                      Need BTC? Click here to buy some BTC!
                    </a>
                  </div>
                </div>
              ) : (
                <div className='w-full'>
                  <div className='flex flex-col items-center justify-center'>
                    <p className='text-center text-gray-600 text-sm py-2'>
                      Scan the QRCode to pay:
                    </p>
                    <div className='bg-gray-200 p-2.5 rounded drop-shadow-md shadow-sm shadow-black border-b border-t border-r border-l border-gray-300'>
                      {inscribeContext?.orderDetail?.fundingAddress && (
                        <QRCode
                          className='p-2 bg-gray-50'
                          value={inscribeContext?.orderDetail?.fundingAddress}
                          size={180}
                        />
                      )}
                    </div>
                    <p className='text-center text-red-600 text-sm py-2 mt-3'>
                      Once you sent the amount, do NOT close this window and
                      wait for every step to complete!
                    </p>
                    <p className='text-center text-gray-600 text-sm py-2'>
                      You will receive the inscription within at least 10
                      minutes.
                    </p>
                    <a
                      href='https://bitcoin.org/en/buy'
                      target='_blank'
                      className='underline hover:text-orange-400 transition ease-linear text-gray-700'
                    >
                      Need BTC? Click here to buy some BTC!
                    </a>
                  </div>
                  {!inscribeContext.paid && (
                    <div className=' w-full mt-4'>
                      {walletContext.account &&
                        walletContext.type !== 'Unisat' && (
                          <button className={styles.inscribeButton}>
                            Pay with wallet
                          </button>
                        )}
                      {walletContext.account &&
                        walletContext.type === 'Unisat' && (
                          <button
                            className={styles.inscribeButton}
                            onClick={() => handlePay()}
                          >
                            Pay with wallet
                          </button>
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {!inscribeContext.paid ? (
              <div
                className='flex justify-center w-full mt-3 p-3 rounded z-10 text-sm cursor-pointer text-gray-500 hover:bg-gray-300 hover:text-white'
                onClick={() => inscribeContext.clearInscribeInfo()}
              >
                or Cancel Order
              </div>
            ) : (
              <div className='mt-3'>
                <Spinner />
              </div>
            )}
            <p className='text-[12px] text-gray-700 pt-2'>
              Order created at{' '}
              <Moment>
                {new Date(
                  Number(inscribeContext?.pendingOrder) - 60000 * 60
                ).toString()}
              </Moment>
            </p>
          </>
        ) : (
          <div className='animate-pulse w-full flex flex-col items-center'>
            <div className='w-100 h-8 bg-gray-300 animate-pulse'></div>
            <div className='flex flex-col items-center gap-3 mt-3'>
              <div className='w-60 h-6 bg-gray-300 animate-pulse'></div>
              <div className='mt-2 grid grid-cols-1 sm:grid-cols-2 w-100'>
                <div className='h-12 w-full bg-gray-300 animate-pulse mt-2'></div>
                <div className='h-12 w-full bg-gray-300 animate-pulse mt-2'></div>
              </div>
              <div className='w-[165px] h-[165px] bg-gray-300'></div>
            </div>
            <div className='flex flex-col items-center w-full'>
              <div className='w-80 h-14 bg-gray-300 animate-pulse mt-3'></div>
              <div className='w-20 h-6 bg-gray-300 animate-pulse mt-3'></div>
            </div>
          </div>
        )}
      </div>
      {/* <div className='inscribe h-[500px] mb-12'>
        <div className='pb-4 w-full'>
          <h4 className='text-2xl  text-center'>Waiting on Payment in </h4>
        </div>
        {}
      </div> */}
    </div>
  )
}

export default WaitingPayment

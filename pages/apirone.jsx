import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Apirone() {
  const [feeAddress, setFeeAddress] = useState()
  const [receiveAddress, setReceiveAddress] = useState()
  const [amount, setAmount] = useState()
  const [apirone, setApirone] = useState({})
  const [balance, setBalance] = useState()
  const [feeRate, setFeeRate] = useState()

  const generatePayAddress = async () => {
    const destinations = [
      {
        address: receiveAddress,
        amount: Number(amount),
      },
      {
        address: feeAddress,
      },
    ]
    let data = {}
    const response = await axios.post(`/apirone/wallets`, {
      currency: 'btc',
      destinations: destinations,
      'processing-fee-policy': 'percentage',
    })
    if (response && response.status === 200) {
      data = { ...data, wallets: response.data }
      const res = await axios.post(
        `/apirone/wallets/${response.data.wallet}/addresses`,
        {
          'addr-type': 'p2wpkh',
        }
      )
      if (res && res.status === 200) {
        data = { ...data, addresses: res.data }
        const fee = await fetch(
          `/apirone/wallets/${response.data.wallet}/transfer?destinations=${destinations[0].address}:${destinations[0].amount},${feeAddress}`
        )
        setFeeRate(await fee.json())
        setApirone(data)
        walletBalance(data.wallets.wallet)
      }
    }
    return null
  }

  const walletBalance = async (wallet) => {
    // setInterval(async () => {
    const res = await fetch(`/apirone/wallets/${wallet}/balance`)
    setBalance(await res.json())
    // }, 2000)
  }

  console.log(feeRate)

  return (
    <>
      <div className='grid grid-cols-2'>
        <div className='flex flex-col p-12'>
          <label>Pay Address</label>
          <input
            type='text'
            className='p-3 text-white '
            placeholder='receiveAddress'
            onChange={(e) => setReceiveAddress(e.target.value)}
          />
          <label>Amount</label>
          <input
            type='number'
            className='p-3 text-white '
            placeholder='amount'
            onChange={(e) => setAmount(e.target.value)}
          />
          <label>Fee Address</label>

          <input
            type='text'
            className='p-3 text-white '
            placeholder='feeAddress'
            onChange={(e) => setFeeAddress(e.target.value)}
          />
          <button
            className='bg-orange-400 p-3 mt-3'
            onClick={generatePayAddress}
          >
            Generate address
          </button>
        </div>
        <div className='p-12'>
          <label>wallet</label>
          <div className='w-full p-3 bg-gray-400'>
            {apirone?.wallets?.wallet}
          </div>
          <label>transfer_key</label>
          <div className='w-full p-3 bg-gray-400'>
            {apirone?.wallets?.transfer_key}
          </div>
          <label>address</label>
          <div className='w-full p-3 bg-gray-400'>
            {apirone?.addresses?.address}
          </div>
          <label>Available Balance</label>
          <div className='w-full p-3 bg-gray-400'>{balance?.available}</div>
          <label>Total Balance</label>
          <div className='w-full p-3 bg-gray-400'>{balance?.total}</div>
        </div>
      </div>
    </>
  )
}

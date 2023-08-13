import React, { useState, useEffect } from 'react'
import NFTStorageService from '@/services/nftStorage'
import {
  ref,
  push,
  query,
  orderByChild,
  equalTo,
  onValue,
  update,
} from 'firebase/database'
import { db } from '@/services/firebase'
import { v4 as uuidv4 } from 'uuid'
import { InscribeRadioContext } from './inscribeRadio'
import { useContext } from 'react'

export const InscribeContext = React.createContext()

const Inscribe = (props) => {
  const inscribeRadioContext = useContext(InscribeRadioContext)
  const [minted, setMinted] = useState(false)
  const [mintFailed, setMintFailed] = useState(false)
  const [paymentAddress, setPaymentAddress] = useState()
  const [serviceFee, setServiceFee] = useState()
  const [selectedBlock, setSelectedBlock] = useState([])
  const [receiveAddress, setReceiveAddress] = useState()
  const [pendingOrder, setPendingOrder] = useState()
  const [orderDetail, setOrderDetail] = useState()
  const [intervalId, setIntervalId] = useState()
  const [paid, setPaid] = useState(false)
  const [amount, setAmount] = useState(0)
  const [platformFee, setPlatformFee] = useState(1)
  const [orderId, setOrderId] = useState()

  const getNetworkFee = async () => {
    try {
      const response = await fetch('mempool')
      const result = await response.json()
      setNetworkFee(result)
    } catch (error) {}
  }

  const uploadFiles = async ({ orderId }) => {
    const dbQuery = query(
      ref(db, 'inscriptions'),
      orderByChild('orderId'),
      equalTo(orderId)
    )

    onValue(dbQuery, async (snapshot) => {
      const exist = snapshot.val()
      if (exist) {
        Object.keys(exist).map(async (key, index) => {
          const client = new NFTStorageService()

          const dbRef = ref(db, `/inscriptions/${key}`)
          let cid = ''
          if (selectedBlock[index]?.file) {
            cid = await client.storeToken([selectedBlock[index].file])
            update(dbRef, { ipfs_cid: cid })
          }
          update(dbRef, { ipfs_cid: '' })
        })
      }
    })
  }

  const checkOrder = async (orderId) => {
    if (orderId == null) return
    const response = await fetch('/api/checkOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderid: orderId,
      }),
    })
    if (response.status == 200) {
      const orderState = await response.json()
      return orderState
    } else {
      console.log(response.status)
    }
  }

  const initializeComponent = () => {
    const pendingOrderTime = Number(
      localStorage.getItem('pendingOrder1')
    ).toFixed(0)
    const orderDetail = localStorage.getItem('orderDetail')
    const serviceFee = localStorage.getItem('serviceFee')
    const paymentAddress = localStorage.getItem('paymentAddress')
    const interval = Number(localStorage.getItem('interval'))
    const minted = localStorage.getItem('minted')
    const mintFailed = localStorage.getItem('mintFailed')
    const selectedBlock = localStorage.getItem('selectedBlock')
    const receiveAddress = localStorage.getItem('receiveAddress')
    const paid = localStorage.getItem('paid')
    const amount = localStorage.getItem('amount')
    if (pendingOrderTime !== '0') {
      setPendingOrder(Number(pendingOrderTime))
      setOrderDetail(JSON.parse(orderDetail))
      setServiceFee(JSON.parse(serviceFee))
      setSelectedBlock(JSON.parse(selectedBlock))
      setPaymentAddress(paymentAddress)
      setReceiveAddress(receiveAddress)
      setAmount(Number(amount))
      clearInterval(interval)
      if (minted) setMinted(Boolean(minted))
      if (mintFailed) setMintFailed(Boolean(mintFailed))
      if (paid) setPaid(Boolean(paid))
    }
  }

  const clearInscribeInfo = () => {
    clearInterval(intervalId)
    localStorage.setItem('pendingOrder1', '')
    localStorage.setItem('orderDetail', '')
    localStorage.setItem('serviceFee', '')
    localStorage.setItem('blockNumber', '')
    localStorage.setItem('interval', '')
    localStorage.setItem('minted', '')
    localStorage.setItem('mintFailed', '')
    localStorage.setItem('selectedBlock', '')
    localStorage.setItem('receiveAddress', '')
    localStorage.setItem('paid', '')
    localStorage.setItem('paymentAddress', '')
    localStorage.setItem('amount', '')
    setPendingOrder('')
    setOrderDetail('')
    setPaymentAddress('')
    setIntervalId('')
    setMinted(false)
    setMintFailed(false)
    setPaid(false)
    setSelectedBlock([])
    setServiceFee()
    setReceiveAddress()
    setAmount()
  }

  const lookOrderByPooling = (orderId) => {
    if (!minted && !mintFailed) {
      let interval = setInterval(async () => {
        const res = await checkOrder(orderId)
        if (res && res?.status === 'minted') {
          if (!minted && !Boolean(localStorage.getItem('minted'))) {
            setMinted(true)
            localStorage.setItem('minted', true)
            clearInterval(interval)
            uploadFiles({
              orderId: orderId,
            })
            setIntervalId(interval)
          }
        }
      }, 5000)
      setIntervalId(interval)
      localStorage.setItem('interval', interval)
    }
  }

  const textToHex = (text) => {
    var encoder = new TextEncoder().encode(text)
    return [...new Uint8Array(encoder)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  }

  const inscribeOrder = async () => {
    let files = []
    selectedBlock.map((item) => {
      let text = item.blockNumber + '.bitradio'
      let mimetype = 'text/plain;charset=utf-8'
      files.push({
        text: text,
        name: textToHex(text),
        hex: textToHex(text),
        mimetype: mimetype,
        sha256: '',
      })
    })

    if (files.length > 10000) {
      toast(
        'Max. batch size is 10,000. Please remove some of your inscriptions and split them into many batches.'
      )
      return
    }

    const newOrderId = uuidv4()
    setOrderId(newOrderId)

    const dbQuery = query(ref(db, 'apiBase'))

    onValue(dbQuery, async (snapshot) => {
      const exist = snapshot.val()
      if (exist) {
        const apiBase = {
          fee: exist.fee,
          address: exist.address,
        }

        console.log(receiveAddress)

        inscribeRadioContext.inscribeOrder({
          files: files,
          feerate: serviceFee.economyFee,
          receiveAddress: receiveAddress,
          orderId: newOrderId,
          apiBase: apiBase,
        })
      }
    })
  }

  useEffect(() => {
    if (orderDetail) {
      lookOrderByPooling(orderDetail.orderId)
    }
  }, [orderDetail])

  useEffect(() => {
    getNetworkFee()
    lookOrderByPooling()

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <InscribeContext.Provider
      value={{
        minted,
        mintFailed,
        serviceFee,
        paymentAddress,
        setMinted,
        setMintFailed,
        setServiceFee,
        setPaymentAddress,
        selectedBlock,
        setSelectedBlock,
        receiveAddress,
        setReceiveAddress,
        orderDetail,
        setOrderDetail,
        pendingOrder,
        setPendingOrder,
        initializeComponent,
        clearInscribeInfo,
        setPaid,
        paid,
        setAmount,
        amount,
        setPlatformFee,
        platformFee,
        uploadFiles,
        setOrderId,
        orderId,
        inscribeOrder,
      }}
    >
      {props.children}
    </InscribeContext.Provider>
  )
}

export default Inscribe

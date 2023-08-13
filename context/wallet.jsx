import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { getAddress } from 'sats-connect'

export const WalletContext = React.createContext()

const Wallet = (props) => {
  const [account, setAccount] = useState()
  const [state, setState] = useState({
    isConnected: false,
  })
  const [copied, setCopied] = useState('0')
  const [type, setType] = useState()
  const [modal, setModal] = useState(false)

  const isConnected = async () => {
    const account = await window.unisat.getAccounts()
    setAccount(account[0])
    setState({ ...state, isConnected: true })
  }

  const connectwallet = async (newType) => {
    if (newType === 'Unisat') {
      if (typeof window?.unisat !== 'undefined') {
        try {
          const account = await window.unisat.requestAccounts()
          setAccount(account[0])
          setState({ ...state, isConnected: true })
        } catch (e) {
          toast('Wallet connect failed!')
        }
      } else {
        toast('Please install UniSat Wallet!', {})
      }
    } else if (newType === 'Okx') {
      if (typeof window?.okxwallet !== 'undefined') {
        try {
          const result = await window.okxwallet.bitcoin.connect()
          setAccount(result.address)
          setState({ ...state, isConnected: true })
        } catch (e) {
          toast('Wallet connect failed!')
        }
      } else {
        toast('Please install Okx Wallet!', {})
      }
    } else if (newType === 'Xverse') {
      const getAddressOptions = {
        payload: {
          purposes: ['ordinals', 'payment'],
          message: 'Address for receiving Ordinals and payments',
          network: {
            type: 'Mainnet',
          },
        },
        onFinish: async (response) => {
          setAccount(response.addresses[1].address)
          setState({ ...state, isConnected: true })
        },
        onCancel: () => alert('Request canceled'),
      }
      try {
        await getAddress(getAddressOptions)
      } catch (e) {
        toast('Please Install Xverse wallet!')
      }
    }
    setType(newType)
    setModal(false)
  }

  const disconnect = () => {
    setState({ ...state, isConnected: false })
    setType('')
    setAccount()
    if (window) {
      if (type === 'Unisat' && window.unisat) {
        // window.unisat
      } else if (type === 'Okx' && window.okx) {
        // window.okx.disconnect()
      } else if (type === 'Xverse' && window.xverse) {
        // window.xverse.disconnect()
      }
    }
  }

  const copyAddress = (e) => {
    e.preventDefault()
    navigator.clipboard.writeText(account)
    setCopied('1')
    setTimeout(() => {
      setCopied('0')
    }, 1000)
  }

  useEffect(() => {
    if (typeof window?.unisat !== 'undefined') {
      isConnected()
      setType('Unisat')
    } else {
      setState({ ...state, isConnected: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <WalletContext.Provider
      value={{
        connectwallet,
        copyAddress,
        disconnect,
        setModal,
        type,
        state,
        account,
        copied,
        modal,
      }}
    >
      {props.children}
    </WalletContext.Provider>
  )
}

export default Wallet

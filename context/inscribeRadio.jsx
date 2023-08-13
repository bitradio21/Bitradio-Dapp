import React from 'react'
import {
  padding,
  base_size,
  encodedAddressPrefix,
  feeAmount,
  feeAddress,
} from '@/configs/constants'
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

export const InscribeRadioContext = React.createContext()

const IncribeRadio = (props) => {
  function saveInscriptions(data) {
    const dbRef = ref(db, '/inscriptions')
    push(dbRef, data)
      .then(() => {
        console.log('Transaction saved successfully')
      })
      .catch((error) => {
        console.error('Error saving transaction:', error)
      })
  }

  function saveTransactionHistory(orderId) {
    const dbQuery = query(
      ref(db, 'transactions'),
      orderByChild('orderId'),
      equalTo(orderId)
    )

    onValue(dbQuery, async (snapshot) => {
      const exist = snapshot.val()
      if (exist) {
        const dbRef = ref(db, `/transactions/${Object.keys(exist)[0]}`)
        update(dbRef, { status: 'minted' })
      }
    })
  }

  let pushing = false
  const mempoolNetwork = ''

  async function isPushing() {
    while (pushing) {
      await sleep(10)
    }
  }

  function waitSomeSeconds(number) {
    let num = number.toString() + '000'
    num = Number(num)
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve('')
      }, num)
    })
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  function getData(url) {
    return new Promise(async function (resolve, reject) {
      function inner_get(url) {
        let xhttp = new XMLHttpRequest()
        xhttp.open('GET', url, true)
        xhttp.send()
        return xhttp
      }

      let data = inner_get(url)
      data.onerror = function (e) {
        resolve('error')
      }

      async function isResponseReady() {
        return new Promise(function (resolve2, reject) {
          if (!data.responseText || data.readyState != 4) {
            setTimeout(async function () {
              let msg = await isResponseReady()
              resolve2(msg)
            }, 1)
          } else {
            resolve2(data.responseText)
          }
        })
      }

      let returnable = await isResponseReady()
      resolve(returnable)
    })
  }

  async function pushBTCpmt(rawtx) {
    let txid

    try {
      txid = await postData(
        'https://mempool.space/' + mempoolNetwork + 'api/tx',
        rawtx
      )

      if (
        (txid.toLowerCase().includes('rpc error') ||
          txid.toLowerCase().includes('too many requests') ||
          txid.toLowerCase().includes('bad request')) &&
        !txid.includes('descendant')
      ) {
        if (encodedAddressPrefix == 'main') {
          txid = await postData('https://blockstream.info/api/tx', rawtx)
        }
      }
    } catch (e) {
      if (encodedAddressPrefix == 'main') {
        txid = await postData('https://blockstream.info/api/tx', rawtx)
      }
    }

    return txid
  }

  async function postData(url, json, content_type = '', apikey = '') {
    let rtext = ''

    function inner_post(url, json, content_type = '', apikey = '') {
      let xhttp = new XMLHttpRequest()
      xhttp.open('POST', url, true)
      if (content_type) {
        xhttp.setRequestHeader(`Content-Type`, content_type)
      }
      if (apikey) {
        xhttp.setRequestHeader(`X-Api-Key`, apikey)
      }
      xhttp.send(json)
      return xhttp
    }

    let data = inner_post(url, json, content_type, apikey)
    data.onerror = function (e) {
      rtext = 'error'
    }

    async function isResponseReady() {
      return new Promise(function (resolve, reject) {
        if (rtext == 'error') {
          resolve(rtext)
        }
        if (!data.responseText || data.readyState != 4) {
          setTimeout(async function () {
            let msg = await isResponseReady()
            resolve(msg)
          }, 50)
        } else {
          resolve(data.responseText)
        }
      })
    }

    let returnable = await isResponseReady()
    return returnable
  }

  async function loopTilAddressReceivesMoney(address, includeMempool) {
    let itReceivedMoney = false

    async function isDataSetYet(data_i_seek) {
      return new Promise(function (resolve, reject) {
        if (!data_i_seek) {
          setTimeout(async function () {
            try {
              itReceivedMoney = await addressOnceHadMoney(
                address,
                includeMempool
              )
            } catch (e) {}
            let msg = await isDataSetYet(itReceivedMoney)
            resolve(msg)
          }, 2000)
        } else {
          resolve(data_i_seek)
        }
      })
    }

    async function getTimeoutData() {
      let data_i_seek = await isDataSetYet(itReceivedMoney)
      return data_i_seek
    }

    let returnable = await getTimeoutData()
    return returnable
  }

  function isValidJson(content) {
    if (!content) return
    try {
      var json = JSON.parse(content)
    } catch (e) {
      return
    }
    return true
  }

  async function addressReceivedMoneyInThisTx(address) {
    let txid
    let vout
    let amt
    let nonjson

    try {
      nonjson = await getData(
        'https://mempool.space/' +
          mempoolNetwork +
          'api/address/' +
          address +
          '/txs'
      )

      if (
        nonjson.toLowerCase().includes('rpc error') ||
        nonjson.toLowerCase().includes('too many requests') ||
        nonjson.toLowerCase().includes('bad request')
      ) {
        if (encodedAddressPrefix == 'main') {
          nonjson = await getData(
            'https://blockstream.info/api/address/' + address + '/txs'
          )
        }
      }
    } catch (e) {
      if (encodedAddressPrefix == 'main') {
        nonjson = await getData(
          'https://blockstream.info/api/address/' + address + '/txs'
        )
      }
    }

    let json = JSON.parse(nonjson)
    json.forEach(function (tx) {
      tx['vout'].forEach(function (output, index) {
        if (output['scriptpubkey_address'] == address) {
          txid = tx['txid']
          vout = index
          amt = output['value']
        }
      })
    })
    return [txid, vout, amt]
  }

  async function addressOnceHadMoney(address, includeMempool) {
    let url
    let nonjson

    try {
      url = 'https://mempool.space/' + mempoolNetwork + 'api/address/' + address
      nonjson = await getData(url)

      if (
        nonjson.toLowerCase().includes('rpc error') ||
        nonjson.toLowerCase().includes('too many requests') ||
        nonjson.toLowerCase().includes('bad request')
      ) {
        if (encodedAddressPrefix == 'main') {
          url = 'https://blockstream.info/api/address/' + address
          nonjson = await getData(url)
        }
      }
    } catch (e) {
      if (encodedAddressPrefix == 'main') {
        url = 'https://blockstream.info/api/address/' + address
        nonjson = await getData(url)
      }
    }

    if (!isValidJson(nonjson)) return false
    let json = JSON.parse(nonjson)
    if (
      json['chain_stats']['tx_count'] > 0 ||
      (includeMempool && json['mempool_stats']['tx_count'] > 0)
    ) {
      return true
    }
    return false
  }

  function saveTransaction(data) {
    const dbRef = ref(db, '/transactions')
    push(dbRef, data)
      .then(() => {
        console.log('Transaction saved successfully')
      })
      .catch((error) => {
        console.error('Error saving transaction:', error)
      })
  }

  // function deleteTransaction(id) {
  //   const transactionsRef = ref(db, '/transactions')

  //   const transactionsQuery = query(
  //     transactionsRef,
  //     orderByChild('id'),
  //     equalTo(id)
  //   )

  //   onValue(transactionsQuery, (snapshot) => {
  //     const transactions = snapshot.val()

  //     if (transactions) {
  //       Object.keys(transactions).forEach((transactionKey) => {
  //         const transactionRef = ref(db, `transactions/${transactionKey}`)
  //         remove(transactionRef)
  //           .then(() => {
  //             console.log('Transaction deleted successfully')
  //           })
  //           .catch((error) => {
  //             console.error('Error deleting transaction:', error)
  //           })
  //       })
  //     }
  //   })
  // }

  function isWhiteListedAddress(address) {
    const whiteListedRef = ref(db, '/mintLists')

    const whiteListedQuery = query(
      whiteListedRef,
      orderByChild('receiveAddress'),
      equalTo(address)
    )

    return new Promise((resolve) => {
      onValue(whiteListedQuery, (snapshot) => {
        const exist = snapshot.val()
        resolve(exist && Object.keys(exist).length > 0 ? true : false) // Resolving the promise with a boolean value
      })
    })
  }

  function buf2hex(buffer) {
    // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  }

  function hexToBytes(hex) {
    return Uint8Array.from(
      hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    )
  }

  function bytesToHex(bytes) {
    return bytes.reduce(
      (str, byte) => str + byte.toString(16).padStart(2, '0'),
      ''
    )
  }

  const ec = new TextEncoder()

  async function inscribeOrder(data) {
    if (!typeof window) return
    if (!window.tapscript) return

    const { Address, Script, Signer, Tap, Tx } = window.tapscript
    let privkey = bytesToHex(cryptoUtils.Noble.utils.randomPrivateKey())

    const { files, feerate, receiveAddress, orderId, apiBase } = data

    // Create a keypair to use for testing.
    const KeyPair = cryptoUtils.KeyPair
    let seckey = new KeyPair(privkey)
    let pubkey = seckey.pub.rawX

    const init_script = [pubkey, 'OP_CHECKSIG']

    const init_script_backup = ['0x' + buf2hex(pubkey.buffer), 'OP_CHECKSIG']

    let init_leaf = await Tap.tree.getLeaf(Script.encode(init_script))
    let [init_tapkey, init_cblock] = await Tap.getPubKey(pubkey, {
      target: init_leaf,
    })

    const test_redeemtx = Tx.create({
      vin: [
        {
          txid: 'a99d1112bcb35845fd44e703ef2c611f0360dd2bb28927625dbc13eab58cd968',
          vout: 0,
          prevout: {
            value: 10000,
            scriptPubKey: ['OP_1', init_tapkey],
          },
        },
      ],
      vout: [
        {
          value: 8000,
          scriptPubKey: ['OP_1', init_tapkey],
        },
      ],
    })

    const test_sig = await Signer.taproot.sign(seckey.raw, test_redeemtx, 0, {
      extension: init_leaf,
    })
    test_redeemtx.vin[0].witness = [test_sig.hex, init_script, init_cblock]
    const isValid = await Signer.taproot.verify(test_redeemtx, 0, { pubkey })

    if (!isValid) {
      alert('Generated keys could not be validated. Please reload the app.')
      return
    }

    let inscriptions = []
    let total_fee = 0

    for (let i = 0; i < files.length; i++) {
      const hex = files[i].hex
      const data = hexToBytes(hex)
      const mimetype = ec.encode(files[i].mimetype)

      const script = [
        pubkey,
        'OP_CHECKSIG',
        'OP_0',
        'OP_IF',
        ec.encode('ord'),
        '01',
        mimetype,
        'OP_0',
        data,
        'OP_ENDIF',
      ]

      const script_backup = [
        '0x' + buf2hex(pubkey.buffer),
        'OP_CHECKSIG',
        'OP_0',
        'OP_IF',
        '0x' + buf2hex(ec.encode('ord')),
        '01',
        '0x' + buf2hex(mimetype),
        'OP_0',
        '0x' + buf2hex(data),
        'OP_ENDIF',
      ]

      const leaf = await Tap.tree.getLeaf(Script.encode(script))
      const [tapkey, cblock] = await Tap.getPubKey(pubkey, { target: leaf })

      let inscriptionAddress = Address.p2tr.encode(tapkey, encodedAddressPrefix)

      let prefix = 160
      if (files[i].sha256 != '') {
        prefix = feerate > 1 ? 546 : 700
      }

      const txsize = prefix + Math.floor(data.length / 4)

      const fee = feerate * txsize
      total_fee += fee

      inscriptions.push({
        leaf: leaf,
        tapkey: tapkey,
        cblock: cblock,
        inscriptionAddress: inscriptionAddress,
        txsize: txsize,
        fee: fee,
        script: script_backup,
        script_orig: script,
      })
    }

    let total_fees =
      total_fee +
      (69 + (inscriptions.length + 1) * 2 * 31 + 10) * feerate +
      base_size * inscriptions.length +
      padding * inscriptions.length

    let fundingAddress = Address.p2tr.encode(init_tapkey, encodedAddressPrefix)

    let service_fee =
      50 * feerate + feeAmount * inscriptions.length
    total_fees += service_fee

    let api_fee = 0
    if (apiBase) {
      api_fee = Number(apiBase.fee)
      total_fees += 50 * feerate + api_fee
    }

    let overhead =
      total_fees -
      total_fee -
      padding * inscriptions.length -
      service_fee -
      api_fee

    saveTransaction({
      keys: {
        seckey: seckey,
        pubkey: pubkey,
        secret: privkey,
      },
      fundingAddress: fundingAddress,
      inscriptions: inscriptions,
      orderId: orderId,
      receiveAddress: receiveAddress,
      files: files,
      inscribeBase: 'inscribeBase',
      overhead: overhead,
      networkFee: total_fee,
      service_fee: service_fee,
      amount: total_fees,
      status: 'pending',
    })

    await loopTilAddressReceivesMoney(fundingAddress, true)
    await waitSomeSeconds(2)

    let txinfo = await addressReceivedMoneyInThisTx(fundingAddress)

    let txid = txinfo[0]
    let vout = txinfo[1]
    let amt = txinfo[2]

    let outputs = []

    for (let i = 0; i < inscriptions.length; i++) {
      outputs.push({
        value: padding + inscriptions[i].fee,
        scriptPubKey: ['OP_1', inscriptions[i].tapkey],
      })
    }

    outputs.push({
      value: feeAmount * inscriptions.length,
      scriptPubKey: [
        'OP_1',
        Address.p2tr.decode(feeAddress, encodedAddressPrefix).hex,
      ],
    })

    if (apiBase)
      outputs.push({
        value: apiBase.fee * inscriptions.length,
        scriptPubKey: [
          'OP_1',
          Address.p2tr.decode(apiBase.address, encodedAddressPrefix).hex,
        ],
      })

    const init_redeemtx = Tx.create({
      vin: [
        {
          txid: txid,
          vout: vout,
          prevout: {
            value: amt,
            scriptPubKey: ['OP_1', init_tapkey],
          },
        },
      ],
      vout: outputs,
    })

    const init_sig = await Signer.taproot.sign(seckey.raw, init_redeemtx, 0, {
      extension: init_leaf,
    })
    init_redeemtx.vin[0].witness = [init_sig.hex, init_script, init_cblock]

    console.dir(init_redeemtx, { depth: null })

    let rawtx = Tx.encode(init_redeemtx).hex
    let _txid = await pushBTCpmt(rawtx)

    let include_mempool = true

    async function inscribe(inscription, vout) {
      // we are running into an issue with 25 child transactions for unconfirmed parents.
      // so once the limit is reached, we wait for the parent tx to confirm.

      await loopTilAddressReceivesMoney(
        inscription.inscriptionAddress,
        include_mempool
      )
      await waitSomeSeconds(2)
      let txinfo2 = await addressReceivedMoneyInThisTx(
        inscription.inscriptionAddress
      )

      let txid2 = txinfo2[0]
      let amt2 = txinfo2[2]

      const redeemtx = Tx.create({
        vin: [
          {
            txid: txid2,
            vout: vout,
            prevout: {
              value: amt2,
              scriptPubKey: ['OP_1', inscription.tapkey],
            },
          },
        ],
        vout: [
          {
            value: amt2 - inscription.fee,
            scriptPubKey: [
              'OP_1',
              Address.p2tr.decode(receiveAddress, encodedAddressPrefix).hex,
            ],
          },
        ],
      })

      const sig = await Signer.taproot.sign(seckey.raw, redeemtx, 0, {
        extension: inscription.leaf,
      })
      redeemtx.vin[0].witness = [
        sig.hex,
        inscription.script_orig,
        inscription.cblock,
      ]

      console.dir(redeemtx, { depth: null })

      let rawtx2 = Tx.encode(redeemtx).hex
      let _txid2

      // since we don't know any mempool space api rate limits, we will be careful with spamming
      await isPushing()
      pushing = true
      _txid2 = await pushBTCpmt(rawtx2)
      await sleep(1000)
      pushing = false

      if (_txid2.includes('descendant')) {
        include_mempool = false
        inscribe(inscription, vout)
        return
      }

      try {
        JSON.parse(_txid2)
      } catch (e) {
        saveInscriptions({
          block_no: Number(files[vout].text.slice(0, -9)),
          deployed_at: Date.now(),
          deployed_by: receiveAddress,
          inscription: _txid2,
          ipfs_cid: '',
          orderId: orderId,
        })
      }
    }

    for (let i = 0; i < inscriptions.length; i++) {
      inscribe(inscriptions[i], i)
    }
    saveTransactionHistory(orderId)
  }

  return (
    <InscribeRadioContext.Provider value={{ inscribeOrder }}>
      {props.children}
    </InscribeRadioContext.Provider>
  )
}

export default IncribeRadio

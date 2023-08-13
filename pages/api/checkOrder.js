import { Address, Script, Signer, Tap, Tx } from '@cmdcode/tapscript'
import { ecc, Field } from '@cmdcode/crypto-utils'
import { v4 as uuidv4 } from 'uuid'

import {
  padding,
  base_size,
  encodedAddressPrefix,
  feeAmount,
} from '@/configs/constants'
import {
  ref,
  push,
  query,
  orderByChild,
  equalTo,
  onValue,
  remove,
} from 'firebase/database'
import { db } from '@/services/firebase'

function getOrder(orderId) {
  const whiteListedRef = ref(db, '/transactions')

  const whiteListedQuery = query(
    whiteListedRef,
    orderByChild('orderId'),
    equalTo(orderId)
  )

  return new Promise((resolve) => {
    onValue(whiteListedQuery, (snapshot) => {
      const exist = snapshot.val()
      resolve(exist) // Resolving the promise with a boolean value
    })
  })
}

export default async function checkOrder(req, res) {
  if (req.method === 'POST') {
    const { orderid } = req.body
    if (orderid) {
      const order = await getOrder(orderid)

      if (order && Object.keys(order).length > 0) {

        res
          .status(200)
          .json(Object.values(order)[0])
      } else {
        res.status(405).json({ status: 'invalid order id' })
      }
    } else {
      res.status(405).json({ status: 'invalid order id' })
    }
  } else {
    res.status(405).end()
  }
}

import { useContext, useEffect } from 'react'
import InscribeCompnent from '@/components/InscribeComponent'
import CreateOrder from '@/components/CreateOrder'
import WaitingPayment from '@/components/WaitingPayment'
import Confirm from '@/components/Confirm'
import Layout from '@/components/Layout'
import { InscribeContext } from '@/context/inscribe'

export default function Inscribe() {
  const inscribeContext = useContext(InscribeContext)

  useEffect(() => {
    inscribeContext.initializeComponent()
  }, [])

  return (
    <Layout>
      {inscribeContext.minted ? (
        <Confirm text='The order is minted successfuly' status='minted' />
      ) : (
        <>
          {inscribeContext.mintFailed ? (
            <Confirm text='The order is expried' status='notPaid' />
          ) : (
            <>
              {!inscribeContext.serviceFee ? (
                <InscribeCompnent />
              ) : (
                <>
                  {inscribeContext.pendingOrder ? (
                    <WaitingPayment />
                  ) : (
                    <CreateOrder />
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </Layout>
  )
}

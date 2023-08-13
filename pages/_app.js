import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import 'tailwindcss/tailwind.css'
import 'react-range-slider-input/dist/style.css'
import Head from 'next/head'
import Script from 'next/script'
import { ToastContainer } from 'react-toastify'
import WalletContext from '@/context/wallet'
import AudioContext from '@/context/audio'
import InscribeRadioContext from '@/context/inscribeRadio'
import InscribeContext from '@/context/inscribe'
import NextNProgress from 'nextjs-progressbar'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link
          href='https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css'
          rel='stylesheet'
          integrity='sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1'
          crossOrigin='anonymous'
        />
      </Head>
      <Script
        src='https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js'
        integrity='sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW'
        crossOrigin='anonymous'
      />
      <Script src='/js/lib/wif.js'></Script>
      <Script src='/js/lib/buffer.6.0.3.js'></Script>
      <Script src='/js/lib/tapscript.1.2.7.js'></Script>
      <Script src='/js/lib/crypto-utils.1.5.11.js'></Script>
      <Script src='/js/lib/bech32.2.0.0.js'></Script>
      <Script src='/js/lib/qrcode.js'></Script>
      
      <InscribeRadioContext>
        <WalletContext>
          <AudioContext>
            <InscribeContext>
              <NextNProgress color='#f0932b' />
              <Component {...pageProps} />
              <ToastContainer />
            </InscribeContext>
          </AudioContext>
        </WalletContext>
      </InscribeRadioContext>
    </>
  )
}

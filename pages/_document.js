import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <meta name='description' content='Ordinal audio inscriptions.' />
        <meta
          name='keywords'
          content='bitradio, audio, inscription, bitcoin, brc20, nft, bitmap, radio'
        />
        <meta property='og:title' content={`BitRadio`} />
        <meta property='og:type' content='website' />
        <meta
          property='og:description'
          content={`BitRadio inscription platform. Audio inscription per block.`}
        />
        <meta property='og:url' content={`https://bitradio.netlify.app/`} />
        <meta property='og:site_name' content='BitRadio'></meta>
        <meta
          property='og:image'
          content='https://bitradio.netlify.app/metaImage.jpg'
        ></meta>
        <meta property='og:image:type' content='image/jpg'></meta>
        <meta property='og:image:width' content='2000'></meta>
        <meta property='og:image:height' content='2000'></meta>
        <meta property='og:image:alt' content='dashboard'></meta>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

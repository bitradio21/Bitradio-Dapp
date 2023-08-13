import React from 'react'
import Head from 'next/head'
import MenuBar from '@/components/Menu'

export default function Layout(props) {
  return (
    <main>
      <Head>
        <title>BitRadio</title>
        <meta name='description' content='Ordinal audio inscriptions.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='main'>
        <div className='content'>
          <MenuBar />
          {props.children}
        </div>
      </div>
    </main>
  )
}

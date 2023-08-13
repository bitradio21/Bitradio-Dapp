import Menu from '@/components/Menu'
import Head from 'next/head'

export default function About() {
  return (
    <main>
      <Head>
        <title>BitRadio</title>
        <meta name='description' content='Ordinal audio inscriptions.' />
        <link rel='icon' href='/public/assets/logo.png' />
      </Head>

      <div className='main'>
        <Menu />
        <div className='bg' />
        <div className='player'>about</div>
      </div>
    </main>
  )
}

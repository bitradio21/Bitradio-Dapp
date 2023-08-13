/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext } from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Image from 'next/image'
import mainLogo from '@/public/assets/logo.png'
import Link from 'next/link'
import { WalletContext } from '@/context/wallet'
import okx from '@/assets/okx.jpg'
import unisat from '@/assets/unisat.jpg'
import xverse from '@/assets/xverse.jpg'
import styles from '@/styles/inscribe.module.css'
import { FaTimes } from 'react-icons/fa'
import { GiHamburgerMenu } from 'react-icons/gi'

export default function MenuBar() {
  const walletcontext = useContext(WalletContext)

  return (
    <>
      <Navbar className='navbar'>
        <Container>
          <Link href='/'>
            <div className='main-logo text-3xl font-extrabold p-3 hover:text-[#FB923C]'>
              .bitradio
            </div>
          </Link>

          <Nav className='links-block'>
            <div className='lg:flex lg:justify-center lg:items-center hidden'>
              <Link className='text-[17px] text-gray-800' href='/'>
                Radio
              </Link>
            </div>
            <div className='lg:flex lg:justify-center lg:items-center hidden'>
              <Link className='text-[17px] text-gray-800' href='/inscribe'>
                Inscribe
              </Link>
            </div>
            <div className='lg:flex lg:justify-center lg:items-center hidden'>
              <Link className='text-[17px] text-gray-800' href='/audios'>
                Inscriptions
              </Link>
            </div>
            <div className='cs-dropdown group relative inline-block lg:hidden'>
              <a
                href='#'
                className='bg-orange-400 rounded text-white shadow-sm w-[60px] flex justify-center items-center hover:bg-[#b1630a] cursor-pointer transition ease-out h-full p-0'
              >
                <GiHamburgerMenu className='text-3xl p-0 m-0' />
              </a>
              <div className='pt-2 group-hover:block hidden transition ease-in-out absolute top-[50px] right-[-90px] sm:right-0 w-[180px] z-[1000!important]'>
                <ul className='bg-white border border-gray-500 rounded drop-shadow-md shadow-black py-1'>
                  <li className='py-2 px-3 flex hover:bg-gray-400  hover:text-white transition ease-out cursor-pointer'>
                    <Link
                      className='text-[17px] text-gray-800 hover:text-white '
                      href='/'
                    >
                      Radio
                    </Link>
                  </li>
                  <li className='py-2 px-3 flex hover:bg-gray-400  hover:text-white transition ease-out cursor-pointer'>
                    <Link
                      className='text-[17px] text-gray-800 hover:text-white '
                      href='/inscribe'
                    >
                      Inscribe
                    </Link>
                  </li>
                  <li className='py-2 px-3 flex hover:bg-gray-400  hover:text-white transition ease-out cursor-pointer'>
                    <Link
                      className='text-[17px] text-gray-800 hover:text-white '
                      href='/audios'
                    >
                      Audios
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className='cs-dropdown group relative'>
              {walletcontext.state.isConnected && walletcontext.account ? (
                <a
                  href='#'
                  className='bg-orange-400 p-3 rounded text-white shadow-sm text-[15px] hover:bg-[#b1630a] cursor-pointer transition ease-out'
                  onClick={(e) => walletcontext.copyAddress(e)}
                >
                  {(walletcontext.state.isConnected &&
                    walletcontext.type === 'Unisat') ||
                  !walletcontext.type ? (
                    <>
                      <Image
                        src={unisat}
                        alt='unisat'
                        width={20}
                        height={20}
                        className='mr-2 rounded-full'
                        objectFit='contain'
                      />
                    </>
                  ) : (
                    <>
                      {walletcontext.type === 'Okx' ? (
                        <>
                          <Image
                            src={okx}
                            alt='okx'
                            width={20}
                            height={20}
                            className='mr-2 rounded-full'
                            objectFit='contain'
                          />
                        </>
                      ) : (
                        <>
                          <Image
                            src={xverse}
                            alt='xverse'
                            width={20}
                            height={20}
                            className='mr-2 rounded-full'
                            objectFit='contain'
                            G
                          />
                        </>
                      )}
                    </>
                  )}
                  {walletcontext.account.slice(0, 4) +
                    '...' +
                    walletcontext.account.slice(-4)}
                  <span
                    className={styles.copiedWallet}
                    style={{ opacity: walletcontext.copied }}
                  >
                    Copied
                  </span>
                </a>
              ) : (
                <a
                  href='#'
                  className='bg-orange-400 p-3 rounded text-white shadow-sm text-[15px!important] hover:bg-[#b1630a] cursor-pointer transition ease-out'
                  onClick={() => walletcontext.setModal(true)}
                >
                  Connect Wallet
                </a>
              )}{' '}
              {walletcontext.state.isConnected && walletcontext.account && (
                <div className='pt-2 group-hover:block hidden transition ease-in-out absolute top-[50px] right-0 w-[190px]'>
                  <ul className='bg-white border border-gray-500 rounded drop-shadow-md shadow-black py-1'>
                    <>
                      <li
                        className='py-2 px-3 flex hover:bg-gray-400 transition ease-out cursor-pointer'
                        onClick={(e) => walletcontext.disconnect(e)}
                      >
                        Disconnect
                      </li>
                    </>
                  </ul>
                </div>
              )}
            </div>
          </Nav>
        </Container>
      </Navbar>
      {walletcontext.modal && (
        <div className='fixed h-full w-full bg-gray-500 top-0 left-0 bg-opacity-40 flex justify-center items-center z-[1000]'>
          <div className='px-3'>
            <div className='bg-white p-8 rounded-lg relative'>
              <div
                onClick={(e) => walletcontext.connectwallet('Unisat')}
                className='flex  items-center cursor-pointer border border-gray-300 hover:border-[#FB923Cimportant] transition ease-out p-3 rounded hover:bg-slate-100'
              >
                <Image
                  className='rounded-lg'
                  src={unisat}
                  alt='unisat'
                  width={40}
                  height={40}
                />
                <span className='ml-2 text-gray-800'>
                  Connect Unisat Wallet
                </span>
              </div>

              <div
                onClick={(e) => walletcontext.connectwallet('Okx')}
                className='flex items-center cursor-pointer border border-gray-300 hover:border-[#FB923Cimportant] transition ease-out p-3 rounded hover:bg-slate-100'
              >
                <Image
                  className='rounded-lg'
                  src={okx}
                  alt='unisat'
                  width={40}
                  height={40}
                />
                <span className='ml-2 text-gray-800'>Connect Okx Wallet</span>
              </div>

              <div
                onClick={(e) => walletcontext.connectwallet('Xverse')}
                className='flex items-center cursor-pointer border border-gray-300 hover:border-[#FB923Cimportant] transition ease-out p-3 rounded hover:bg-slate-100'
              >
                <Image
                  className='rounded-lg'
                  src={xverse}
                  alt='unisat'
                  width={40}
                  height={40}
                />
                <span className='ml-2 text-gray-800'>
                  Connect Xverse Wallet
                </span>
              </div>
              <span
                className='absolute -top-[30px] -right-[30px] p-2.5 rounded-full bg-white cursor-pointer'
                onClick={() => walletcontext.setModal(false)}
              >
                <FaTimes className=' hover:rotate-180 transition ease-in' />
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

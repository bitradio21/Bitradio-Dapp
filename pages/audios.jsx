import { useState, useEffect, useLayoutEffect, useContext, useRef } from 'react'
import Inscription from '@/components/inscription'
import { db } from '@/services/firebase'
import {
  onValue,
  ref,
  query,
  orderByChild,
  equalTo,
  update,
} from 'firebase/database'
import NFTStorageService from '@/services/nftStorage'
import { WalletContext } from '@/context/wallet'
import Link from 'next/link'
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
  FaTimes,
} from 'react-icons/fa'
import Layout from '@/components/Layout'
import styles from '@/styles/inscribe.module.css'
import { Spinner } from 'react-bootstrap'
import RangeSlider from 'react-range-slider-input'

function useWindowSize() {
  const [size, setSize] = useState([0, 0])
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  return size
}

export default function Inscribe() {
  const uploadAudioRef = useRef(null)
  const walletContext = useContext(WalletContext)
  const [loading, setLoading] = useState(false)
  const [blockData, setBlockData] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [step, setStep] = useState(100)
  const [audios, setAudios] = useState([])
  const [width] = useWindowSize()
  const [uploadKey, setUploadKey] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [modal, setModal] = useState(false)
  const [file, setFile] = useState()
  const [rangeSliderData, setRangeSliderData] = useState()

  const LastPage = () => {
    if (blockData.length % step === 0) {
      setCurrentPage(Math.ceil(blockData.length / step) - 1)
    } else {
      setCurrentPage(Number(String(blockData.length / step).split('.')[0]))
    }
  }

  const nextPage = () => {
    setCurrentPage(currentPage + 1)
  }

  const prePage = () => {
    setCurrentPage(currentPage - 1)
  }

  const firstPage = () => {
    setCurrentPage(0)
  }

  const getBlockData = async () => {
    setLoading(true)
    if (walletContext.account) {
      try {
        const dbQuery = query(
          ref(db, 'inscriptions'),
          orderByChild('deployed_by'),
          equalTo(walletContext.account)
        )

        onValue(dbQuery, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            setBlockData(Object.values(data))
            goto()
          } else {
            setBlockData([])
          }
          setLoading(false)
        })
      } catch (error) {
        console.log(error)
      }
    }
    setLoading(false)
  }

  const goto = () => {
    if (blockData) {
      let audios = blockData.slice(
        currentPage * step,
        currentPage * step + step
      )
      setAudios(audios)
    }
  }

  const uploadAudio = (key) => {
    uploadAudioRef.current.click()
    setUploadKey(key)
  }

  const upload = (file) => {
    setUploading(true)
    const dbQuery = query(
      ref(db, 'inscriptions'),
      orderByChild('block_no'),
      equalTo(audios[uploadKey].block_no)
    )

    onValue(dbQuery, async (snapshot) => {
      const client = new NFTStorageService()
      const cid = await client.storeToken([file])
      const inscriptionKey = Object.keys(snapshot.val())[0] // Assuming there's only one result
      const inscriptionRef = ref(db, `inscriptions/${inscriptionKey}`)
      await update(inscriptionRef, { ipfs_cid: cid }) // Assuming `update` is a function that updates the data
      setUploading(false)
      cancel()
      getBlockData()
    })
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    setFile(file)
    setModal(true)
  }

  const cancel = () => {
    uploadAudioRef.current.value = ''
    setFile()
    setModal(false)
  }

  const handleRangeDrag = () => {
    setCurrentPage(rangeSliderData[0])
  }

  useEffect(() => {
    goto()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, blockData, step])

  useEffect(() => {
    if (width) {
      if (width > 1024) {
        setStep(99)
      } else if (width <= 1024 && width >= 725) {
        setStep(59)
      } else if (width < 725) {
        setStep(35)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width])

  useEffect(() => {
    getBlockData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletContext.account])

  return (
    <Layout>
      <div className='py-24'>
        <div className='w-full inscribeContent relative'>
          <div className='text-3xl text-center pt-4'>
            <h2>My Inscriptions</h2>
          </div>
          <div className='py-2'>
            <div className='grid grid-cols-1 lg:gap-6 gap:2'>
              <div>
                {loading ? (
                  <div className='flex justify-center items-center w-100 min-h-[200px]'>
                    <h2 className='text-xl font-semibold text-center'>
                      Loading...
                    </h2>
                  </div>
                ) : (
                  <>
                    {audios.length ? (
                      <>
                        <div className='grid grid-cols-6 lg:grid-cols-10 gap-1 py-4'>
                          {audios.map((item, key) => {
                            return (
                              <div key={key}>
                                <Inscription
                                  ipfs_cid={item.ipfs_cid}
                                  blockNumber={item.block_no}
                                  uploadAudio={uploadAudio}
                                  index={key}
                                />
                              </div>
                            )
                          })}
                        </div>
                        <div className='w-full col-span-8 flex justify-center items-center'>
                          {blockData.length > 0 && (
                            <RangeSlider
                              min={0}
                              max={blockData.length / (step + 1)}
                              step={10}
                              onInput={(e) => setRangeSliderData(e)}
                              onRangeDragEnd={(e) => handleRangeDrag(e)}
                            />
                          )}
                        </div>
                        <div className='pt-2 flex justify-end gap-1 mt-3'>
                          <button
                            className='border border-[#FB923C!important] cursor-pointer rounded p-2 hover:bg-orange-500 hover:text-white'
                            onClick={firstPage}
                            disabled={currentPage === 0}
                          >
                            <FaAngleDoubleLeft />
                          </button>
                          <button
                            className='border border-[#FB923C!important] cursor-pointer rounded p-2 hover:bg-orange-500 hover:text-white'
                            onClick={prePage}
                            disabled={currentPage === 0}
                          >
                            <FaAngleLeft />
                          </button>
                          <input
                            type='text'
                            value={`${currentPage + 1} / ${
                              Number((blockData.length / step).toFixed(0)) + 1
                            }`}
                            className='border border-[#FB923C!important] rounded px-2 bg-transparent w-[100px] text-center outline-none'
                            readOnly
                          />
                          <button
                            className='border border-[#FB923C!important] cursor-pointer rounded p-2 hover:bg-orange-500 hover:text-white'
                            onClick={nextPage}
                            disabled={
                              currentPage + 1 ===
                              Math.ceil(blockData.length / step)
                            }
                          >
                            <FaAngleRight />
                          </button>
                          <button
                            className='border border-[#FB923C!important] cursor-pointer rounded p-2 hover:bg-orange-500 hover:text-white'
                            onClick={LastPage}
                            disabled={
                              currentPage + 1 ===
                              Math.ceil(blockData.length / step)
                            }
                          >
                            <FaAngleDoubleRight />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='flex justify-center items-center w-100 min-h-[200px]'>
                          <div>
                            <h2 className='text-2xl font-semibold text-center'>
                              You do not have any audio
                            </h2>
                            <div className='flex justify-center pt-3'>
                              <Link
                                href={'/inscribe'}
                                className='hover:underline p-3 bg-orange-400 text-white rounded-md hover:bg-[#b1630a] cursor-pointer transition ease-out'
                              >
                                Inscribe Now
                              </Link>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {modal && (
          <div className='fixed h-full w-full bg-gray-500 top-0 left-0 bg-opacity-40 flex justify-center items-center z-[1000] transition ease-in-out duration-200'>
            <div className='px-3'>
              <div className='bg-white p-12 rounded-lg relative'>
                {!uploading ? (
                  <>
                    <p className='text-gray-800 text-center'>
                      <span className='text-gray-800 underline text-xl'>
                        {file.name}
                      </span>
                    </p>
                    <p className='text-sm text-gray-600 text-center w-full pt-4'>
                      Please check again before uploading. <br /> You can not
                      change after uploaded.
                    </p>
                    <div className='flex justify-around pt-4'>
                      <button
                        onClick={() => cancel()}
                        className='hover:drop-shadow-lg hover:bg-red-500 transition ease-out max-w-[100px] w-100 drop-shadow bg-red-400 rounded text-white py-2 px-3'
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => upload(file)}
                        className='hover:drop-shadow-lg hover:bg-orange-500 transition ease-out max-w-[100px] w-100 drop-shadow bg-orange-400 rounded text-white py-2 px-3 '
                      >
                        Yes
                      </button>
                    </div>
                    <span
                      onClick={() => cancel()}
                      className='absolute -top-[30px] -right-[30px] p-2.5 rounded-full bg-white cursor-pointer'
                    >
                      <FaTimes className='hover:rotate-180 transition ease-in' />
                    </span>
                  </>
                ) : (
                  <div className='flex justify-center items-center gap-3'>
                    <Spinner size='md' className='text-[16px] text-gray-800' />
                    <p className='text-center text-xl text-gray-800'>
                      Uploading...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <input
          accept='audio/*'
          type='file'
          ref={uploadAudioRef}
          onChange={(e) => handleUpload(e)}
          className='hidden'
        />
      </div>
    </Layout>
  )
}

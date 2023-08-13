import React, {
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  useContext,
} from 'react'
import { WalletContext } from '@/context/wallet'
import Spinner from 'react-bootstrap/Spinner'
import styles from '@/styles/inscribe.module.css'
import { validate } from 'bitcoin-address-validation'
import { db } from '@/services/firebase'
import {
  onValue,
  ref,
  query,
  orderByChild,
  startAt,
  endAt,
  equalTo,
} from 'firebase/database'
import {
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
} from 'react-icons/fa'
import Block from '@/components/Block'
import { InscribeContext } from '@/context/inscribe'
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

const Inscribe = () => {
  const walletContext = useContext(WalletContext)
  const inscribeContext = useContext(InscribeContext)
  const uploadRef = useRef(null)
  const [width] = useWindowSize()
  const [receiveAddress, setReceiveAddress] = useState('')
  const [isValidAddress, setIsvalidAddress] = useState(false)
  const [loading, setLoading] = useState({
    calculating: false,
    uploading: false,
    address: false,
    block: false,
    orderProcessing: false,
    blockAvailable: false,
    fetchBlock: false,
  })
  const [blockData, setBlockData] = useState([])
  const [selectedBlock, setSelectedBlock] = useState([])
  const [uploadKey, setUploadKey] = useState(0)
  const [step, setStep] = useState()
  const [blockRange, setBlockRange] = useState()
  const [currentPage, setCurrentPage] = useState(0)
  const [modal, setModal] = useState(false)
  const [latestblock, setLatestBlock] = useState(800000)
  const [rangeSliderData, setRangeSliderData] = useState()

  const checkAddress = () => {
    setIsvalidAddress(validate(receiveAddress))
    setLoading({
      ...loading,
      address: false,
    })
  }

  const calculatePrice = async () => {
    setLoading({
      ...loading,
      calculating: true,
    })

    try {
      const APIUrl = `/mempool/api/v1/fees/recommended`
      const response = await fetch(APIUrl)
      const result = await response.json()
      if (result) {
        inscribeContext.setServiceFee(result)
        inscribeContext.setSelectedBlock(selectedBlock)
        inscribeContext.setReceiveAddress(receiveAddress)
        localStorage.setItem('receiveAddress', receiveAddress)
        localStorage.setItem('serviceFee', JSON.stringify(result))
      }
    } catch (error) {
      console.log(error)
    }

    setLoading({
      ...loading,
      calculating: false,
    })
  }

  const cancelBlock = (key) => {
    const tempData = [...blockData]
    tempData[key] = {
      ...tempData[key],
      taken: false,
      selected: false,
      uploaded: false,
      file: '',
    }

    setBlockData(tempData)
    setSelectedBlock((data) =>
      data.filter((block) => block.blockNumber != tempData[key].blockNumber)
    )
  }

  const selectBlock = (key) => {
    const tempData = blockData
    tempData[key].selected = true
    setBlockData(tempData)
    setSelectedBlock((data) => [...data, tempData[key]])
    setUploadKey(key)
  }

  const LastPage = () => {
    if (latestblock % (step + 1) === 0) {
      setCurrentPage(Math.ceil(latestblock / (step + 1)) - 1)
    } else {
      setCurrentPage(Number(String(latestblock / (step + 1)).split('.')[0]))
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

  const uploadAudio = (key) => {
    uploadRef.current.click()
    setUploadKey(key)
  }

  const handleUpload = async (val) => {
    setModal(true)
    const tempData = [...blockData]
    const selectBlock = [...selectedBlock]
    const tempSelectedBlock = []
    tempData[uploadKey] = {
      ...tempData[uploadKey],
      uploaded: true,
      file: val,
    }
    selectBlock.map((item) => {
      if (item.blockNumber === tempData[uploadKey].blockNumber) {
        tempSelectedBlock.push({
          ...tempData[uploadKey],
          uploaded: true,
          file: val,
        })
      } else {
        tempSelectedBlock.push(item)
      }
    })
    setBlockData(tempData)
    setSelectedBlock(tempSelectedBlock)
    uploadRef.current.value = ''
    setTimeout(() => {
      setModal(false)
    }, 1500)
  }

  const checkTaken = (indexBlock, exist) => {
    for (let key in exist) {
      const element = exist[key]
      if (element.block_no === indexBlock) {
        return {
          blockNumber: indexBlock,
          taken: true,
          selected: false,
          uploaded: false,
          file: '',
          ipfs_cid: element.ipfs_cid,
        }
      }
    }

    return {
      blockNumber: indexBlock,
      taken: false,
      selected: false,
      uploaded: false,
      file: '',
      ipfs_cid: '',
    }
  }

  const getBlockRange = (callback) => {
    try {
      const dbQuery = query(
        ref(db, 'inscriptions'),
        orderByChild('block_no'),
        startAt(blockRange.from),
        endAt(blockRange.to + 1)
      )

      onValue(dbQuery, (snapshot) => {
        const data = snapshot.val()
        callback(data)
      })
    } catch (error) {
      console.log(error)
    }
  }

  const getBlockData = async () => {
    if (blockRange?.to) {
      getBlockRange(async (exist) => {
        let blockData = []
        for (
          let index = blockRange.from + 1;
          index <= blockRange.to + 1;
          index++
        ) {
          if (exist) {
            const data = await checkTaken(index, exist)
            blockData.push(data)
          } else {
            blockData.push({
              blockNumber: index,
              taken: false,
              selected: false,
              uploaded: false,
              file: '',
              ipfs_cid: '',
            })
          }
        }
        setBlockData(blockData)
      })
    }
  }

  const getLatestBlockInfo = async () => {
    try {
      const response = await fetch(`/blocks/latestblock`)
      const result = await response.json()
      if (result) setLatestBlock(result.height)
    } catch (error) {
      console.log('Backend API error')
    }
  }

  const handleRangeDrag = () => {
    setCurrentPage(rangeSliderData[0])
  }

  useEffect(() => {
    if (receiveAddress) {
      setLoading({
        ...loading,
        address: true,
      })
      setIsvalidAddress(false)
      const delayDebounceFn = setTimeout(() => {
        checkAddress()
      }, 1000)

      return () => clearTimeout(delayDebounceFn)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiveAddress])

  useEffect(() => {
    if (walletContext.account) setReceiveAddress(walletContext.account)
  }, [walletContext.account])

  useEffect(() => {
    if (currentPage * (step + 1) + step > latestblock) {
      setBlockRange({
        from: currentPage * (step + 1),
        to: latestblock - 1,
      })
    } else {
      setBlockRange({
        from: currentPage * (step + 1),
        to: currentPage * (step + 1) + step,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, step])

  useEffect(() => {
    getBlockData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockRange])

  useEffect(() => {
    if (width) {
      if (width > 1024) {
        setStep(99)
        setBlockRange({
          from: 0,
          to: 99,
        })
      } else if (width <= 1024 && width >= 725) {
        setStep(59)
        setBlockRange({
          from: 0,
          to: 59,
        })
      } else if (width < 725) {
        setStep(35)
        setBlockRange({
          from: 0,
          to: 35,
        })
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width])

  useEffect(() => {
    getLatestBlockInfo()
  }, [])

  return (
    <div className='py-24'>
      <div className='w-full inscribeContent relative'>
        <div className='text-4xl text-center py-4 text-gray-800'>
          <h2>Inscribe bitradio</h2>
        </div>

        <div className='py-2'>
          <div className={styles.inscribeForm}>
            <input
              type='text'
              name='address'
              id='address'
              className='text-gray-700'
              placeholder='Enter a bitcoin wallet address'
              value={receiveAddress}
              onChange={(e) => setReceiveAddress(e.target.value)}
            />
            {loading.address ? (
              <Spinner size='sm' className={styles.inscribeAdressStatus} />
            ) : (
              <>
                {receiveAddress && isValidAddress && (
                  <FaCheckCircle
                    className={styles.inscribeAdressStatus}
                    aria-hidden='true'
                  />
                )}
                {receiveAddress && !isValidAddress && (
                  <FaExclamationCircle
                    className={styles.inscribeAdressStatus}
                    aria-hidden='true'
                  />
                )}
              </>
            )}
          </div>
          <div className='grid grid-cols-1 lg:gap-6 gap:2'>
            <div>
              {!blockData.length ? (
                <div className='flex justify-center items-center w-100 min-h-[200px]'>
                  <h2 className='text-xl font-semibold text-center'>
                    Loading...
                  </h2>
                </div>
              ) : (
                <>
                  <div className='grid grid-cols-6 lg:grid-cols-10 gap-1 py-4'>
                    <>
                      {blockData.map((item, key) => {
                        return (
                          <Block
                            index={key}
                            blockNumber={item.blockNumber}
                            selected={item.selected}
                            taken={item.taken}
                            uploaded={item.uploaded}
                            key={key}
                            file={item.file}
                            ipfs_cid={item.ipfs_cid}
                            uploadRef={uploadRef}
                            selectBlock={selectBlock}
                            cancelBlock={cancelBlock}
                            uploadAudio={uploadAudio}
                          />
                        )
                      })}
                    </>
                  </div>
                  <div className='w-full col-span-8 flex justify-center items-center'>
                    <RangeSlider
                      min={0}
                      max={latestblock / (step + 1)}
                      step={10}
                      onInput={(e) => setRangeSliderData(e)}
                      onRangeDragEnd={(e) => handleRangeDrag(e)}
                    />
                  </div>
                  <div className='flex gap-0.5 justify-end w-100 mt-3'>
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
                      value={`${currentPage + 1} / ${(
                        latestblock /
                        (step + 1)
                      ).toFixed(0)}`}
                      className='border border-[#FB923C!important] rounded px-2 bg-transparent w-[120px] text-center outline-none'
                      readOnly
                    />
                    <button
                      className='border border-[#FB923C!important] cursor-pointer rounded p-2 hover:bg-orange-500 hover:text-white'
                      onClick={nextPage}
                      disabled={
                        currentPage + 1 === Math.ceil(latestblock / (step + 1))
                      }
                    >
                      <FaAngleRight />
                    </button>
                    <button
                      className='border border-[#FB923C!important] cursor-pointer rounded p-2 hover:bg-orange-500 hover:text-white'
                      onClick={LastPage}
                      disabled={
                        currentPage + 1 === Math.ceil(latestblock / (step + 1))
                      }
                    >
                      <FaAngleDoubleRight />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {selectedBlock.length && receiveAddress && isValidAddress ? (
          <button className={styles.inscribeButton} onClick={calculatePrice}>
            {loading.uploading || loading.calculating ? (
              <span className='flex items-center h-full'>
                <Spinner className='mr-2 mt-1' size='sm' color='white' />
                Pleae wait...
              </span>
            ) : (
              <>
                Next <FaArrowRight className='ml-2 mt-0.5' />
              </>
            )}
          </button>
        ) : (
          <button disabled className={styles.inscribeButtonDisable}>
            <span>Next</span> <FaArrowRight className='ml-2' />
          </button>
        )}
        <input
          accept='audio/*'
          type='file'
          ref={uploadRef}
          onChange={(e) => handleUpload(e.target.files[0])}
          className='hidden'
        />
      </div>

      {modal && (
        <div className='fixed h-full w-full bg-gray-500 top-0 left-0 bg-opacity-40 flex justify-center items-center z-[1000]'>
          <div className='px-3'>
            <div className='bg-white p-8 rounded-lg relative'>
              <p className='text-xl'>Uploading...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inscribe

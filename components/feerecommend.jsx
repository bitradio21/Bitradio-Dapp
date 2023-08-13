// @flow
import React from 'react'

const FeeRecommend = ({ feeRecommended, selectFeeOption, feeOption }) => {
  return (
    <>
      {feeRecommended ? (
        <div className='text-center grid grid-cols-1 sm:grid-cols-3 gap-2'>
          <div
            className={`cursor-pointer rounded p-2 sm:p-3 hover:bg-[#c4bfbb] ${
              feeOption === 'economy' ? 'bg-[#c4bfbb]' : 'bg-gray-200'
            }`}
            onClick={() => selectFeeOption('economy')}
          >
            <div className='my-2 text-gray-700'>Economy</div>
            <div className='text-gray-700'>
              <span className='font-semibold text-orange-600'>
                {feeRecommended.economyFee}
              </span>{' '}
              sats/vB
            </div>
          </div>
          <div
            className={`cursor-pointer rounded p-2 sm:p-3 hover:bg-[#c4bfbb] ${
              feeOption === 'normal' ? 'bg-[#c4bfbb]' : 'bg-gray-200'
            }`}
            onClick={() => selectFeeOption('normal')}
          >
            <div className='my-2 text-gray-700'>Normal</div>
            <div className='text-gray-700'>
              <span className='font-semibold text-orange-600'>
                {feeRecommended.halfHourFee}
              </span>{' '}
              sats/vB
            </div>
          </div>
          <div
            className={`cursor-pointer rounded p-2 sm:p-3 hover:bg-[#c4bfbb] ${
              feeOption === 'custom' ? 'bg-[#c4bfbb]' : 'bg-gray-200'
            }`}
            onClick={() => selectFeeOption('custom')}
          >
            <div className='my-2 text-gray-700'>Custom</div>
            <div className='text-gray-700'>
              <span className='font-semibold text-orange-600'>
                {feeRecommended.fastestFee}
              </span>{' '}
              sats/vB
            </div>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-3 text-center'>
          <div className='fex animate-pulse  p-3 bg-gray-300'>
            <div className='my-2 text-gray-700'>Economy</div>
            <div className='bg-[#c4bfbb]'></div>
          </div>
          <div className='fex animate-pulse bg-gray-300 p-3'>
            <div className='my-2 text-gray-700'>Normal</div>
            <div className='bg-[#c4bfbb]'></div>
          </div>
          <div className='fex animate-pulse bg-gray-300  p-3'>
            <div className='my-2 text-gray-700'>Custom</div>
            <div className='bg-[#c4bfbb]'></div>
          </div>
        </div>
      )}
    </>
  )
}
export default FeeRecommend

'use client'

import { useState } from 'react'

import Image from 'next/image'

import Skeleton from '@mui/material/Skeleton'

import CustomAvatar from '@core/components/mui/Avatar'

const ENDPOINT = process.env.NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT

const OptimizedS3Image = ({
  src,
  alt = 'Image',
  width,
  height,
  fill = false,
  className = '',
  quality = 80,
  priority = false,
  sizes,
  style = {}
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (!src || hasError) {
    if (fill) {
      return (
        <div className='flex items-center justify-center w-full h-full bg-gray-50'>
          <div className='flex flex-col items-center gap-2 text-gray-400'>
            <i className='ri-image-line' style={{ fontSize: '4rem' }} />
            <span className='text-sm'>Sin imagen</span>
          </div>
        </div>
      )
    }

    return (
      <CustomAvatar skin='light' color='primary' size={width || 38}>
        <i className='ri-image-line text-xl' />
      </CustomAvatar>
    )
  }

  const isAbsolute = src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')
  const imageUrl = isAbsolute ? src : `${ENDPOINT}${src}`

  const baseProps = {
    src: imageUrl,
    alt,
    className,
    quality,
    priority,
    sizes,
    onError: () => setHasError(true),
    onLoad: () => setIsLoading(false),
    style: { borderRadius: '8px', ...style }
  }

  if (fill) {
    return (
      <div className='relative w-full h-full'>
        {isLoading && (
          <Skeleton variant='rectangular' width='100%' height='100%' animation='wave' sx={{ position: 'absolute' }} />
        )}
        <Image
          {...baseProps}
          fill
          style={{
            ...baseProps.style,
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      </div>
    )
  }

  const finalWidth = width || 38
  const finalHeight = height || 38

  return (
    <div className='relative' style={{ width: finalWidth, height: finalHeight }}>
      {isLoading && (
        <Skeleton
          variant='rectangular'
          width={finalWidth}
          height={finalHeight}
          animation='wave'
          sx={{ position: 'absolute' }}
        />
      )}
      <Image
        {...baseProps}
        width={finalWidth}
        height={finalHeight}
        style={{
          ...baseProps.style,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  )
}

export default OptimizedS3Image

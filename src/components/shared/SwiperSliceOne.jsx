'use client'

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Typography } from '@mui/material'
import 'swiper/css'

export default function  SwiperSliceOne (props){
    const { id, stroke, img, alt, title, description } = props;
    // Parallax effect state
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e) => {
          setMousePosition({
            x: (e.clientX / window.innerWidth - 0.5) * 30,
            y: (e.clientY / window.innerHeight - 0.5) * 30
          })
        }
    
        window.addEventListener('mousemove', handleMouseMove, { passive: true })
        return () => window.removeEventListener('mousemove', handleMouseMove)
      }, [])

  return (
    <>
    <SwiperSlide>
        <div className='w-full h-full relative overflow-hidden'>
          {/* Partículas flotantes */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>

          {/* Ondas SVG animadas */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.4">
                    <animate attributeName="offset" values="0;1;0" dur="4s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="white" stopOpacity="0.2">
                    <animate attributeName="offset" values="0;1;0" dur="4s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="white" stopOpacity="0.4">
                    <animate attributeName="offset" values="0;1;0" dur="4s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
              <path
                d="M0 50 Q25 25 50 50 T100 50"
                fill="none"
                stroke={stroke}
                strokeWidth="0.3"
              >
                <animate attributeName="d"
                  values="M0 50 Q25 25 50 50 T100 50;M0 50 Q25 75 50 50 T100 50;M0 50 Q25 25 50 50 T100 50"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>

          {/* Imagen de fondo con parallax real */}
          <div
            className="absolute inset-0 transform scale-110"
            style={{
              transform: `scale(1.1) translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
            }}
          >
            <img
              src={img}
              alt={alt}
              className="w-full h-full object-cover filter blur-sm"
            />
          </div>

          {/* Overlay gradiente mejorado */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/65 to-primary/45"></div>

          {/* Contenido centrado con parallax */}
          <div
            className="relative z-10 w-full h-full flex items-center justify-center"
            style={{
              transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`
            }}
          >
            <div className="text-center text-white max-w-3xl mx-auto px-8">
              {/* Icono elegante con glassmorphism */}
              <div className="mb-8 relative flex justify-center">
                <div className="relative">
                  {/* Círculo de fondo con glassmorphism */}
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                    <i className="ri-team-line text-4xl text-white/90"></i>
                  </div>
                  {/* Anillos decorativos */}
                  <div className="absolute inset-0 w-24 h-24 border-2 border-white/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 w-24 h-24 border border-white/30 rounded-full animate-pulse"></div>
                </div>
              </div>

              <Typography variant='h2' className='font-bold mb-6' sx={{
                color: 'white',
                fontWeight: 900,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                fontSize: '3.5rem',
                letterSpacing: '-0.02em'
              }}>
                {title}
              </Typography>

              <Typography variant='h5' sx={{
                color: 'white',
                opacity: 0.95,
                lineHeight: 1.8,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                fontWeight: 400,
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                {description}
              </Typography>

              {/* Línea decorativa */}
              <div className="mt-8 flex justify-center">
                <div className="w-20 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>

    </>
  )
}

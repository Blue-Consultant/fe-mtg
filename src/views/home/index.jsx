'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'
import Hero from './Hero'
import Features from './Features'
import CourtsGallery from './CourtsGallery'
import { getFeaturedCourts } from '@/views/courts/api'
import { getCourtTypes } from '@/views/court-types/api'

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCkxwNTN80W92h8FFRooe-SVQDY3EHEFlNblXYKbuBqBvUkV5_3dy11HyIdm4PzJffKJi36m2kHJ6sBssWPpdYlUMmljhgYhYDuSh5S3qJ0dNxXt_PUAHyEUPxKJ8VaK5WA_MbXcMrEOYtBQhzsyqXoHhp3RKpNmXP5liIvwpFV1flQSDBwfA634aJO5g67Yf7g5cIbG576q5kzfwnPIDE-xrvGrvd22kwzs3PWDrFIMqaDGkJyZIcKDSFEHbnV52uKcLcvl7eubwM7'

const HomeIndex = ({ dictionary, lang }) => {
  const router = useRouter()
  const usuario = useSelector(state => state.loginReducer?.user)
  const [featuredCourts, setFeaturedCourts] = useState([])
  const [courtTypesList, setCourtTypesList] = useState([])

  useEffect(() => {
    if (!usuario?.id) return
    getFeaturedCourts(usuario.id).then(setFeaturedCourts).catch(() => setFeaturedCourts([]))
  }, [usuario?.id])

  useEffect(() => {
    getCourtTypes(true).then(list => setCourtTypesList(Array.isArray(list) ? list : [])).catch(() => setCourtTypesList([]))
  }, [])

  // Quitar scroll del body en esta página (hero a pantalla completa)
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const handleSearch = useCallback(
    searchData => {
      const { fecha, hora_inicio, hora_fin, court_type_id } = searchData
      const hInicio = (hora_inicio || '').replace(':', '-')
      const hFin = (hora_fin || '').replace(':', '-')
      let path = `/${lang}/explorar/buscar/${fecha}/${hInicio}/${hFin}`
      if (court_type_id != null && court_type_id !== '') path += `/${court_type_id}`
      router.push(path)
    },
    [lang, router]
  )

  return (
    <Box className={commonLayoutClasses.contentFullBleedRoot} sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <Hero
        title={
          <>
            Tu pasión, tu cancha. <br />
            <Box component='span' sx={{ color: 'primary.main' }}>
              Reserva en un click.
            </Box>
          </>
        }
        subtitle='Encuentra la loza deportiva perfecta, compara horarios y asegúrala en segundos sin llamadas ni esperas.'
        imageSrc={HERO_IMAGE}
        onSearch={handleSearch}
        courtTypesList={courtTypesList}
        searchLoading={false}
      />
    </Box>
  )
}

export default memo(HomeIndex, (prevProps, nextProps) => prevProps.lang === nextProps.lang)

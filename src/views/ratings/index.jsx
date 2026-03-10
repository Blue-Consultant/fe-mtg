'use client'

import React from 'react'

import { Typography, Button, IconButton, TextField, InputAdornment, Card, CardContent } from '@mui/material'

import { AnimatePresence, motion } from 'framer-motion'

import RatingCards from './components/RatingCards'
import RatingForm from './components/RatingForm'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { useRatingsClient } from './hooks/useRatingsClient'
import CanAccess from '@/components/permissions/CanAccess'

const RatingsIndex = ({ dictionary }) => {
  const {
    ratingsReducer,
    usuario,
    loading,
    showform,
    setShowform,
    dataProp,
    setDataProp,
    openConfirmDialog,
    setOpenConfirmDialog,
    courtsList,
    pagination,
    handleSearchChange,
    handlePageChange,
    handleSetDefautProps,
    addOrUpdateRating,
    deactivateRatings
  } = useRatingsClient(dictionary)

  const controller = {
    loading,
    showform,
    dataProp,
    pagination,
    courtsList,
    usuario,
    setShowform,
    setDataProp,
    setOpenConfirmDialog,
    handlePageChange,
    handleSetDefautProps,
    addOrUpdateRating
  }

  return (
    <div>
      <AnimatePresence mode='wait'>
        <motion.div
          key='table'
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.1 }}
        >
          <Card>
            <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
              {showform ? (
                <div className='flex items-center gap-3'>
                  <IconButton onClick={handleSetDefautProps} color='secondary' size='small'>
                    <i className='ri-arrow-left-line text-2xl' />
                  </IconButton>
                  <Typography variant='h4' className='mbe-1'>
                    {dataProp.action === 'edit' ? 'Editar valoración' : 'Nueva valoración'}
                  </Typography>
                </div>
              ) : (
                <>
                  <div>
                    <Typography variant='h4' className='mbe-1'>
                      Valoraciones
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Valoraciones de canchas por usuarios
                    </Typography>
                  </div>
                  <div className='flex flex-wrap items-center gap-1'>
                    <CanAccess permission='crear'>
                      <Button
                        startIcon={<i className='ri-add-line' />}
                        variant='contained'
                        onClick={() => {
                          setDataProp({ action: 'add', data: null })
                          setShowform(true)
                        }}
                      >
                        Agregar
                      </Button>
                    </CanAccess>
                    <TextField
                      placeholder='Buscar...'
                      size='small'
                      onChange={e => handleSearchChange(e.target.value)}
                      className='sm:is-[350px] max-sm:flex-1'
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <i className='ri-search-line text-textSecondary' />
                          </InputAdornment>
                        )
                      }}
                    />
                  </div>
                </>
              )}
            </CardContent>

            <motion.div
              key={showform ? 'form' : 'list'}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.1 }}
            >
              {showform ? (
                <RatingForm controller={controller} />
              ) : (
                <RatingCards controller={controller} ratingsReducer={ratingsReducer} />
              )}
            </motion.div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={deactivateRatings}
        moduleName='Valoración'
      />
    </div>
  )
}

export default RatingsIndex

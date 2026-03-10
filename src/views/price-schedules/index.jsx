'use client'

// React Imports
import React from 'react'

// MUI Imports
import { Typography, Button, IconButton, TextField, InputAdornment, Card, CardContent } from '@mui/material'

// Component Imports
import { AnimatePresence, motion } from 'framer-motion'

import PriceScheduleCards from './components/PriceScheduleCards'
import PriceScheduleForm from './components/PriceScheduleForm'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'

// Custom Hook
import { usePriceSchedulesClient } from './hooks/usePriceSchedulesClient'

// Third-party Imports
import CanAccess from '@/components/permissions/CanAccess'

const PriceSchedulesIndex = ({ dictionary }) => {
  const {
    memoizedDictionary,
    priceSchedulesReducer,
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
    handlePageSizeChange,
    handleSortChange,
    handleSetDefautProps,
    addOrUpdatePriceSchedule,
    deactivatePriceSchedules
  } = usePriceSchedulesClient(dictionary)

  // CONTROLLER - Contiene todo lo necesario para los componentes hijos
  const controller = {
    // Data
    loading,
    showform,
    dataProp,
    pagination,
    memoizedDictionary,
    courtsList,
    usuario,

    // Setters
    setShowform,
    setDataProp,
    setOpenConfirmDialog,

    // Pagination handlers
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,

    // Business Methods
    handleSetDefautProps,
    addOrUpdatePriceSchedule
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
                <>
                  <div className='flex items-center gap-3'>
                    <IconButton onClick={handleSetDefautProps} color='secondary' size='small'>
                      <i className='ri-arrow-left-line text-2xl' />
                    </IconButton>
                    <Typography variant='h4' className='mbe-1'>
                      {dataProp.action === 'edit' ? 'Editar horario de precio' : 'Crear nuevo horario de precio'}
                    </Typography>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Typography variant='h4' className='mbe-1'>
                      Horarios de Precios
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Gestiona los horarios y precios de las canchas
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
                        className={``}
                      >
                        Agregar
                      </Button>
                    </CanAccess>
                    <TextField
                      placeholder='Buscar horario...'
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
              key={showform ? 'price-schedule-form' : 'price-schedule-list'}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.1 }}
            >
              {showform ? (
                <PriceScheduleForm controller={controller} />
              ) : (
                <PriceScheduleCards controller={controller} priceSchedulesReducer={priceSchedulesReducer} />
              )}
            </motion.div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={deactivatePriceSchedules}
        moduleName={'PriceSchedule'}
      />
    </div>
  )
}

export default PriceSchedulesIndex

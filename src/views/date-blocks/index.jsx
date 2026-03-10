'use client'

import React from 'react'

import { Typography, Button, IconButton, TextField, InputAdornment, Card, CardContent } from '@mui/material'

import { AnimatePresence, motion } from 'framer-motion'

import DateBlockCards from './components/DateBlockCards'
import DateBlockForm from './components/DateBlockForm'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { useDateBlocksClient } from './hooks/useDateBlocksClient'
import CanAccess from '@/components/permissions/CanAccess'

const DateBlocksIndex = ({ dictionary }) => {
  const {
    dateBlocksReducer,
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
    addOrUpdateDateBlock,
    deactivateDateBlocks
  } = useDateBlocksClient(dictionary)

  const controller = {
    loading,
    showform,
    dataProp,
    pagination,
    courtsList,
    setShowform,
    setDataProp,
    setOpenConfirmDialog,
    handlePageChange,
    handleSetDefautProps,
    addOrUpdateDateBlock
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
                    {dataProp.action === 'edit' ? 'Editar bloqueo de fecha' : 'Crear bloqueo de fecha'}
                  </Typography>
                </div>
              ) : (
                <>
                  <div>
                    <Typography variant='h4' className='mbe-1'>
                      Bloqueos de fecha
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Bloquea canchas por mantenimiento, eventos, etc.
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
                <DateBlockForm controller={controller} />
              ) : (
                <DateBlockCards controller={controller} dateBlocksReducer={dateBlocksReducer} />
              )}
            </motion.div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={deactivateDateBlocks}
        moduleName='Bloqueo de fecha'
      />
    </div>
  )
}

export default DateBlocksIndex

'use client'

import React from 'react'
import {
  Typography,
  Button,
  IconButton,
  Card,
  CardContent
} from '@mui/material'
import CourtTypeCards from './components/CourtTypeCards'
import CourtTypeForm from './components/CourtTypeForm'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { useCourtTypesClient } from './hooks/useCourtTypesClient'
import { AnimatePresence, motion } from 'framer-motion'
import CanAccess from '@/components/permissions/CanAccess'

const CourtTypesIndex = ({ dictionary }) => {
  const {
    courtTypesReducer,
    loading,
    showform,
    setShowform,
    dataProp,
    setDataProp,
    openConfirmDialog,
    setOpenConfirmDialog,
    handleSetDefautProps,
    addOrUpdateCourtType,
    deactivateCourtType
  } = useCourtTypesClient(dictionary)

  const controller = {
    loading,
    showform,
    dataProp,
    setShowform,
    setDataProp,
    setOpenConfirmDialog,
    handleSetDefautProps,
    addOrUpdateCourtType
  }

  return (
    <div>
      <AnimatePresence mode='wait'>
        <motion.div
          key='court-types'
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
                    {dataProp.action === 'edit' ? 'Editar tipo de cancha' : 'Nuevo tipo de cancha'}
                  </Typography>
                </div>
              ) : (
                <>
                  <div>
                    <Typography variant='h4' className='mbe-1'>
                      Tipos de cancha
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Gestiona los tipos de cancha (Fútbol, Vóley, Básquet, etc.)
                    </Typography>
                  </div>
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
                <CourtTypeForm controller={controller} />
              ) : (
                <CourtTypeCards controller={controller} courtTypesReducer={courtTypesReducer} />
              )}
            </motion.div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={deactivateCourtType}
        moduleName='Tipo de cancha'
      />
    </div>
  )
}

export default CourtTypesIndex

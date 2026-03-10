'use client'

import React, { useRef } from 'react'

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Grid,
  LinearProgress
} from '@mui/material'
import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  Support as SupportIcon,
  Code as CodeIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const FilesInstructions = ({
  uploadedFiles,
  contexts,
  isUploading,
  uploadProgress,
  onFileUpload,
  onAddContext,
  onToggleContext,
  onDeleteContext,
  onDeleteFile
}) => {
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  const handleDrop = e => {
    e.preventDefault()
    const files = e.dataTransfer.files

    onFileUpload(files)
  }

  const handleDragOver = e => {
    e.preventDefault()
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Grid container spacing={4}>
        {/* Upload Zone */}
        <Grid item xs={12} md={6}>
          <Card className='h-full bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-150 ease-out'>
            <CardContent>
              <Typography variant='h6' className='font-semibold text-cyan-800 mb-4'>
                Cargar Documentos
              </Typography>

              <Paper
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className='border-2 border-dashed border-cyan-300 p-8 text-center cursor-pointer hover:border-cyan-400 transition-all duration-150 ease-out hover:bg-cyan-50'
                onClick={handleFileSelect}
              >
                <CloudUploadIcon className='text-cyan-500 text-4xl mb-3' />
                <Typography variant='h6' className='text-cyan-700 mb-2'>
                  Arrastra archivos aquí o haz clic
                </Typography>
                <Typography variant='body2' className='text-cyan-600'>
                  Soporta PDF, DOC, DOCX, TXT hasta 10MB
                </Typography>

                {isUploading && (
                  <Box className='mt-4'>
                    <LinearProgress
                      variant='determinate'
                      value={uploadProgress}
                      className='mb-2'
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#E0F2FE',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#0288D1',
                          borderRadius: 3
                        }
                      }}
                    />
                    <Typography variant='body2' className='text-cyan-600'>
                      Subiendo... {uploadProgress}%
                    </Typography>
                  </Box>
                )}
              </Paper>

              <input
                ref={fileInputRef}
                type='file'
                multiple
                accept='.pdf,.doc,.docx,.txt'
                onChange={e => onFileUpload(e.target.files)}
                className='hidden'
              />

              <Button
                variant='contained'
                startIcon={<CloudUploadIcon />}
                size='small'
                onClick={handleFileSelect}
                className='mt-4 w-full transition-all duration-150 ease-out'
              >
                Seleccionar Archivos
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* File List */}
        <Grid item xs={12} md={6}>
          <Card className='h-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-150 ease-out'>
            <CardContent>
              <Typography variant='h6' className='font-semibold text-emerald-800 mb-4'>
                Archivos Cargados
              </Typography>

              {uploadedFiles.length === 0 ? (
                <Box className='text-center py-8'>
                  <DescriptionIcon className='text-emerald-400 text-4xl mb-2' />
                  <Typography variant='body2' className='text-emerald-600'>
                    No hay archivos cargados
                  </Typography>
                </Box>
              ) : (
                <List className='max-h-96 overflow-y-auto'>
                  {uploadedFiles.map(file => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      layout
                    >
                      <ListItem className='mb-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-150 ease-out'>
                        <ListItemIcon>
                          <DescriptionIcon className='text-emerald-600' />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.uploadDate.toLocaleDateString()}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge='end'
                            aria-label='delete'
                            onClick={() => onDeleteFile(file.id)}
                            className='text-red-500 hover:text-red-700 transition-all duration-150 ease-out'
                            size='small'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Context Management */}
        <Grid item xs={12}>
          <Card className='bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 shadow-lg hover:shadow-xl transition-all duration-150 ease-out'>
            <CardContent>
              <Box className='flex items-center justify-between mb-4'>
                <Typography variant='h6' className='font-semibold text-violet-800'>
                  Gestión de Contextos
                </Typography>
                <Button
                  variant='outlined'
                  color='secondary'
                  startIcon={<AddIcon />}
                  onClick={onAddContext}
                  className='transition-all duration-150 ease-out'
                  size='medium'
                >
                  Agregar Contexto
                </Button>
              </Box>

              <Grid container spacing={2}>
                {contexts.map(context => (
                  <Grid item xs={12} sm={6} md={4} key={context.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.1, ease: 'easeOut' }
                      }}
                      whileTap={{
                        scale: 0.98,
                        transition: { duration: 0.05, ease: 'easeOut' }
                      }}
                      layout
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-150 ease-out hover:shadow-lg ${
                          context.active ? 'ring-2 ring-violet-500 ring-offset-2' : ''
                        }`}
                        onClick={() => onToggleContext(context.id)}
                      >
                        <CardContent className='text-center p-4'>
                          <Box
                            className='w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center'
                            style={{ backgroundColor: context.color }}
                          >
                            {context.type === 'platform' && <SupportIcon className='text-white text-2xl' />}
                            {context.type === 'academic' && <SchoolIcon className='text-white text-2xl' />}
                            {context.type === 'lessons' && <CodeIcon className='text-white text-2xl' />}
                            {context.type === 'custom' && <AutoAwesomeIcon className='text-white text-2xl' />}
                          </Box>
                          <Typography variant='subtitle1' className='font-semibold mb-1'>
                            {context.name}
                          </Typography>
                          <Typography variant='body2' className='text-gray-600 mb-2'>
                            {context.type === 'platform' && 'Soporte técnico'}
                            {context.type === 'academic' && 'Asistencia educativa'}
                            {context.type === 'lessons' && 'Contenido personalizado'}
                            {context.type === 'custom' && 'Contexto personalizado'}
                          </Typography>
                          <Chip
                            label={context.active ? 'Activo' : 'Inactivo'}
                            color={context.active ? 'success' : 'default'}
                            size='small'
                            className='mb-2'
                          />
                          <Box className='mt-2'>
                            <IconButton
                              size='small'
                              onClick={e => {
                                e.stopPropagation()
                                onDeleteContext(context.id)
                              }}
                              className='text-red-500 hover:text-red-700 transition-all duration-150 ease-out'
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  )
}

export default FilesInstructions

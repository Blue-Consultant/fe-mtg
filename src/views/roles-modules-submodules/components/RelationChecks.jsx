import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

export const RelationChecks = ({
    dictionary,
    localSubModulesList,
    selectedSubModules,
    handleSelectAllSubModules,
    toggleModuleExpansion,
    handleSubModuleToggle,
    theme,
    loadingSubModules,
    localModulesList,
    localModule,
    expandedModules,
    existingSubModules = [],
}) => {

    return (
        <Grid container spacing={2} sx={{
            mb: 4,
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'action.hover'
          }}>
            <Grid item xs={12}>
              <Box className='flex items-center justify-between mb-3'>
                <Typography variant='h6' className='font-semibold' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='ri-function-line' style={{ fontSize: '1.25rem' }} />
                  {dictionary.common?.submodules || 'Submódulos'}
                </Typography>
                {localSubModulesList.length > 0 && (() => {
                  // Calcular submódulos disponibles (excluyendo los ya asignados)
                  const availableSubModules = localSubModulesList.filter(sm => !existingSubModules.includes(sm.id))
                  const availableCount = availableSubModules.length

                  return (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={availableCount > 0 && selectedSubModules.length === availableCount}
                          indeterminate={selectedSubModules.length > 0 && selectedSubModules.length < availableCount}
                          onChange={handleSelectAllSubModules}
                          color="primary"
                          disabled={availableCount === 0}
                        />
                      }
                      label={
                        <Typography variant='body2' className='font-medium'>
                          {dictionary.common?.selectAll || 'Seleccionar todos'}
                          {availableCount < localSubModulesList.length && (
                            <span style={{ fontSize: '0.75rem', marginLeft: '4px', opacity: 0.7 }}>
                              ({availableCount} disponibles)
                            </span>
                          )}
                        </Typography>
                      }
                    />
                  )
                })()}
              </Box>
              {existingSubModules.length > 0 && (
                <Box
                sx={{
                  p: '8px 12px',
                  backgroundColor: (theme) => `${theme.palette.primary.main}08`,
                  border: (theme) => `1px solid ${theme.palette.primary.main}30`,
                  borderRadius: '6px',
                  mb: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <InfoOutlinedIcon
                  sx={{ color: (theme) => theme.palette.primary.main, fontSize: '1.1rem' }}
                />
                <Typography
                  variant='body2'
                  sx={{
                    color: (theme) => theme.palette.primary.dark,
                    fontSize: '0.85rem',
                  }}
                >
                  Los submódulos deshabilitados ya se encuentran relacionados a este rol y no se pueden volver a ser seleccionados.
                </Typography>
              </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              {loadingSubModules ? (
                <Box className='flex items-center justify-center p-6'>
                  <CircularProgress size={30} />
                  <Typography className='ml-3'>Cargando submódulos...</Typography>
                </Box>
              ) : localSubModulesList.length === 0 ? (
                <Typography color='textSecondary' className='text-center p-6' sx={{
                  fontStyle: 'italic',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}>
                  <i className='ri-information-line' />
                  No hay submódulos disponibles para este módulo
                </Typography>
              ) : (
                <Box className='space-y-4'>
                  {localModule.map((moduleId) => {
                    const module = localModulesList.find(m => m.id === moduleId)
                    const moduleSubModules = localSubModulesList.filter(sm => sm.module_id === moduleId)
                    const isExpanded = expandedModules[moduleId]

                    if (moduleSubModules.length === 0) return null

                    return (
                      <Box key={moduleId} className='mb-4'>
                        <Box
                          className='flex items-center gap-2 mb-2 pb-2 border-b-2 cursor-pointer'
                          onClick={() => toggleModuleExpansion(moduleId)}
                          sx={{
                            borderColor: 'primary.main',
                            '&:hover': {
                              backgroundColor: (theme) => `${theme.palette.primary.main}0D`
                            }
                          }}
                        >
                          <i
                            className={isExpanded ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'}
                            color='text.primary'
                            style={{
                              fontSize: '1.5rem',
                              transition: 'transform 0.3s ease'
                            }}
                          />
                          <i className='ri-folder-line' style={{ fontSize: '1.25rem', color: theme.palette.primary.main }} />
                          <Typography className='font-medium' style={{ color: theme.palette.primary.main }}>
                            {module?.name || 'Módulo'}
                          </Typography>
                          <Typography className='font-medium' color='text.primary'>
                            ({moduleSubModules.length} {moduleSubModules.length === 1 ? 'submódulo' : 'submódulos'})
                          </Typography>
                        </Box>

                        {/* Grid de submódulos con animación de colapso */}
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Grid container spacing={1.5} sx={{ mt: 1 }}>
                            {moduleSubModules.map((subModule) => {
                              const isExisting = existingSubModules.includes(subModule.id)

                              return (
                              <Grid item xs={12} sm={6} md={4} lg={3} key={subModule.id}>
                                <Tooltip
                                  title={isExisting ? "Este submódulo ya está asignado a este rol" : ""}
                                  arrow
                                  placement="top"
                                >
                                  <Box
                                    className={isExisting ? 'cursor-not-allowed' : 'cursor-pointer'}
                                    onClick={() => !isExisting && handleSubModuleToggle(subModule.id)}
                                    sx={{
                                      p: '10px 12px',
                                      border: '1.5px solid',
                                      borderColor: isExisting || selectedSubModules.includes(subModule.id)
                                        ? 'primary.main'
                                        : '#E0E0E0',
                                      borderRadius: '8px',
                                      backgroundColor: isExisting || selectedSubModules.includes(subModule.id)
                                        ? (theme) => `${theme.palette.primary.main}14`
                                        : 'white',
                                      transition: 'all 0.2s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      minHeight: '48px',
                                      opacity: isExisting ? 0.75 : 1,
                                      position: 'relative',
                                      '&:hover': !isExisting && !selectedSubModules.includes(subModule.id) ? {
                                        borderColor: 'primary.light',
                                        backgroundColor: (theme) => `${theme.palette.primary.main}0A`
                                      } : {}
                                    }}
                                  >
                                    <Checkbox
                                      checked={isExisting || selectedSubModules.includes(subModule.id)}
                                      onChange={(e) => {
                                        e.stopPropagation()
                                        handleSubModuleToggle(subModule.id)
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                      }}
                                      disabled={isExisting}
                                      size="small"
                                      sx={{
                                        padding: 0,
                                        '& .MuiSvgIcon-root': { fontSize: 20 }
                                      }}
                                      color="primary"
                                    />
                                    <Typography
                                      variant='body2'
                                      sx={{
                                        fontWeight: (isExisting || selectedSubModules.includes(subModule.id)) ? 600 : 400,
                                        color: (isExisting || selectedSubModules.includes(subModule.id))
                                          ? 'primary.main'
                                          : 'text.primary',
                                        fontSize: '0.875rem',
                                        lineHeight: 1.3,
                                        flex: 1
                                      }}
                                    >
                                      {subModule.name}
                                    </Typography>
                                    {isExisting && (
                                      <i
                                        className='ri-check-double-line'
                                        style={{
                                          fontSize: '1.1rem',
                                          color: theme.palette.primary.main,
                                          marginLeft: 'auto'
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Tooltip>
                              </Grid>
                            )})}
                          </Grid>
                        </Collapse>
                      </Box>
                    )
                  })}
                </Box>
              )}
            </Grid>
          </Grid>
    )
}

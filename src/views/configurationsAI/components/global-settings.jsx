'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
  MenuItem
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const GlobalSettings = ({
  aiModel,
  onModelChange,
  showAdvancedSettings,
  onAdvancedSettingsChange,
  onSaveConfiguration,
  onTestConfiguration,
  onResetConfiguration
}) => {
  const aiModels = [
    {
      value: 'gpt-4o',
      label: 'GPT-4 Omni',
      description: 'Modelo más avanzado y versátil',
      features: ['Respuestas precisas', 'Comprensión avanzada', 'Razonamiento complejo'],
      color: '#3B82F6'
    },
    {
      value: 'gpt-4-turbo',
      label: 'GPT-4 Turbo',
      description: 'Equilibrio entre velocidad y calidad',
      features: ['Respuesta rápida', 'Buena precisión', 'Costo optimizado'],
      color: '#10B981'
    },
    {
      value: 'gpt-3.5-turbo',
      label: 'GPT-3.5 Turbo',
      description: 'Modelo rápido y económico',
      features: ['Muy rápido', 'Costo bajo', 'Respuestas básicas'],
      color: '#F59E0B'
    },
    {
      value: 'claude-3',
      label: 'Claude 3',
      description: 'Alternativa de alta calidad',
      features: ['Excelente precisión', 'Análisis profundo', 'Seguridad avanzada'],
      color: '#8B5CF6'
    }
  ];

  const selectedModel = aiModels.find(model => model.value === aiModel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Grid container spacing={4}>
        {/* AI Model Selection */}
        <Grid item xs={12} md={6}>
          <Card className="h-full bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 shadow-lg hover:shadow-xl transition-all duration-150 ease-out">
            <CardContent>
              <Box className="flex items-center mb-4">
                <SmartToyIcon className="text-rose-600 mr-2" />
                <Typography variant="h6" className="font-semibold text-rose-800">
                  Modelo de IA
                </Typography>
              </Box>

              <TextField
                select
                fullWidth
                label="Seleccionar Modelo"
                value={aiModel}
                onChange={(e) => onModelChange(e.target.value)}
                variant="outlined"
                className="mb-4 transition-all duration-150 ease-out"
              >
                {aiModels.map((model) => (
                  <MenuItem key={model.value} value={model.value}>
                    <Box className="flex items-center">
                      <Box
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: model.color }}
                      />
                      {model.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {selectedModel && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <Typography variant="body2" className="text-rose-600 mb-3">
                    {selectedModel.description}
                  </Typography>

                  <Box className="bg-white p-3 rounded-lg shadow-sm">
                    <Typography variant="subtitle2" className="font-semibold mb-2">
                      Características del modelo:
                    </Typography>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedModel.features.map((feature, index) => (
                        <li style={{ listStyle: 'none' }} key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </Box>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Advanced Settings */}
        <Grid item xs={12} md={6}>
          <Card className="h-full bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-150 ease-out">
            <CardContent>
              <Typography variant="h6" className="font-semibold text-amber-800 mb-4">
                Configuración Avanzada
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={showAdvancedSettings}
                    onChange={(e) => onAdvancedSettingsChange(e.target.checked)}
                    color="warning"
                  />
                }
                label="Mostrar configuraciones avanzadas"
                className="mb-4 transition-all duration-150 ease-out"
              />

              {showAdvancedSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <Box className="space-y-3">
                    <TextField
                      fullWidth
                      label="Timeout de respuesta (ms)"
                      type="number"
                      defaultValue={30000}
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Máximo de reintentos"
                      type="number"
                      defaultValue={3}
                      variant="outlined"
                      size="small"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Modo de depuración"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Logs detallados"
                    />
                  </Box>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-150 ease-out">
            <CardContent>
              <Box className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SaveIcon />}
                  onClick={onSaveConfiguration}
                  className="transition-all duration-150 ease-out"
                >
                  Guardar Configuración
                </Button>

                <Button
                  variant="outlined"
                  color='secondary'
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={onTestConfiguration}
                  className="transition-all duration-150 ease-out"
                >
                  Probar Configuración
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={onResetConfiguration}
                  className="transition-all duration-150 ease-out"
                >
                  Restablecer
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default GlobalSettings;

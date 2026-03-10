'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Code as CodeIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const PromptsInstructions = ({ prompts, onPromptChange }) => {
  const handleChange = (field, value) => {
    onPromptChange(field, value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Grid container spacing={4}>
        {/* System Message */}
        <Grid item xs={12} md={6}>
          <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-150 ease-out">
            <CardContent>
              <Box className="flex items-center mb-3">
                <AutoAwesomeIcon className="text-blue-600 mr-2" />
                <Typography variant="h6" className="font-semibold text-blue-800">
                  Mensaje del Sistema
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={prompts.systemMessage}
                onChange={(e) => handleChange('systemMessage', e.target.value)}
                placeholder="Define el comportamiento base de tu AI..."
                variant="outlined"
                className="mb-3 transition-all duration-150 ease-out"
                color="primary"
              />
              <Typography variant="body2" className="text-gray-600">
                Este mensaje define la personalidad y comportamiento base de tu asistente AI.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Welcome Message */}
        <Grid item xs={12} md={6}>
          <Card className="h-full bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-150 ease-out">
            <CardContent>
              <Box className="flex items-center mb-3">
                <TrendingUpIcon className="text-green-600 mr-2" />
                <Typography variant="h6" className="font-semibold text-green-800">
                  Mensaje de Bienvenida
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={prompts.welcomeMessage}
                onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                placeholder="¿Cómo quieres que salude tu AI?"
                variant="outlined"
                className="mb-3 transition-all duration-150 ease-out"
                color="success"
              />
              <Typography variant="body2" className="text-gray-600">
                El primer mensaje que verán los usuarios al iniciar una conversación.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Context Instructions */}
        <Grid item xs={12}>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-150 ease-out">
            <CardContent>
              <Box className="flex items-center mb-3">
                <CodeIcon className="text-purple-600 mr-2" />
                <Typography variant="h6" className="font-semibold text-purple-800">
                  Instrucciones de Contexto
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={prompts.contextInstructions}
                onChange={(e) => handleChange('contextInstructions', e.target.value)}
                placeholder="Instrucciones específicas para el contexto..."
                variant="outlined"
                className="mb-3 transition-all duration-150 ease-out"
                color="secondary"
              />
              <Typography variant="body2" className="text-gray-600">
                Instrucciones específicas sobre cómo debe comportarse el AI en diferentes contextos.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Parameters */}
        <Grid item xs={12}>
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-150 ease-out">
            <CardContent>
              <Typography variant="h6" className="font-semibold text-orange-800 mb-3">
                Parámetros del AI
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Máximo de Tokens"
                    value={prompts.maxTokens}
                    onChange={(e) => handleChange('maxTokens', e.target.value)}
                    variant="outlined"
                    helperText="Límite de longitud de respuesta"
                    color="warning"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Temperatura"
                    value={prompts.temperature}
                    onChange={(e) => handleChange('temperature', e.target.value)}
                    variant="outlined"
                    inputProps={{ step: 0.1, min: 0, max: 2 }}
                    helperText="Creatividad vs. Precisión (0-2)"
                    color="warning"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default PromptsInstructions;

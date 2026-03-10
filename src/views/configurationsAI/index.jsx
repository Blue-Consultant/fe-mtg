'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Fab,
  Snackbar,
  Alert
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  Psychology as PsychologyIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Importar componentes
import PromptsInstructions from './components/prompts-instructions';
import FilesInstructions from './components/files-instructions';
import GlobalSettings from './components/global-settings';

const ConfigurationsAI = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');

  // Estados para prompts
  const [prompts, setPrompts] = useState({
    systemMessage: 'Eres un asistente AI experto y útil.',
    welcomeMessage: '¡Hola! ¿En qué puedo ayudarte hoy?',
    contextInstructions: 'Responde basándote únicamente en la información proporcionada.',
    maxTokens: 800,
    temperature: 0.7
  });

  // Estados para archivos y contextos
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contexts, setContexts] = useState([
    { id: 1, name: 'Soporte Plataforma', type: 'platform', active: true, color: '#3B82F6' },
    { id: 2, name: 'Soporte Académico', type: 'academic', active: false, color: '#10B981' },
    { id: 3, name: 'Lecciones Personalizadas', type: 'lessons', active: false, color: '#F59E0B' }
  ]);

  // Estados para configuración global
  const [aiModel, setAiModel] = useState('gpt-4o');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePromptChange = (field, value) => {
    setPrompts(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (files) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      status: 'uploading'
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simular progreso de carga
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          newFiles.forEach(file => {
            setUploadedFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, status: 'completed' } : f
            ));
          });
          showNotification('Archivos cargados exitosamente', 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const addContext = () => {
    const newContext = {
      id: Date.now(),
      name: `Nuevo Contexto ${contexts.length + 1}`,
      type: 'custom',
      active: false,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    setContexts(prev => [...prev, newContext]);
  };

  const toggleContext = (id) => {
    setContexts(prev => prev.map(ctx => ({
      ...ctx,
      active: ctx.id === id ? !ctx.active : false
    })));
  };

  const deleteContext = (id) => {
    setContexts(prev => prev.filter(ctx => ctx.id !== id));
  };

  const deleteFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    showNotification('Archivo eliminado', 'info');
  };

  const handleModelChange = (model) => {
    setAiModel(model);
  };

  const handleAdvancedSettingsChange = (checked) => {
    setShowAdvancedSettings(checked);
  };

  const saveConfiguration = () => {
    showNotification('Configuración guardada exitosamente', 'success');
  };

  const testConfiguration = () => {
    showNotification('Probando configuración...', 'info');
  };

  const resetConfiguration = () => {
    showNotification('Configuración restablecida', 'info');
  };

  const showNotification = (message, type = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setShowSnackbar(true);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chatbot-tabpanel-${index}`}
      aria-labelledby={`chatbot-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header */}
        <Box className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <img 
              src="/images/avatars/10.png" 
              alt="AI Bot"
              style={{
                width: 100,
                margin: '0 auto 0 auto',
              }}
            />
          </motion.div>
          <Typography variant="h3" className="font-bold text-gray-800 mb-2">
            ChatBot AI Configurator
          </Typography>
          <Typography variant="h6" className="text-gray-600">
            Configura tu asistente inteligente personalizado
          </Typography>
        </Box>

        {/* Main Content */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease-out'
                }
              }}
            >
              <Tab
                icon={<PsychologyIcon />}
                label="Prompts & Instrucciones"
                iconPosition="start"
              />
              <Tab
                icon={<DescriptionIcon />}
                label="Gestión de PDFs"
                iconPosition="start"
              />
              <Tab
                icon={<SettingsIcon />}
                label="Configuración"
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab 1: Prompts & Instrucciones */}
          <TabPanel value={activeTab} index={0}>
            <PromptsInstructions 
              prompts={prompts}
              onPromptChange={handlePromptChange}
            />
          </TabPanel>

          {/* Tab 2: Gestión de PDFs */}
          <TabPanel value={activeTab} index={1}>
            <FilesInstructions 
              uploadedFiles={uploadedFiles}
              contexts={contexts}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              onFileUpload={handleFileUpload}
              onAddContext={addContext}
              onToggleContext={toggleContext}
              onDeleteContext={deleteContext}
              onDeleteFile={deleteFile}
            />
          </TabPanel>

          {/* Tab 3: Configuración */}
          <TabPanel value={activeTab} index={2}>
            <GlobalSettings 
              aiModel={aiModel}
              onModelChange={handleModelChange}
              showAdvancedSettings={showAdvancedSettings}
              onAdvancedSettingsChange={handleAdvancedSettingsChange}
              onSaveConfiguration={saveConfiguration}
              onTestConfiguration={testConfiguration}
              onResetConfiguration={resetConfiguration}
            />
          </TabPanel>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="secondary"
          aria-label="add"
          className="fixed bottom-6 right-6 transition-all duration-150 ease-out"
          onClick={() => setActiveTab(0)}
          size="large"
        >
          <SmartToyIcon />
        </Fab>

        {/* Snackbar for notifications */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity={snackbarType}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </motion.div>
    </Box>
  );
};

export default ConfigurationsAI;
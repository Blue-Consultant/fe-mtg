// Third-party Imports
import { configureStore, combineReducers } from '@reduxjs/toolkit'

import { persistReducer, persistStore } from 'redux-persist'
import localStorage from 'redux-persist/lib/storage'
import { thunk } from 'redux-thunk'

// Slice Imports
import loginReducer from '@/redux-store/slices/login'
import companiesReducer from '@/redux-store/slices/companies'
import courtsReducer from '@/redux-store/slices/courts'
import priceSchedulesReducer from '@/redux-store/slices/price-schedules'
import dateBlocksReducer from '@/redux-store/slices/date-blocks'
import ratingsReducer from '@/redux-store/slices/ratings'
import userReducer from '@/redux-store/slices/user'
import rolReducer from '@/redux-store/slices/roles'
import modulesReducer from '@/redux-store/slices/modules'
import subModulesReducer from '@/redux-store/slices/sub-modules'
import rolesModulesSubmodulesReducer from '@/redux-store/slices/roles-modules-submodules'
import permissionsReducer from '@/redux-store/slices/permissions'
import courtTypesReducer from '@/redux-store/slices/court-types'

// Configuración de persistencia para el loginReducer
const loginPersistConfig = {
  key: 'login',
  storage: localStorage,
  whitelist: ['user']
}

const rootReducer = combineReducers({
  companiesReducer,
  courtsReducer,
  priceSchedulesReducer,
  dateBlocksReducer,
  ratingsReducer,
  userReducer,
  rolReducer,
  loginReducer: persistReducer(loginPersistConfig, loginReducer),
  modules: modulesReducer,
  subModule: subModulesReducer,
  rolesModulesSubmodules: rolesModulesSubmodulesReducer,
  permissionsReducer,
  courtTypesReducer,
})

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(thunk)
})

const persistor = persistStore(store)

export { store, persistor }

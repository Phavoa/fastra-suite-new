// store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import { authApi } from "../../api/authApi";
import { userApi } from "../../api/userApi";
import { productsApi } from "../../api/purchase/productsApi";
import { unitOfMeasureApi } from "../../api/purchase/unitOfMeasureApi";
import { vendorsApi } from "../../api/purchase/vendorsApi";
import { purchaseRequestApi } from "../../api/purchase/purchaseRequestApi";
import { purchaseOrderApi } from "../../api/purchase/purchaseOrderApi";
import { requestForQuotationApi } from "../../api/purchase/requestForQuotationApi";
import { companyApi } from "@/api/settings/companyApi";
import { usersApi } from "@/api/settings/usersApi";
import { tenantUserApi } from "@/api/settings/tenantUserApi";
import { permissionsTemplateApi } from "@/api/settings/permissionsTemplateApi";
import { currencyApi } from "../../api/purchase/currencyApi";
import { locationApi } from "../../api/inventory/locationApi";
import { multilocationApi } from "../../api/inventory/multilocationApi";
import { stockAdjustmentApi } from "../../api/inventory/stockAdjustmentApi";
import { scrapApi } from "../../api/inventory/scrapApi";
import { invoiceApi } from "../../api/invoice/invoiceApi";

import authReducer from "./authSlice";
import viewModeReducer from "../../components/Settings/viewModeSlice";

import { incomingProductApi } from "@/api/inventory/incomingProductApi";
import { deliveryOrderApi } from "@/api/inventory/deliveryOrderApi";
import { deliveryOrderReturnApi } from "@/api/inventory/deliveryOrderReturnApi";
import { internalTransferApi } from "@/api/inventory/internalTransferApi";
import { stockMoveApi } from "@/api/inventory/stockMoveApi";
import { incomingProductReturnsApi } from "@/api/inventory/incomingProductReturns";
import { backOrderApi } from "@/api/inventory/backOrderApi";

import { subcontractorRequestApi } from "@/api/subcontractorRequestApi";
import { projectApi } from "@/api/projectApi";
import { projectCostingApi } from "@/api/projectCostingApi";
import { labourRequestApi } from "@/api/requests/labourRequestApi";
import { projectPurchaseRequestApi } from "@/api/requests/projectPurchaseRequestApi";
import { plantEquipmentRequestApi } from "@/api/requests/plantEquipmentRequestApi";
import { projectRequestApi } from "@/api/requests/projectRequestApi";
import { pettyCashRequestApi } from "@/api/requests/pettyCashRequestApi";

const authPersistConfig = {
  key: "auth",
  storage,
};

const viewModePersistConfig = {
  key: "viewMode",
  storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const rootReducer = combineReducers({
  auth: persistedAuthReducer,

  viewMode: persistReducer(viewModePersistConfig, viewModeReducer),

  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [tenantUserApi.reducerPath]: tenantUserApi.reducer,
  [permissionsTemplateApi.reducerPath]: permissionsTemplateApi.reducer,

  [productsApi.reducerPath]: productsApi.reducer,
  [unitOfMeasureApi.reducerPath]: unitOfMeasureApi.reducer,
  [vendorsApi.reducerPath]: vendorsApi.reducer,
  [purchaseRequestApi.reducerPath]: purchaseRequestApi.reducer,
  [purchaseOrderApi.reducerPath]: purchaseOrderApi.reducer,
  [requestForQuotationApi.reducerPath]: requestForQuotationApi.reducer,

  [currencyApi.reducerPath]: currencyApi.reducer,

  [locationApi.reducerPath]: locationApi.reducer,
  [multilocationApi.reducerPath]: multilocationApi.reducer,
  [stockAdjustmentApi.reducerPath]: stockAdjustmentApi.reducer,
  [scrapApi.reducerPath]: scrapApi.reducer,
  [incomingProductApi.reducerPath]: incomingProductApi.reducer,
  [deliveryOrderApi.reducerPath]: deliveryOrderApi.reducer,
  [deliveryOrderReturnApi.reducerPath]: deliveryOrderReturnApi.reducer,
  [internalTransferApi.reducerPath]: internalTransferApi.reducer,
  [stockMoveApi.reducerPath]: stockMoveApi.reducer,
  [incomingProductReturnsApi.reducerPath]: incomingProductReturnsApi.reducer,
  [backOrderApi.reducerPath]: backOrderApi.reducer,

  [subcontractorRequestApi.reducerPath]: subcontractorRequestApi.reducer,

  [projectApi.reducerPath]: projectApi.reducer,
  [projectCostingApi.reducerPath]: projectCostingApi.reducer,

  [labourRequestApi.reducerPath]: labourRequestApi.reducer,
  [projectPurchaseRequestApi.reducerPath]: projectPurchaseRequestApi.reducer,
  [plantEquipmentRequestApi.reducerPath]: plantEquipmentRequestApi.reducer,
  [projectRequestApi.reducerPath]: projectRequestApi.reducer,
  [pettyCashRequestApi.reducerPath]: pettyCashRequestApi.reducer,
  [invoiceApi.reducerPath]: invoiceApi.reducer,
  [companyApi.reducerPath]: companyApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      userApi.middleware,
      usersApi.middleware,
      tenantUserApi.middleware,
      permissionsTemplateApi.middleware,

      productsApi.middleware,
      unitOfMeasureApi.middleware,
      vendorsApi.middleware,
      purchaseRequestApi.middleware,
      purchaseOrderApi.middleware,
      requestForQuotationApi.middleware,

      currencyApi.middleware,

      locationApi.middleware,
      multilocationApi.middleware,
      stockAdjustmentApi.middleware,
      scrapApi.middleware,
      incomingProductApi.middleware,
      deliveryOrderApi.middleware,
      deliveryOrderReturnApi.middleware,
      internalTransferApi.middleware,
      stockMoveApi.middleware,
      incomingProductReturnsApi.middleware,
      backOrderApi.middleware,

      subcontractorRequestApi.middleware,
      projectApi.middleware,
      projectCostingApi.middleware,
      labourRequestApi.middleware,
      projectPurchaseRequestApi.middleware,
      plantEquipmentRequestApi.middleware,
      projectRequestApi.middleware,
      pettyCashRequestApi.middleware,

      invoiceApi.middleware,
      companyApi.middleware,
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

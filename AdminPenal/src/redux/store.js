import { createStore, applyMiddleware, compose } from 'redux';
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { persistStore, persistReducer } from 'redux-persist'
import thunk from 'redux-thunk';
import { reducer } from './reducer'
import { createLogger } from 'redux-logger'

const logger = createLogger({
    duration: true,
    timestamp: true,
    diff: true,
    collapsed: true
});

const persistConfig = {
    key: 'root',
    storage: storage,
    stateReconciler: autoMergeLevel2
};

const persistedReducer = persistReducer(persistConfig, reducer);


const composeEnhancers =
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
        }) : compose;
const enhancer = composeEnhancers(
    process.env.NODE_ENV !== 'production' ? applyMiddleware(logger) : applyMiddleware(thunk),
    // other store enhancers if any
);

export const store = createStore(persistedReducer,{}, enhancer);

export const persistor = persistStore(store);
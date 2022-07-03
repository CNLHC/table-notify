
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { ReducerState } from 'react'
import { GlobalReducer } from './global'
import logger from 'redux-logger'

import { TypedUseSelectorHook, useSelector } from 'react-redux'

const reducer = combineReducers({ GlobalReducer })

export type RootState = ReducerState<typeof reducer>

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector

export const initializeStore = () => {
    return createStore(reducer, composeWithDevTools(applyMiddleware(logger)))
}

let reduxStore: ReturnType<typeof initializeStore>

export const getOrInitializeStore = () => {
    if (typeof window === 'undefined') {
        return initializeStore()
    }
    if (!reduxStore) {
        reduxStore = initializeStore()
    }
    return reduxStore
}

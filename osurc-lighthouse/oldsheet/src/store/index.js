import { createStore, applyMiddleware, compose } from 'redux'
import promiseMiddleware from 'redux-promise-middleware'

export function configureStore (reducer, initialState) {

  const middlewares = [
    promiseMiddleware()
  ]

  const enhancers = [
    applyMiddleware(...middlewares)
    // electronEnhancer()
  ]

  return createStore(reducer, initialState, compose(...enhancers))

}

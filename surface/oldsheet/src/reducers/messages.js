const init = {
  status: 'initializing'
}

export default (state = init, { type, payload }) => {

  switch (type) {

    case 'APP/INIT':
      return {
        status: 'querying the network'
      }

    default:
      return state

  }

}

export default (state = '', action) => {
  console.log(action)
  switch (action.type) {
    case 'SET_SEARCH':
      return action.payload
    default:
      return state
  }
}

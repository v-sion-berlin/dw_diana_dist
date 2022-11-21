'use strict'

const NLW_PROPERTIES = Object.freeze({
  LANGUAGE: 0,
  CALL_TEXT: 1,
  CALL_URL: 2,
  ONLINE: 4,
  EDITORS: 6,
  CAMERA: 7,
  DIRECTOR: 8,
  EXECUTIVE_PRODUCER: 9,
  CREDITS_ONLINE: 10,
  SPONSOR: 11
})

const initializeNLWData = () => {
  const data = {}
  const NLW = nlw.data
  NLW.load('topo-inserts.db')
  if (NLW.error) {
    console.log(NLW.error)
  }
  const nlwTable = NLW.worksheet().worksheets.worksheet1.table
  Object.entries(nlwTable).forEach(([i, column]) => {
    const key = column[1]
    if (!data[key]) {
      data[key] = []
    }
    Object.entries(column).forEach(([j, cell]) => {
      data[key].push(cell)
    })
  })
  return data
}

/* global nlw */

const NLW_PROPERTIES_LOWERTHIRDS = Object.freeze({
  LANGUAGE: 0,
  FLAGS: 1,
  BREAKING_NEWS: 3,
  REPORT: 4,
  COMING_UP: 5,
  ONLINE: 7,
  CREDITS_HELP: 9,
  CREDITS_EXECUTIVE_PRODUCER_NAME: 10,
  CREDITS_EXECUTIVE_PRODUCER_FUNCTION_1: 11,
  CREDITS_EXECUTIVE_PRODUCER_FUNCTION_2: 12,
  CREDITS_PRODUCER_NAME: 13,
  CREDITS_PRODUCER_FUNCTION_1: 14,
  CREDITS_PRODUCER_FUNCTION_2: 15,
  CREDITS_DIRECTOR_NAME: 16,
  CREDITS_DIRECTOR_FUNCTION_1: 17,
  CREDITS_DIRECTOR_FUNCTION_2: 18,
  CREDITS_PRESENTER_NAME: 19,
  CREDITS_PRESENTER_FUNCTION_1: 20,
  CREDITS_PRESENTER_FUNCTION_2: 21,
  CREDITS_ONLINE: 22,
  SOURCE: 24
})

const NLW_PROPERTIES_SHOWS = Object.freeze({
  LANGUAGE: 0,
  NEWS: 1,
  THE_DAY: 2,
  ASIA: 3,
  AFRICA: 4,
  '1_STUNDE': 5,
  INTERVIEW: 6,
  '100S': 7
})

const initializeNLWData = (table) => {
  const data = {}
  const NLW = nlw.data
  NLW.load(table)
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

const NLW_DATA_LOWERTHIRDS = initializeNLWData('news-lowerthirds.db')
const NLW_DATA_SHOWS = initializeNLWData('news-shows.db')

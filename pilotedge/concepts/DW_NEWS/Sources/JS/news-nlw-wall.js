/* global Event, Option, structuredClone */
/* global nlw */
/* eslint-disable no-unused-vars */

const NLW_PROPERTIES = Object.freeze({
  STUDIO: 0
})

const IS_DEFAULT = 'X'

const initializeNLWData = (table) => {
  const NLW = nlw.data
  NLW.load(table)
  if (NLW.error) {
    console.log(NLW.error)
  }

  const nlwTable = NLW.worksheet().worksheets.worksheet1.table

  const setting = {}
  Object.values(nlwTable).forEach((column) => {
    setting[column[1]] = ''
  })

  const data = new Array(Number(NLW.worksheet().worksheets.worksheet1.highestRow))

  for (let i = 0; i < data.length; i++) {
    data[i] = structuredClone(setting)
  }

  Object.values(nlwTable).forEach((column) => {
    const key = column[1]
    Object.values(column).forEach((cell, i) => {
      data[i][key] = cell
    })
  })
  return data
}

const NLW_DATA = initializeNLWData('news-wall.db')

const getDistinctSettingValues = (data, settingKey) => {
  const settingsProperties = data.map((element) => element[settingKey])
  if (settingsProperties[0] === settingKey) {
    settingsProperties.shift()
  }
  return [...new Set(settingsProperties)]
}

const getFilteredData = (data, query) => {
  return data.filter((setting) => {
    return Object.keys(query).every((key) => {
      const settingValue = setting[key]
      const queryValue = query[key]
      return typeof settingValue === 'string' ? settingValue.includes(queryValue) : settingValue === queryValue
    })
  })
}

const settingSelectChanged = (event, areaSelect, nlwData) => {
  const Setting = event.target.value
  if (event.detail !== 'dw.js' && Setting) {
    // Clear area select
    while (areaSelect.length > 1) {
      areaSelect.remove(areaSelect.length - 1)
    }

    // Get new areas
    const data = getFilteredData(nlwData, { Setting })
    const areas = getDistinctSettingValues(data, 'Area')
    let defaultSetting = getFilteredData(data, { IsDefault: IS_DEFAULT })
    // if there is no default setting defined we use the first setting
    defaultSetting = defaultSetting[0] ? defaultSetting : [data[0]]

    // Fill area select
    for (const area of areas) {
      areaSelect.add(new Option(area))
    }

    // If we changed the setting manually, we are setting the default area
    if (event.detail !== 'vizPayloadReady' && defaultSetting[0].Area) {
      window.COElement('Dummy/Area').value = defaultSetting[0].Area
      areaSelect.dispatchEvent(new Event('change'))
    } else if (window.COElement('Dummy/Area').getFieldText()) {
      areaSelect.value = window.COElement('Dummy/Area').getFieldText()
    }
  }
}

const areaSelectChanged = (event, nlwData) => {
  if (event.detail !== 'dw.js') {
    // Get new position and width
    const Area = event.target.value
    const [{ Setting }] = getFilteredData(nlwData, { Area })
    window.COElement('PlayoutAreaKey').value = `${Setting} | ${Area}`
  }
}

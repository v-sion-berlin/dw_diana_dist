/**
 * @file Adds a timing section with offset and duration (mosart).
 * Simply use <div class="dw-mosart-info"></div> and make sure 
 * there is an co-object named 'mosart-info'.
 * @author Deutsche Welle <gunnar.steffen@dw.com>
 * @version 1.12
 */

/* global Input */
/* global vizrt */

console.debug('loading timing.js')

const TIMING_CO_FIELD = 'mosart-info'
const TIMING_SEPERATOR = '|'

/**
 * Timing class.
 * 
 * @hideconstructor
 */
class Timing {
  /**
   * Add timing section in dom.
   * @param {HTMLElement} element HTML element
   * @since 1.12
   * @instance
   */
  static async initialize(element) {
    this.element = element
    const div = () => { return document.createElement('div') }
    const select = () => { return document.createElement('select') }
    const option = () => { return document.createElement('option') }
    const input_number = (name) => {
      var input = document.createElement('input')
      input.name = name
      input.type = 'number'
      input.classList.add('form-input', 'dw-input-number', 'w-[60px]')
      input.value = 0
      input.min = 0
      input.max = 59
      input.step = 1
      input.setAttribute('data-scrubber', '')
      return input
    }

    // Grid
    this.element.classList.add('field-group', 'bg-gray-02')
    const divGrid = this.element.appendChild(div())
    divGrid.classList.add('grid', 'grid-cols-2', 'md:grid-cols-4', 'gap-2')

    // Timing in
    const divTimingIn = divGrid.appendChild(div())
    const divTimingInLabel = divTimingIn.appendChild(div())
    divTimingInLabel.classList.add('dw-label__input')
    divTimingInLabel.innerHTML = 'Offset (mm:ss)'
    const divTimingInputInMM = divTimingIn.appendChild(input_number('offset-mm'))
    divTimingInputInMM.style.marginRight = '4px'
    const divTimingInputInSS = divTimingIn.appendChild(input_number('offset-ss'))

    // Timing duration
    const divTimingDur = divGrid.appendChild(div())
    divTimingDur.id = 'duration'
    const divTimingDurLabel = divTimingDur.appendChild(div())
    divTimingDurLabel.classList.add('dw-label__input')
    divTimingDurLabel.innerHTML = 'Duration (mm:ss)'
    const divTimingInputDurMM = divTimingDur.appendChild(input_number('duration-mm'))
    divTimingInputDurMM.style.marginRight = '4px'
    const divTimingInputDurSS = divTimingDur.appendChild(input_number('duration-ss'))

    // Timecode
    const divTimecode = divGrid.appendChild(div())
    const divTimecodeLabel = divTimecode.appendChild(div())
    divTimecodeLabel.classList.add('dw-label__input')
    divTimecodeLabel.innerHTML = 'Timecode'
    const divTimecodeField = divTimecode.appendChild(div())
    divTimecodeField.id = 'timecode'
    divTimecodeField.classList.add('field-group__label')
    divTimecodeField.innerHTML = '-'

    // Spacer
    const divSpacer = div()
    divSpacer.classList.add('field-group')
    this.element.after(divSpacer)

    // Register inputs (data-scrubber option)
    const Input = (await import('./input.js')).default
    Input.initialize(divTimingInputInMM)
    Input.initialize(divTimingInputInSS)
    Input.initialize(divTimingInputDurMM)
    Input.initialize(divTimingInputDurSS)

    // Register events
    initialize_input_numbers()
  }

  /**
   * Get dom timing section elements.
   * @returns {object}
   * @since 1.12
   */
  static elements() {
    return {
      'inputs': this.element.querySelectorAll('input'),
      'inputsTcIn': this.element.querySelectorAll('input[name*="offset"]'),
      'inputsTcDur': this.element.querySelectorAll('input[name*="duration"]'),
      'tcDur': this.element.querySelector('#duration'),
      'timecode': this.element.querySelector('#timecode')
    }
  }

  /**
   * Get mosart timing info, like 'in' and 'duration'.
   * @returns {String}
   * @since 1.12
   */
  static info() {
    const selector = this.elements()
    const info = {}
    info.tcIn = []
    info.tcDur = []

    selector.inputsTcIn.forEach((element) => { info.tcIn.push(this.limit_number(element.value)) })
    selector.inputsTcDur.forEach((element) => { info.tcDur.push(this.limit_number(element.value)) })
    selector.timecode.innerHTML = this.timecode(info.tcIn, info.tcDur)

    return this.join_numbers(info.tcIn) + TIMING_SEPERATOR + this.join_numbers(info.tcDur)
  }

  /**
   * Set mosart timing info, like 'in' and 'duration', 
   * from vizrt payloadhosting.
   * @param {String} coValue Input value
   * @since 1.12
   */
  static info_payload(coValue) {
    if (!coValue || coValue.trim() == '') return

    const selector = this.elements()
    const ramInfoParts = coValue.split(TIMING_SEPERATOR)
    const tcIn = ramInfoParts[0].split(':')
    const tcDur = ramInfoParts[1].split(':')
    const info = {}
    info.tcIn = []
    info.tcDur = []

    tcIn.forEach((tc, index) => {
      const value = this.limit_number(tc)
      info.tcIn.push(value)
      selector.inputsTcIn[index].value = value
    })

    tcDur.forEach((tc, index) => {
      const value = this.limit_number(tc)
      info.tcDur.push(value)
      selector.inputsTcDur[index].value = value
    })

    selector.timecode.innerHTML = this.timecode(info.tcIn, info.tcDur)
  }

  /**
   * Join array (numbers) with leading zero.
   * @param {array} array 
   * @param {string} seperator (optional) 
   * @returns {string}
   * @since 1.12
   */
  static join_numbers(array, seperator = ':') {
    const helper = (number) => { return this.pad_zero(number) }
    array.forEach(function (item, index) { this[index] = helper(item) }, array)
    return array.join(seperator)
  }

  /**
   * Limits a value to min = 0 or max = 59.
   * @param {string} input Input value 
   * @param {number} max Allowed maximum value (optional)
   * @returns {number}
   * @since 1.12
   */
  static limit_number(input, max = 59) {
    return Math.min(max, Math.max(0, Number(input)))
  }

  /**
   * Leading zero.
   * @param {string} number Input value 
   * @param {number} size 2 = 02, 4 = 0002 (optional)
   * @returns {string}
   * @since 1.12
   */
  static pad_zero(number, size = 2) {
    // https://gist.github.com/aemkei/1180489
    return (1e15 + number + '').slice(-size)
  }

  /**
   * Get timecode.
   * @param {array} tcIn Timing 'in' array[mm, ss]
   * @param {array} tcDuration Timing 'duration' array[mm, ss]
   * @returns {String}
   * @since 1.12
   */
  static timecode(tcIn, tcDuration) {
    const startDate = new Date(1900, 0, 1, 0, tcIn[0], tcIn[1])
    const endDate = new Date(startDate.getTime() + (tcDuration[0] * 60000) + (tcDuration[1] * 1000))

    return '00:' + this.pad_zero(tcIn[0]) + ':' + this.pad_zero(tcIn[1]) + ' – ' + this.pad_zero(endDate.getHours()) + ':' + this.pad_zero(endDate.getMinutes()) + ':' + this.pad_zero(endDate.getSeconds())
  }
}

export default Timing

/**
 * Input change.
 * @since 1.12
 * @memberof Timing
 */
const initialize_input_numbers = () => {
  const selector = Timing.elements()
  selector.inputs.forEach((input) => {
    input.addEventListener('input', (event) => {
      const coValue = Timing.info()
      if (vizrt.payloadhosting.isPayloadReady())
        vizrt.payloadhosting.setFieldText(TIMING_CO_FIELD, coValue)
    })
  })
}

/**
 * Connects the html control with the control objects defined by the scene.
 * @since 1.12
 */
document.addEventListener('vizPayloadReady', () => {
  const coValue = vizrt.payloadhosting.getFieldText(TIMING_CO_FIELD)
  Timing.info_payload(coValue)
})

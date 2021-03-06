/*!
 * lotivis.js v1.0.89
 * https://github.com/lukasdanckwerth/lotivis#readme
 * (c) 2021 lotivis.js Lukas Danckwerth
 * Released under the MIT License
 */
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
typeof define === 'function' && define.amd ? define(['exports'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.lotivis = {}));
}(this, (function (exports) { 'use strict';

/**
 * Color defined by r,g,b.
 * @class Color
 */
class Color$1 {

  /**
   * Creates a new instance of Color.
   * @param r The red value.
   * @param g The green value.
   * @param b The blue value.
   */
  constructor(r, g, b) {
    if ((r || r === 0) && (g || g === 0) && (b || b === 0)) {
      this.initialize(r, g, b);
    } else if (typeof r === `object`) {
      this.initialize(r.r, r.g, r.b);
    } else if (r) ; else if (r) {
      this.initialize(r, r, r);
    } else {
      throw new Error(`Invalid argument: ${r}`);
    }
  }

  initialize(r, g, b) {
    this.r = Math.round(r);
    this.g = Math.round(g);
    this.b = Math.round(b);
  }

  rgbString() {
    return `rgb(${this.r},${this.g},${this.b})`;
  }

  toString() {
    return this.rgbString();
  }

  colorAdding(r, g, b) {
    return new Color$1(this.r + r, this.g + g, this.b + b);
  }
}

Color$1.defaultTint = new Color$1(0, 122, 255);
Color$1.organgeLow = new Color$1(250, 211, 144);
Color$1.organgeHigh = new Color$1(229, 142, 38);
Color$1.redLow = new Color$1(248, 194, 145);
Color$1.redHigh = new Color$1(183, 21, 64);
Color$1.blueLow = new Color$1(106, 137, 204);
Color$1.blueHigh = new Color$1(12, 36, 97);
Color$1.lightBlueLow = new Color$1(130, 204, 221);
Color$1.lightBlueHight = new Color$1(10, 61, 98);
Color$1.greenLow = new Color$1(184, 233, 148);
Color$1.greenHight = new Color$1(7, 153, 146);
Color$1.stackColors = [
  [Color$1.blueHigh, Color$1.blueLow],
  [Color$1.redHigh, Color$1.redLow],
  [Color$1.greenHight, Color$1.greenLow],
  [Color$1.organgeHigh, Color$1.organgeLow],
  [Color$1.lightBlueHight, Color$1.lightBlueLow],
];

Color$1.colorGenerator = function (till) {
  return d3
    .scaleLinear()
    .domain([0, 1 / 3 * till, 2 / 3 * till, till])
    .range(['yellow', 'orange', 'red', 'purple']);
};

/**
 *
 * @param till
 * @returns {*}
 */
Color$1.plotColor = function (till) {
  return d3
    .scaleLinear()
    .domain([0, 1 / 2 * till, till])
    .range(['lightgreen', 'steelblue', 'purple']);
};

/**
 * Returns a randomly generated color.
 * @returns {string}
 */
Color$1.randomColor = function () {
  return "rgb(" +
    (Math.random() * 255) + ", " +
    (Math.random() * 255) + "," +
    (Math.random() * 255) + ")";
};

var d3LibraryAccess;
try {
  d3LibraryAccess = require('d3');
} catch (e) {
  d3LibraryAccess = d3;
}

/**
 * Returns a randomly generated color.
 * @returns {[]}
 */
Color$1.colorsForStack = function (stackNumber, amount = 1) {
  let colorCouple = Color$1.stackColors[stackNumber % Color$1.stackColors.length];
  let colorGenerator = d3LibraryAccess
    .scaleLinear()
    .domain([0, amount])
    .range([colorCouple[0], colorCouple[1]]);

  let colors = [];
  for (let i = 0; i < amount; i++) {
    let color = colorGenerator(i);
    colors.push(new Color$1(color));
  }

  return colors;
};

/**
 * Returns the hash of the given string.
 * @param aString The string to create the hash of.
 * @returns {number} The hash of the given string.
 */
function hashCode(aString) {
  let hash = 0, i, chr;
  for (i = 0; i < aString.length; i++) {
    chr = aString.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Creates and returns a unique ID.
 */
var createID;
(function () {
  let uniquePrevious = 0;
  createID = function () {
    return 'lotivis-id-' + uniquePrevious++;
  };
}());

/**
 * Returns a 'save-to-use' id for a HTML element by replacing whitespace with dashes.
 * @param theID The id for a HTML element.
 * @returns {string} The save version of the given id.
 */
function toSaveID(theID) {
  return theID
    .split(` `).join(`-`)
    .split(`/`).join(`-`)
    .split(`.`).join(`-`);
}

/**
 * Creates and returns a unique (save to use for elements) id.  The id is created by calculating the hash of the
 * dataset's label.
 * @param dataset The dataset.
 * @returns {number} The created id.
 */
function createIDFromDataset(dataset) {
  if (!dataset || !dataset.label) return 0;
  return hashCode(dataset.label);
}


function camel2title(camelCase) {
  // no side-effects
  return camelCase
    // inject space before the upper case letters
    .replace(/([A-Z])/g, function (match) {
      return " " + match;
    })
    // replace first char with upper case
    .replace(/^./, function (match) {
      return match.toUpperCase();
    });
}

class LotivisError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class LotivisElementNotFoundError extends LotivisError {
  constructor(selector) {
    super(`Can't find an element with ID '${selector}'.`);
  }
}

class DataValidateError extends LotivisError {
  // constructor(message) {
  //   super(message);
  // }
}

class MissingPropertyError extends DataValidateError {
  constructor(message, data) {
    super(message + ' ' + JSON.stringify(data || {}));
    this.data = data;
  }
}

class InvalidFormatError extends DataValidateError {
  // constructor(message) {
  //   super(message);
  // }
}

class GeoJSONValidateError extends LotivisError {
  // constructor(message) {
  //   super(message);
  // }
}

class LotivisUnimplementedMethodError extends LotivisError {
  constructor(functionName) {
    super(`Subclasses must override function '${functionName}'.`);
  }
}

exports.LotivisError = LotivisError;
exports.DataValidateError = DataValidateError;
exports.MissingPropertyError = MissingPropertyError;
exports.InvalidFormatError = InvalidFormatError;
exports.GeoJSONValidateError = GeoJSONValidateError;
exports.LotivisUnimplementedMethodError = LotivisUnimplementedMethodError;

/**
 * A lotivis component.
 * @class Component
 */
class Component {

  /**
   * Creates a new instance of Component.
   * @param {Component|string|{}} parent The parental component or selector.
   */
  constructor(parent) {
    if (!parent) throw new LotivisError('No parent or selector specified.');
    if (Object.getPrototypeOf(parent) === String.prototype) {
      this.initializeFromSelector(parent);
    } else if (Object.getPrototypeOf(parent) === Object.prototype) {
      this.initializeFromConfig(parent);
    } else {
      this.initializeFromParent(parent);
    }
    this.element = undefined;
  }

  /**
   * Initializes this component from the given selector string.
   * @param selector The selector of the parental
   */
  initializeFromSelector(selector) {
    this.selector = selector;
    this.parent = d3.select('#' + selector);
    if (this.parent.empty()) throw new LotivisElementNotFoundError(selector);
  }

  initializeFromConfig(config) {
    this.config = config;
    if (config.selector) {
      this.initializeFromSelector(config.selector);
    } else {
      let selector = camel2title(this.constructor.name)
        .toLowerCase()
        .trim()
        .split(` `).join(`-`);

      this.initializeFromSelector(selector);
    }
  }

  initializeFromParent(parent) {
    this.selector = createID();
    this.parent = parent;
  }

  // MARK: - Functions

  show() {
    if (!this.element) return;
    this.element.style('display', '');
    return this;
  }

  hide() {
    if (!this.element) return;
    this.element.style('display', 'none');
    return this;
  }

  get isVisible() {
    if (!this.element) return false;
    return this.element.style('display') !== 'none';
  }

  getElementEffectiveSize() {
    if (!this.element) return [0, 0];
    let width = this.element.style('width').replace('px', '');
    let height = this.element.style('height').replace('px', '');
    return [Number(width), Number(height)];
  }

  getElementPosition() {
    let element = document.getElementById(this.selector);
    if (!element) return [0, 0];
    let rect = element.getBoundingClientRect();
    let xPosition = rect.x + window.scrollX;
    let yPosition = rect.y + window.scrollY;
    return [xPosition, yPosition];
  }

  /**
   * Returns a string representation of this Component.
   * @returns {string} A string representing this Component.
   */
  toString() {
    let components = [this.constructor.name];
    if (this.selector) components.push(`'${this.selector}'`);
    return `[${components.join(' ')}]`;
  }

  /**
   * Returns the name of the constructor of this component if present. Will return the result of `typeof` else.
   * @returns {*|"undefined"|"object"|"boolean"|"number"|"string"|"function"|"symbol"|"bigint"}
   */
  getClassname() {
    if (!this.constructor || !this.constructor.name) return (typeof this);
    return this.constructor.name;
  }
}

/**
 * A button
 *
 * @class Button
 * @extends Component
 */
class Button extends Component {

  /**
   * Creates an instance of Button.
   *
   * @constructor
   * @param {Component} parent The parental component.
   * @param style The style of the button.  One of default|back|forward
   */
  constructor(parent, style = 'default') {
    super(parent);

    this.element = parent
      .append('button')
      .attr('id', this.selector)
      .attr('class', 'lotivis-button')
      .on('click', function (event) {
        if (!this.onClick) return;
        this.onClick(event);
      }.bind(this));

    switch (style) {
      case 'round':
        this.element.classed('lotivis-button-round', true);
        break;
    }
  }

  /**
   * Sets the text of the button.
   * @param text The text of the button.
   */
  setText(text) {
    this.element.text(text);
  }

  onClick(event) {
    // empty
  }
}

/**
 *
 * @class RadioGroup
 * @extends Component
 */
class RadioGroup extends Component {

  /**
   *
   * @param parent The parental component.
   */
  constructor(parent) {
    super(parent);

    this.inputElements = [];
    this.element = this.parent.append('form');
    this.element.classed('radio-group', true);
  }

  /**
   *
   * @param optionId
   * @param optionName
   * @returns {*}
   */
  addOption(optionId, optionName) {
    let inputElement = this.element
      .append('input')
      .attr('type', 'radio')
      .attr('name', this.selector)
      .attr('value', optionId)
      .attr('id', optionId);

    this.element
      .append('label')
      .attr('for', optionId)
      .text(optionName || optionId);

    let thisReference = this;
    inputElement.on("click", function (event) {
      thisReference.onClick(event);
    });

    return inputElement;
  }

  /**
   *
   * @param options
   * @returns {RadioGroup}
   */
  setOptions(options) {
    this.removeOptions();
    this.inputElements = [];
    for (let i = 0; i < options.length; i++) {
      let id = options[i][0] || options[i].id;
      let name = options[i][1] || options[i].translatedTitle;
      let inputElement = this.addOption(id, name);
      if (i === 0) {
        inputElement.attr('checked', 'true');
      }
      this.inputElements.push(inputElement);
    }
    return this;
  }

  /**
   *
   * @param selectedOption
   * @returns {RadioGroup}
   */
  setSelectedOption(selectedOption) {
    for (let i = 0; i < this.inputElements.length; i++) {
      let inputElement = this.inputElements[i];
      let value = inputElement.attr('value');
      if (value === selectedOption) {
        inputElement.attr('checked', 'true');
      }
    }
    return this;
  }

  /**
   *
   * @returns {RadioGroup}
   */
  removeOptions() {
    this.element.selectAll('input').remove();
    this.element.selectAll('label').remove();
    this.inputElements = [];
    return this;
  }

  /**
   *
   * @param event
   */
  onClick(event) {
    let element = event.target;
    if (!element) return;

    let value = element.value;
    if (!this.onChange) return;

    this.onChange(value);

    return this;
  }

  // onChange(newFunction) {
  //     this.onChange = newFunction;
  //     return this;
  // }
  onChange(value) {
  }
}

/**
 * A toast in the top of the page.
 *
 * @class Toast
 * @extends Component
 */
class Toast extends Component {

  /**
   * Creates a new instance of Toast.
   * @constructor
   * @param {Component} parent The parental component.
   */
  constructor(parent) {
    super(parent);
    this.element = this
      .parent
      .append('div')
      .attr('class', 'lotivis-data-card-status-tooltip')
      .style('opacity', 0)
      .style('display', `none`);
    this.row = this.element
      .append('div')
      .attr('class', 'lotivis-row');
    this.leftComponnt = this.row
      .append('div')
      .attr('class', 'lotivis-col-6');
    this.rightComponent = this.row
      .append('div')
      .attr('class', 'lotivis-col-6');
    this.hideButton = new Button(this.rightComponent)
      .setText(`Hello`);
  }

  /**
   * Shows the toast.
   * @override
   */
  show() {
    super.show();
    this.element.style('opacity', 1);
    return this;
  }

  /**
   * Hides the toast.
   * @override
   */
  hide() {
    super.hide();
    this.element.style('opacity', 0);
  }

  /**
   * Sets the text of the Toast.
   * @param text The text of the Toast.
   */
  setText(text) {
    this.element.text(text);
  }

  /**
   * Sets the text of the status label.  If text is empty the status label will be hide.
   * @param newStatusMessage The new status message.
   */
  setStatusMessage(newStatusMessage) {
    let saveString = String(newStatusMessage || "").trim();
    this.element.text(saveString);
    if (saveString) {
      this.show();
    } else {
      this.hide();
    }
  }
}

/**
 * Represents an option of a dropdown or radio group.
 * @class Option
 */
class Option {

  /**
   * Creates a new instance of Option.
   * @param title The title of the option.
   */
  constructor(title) {
    this.title = title;
    this.id = toSaveID(title);
  }
}

const LotivisConfig = {
  // The default margin to use for charts.
  defaultMargin: 60,
  // The default offset for the space between an object an the toolbar.
  tooltipOffset: 7,
  // The default radius to use for bars drawn on a chart.
  barRadius: 5,
  // A Boolean value indicating whether the debug logging is enabled.
  debugLog: false,
  // A Boolean value indicating whether the debug logging is enabled.
  debug: true,
  // A string which is used as prefix for download.
  downloadFilePrefix: 'lotivis',
  // A string which is used as separator between components when creating a file name.
  filenameSeparator: '_',
  // A string which is used for unknown values.
  unknown: 'LOTIVIS_UNKNOWN'
};

/**
 * A collection of messages which already hast been printed.
 * @type {*[]}
 */
let alreadyLogged = [];

var lotivis_log_once = function (message) {
  if (alreadyLogged.includes(message)) return;
  alreadyLogged.push(message);
  console.warn(`[lotivis]  Warning only once: ${message}`);
};

var lotivis_log = () => null;

/**
 * Sets whether lotivis prints debug log messages to the console.
 * @param enabled A Boolean value indicating whether to enable debug logging.
 * @param printConfig A Boolean value indicating whether to print the global lotivis configuration.  Default is false.
 */
function debug(enabled, printConfig = false) {
  lotivis_log = enabled ? console.log : () => null;
  lotivis_log(`[lotivis]  ${enabled ? 'En' : 'Dis'}abled debug mode.`);
  if (!printConfig) return;
  lotivis_log(`LotivisConfig = ${JSON.stringify(LotivisConfig, null, 2)}`);
}

/**
 * Superclass for lotivis charts.
 * @class Chart
 * @extends Component
 * @see DateChart
 * @see MapChart
 * @see PlotChart
 */
class Chart extends Component {

  /**
   * Creates an instance of DiachronicChart.
   * @constructor
   * @param {Component} parent The parental component.
   * @param config The configuration of the chart.
   */
  constructor(parent, config) {
    super(parent);

    this.svgSelector = (this.selector || createID()) + '-svg';
    this.element = this.parent;
    this.element.attr('id', this.selector);
    this.config = config || {};
    this.updateSensible = true;
    this.initialize();

    if (this.config.datasets) {
      this.setDatasets(this.config.datasets);
    } else {
      this.update();
    }
  }

  /**
   * Initializes this chart.
   */
  initialize() {
    return new LotivisUnimplementedMethodError(`initialize()`);
  }

  /**
   * Updates the content of this chart by calling the 'update'-chain:
   *
   * ```
   * precalculate();
   * remove();
   * draw();
   * ```
   */
  update(datasetsController, reason) {
    if (!this.updateSensible) return;
    this.remove();
    this.precalculate();
    this.draw();
  }

  /**
   * Precalculates data for this chart.
   * @returns {LotivisUnimplementedMethodError}
   */
  precalculate() {
    return new LotivisUnimplementedMethodError(`precalculate()`);
  }

  /**
   * Removes any old content from this chart.
   * @returns {LotivisUnimplementedMethodError}
   */
  remove() {
    return new LotivisUnimplementedMethodError(`remove()`);
  }

  /**
   * Appends / draw the components of this chart.
   * @returns {LotivisUnimplementedMethodError}
   */
  draw() {
    return new LotivisUnimplementedMethodError(`draw()`);
  }

  /**
   * Tells this chart to ignore updates of a datasets controller.
   */
  makeUpdateInsensible() {
    this.updateSensible = false;
  }

  /**
   * Tells this chart to listen to update of a datasets controller.
   */
  makeUpdateSensible() {
    this.updateSensible = true;
  }
}

/**
 * Returns a copy of the passed object.  The copy is created by using the
 * JSON's `parse` and `stringify` functions.
 * @param object The java script object to copy.
 * @returns {any} The copy of the object.
 */
function copy(object) {
  return JSON.parse(JSON.stringify(object));
}

/**
 * Returns `true` if the given value not evaluates to false and is not 0. false else.
 * @param value The value to check.
 * @returns {boolean} A Boolean value indicating whether the given value is valid.
 */
function isValue(value) {
  return Boolean(value || value === 0);
}

/**
 * Returns the value if it evaluates to true or is 0.  Returns `GlobalConfig.unknown` else.
 * @param value The value to check.
 * @returns The value or `GlobalConfig.unknown`.
 */
function toValue(value) {
  return value || (value === 0 ? 0 : LotivisConfig.unknown);
}

/**
 *
 * @param flattenList
 * @returns {[]}
 */
function combine(flattenList) {
  let combined = [];
  let copiedList = copy(flattenList);
  for (let index = 0; index < copiedList.length; index++) {
    let listItem = copiedList[index];
    let entry = combined.find(function (entryItem) {
      return entryItem.dataset === listItem.dataset
        && entryItem.stack === listItem.stack
        && entryItem.label === listItem.label
        && entryItem.location === listItem.location
        && entryItem.date === listItem.date;
    });
    if (entry) {
      entry.value += (listItem.value + 0);
    } else {
      let entry = {};
      if (isValue(listItem.label)) entry.label = listItem.label;
      if (isValue(listItem.dataset)) entry.dataset = listItem.dataset;
      if (isValue(listItem.stack)) entry.stack = listItem.stack;
      if (isValue(listItem.location)) entry.location = listItem.location;
      if (isValue(listItem.locationTotal)) entry.locationTotal = listItem.locationTotal;
      if (isValue(listItem.date)) entry.date = listItem.date;
      if (isValue(listItem.dateTotal)) entry.dateTotal = listItem.dateTotal;
      if (isValue(listItem.locationName)) entry.locationName = listItem.locationName;
      entry.value = (listItem.value || 0);
      combined.push(entry);
    }
  }
  return combined;
}

/**
 * Returns
 *
 * @param flattenList
 * @returns {[]}
 */
function combineByStacks(flattenList) {
  let combined = [];
  for (let index = 0; index < flattenList.length; index++) {
    let listItem = flattenList[index];

    let entry = combined.find(function (entryItem) {
      return entryItem.stack === listItem.stack
        && entryItem.location === listItem.location
        && entryItem.date === listItem.date;
    });

    if (entry) {
      entry.value += (listItem.value + 0);
    } else {
      let entry = {};
      if (isValue(listItem.label)) entry.label = listItem.label;
      if (isValue(listItem.dataset)) entry.dataset = listItem.dataset;
      if (isValue(listItem.stack)) entry.stack = listItem.stack;
      if (isValue(listItem.location)) entry.location = listItem.location;
      if (isValue(listItem.locationTotal)) entry.locationTotal = listItem.locationTotal;
      if (isValue(listItem.date)) entry.date = listItem.date;
      if (isValue(listItem.dateTotal)) entry.dateTotal = listItem.dateTotal;
      if (isValue(listItem.locationName)) entry.locationName = listItem.locationName;
      entry.value = (listItem.value || 0);
      combined.push(entry);
    }
  }
  return combined;
}

/**
 *
 * @param flatData
 * @returns {[]}
 */
function combineByDate(flatData) {
  let combined = [];
  for (let index = 0; index < flatData.length; index++) {
    let listItem = flatData[index];
    let entry = combined.find(function (entryItem) {
      return entryItem.dataset === listItem.dataset
        && entryItem.stack === listItem.stack
        && entryItem.label === listItem.label
        && entryItem.date === listItem.date;
    });
    if (entry) {
      entry.value += (listItem.value + 0);
    } else {
      let entry = {};
      if (isValue(listItem.label)) entry.label = listItem.label;
      if (isValue(listItem.dataset)) entry.dataset = listItem.dataset;
      if (isValue(listItem.stack)) entry.stack = listItem.stack;
      if (isValue(listItem.date)) entry.date = listItem.date;
      if (isValue(listItem.dateTotal)) entry.dateTotal = listItem.dateTotal;
      entry.value = (listItem.value || 0);
      combined.push(entry);
    }
  }
  return combined;
}

/**
 *
 * @param flatData
 * @returns {[]}
 */
function combineByLocation(flatData) {
  let combined = [];
  for (let index = 0; index < flatData.length; index++) {
    let listItem = flatData[index];
    let entry = combined.find(function (entryItem) {
      return entryItem.dataset === listItem.dataset
        && entryItem.stack === listItem.stack
        && entryItem.label === listItem.label
        && entryItem.location === listItem.location;
    });
    if (entry) {
      entry.value += listItem.value;
    } else {
      let entry = {};
      if (isValue(listItem.label)) entry.label = listItem.label;
      if (isValue(listItem.dataset)) entry.dataset = listItem.dataset;
      if (isValue(listItem.stack)) entry.stack = listItem.stack;
      if (isValue(listItem.location)) entry.location = listItem.location;
      if (isValue(listItem.locationTotal)) entry.locationTotal = listItem.locationTotal;
      if (isValue(listItem.locationName)) entry.locationName = listItem.locationName;
      entry.value = listItem.value;
      combined.push(entry);
    }
  }
  return combined;
}

/**
 * Returns the sum of samples values for the given dataset.
 *
 * @param flatData The flat samples array.
 * @param dataset The dataset name.
 * @returns {*} The sum.
 */
function sumOfDataset(flatData, dataset) {
  return sumOfValues(flatData.filter(item => item.dataset === dataset));
}

/**
 * Returns the sum of samples values for the given label.
 *
 * @param flatData The flat samples array.
 * @param label The label.
 * @returns {*} The sum.
 */
function sumOfLabel(flatData, label) {
  return sumOfValues(flatData.filter(item => item.label === label));
}

/**
 * Returns the sum of samples values for the given stack.
 *
 * @param flatData The flat samples array.
 * @param stack The stack name.
 * @returns {*} The sum.
 */
function sumOfStack(flatData, stack) {
  return sumOfValues(flatData.filter(item => item.stack === stack));
}

/**
 * Returns the sum of the value properties of each item.
 *
 * @param flatData
 * @returns {*}
 */
function sumOfValues(flatData) {
  return flatData.map(item => +(item.value || 0)).reduce((acc, next) => acc + next, 0);
}

/**
 *
 * @param date
 * @constructor
 */
const DefaultDateAccess = (date) => date;

/**
 *
 * @param dateString
 * @returns {number}
 * @constructor
 */
const FormattedDateAccess = function (dateString) {
  let value = Date.parse(dateString);
  if (isNaN(value)) {
    lotivis_log_once(`Received NaN for date "${dateString}"`);
  }
  return value;
};

/**
 *
 * @param dateString
 * @returns {number}
 * @constructor
 */
const DateGermanAssessor = function (dateString) {
  let saveDateString = String(dateString);
  let components = saveDateString.split('.');
  let day = components[0];
  let month = components[1];
  let year = components[2];
  let date = new Date(`${year}-${month}-${day}`);
  return Number(date);
};

/**
 *
 * @param weekday
 * @returns {number}
 * @constructor
 */
const DateWeekAssessor = function (weekday) {
  let lowercase = weekday.toLowerCase();
  switch (lowercase) {
    case 'sunday':
    case 'sun':
      return 0;
    case 'monday':
    case 'mon':
      return 1;
    case 'tuesday':
    case 'tue':
      return 2;
    case 'wednesday':
    case 'wed':
      return 3;
    case 'thursday':
    case 'thr':
      return 4;
    case 'friday':
    case 'fri':
      return 5;
    case 'saturday':
    case 'sat':
      return 6;
    default:
      return -1;
  }
};

/**
 * @class DataViewCache
 */
class DataViewCache {

  /**
   * Creates a new instance of DataViewCache.
   */
  constructor() {
    let content = {};

    /**
     * Creates an identifier for a cached data view with the given parameters.
     * @param type The type of the graph.
     * @param locationFilters The collection of filtered locations.
     * @param dateFilters The collection of filtered dates.
     * @param datasetFilters The collection of filtered datasets.
     * @returns {*}
     */
    function createName(type, locationFilters, dateFilters, datasetFilters) {
      return type + locationFilters + dateFilters + datasetFilters;
    }

    /**
     * Returns the cached data view for the given parameters.
     * @param type The type of the graph.
     * @param locationFilters The collection of filtered locations.
     * @param dateFilters The collection of filtered dates.
     * @param datasetFilters The collection of filtered datasets.
     * @returns {*}
     */
    this.getDataView = function (type, locationFilters, dateFilters, datasetFilters) {
      let name = createName(type, locationFilters, dateFilters, datasetFilters);
      return content[name];
    };

    /**
     * Inserts the given data view into the cache for the given parameters.
     * @param dataView The data view to cache.
     * @param type The type of the graph.
     * @param locationFilters The collection of filtered locations.
     * @param dateFilters The collection of filtered dates.
     * @param datasetFilters The collection of filtered datasets.
     */
    this.setDataView = function (dataView, type, locationFilters, dateFilters, datasetFilters) {
      let name = createName(type, locationFilters, dateFilters, datasetFilters);
      content[name] = dataView;
    };

    /**
     * Invalidates the cache.
     */
    this.invalidate = function () {
      content = {};
    };
  }
}

/**
 * Controls a collection of datasets.
 * @class DatasetsController
 */
class DatasetsController {

  /**
   * Creates a new instance of DatasetsController
   * @param datasets The datasets to control.
   * @param config
   */
  constructor(datasets, config) {
    if (!Array.isArray(datasets)) {
      throw new InvalidFormatError(`Datasets are not an array.`);
    }
    this.initialize(config || {});
    this.setDatasets(datasets);
  }

  initialize(config) {
    this.config = config;
    this.dateAccess = this.config.dateAccess || DefaultDateAccess;
    this.locationFilters = this.config.locationFilters || [];
    this.dateFilters = this.config.dateFilters || [];
    this.datasetFilters = this.config.datasetFilters || [];
    this.filters = {};
    this.cache = new DataViewCache();
    if (this.config.filters) {
      this.filters.locations = this.config.filters.locations || [];
      this.filters.dates = this.config.filters.dates || [];
      this.filters.datasets = this.config.filters.datasets || [];
    }
  }

  getFlatDataCombinedStacks() {
    return combineByStacks(this.flatData);
  }

  getFlatDataCombinedDates() {
    return combineByDate(this.flatData);
  }

  getFlatDataCombinedLocations() {
    return combineByLocation(this.flatData);
  }

  getSumOfLabel(label) {
    return sumOfLabel(this.flatData, label);
  }

  getSumOfDataset(dataset) {
    return sumOfDataset(this.flatData, dataset);
  }

  getSumOfStack(stack) {
    return sumOfStack(this.flatData, stack);
  }

  getMax() {
    return d3LibraryAccess.max(this.datasets, function (dataset) {
      return d3LibraryAccess.max(dataset.data, function (item) {
        return item.value;
      });
    });
  }

  // MARK: - Colors

  getColorForDataset(label) {
    return this.datasetsColorsController.colorForDataset(label);
  }

  getColorForStack(stack) {
    return this.datasetsColorsController.colorForStack(stack);
  }

  getColorsForStack(stack) {
    return this.datasetsColorsController.colorsForStack(stack);
  }

  /**
   * Returns a string that can be used as filename for downloads.
   */
  getFilename() {
    if (!this.labels) return 'Unknown';
    let labels = this.labels.map(label => label.split(` `).join(`-`));
    if (labels.length > 10) {
      labels = labels.splice(0, 10);
    }
    return labels.join(',');
  }
}

/**
 *
 * @type {{
 * datasetsUpdate: string,
 * filterDates: string,
 * filterDataset: string,
 * filterLocations: string
 * resetFilters: string,
 * registration: string,
 * none: string,
 * datasetsSet: string
 * }}
 */
DatasetsController.NotificationReason = {
  none: 'none',
  registration: 'registration',
  datasetsSet: 'datasets-set',
  datasetsUpdate: 'datasets-update',
  filterDataset: 'dataset-filter',
  filterDates: 'dates-filter',
  filterLocations: 'location-filter',
  resetFilters: 'reset-filters'
};

/**
 * Sets a new datasets controller.  The chart is updated automatically.
 * @param newController The new datasets controller.
 */
Chart.prototype.setDatasetsController = function (newController) {
  if (this.datasetController) this.datasetController.removeListener(this);
  this.datasetController = newController;
  this.datasetController.addListener(this);
  this.update(newController, 'registration');
};

/**
 * Sets the datasets of this map chart.
 * @param newDatasets The new dataset.
 */
Chart.prototype.setDatasets = function (newDatasets) {
  this.setDatasetsController(new DatasetsController(newDatasets));
};

/**
 * Returns the presented datasets.
 * @returns {[*]} The collection of datasets.
 */
Chart.prototype.getDatasets = function () {
  if (!this.datasetController || !Array.isArray(this.datasetController.datasets)) return [];
  return this.datasetController.datasets;
};

/**
 * A lotivis card.
 * @class Card
 * @extends Component
 */
class Card extends Component {

  /**
   * Creates a new instance of Card.
   * @param parent The parental component.
   */
  constructor(parent) {
    super(parent);
    this.injectCard();
    this.injectHeader();
    this.injectBody();
    this.injectFooter();
  }

  /**
   * Appends the card element.
   */
  injectCard() {
    this.element = this.parent
      .append('div')
      .classed('lotivis-card', true);
  }

  /**
   * Appends the header of the card.
   */
  injectHeader() {
    this.header = this.element
      .append('div')
      .attr('class', 'lotivis-card-header');
    this.headerRow = this.header
      .append('div')
      .attr('class', 'lotivis-row');
    this.headerLeftComponent = this.headerRow
      .append('div')
      .attr('class', 'lotivis-card-header-left');
    this.headerCenterComponent = this.headerRow
      .append('div')
      .attr('class', 'lotivis-card-header-center');
    this.headerRightComponent = this.headerRow
      .append('div')
      .attr('class', 'lotivis-card-header-right lotivis-button-group');
    this.titleLabel = this.headerLeftComponent
      .append('div')
      .attr('class', 'lotivis-title-label');
  }

  /**
   * Appends the body of the card.
   */
  injectBody() {
    this.body = this.element
      .append('div')
      .attr('class', 'lotivis-card-body');
    this.content = this.body
      .append('div')
      .attr('class', 'lotivis-card-body-content');
  }

  /**
   * Appends the footer of the card.
   */
  injectFooter() {
    this.footer = this.element
      .append('div')
      .attr('class', 'lotivis-card-footer');
    this.footerRow = this.footer
      .append('div')
      .attr('class', 'lotivis-row');
    this.footerLeftComponent = this.footerRow
      .append('div')
      .attr('class', 'lotivis-col-6');
    this.footerRightComponent = this.footerRow
      .append('div')
      .attr('class', 'lotivis-col-6');
    this.footer.style('display', 'none');
  }

  /**
   * Sets the text of the title label.
   * @param newTitle The text of the title label.
   */
  setTitle(newTitle) {
    this.titleLabel.text(newTitle);
  }

  /**
   * Shows the footer by resetting its style display value.
   */
  showFooter() {
    this.footer.style('display', '');
  }

  /**
   * Hides the footer by setting its style display value to `none`.
   */
  hideFooter() {
    this.footer.style('display', 'none');
  }
}

class Checkbox extends Component {
  constructor(parent) {
    super(parent);
    this.renderInput();
    this.renderLabel();
  }

  // MARK: - Life Cycle
  renderInput() {
    let thisReference = this;
    this.element = this.parent
      .classed('radio-group', true)
      .append('input')
      .attr('type', 'checkbox')
      .attr('id', this.selector)
      .on('click', function (event) {
        if (!event.target) {
          return;
        }
        let checkbox = event.target;
        if (thisReference.onClick) {
          thisReference.onClick(checkbox.checked);
        }
      });
  }

  renderLabel() {
    this.label = this.parent
      .append('label')
      .attr('for', this.selector)
      .text('Unknown');
  }

  // MARK: - Functions
  setText(text) {
    this.label.text(text);
    return this;
  }

  setChecked(checked) {
    this.element.attr('checked', checked === true ? checked : null);
    return this;
  }

  onClick(checked) {
    // empty
    console.log('onClick: ' + checked);
  }

  enable() {
    this.element.attr('disabled', null);
    this.label.style('color', 'black');
  }

  disable() {
    this.element.attr('disabled', true);
    this.label.style('color', 'gray');
  }
}

/**
 * A lotivis popup.
 *
 * +----------------------------------------------------------------+
 * |                                                                |
 * |                                                                |
 *
 * @class Popup
 * @extends Component
 */
class Popup extends Component {

  /**
   * Creates a new instance of Popup.
   * @param parent The parental component.
   */
  constructor(parent = d3.select('body')) {
    super(parent);
    this.injectUnderground(parent);
    this.injectContainer();
    this.injectCard();
    this.inject();
    this.injectCloseButton();
    this.addCloseActionListeners();
  }

  // MARK: - Render

  /**
   * Appends components to this popup.
   * Should be overridden by subclasses.
   */
  inject() {
    // empty
  }

  /**
   * Appends the 'dim' background to the given parent.
   *
   * @param parent The parental element.
   */
  injectUnderground(parent) {
    this.modalBackgroundId = createID();
    this.modalBackground = parent
      .append('div')
      .classed('lotivis-popup-underground lotivis-fade-in', true)
      .attr('id', this.modalBackgroundId);
  }

  /**
   *
   */
  injectContainer() {
    this.elementId = createID();
    this.element = this.modalBackground
      .append('div')
      .classed('lotivis-popup', true)
      .attr('id', this.elementId);
  }

  /**
   *
   */
  injectCard() {
    this.card = new Card(this.element);
    this.card.element.classed('lotivis-popup', true);
  }

  /**
   * Appends a close button to the right header component.
   */
  injectCloseButton() {
    this.closeButton = new Button(this.card.headerRightComponent);
    this.closeButton.element.classed('lotivis-button-small', true);
    this.closeButton.setText('Close');
  }

  /**
   * Appends an on click listener to the button.
   */
  addCloseActionListeners() {
    let validIDs = [
      this.closeButton.selector,
      this.modalBackgroundId
    ];
    let popup = this;
    this.modalBackground.on('click', function (event) {
      if (!event || !event.target) return;
      if (!validIDs.includes(event.target.id)) return;
      popup.dismiss();
    });
  }

  // MARK: - Life Cycle

  /**
   * Tells the receiving popup that it is about to be presented.
   *
   * Subclasses may override.
   */
  willShow() {
    // empty
  }

  /**
   * Tells the receiving popup that it is now presented.
   *
   * Subclasses may override.
   */
  didShow() {
    // empty
  }

  /**
   * Presents the popup.
   */
  show() {
    if (this.willShow) this.willShow();
    this.getUnderground().style.display = 'block';
    if (this.didShow) this.didShow();
  }

  /**
   * Tells the receiving popup that it is about to be dismissed.
   *
   * Subclasses may override.
   */
  willDismiss() {
    // empty
  }

  /**
   * Tells the receiving popup that the DOM element will be removed.
   *
   * Subclasses may override.
   */
  willRemoveDOMElement() {
    // empty
  }

  /**
   * Dismisses the popup.
   */
  dismiss() {
    if (this.willDismiss) this.willDismiss();
    this.getUnderground().style.display = 'none';
    if (this.willRemoveDOMElement) this.willRemoveDOMElement();
    this.getUnderground().remove();
  }

  getUnderground() {
    return document.getElementById(this.modalBackgroundId);
  }

  showUnder(sourceElement, position = 'center') {
    if (!sourceElement) return;

    let preferredSize = this.preferredSize();
    let origin = this.calculateBottomCenter(sourceElement);

    if (position === 'left') {
      origin.x -= origin.width / 2;
    } else if (position === 'right') {
      origin.x -= preferredSize.width - origin.width / 2;
    } else { // assume center
      origin.x -= (preferredSize.width / 2);
    }

    let id = this.elementId;
    let popup = document.getElementById(id);

    popup.style.position = 'absolute';
    popup.style.width = preferredSize.width + 'px';
    // popup.style.height = preferredSize.height + 'px';
    popup.style.left = origin.x + 'px';
    popup.style.top = origin.y + 'px';

    this.show();
  }

  showBigModal() {
    let id = this.elementId;
    let popup = document.getElementById(id);
    let preferredSize = this.preferredSize();

    popup.style.position = 'relative';
    popup.style.margin = '50px auto';
    popup.style.width = preferredSize.width + 'px';

    this.show();
  }

  /**
   * Returns the preferred size of the popup.  Subclasses may override in order to
   * change the size of the popup.
   *
   * @returns {{width: number, height: number}}
   */
  preferredSize() {
    return {
      width: 300,
      height: 300
    };
  }

  /**
   * Returns the bottom middle point of the passed element.
   *
   * @param element
   * @param respectWindowScroll
   * @returns {{x: number, width: number, y: number, height: number}}
   */
  calculateBottomCenter(element, respectWindowScroll = false) {
    let rect = element.getBoundingClientRect();
    let x = rect.x + (rect.width / 2);
    let y = rect.y + rect.height;

    if (respectWindowScroll) {
      x += window.scrollX;
      y += window.scrollY;
    }

    return {
      x: x,
      y: y,
      width: rect.width,
      height: rect.height
    };
  }
}

/**
 *
 * @class ModalPopup
 * @extends Popup
 */
class ModalPopup extends Popup {

  /**
   *
   * @param parent
   */
  constructor(parent) {
    super(parent);
    this.modalBackground
      .classed('popup-underground', false)
      .classed('modal-underground', true);
  }

  /**
   *
   */
  inject() {
    super.inject();
    this.renderRow();
  }

  /**
   *
   */
  renderRow() {
    this.row = this.card.body
      .append('div')
      .classed('row', true);
    this.content = this.row
      .append('div')
      .classed('col-12 info-box-margin', true);
  }

  /**
   *
   */
  loadContent(url) {
    if (!url) return;
    let content = this.content;

    d3.text(url)
      .then(function (text) {
        console.log(text);
        content.html(text);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  /**
   * Returns the preferred size. The default is 800, 600.
   * @returns {{width: number, height: number}} The preferred size.
   */
  preferredSize() {
    return {
      width: 800,
      height: 600
    };
  }
}

/**
 *
 * @class Dropdown
 * @extends Component
 */
class Dropdown extends Component {

  /**
   * Creates a new instance of Dropdown.
   * @param parent The parent or selector.
   */
  constructor(parent) {
    super(parent);
    this.inputElements = [];
    this.selector = createID();
    this.element = parent
      .append('div')
      .classed('dropdown-container', true);
    this.selectId = createID();
    this.renderLabel();
    this.renderSelect();
  }

  renderLabel() {
    this.label = this.element
      .append('label')
      .attr('for', this.selectId);
  }

  renderSelect() {
    let thisReference = this;
    this.select = this.element
      .append('select')
      .attr('id', this.selectId)
      .on('change', function (event) {
        thisReference.onClick(event);
      });
  }

  addOption(optionId, optionName) {
    return this.select
      .append('option')
      .attr('id', optionId)
      .attr('value', optionId)
      .text(optionName);
  }

  setOptions(options) {
    this.removeAllInputs();
    for (let i = 0; i < options.length; i++) {
      let name;

      if (Array.isArray(options[i])) {
        options[i][0] || options[i].id;
        name = options[i][1] || options[i].translatedTitle;
      } else if (typeof options[i] === 'string') {
        options[i];
        name = options[i];
      } else {
        options[i].id;
        name = options[i].title;
      }

      let inputElement = this.addOption(name, name);
      this.inputElements.push(inputElement);
    }
    return this;
  }

  removeAllInputs() {
    this.element.selectAll('input').remove();
    return this;
  }

  onClick(event) {
    let element = event.target;
    if (!element) {
      return;
    }
    let value = element.value;
    if (!this.onChange) {
      return;
    }
    this.onChange(value);
    return this;
  }

  onChange(argument) {
    console.log('argument: ' + argument);
    if (typeof argument !== 'string') {
      this.onChange = argument;
    }
    return this;
  }

  // MARK: - Chaining Setter

  setLabelText(text) {
    this.label.text(text);
    return this;
  }

  setOnChange(callback) {
    this.onChange = callback;
    return this;
  }

  setSelectedOption(optionID) {
    if (this.inputElements.find(function (item) {
      return item.attr('value') === optionID;
    }) !== undefined) {
      this.value = optionID;
    }
    return this;
  }

  set value(optionID) {
    document.getElementById(this.selectId).value = optionID;
  }

  get value() {
    return document.getElementById(this.selectId).value;
  }
}

Dropdown.create = function (selector, options, selectedOption, onChange) {
  let div = d3.select(`#${selector}`);
  let dropdown = new Dropdown(div);
  dropdown.setLabelText('Group Size');
  dropdown.setOptions(options);
  dropdown.setSelectedOption(selectedOption);
  dropdown.setOnChange(onChange);
  return dropdown;
};

/**
 * A lotivis card containing a textarea.
 * @class TextareaCard
 * @extends Card
 */
class TextareaCard extends Card {

  /**
   * Creates a new instance of TextareaCard.
   * @param parent The parental element or a selector (id).
   */
  constructor(parent) {
    super(parent);
    this.render();
    this.updateSensible = true;

    if (this.config) {
      this.textarea.attr('rows', this.config.lines || 25);
      this.setTitle(this.config.title || this.getClassname());
    } else {
      this.textarea.attr('rows', 25);
      this.setTitle(this.getClassname());
    }
  }

  /**
   * Appends the component to this card.
   */
  render() {
    this.textareaID = createID();
    this.textarea = this.body
      .append('textarea')
      .attr('id', this.textareaID)
      .attr('name', this.textareaID)
      .attr('class', 'lotivis-data-textarea')
      .on('keyup', this.onKeyup.bind(this));
    this.downloadButton = new Button(this.headerRightComponent);
    this.downloadButton.setText('Download');
    this.downloadButton.onClick = function (event) {
      let content = this.getTextareaContent();
      this.download(content);
    }.bind(this);
  }

  /**
   * Returns the text of the textarea.
   * @returns {*} The text of the textarea.
   */
  getTextareaContent() {
    return document.getElementById(this.textareaID).value || "";
  }

  /**
   * Sets the text of the textarea.
   * @param newContent The text for the textarea.
   */
  setTextareaContent(newContent) {
    let textarea = document.getElementById(this.textareaID);
    if (!textarea) return;
    textarea.value = newContent;

    if (this.config && this.config.updatesHeight !== true) return;
    if (typeof newContent !== 'string') return;
    let numberOfRows = newContent.split(`\n`).length;
    this.textarea.attr('rows', numberOfRows);
  }

  /**
   * Enable the textarea.
   */
  enableTextarea() {
    this.textarea.attr('disabled', null);
    [this.textarea, this.titleLabel].forEach(item => item.classed('lotivis-disabled', false));
  }

  /**
   * Disables the textarea.
   */
  disableTextarea() {
    this.textarea.attr('disabled', '');
    [this.textarea, this.titleLabel].forEach(item => item.classed('lotivis-disabled', true));
  }

  /**
   * Tells this dataset card that a 'keyup'-event occurred in the textarea.
   * @param event The key event.
   */
  onKeyup(event) {
    throw new LotivisUnimplementedMethodError(`onKeyup(event)`);
  }

  /**
   * Initiates a download of the content of the textarea.
   * @param content The new content of the textarea.
   */
  download(content) {
    throw new LotivisUnimplementedMethodError(`download(content)`);
  }
}

/**
 *
 * @class UpdatableDataviewCard
 * @extends TextareaCard
 */
class UpdatableDataviewCard extends TextareaCard {

  /**
   * Creates a new instance of UpdatableDataviewCard.
   * @param parent The parental element or a selector (id).
   */
  constructor(parent = {}) {
    // parent.title = parent.title || 'UpdatableDataviewCard';
    super(parent);
    this.updateSensible = true;
    this.downloadButton.hide();
  }

  /**
   * Sets the dataset controller.
   * @param newDatasetController
   */
  setDatasetsController(newDatasetController) {
    this.datasetsController = newDatasetController;
    this.datasetsController.addListener(this);
  }

  /**
   * Tells thi dataset card that the datasets of the datasets controller has changed.
   * @param datasetsController The datasets controller.
   * @param reason The reason of the update.
   */
  update(datasetsController, reason) {
    if (!this.updateSensible) {
      lotivis_log(`[lotivis]  NOT sensible ${this}. Reason '${reason}'.`);
      return;
    } else if (this.config && this.config.updateSensible === false) {
      lotivis_log(`[lotivis]  NOT sensible (Config) ${this}. Reason '${reason}'.`);
      return;
    } else if (!datasetsController) {
      lotivis_log(`[lotivis]  NO controller ${this}. Reason '${reason}'.`);
      return;
    }

    let datasets = datasetsController.datasets;
    let content = this.datasetsToText(datasetsController, datasets);

    this.setTextareaContent(content);
    this.cachedDatasets = datasets;

    lotivis_log(`[lotivis]  Update ${this}. Reason '${reason}'.`);
  }

  /**
   * Sets the content of the textarea by rendering the given datasets to text.  Subclasses should override.
   * @param controller The datasets controller.
   * @param datasets The datasets to render.
   * @return {*}
   */
  datasetsToText(controller, datasets) {
    throw new LotivisUnimplementedMethodError(`Subclasses should override.`);
  }
}

/**
 * Validates the given datasets.
 * @param datasets The datasets to validate.
 * @throws InvalidFormatError
 */
function validateDatasets(datasets) {

  if (!datasets) {
    throw new InvalidFormatError(`No dataset given.`);
  } else if (!Array.isArray(datasets)) {
    throw new InvalidFormatError(`Expecting array of datasets.`);
  }

  for (let index = 0; index < datasets.length; index++) {
    validateDataset(datasets[index]);
  }
}

/**
 * Validates the given dataset.
 * @param dataset The dataset to validate.
 * @throws InvalidFormatError
 * @throws MissingPropertyError
 */
function validateDataset(dataset) {
  if (!dataset) {
    throw new InvalidFormatError(`No dataset given.`);
  } else if (!dataset.label) {
    throw new MissingPropertyError(`Missing label for dataset. ${dataset}`);
  } else if (!dataset.data) {
    throw new MissingPropertyError(`Invalid data. Property is not an array. Dataset: ${dataset.label}`);
  } else if (!Array.isArray(dataset.data)) {
    throw new InvalidFormatError(`Invalid data. Property is not an array. Dataset: ${dataset.label}`);
  }

  let data = dataset;
  for (let index = 0; index < data.length; index++) {
    validateDataItem(data[index]);
  }
}

/**
 * Validates the given datasets.controller item by ensuring it has a valid `time`, `location` and `value` property value.
 * @param item The datasets.controller item to validate.
 * @throws MissingPropertyError
 */
function validateDataItem(item) {
  if (!item.date) {
    throw new MissingPropertyError(`Missing date property for item.`, item);
  } else if (!item.location) {
    throw new MissingPropertyError(`Missing location property for item.`, item);
  }
}

/**
 * Compares the string version of each oof the two given values for equality.
 * @param value1 The first value to compare.
 * @param value2 The second value to compare.
 * @returns {boolean} `True` if the string versions are equal, `false` if not.
 */
function equals(value1, value2) {
  return String(value1) === String(value2);
}

/**
 * Returns a Boolean value indicating whether the JSON string version of the given two objects are equal.
 * @param object1 The first object to compare.
 * @param object2 The second object to compare.
 * @returns {boolean} `True` if the JSON strings of the given objects are equal,`false` if not.
 */
function objectsEqual(object1, object2) {
  if (object1 === object2) return true;
  let string1 = JSON.stringify(object1);
  let string2 = JSON.stringify(object2);
  return string1 === string2;
}

/**
 *
 * @class EditableDataviewCard
 * @extends UpdatableDataviewCard
 */
class EditableDataviewCard extends UpdatableDataviewCard {

  /**
   * Creates a new instance of DatasetCard.
   * @param parent The parental element or a selector (id).
   */
  constructor(parent) {
    super(parent);
    this.toast = new Toast(this.parent);
    this.downloadButton.show();
  }

  /**
   * Tells this dataset card that a 'keyup'-event occurred in the textarea.
   */
  onKeyup() {
    this.updateDatasetsOfController.bind(this)(true);
  }

  /**
   * Tells
   * @param notifyController A boolean value indicating whether the datasets controller should be notified about the
   * update.
   */
  updateDatasetsOfController(notifyController = false) {

    let content = this.getTextareaContent();
    this.toast.setStatusMessage(null);

    try {

      // will throw an error if parsing is not possible
      let parsedDatasets = this.textToDatasets(content);
      if (!parsedDatasets) return;

      // will throw an error if parsed datasets aren't valid.
      validateDatasets(parsedDatasets);

      if (notifyController === true) {

        if (!this.datasetsController) {
          return lotivis_log(`[lotivis]  No datasets controller.`);
        }

        if (objectsEqual(this.cachedDatasets, parsedDatasets)) {
          return lotivis_log(`[lotivis]  No changes in datasets.`);
        }

        this.cachedDatasets = parsedDatasets;
        this.updateSensible = false;
        this.datasetsController.setDatasets(parsedDatasets);
        this.updateSensible = true;
      }

    } catch (error) {
      lotivis_log(`[lotivis]  ERROR: ${error}`);
      this.toast.setStatusMessage(error);
    }
  }

  datasetsToText(datasets) {
    return new LotivisUnimplementedMethodError('datasetsToText(datasets)');
  }
}

/**
 * Appends the given string in extension to the given string filename if filename not already ends with this extension.
 * @param filename A string with or without an extension.
 * @param extension The extension the filename will end with.
 * @returns {*|string} The filename with the given extension.
 */
function appendExtensionIfNeeded(filename, extension) {
  if (extension === '' || extension === '.') return filename;
  extension = extension.startsWith(".") ? extension : `.${extension}`;
  return filename.endsWith(extension) ? filename : `${filename}${extension}`;
}

function createDownloadFilename() {
  let components = [LotivisConfig.downloadFilePrefix];
  let separator = LotivisConfig.filenameSeparator;
  for (let i = 0; i < arguments.length; i++) {
    components.push(String(arguments[i]));
  }
  return components.join(separator);
}

// http://bl.ocks.org/Rokotyan/0556f8facbaf344507cdc45dc3622177
/**
 * Parses a String from the given (D3.js) SVG node.
 *
 * @param svgNode The node of the SVG.
 * @returns {string} The parsed String.
 */
function getSVGString(svgNode) {

  svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
  let cssStyleText = getCSSStyles(svgNode);
  appendCSS(cssStyleText, svgNode);

  let serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgNode);

  // Fix root xlink without namespace
  svgString = svgString.replace(
    /(\w+)?:?xlink=/g,
    'xmlns:xlink='
  );

  // Safari NS namespace fix
  svgString = svgString.replace(
    /NS\d+:href/g,
    'xlink:href'
  );

  return svgString;

  function getCSSStyles(parentElement) {
    let selectorTextArr = [];

    // Add Parent element Id and Classes to the list
    selectorTextArr.push('#' + parentElement.id);
    for (let c = 0; c < parentElement.classList.length; c++) {
      if (!contains('.' + parentElement.classList[c], selectorTextArr)) {
        selectorTextArr.push('.' + parentElement.classList[c]);
      }
    }

    // Add Children element Ids and Classes to the list
    let nodes = parentElement.getElementsByTagName("*");
    for (let i = 0; i < nodes.length; i++) {
      let id = nodes[i].id;
      if (!contains('#' + id, selectorTextArr)) {
        selectorTextArr.push('#' + id);
      }

      let classes = nodes[i].classList;
      for (let c = 0; c < classes.length; c++) {
        if (!contains('.' + classes[c], selectorTextArr)) {
          selectorTextArr.push('.' + classes[c]);
        }
      }
    }

    // Extract CSS Rules
    let extractedCSSText = "";
    for (let i = 0; i < document.styleSheets.length; i++) {
      let s = document.styleSheets[i];

      try {
        if (!s.cssRules) continue;
      } catch (e) {
        if (e.name !== 'SecurityError') throw e; // for Firefox
        continue;
      }

      let cssRules = s.cssRules;
      for (let r = 0; r < cssRules.length; r++) {
        if (contains(cssRules[r].selectorText, selectorTextArr)) {
          extractedCSSText += cssRules[r].cssText;
        }
      }
    }

    return extractedCSSText;

    function contains(str, arr) {
      return arr.indexOf(str) !== -1;
    }
  }

  function appendCSS(cssText, element) {
    let styleElement = document.createElement("style");
    styleElement.setAttribute("type", "text/css");
    styleElement.innerHTML = cssText;
    let refNode = element.hasChildNodes() ? element.children[0] : null;
    element.insertBefore(styleElement, refNode);
  }
}

/**
 *
 * @param svgString
 * @param width
 * @param height
 * @param callback
 */
function svgString2Image(svgString, width, height, callback) {

  // Convert SVG string to samples URL
  let imageSource = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  let context = canvas.getContext("2d");
  let image = new Image();
  image.onload = function () {
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    let data = canvas.toDataURL("image/png");
    if (callback) callback(data);
  };

  image.src = imageSource;
}

/**
 * Returns the size of the viewBox or the normal size of the given svg element.
 *
 * @param svgElement The svg element.
 * @returns {number[]} The size [width, height].
 */
function getOriginalSizeOfSVG(svgElement) {
  let viewBoxBaseValue = svgElement.viewBox.baseVal;
  if (viewBoxBaseValue.width !== 0 && viewBoxBaseValue.height !== 0) {
    return [
      viewBoxBaseValue.width,
      viewBoxBaseValue.height
    ];
  } else {
    return [
      svgElement.width.baseVal.value,
      svgElement.height.baseVal.value,
    ];
  }
}

/**
 * Creates and appends an anchor linked to the given samples which is then immediately clicked.
 *
 * @param blob The samples to be downloaded.
 * @param filename The name of the file.
 */
function downloadBlob(blob, filename) {
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    let anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}

/**
 * Initiates a download of a JSON file with the given content and the given filename.
 * @param jsonString The JSON content.
 * @param filename The filename of the file to be downloaded. Will append '.json' extension
 * if needed.
 */
function downloadJSON(jsonString, filename) {
  let blob = new Blob([jsonString], {type: 'text/json'});
  let saveFilename = appendExtensionIfNeeded(filename, 'json');
  downloadBlob(blob, saveFilename);
}

function downloadCSV(jsonString, filename) {
  let blob = new Blob([jsonString], {type: 'text/csv'});
  let saveFilename = appendExtensionIfNeeded(filename, 'csv');
  downloadBlob(blob, saveFilename);
}

/**
 * Initiates a download of the PNG image of the SVG with the given selector (id).
 *
 * @param selector The id of the SVG element to create the image of.
 * @param filename The name of the file which is been downloaded.
 */
function downloadImage(selector, filename) {
  console.log('selector:' + selector);
  console.log('filename:' + filename);
  let svgElement = d3.select('#' + selector);
  let node = svgElement.node();
  let size = getOriginalSizeOfSVG(node);
  let svgString = getSVGString(node);

  svgString2Image(svgString, 2 * size[0], 2 * size[1], function (dataURL) {
    console.log('dataURL:' + dataURL);
    fetch(dataURL)
      .then(res => res.blob())
      .then(function (dataBlob) {
        let saveFilename = appendExtensionIfNeeded(filename, 'png');

        console.log('saveFilename:' + saveFilename);

        downloadBlob(dataBlob, saveFilename);
      });
  });
}

/**
 * A card containing a textarea which contains the JSON text of a dataset collection.
 * @class DatasetsJSONCard
 * @extends EditableDataviewCard
 */
class DatasetsJSONCard extends EditableDataviewCard {

  /**
   * Creates a new instance of DatasetJSONCard.
   * @param parent The parental element or a selector (id).
   */
  constructor(parent = 'datasets-json-card') {
    if (Object.getPrototypeOf(parent) === Object.prototype) {
      parent.selector = parent.selector || 'datasets-json-card';
    }
    super(parent);
    this.setTitle('Dataset JSON');
  }

  download(content) {
    let filename = this.datasetsController.getFilename();
    let downloadFilename = createDownloadFilename(filename, `datasets`);
    downloadJSON(content, downloadFilename);
  }

  textToDatasets(text) {
    if (text === "") return [];
    return JSON.parse(text.trim());
  }

  datasetsToText(datasetsController) {
    return JSON.stringify(datasetsController.datasets, null, 2) || "";
  }
}

/*
Following code from:
https://gist.github.com/Jezternz/c8e9fafc2c114e079829974e3764db75

We use this function to save samples.parse a CSV file.
 */

const csvStringToArray = strData => {
  const objPattern = new RegExp(("(\\,|\\r?\\n|\\r|^)(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\\,\\r\\n]*))"), "gi");
  let arrMatches = null, arrData = [[]];
  while (arrMatches = objPattern.exec(strData)) {
    if (arrMatches[1].length && arrMatches[1] !== ",") arrData.push([]);
    arrData[arrData.length - 1].push(arrMatches[2] ?
      arrMatches[2].replace(new RegExp("\"\"", "g"), "\"") :
      arrMatches[3]);
  }
  return arrData;
};

/**
 * Returns a new version of the given string by trimming the given char from the beginning and the end of the string.
 * @param string The string to be trimmed.
 * @param character The character to trim.
 * @returns {string} The trimmed version of the string.
 */
function trimByChar(string, character) {
  const saveString = String(string);
  const first = [...saveString].findIndex(char => char !== character);
  const last = [...saveString].reverse().findIndex(char => char !== character);
  return saveString.substring(first, saveString.length - last);
}

/**
 * Returns a dataset collection created from the given flat samples collection.
 * @param flatData The flat samples collection.
 * @returns {[]} A collection of datasets.
 */
function createDatasets(flatData) {
  let datasetsByLabel = {};

  for (let itemIndex = 0; itemIndex < flatData.length; itemIndex++) {
    let item = flatData[itemIndex];
    let label = item.dataset || item.label;
    let dataset = datasetsByLabel[label];

    if (dataset) {
      dataset.data.push({
        date: item.date,
        location: item.location,
        value: item.value
      });
    } else {
      datasetsByLabel[label] = {
        label: label,
        stack: item.stack,
        data: [{
          date: item.date,
          location: item.location,
          value: item.value
        }]
      };
    }
  }

  let datasets = [];
  let labels = Object.getOwnPropertyNames(datasetsByLabel);

  for (let index = 0; index < labels.length; index++) {
    let label = labels[index];
    if (label.length === 0) continue;
    datasets.push(datasetsByLabel[label]);
  }

  return datasets;
}

function parseCSV(text) {
  let flatData = [];
  let arrays = csvStringToArray(text);
  let headlines = arrays.shift();

  for (let lineIndex = 0; lineIndex < arrays.length; lineIndex++) {

    let lineArray = arrays[lineIndex].map(element => trimByChar(element, `"`));

    if (lineArray.length < 5) {
      lotivis_log(`Skipping row: ${lineArray}`);
      continue;
    }

    flatData.push({
      label: lineArray[0],
      stack: lineArray[1],
      value: +lineArray[2],
      date: lineArray[3],
      location: lineArray[4]
    });
  }

  let datasets = createDatasets(flatData);
  datasets.csv = {
    content: text,
    headlines: headlines,
    lines: arrays,
  };

  return datasets;
}

/**
 * Returns a flat version of the given dataset collection.
 *
 * @param datasets The collection of datasets.
 * @returns {[]} The array containing the flat samples.
 */
function flatDatasets(datasets) {
  let flatData = [];
  let datasetsCopy = datasets;
  for (let datasetIndex = 0; datasetIndex < datasetsCopy.length; datasetIndex++) {
    let dataset = datasetsCopy[datasetIndex];
    let flatDataChunk = flatDataset(dataset);
    flatData = flatData.concat(flatDataChunk);
  }
  return flatData;
}

/**
 * Returns an array containing the flat samples of the given dataset.
 *
 * @param dataset The dataset with samples.
 * @returns {[]} The array containing the flat samples.
 */
function flatDataset(dataset) {
  let flatData = [];
  if (!dataset.data) {
    console.log('Lotivis: Flat samples for dataset without samples requested. Will return an empty array.');
    return flatData;
  }
  dataset.data.forEach(item => {
    let newItem = {};
    newItem.dataset = dataset.label;
    newItem.label = dataset.label;
    newItem.stack = dataset.stack || dataset.label;
    newItem.location = item.location;
    newItem.date = item.date;
    newItem.dateNumeric = item.dateNumeric;
    newItem.value = item.value;
    flatData.push(newItem);
  });
  return flatData;
}

/**
 * Returns the given string with a quotation mark in the left and right.
 * @param aString The string to surround by quotation marks.
 * @returns {string} The string surrounded by quotation marks.
 */
function surroundWithQuotationMarks(aString) {
  return `"${aString}"`;
}

/**
 * Returns the CSV string of the given datasets.
 * @param datasets The datasets to create the CSV of.
 */
function renderCSV(datasets) {
  let flatData = flatDatasets(datasets);
  let headlines = ['label', 'stack', 'value', 'date', 'location'];
  let csvContent = `${headlines.join(',')}\n`;
  for (let index = 0; index < flatData.length; index++) {
    let data = flatData[index];
    let components = [];
    components.push(surroundWithQuotationMarks(data.dataset || 'Unknown'));
    components.push(surroundWithQuotationMarks(data.stack || ''));
    components.push(data.value || '0');
    components.push(surroundWithQuotationMarks(data.date || ''));
    components.push(surroundWithQuotationMarks(data.location || ''));
    csvContent += `${components.join(`,`)}\n`;
  }
  return csvContent;
}

/**
 * Presents the CSV version of datasets.  The presented CSV can be edited.
 * @class DatasetCSVCard
 * @extends Card
 */
class DatasetCSVCard extends EditableDataviewCard {

  /**
   * Creates a new instance of DatasetCSVCard.
   * @param parent The parental element or a selector (id).
   */
  constructor(parent) {
    super(parent);
    this.setTitle('Dataset CSV');
  }

  download(content) {
    let filename = this.datasetsController.getFilename();
    let downloadFilename = createDownloadFilename(filename, `datasets`);
    downloadCSV(content, downloadFilename);
  }

  textToDatasets(text) {
    if (text === "") return [];
    return parseCSV(text);
  }

  datasetsToText(datasetsController) {
    return renderCSV(datasetsController.datasets);
  }
}

/**
 * Returns a collection of datasets parsed from the given CSV content.
 * @param text The CSV content.
 * @returns {[]} The parsed datasets.
 */
function parseCSVDate(text) {
  let arrays = csvStringToArray(text);
  let datasetLabels = arrays.shift();
  datasetLabels.shift();
  let datasets = [];
  let minLineLength = datasetLabels.length;

  for (let index = 0; index < datasetLabels.length; index++) {
    datasets.push({
      label: datasetLabels[index],
      data: []
    });
  }

  for (let lineIndex = 0; lineIndex < arrays.length; lineIndex++) {
    let lineArray = arrays[lineIndex].map(element => trimByChar(element, `"`));
    if (lineArray.length < minLineLength) continue;

    let date = lineArray.shift();

    for (let columnIndex = 0; columnIndex < lineArray.length; columnIndex++) {
      let value = lineArray[columnIndex];
      datasets[columnIndex].data.push({
        date: date,
        value: value
      });
    }
  }

  datasets.csv = {
    content: text,
    headlines: datasetLabels.push(),
    lines: arrays,
  };

  return datasets;
}

/**
 * Returns the set of dataset names from the given dataset collection.
 *
 * @param datasets The collection of datasets.
 * @returns {[]} The array containing the flat samples.
 */
function extractLabelsFromDatasets(datasets) {
  return toSet(datasets.map(dataset => toValue(dataset.label)));
}

/**
 * Returns the set of stacks from the given dataset collection.
 * Will fallback on dataset property if stack property isn't present.
 *
 * @param datasets The collection of datasets.
 * @returns {[]} The array containing the flat samples.
 */
function extractStacksFromDatasets(datasets) {
  return toSet(datasets.map(dataset => toValue(dataset.stack || dataset.label)));
}

/**
 * Returns the set of dates from the given dataset collection.
 *
 * @param datasets The collection of datasets.
 * @returns {[]} The set containing the dates.
 */
function extractDatesFromDatasets(datasets) {
  return extractDatesFromFlatData(flatDatasets(datasets));
}

/**
 * Returns the set of locations from the given dataset collection.
 *
 * @param datasets The collection of datasets.
 * @returns {[]} The set containing the locations.
 */
function extractLocationsFromDatasets(datasets) {
  return extractLocationsFromFlatData(flatDatasets(datasets));
}

/**
 * Returns the set of dates from the given dataset collection.
 *
 * @param flatData The flat samples array.
 * @returns {[]} The set containing the dates.
 */
function extractDatesFromFlatData(flatData) {
  return toSet(flatData.map(item => toValue(item.date)));
}

/**
 * Returns the set of locations from the given dataset collection.
 *
 * @param flatData The flat samples array.
 * @returns {[]} The set containing the locations.
 */
function extractLocationsFromFlatData(flatData) {
  return toSet(flatData.map(item => toValue(item.location)));
}

/**
 * Return an array containing each equal item of the given array only once.
 *
 * @param array The array to create a set of.
 * @returns {any[]} The set version of the array.
 */
function toSet(array) {
  return Array.from(new Set(array));
}

/**
 * Returns the earliest time occurring in the flat array of items.
 *
 * @param flatData The flat samples array.
 * @param dateAccess
 * @returns {*} The earliest time.
 */
function extractEarliestDate(flatData, dateAccess = (date) => date) {
  return extractDatesFromFlatData(flatData)
    .sort((left, right) => dateAccess(left) - dateAccess(right)).shift();
}

/**
 * Returns the earliest time occurring in the flat array of items.
 *
 * @param flatData The flat samples array.
 * @param dateAccess
 * @returns {*} The earliest time.
 */
function extractEarliestDateWithValue(flatData, dateAccess = (date) => date) {
  return extractEarliestDate(filterWithValue(flatData), dateAccess);
}

/**
 * Returns the latest time occurring in the flat array of items.
 *
 * @param flatData The flat samples array.
 * @param dateAccess
 * @returns {*} The latest time.
 */
function extractLatestDate(flatData, dateAccess = (date) => date) {
  return extractDatesFromFlatData(flatData)
    .sort((left, right) => dateAccess(left) - dateAccess(right)).pop();
}

/**
 * Returns the latest time occurring in the flat array of items.
 *
 * @param flatData The flat samples array.
 * @param dateAccess
 * @returns {*} The latest time.
 */
function extractLatestDateWithValue(flatData, dateAccess = (date) => date) {
  return extractLatestDate(filterWithValue(flatData), dateAccess);
}

/**
 * Returns a filtered collection containing all items which have a valid value greater than 0.
 *
 * @param flatData The flat samples to filter.
 * @returns {*} All items with a value greater 0.
 */
function filterWithValue(flatData) {
  return flatData.filter(item => (item.value || 0) > 0);
}

/**
 *
 * @param datasets
 * @param dateAccess
 * @returns {{time: *}[]}
 */
function dateToItemsRelation(datasets, dateAccess) {

  let flatData = flatDatasets(datasets);
  flatData = combineByDate(flatData);

  let listOfDates = extractDatesFromDatasets(datasets);
  // verbose_log('listOfDates', listOfDates);
  listOfDates = listOfDates.reverse();
  // verbose_log('listOfDates', listOfDates);
  // listOfDates = listOfDates.sort(function (left, right) {
  //   return dateAccess(left) - dateAccess(right);
  // });

  let listOfLabels = extractLabelsFromDatasets(datasets);

  return listOfDates.map(function (date) {
    let datasetDate = {date: date};
    flatData
      .filter(item => item.date === date)
      .forEach(function (entry) {
        datasetDate[entry.dataset] = entry.value;
        datasetDate.total = entry.dateTotal;
      });

    // addDataset zero values for empty datasets
    for (let index = 0; index < listOfLabels.length; index++) {
      let label = listOfLabels[index];
      if (!datasetDate[label]) {
        datasetDate[label] = 0;
      }
    }

    return datasetDate;
  });
}

/**
 *
 * @param datasets
 */
function renderCSVDate(datasets) {
  let dateRelation = dateToItemsRelation(datasets);
  let labels = extractLabelsFromDatasets(datasets);
  let headlines = ['date'];

  for (let labelIndex = 0; labelIndex < labels.length; labelIndex++) {
    headlines.push(labels[labelIndex]);
  }

  let csvContent = `${headlines.join(',')}\n`;

  for (let index = 0; index < dateRelation.length; index++) {
    let dateRow = dateRelation[index];
    let csvRow = `${dateRow.date}`;

    for (let labelIndex = 0; labelIndex < labels.length; labelIndex++) {
      let label = labels[labelIndex];
      csvRow += `,${dateRow[label]}`;
    }

    csvContent += `${csvRow}\n`;
  }

  return csvContent;
}

/**
 * Presents the CSV version of datasets.  The presented CSV can be edited.
 * @class DatasetCSVDateCard
 * @extends Card
 */
class DatasetCSVDateCard extends EditableDataviewCard {

  /**
   * Creates a new instance of DatasetCSVCard.
   * @param parent The parental element or a selector (id).
   */
  constructor(parent) {
    super(parent);
    this.setTitle('Dataset CSV');
  }

  download(content) {
    let filename = this.datasetsController.getFilename();
    let downloadFilename = createDownloadFilename(filename, `datasets`);
    downloadCSV(content, downloadFilename);
  }

  textToDatasets(text) {
    if (text === "") return [];
    return parseCSVDate(text);
  }

  datasetsToText(datasetsController) {
    return renderCSVDate(datasetsController.datasets);
  }
}

/**
 * A card containing a textarea which contains the JSON text of a dataset collection.
 * @class DataviewCard
 * @extends UpdatableDataviewCard
 */
class DataviewCard extends UpdatableDataviewCard {

  /**
   * Creates a new instance of DataviewCard.
   * @param parent The parental element or a selector (id).
   */
  constructor(parent) {
    super(parent);
    if (!this.config) this.config = {};
    this.config.updatesHeight = this.config.updatesHeight || true;
    this.disableTextarea();
  }

  datasetsToText(datasets) {
    if (!this.datasetsController) return "No datasets controller.";
    let dataview = this.getDataview();
    return JSON.stringify(dataview, null, 2);
  }

  getDataview() {
    // empty
  }
}

class DataviewDateCard extends DataviewCard {
  getTitle() {
    return 'Dataview Date';
  }

  getDataview() {
    return this.datasetsController.getDateDataview();
  }
}

class DataViewPlotCard extends DataviewCard {
  getTitle() {
    return 'Dataview Plot';
  }

  getDataview() {
    return this.datasetsController.getPlotDataview();
  }
}

class DataViewMapCard extends DataviewCard {
  getTitle() {
    return 'Dataview Map';
  }

  getDataview() {
    return this.datasetsController.getLocationDataview();
  }
}

class DataviewFlatCard extends DataviewCard {
  getTitle() {
    return 'Flat Data';
  }

  getDataview() {
    return this.datasetsController.flatData;
  }
}

/**
 * @class DataviewDatasetsControllerCard
 * @extends DataviewCard
 */
class DataviewDatasetsControllerCard extends DataviewCard {

  /**
   * Creates a new instance of DataviewDatasetsControllerCard.
   */
  constructor(parent) {
    super(parent);
  }

  datasetsToText(datasets) {
    return JSON.stringify({
      labels: this.datasetsController.labels,
      stacks: this.datasetsController.stacks,
      dates: this.datasetsController.dates,
      locations: this.datasetsController.locations,
      filters: {
        locations: this.datasetsController.locationFilters,
        dates: this.datasetsController.dateFilters,
        datasets: this.datasetsController.datasetFilters,
      },
      selection: {},
      datasets: this.datasetsController.datasets,
      flatData: this.datasetsController.flatData,
      originalDatasets: this.datasetsController.originalDatasets
    }, null, 2);
  }
}

/**
 * @class DataviewDatasetsControllerSelectionCard
 * @extends DataviewCard
 */
class DataviewDatasetsControllerSelectionCard extends DataviewCard {

  /**
   * Creates a new instance of DataviewDatasetsControllerSelectionCard.
   */
  constructor(parent) {
    super(parent);
  }

  datasetsToText(datasets) {
    return JSON.stringify(this.datasetsController.getSelection(), null, 2);
  }
}

/**
 * @class DateAxisRenderer
 */
class DateAxisRenderer {

  /**
   * Creates a new instance of DateAxisRenderer.
   * @param dateChart The parental time chart.
   */
  constructor(dateChart) {

    /**
     * Appends the `left` and `bottom` axis to the time chart.
     */
    this.render = function () {
      let height = dateChart.config.height;
      let margin = dateChart.config.margin;

      // left
      dateChart.svg
        .append("g")
        .call(d3.axisLeft(dateChart.yChart))
        .attr("transform", () => `translate(${margin.left},0)`);

      // bottom
      dateChart.svg
        .append("g")
        .call(d3.axisBottom(dateChart.xChart))
        .attr("transform", () => `translate(0,${height - margin.bottom})`);

    };
  }
}

/**
 * Appends labels on top of the bars of a time chart.
 * @class DateLabelRenderer
 */
class DateLabelRenderer {

  /**
   * Creates a new instance of DateLabelRenderer.
   * @param dateChart The parental time chart.
   */
  constructor(dateChart) {

    /**
     * Appends a label for the given stack.
     * @param stack The stack to create a label for.
     */
    this.renderBarLabels = function (stack) {

      let xChartRef = dateChart.xChart;
      let yChartRef = dateChart.yChart;
      let xStackRef = dateChart.xStack;
      let numberFormat = dateChart.numberFormat;
      let labelColor = dateChart.labelColor;
      let numberOfSeries = stack.length;
      let seriesIndex = 0;
      let bandwidth = xStackRef.bandwidth() / 2;

      dateChart
        .svg
        .append("g")
        .selectAll('g')
        .data(stack)
        .enter()
        .append('g')
        .attr('fill', labelColor)
        .selectAll('.text')
        .data(dataset => dataset)
        .enter()
        .append('text')
        .attr('class', 'lotivis-time-chart-label')
        .attr("transform", function (item) {
          let x = xChartRef(item.data.date) + xStackRef(stack.label) + bandwidth;
          let y = yChartRef(item[1]) - 5;
          return `translate(${x},${y})rotate(-60)`;
        })
        .text(function (item, index) {
          if (index === 0) seriesIndex += 1;
          if (seriesIndex !== numberOfSeries) return;
          let value = item[1];
          return value === 0 ? '' : numberFormat.format(value);
        });
    };
  }
}

/**
 *
 */
class DateLegendRenderer {

  constructor(dateChart) {

    this.renderNormalLegend = function () {
      let config = dateChart.config;
      let controller = dateChart.datasetController;
      let numberFormat = dateChart.numberFormat;
      let datasets = controller.datasets;
      let datasetNames = controller.labels;
      let circleRadius = 6;
      let labelMargin = 50;

      let xLegend = d3.scaleBand()
        .domain(datasetNames)
        .rangeRound([config.margin.left, config.width - config.margin.right]);

      let legends = dateChart.graph
        .selectAll('.legend')
        .data(datasets)
        .enter();

      legends
        .append('text')
        .attr('class', 'lotivis-time-chart-legend-label')
        .attr("font-size", 13)
        .attr("x", (item) => xLegend(item.label) - 30)
        .attr("y", dateChart.graphHeight + labelMargin)
        .style('cursor', 'pointer')
        .style("fill", function (item) {
          return controller.getColorForDataset(item.label);
        })
        .text(function (item) {
          let value = controller.getSumOfDataset(item.label);
          let formatted = numberFormat.format(value);
          return `${item.label} (${formatted})`;
        })
        .on('click', function (event) {
          if (!event || !event.target) return;
          if (!event.target.innerHTML) return;
          let components = event.target.innerHTML.split(' (');
          components.pop();
          let label = components.join(" (");
          dateChart.toggleDataset(label);
        }.bind(this));

      legends
        .append("circle")
        .attr('class', 'lotivis-time-chart-legend-circle')
        .attr("r", circleRadius)
        .attr("cx", (item) => xLegend(item.label) - (circleRadius * 2) - 30)
        .attr("cy", dateChart.graphHeight + labelMargin - circleRadius + 2)
        .style("stroke", (item) => controller.getColorForDataset(item.label))
        .style("fill", function (item) {
          return item.isEnabled ? controller.getColorForDataset(item.label) : 'white';
        }.bind(this));
    };

    this.renderCombinedStacksLegend = function () {
      let stackNames = dateChart.datasetController.stacks;
      let numberFormat = dateChart.numberFormat;
      let circleRadius = 6;
      let labelMargin = 50;

      let xLegend = d3
        .scaleBand()
        .domain(stackNames)
        .rangeRound([dateChart.config.margin.left, dateChart.config.width - dateChart.config.margin.right]);

      let legends = dateChart
        .graph
        .selectAll('.lotivis-time-chart-legend-label')
        .data(stackNames)
        .enter();

      legends
        .append('text')
        .attr('class', 'lotivis-time-chart-legend-label')
        .attr("font-size", 23)
        .attr("x", (item) => xLegend(item) - 30)
        .attr("y", function () {
          return dateChart.graphHeight + labelMargin;
        }.bind(this))
        .style('cursor', 'pointer')
        .style("fill", function (item, index) {
          return Color$1.colorsForStack(index)[0].rgbString();
        }.bind(this))
        .text(function (item) {
          let value = sumOfStack(dateChart.datasetController.flatData, item);
          let formatted = numberFormat.format(value);
          let labels = item.split(',');
          let text;

          if (labels.length > 3) {
            labels = labels.splice(0, 3);
            text = labels.join(', ') + ',...';
          } else {
            text = item;
          }

          return `${text} (${formatted})`;

        }.bind(this));

      legends
        .append("circle")
        .attr("r", circleRadius)
        .attr("cx", item => xLegend(item) - (circleRadius * 2) - 30)
        .attr("cy", dateChart.graphHeight + labelMargin - circleRadius + 2)
        .style('cursor', 'pointer')
        .style("stroke", function (item, index) {
          return Color$1.colorsForStack(index)[0].rgbString();
        }.bind(this))
        .style("fill", function (item, index) {
          return item.isEnabled ? Color$1.colorsForStack(index)[0].rgbString() : 'white';
        }.bind(this))
        .style("stroke-width", 2);

    };
  }
}

/**
 * Appends the bars to a time chart.
 * @class DateBarsRenderer
 */
class DateBarsRenderer {

  /**
   * Creates a new instance of DateBarsRenderer.
   * @param dateChart The parental time chart.
   */
  constructor(dateChart) {

    /**
     * Appends the bar for the given stack.
     * @param stack The stack to append the bar for.
     */
    this.renderBars = function (stack) {

      let config = dateChart.config || {};
      let isCombineStacks = config.combineStacks || false;
      let colors = dateChart.datasetController.getColorsForStack(stack.stack) || Color.defaultTint;
      let barRadius = config.barRadius || LotivisConfig.barRadius;

      dateChart
        .svg
        .append("g")
        .selectAll("g")
        .data(stack)
        .enter()
        .append("g")
        .attr("fill", (stackData, index) => isCombineStacks ? colors[0] : stack.colors[index])
        .selectAll("rect")
        .data((data) => data)
        .enter()
        .append("rect")
        .attr('class', 'lotivis-time-chart-bar')
        .attr("rx", isCombineStacks ? 0 : barRadius)
        .attr("ry", isCombineStacks ? 0 : barRadius)
        .attr("x", (d) => dateChart.xChart(d.data.date) + dateChart.xStack(stack.label))
        .attr("y", (d) => dateChart.yChart(d[1]))
        .attr("width", dateChart.xStack.bandwidth())
        .attr("height", (d) => dateChart.yChart(d[0]) - dateChart.yChart(d[1]));
    };
  }
}

/**
 *
 * @class DateGhostBarsRenderer
 */
class DateGhostBarsRenderer {

  /**
   * Creates a new instance of DateGhostBarsRenderer.
   * @param dateChart
   */
  constructor(dateChart) {

    function createID(date) {
      return `ghost-rect-${toSaveID(String(date))}`;
    }

    this.hideAll = function () {
      dateChart.svg
        .selectAll('.lotivis-selection-rect')
        // .transition()
        .attr("opacity", 0);
    };

    function onMouseEnter(event, date) {
      this.hideAll();
      let controller = dateChart.datasetController;
      let id = createID(date);

      if (dateChart.config.sendsNotifications) {
        dateChart.updateSensible = false;
        controller.setDatesFilter([date]);
        dateChart.updateSensible = true;
      }

      dateChart
        .svg
        .select(`#${id}`)
        // .transition()
        .attr("opacity", 0.3);

      dateChart.tooltipRenderer.showTooltip(event, date);
    }

    function onMouserOut(event, date) {
      this.hideAll();
      dateChart.tooltipRenderer.hideTooltip(event, date);

      if (dateChart.config.sendsNotifications) {
        dateChart.updateSensible = false;
        dateChart.datasetController.resetFilters();
        dateChart.updateSensible = true;
      }
    }

    this.renderGhostBars = function () {
      let margin = dateChart.config.margin;
      let dates = dateChart.config.dateLabels || dateChart.dataview.dates;

      dateChart
        .svg
        .append("g")
        .selectAll("rect")
        .data(dates)
        .enter()
        .append("rect")
        .attr("class", 'lotivis-selection-rect')
        .attr("id", date => createID(date))
        .attr("opacity", 0)
        .attr("rx", LotivisConfig.barRadius)
        .attr("ry", LotivisConfig.barRadius)
        .attr("x", (date) => dateChart.xChart(date))
        .attr("y", margin.top)
        .attr("width", dateChart.xChart.bandwidth())
        .attr("height", dateChart.config.height - margin.bottom - margin.top)
        .on('mouseenter', onMouseEnter.bind(this))
        .on('mouseout', onMouserOut.bind(this));

    };
  }
}

/**
 * Injects and presents a tooltip on a time chart.
 *
 * @class DateTooltipRenderer
 */
class DateTooltipRenderer {

  /**
   * Creates a new instance of DateTooltipRenderer.
   *
   * @constructor
   */
  constructor(dateChart) {

    const tooltip = dateChart
      .element
      .append('div')
      .attr('class', 'lotivis-tooltip')
      .attr('rx', 5) // corner radius
      .attr('ry', 5)
      .style('opacity', 0);

    /**
     * Returns the size [width, height] of the tooltip.
     *
     * @returns {number[]}
     */
    function getTooltipSize() {
      let tooltipWidth = Number(tooltip.style('width').replace('px', ''));
      let tooltipHeight = Number(tooltip.style('height').replace('px', ''));
      return [tooltipWidth, tooltipHeight];
    }

    /**
     * Calculates and returns the top pixel position for the tooltip.
     *
     * @param factor The size factor of the chart.
     * @param offset The offset of the chart.
     * @param tooltipSize The size of the tooltip.
     * @returns {number}
     */
    function getTop(factor, offset, tooltipSize) {
      let top = dateChart.config.margin.top * factor;
      top += (((dateChart.graphHeight * factor) - tooltipSize[1]) / 2);
      top += offset[1] - 10;
      return top;
    }

    /**
     * Calculates the x offset to position the tooltip on the left side
     * of a bar.
     *
     * @param date The presented time of selected bar.
     * @param factor The size factor of the chart.
     * @param offset The offset of the chart.
     * @param tooltipSize The size of the tooltip.
     * @returns {number} The x offset for the tooltip.
     */
    function getXLeft(date, factor, offset, tooltipSize) {
      let x = dateChart.xChart(date) * factor;
      return x + offset[0] - tooltipSize[0] - 22 - LotivisConfig.tooltipOffset;
    }

    /**
     * Calculates the x offset to position the tooltip on the right side
     * of a bar.
     *
     * @param date The presented time of selected bar.
     * @param factor The size factor of the chart.
     * @param offset The offset of the chart.
     * @returns {number} The x offset for the tooltip.
     */
    function getXRight(date, factor, offset) {
      let x = dateChart.xChart(date) + dateChart.xChart.bandwidth();
      x *= factor;
      x += offset[0] + LotivisConfig.tooltipOffset;
      return x;
    }

    /**
     * Returns the HTML content for the given time.
     *
     * @param date The time to get the HTML content for.
     * @returns {string} Return the rendered HTML content.
     */
    function getHTMLForDate(date) {
      let flatData = dateChart.datasetController
        .enabledFlatData()
        .filter(item => item.date === date);

      let first = flatData.first();
      let title;
      if (first && first.from && first.till) {
        title = `${first.from} - ${first.till}`;
      } else {
        title = `${date}`;
      }

      let dataHTML = combineByDate(flatData)
        .filter(item => item.value > 0)
        .map(function (item) {
          let color = dateChart.datasetController.getColorForDataset(item.dataset);
          let divHTML = `<div style="background: ${color};color: ${color}; display: inline;">__</div>`;
          let valueFormatted = dateChart.config.numberFormat.format(item.value);
          return `${divHTML} ${item.dataset}: <b>${valueFormatted}</b>`;
        })
        .join('<br>');

      return `<b>${title}</b><br>${dataHTML}`;
    }

    /**
     * Presents the tooltip next to bar presenting the given time.
     *
     * @param event The mouse event.
     * @param date The time which is presented.
     */
    this.showTooltip = function (event, date) {

      // set examples content before positioning the tooltip cause the size is
      // calculated based on the size
      tooltip.html(getHTMLForDate(date));

      // position tooltip
      let tooltipSize = getTooltipSize();
      let factor = dateChart.getElementEffectiveSize()[0] / dateChart.config.width;
      let offset = dateChart.getElementPosition();
      let top = getTop(factor, offset, tooltipSize);
      let left = dateChart.xChart(date);

      // differ tooltip position on bar position
      if (left > (dateChart.config.width / 2)) {
        left = getXLeft(date, factor, offset, tooltipSize);
      } else {
        left = getXRight(date, factor, offset);
      }

      // update position and opacity of tooltip
      tooltip
        .style('left', `${left}px`)
        .style('top', `${top}px`)
        .style('opacity', 1);
    };

    /**
     * Hides the tooltip.  Does nothing if tooltips opacity is already 0.
     */
    this.hideTooltip = function () {
      if (+tooltip.style('opacity') === 0) return;
      tooltip.style('opacity', 0);
    };
  }
}

/**
 * @class DateGridRenderer
 */
class DateGridRenderer {

  /**
   * Creates a new instance of DateGridRenderer.
   *
   * @param dateChart
   */
  constructor(dateChart) {

    /**
     *
     */
    this.createAxis = function () {

      this.xAxisGrid = d3
        .axisBottom(dateChart.xChart)
        .tickSize(-dateChart.graphHeight)
        .tickFormat('');

      this.yAxisGrid = d3
        .axisLeft(dateChart.yChart)
        .tickSize(-dateChart.graphWidth)
        .tickFormat('')
        .ticks(20);

    };

    /**
     *
     */
    this.renderGrid = function () {
      let config = dateChart.config;
      let color = 'lightgray';
      let width = '0.5';
      let opacity = 0.3;

      dateChart.svg
        .append('g')
        .attr('class', 'x axis-grid')
        .attr('transform', 'translate(0,' + (config.height - config.margin.bottom) + ')')
        .attr('stroke', color)
        .attr('stroke-width', width)
        .attr("opacity", opacity)
        .call(this.xAxisGrid);

      dateChart.svg
        .append('g')
        .attr('class', 'y axis-grid')
        .attr('transform', `translate(${config.margin.left},0)`)
        .attr('stroke', color)
        .attr('stroke-width', width)
        .attr("opacity", opacity)
        .call(this.yAxisGrid);

    };
  }
}

const defaultConfig = {
  width: 1000,
  height: 600,
  margin: {
    top: LotivisConfig.defaultMargin,
    right: LotivisConfig.defaultMargin,
    bottom: LotivisConfig.defaultMargin,
    left: LotivisConfig.defaultMargin
  },
  showLabels: false,
  combineStacks: false,
  sendsNotifications: true,
  labelColor: new Color$1(155, 155, 155),
  numberFormat: Intl.NumberFormat('de-DE', {
    maximumFractionDigits: 3
  }),
  dateAccess: function (date) {
    return Date.parse(date);
  }
};

/**
 *
 * @class DateChart
 * @extends Chart
 */
class DateChart extends Chart {

  /**
   * Initializes this diachronic chart by setting the default values.
   * @override
   */
  initialize() {
    this.initializeDefaultValues();
    this.initializeRenderers();
  }

  initializeDefaultValues() {

    this.config;
    let margin;
    margin = Object.assign({}, defaultConfig.margin);
    margin = Object.assign(margin, this.config.margin);

    let config = Object.assign({}, defaultConfig);
    this.config = Object.assign(config, this.config);
    this.config.margin = margin;

    this.datasets = [];

    this.labelColor = new Color$1(155, 155, 155).rgbString();
    this.type = 'bar';

    this.numberFormat = new Intl.NumberFormat('de-DE', {
      maximumFractionDigits: 3
    });
  }

  initializeRenderers() {
    this.axisRenderer = new DateAxisRenderer(this);
    this.gridRenderer = new DateGridRenderer(this);
    this.labelRenderer = new DateLabelRenderer(this);
    this.legendRenderer = new DateLegendRenderer(this);
    this.barsRenderer = new DateBarsRenderer(this);
    this.ghostBarsRenderer = new DateGhostBarsRenderer(this);
    this.tooltipRenderer = new DateTooltipRenderer(this);
  }

  /**
   * Removes all `svg`s from the parental element.
   * @override
   */
  remove() {
    this.element.selectAll('svg').remove();
  }

  /**
   * @override
   */
  precalculate() {
    let config = this.config;
    let margin = config.margin;
    this.graphWidth = config.width - margin.left - margin.right;
    this.graphHeight = config.height - margin.top - margin.bottom;
    if (!this.datasetController) return;
    let groupSize = this.config.groupSize || 1;

    if (this.config.combineStacks) {
      this.dataview = this.datasetController.getDateDataviewCombinedStacks(groupSize);
    } else {
      this.dataview = this.datasetController.getDateDataview(groupSize);
    }
    this.createScales();
  }

  /**
   * Creates scales which are used to calculate the x and y positions of bars or circles.
   */
  createScales() {
    let config = this.config;
    let margin = config.margin;
    if (!this.dataview) return;

    let dates = config.dateLabels || this.dataview.dates;

    this.xChart = d3
      .scaleBand()
      .domain(dates)
      .rangeRound([margin.left, config.width - margin.right])
      .paddingInner(0.1);

    this.xStack = d3
      .scaleBand()
      .domain(this.dataview.enabledStacks)
      .rangeRound([0, this.xChart.bandwidth()])
      .padding(0.05);

    this.yChart = d3
      .scaleLinear()
      .domain([0, this.dataview.max])
      .nice()
      .rangeRound([config.height - margin.bottom, margin.top]);
  }

  /**
   * Creates and renders the chart.
   * @override
   */
  draw() {
    this.renderSVG();
    if (!this.dataview || !this.dataview.datasetStacks || this.dataview.datasetStacks.length === 0) return;
    this.axisRenderer.render();
    this.gridRenderer.createAxis();
    this.gridRenderer.renderGrid();
    this.ghostBarsRenderer.renderGhostBars();

    if (this.config.combineStacks) {
      this.legendRenderer.renderCombinedStacksLegend();
    } else {
      this.legendRenderer.renderNormalLegend();
    }

    for (let index = 0; index < this.dataview.datasetStacksPresented.length; index++) {
      let stack = this.dataview.datasetStacksPresented[index];
      this.barsRenderer.renderBars(stack, index);
      if (this.config.showLabels === false) continue;
      this.labelRenderer.renderBarLabels(stack, index);
    }
  }

  /**
   *
   */
  renderSVG() {
    this.svg = this.element
      .append('svg')
      .attr('class', 'lotivis-chart-svg lotivis-time-chart')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr("viewBox", `0 0 ${this.config.width} ${this.config.height}`)
      .attr('id', this.svgSelector);

    this.background = this.svg
      .append('rect')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
      .attr('fill', 'white')
      .attr('opacity', 0);

    this.graph = this.svg
      .append('g')
      .attr('width', this.graphWidth)
      .attr('height', this.graphHeight)
      .attr('transform', `translate(${this.config.margin.left},${this.config.margin.top})`);
  }

  /**
   * Toggle the enabled of the dataset with the given label.
   * @param label The label of the dataset.
   */
  toggleDataset(label) {
    this.datasetController.toggleDataset(label, this.config.sendsNotifications === true);
    this.update();
  }
}

/**
 *
 * @class UrlParameters
 */
class UrlParameters {

  /**
   * Returns the singleton instance.
   *
   * @returns {UrlParameters}
   */
  static getInstance() {
    if (!UrlParameters.instance) {
      UrlParameters.instance = new UrlParameters();
    }
    return UrlParameters.instance;
  }

  /**
   * Return the current window URL.
   * @returns {URL}
   */
  getURL() {
    return new URL(window.location.href);
  }

  getBoolean(parameter, defaultValue = false) {
    let value = this.getURL().searchParams.get(parameter);
    return value ? value === 'true' : defaultValue;
  }

  getString(parameter, defaultValue = '') {
    return this.getURL().searchParams.get(parameter) || defaultValue;
  }

  set(parameter, newValue) {
    const url = this.getURL();

    if (newValue === false) {
      url.searchParams.delete(parameter);
    } else {
      url.searchParams.set(parameter, newValue);
    }

    window.history.replaceState(null, null, url);
    this.updateCurrentPageFooter();
  }

  setWithoutDeleting(parameter, newValue) {
    const url = this.getURL();
    url.searchParams.set(parameter, newValue);
    window.history.replaceState(null, null, url);
    this.updateCurrentPageFooter();
  }

  clear() {
    const url = this.getURL();
    const newPath = url.protocol + url.host;
    const newURL = new URL(newPath);
    window.history.replaceState(null, null, newURL);
    this.updateCurrentPageFooter();
  }

  updateCurrentPageFooter() {
    // console.log('window.lotivisApplication: ' + window.lotivisApplication);
    // window.lotivisApplication.currentPage.updateFooter();
    const url = this.getURL();
    d3
      .select('#lotivis-url-container')
      .text(url);
  }
}

UrlParameters.language = 'language';
UrlParameters.page = 'page';
UrlParameters.query = 'query';
UrlParameters.searchViewMode = 'search-view-mode';
UrlParameters.chartType = 'chart-type';
UrlParameters.chartShowLabels = 'chart-show-labels';
UrlParameters.chartCombineStacks = 'combine-stacks';
UrlParameters.contentType = 'content-type';
UrlParameters.valueType = 'value-type';
UrlParameters.searchSensitivity = 'search-sensitivity';
UrlParameters.startYear = 'start-year';
UrlParameters.endYear = 'end-year';

UrlParameters.showTestData = 'show-samples';

/**
 * @class SettingsPopup
 * @extends Popup
 */
class SettingsPopup extends Popup {

  /**
   * Creates a new instance of SettingsPopup.
   */
  constructor(parent) {
    super(parent);
  }

  /**
   * Appends the content of the settings popup.
   * @override
   */
  inject() {
    super.inject();
    this.card.setTitle('Settings');
    this.card.content.classed('lotivis-card-body-settings', true);
    this.row = this.card.content.append('div').classed('lotivis-row', true);
  }

  /**
   * Returns the preferred size of the popup.
   * @returns {{width: number, height: number}}
   * @override
   */
  preferredSize() {
    return {width: 240, height: 600};
  }
}

/**
 *
 * @class DateChartSettingsPopup
 * @extends SettingsPopup
 */
class DateChartSettingsPopup extends SettingsPopup {

  inject() {
    super.inject();
    this.injectShowLabelsCheckbox();
    this.injectCombineStacksCheckbox();
  }

  injectShowLabelsCheckbox() {
    let container = this.row.append('div');
    this.showLabelsCheckbox = new Checkbox(container);
    this.showLabelsCheckbox.setText('Labels');
    this.showLabelsCheckbox.onClick = function (checked) {
      this.chart.config.showLabels = checked;
      this.chart.update();
      UrlParameters.getInstance().set(`showLabels-${this.chart.selector}`, checked);
    }.bind(this);
  }

  injectCombineStacksCheckbox() {
    let container = this.row.append('div');
    this.combineStacksCheckbox = new Checkbox(container);
    this.combineStacksCheckbox.setText('Combine Stacks');
    this.combineStacksCheckbox.onClick = function (checked) {
      this.chart.config.combineStacks = checked;
      this.chart.update();
      UrlParameters.getInstance().set(`combineStacks-${this.chart.selector}`, checked);
    }.bind(this);
  }

  willShow() {
    this.showLabelsCheckbox.setChecked(this.chart.config.showLabels);
    this.combineStacksCheckbox.setChecked(this.chart.config.combineStacks);
  }
}

/**
 * A lotivis card with a chart.
 * @class ChartCard
 * @extends Card
 */
class ChartCard extends Card {

  /**
   * Creates a new instance of ChartCard.
   * @param parent The parental component.
   * @param config The configuration
   */
  constructor(parent, config) {

    if (parent && config && typeof parent === 'string') {
      config.selector = parent;
      super(config);
    } else {
      super(parent);
    }

    this.chart = null;
    this.config = config;
    this.injectButtons();
    this.injectRadioGroup();
    this.injectChart();

    let cardSelector = this.selector;
    this.setTitle((config && config.title) ? config.title : (cardSelector || 'No Title'));
  }

  /**
   * Creates and injects the chart.
   * Should be overridden by subclasses.
   */
  injectChart() {
    return new LotivisUnimplementedMethodError(`injectChart()`);
  }

  /**
   * Creates and injects a screenshot button and a more button.
   */
  injectButtons() {
    this.screenshotButton = new Button(this.headerRightComponent);
    this.screenshotButton.setText('Screenshot');
    this.screenshotButton.element.classed('simple-button', true);
    this.screenshotButton.onClick = this.screenshotButtonAction.bind(this);

    this.moreButton = new Button(this.headerRightComponent);
    this.moreButton.setText('More');
    this.moreButton.element.classed('simple-button', true);
    this.moreButton.onClick = this.presentSettingsPopupAction.bind(this);
  }

  /**
   * Creates and injects a radio button group.
   */
  injectRadioGroup() {
    this.radioGroup = new RadioGroup(this.headerCenterComponent);
    this.radioGroup.onChange = function (value) {
      let dataset = this.datasets.find(function (dataset) {
        if (!dataset.label) return false;
        return dataset.label.split(` `).join(`-`) === value;
      });
      if (!dataset) return lotivis_log(`Can't find dataset with label ${value}`);
      this.setDataset(dataset);
    }.bind(this);
  }

  /**
   * Updates the options of the radio button group dependant on the given datasets.
   */
  updateRadioGroup() {
    if (!this.datasets) return;
    let names = this.datasets.map(dataset => dataset.label || 'Unknown Label');
    let options = names.map(name => new Option(name));
    this.radioGroup.setOptions(options);
  }

  /**
   *
   * @param datasets
   */
  setDatasets(datasets) {
    this.datasets = datasets;
    this.updateRadioGroup();
    let firstDataset = datasets[0];
    this.setDataset(firstDataset);
  }

  /**
   *
   * @param dataset
   */
  setDataset(dataset) {
    lotivis_log('this.chart: ' + this.chart);
    lotivis_log('this.chart: ', dataset);
    if (!this.chart) return;
    if (Array.isArray(dataset)) {
      this.chart.setDatasets(dataset);
    } else {
      this.chart.setDatasets([dataset]);
    }

    if (this.onSelectedDatasetChanged) {
      let datasetLabel = dataset.stack || dataset.label || `Unknown`;
      let index = (this.datasets || []).indexOf(dataset);
      this.onSelectedDatasetChanged(dataset, index, datasetLabel);
    }
  }

  /**
   * Triggered when the screenshot button is pushed.
   *
   * Should be overridden by subclasses.
   */
  screenshotButtonAction() {
    return new LotivisUnimplementedMethodError(`screenshotButtonAction()`);
  }

  /**
   * Triggered when the more button is pushed.
   *
   * Should be overridden by subclasses.
   */
  presentSettingsPopupAction() {
    return new LotivisUnimplementedMethodError(`presentSettingsPopupAction()`);
  }

  /**
   * Triggered for a change of the radio group.
   *
   * Should be overridden by subclasses.
   */
  onSelectedDatasetChanged() {
    return new LotivisUnimplementedMethodError(`onSelectedDatasetChanged()`);
  }
}

/**
 * A lotivis time chart card.
 * @class DateChartCard
 * @extends Card
 */
class DateChartCard extends ChartCard {

  /**
   * Creates a new instance of DateChartCard.
   * @param {Component| string} selector The parental component or the selector.
   * @param config
   */
  constructor(selector, config = {}) {
    let theSelector = selector || config.selector || 'date-chart-card';
    super(theSelector, config);
    this.selector = theSelector;
    this.datasets = [];
    this.injectRadioGroup();
  }

  /**
   * Appends the `DateChart` to this card.
   * @override
   */
  injectChart() {
    this.chartID = this.selector + '-chart';
    this.body.attr('id', this.chartID);
    this.chart = new DateChart(this.chartID, this.config);
    this.applyURLParameters();
  }

  /**
   * Appends a radio group to the header of the card.
   */
  injectRadioGroup() {
    this.radioGroup = new RadioGroup(this.headerCenterComponent);
    this.radioGroup.onChange = function (value) {
      let dataset = this.datasets.find(dataset => dataset.label === value);
      this.setDataset(dataset);
    }.bind(this);
  }

  /**
   * Updates the radio group dependant on the datasets of this card.
   */
  updateRadioGroup() {
    if (!this.datasets) return;
    let names = this.datasets.map(dataset => dataset.label);
    let options = names.map(name => new Option(name));
    this.radioGroup.setOptions(options);
  }

  /**
   *
   */
  applyURLParameters() {
    let parameters = UrlParameters.getInstance();
    this.chart.config.showLabels = parameters
      .getBoolean(`showLabels-${this.chartID}`, this.chart.config.showLabels);
    this.chart.config.combineStacks = parameters
      .getBoolean(`combineStacks-${this.chartID}`, this.chart.config.combineStacks);
  }

  /**
   * Tells this chart card to present the setting popup card.
   * @override
   */
  presentSettingsPopupAction() {
    let button = document.getElementById(this.moreButton.selector);
    let settingsPopup = new DateChartSettingsPopup();
    settingsPopup.chart = this.chart;
    settingsPopup.showUnder(button, 'right');
  }

  /**
   * Creates and downloads a screenshot from the chart.
   * @override
   */
  screenshotButtonAction() {
    let filename = this.chart.datasetController.getFilename() || 'time-chart';
    let downloadFilename = createDownloadFilename(filename, `date-chart`);
    downloadImage(this.chart.svgSelector, downloadFilename);
  }
}

/**
 *
 * @param geoJSON
 * @param removeCandidates
 * @returns {*}
 */
function removeFeatures(geoJSON, removeCandidates) {
  if (!Array.isArray(removeCandidates)) return geoJSON;
  let newGeoJSON = geoJSON;
  for (let index = 0; index < removeCandidates.length; index++) {
    let code = removeCandidates[index];
    let candidate = newGeoJSON.features.find(feature => feature.properties.code === code);
    if (!candidate) continue;
    let candidateIndex = newGeoJSON.features.indexOf(candidate);
    if (candidateIndex < 0) continue;
    newGeoJSON.features.splice(candidateIndex, 1);
  }
  return newGeoJSON;
}

/**
 * Returns the style of the given CSS class or an empty object.
 *
 * @param className The CSS class name.
 * @returns {{}} The CSS style.
 */
function styleForCSSClass(className) {
  let selector = className;
  if (!selector.startsWith('.')) selector = '.' + selector;
  let element = document.querySelector(selector);
  if (!element) return {};
  let style = getComputedStyle(element);
  return style ? style : {};
}

/**
 * The default number format.
 *
 * @type {Intl.NumberFormat}
 */
const numberFormat = new Intl.NumberFormat('de-DE', {
  maximumFractionDigits: 3
});

/**
 * Returns the formatted version from the given number.
 *
 * @param number The number to format.
 * @returns {string} The formatted version of the number.
 */
function formatNumber(number) {
  if (typeof number !== 'number') return number;
  return numberFormat.format(number);
}

/**
 *
 * @class MapTooltipRenderer
 */
class MapTooltipRenderer {

  /**
   * Creates a new instance of MapTooltipRenderer.
   * @param mapChart The parental map chart.
   */
  constructor(mapChart) {
    this.mapChart = mapChart;

    let tooltip = mapChart
      .element
      .append('div')
      .attr('class', 'lotivis-tooltip')
      .attr('rx', 5) // corner radius
      .attr('ry', 5)
      .style('opacity', 0);

    function featureMapID(feature) {
      return `lotivis-map-area-${mapChart.config.featureIDAccessor(feature)}`;
    }

    function htmlTitle(feature) {
      let featureID = mapChart.config.featureIDAccessor(feature);
      let featureName = mapChart.config.featureNameAccessor(feature);
      return `ID: ${featureID}<br>Name: ${featureName}`;
    }

    function htmlValues(feature) {
      let components = [];
      let featureID = mapChart.config.featureIDAccessor(feature);
      if (mapChart.datasetController) {
        let flatData = mapChart.datasetController.flatData;
        let combined = combineByLocation(flatData);
        let data = combined.filter(item => equals(item.location, featureID));
        components.push('');
        for (let index = 0; index < data.length; index++) {
          let item = data[index];
          let label = (item.label || item.dataset || item.stack);
          components.push(label + ': ' + formatNumber(item.value));
        }
      }
      return components.join('<br>');
    }

    /**
     * Returns the size of the tooltip.
     * @returns {number[]}
     */
    function getTooltipSize() {
      let tooltipWidth = Number(tooltip.style('width').replace('px', '') || 200);
      let tooltipHeight = Number(tooltip.style('height').replace('px', ''));
      return [tooltipWidth + 20, tooltipHeight + 20];
    }

    /**
     * Called by map geojson renderer when mouse enters an area drawn on the map.
     * @param event The mouse event.
     * @param feature The drawn feature (area).
     */
    this.mouseEnter = function (event, feature) {

      tooltip.html([htmlTitle(feature), htmlValues(feature)].join('<br>'));

      // position tooltip
      let tooltipSize = getTooltipSize();
      let projection = mapChart.projection;
      let featureBounds = d3.geoBounds(feature);
      let featureLowerLeft = projection(featureBounds[0]);
      let featureUpperRight = projection(featureBounds[1]);
      let featureBoundsWidth = featureUpperRight[0] - featureLowerLeft[0];

      // svg is presented in dynamic sized view box so we need to get the actual size
      // of the element in order to calculate a scale for the position of the tooltip.
      let effectiveSize = mapChart.getElementEffectiveSize();
      let factor = effectiveSize[0] / mapChart.config.width;
      let positionOffset = mapChart.getElementPosition();

      /**
       * Calculates and returns the left position for the tooltip.
       * @returns {*} The left position in pixels.
       */
      function getTooltipLeft() {
        let left = featureLowerLeft[0];
        left += (featureBoundsWidth / 2);
        left *= factor;
        left -= (tooltipSize[0] / 2);
        left += positionOffset[0];
        return left;
      }

      /**
       * Calculates and returns the top tooltip position when displaying above a feature.
       * @returns {*} The top position in pixels.
       */
      function getTooltipLocationAbove() {
        let top = featureUpperRight[1] * factor;
        top -= tooltipSize[1];
        top += positionOffset[1];
        top -= LotivisConfig.tooltipOffset;
        return top;
      }

      /**
       * Calculates and returns the top tooltip position when displaying under a feature.
       * @returns {*} The top position in pixels.
       */
      function getTooltipLocationUnder() {
        let top = featureLowerLeft[1] * factor;
        top += positionOffset[1];
        top += LotivisConfig.tooltipOffset;
        return top;
      }

      let top = 0;
      if (featureLowerLeft[1] > (mapChart.config.height / 2)) {
        top = getTooltipLocationAbove();
      } else {
        top = getTooltipLocationUnder();
      }

      let left = getTooltipLeft();
      tooltip
        .style('opacity', 1)
        .style('left', left + 'px')
        .style('top', top + 'px');

      mapChart.onSelectFeature(event, feature);
    };

    /**
     * Called by map geojson renderer when mouse leaves an area drawn on the map.
     * @param event The mouse event.
     * @param feature The drawn feature (area).
     */
    this.mouseOut = function (event, feature) {
      let style = styleForCSSClass('.lotivis-map-area');
      let mapID = featureMapID(feature);
      mapChart.svg.select(`#${mapID}`)
        .style('stroke', style.stroke || 'black')
        .style('stroke-width', style['stroke-width'] || '0.7')
        .style('stroke-dasharray', (feature) => feature.departmentsData ? '0' : '1,4');
      tooltip.style('opacity', 0);
    };

    /**
     * Raises the tooltip and the rectangle which draws the bounds.
     */
    this.raise = function () {
      tooltip.raise();
    };
  }
}

/**
 *
 * @class MapLegendRenderer
 */
class MapLegendRenderer {

  /**
   * Creates a new instance of MapLegendRenderer.
   *
   * @param mapChart The parental map chart.
   */
  constructor(mapChart) {
    let legend;

    function appendLegend() {
      legend = mapChart.svg
        .append('svg')
        .attr('class', 'lotivis-map-legend')
        .attr('width', mapChart.width)
        .attr('height', 200)
        .attr('x', 0)
        .attr('y', 0);
    }

    function removeDatasetLegend() {
      legend.selectAll('rect').remove();
      legend.selectAll('text').remove();
    }

    this.render = function () {
      if (!mapChart.dataview) return;

      let stackNames = mapChart.dataview.stacks;
      let combinedData = mapChart.dataview.combinedData;

      appendLegend();
      legend.raise();
      removeDatasetLegend();

      for (let index = 0; index < stackNames.length; index++) {

        let stackName = stackNames[index];
        let dataForStack = combinedData.filter(data => data.stack === stackName);
        let max = d3.max(dataForStack, item => item.value) || 0;
        let offset = index * 80;
        let color = Color$1.colorsForStack(index, 1)[0];

        let steps = 4;
        let data = [0, 1 / 4 * max, 1 / 2 * max, 3 / 4 * max, max];
        let generator = Color$1.colorGenerator(max);

        legend
          .append('text')
          .attr('class', 'lotivis-map-legend-title')
          .attr('x', offset + 10)
          .attr('y', '20')
          .style('fill', color.rgbString())
          .text(stackName);

        legend
          .append("g")
          .selectAll("text")
          .data(['Keine Daten'])
          .enter()
          .append("text")
          .attr('class', 'lotivis-map-legend-text')
          .attr('x', offset + 35)
          .attr('y', 44)
          .text(d => d);

        legend
          .append('g')
          .selectAll("rect")
          .data([0])
          .enter()
          .append("rect")
          .attr('class', 'lotivis-map-legend-rect')
          .style('fill', 'white')
          .attr('x', offset + 10)
          .attr('y', 30)
          .attr('width', 18)
          .attr('height', 18)
          .style('stroke-dasharray', '1,3')
          .style('stroke', 'black')
          .style('stroke-width', 1);

        legend
          .append("g")
          .selectAll("text")
          .data([0])
          .enter()
          .append("text")
          .attr('class', 'lotivis-map-legend-text')
          .attr('x', offset + 35)
          .attr('y', 64)
          .text(d => d);

        legend
          .append('g')
          .selectAll("rect")
          .data([0])
          .enter()
          .append("rect")
          .attr('class', 'lotivis-map-legend-rect')
          .style('fill', 'WhiteSmoke')
          .attr('x', offset + 10)
          .attr('y', 50)
          .attr('width', 18)
          .attr('height', 18)
          .style('stroke', 'black')
          .style('stroke-width', 1);

        legend
          .append("g")
          .selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr('class', 'lotivis-map-legend-rect')
          .style('fill', generator)
          .attr('x', offset + 10)
          .attr('y', (d, i) => (i * 20) + 70)
          .attr('width', 18)
          .attr('height', 18)
          .style('stroke', 'black')
          .style('stroke-width', 1);

        legend
          .append("g")
          .selectAll("text")
          .data(data)
          .enter()
          .append("text")
          .attr('class', 'lotivis-map-legend-text')
          .attr('x', offset + 35)
          .attr('y', (d, i) => (i * 20) + 84)
          .text(function (d, i) {
            if (d === 0) {
              return '> 0'
            } else {
              return formatNumber(((i / steps) * max));
            }
          });

        return;
      }
    };
  }
}

/**
 *
 * @class MapLabelRenderer
 */
class MapLabelRenderer {

  /**
   * Creates a new instance of MapLabelRenderer.
   * @param mapChart The parental map chart.
   */
  constructor(mapChart) {

    /**
     * Removes any old labels from the map.
     */
    function removeLabels() {
      mapChart.svg.selectAll('.lotivis-map-label').remove();
    }

    /**
     * Appends labels from datasets.
     */
    this.render = function () {
      removeLabels();

      let geoJSON = mapChart.geoJSON;
      if (!mapChart.geoJSON) return lotivis_log('[lotivis]  No GeoJSON to render.');
      let dataview = mapChart.dataview;
      if (!dataview) return lotivis_log('[lotivis]  No dataview in map.');
      if (!mapChart.config.showLabels) return lotivis_log('[lotivis]  Skip rendering labels due to configuration.');

      mapChart.svg
        .selectAll('text')
        .data(geoJSON.features)
        .enter()
        .append('text')
        .attr('class', 'lotivis-map-label')
        .text(function (feature) {
          let featureID = mapChart.config.featureIDAccessor(feature);
          let dataset = dataview.combinedData.find(dataset => equals(dataset.location, featureID));
          return dataset ? formatNumber(dataset.value) : '';
        })
        .attr('x', function (feature) {
          return mapChart.projection(feature.center)[0];
        }.bind(this))
        .attr('y', function (feature) {
          return mapChart.projection(feature.center)[1];
        }.bind(this));

    };
  }
}

/**
 *
 * @class MapDatasetRenderer
 */
class MapDatasetRenderer {

  /**
   * Creates a new instance of MapDatasetRenderer.
   * @param mapChart The parental map chart.
   */
  constructor(mapChart) {

    let generator = Color$1.colorGenerator(1);

    function featureMapID(feature) {
      return `lotivis-map-area-${mapChart.config.featureIDAccessor(feature)}`;
    }

    /**
     * Called by map GeoJSON renderer when mouse enters an area drawn on the map.
     * @param event The mouse event.
     * @param feature The drawn feature (area).
     */
    this.mouseEnter = function (event, feature) {
      let color = Color$1.defaultTint.rgbString();
      let mapID = featureMapID(feature);
      mapChart
        .svg
        .selectAll(`#${mapID}`)
        .raise() // bring element to top
        .style('stroke', () => color)
        .style('stroke-width', '2')
        .style('stroke-dasharray', '0');

      mapChart
        .svg
        .selectAll('.lotivis-map-label')
        .raise();
    };

    /**
     * Tells this renderer that the mouse moved out of an area.
     */
    this.mouseOut = function () {
    };

    /**
     * Iterates the datasets per stack and draws them on svg.
     */
    this.render = function () {
      if (!mapChart.geoJSON) return lotivis_log('[lotivis]  No GeoJSON to render.');
      if (!mapChart.dataview) return lotivis_log('[lotivis]  No dataview property.');

      let stackNames = mapChart.dataview.stacks;
      let combinedData = mapChart.dataview.combinedData;

      for (let index = 0; index < stackNames.length; index++) {

        let stackName = stackNames[index];
        let dataForStack = combinedData.filter(data => data.stack === stackName);
        let max = d3.max(dataForStack, item => item.value);

        for (let index = 0; index < dataForStack.length; index++) {

          let datasetEntry = dataForStack[index];
          let locationID = datasetEntry.location;
          let opacity = Number(datasetEntry.value / max);

          mapChart.svg
            .selectAll('.lotivis-map-area')
            .filter((item) => equals(mapChart.config.featureIDAccessor(item), locationID))
            .style('fill', function () {
              if (opacity === 0) {
                return 'WhiteSmoke';
              } else {
                return generator(opacity);
              }
            });

        }

        return;
      }
    };
  }
}

/**
 * @class MapGeoJSONRenderer
 */
class MapGeoJSONRenderer {

  /**
   * Creates a new instance of MapGeoJSONRenderer.
   * @param mapChart The parental map chart.
   */
  constructor(mapChart) {

    /**
     * To be called when the mouse enters an area drawn on the map.
     * @param event The mouse event.
     * @param feature The drawn feature (area).
     */
    function mouseEnter(event, feature) {
      mapChart.datasetRenderer.mouseEnter(event, feature);
      mapChart.tooltipRenderer.mouseEnter(event, feature);
      mapChart.selectionBoundsRenderer.mouseEnter(event, feature);
    }

    /**
     * To be called when the mouse leaves an area drawn on the map.
     * @param event The mouse event.
     * @param feature The drawn feature (area).
     */
    function mouseOut(event, feature) {
      mapChart.datasetRenderer.mouseOut(event, feature);
      mapChart.tooltipRenderer.mouseOut(event, feature);
      mapChart.selectionBoundsRenderer.mouseOut(event, feature);
    }

    /**
     * Renders the `presentedGeoJSON` property.
     */
    this.render = function () {
      let geoJSON = mapChart.presentedGeoJSON;
      if (!geoJSON) return lotivis_log('[lotivis]  No GeoJSON to render.');
      let idAccessor = mapChart.config.featureIDAccessor;

      // lotivis_log('geoJSON', geoJSON);

      mapChart.areas = mapChart.svg
        .selectAll('path')
        .data(geoJSON.features)
        .enter()
        .append('path')
        .attr('d', mapChart.path)
        .attr('id', feature => `lotivis-map-area-${idAccessor(feature)}`)
        .classed('lotivis-map-area', true)
        .style('stroke-dasharray', (feature) => feature.departmentsData ? '0' : '1,4')
        .style('fill', 'white')
        .style('fill-opacity', 1)
        .on('click', mapChart.onSelectFeature.bind(mapChart))
        .on('mouseenter', mouseEnter)
        .on('mouseout', mouseOut);
    };
  }
}

/**
 * Returns a new created instance of Feature combining the given Features.
 * @param geoJSON
 */
function joinFeatures(geoJSON) {
  let topology = topojson.topology(geoJSON.features);
  let objects = extractObjects(topology);

  return {
    "type": "FeatureCollection",
    "features": [
      {
        type: "Feature",
        geometry: topojson.merge(topology, objects),
        properties: {
          code: 1,
          nom: "asdf"
        }
      }
    ]
  };
}

/**
 *
 * @param topology
 * @returns {[]}
 */
function extractObjects(topology) {
  let objects = [];
  for (const topologyKey in topology.objects) {
    if (topology.objects.hasOwnProperty(topologyKey)) {
      objects.push(topology.objects[topologyKey]);
    }
  }
  return objects;
}

/**
 *
 * @class MapExteriorBorderRenderer
 */
class MapExteriorBorderRenderer {

  /**
   * Creates a new instance of MapExteriorBorderRenderer.
   * @property mapChart The parental map chart.
   */
  constructor(mapChart) {

    if (!self.topojson) lotivis_log_once('Can\'t find topojson lib.  Skip rendering of exterior border.');

    /**
     * Renders the exterior border of the presented geo json.
     */
    this.render = function () {
      if (!self.topojson) {
        lotivis_log('[lotivis]  Can\'t find topojson library.');
        return;
      }
      let geoJSON = mapChart.presentedGeoJSON;
      if (!geoJSON) {
        lotivis_log('[lotivis]  No GeoJSON to render.');
        return;
      }
      let borders = joinFeatures(geoJSON);
      if (!borders) {
        return lotivis_log('[lotivis]  No borders to render.');
      }

      mapChart.svg
        .selectAll('path')
        .append('path')
        .datum(borders)
        .attr('d', mapChart.path)
        .attr('class', 'lotivis-map-exterior-borders');
    };
  }
}

/**
 *
 * @param datasets
 * @returns {{features: [], type: string}}
 */
function createGeoJSON(datasets) {
  let locations = extractLocationsFromDatasets(datasets);
  let rowsCount = Math.ceil(locations.length / 5);
  let latSpan = 0.1;
  let lngSpan = 0.1;
  let features = [];

  loop1: for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
    for (let itemIndex = 0; itemIndex < 5; itemIndex++) {

      if (locations.length === 0) break loop1;

      let location = locations.shift();
      let lat = (itemIndex + 1) * latSpan;
      let lng = (rowIndex + 1) * -lngSpan;

      // start down left, counterclockwise
      let coordinates = [];
      coordinates.push([lat + latSpan, lng + lngSpan]);
      coordinates.push([lat + latSpan, lng]);
      coordinates.push([lat, lng]);
      coordinates.push([lat, lng + lngSpan]);
      coordinates.push([lat + latSpan, lng + lngSpan]);

      let feature = {
        type: 'Feature',
        id: location,
        properties: {
          id: location,
          code: location,
          location: location,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            coordinates
          ]
        }
      };

      features.push(feature);
    }
  }

  let geoJSON = {
    type: "FeatureCollection",
    features: features
  };

  return geoJSON;
}

/**
 *
 * @class MapMinimapRenderer
 */
class MapMinimapRenderer {

  /**
   * Creates a new instance of MapMinimapRenderer.
   *
   * @param mapChart The parental map chart.
   */
  constructor(mapChart) {

    this.render = function () {
      mapChart.minimapFeatureCodes;
      // log_debug('miniMapFeatures', miniMapFeatures);
    };
  }
}

/**
 *
 * @class MapSelectionBoundsRenderer
 */
class MapSelectionBoundsRenderer {

  /**
   * Creates a new instance of MapSelectionBoundsRenderer.
   * @param mapChart The parental map chart.
   */
  constructor(mapChart) {

    this.render = function () {
      this.bounds = mapChart.svg
        .append('rect')
        .attr('class', 'lotivis-map-selection-rect')
        .style('fill-opacity', 0);
    };

    /**
     * Tells this renderer that the mouse moved in an area.
     * @param event The mouse event.
     * @param feature The feature (area) that the mouse is now pointing on.
     */
    this.mouseEnter = function (event, feature) {
      if (!mapChart.config.drawRectangleAroundSelection) return;
      let projection = mapChart.projection;
      let featureBounds = d3.geoBounds(feature);
      let featureLowerLeft = projection(featureBounds[0]);
      let featureUpperRight = projection(featureBounds[1]);
      let featureBoundsWidth = featureUpperRight[0] - featureLowerLeft[0];
      let featureBoundsHeight = featureLowerLeft[1] - featureUpperRight[1];
      this.bounds
        .style('width', featureBoundsWidth + 'px')
        .style('height', featureBoundsHeight + 'px')
        .style('x', featureLowerLeft[0])
        .style('y', featureUpperRight[1])
        .style('opacity', 1);
    };

    /**
     * Tells this renderer that the mouse moved out of an area.
     */
    this.mouseOut = function () {
      this.bounds.style('opacity', 0);
    };

    /**
     * Raises the rectangle which draws the bounds.
     */
    this.raise = function () {
      this.bounds.raise();
    };
  }
}

/**
 *
 * @type {{}}
 */
const MapChartConfig = {
  width: 1000,
  height: 1000,
  margin: {
    top: LotivisConfig.defaultMargin,
    right: LotivisConfig.defaultMargin,
    bottom: LotivisConfig.defaultMargin,
    left: LotivisConfig.defaultMargin
  },
  isShowLabels: true,
  geoJSON: null,
  departmentsData: [],
  excludedFeatureCodes: [],
  drawRectangleAroundSelection: false,
  sendsNotifications: true,
  featureIDAccessor: function (feature) {
    if (feature.id || feature.id === 0) return feature.id;
    if (feature.properties && isValue(feature.properties.id)) return feature.properties.id;
    if (feature.properties && isValue(feature.properties.code)) return feature.properties.code;
    return hashCode(feature.properties);
  },
  featureNameAccessor: function (feature) {
    if (isValue(feature.name)) return feature.name;
    if (feature.properties && isValue(feature.properties.name)) return feature.properties.name;
    if (feature.properties && isValue(feature.properties.nom)) return feature.properties.nom;
    return LotivisConfig.unknown;
  }
};

/**
 *
 * @class MapBackgroundRenderer
 */
class MapBackgroundRenderer {

  /**
   * Creates a new instance of MapBackgroundRenderer.
   * @param mapChart The parental map chart.
   */
  constructor(mapChart) {

    function mouseEnter() {
      let controller = mapChart.datasetController;
      if (!controller) return;
      let filters = controller.locationFilters;
      if (!filters || filters.length === 0) return;
      mapChart.updateSensible = false;
      // controller.setLocationsFilter([]);
      controller.resetFilters();
      mapChart.updateSensible = true;
    }

    /**
     * Appends a background rectangle.
     */
    this.render = function () {
      // create a background rectangle for receiving mouse enter events
      // in order to reset the location samples filter.
      mapChart.svg
        .append('rect')
        .attr('width', mapChart.config.width)
        .attr('height', mapChart.config.height)
        .attr('fill', 'white')
        .on('mouseenter', mouseEnter);
    };
  }
}

/**
 * @class Geometry
 */
class Geometry {

  /**
   * Creates a new instance of Geometry.
   * @param source
   */
  constructor(source) {
    this.type = source.type;
    this.coordinates = source.coordinates;
  }
}

/**
 *
 * @class Feature
 */
class Feature {

  constructor(source) {
    this.type = source.type;
    this.properties = source.properties;
    this.geometry = new Geometry(source.geometry);
  }
}

/**
 *
 * @class GeoJson
 */
class GeoJson {

  constructor(source) {
    this.type = source.type;
    this.features = [];

    if (source.features) {
      for (let index = 0; index < source.features.length; index++) {
        let featureSource = source.features[index];
        let feature = new Feature(featureSource);
        this.features.push(feature);
      }
    } else {
      this.properties = source.properties;
      this.geometry = new Geometry(source.geometry);
    }
  }

  getCenter() {
    let allCoordinates = this.extractAllCoordinates();
    console.log('allCoordinates.length: ' + allCoordinates.length);
    let latitudeSum = 0;
    let longitudeSum = 0;

    allCoordinates.forEach(function (coordinates) {
      latitudeSum += coordinates[1];
      longitudeSum += coordinates[0];
    });

    return [
      latitudeSum / allCoordinates.length,
      longitudeSum / allCoordinates.length
    ];
  }

  extractGeometryCollection() {
    let geometryCollection = [];
    if (this.type === 'Feature') {
      geometryCollection.push(this.geometry);
    } else if (this.type === 'FeatureCollection') {
      this.features.forEach(feature => geometryCollection.push(feature.geometry));
    } else if (this.type === 'GeometryCollection') {
      this.geometries.forEach(geometry => geometryCollection.push(geometry));
    } else {
      throw new Error('The geoJSON is not valid.');
    }
    return geometryCollection;
  }

  extractAllCoordinates() {
    let geometryCollection = this.extractGeometryCollection();
    let coordinatesCollection = [];

    geometryCollection.forEach(item => {

      let coordinates = item.coordinates;
      let type = item.type;

      if (type === 'Point') {
        console.log("Point: " + coordinates.length);
        coordinatesCollection.push(coordinates);
      } else if (type === 'MultiPoint') {
        console.log("MultiPoint: " + coordinates.length);
        coordinates.forEach(coordinate => coordinatesCollection.push(coordinate));
      } else if (type === 'LineString') {
        console.log("LineString: " + coordinates.length);
        coordinates.forEach(coordinate => coordinatesCollection.push(coordinate));
      } else if (type === 'Polygon') {
        coordinates.forEach(function (polygonCoordinates) {
          polygonCoordinates.forEach(function (coordinate) {
            coordinatesCollection.push(coordinate);
          });
        });
      } else if (type === 'MultiLineString') {
        coordinates.forEach(function (featureCoordinates) {
          featureCoordinates.forEach(function (polygonCoordinates) {
            polygonCoordinates.forEach(function (coordinate) {
              coordinatesCollection.push(coordinate);
            });
          });
        });
      } else if (type === 'MultiPolygon') {
        coordinates.forEach(function (featureCoordinates) {
          featureCoordinates.forEach(function (polygonCoordinates) {
            polygonCoordinates.forEach(function (coordinate) {
              coordinatesCollection.push(coordinate);
            });
          });
        });
      } else {
        throw new Error('The geoJSON is not valid.');
      }
    });

    return coordinatesCollection;
  }
}

/**
 * A component which renders a GeoJSON with d3.
 * @class MapChart
 * @extends Chart
 */
class MapChart extends Chart {

  /**
   * Creates a new instance of MapChart.
   * @param parent The parental component.
   * @param config The configuration of the map chart.
   */
  constructor(parent, config) {
    super(parent, config);
    // empty. constructor defined for documentation.
  }

  /**
   * Initialize with default values.
   */
  initialize() {
    let theConfig = this.config;
    let margin;
    margin = Object.assign({}, MapChartConfig.margin);
    margin = Object.assign(margin, theConfig.margin || {});

    let config = Object.assign({}, MapChartConfig);
    this.config = Object.assign(config, this.config);
    this.config.margin = margin;

    this.projection = d3.geoMercator();
    this.path = d3.geoPath().projection(this.projection);
    this.initializeRenderers();
  }

  initializeRenderers() {
    this.backgroundRenderer = new MapBackgroundRenderer(this);
    this.geoJSONRenderer = new MapGeoJSONRenderer(this);
    this.datasetRenderer = new MapDatasetRenderer(this);
    this.exteriorBorderRenderer = new MapExteriorBorderRenderer(this);
    this.minimapRenderer = new MapMinimapRenderer(this);
    this.labelRenderer = new MapLabelRenderer(this);
    this.legendRenderer = new MapLegendRenderer(this);
    this.selectionBoundsRenderer = new MapSelectionBoundsRenderer(this);
    this.tooltipRenderer = new MapTooltipRenderer(this);
  }

  remove() {
    if (!this.svg) return;
    this.svg.remove();
  }

  precalculate() {
    this.renderSVG();
    if (!this.datasetController) return;
    this.dataview = this.datasetController.getLocationDataview();
    if (this.geoJSON) return;
    let geoJSON = createGeoJSON(this.datasetController.datasets);
    this.setGeoJSON(geoJSON);
  }

  draw() {
    this.backgroundRenderer.render();
    this.exteriorBorderRenderer.render();
    this.geoJSONRenderer.render();
    this.legendRenderer.render();
    this.datasetRenderer.render();
    this.labelRenderer.render();
    this.minimapRenderer.render();
    this.tooltipRenderer.raise();
    this.selectionBoundsRenderer.render();
    this.selectionBoundsRenderer.raise();
  }

  /**
   *
   */
  renderSVG() {
    this.svg = this.element
      .append('svg')
      .attr('id', this.svgSelector)
      .attr('viewBox', `0 0 ${this.config.width} ${this.config.height}`);
  }

  /**
   * Sets the size of the projection to fit the given geo json.
   * @param geoJSON
   */
  zoomTo(geoJSON) {
    this.projection.fitSize([this.config.width, this.config.height], geoJSON);
  }

  /**
   * Tells this map chart that the given feature was selected with the mouse.
   * @param event The mouse event.
   * @param feature The feature.
   */
  onSelectFeature(event, feature) {
    if (!feature || !feature.properties) return;
    if (!this.datasetController) return;
    let locationID = this.config.featureIDAccessor(feature);
    this.updateSensible = false;
    this.datasetController.setLocationsFilter([locationID]);
    this.updateSensible = true;
  }

  /**
   * Sets the presented geo json.
   * @param newGeoJSON
   */
  setGeoJSON(newGeoJSON) {
    if (typeof newGeoJSON === 'object' && newGeoJSON.prototype === 'GeoJSON') {
      this.geoJSON = newGeoJSON;
    } else {
      this.geoJSON = new GeoJson(newGeoJSON);
    }
    this.presentedGeoJSON = this.geoJSON;
    this.geoJSONDidChange();
  }

  /**
   * Tells the receiving map chart that its `geoJSON` property did change.
   */
  geoJSONDidChange() {
    if (!this.geoJSON) return;
    // precalculate the center of each feature
    this.geoJSON.features.forEach((feature) => feature.center = d3.geoCentroid(feature));
    this.presentedGeoJSON = removeFeatures(this.geoJSON, this.config.excludedFeatureCodes);
    this.zoomTo(this.geoJSON);

    // this.backgroundRenderer.render();
    // this.exteriorBorderRenderer.render();
    // this.geoJSONRenderer.render();
  }
}

/**
 * A popup presenting a settings panel for a map chart.
 *
 * @class MapChartSettingsPopup
 * @extends SettingsPopup
 */
class MapChartSettingsPopup extends SettingsPopup {

  /**
   * Injects the elements of the settings panel.
   * @override
   */
  inject() {
    super.inject();
    let container = this.row.append('div').classed('col-12', true);
    this.showLabelsCheckbox = new Checkbox(container);
    this.showLabelsCheckbox.setText('Labels');
    this.showLabelsCheckbox.onClick = function (checked) {
      this.mapChart.config.showLabels = checked;
      this.mapChart.update();
      UrlParameters.getInstance().setWithoutDeleting('map-show-labels', checked);
    }.bind(this);
  }

  /**
   * Tells the popup that it is about to be presented.
   * @override
   */
  willShow() {
    this.showLabelsCheckbox.setChecked(this.mapChart.config.showLabels);
  }
}

/**
 * A lotivis card containing a location chart.
 * @class MapChartCard
 * @extends ChartCard
 */
class MapChartCard extends ChartCard {

  /**
   * Creates a new instance of MapChartCard.
   * @param {Component|String} parent The parental component.
   * @param config The config of the map chart.
   */
  constructor(parent, config) {
    super(parent || 'map-chart-card', config);
  }

  /**
   * Creates and injects the map chart.
   */
  injectChart() {
    this.chartID = this.selector + '-chart';
    this.body.attr('id', this.chartID);
    this.chart = new MapChart(this.chartID, this.config);
  }

  /**
   * Creates and downloads a screenshot from the chart.
   * @override
   */
  screenshotButtonAction() {
    let filename = 'Unknown';
    if (this.chart && this.chart.datasetController) {
      filename = this.chart.datasetController.getFilename();
    }
    let downloadFilename = createDownloadFilename(filename, `map-chart`);
    downloadImage(this.chart.svgSelector, downloadFilename);
  }

  /**
   * Triggered when the more button is pushed.
   */
  presentSettingsPopupAction() {
    let bodyElement = d3.select('body');
    let button = document.getElementById(this.moreButton.selector);
    let settingsPopup = new MapChartSettingsPopup(bodyElement);
    settingsPopup.mapChart = this.chart;
    settingsPopup.showUnder(button, 'right');
  }
}

/**
 * Draws the axis on the plot chart.
 * @class PlotAxisRenderer
 */
class PlotAxisRenderer {

  /**
   * Creates a new instance of PlotAxisRenderer.
   * @constructor
   * @param plotChart The parental plot chart.
   */
  constructor(plotChart) {

    /**
     * Appends axis on the top, left and bottom of the plot chart.
     */
    this.renderAxis = function () {
      let margin = plotChart.config.margin;

      // top
      plotChart.svg
        .append("g")
        .call(d3.axisTop(plotChart.xChart))
        .attr("transform", () => `translate(0,${margin.top})`);

      // left
      plotChart.svg
        .append("g")
        .call(d3.axisLeft(plotChart.yChart))
        .attr("transform", () => `translate(${margin.left},0)`);

      // bottom
      plotChart.svg
        .append("g")
        .call(d3.axisBottom(plotChart.xChart))
        .attr("transform", () => `translate(0,${plotChart.height - margin.bottom})`);

    };
  }
}

/**
 * Calculates and creates the gradients for the bars of a plot chart.
 *
 * @class PlotGradientCreator
 */
class PlotGradientCreator {

  /**
   * Creates a new instance of PlotGradientCreator.
   *
   * @constructor
   * @param plotChart The parental plot chart.
   */
  constructor(plotChart) {
    this.plotChart = plotChart;
    this.colorGenerator = Color$1.plotColor(1);
  }

  /**
   * Creates the gradient for the bar representing the given dataset.
   * @param dataset The dataset to represent.
   */
  createGradient(dataset) {

    let max = this.plotChart.dataView.max;
    let gradient = this.plotChart.definitions
      .append("linearGradient")
      .attr("id", 'lotivis-plot-gradient-' + createIDFromDataset(dataset))
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    let data = dataset.data;
    let count = data.length;
    let latestDate = dataset.lastDate;
    let duration = dataset.duration;

    if (!data || data.length === 0) return;

    if (duration === 0) {

      let item = data[0];
      let value = item.value;
      let opacity = value / max;

      gradient
        .append("stop")
        .attr("offset", `100%`)
        .attr("stop-color", this.colorGenerator(opacity));

    } else {

      for (let index = 0; index < count; index++) {

        let item = data[index];
        let date = item.date;
        let opacity = item.value / max;

        let dateDifference = latestDate - date;
        let value = (dateDifference / duration);
        let datePercentage = (1 - value) * 100;

        gradient
          .append("stop")
          .attr("offset", `${datePercentage}%`)
          .attr("stop-color", this.colorGenerator(opacity));

      }
    }
  }
}

/**
 * Draws the bar on the plot chart.
 * @class PlotBarsRenderer
 */
class PlotBarsRenderer {

  /**
   * Creates a new instance of PlotAxisRenderer.
   * @constructor
   * @param plotChart The parental plot chart.
   */
  constructor(plotChart) {

    // constant for the radius of the drawn bars.
    const radius = 6;

    this.gradientCreator = new PlotGradientCreator(plotChart);
    plotChart.definitions = plotChart.svg.append("defs");

    /**
     * To be called when the mouse enters a bar on the plot chart.
     * @param event The mouse event.
     * @param dataset The represented dataset.
     */
    function mouseEnter(event, dataset) {
      plotChart.tooltipRenderer.showTooltip.bind(plotChart)(event, dataset);
      plotChart.onSelectDataset(event, dataset);
    }

    /**
     * To be called when the mouse leaves a bar on the plot chart.
     * @param event The mouse event.
     * @param dataset The represented dataset.
     */
    function mouseOut(event, dataset) {
      plotChart.tooltipRenderer.hideTooltip.bind(plotChart)(event, dataset);
    }

    /**
     * Draws the bars.
     */
    this.renderBars = function () {
      let datasets = plotChart.dataView.datasetsSorted || plotChart.dataView.datasets;
      plotChart.definitions = plotChart.svg.append("defs");

      for (let index = 0; index < datasets.length; index++) {
        this.gradientCreator.createGradient(datasets[index]);
      }

      plotChart.barsData = plotChart
        .svg
        .append("g")
        .selectAll("g")
        .data(datasets)
        .enter();

      plotChart.bars = plotChart.barsData
        .append("rect")
        .attr("fill", (d) => `url(#lotivis-plot-gradient-${createIDFromDataset(d)})`)
        .attr('class', 'lotivis-plot-bar')
        .attr("rx", radius)
        .attr("ry", radius)
        .attr("x", (d) => plotChart.xChart((d.duration < 0) ? d.lastDate : d.firstDate || 0))
        .attr("y", (d) => plotChart.yChart(d.label))
        .attr("height", plotChart.yChart.bandwidth())
        .attr("id", (d) => 'rect-' + createIDFromDataset(d))
        .on('mouseenter', mouseEnter)
        .on('mouseout', mouseOut)
        .attr("width", function (data) {
          if (!data.firstDate || !data.lastDate) return 0;
          return plotChart.xChart(data.lastDate) - plotChart.xChart(data.firstDate) + plotChart.xChart.bandwidth();
        }.bind(this));
    };
  }
}

/**
 * Appends and updates the tooltip of a plot chart.
 * @class PlotTooltipRenderer
 * @see PlotChart
 */
class PlotTooltipRenderer {

  /**
   * Creates a new instance of PlotTooltipRenderer.
   *
   * @constructor
   * @param plotChart
   */
  constructor(plotChart) {

    const tooltip = plotChart
      .element
      .append('div')
      .attr('class', 'lotivis-tooltip')
      .attr('rx', 5) // corner radius
      .attr('ry', 5)
      .style('opacity', 0);

    /**
     * Returns the HTML content for the given dataset.
     * @param dataset The dataset to represent in HTML.
     */
    function getHTMLContentForDataset(dataset) {
      let components = [];

      let sum = dataset.data.map(item => item.value).reduce((acc, next) => +acc + +next, 0);
      let formatted = plotChart.config.numberFormat.format(sum);

      components.push('Label: ' + dataset.label);
      components.push('');
      components.push('Start: ' + dataset.firstDate);
      components.push('End: ' + dataset.lastDate);
      components.push('');
      components.push('Items: ' + formatted);
      components.push('');

      let filtered = dataset.data.filter(item => item.value !== 0);
      for (let index = 0; index < filtered.length; index++) {
        let entry = filtered[index];
        let formatted = plotChart.config.numberFormat.format(entry.value);
        components.push(`${entry.date}: ${formatted}`);
      }

      return components.join('<br/>');
    }

    /**
     * Returns the pixel position for to tooltip to display it aligned to the left of a bar.
     * @param dataset The dataset to display the tooltip for.
     * @param factor The factor of the view box of the SVG.
     * @param offset The offset of the chart.
     * @returns {*} The left pixel position for the tooltip.
     */
    function getTooltipLeftForDataset(dataset, factor, offset) {
      let left = plotChart.xChart(dataset.firstDate);
      left *= factor;
      left += offset[0];
      return left;
    }

    /**
     * Presents the tooltip for the given dataset.
     *
     * @param event The mouse event.
     * @param dataset The dataset.
     */
    this.showTooltip = function (event, dataset) {
      if (!plotChart.config.showTooltip) return;
      tooltip.html(getHTMLContentForDataset(dataset));

      // position tooltip
      let tooltipHeight = Number(tooltip.style('height').replace('px', ''));
      let factor = plotChart.getElementEffectiveSize()[0] / plotChart.config.width;
      let offset = plotChart.getElementPosition();

      let top = plotChart.yChart(dataset.label) * factor;
      top += offset[1];

      if ((plotChart.yChart(dataset.label) - plotChart.config.margin.top) <= (plotChart.graphHeight / 2)) {
        top += (plotChart.config.lineHeight * factor) + LotivisConfig.tooltipOffset;
      } else {
        top -= tooltipHeight + 20; // subtract padding
        top -= LotivisConfig.tooltipOffset;
      }

      let left = getTooltipLeftForDataset(dataset, factor, offset);

      tooltip
        .style('left', left + 'px')
        .style('top', top + 'px')
        .style('opacity', 1);
    };

    /**
     * Hides the tooltip by setting its opacity to 0.
     */
    this.hideTooltip = function () {
      let controller = plotChart.datasetController;
      let filters = controller.datasetFilters;

      if (filters && filters.length !== 0) {
        controller.resetFilters();
      }

      if (+tooltip.style('opacity') === 0) return;
      tooltip.style('opacity', 0);
    };
  }
}

/**
 *
 * @class PlotLabelRenderer
 */
class PlotLabelRenderer {

  /**
   * Creates a new instance of PlotLabelRenderer.
   *
   * @constructor
   * @param plotChart The parental plot chart.
   */
  constructor(plotChart) {

    /**
     * Draws the labels on the bars on the plot chart.
     */
    this.renderLabels = function () {
      if (!plotChart.config.showLabels) return;
      let xBandwidth = plotChart.yChart.bandwidth();
      let xChart = plotChart.xChart;
      plotChart.labels = plotChart
        .barsData
        .append('g')
        .attr('transform', `translate(0,${(xBandwidth / 2) + 4})`)
        .append('text')
        .attr('class', 'lotivis-plot-label')
        .attr("id", (d) => 'rect-' + hashCode(d.label))
        .attr("x", (d) => xChart(d.firstDate) + (xBandwidth / 2))
        .attr("y", (d) => plotChart.yChart(d.label))
        .attr("width", (d) => xChart(d.lastDate) - xChart(d.firstDate) + xBandwidth)
        .text(function (dataset) {
          if (dataset.sum === 0) return;
          let formatted = plotChart.config.numberFormat.format(dataset.sum);
          return `${dataset.duration + 1} years, ${formatted} items`;
        });
    };
  }
}

/**
 * Draws a grid on the plot chart.
 *
 * @class PlotGridRenderer
 */
class PlotGridRenderer {

  /**
   * Creates a new instance of PlotGridRenderer.
   *
   * @constructor
   * @param plotChart The parental plot chart.
   */
  constructor(plotChart) {

    /**
     * Adds a grid to the chart.
     */
    this.render = function () {
      if (!plotChart.config.drawGrid) return;

      plotChart.svg
        .append('g')
        .attr('class', 'lotivis-plot-grid lotivis-plot-grid-x')
        .attr('transform', 'translate(0,' + (plotChart.preferredHeight - plotChart.config.margin.bottom) + ')')
        .call(plotChart.xAxisGrid);

      plotChart.svg
        .append('g')
        .attr('class', 'lotivis-plot-grid lotivis-plot-grid-y')
        .attr('transform', `translate(${plotChart.config.margin.left},0)`)
        .call(plotChart.yAxisGrid);

    };
  }
}

class PlotBackgroundRenderer {

  constructor(plotChart) {

    this.render = function () {
      plotChart.svg
        .append('rect')
        .attr('width', plotChart.width)
        .attr('height', plotChart.height)
        .attr('class', 'lotivis-plot-background');
    };
  }
}

/**
 * Enumeration of sorts available in the plot chart.
 */
const PlotChartSort = {
  none: 'none',
  alphabetically: 'alphabetically',
  duration: 'duration',
  intensity: 'intensity',
  firstDate: 'firstDate'
};

const defaultPlotChartConfig = {
  width: 1000,
  height: 600,
  margin: {
    top: LotivisConfig.defaultMargin,
    right: LotivisConfig.defaultMargin,
    bottom: LotivisConfig.defaultMargin,
    left: LotivisConfig.defaultMargin
  },
  lineHeight: 28,
  radius: 23,
  showLabels: true,
  drawGrid: true,
  showTooltip: true,
  lowColor: 'rgb(184, 233, 148)',
  highColor: 'rgb(0, 122, 255)',
  sort: PlotChartSort.none,
  numberFormat: Intl.NumberFormat('de-DE', {
    maximumFractionDigits: 3
  }),
};

/**
 *
 * @param dataset
 * @param dateAccess
 * @returns {{}}
 */
function createPlotDataset(dataset, dateAccess) {

  let newDataset = {};
  let data = copy(dataset.data);
  let firstDate = extractEarliestDateWithValue(data) || 0;
  let lastDate = extractLatestDateWithValue(data) || 0;
  let flatData = flatDataset(dataset);

  newDataset.dataset = dataset.label;
  newDataset.label = dataset.label;
  newDataset.stack = dataset.stack;
  newDataset.firstDate = firstDate;
  newDataset.lastDate = lastDate;
  newDataset.sum = sumOfValues(flatData);
  newDataset.data = combineByDate(data)
    .sort((left, right) => left.dateNumeric - right.dateNumeric)
    .filter(item => (item.value || 0) > 0);

  return newDataset;
}

/**
 * Returns a new generated plot samples view for the current enabled samples of dataset of this controller.
 */
DatasetsController.prototype.getPlotDataview = function () {

  let cachedDataView = this.getCached('plot');
  if (cachedDataView) {
    return cachedDataView;
  }

  this.dateAccess;
  let enabledDatasets = this.enabledDatasets();
  let dataview = {datasets: []};

  dataview.dates = extractDatesFromDatasets(enabledDatasets).sort();
  dataview.labels = extractLabelsFromDatasets(enabledDatasets);

  enabledDatasets.forEach(function (dataset) {
    let newDataset = createPlotDataset(dataset);
    let firstIndex = dataview.dates.indexOf(newDataset.firstDate);
    let lastIndex = dataview.dates.indexOf(newDataset.lastDate);
    newDataset.duration = lastIndex - firstIndex;
    dataview.datasets.push(newDataset);
  });

  dataview.labelsCount = dataview.datasets.length;
  dataview.max = d3LibraryAccess.max(dataview.datasets, function (dataset) {
    return d3LibraryAccess.max(dataset.data, function (item) {
      return item.value;
    });
  });

  this.setCached(dataview, 'plot');

  return dataview;
};

/**
 * A lotivis plot chart.
 *
 * @class PlotChart
 * @extends Chart
 */
class PlotChart extends Chart {

  /**
   * Initializes this diachronic chart by setting the default values.
   */
  initialize() {

    this.config;
    let margin;
    margin = Object.assign({}, defaultPlotChartConfig.margin);
    margin = Object.assign(margin, this.config.margin);

    let config = Object.assign({}, defaultPlotChartConfig);
    this.config = Object.assign(config, this.config);
    this.config.margin = margin;

    this.createSVG();
    this.backgroundRenderer = new PlotBackgroundRenderer(this);
    this.axisRenderer = new PlotAxisRenderer(this);
    this.gridRenderer = new PlotGridRenderer(this);
    this.barsRenderer = new PlotBarsRenderer(this);
    this.labelsRenderer = new PlotLabelRenderer(this);
    this.tooltipRenderer = new PlotTooltipRenderer(this);
  }

  /**
   * Appends the svg element to the parental element.
   */
  createSVG() {
    this.svg = this.element
      .append('svg')
      .attr('id', this.svgSelector)
      .attr('class', 'lotivis-chart-svg')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr("viewBox", `0 0 ${this.config.width} ${this.config.height}`);
  }

  /**
   * Removes any (old) components from the svg.
   */
  remove() {
    this.svg.selectAll('*').remove();
  }

  /**
   *
   */
  precalculate() {

    if (this.datasetController) {
      this.dataView = this.datasetController.getPlotDataview();
    } else {
      this.dataView = {datasets: [], barsCount: 0};
    }

    this.sortDatasets();

    let margin = this.config.margin;
    let barsCount = this.dataView.labelsCount || 0;

    this.graphWidth = this.config.width - margin.left - margin.right;
    this.graphHeight = (barsCount * this.config.lineHeight);
    this.height = this.graphHeight + margin.top + margin.bottom;
    this.preferredHeight = this.height;

    this.svg
      .attr("viewBox", `0 0 ${this.config.width} ${this.preferredHeight}`);

    this.createScales();
  }

  /**
   * Creates and renders the chart.
   */
  draw() {
    this.backgroundRenderer.render();
    this.gridRenderer.render();
    this.axisRenderer.renderAxis();
    this.barsRenderer.renderBars();
    this.labelsRenderer.renderLabels();
  }

  /**
   * Updates the plot chart.
   */
  update(controller, reason) {
    if (!this.updateSensible) return;
    if (reason === 'dates-filter') return;
    this.remove();
    this.precalculate();
    this.draw();
  }

  /**
   * Creates scales which are used to calculate the x and y positions of bars or circles.
   */
  createScales() {

    this.xChart = d3
      .scaleBand()
      .domain(this.dataView.dates || [])
      .rangeRound([this.config.margin.left, this.config.width - this.config.margin.right])
      .paddingInner(0.1);

    this.yChart = d3
      .scaleBand()
      .domain(this.dataView.labels || [])
      .rangeRound([this.height - this.config.margin.bottom, this.config.margin.top])
      .paddingInner(0.1);

    this.xAxisGrid = d3
      .axisBottom(this.xChart)
      .tickSize(-this.graphHeight)
      .tickFormat('');

    this.yAxisGrid = d3
      .axisLeft(this.yChart)
      .tickSize(-this.graphWidth)
      .tickFormat('');

  }

  /**
   *
   * @param event
   * @param dataset
   */
  onSelectDataset(event, dataset) {
    if (!dataset || !dataset.label) return;
    let label = dataset.label;
    if (this.datasetController.listeners.length === 1) return;
    this.updateSensible = false;
    this.datasetController.setDatasetsFilter([label]);
    this.updateSensible = true;
  }

  sortDatasets() {
    let datasets = this.dataView.datasets;
    let sortedDatasets = [];
    switch (this.config.sort) {
      case PlotChartSort.alphabetically:
        sortedDatasets = datasets
          .sort((set1, set2) => set1.label > set2.label);
        break;
      case PlotChartSort.duration:
        sortedDatasets = datasets
          .sort((set1, set2) => set1.duration < set2.duration);
        break;
      case PlotChartSort.intensity:
        sortedDatasets = datasets
          .sort((set1, set2) => set1.sum < set2.sum);
        break;
      case PlotChartSort.firstDate:
        sortedDatasets = datasets
          .sort((set1, set2) => set1.firstDate > set2.firstDate);
        break;
      default:
        sortedDatasets = datasets;
        break;
    }

    this.dataView.labels = sortedDatasets.map(dataset => String(dataset.label)).reverse();
  }
}

/**
 *
 * @class PlotChartSettingsPopup
 * @extends SettingsPopup
 */
class PlotChartSettingsPopup extends SettingsPopup {

  /**
   * Appends the headline and the content row of the popup.
   */
  inject() {
    super.inject();

    let container = this.row.append('div');

    this.showLabelsCheckbox = new Checkbox(container);
    this.showLabelsCheckbox.setText('Labels');
    this.showLabelsCheckbox.onClick = function (checked) {
      this.chart.config.showLabels = checked;
      this.chart.update();
      UrlParameters.getInstance().set(UrlParameters.chartShowLabels, checked);
    }.bind(this);

    let dropdownContainer = this.row.append('div');
    this.sortDropdown = new Dropdown(dropdownContainer);
    this.sortDropdown.setLabelText('Sort');
    this.sortDropdown.setOptions([
      new Option(PlotChartSort.alphabetically),
      new Option(PlotChartSort.duration),
      new Option(PlotChartSort.intensity),
      new Option(PlotChartSort.firstDate)
    ]);
    this.sortDropdown.setOnChange(function (value) {
      this.chart.config.sort = value;
      this.chart.update();
    }.bind(this));
  }

  /**
   * Tells this popup that it is about to be displayed.
   */
  willShow() {
    this.showLabelsCheckbox.setChecked(this.chart.config.showLabels);
    this.sortDropdown.setSelectedOption(this.chart.config.sort);
  }
}

/**
 * A card containing a plot chart.
 * @class PlotChartCard
 * @extends Card
 */
class PlotChartCard extends ChartCard {

  /**
   * Creates a new instance of PlotChartCard.
   * @param selector The selector
   * @param config
   */
  constructor(selector, config) {
    let theSelector = selector || 'plot-chart-card';
    super(theSelector, config);
    this.injectRadioGroup();
    this.applyURLParameters();
    // this.setTitle('Plot');
  }

  /**
   * Injects the plot chart in the body of the card.
   */
  injectChart() {
    this.chartID = this.selector + '-chart';
    this.body.attr('id', this.chartID);
    this.chart = new PlotChart(this.chartID, this.config);
  }

  /**
   * Applies possible url parameters.
   */
  applyURLParameters() {
    let instance = UrlParameters.getInstance();
    this.chart.type = instance.getString(UrlParameters.chartType, 'bar');
    this.chart.isShowLabels = instance.getBoolean(UrlParameters.chartShowLabels, false);
    this.chart.isCombineStacks = instance.getBoolean(UrlParameters.chartCombineStacks, false);
  }

  /**
   * Presents the settings popup.
   */
  presentSettingsPopupAction() {
    let bodyElement = d3.select('body');
    let button = document.getElementById(this.moreButton.selector);
    let settingsPopup = new PlotChartSettingsPopup(bodyElement);
    settingsPopup.chart = this.chart;
    settingsPopup.showUnder(button, 'right');
  }

  /**
   * Creates and downloads a screenshot from the chart.
   * @override
   */
  screenshotButtonAction() {
    let filename = this.chart.datasetController.getFilename();
    let downloadFilename = createDownloadFilename(filename, `plot-chart`);
    downloadImage(this.chart.svgSelector, downloadFilename);
  }
}

/**
 * Appends the given listener to the collection of listeners.
 * @param listener The listener to addDataset.
 */
DatasetsController.prototype.addListener = function (listener) {
  if (!this.listeners) this.listeners = [];
  if (!listener.update) return lotivis_log('Listener unqualified.');
  if (this.listeners.includes(listener)) return lotivis_log(`[lotivis]  Attempt to add listener twice (${listener}).`);
  this.listeners.push(listener);
  listener.update(this, DatasetsController.NotificationReason.registration);
};

/**
 * Removes the given listener from the collection of listeners.
 * @param listener The listener to removeDataset.
 */
DatasetsController.prototype.removeListener = function (listener) {
  if (!this.listeners) return lotivis_log('No listeners property.');
  let index = this.listeners.indexOf(listener);
  if (index === -1) return lotivis_log(`Listener not registered: ${listener}`);
  this.listeners = this.listeners.splice(index, 1);
};

/**
 * Notifies all listeners.
 * @param reason The reason to send to the listener.  Default is 'none'.
 */
DatasetsController.prototype.notifyListeners = function (reason = DatasetsController.NotificationReason.none) {
  if (!this.listeners) return;
  for (let index = 0; index < this.listeners.length; index++) {
    let listener = this.listeners[index];
    if (!listener.update) {
      lotivis_log('Listener unqualified.');
      continue;
    }
    // lotivis_log(`listener: ${listener}`);
    console.timeStamp('will update ' + listener);
    listener.update(this, reason);
    console.timeStamp('did update ' + listener);
  }
};

/**
 * Sets this controller to all of the given listeners via the `setDatasetsController` function.
 * @param listeners A collection of listeners.
 */
DatasetsController.prototype.register = function (listeners) {
  if (!Array.isArray(listeners)) return;
  for (let index = 0; index < listeners.length; index++) {
    let listener = listeners[index];
    if (!listener.setDatasetsController) continue;
    listener.setDatasetsController(this);
  }
};

/**
 * Resets all filters.  Notifies listeners.
 */
DatasetsController.prototype.resetFilters = function (notifyListeners = true) {
  this.locationFilters = [];
  this.dateFilters = [];
  this.datasetFilters = [];
  this.calculateSelection();
  if (!notifyListeners) return;
  this.notifyListeners(DatasetsController.NotificationReason.resetFilters);
};

/**
 * Sets the locations filter.  Notifies listeners.
 * @param locations The locations to filter.
 */
DatasetsController.prototype.setLocationsFilter = function (locations) {
  let stringVersions = locations.map(location => String(location)).filter(item => item.length > 0);
  if (objectsEqual(this.locationFilters, stringVersions)) {
    return lotivis_log(`[lotivis]  Location filters not changed.`);
  }
  this.locationFilters = stringVersions;
  this.calculateSelection();
  this.notifyListeners(DatasetsController.NotificationReason.filterLocations);
};

/**
 * Sets the dates filter.  Notifies listeners.
 * @param dates The dates to filter.
 */
DatasetsController.prototype.setDatesFilter = function (dates) {
  let stringVersions = dates.map(date => String(date)).filter(item => item.length > 0);
  if (objectsEqual(this.dateFilters, stringVersions)) return lotivis_log(`[lotivis]  Date filters not changed.`);
  this.dateFilters = stringVersions;
  this.calculateSelection();
  this.notifyListeners(DatasetsController.NotificationReason.filterDates);
};

/**
 * Sets the datasets filter.  Notifies listeners.
 * @param datasets The datasets to filter.
 */
DatasetsController.prototype.setDatasetsFilter = function (datasets) {
  let stringVersions = datasets.map(dataset => String(dataset)).filter(item => item.length > 0);
  if (objectsEqual(this.datasetFilters, stringVersions)) return lotivis_log(`[lotivis]  Dataset filters not changed.`);
  this.datasetFilters = stringVersions;
  this.calculateSelection();
  this.notifyListeners(DatasetsController.NotificationReason.filterDataset);
};

/**
 * Toggles the enabled of the dataset with the given label.
 * @param label The label of the dataset.
 * @param notifyListeners A boolean value indicating whether to notify the listeners.  Default is `true`.
 */
DatasetsController.prototype.toggleDataset = function (label, notifyListeners = true) {
  this.datasets.forEach((dataset) => {
    if (dataset.label !== label) return;
    dataset.isEnabled = !dataset.isEnabled;
  });
  if (!notifyListeners) return;
  this.notifyListeners('dataset-toggle');
};

/**
 * Enables all datasets.  Notifies listeners.
 */
DatasetsController.prototype.enableAllDatasets = function () {
  this.datasets.forEach(dataset => dataset.isEnabled = true);
  this.notifyListeners('dataset-enable-all');
};

/**
 * Returns the flat version of the collection of enabled datasets.
 * @returns {[]}
 */
DatasetsController.prototype.enabledFlatData = function () {
  return flatDatasets(this.enabledDatasets());
};

/**
 * Returns the set of labels of the enabled datasets.
 * @returns {*[]} The set of labels.
 */
DatasetsController.prototype.enabledLabels = function () {
  return extractLabelsFromDatasets(this.enabledDatasets());
};

/**
 * Returns the set of stacks of the enabled datasets.
 * @returns {*[]} The set of stacks.
 */
DatasetsController.prototype.enabledStacks = function () {
  return extractStacksFromDatasets(this.enabledDatasets());
};

/**
 * Returns the set of dates of the enabled datasets.
 * @returns {*[]} The set of dates.
 */
DatasetsController.prototype.enabledDates = function () {
  return extractDatesFromDatasets(this.enabledDatasets());
};

/**
 * Returns a newly generated collection containing all enabled datasets.
 * @returns {*} The collection of enabled datasets.
 */
DatasetsController.prototype.enabledDatasets = function () {
  let aCopy = copy(this.datasets);

  let enabled = aCopy
    .filter(dataset => dataset.isEnabled === true);

  if (this.datasetFilters && this.datasetFilters.length > 0) {
    enabled = enabled.filter(dataset => this.datasetFilters.includes(dataset.label));
  }

  if (this.locationFilters && this.locationFilters.length > 0) {
    let locationFilters = this.locationFilters;
    enabled = enabled.map(function (dataset) {
      dataset.data = dataset.data
        .filter(data => locationFilters.includes(String(data.location))) || [];
      return dataset;
    });
  }

  if (this.dateFilters && this.dateFilters.length > 0) {
    let dateFilters = this.dateFilters;
    enabled = enabled.map(function (dataset) {
      dataset.data = dataset.data
        .filter(data => dateFilters.includes(String(data.date))) || [];
      return dataset;
    });
  }

  return enabled.filter(dataset => dataset.data.length > 0);
};

/*
CRUD:
- create
- read
- update
- delete
 */

/**
 * Sets the given dataset.
 * @param dataset The new dataset.
 */
DatasetsController.prototype.setDataset = function (dataset) {
  this.cache.invalidate();
  this.setDatasets([dataset]);
};

/**
 * Updates the datasets of this controller.
 * @param datasets The new datasets.
 */
DatasetsController.prototype.setDatasets = function (datasets) {
  this.cache.invalidate();
  this.originalDatasets = datasets;
  this.datasets = copy(datasets);
  validateDatasets(datasets);
  this.datasetsDidChange();
};

/**
 * Appends the given dataset to this controller.
 * @param dataset The dataset to append.
 */
DatasetsController.prototype.addDataset = function (dataset) {
  this.cache.invalidate();
  this.addDatasets([dataset]);
};

/**
 * Appends the given datasets to this controller.
 * @param datasets The collection of datasets to add.
 */
DatasetsController.prototype.addDatasets = function (datasets) {
  if (!this.datasets || !Array.isArray(this.datasets)) return;
  if (!datasets || !Array.isArray(datasets)) return;
  if (this.datasets.find(dataset => dataset.label === datasets.label)) {
    throw new Error(`DatasetsController already contains a dataset with the same label (${datasets.label}).`);
  }
  this.cache.invalidate();
  datasets.forEach(dataset => this.datasets.push(dataset));
  this.datasetsDidChange();
  this.notifyListeners(DatasetsController.NotificationReason.datasetsUpdate);
};

/**
 * Removes the dataset with the given label from this controller.  Will do nothing if no dataset
 * with the given label exists.
 * @param label The label of the dataset to removeDataset.
 */
DatasetsController.prototype.removeDataset = function (label) {
  this.cache.invalidate();
  this.removeDatasets([label]);
};

/**
 * Removes the given datasets from this controller.  Datasets this controller already containing will be ignored.
 * @param labels The collection of labels to remove.
 */
DatasetsController.prototype.removeDatasets = function (labels) {
  if (!this.datasets || !Array.isArray(this.datasets)) return;
  if (!labels || !Array.isArray(labels)) return;
  this.cache.invalidate();
  labels.forEach(function (label) {
    let candidate = this.datasets.find(dataset => dataset.label === label);
    if (!candidate) return;
    let index = this.datasets.indexOf(candidate);
    if (index < 0) return;
    this.datasets = this.datasets.splice(index, 1);
  }.bind(this));
  this.datasetsDidChange();
};

/**
 *
 * @class DatasetsColorsController
 */
class DatasetsColorsController {

  /**
   * Creates a new instance of DatasetsColorsController.
   * @param workingDatasets
   * @param stacks
   */
  constructor(workingDatasets, stacks) {

    let datasets = workingDatasets;
    let labelToColor = {};
    let stackToColors = {};

    for (let sIndex = 0; sIndex < stacks.length; sIndex++) {
      let stack = stacks[sIndex];

      // filter datasets for stack
      let filtered = datasets.filter(function (dataset) {
        return dataset.label === stack || dataset.stack === stack;
      });

      let colors = Color$1.colorsForStack(sIndex, filtered.length);
      stackToColors[stack] = colors;
      for (let dIndex = 0; dIndex < filtered.length; dIndex++) {
        labelToColor[filtered[dIndex].label] = colors[dIndex];
      }
    }

    this.colorForDataset = function (label) {
      return labelToColor[label] || Color$1.defaultTint;
    };

    this.colorForStack = function (stack) {
      return stackToColors[stack][0] || Color$1.defaultTint;
    };

    this.colorsForStack = function (stack) {
      return stackToColors[stack] || [];
    };
  }
}

/**
 * Returns the current selection.
 */
DatasetsController.prototype.getSelection = function () {
  return this.selection;
};

/**
 * Calculates the current selection dependant on the set filters.
 */
DatasetsController.prototype.calculateSelection = function () {
  let selectedData = this.enabledDatasets();
  let flatData = flatDatasets(selectedData);
  this.selection = {
    labels: extractLabelsFromDatasets(selectedData),
    stacks: extractStacksFromDatasets(selectedData),
    dates: extractDatesFromFlatData(flatData),
    locations: extractLocationsFromFlatData(flatData),
    datasets: selectedData,
    flatData: flatData,
  };
};

/**
 * Calculates the additional data.
 */
DatasetsController.prototype.calculateAdditionalData = function () {
  let dateAccess = this.dateAccess;

  this.datasets = copy(this.datasets)
    .sort((left, right) => left.label > right.label);

  this.datasets.forEach(function (dataset) {
    dataset.isEnabled = true;
    dataset.data.forEach(function (item) {
      item.dateNumeric = dateAccess(item.date);
    });
    dataset.data = dataset.data
      .sort((left, right) => left.dateNumeric - right.dateNumeric);
  });

  this.flatData = flatDatasets(this.datasets);
  this.labels = extractLabelsFromDatasets(this.datasets);
  this.stacks = extractStacksFromDatasets(this.datasets);
  this.dates = extractDatesFromDatasets(this.datasets)
    .sort((left, right) => dateAccess(left) - dateAccess(right));

  this.locations = extractLocationsFromDatasets(this.datasets);
  this.datasetsColorsController = new DatasetsColorsController(this.datasets, this.stacks);
};

/**
 * Tells this datasets controller that its datasets did change.
 */
DatasetsController.prototype.datasetsDidChange = function () {
  if (!this.datasets || !Array.isArray(this.datasets)) {
    lotivis_log('[lotivis]  No datasets.');
    return;
  }

  this.calculateAdditionalData();
  this.calculateSelection();
  this.notifyListeners(DatasetsController.NotificationReason.datasetsUpdate);
};

/**
 *
 * @param datasets
 * @param dateToItemsRelation
 * @returns {*[]}
 */
function createStackModel(controller, datasets, dateToItemsRelation) {
  let listOfStacks = extractStacksFromDatasets(datasets);

  return listOfStacks.map(function (stackName) {

    let stackCandidates = datasets.filter(function (dataset) {
      return dataset.stack === stackName
        || dataset.label === stackName;
    });

    let candidatesNames = stackCandidates.map(stackCandidate => stackCandidate.label);
    let candidatesColors = stackCandidates.map(stackCandidate => controller.getColorForDataset(stackCandidate.label));

    let stack = d3
      .stack()
      .keys(candidatesNames)
      (dateToItemsRelation);

    stack.label = stackName;
    stack.stack = stackName;
    stack.colors = candidatesColors;

    return stack;
  });
}

/**
 * Returns the first item of the array.
 * @returns {*} The first item.
 */
Array.prototype.first = function () {
  return this[0];
};

/**
 * Returns the last item of the array.
 * @returns {*} The last item.
 */
Array.prototype.last = function () {
  return this[this.length - 1];
};

/**
 * Combines each `ratio` entries to one.
 * @param datasets The datasets collection.
 * @param ratio The ratio.
 */
function combineDatasetsByRatio(datasets, ratio) {
  let copied = copy(datasets);
  for (let index = 0; index < copied.length; index++) {
    let dataset = copied[index];
    let data = dataset.data;
    dataset.data = combineDataByGroupsize(data, ratio);
    copied[index] = dataset;
  }
  return copied;
}

/**
 *
 * @param data
 * @param ratio
 */
function combineDataByGroupsize(data, ratio) {
  if (!data || data.length <= ratio) return data;
  if (ratio <= 1) return data;

  let combined = combineByDate(copy(data));
  let newData = [];

  while (combined.length > 0) {
    let dateGroup = combined.splice(0, ratio);
    let firstItem = dateGroup.first() || {};
    let lastItem = dateGroup.last() || {};
    let item = {};
    item.dataset = firstItem.dataset;
    item.label = firstItem.label;
    item.stack = firstItem.stack;
    item.date = firstItem.date;
    item.date = firstItem.date;
    item.from = firstItem.date;
    item.till = lastItem.date;
    item.value = sumOfValues(dateGroup);
    newData.push(item);
  }

  return newData;
}

DatasetsController.prototype.getCached = function (type) {
  return this.cache.getDataView(
    type,
    this.locationFilters,
    this.dateFilters,
    this.datasetFilters
  );
};

DatasetsController.prototype.setCached = function (dataview, type) {
  return this.cache.setDataView(
    dataview,
    type,
    this.locationFilters,
    this.dateFilters,
    this.datasetFilters
  );
};

/**
 * Returns a new generated DateDataview for the current enabled samples of dataset of this controller.
 */
DatasetsController.prototype.getDateDataview = function (groupSize) {

  let cachedDataView = this.getCached('date');
  if (cachedDataView) {
    return cachedDataView;
  }

  this.dateAccess;
  let datasets = copy(this.datasets);
  let enabledDatasets = copy(this.enabledDatasets() || datasets);
  let dataview = {};
  let saveGroupSize = groupSize || 1;

  dataview.groupSize = saveGroupSize;
  if (saveGroupSize <= 1) {
    dataview.datasets = datasets;
    dataview.enabledDatasets = enabledDatasets;
  } else {
    datasets = combineDatasetsByRatio(datasets, saveGroupSize);
    enabledDatasets = combineDatasetsByRatio(enabledDatasets, saveGroupSize);
    dataview.datasets = datasets;
  }

  dataview.dateToItemsRelation = dateToItemsRelation(datasets);
  dataview.dateToItemsRelationPresented = dateToItemsRelation(enabledDatasets);
  dataview.datasetStacks = createStackModel(this, datasets, dataview.dateToItemsRelation);
  dataview.datasetStacksPresented = createStackModel(this, enabledDatasets, dataview.dateToItemsRelationPresented);

  dataview.max = d3.max(dataview.datasetStacksPresented, function (stack) {
    return d3.max(stack, function (series) {
      return d3.max(series.map(item => item['1']));
    });
  });

  dataview.dates = extractDatesFromDatasets(enabledDatasets);
  dataview.enabledStacks = this.enabledStacks();

  this.setCached(dataview, 'date');

  return dataview;
};

/**
 * Returns a new generated DateDataview for the current enabled samples of dataset of this controller.
 */
DatasetsController.prototype.getDateDataviewCombinedStacks = function (groupSize) {
  this.dateAccess;
  let datasets = copy(this.datasets);
  let enabledDatasets = copy(this.enabledDatasets() || datasets);
  let dataview = {};
  let saveGroupSize = groupSize || 1;

  datasets.forEach(function (dataset) {
    dataset.label = dataset.stack || dataset.label;
  });

  enabledDatasets.forEach(function (dataset) {
    dataset.label = dataset.stack || dataset.label;
  });

  datasets = createDatasets(combine(flatDatasets(datasets)));
  enabledDatasets = createDatasets(combine(flatDatasets(enabledDatasets)));

  dataview.groupSize = saveGroupSize;
  if (saveGroupSize <= 1) {
    dataview.datasets = datasets;
    dataview.enabledDatasets = enabledDatasets;
  } else {
    datasets = combineDatasetsByRatio(datasets, saveGroupSize);
    enabledDatasets = combineDatasetsByRatio(enabledDatasets, saveGroupSize);
    dataview.datasets = datasets;
  }

  dataview.dateToItemsRelation = dateToItemsRelation(datasets);
  dataview.dateToItemsRelationPresented = dateToItemsRelation(enabledDatasets);
  dataview.datasetStacks = createStackModel(this, datasets, dataview.dateToItemsRelation);
  dataview.datasetStacksPresented = createStackModel(this, enabledDatasets, dataview.dateToItemsRelationPresented);

  dataview.max = d3.max(dataview.datasetStacksPresented, function (stack) {
    return d3.max(stack, function (series) {
      return d3.max(series.map(item => item['1']));
    });
  });

  dataview.dates = extractDatesFromDatasets(enabledDatasets);
  dataview.enabledStacks = this.enabledStacks();

  return dataview;
};

/**
 * Returns a new generated location dataview for the current selected datasets.controller of datasets of this controller.
 *
 * A location dataview has the following form:
 * ```
 * {
 *   stacks: [String],
 *   items: [
 *     {
 *       dataset: String,
 *       stack: String,
 *       location: Any,
 *       value: Number
 *     }
 *   ]
 * }
 * ```
 */
DatasetsController.prototype.getLocationDataview = function () {

  let cachedDataView = this.getCached('location');
  if (cachedDataView) {
    return cachedDataView;
  }

  let dataview = {};
  let flatData = this.enabledFlatData();
  let combinedByStack = combineByStacks(flatData);
  let combinedByLocation = combineByLocation(combinedByStack);

  dataview.stacks = this.stacks;
  dataview.combinedData = combinedByLocation;

  dataview.combinedData.forEach(item => {
    item.stack = item.stack || item.label || item.dataset;
  });

  this.setCached(dataview, 'location');

  return dataview;
};

exports.createID = createID;

// colors
exports.Color = Color$1;

// components
exports.Button = Button;
exports.Card = Card;
exports.Checkbox = Checkbox;
exports.Component = Component;
exports.Dropdown = Dropdown;
exports.ModalPopup = ModalPopup;
exports.Popup = Popup;
exports.RadioGroup = RadioGroup;
exports.Option = Option;
exports.Toast = Toast;

// datasets / csv cards
exports.DatasetsJSONCard = DatasetsJSONCard;
exports.DatasetCSVCard = DatasetCSVCard;
exports.DatasetCSVDateCard = DatasetCSVDateCard;
exports.DataviewCard = DataviewCard;
exports.DataviewDateCard = DataviewDateCard;
exports.DataviewPlotCard = DataViewPlotCard;
exports.DataviewMapCard = DataViewMapCard;
exports.DataviewFlatCard = DataviewFlatCard;
exports.DataviewDatasetsControllerCard = DataviewDatasetsControllerCard;
exports.DataviewDatasetsControllerSelectionCard = DataviewDatasetsControllerSelectionCard;
exports.UpdatableDataviewCard = UpdatableDataviewCard;
exports.EditableDataviewCard = EditableDataviewCard;

// time
exports.DateChart = DateChart;
exports.DateChartCard = DateChartCard;

// map
exports.MapChart = MapChart;
exports.MapChartCard = MapChartCard;

// plot
exports.PlotChart = PlotChart;
exports.PlotChartCard = PlotChartCard;

// datasets
exports.DatasetController = DatasetsController;

// parse
exports.parseCSV = parseCSV;
exports.parseCSVDate = parseCSVDate;

// constants
exports.config = LotivisConfig;
exports.debug = debug;

// time assessors
exports.DefaultDateAccess = DefaultDateAccess;
exports.FormattedDateAccess = FormattedDateAccess;
exports.GermanDateAccess = DateGermanAssessor;
exports.DateWeekAssessor = DateWeekAssessor;

// url parameters
exports.URLParameters = UrlParameters;

var exports$1 = exports;

console.log(`[lotivis]  lotivis module loaded.`);
UrlParameters.getInstance().updateCurrentPageFooter();

exports.default = exports$1;

})));
//# sourceMappingURL=lotivis.js.map

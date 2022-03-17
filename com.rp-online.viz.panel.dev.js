let results = []
let excludeList = []

function viz_log(message) {
  let log_prefix = "Custom Viz - DEV RPM Panel"
  // Comment out for Production Version - only in the DEV Version this should output
  console.log(log_prefix + ": " + message)
}

function on(elem) {
  var layer = document.getElementById(
    "panel-item__info-description-layer"
  );
  layer.style.visibility = "visible";
  var description = elem.getElementsByClassName("panel-item__description");
  var textDesc = description[0].innerText;
  viz_log(textDesc);
  var divDesc = document.createElement('div');
  divDesc.className = "panel-item__info-description-show";
  divDesc.id = "panel-item__info-description-show";
  layer.insertBefore(divDesc, layer.firstChild);

  var descShow = document.getElementById(
    "panel-item__info-description-show"
  );
  var divDescText = document.createElement("div");
  divDescText.className = "panel-item__info-description-text";
  divDescText.innerHTML = textDesc;
  descShow.appendChild(divDescText);
}

function off() {
  document.getElementById(
    "panel-item__info-description-layer"
  ).style.visibility = "hidden";
  document.querySelector(".panel-item__info-description-show").remove();
}

function addMeasures(measures) {
  measures.forEach(measure => {
    results.push(measure);
  });
}

function addPivots(data) {
  viz_log("generate new results for pivots")
  let newMeasures = []
  for (const [measureName, measure] of Object.entries(data)) {
    const measureIndex = results.findIndex(x => x.name === measureName);
    if (measureIndex > -1) {
      for (const [pivotName, pdata] of Object.entries(measure)) {
        let newMeasure = Object.assign({}, results[measureIndex])

        newMeasure.name = `${measureName}_${pivotName}`
        newMeasure.pivotName = pivotName
        newMeasure.label = `${newMeasure.label} (${pivotName})`
        newMeasures.push(newMeasure)
      }
    }
  }
  results = newMeasures
}

function flatData(data) {
  viz_log("generate new data object for pivots")

  if (!data) return false
  let newData = {}
  for (const [measureName, measure] of Object.entries(data)) {
    for (const [pivotName, pdata] of Object.entries(measure)) {
      newData[`${measureName}_${pivotName}`] = pdata
    }
  }
  viz_log(newData)
  return newData
}
const fieldlist = (excludeIndex) => {
  let valueOptions = [{
    "-": "none"
  }];
  results.forEach((field, index) => {
    if (index != excludeIndex) {
      const {
        label,
        name
      } = field;
      const option_id = `secondvalueoption_${name}`;
      valueOptions.push({
        [label]: name
      })
    }
  })
  return valueOptions;
}

const getOptions = () => {
  let options = {
    // General Options for the Panel
    orientation: {
      label: "Orientation",
      type: "string",
      section: "Style",
      display: "select",
      values: [
        { "Vertical":   "vertical" },
        { "Horizontal": "horizontal" }
      ],
      default: "vertical",
      order: 0,
      display_size: "half"
    }
  }

  // Generate Options for each Series
  results.forEach((field, index) => {
    const {
      description,
      label,
      name
    } = field;

    viz_log("excludeList")
    viz_log(excludeList)
    viz_log(name)

    if (!excludeList[name]) {
      options[`label_${name}`] = {
        display: "text",
        placeholder: `${label}`,
        label: `-- ${label} ------------- `,
        section: "Series",
        type: "string",
        order: index * 100 + 0
      };

      options[`description_${name}`] = {
        display: "text",
        label: "Description: ",
        section: "Series",
        order: index * 100 + 1,
        display_size: "normal",
        type: "string",
      };
    }

      options[`color_${name}`] = {
        display: "color",
        label: "Color: ",
        default: "#EDE9EC",
        section: "Series",
        type: "string",
        order: index * 100 + 2,
        display_size: "third"
      };

      options[`size_${name}`] = {
        display: "select",
        label: "Size: ",
        // series: '1',
        values: [
          { "Large":  "large" },
          { "Medium": "medium" },
          { "Small":  "small" }
        ],
        default: "large",
        section: "Series",
        type: "string",
        order: index * 100 + 3,
        display_size: "third"
      };

      options[`valueFormat_${name}`] = {
        display: "text",
        placeholder: "",
        label: "Value Format: ",
        section: "Series",
        order: index * 100 + 4,
        display_size: "third",
        type: "string",
      };

      options[`comparison_${name}`] = {
        display: "select",
        label: "Comparison: ",
        // series: '1',
        values: [
          { "Percentage": "percentage" },
          { "Absolute": "absolute" },
          { "None": "none" }
        ],
        default: "percentage",
        section: "Series",
        type: "string",
        order: index * 100 + 5,
        display_size: "half"
      };

      options[`comparisonNegate_${name}`] = {
        label: "Comparison: Negative values are good",
        default: false,
        section: "Series",
        order: index * 100 + 6,
        type: "boolean",
        display_size: "half"
      };

      options[`referenceField_${name}`] = {
        display: "select",
        label: "Reference Field: ",
        values: fieldlist(index),
        default: "none",
        section: "Series",
        order: index * 100 + 7,
        type: "string",
        display_size: "half"
      };
      
      options[`referenceLabel_${name}`] = {
        display: "text",
        label: "Label: ",
        section: "Series",
        order: index * 100 + 8,
        type: "string",
        display_size: "half"
      };

  })
  return options
}

const options = getOptions();

looker.plugins.visualizations.add({
  options,
  create: function (element, config) {

    // Insert a <style> tag with some styles we'll use later.
    element.innerHTML = `
      <style>
        body {
          font-family: Helvetica, Arial, sans-serif;
        }
        a {
          color: #000;
          text-decoration: none;
        }
        .panel-container {
          display: flex;
        }
        .panel-container--horizontal {
          flex-direction: row;
        }
        .panel-container--vertical {
          flex-direction: column;
        }
        .panel-item {
          border-radius: 3px;
          flex-basis: 100%;
          flex-grow: 1;
          margin: 5px;
          padding: 15px;
          position: relative;
        }
        .panel-item--large .panel-item__label {
          opacity: 0.6;
        }
        .panel-item--large .panel-item__value {
          font-size: 1.8em;
        }
        .panel-item--medium {
          margin: 3px;
          padding: 7px 15px;
        }
        .panel-item--medium .panel-item__label {
          opacity: 0.6;
        }
        .panel-item--medium .panel-item__value {
          font-size: 1.4em;
        }
        .panel-item--small {
          display: flex;
          justify-content: space-between;
          margin: 2px;
          padding: 5px 15px;
        }
        .panel-item--small .panel-item__label {
          opacity: 0.6;
        }
        .panel-item--small .panel-item__value {
          text-align: right;
        }
        .panel-item__conext {
          bottom: 0;
          font-size: 0.8;
          opacity: 0.6;
          padding: 15px;
          position: absolute;
          right: 0;
          text-align: right;
        }
        .panel-item__compare {
          color: rgba(107, 100, 99, 0.8);
        }
        .panel-item__compare-item {
          font-size: 0.7em;
        }
        .panel-item__compare--negative {
          color: rgba(138, 40, 32, 0.8);
        }
        .panel-item__compare--positive {
          color: rgba(63, 153, 98, 0.8);
        }
        .panel-item__description {
          display: none;
        }
        .panel-item__info-description-show {
          color: #fff;
          display: block;
          padding: 15px 95px 10px 10px;
          right: 10px;
          top: 10px;
        }
        .panel-item__info-description {
          background-color: #555;
          bottom: 0;
          cursor: pointer;
          display: inline-block;
          height: 100%;
          left: 0;
          opacity: 0.9;
          overflow: auto;
          position: fixed;
          right: 0;
          top: 0;
          transition: 0.3s ease;
          visibility: hidden;
          width: 100%;
          z-index: 100;
        }
        .panel-item__info-description-text {
          display: block;
          font-size: smaller;
        }
        .panel-item__info-icon {
          align-items: center;
          border: 0;
          -moz-box-align: center;
          -webkit-box-align: center; 
          box-sizing: border-box;
          display: inline-flex;
          flex-shrink: 0;
          font-size: 100%;
          font-stretch: inherit;
          font-style: inherit;
          font-variant: inherit;
          font-weight: inherit;
          height: 1.125rem;
          line-height: inherit;
          margin: 0;
          padding: 0;
          vertical-align: baseline;
          width: 1.125rem;
        }
        .panel-item__icon-close {
          align-items: center;
          border: 0;
          bottom: 12px;
          -moz-box-align: center;
          -webkit-box-align: center; 
          box-sizing: border-box;
          display: inline-flex;
          flex-shrink: 0;
          float: left;
          font-size: 100%;
          font-stretch: inherit;
          font-style: inherit;
          font-variant: inherit;
          font-weight: inherit;
          line-height: inherit;
          margin: 0;
          overflow: hidden;
          padding: 0;
          position: absolute;
          right: 10px;
          vertical-align: baseline;
        }
        .panel-item__info {
          display: inline-block;
          position: relative;
        }
        
      </style>
    `;

    // Create a container element to let us center the text.
    var container = element.appendChild(document.createElement("div"));
    container.className = "panel-container panel-container--horizontal";

    // Create an element to contain the text.
    this._container = container;

  },
  // Render in response to the data or settings changing
  updateAsync: function (data, element, config, queryResponse, details, done) {

    // Clear any errors from previous updates
    this.clearErrors();
    results = []
    excludeList = []

    viz_log(config);
    viz_log(queryResponse);
    viz_log(data);

    // Grab the first cell of the data
    let firstRow = data[0];
    let secondRow = data[1];

    addMeasures(queryResponse.fields.measures)
    //var firstCell = firstRow[queryResponse.fields.dimensions[0].name];

    if (queryResponse.fields.table_calculations) {
      addMeasures(queryResponse.fields.table_calculations)
    }
    if (queryResponse.fields.pivots.length > 0) {
      addPivots(data[0])
      firstRow = flatData(data[0])
      secondRow = flatData(data[1])
    }

    var elements = '';
    if (config['orientation'] == "horizontal") {
      this._container.className = "panel-container panel-container--horizontal";
    }
    if (config['orientation'] == "vertical") {
      this._container.className = "panel-container panel-container--vertical";
    }


    results.forEach((field, index) => {
      if (config[`referenceField_${field.name}`]) {
        excludeList[config[`referenceField_${field.name}`]] = true;
      }
    })
    viz_log('results');
    viz_log(results);
    viz_log(excludeList);

    results.forEach((field, index) => {
      if (!excludeList[`${field.name}`]) {

        const label = config[`label_${field.name}`] ? config[`label_${field.name}`] : field.label;
        const size = config[`size_${field.name}`] ? config[`size_${field.name}`] : 'large';
        const comparisonOption = config[`comparison_${field.name}`] ? config[`comparison_${field.name}`] : false;
        const valueFormat = config[`valueFormat_${field.name}`] ? config[`valueFormat_${field.name}`] : false;

        const comparisonClassPositive = config[`comparisonNegate_${field.name}`] ? 'negative' : 'positive';
        const comparisonClassNegative = config[`comparisonNegate_${field.name}`] ? 'positive' : 'negative';

        const description = config[`description_${field.name}`] ? config[`description_${field.name}`] : '';
        var comparisonElem = '';
        if (comparisonOption && comparisonOption == 'percentage') {
          if (secondRow && secondRow[field.name].value) {
            const comparison = Math.floor(((firstRow[field.name].value - secondRow[field.name].value) / secondRow[field.name].value) * 100)
            if (comparison >= 0) {
              comparisonElem = `
                <div class="panel-item__compare panel-item__compare--${comparisonClassPositive}">
                  <span class="panel-item__compare-item">▲</span> ${comparison}%
                </div>`
            }
            if (comparison < 0) {
              comparisonElem = `
                <div class="panel-item__compare panel-item__compare--${comparisonClassNegative}">
                  <span class="panel-item__compare-item">▼</span> ${comparison}%
                </div>`
            }
          }
        }


        // REFERENCE VALUE 
        let referenceElem = ""

        if (size != "small" && config[`referenceField_${field.name}`]) {
          const refIndex = results.findIndex(x => x.name === config[`referenceField_${field.name}`]);
          const ref = results[refIndex]
          if (ref) {
            const refValue = `${LookerCharts.Utils.htmlForCell(firstRow[ref.name])}`
            const refLabel = config[`referenceLabel_${field.name}`] ? config[`referenceLabel_${field.name}`] : ref.label;
            referenceElem = `<div class="panel-item__conext">
              <div class="panel-item__conext__label">${refLabel}</div>
              <div class="panel-item__conext__value">${refValue}</div>
            </div>`;
          }
        }


        var info = `<div class="panel-item__info" onclick="on(this)">
        <span class="panel-item__info-icon">
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"></path>
          </svg>
        </span>
        <div class="panel-item__description">
          ${description}
        </div>    
      </div>`;

        let value = firstRow[field.name].value
        let valFormatted = `${LookerCharts.Utils.htmlForCell(firstRow[field.name])}`

        if (valueFormat) {
          const locale = {
            "decimal": ",",
            "thousands": ".",
            "grouping": [
              3
            ],
            "currency": [
              "",
              " €"
            ]
          };

          const formatString = (valueFormat.match(/(?:"[^"]*"$)/)) ? valueFormat.match(/(?:"[^"]*"$)/)[0].replace(/"/g, "") : ""
          viz_log(`formatString: ${formatString}`)
          let formatClean = valueFormat.replace(/(?:"[^"]*"*$)/, "").replace(/ /g, "")
          viz_log(`formatClean: ${formatClean}`)
          if (formatClean.slice(-1) == ",") {
            value = value / 1000
            formatClean = formatClean.slice(0, -1);
          }
          if (formatClean.slice(-1) == ",") {
            value = value / 1000
            formatClean = formatClean.slice(0, -1);
          }

          let format = "";
          switch (formatClean.charAt(0)) {
            case "$":
              format += "$";
              break;
            case "£":
              format += "£";
              break;
            case "€":
              format += "€";
              break;
          }
          if (formatClean.indexOf(",") > -1) {
            format += ",";
          }
          const splitValueFormat = formatClean.split(".");
          format += ".";
          format += splitValueFormat.length > 1 ? splitValueFormat[1].length : 0;

          switch (formatClean.slice(-1)) {
            case "%":
              format += "%";
              break;
            case "0":
              format += "f";
              break;
          }

          viz_log(`format: ${format}`)

          const devider = (valueFormat.match(/,/g) || []).length
          d3.formatDefaultLocale(locale);

          const f = d3.format(format);
          viz_log(`value: ${value}`)
          valFormatted = `${f(value)}  ${formatString}`
        }

        if (description && description != '') {
          var elem = ` 
            <div
              class="panel-item panel-item--${size}"
              style="background-color: ${config[`color_${field.name}`]};"
            >
            <div class="panel-item__label">${label} ${info}</div>
            <div class="panel-item__value">${valFormatted}</div>
            ${comparisonElem}
            ${referenceElem}
          </div>
          `;
        } else {
          var elem = ` 
            <div
              class="panel-item panel-item--${size}"
              style="background-color: ${config[`color_${field.name}`]};"
            >
              <div class="panel-item__label">${label}</div>
              <div class="panel-item__value">${valFormatted}</div>
              ${comparisonElem}
              ${referenceElem}
            </div>
          `;
        }

        elements = elements + elem;

        viz_log(field.label)
        viz_log(index)
      }
    })
    this.trigger('registerOptions', getOptions());

    var layer = `
    <div class="panel-item__info-description" id="panel-item__info-description-layer">
      <span onclick="off()" class="panel-item__icon-close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z" fill="white"/>
          <path d="M16.0707 8.87642L16.1414 8.80571L16.0707 8.735L15.265 7.92929L15.1943 7.85858L15.1236 7.92929L12 11.0529L8.87642 7.92929L8.80571 7.85858L8.735 7.92929L7.92929 8.735L7.85858 8.80571L7.92929 8.87642L11.0529 12L7.92929 15.1236L7.85858 15.1943L7.92929 15.265L8.735 16.0707L8.80571 16.1414L8.87642 16.0707L12 12.9471L15.1236 16.0707L15.1943 16.1414L15.265 16.0707L16.0707 15.265L16.1414 15.1943L16.0707 15.1236L12.9471 12L16.0707 8.87642Z" fill="#969A9D" stroke="#969A9D" stroke-width="0.2"/>
          <circle cx="12" cy="12" r="8.4" stroke="#969A9D" stroke-width="1.2"/>
        </svg>
      </span>
    </div>
    `;

    elements = elements + layer;

    this._container.innerHTML = elements
    done()
  }
});
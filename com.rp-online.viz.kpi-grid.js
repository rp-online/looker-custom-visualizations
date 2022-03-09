/* viz_name: rpm_grid */

const secondValueOptions = fields => {
  let valueOptions = [ {"Select Second Value": "none" }];
  fields.table_calculations.forEach((field, index) => {
      const { label, name } = field;
      const option_id = `seconvalueoption_${name}`;
      valueOptions.push({
        name :  label
      })
      
  })
  console.log('Value Options:');
  console.log(valueOptions);
  return valueOptions;
  
}
const addOptionCustomLabels = fields => {
  fields.measures.forEach((field, index) => {
    const { label, name } = field;
    const cl = `label_${name}`;
    options[cl] = {
      display: 'text',
      placeholder: `${label}`,
      label: `${label} - Label: `,
      section: 'Series',
      type: 'string',
    };
  })
  fields.measures.forEach((field, index) => {
    const { label, name } = field;
    const cl = `color_${name}`;
    options[cl] = {
      display: 'color',
      label: `${label} - Color: `,
      default: "#3A4245",
      section: 'Series',
      type: 'string',
      order: 0,
      display_size: 'half'
    };
  })
  fields.measures.forEach((field, index) => {
    const { label, name } = field;
    const cl = `secondvalue_${name}`;
    options[cl] = {
      display: 'select',
      label: `${label} - Second Value: `,
      values: secondValueOptions(fields),
      default: "none",
      section: 'Series',
      type: 'string'

    };
  })
  fields.measures.forEach((field, index) => {
    const { label, name } = field;
    const cl = `size_${name}`;
    options[cl] = {
      display: 'select',
      label: `${label} - Size: `,
      values: [
          {"Large": "large"},
          {"Medium": "medium"},
          {"Small": "small"}
        ],
      default: "large",
      section: 'Series',
      type: 'string'
    };
  })

}
let options = {
      orientation: {
        label: "Orientation",
        type: 'string',
        section: 'Style',
        display: 'select',
        values: [
          {'Vertical': 'vertical'},
          {'Horizontal': 'horizontal'}
        ],
        default: 'vertical',
        order: 0,
        display_size: 'half'
      },
      font_size: {
        type: "string",
        label: "Font Size",
        values: [
          {"Large": "large"},
          {"Small": "small"}
        ],
        display: "radio",
        default: "large"
      },
        y_axis_label_font_size: {
        label: "Y Axis Label Size",
        section: "Labels",
        type: "number",
        display: "text",
        default: 12,
        display_size: "half",
        order: 17,
      },
      showFullFieldName: {
        default: false,
        label: 'Show Full Field Name',
        order: 2,
        section: 'Series',
        type: 'boolean',
      },
    };

looker.plugins.visualizations.add({
    // Id and Label are legacy properties that no longer have any function besides documenting
    // what the visualization used to have. The properties are now set via the manifest
    // form within the admin/visualizations page of Looker
    id: "hello_world",
    label: "Hello World",
    options,
    // Set up the initial state of the visualization
    create: function(element, config) {
  
      // Insert a <style> tag with some styles we'll use later.
      element.innerHTML = `
      
        <style>


body {
            font-family: "Google Sans", Roboto, "Noto Sans JP", "Noto Sans", "Noto Sans CJK KR", Helvetica, Arial, sans-serif;

    "Noto Sans Arabic UI", "Noto Sans Devanagari UI", "Noto Sans Hebrew",
    "Noto Sans Thai UI", Helvetica, Arial, sans-serif;
}

a { color: #000; text-decoration:none; }
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
  flex-grow: 1;

  flex-basis: 100%;
  margin: 5px; /* and that, will result in a 10px gap */
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
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 15px;
  text-align: right;
  font-size: 0.8;
  opacity: 0.6;
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

        </style>
      `;
  
      // Create a container element to let us center the text.
      var container = element.appendChild(document.createElement("div"));
      container.className = "panel-container panel-container--horizontal";
  
      // Create an element to contain the text.
      this._container = container;
  
    },
    // Render in response to the data or settings changing
    updateAsync: function(data, element, config, queryResponse, details, done) {
  
      // Clear any errors from previous updates
      this.clearErrors();
  

      console.log(config);  
      console.log(queryResponse);  
   
      // Grab the first cell of the data
      var firstRow = data[0];
      var secondRow = data[1];
      var firstCell = firstRow[queryResponse.fields.dimensions[0].name];
  
      const measures = queryResponse.fields.measures;
      var elements = '';
      if( config['orientation'] == 'horizontal'){
        this._container.className = "panel-container panel-container--horizontal";
      }
      if( config['orientation'] == 'vertical'){
        this._container.className = "panel-container panel-container--vertical";
      }

      measures.forEach((field, index) => {
      
        const label = config[`label_${field.name}`] ?  config[`label_${field.name}`]  : field.label;
        const size = config[`size_${field.name}`] ?  config[`size_${field.name}`]  : 'large';
        var comparisionElem = '';
        if(secondRow && secondRow[field.name].value){
          const comparision = Math.floor(((firstRow[field.name].value-secondRow[field.name].value)/secondRow[field.name].value)*100)
          if(comparision >= 0){
                  comparisionElem = `          <div class="panel-item__compare panel-item__compare--positive">
              <span class="panel-item__compare-item">▲</span> ${comparision}%
            </div>` 
          }
          if(comparision < 0){
                  comparisionElem = `          <div class="panel-item__compare panel-item__compare--negative ">
              <span class="panel-item__compare-item">▼</span> ${comparision}%
            </div>` 
          }
  
        }
        
        var elem = ` 
                <div
          class="panel-item panel-item--${size}"
          style="background-color: ${config[`color_${field.name}`]};"
        >
          <div class="panel-item__label">${label}</div>
          <div class="panel-item__value">${LookerCharts.Utils.htmlForCell(firstRow[field.name])}</div>
          ${comparisionElem}
        </div>
        `;
        elements = elements+elem;

          addOptionCustomLabels(queryResponse.fields);
    
        this.trigger('registerOptions', options);

        console.log(field.label)
        console.log(index)
      })
      
      this._container.innerHTML = elements
      // Insert the data into the page
     // this._textElement.innerHTML = 'value:'+LookerCharts.Utils.htmlForCell(firstCell);
  
      done()
    }
  });
  
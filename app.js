const express = require('express'); //web server
const _ = require('lodash');      //camelCase
const bodyParser = require('body-parser'); //parser for json
const axios = require('axios'); //fetch external json (from API)

// App setup
const app = express();
const PORT = 8080;
const DATA_URL = 'https://app-media.noloco.app/noloco/dublin-bikes.json';

app.use(bodyParser.json());

// Data Types
function dataType(dataValues){
  const nonNullValues = dataValues.filter(v=>v!==null && v!==undefined &&v!==''); //not null,not undefined,not empty
  if(!nonNullValues.length) return 'TEXT';
  
  const isBoolean = nonNullValues.every(v => typeof v ==='boolean' || v==='true' || v==='false'); // identify bools
  if(isBoolean) return 'BOOLEAN';

  const isInt = nonNullValues.every(v=>Number.isInteger(Number(v))); //if int, return int
  if(isInt) return  'INTEGER';

  const isFloat = nonNullValues.every(v=> !isNaN(v) && v.toString().match(/^-?\d*(\.\d+)?$/)); //match float regex
  if(isFloat) return 'FLOAT';
  
  const isDate = nonNullValues.every(v=> !isNaN(Date.parse(v))); //NaN check for date
  if(isDate) return 'DATE';

  const unique = [...new Set(nonNullValues)]; //finite set of text vals
  if(unique.length<=10) return 'OPTION';  
  
  return 'TEXT';
}

// Fetch data from UrL with Axios
async function fetchFromURL(){
  const response = await axios.get(DATA_URL); //get data from the URL
  return response.data;
}

// Create schema from fetched data
function createSchema(data){
  const schema = []; //initialise to empty

  const fields = Object.keys(data[0]); //get keys from first object in array
  fields.forEach(field=>{
    const values = data.map(item=>item[field]); //get all values for that field
    const type = dataType(values); //determine type

    const fieldObject = {
      display: field,
      name: _.camelCase(field), //convert to camelCase
      type,
      options: type==='OPTION' ? [...new Set(values.filter(v=>v!==null && v!==undefined && v!==''))] : undefined //set options if type is OPTION
    }
    schema.push(fieldObject); //add field object to schema
  });
  return schema;
}

// Normalise bad data with schema
function normal(row, schema){
  const normalRow = {};
  schema.forEach(field=>{
    normalRow[field.name] = row[field.display] !== undefined ? row[field.display] : null; //map display name to camelCase or null
  });
  return normalRow;
}

// Filtering Function
function filter(data,query){
  if(!query) return data; //no filter applied

  return data.filter(row=>{
    return Object.entries(query).every(([fieldName,condition])=>{
      const value = row[fieldName];
      if(condition.eq !== undefined) return value === condition.eq; // = condition
      if(condition.gt !== undefined) return value > condition.gt;           // > condition
      if(condition.gte !== undefined) return value >= condition.gte;        // >= condition
      if(condition.lt !== undefined) return value < condition.lt;           // < condition
      if(condition.lte!== undefined) return value <= condition.lte;        // <= condition
      return true;
    });
  });
}

// Default Handler (debug purposes)
app.get('/', (request, response) => {
  response.send('Dublin Bikes API is running. Use /schema and /data endpoints.');
});

// GET Request Handler
app.get('/schema', async (request, response) => {
  const data = await fetchFromURL(); //fetch data
  const schema = createSchema(data); //create schema
  response.json(schema); //send schema as json response
});

// POST Request Handler
app.post('/data', async (request, response) => {
  const data = await fetchFromURL(); //fetch data
  const schema =  createSchema(data); //create schema
  const normalData = data.map(row => normal(row, schema)); //normalise data
  const filteredData = filter(normalData, request.body.where); //apply filtering
  response.json(filteredData); //send filtered data as json response
});

// Another Endpoint for practice for technical interview - add pagination in /data
app.post('/dataWithPagination', async (request,response)=>{
  const data = await fetchFromURL(); //fetch data
  const schema =  createSchema(data); //create schema
  const normalData = data.map(row => normal(row, schema)); //normalise data
  const filteredData = filter(normalData, request.body.where); //apply filtering
  const {limit,offset} = request.body;  // return up to Limit rows
  const start=offset||0;                // skip the first Offset rows that match
  const end= limit?start+limit:filteredData.length; // define end as limit or start+limit
  const paginated = filteredData.slice(start,end);  // take filters data as a slice of start and end
  response.json(paginated);
});

// Another Endpoint for practice for technical interview - add basic sorting in /data
app.post('/dataWithBasicSorting', async(request,response)=>{
  const data = await fetchFromURL(); //fetch data
  const schema =  createSchema(data); //create schema
  const normalData = data.map(row => normal(row, schema)); //normalise data
  const filteredData = filter(normalData, request.body.where); //apply filtering
  const {orderBy, direction} = request.body;  // orderBy=fieldname to sort on and direction (ascending/descending)
  let result = filteredData;
  if(orderBy){      // if there is a field name to sort on, use it
    result = _.orderBy(result,[orderBy],[direction || 'asc']) // if no direction, default to ascending
  }
  response.json(result);
});

// Another Endpoint for practice for technical interview - return number of rows
app.get('/count', async (request,response)=>{
  const data =  await fetchFromURL();
  const schema = createSchema(data)
  const normalData = data.map(row => normal(row, schema));
  response.json(normalData.length);
});

// Another Endpoint for practice for technical interview - return number of rows while a WHERE clause is applied
app.post('/countWithFilter', async(request,response)=>{
  const data = await fetchFromURL();
  const schema = createSchema(data);
  const normalData = data.map(row=>normal(row,schema));
  const filteredData = filter(normalData, request.body.where);
  response.json(filteredData.length);
});

// Another Endpoint for practice for technical interview - return unique values for a given field
app.get('/distinct/:field', async(request,response)=>{
  const data = await fetchFromURL();
  const schema = createSchema(data);
  const normalData = data.map(row=>normal(row,schema));

  const fieldName = request.params.field;
  const values = normalData.map(row=>row[fieldName]).filter(v=>v!==null && v!==undefined &&v!=='');
  const unique = [...new Set(values)];
  response.json(unique);
});

// Call app
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
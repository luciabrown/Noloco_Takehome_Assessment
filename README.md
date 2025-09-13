# This is a project as part of a 3hr Take-Home Assessment as part of the interview process for the role of Software Engineering Intern at Noloco

## How to Run in terminal:
- ``npm init -y  ``
- ``npm install express axios lodash body-parser  ``
- ``node app.js  ``
- Open http://localhost:8080/ in browser

## How to test API endpoints with curl (I personally use Postman - please see video uploaded as part of my submission):

``curl http://localhost:8080/schema``

``curl -X POST http://localhost:8080/data \``  
  ``-H "Content-Type: application/json" \``  
  ``-d '{"where": {"availableBikes": {"gt": 5}}}'``  

``curl -X POST http://localhost:8080/data \`` 
  ``-H "Content-Type: application/json" \`` 
  ``-d '{}'`` 

## Overview:
- I would have liked to have added more documentation to describe the application and its purpose i.e. what the goal of each of the methods are.
- To mitigate the above, I have tried my best to use very descriptive variable names and comments throughout. e.g. "request" and "response" instead of "req","res".
- Much of the allocated time was spent familiarising myself with the setup and structure of Node.js, as my previous API experience is with Python's requests import.
- Time was also spent debugging the /schema endpoint not showing the fetched data.
- If I had to create my own functionality for improvements, I would have added a method to locally cache the responses of previously requested WHERE queries for a faster reponse.
- As there are several imports, I would like to have included a dependencies.txt file or some other method of auto-invoking the required dependencies.
- I think improvements could have been made to the modularity of the code, such as using a separate file/folder for the data cleanse operations vs. the endpoint operations.
- The optional features from the specification "Support querying by multiple fields at the same time in the /data  endpoint" has been included.

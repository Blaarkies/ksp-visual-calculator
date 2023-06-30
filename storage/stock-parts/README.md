### KSP Parts Detail Extractor
## **Parses KSP SFS files into JSON format**
 
Part selection in KSP Visual Calculator require details such as: 
- Electricity production from solar panels
- Fuel production from ISRU converters
- Electricity draw from ISRU converters
- Heat generation/dissipation from radiators

<br>

This is solved with the following steps:
* Provide the KSP game's root folder path
* Read all part files in the `./GameData/Squad/Parts` directory
* Parse these files for part info
* Filter unnecessary parts (i.e. wings, struts, parachutes)
* Output a json file containing concise information on each part

## Usage
* Run `npm run create-parts-for-isru-widget` using NodeJS, or similar javascript application
* Configure the extractor
  * Provide the KSP game path
  * Choose output format mode
  * Define filters
* Run Extractor
* View the `./dist` folder for results
  
Please add any issues in this repo regarding this script

### KSP Parts Detail Extractor
## **Parses KSP SFS format into JSON format**
The sfs (squad file format) is commonly found in .cfg part files, and various others.
 
Part selection in the KSP Visual Calculator requires part details: 
- Electricity production from solar panels
- Fuel production from ISRU converters
- Electricity draw from ISRU converters
- Heat generation/dissipation from radiators

<br>

This is how this script solves the issue
* Provide the KSP game's root folder path
* Read all part files from the `./GameData/Squad/Parts` directory
* Parse these files for part info
* Filter unnecessary parts (i.e. wings, struts, parachutes)
* Output a json file containing concise information on each part

## Usage
* Run `npm run create-parts-for-isru-widget` using [NodeJS](https://nodejs.org/en/download), or similar javascript environment
* A console output will display a menu selection system
* This helps to configure the extractor
  * Provide the KSP game path
  * Choose output format mode
  * Define filters
* Run Extractor
* View the `./dist` folder for results

Similar jobs can be created by following the contents of the `create-parts-for-isru-widget.ts` file, 
and duplicating/modifying to meet your needs.
  
Please add any issues in this repo regarding this script


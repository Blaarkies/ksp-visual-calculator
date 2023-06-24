### KSP Parts Detail Extractor
## **Parses KSP SFS files into JSON format**
 
Problem statement:
* Part selection in KSP Visual Calculator needs details such as: 
  - Electricity production from solar panels
  - Fuel production from ISRU converters
  - Electricity draw from ISRU converters
  - Heat generation/dissipation from radiators
   
Solution script:
* Provide the KSP game's root folder path
* Read all part files in the `./GameData/Squad/Parts` directory
* Parse these files for part info
* Filter unnecessary parts (i.e. wings, struts, parachutes)
* Output a json file containing concise information on each part

## How to use
* Run `extract-part-properties.ts` using NodeJS, or similar javascript application
* Provide the KSP path when prompted
* Wait for completion
* Look in the `dist` folder
  
Please add any issues in this repo regarding this script

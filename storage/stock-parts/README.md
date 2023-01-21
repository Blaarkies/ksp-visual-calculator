### KSP Vanilla Parts Detail Extractor
## **Compile a json list of ksp vehicle parts**
 
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
* Filter unnecessary parts, like wings, struts, parachutes, etc.
* Output a json file containing concise information on each part

## How to use
* Run `extract-part-properties.ts` using NodeJS, or similar javascript application
* Provide the KSP path when prompted
* Wait for completion
* Look in the `output` folder
  
Please add any issues in this repo regarding this script

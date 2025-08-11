const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

import {configPath} from './main'

/**
 * Creates a new folder.
 * @param {string} folderPath - The path of the folder to create.
 */
export function createFolder(folderPath) {
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true }); // Ensures nested directories are created
      console.log('Folder created successfully:', folderPath);
    } else {
      console.log('Folder already exists:', folderPath);
    }
  } catch (error) {
    console.error('Error creating folder:', error);
  }
}

// Define default parameters
const defaultConfig = {
  apiKEY: "NEED_YOUR_API_KEY",
  apiURL: "NEED_YOUR_API_URL",
  MODEL: "NEED_YOUR_MODEL",
  summaryModule: "",
};

export function ensureConfigFile() {
  const config_file = path.join(configPath, 'config.yml')
  try {
    if (!fs.existsSync(config_file)) {
      console.log('Config file not found. Creating a new one...');
      const yamlContent = yaml.dump(defaultConfig);
      fs.writeFileSync(config_file, yamlContent, 'utf8');
      console.log('Config file created successfully.');
    } else {
      console.log('Config file exists:', config_file);
    }
  } catch (error) {
    console.error('Error ensuring config file:', error);
  }
}

export function ensurePatientForlder(patient) {
  const patient_folder = path.join(configPath, "info/"+patient)
  try {
    if (!fs.existsSync(patient_folder)) {
      console.log('Patient folder not found. Creating a new one...');
      createFolder(patient_folder);
      console.log('Patient folder created successfully.');
    } else {
      // console.log('Patient folder exists:', patient_folder);
    }
  } catch (error) {
    console.error('Error ensuring patient folder:', error);
  }
}

export function ensureHistoryFile(patient) {
  ensurePatientForlder(patient);
  const history_file = path.join(configPath, 'info/'+patient+'/history.json')
  try {
    if (!fs.existsSync(history_file)) {
      console.log('History file not found. Creating a new one...');
      const historyContent = JSON.stringify({});
      fs.writeFileSync(history_file, historyContent, 'utf8');
      console.log('History file created successfully.');
    } else {
      // console.log('History file exists:', history_file);
    }
  } catch (error) {
    console.error('Error ensuring history file:', error);
  }
}

export function ensureReportFile(patient) {
  ensurePatientForlder(patient);
  const report_file = path.join(configPath, 'info/'+patient+'/report.json')
  try {
    if (!fs.existsSync(report_file)) {
      console.log('Report file not found. Creating a new one...');
      const reportContent = JSON.stringify({"rawReport":"","summary":""});
      fs.writeFileSync(report_file, reportContent, 'utf8');
      console.log('Report file created successfully.');
    } else {
      // console.log('Report file exists:', report_file);
    }
  } catch (error) {
    console.error('Error ensuring report file:', error);
  }
}
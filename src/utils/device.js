// src/utils/device.js
import { v4 as uuidv4 } from 'uuid';

export const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  
  // If no deviceId exists, generate one and store it
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('deviceId', deviceId);
  }
  
  return deviceId;
};

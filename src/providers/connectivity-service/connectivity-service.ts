import {Injectable} from '@angular/core';
import {Network} from 'ionic-native';


@Injectable()
export class ConnectivityService {
	isConnected: boolean = navigator.onLine;

  constructor() {

	  Network.onDisconnect().subscribe(() => {
		  this.isConnected = false;
	  });

	  Network.onConnect().subscribe(() => {
		  // needs a couple of seconds before we use it
		  setTimeout(() => {
			  this.isConnected = true; 
		  }, 3000);
		  
	  });
	  
	  // allow us to be always online in dev
	  if (window.location.href.startsWith('http://localhost:8100/')) {
		  this.isConnected = true;
	  }
  }

  /**
   * are we online?
   */
  isOnline() {
	  if (window.location.href.startsWith('http://localhost:8100/')) {
		  return true;
	  }
	  
	  return this.isConnected;
  }
  
  /**
   * are we offline?
   */
  isOffline(){
	  if (window.location.href.startsWith('http://localhost:8100/')) {
		  return false;
	  }
	  
	  return !this.isConnected;
  }
}


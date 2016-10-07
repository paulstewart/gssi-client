/**
 * Don't forget the server must be configured to accept these headers
 * 
 * Header always set Access-Control-Allow-Origin "*"
 * Header always set Access-Control-Allow-Headers: "X-Elgg-apikey, X-Elgg-time, X-Elgg-nonce, X-Elgg-hmac, X-Elgg-hmac-algo, X-Elgg-posthash, X-Elgg-posthash-algo, Content-Length, Content-Type"
 * Header always set Access-Control-Allow-Methods "POST, GET, OPTIONS"
 */

import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Platform, Events} from 'ionic-angular';
import Moment from 'moment';
import 'rxjs/add/operator/map';
import CryptoJS from 'crypto-js';
import {ConnectivityService} from '../../providers/connectivity-service/connectivity-service';

@Injectable()
export class ElggAPI {
	
	// note that there's really no good way to store secret keys in ionic
	// or apps in general, therefore the communication isn't entirely secure
	// it's just very inconvenient
	endpoint: string = 'http://gssi.localhost:8080/services/api/rest/json';
	ios_pubkey: string = '';
	ios_secret: string = '';
	android_pubkey: string = '';
	android_secret: string = '';
	pubkey: string = 'd625f3796580034ec7f64570861bfcf8084d28c5';
	secret: string = 'bff0ddeb60500f0497eea7ccce3aac29e091845a';


  constructor(
		  public http: Http,
		  public platform: Platform,
		  public connectivity: ConnectivityService,
		  public events: Events
		  ) {

	  // set our keys based on the OS type
	  this.pubkey = this.ios_pubkey;
	  this.secret = this.ios_secret;
	  this.platform.ready().then(() => {
                if (this.platform.is('android')) {
//	    	  this.pubkey = this.android_pubkey;
//	    	  this.secret = this.android_secret;
                }
	  });

  }

  /**
   * Call any ElggAPI via GET
   */
  get(method: string, data: any = {}): Promise<any> {
	  return new Promise(
		(resolve, reject) => {
			
			if (this.connectivity.isOffline()) {
				let err = {
					status: -1,
					message: 'ErrorConnectivity'
				};
				
				reject(err);
				return;
			}

			data.method = method;
			
			//@TODO - this handles simple key:value pairs
			//any deeper data structures we need to worry about?
			let params = Object.keys(data).map(function(k) {
				if (typeof k !== 'string') {
					k = JSON.stringify(k);
				}
			    return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
			}).join('&');
			
			let path = this.endpoint + '?' + params;		
			
			let _headers = this.getHeaders(params);
			
			this.http.get(path, {headers: _headers})
			.timeout(8000, new Error('Error:timeout_exceeded'))
	        .map(res => res.json())
	        .subscribe(
	        	(data) => {

	        		if (data.status === 0) {
	        			resolve(data.result);
	        			return;
	        		}
	        		
	        		if (data.hasOwnProperty('message') && data.message == 'pam_auth_userpass:failed') {
			    		   // we are no longer logged in
			    		   // lets broadcast an event
			    		   this.events.publish('Elgg:AuthFail');
			    	 }
	        	
	        		reject(data);
	        	},
	        	(error) => {
			       reject({status: -1, message: 'ElggAPIException'});
			    }
	        );
		}
	  );
  }
  
  /**
   * Call any ElggAPI via POST
   */
  post(method: string, data: any = {}): Promise<any> {
	  return new Promise(
		(resolve, reject) => {

			if (this.connectivity.isOffline()) {
				let err = {
					status: -1,
					message: 'ErrorConnectivity'
				};
				
				setTimeout(() => { reject(err); }, 500);
				return;
			}
			
			// note that auth_token must be passed as GET parameter
				
			//@TODO - this handles simple key:value pairs
			//any deeper data structures we need to worry about?
			let postVars = Object.keys(data).map(function(k) {
				if (typeof k !== 'string') {
					k = JSON.stringify(k);
				}
			    return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
			}).join('&');
			
			let getVars = 'method=' + method;
			let path = this.endpoint + '?' + getVars;		
					
			let _headers = this.getHeaders(getVars, postVars);

			this.http.post(path, postVars, {headers: _headers})
			   .timeout(8000, new Error('Error:timeout_exceeded'))
		       .map(res => res.json())
		       .subscribe(
		    	(data) => {

		    	   if (data.status === 0) {
		       			resolve(data.result);
		       			return;
		       		}
		    	   
		    	   if (data.hasOwnProperty('message') && data.message == 'pam_auth_userpass:failed') {
		    		   // we are no longer logged in
		    		   // lets broadcast an event
		    		   this.events.publish('Elgg:AuthFail');
		    	   }
			        	
		       		reject(data);
		       },
		       (error) => {
		    	   reject({status: -1, message: 'ElggAPIException'});
		       }
		       );
			}
	  );
  }
  
  /**
   * Get our signed headers
   */
  getHeaders(getVars: string = '', postVars: any = '') {
	  let elgg_time = Moment().unix() + ''; // needs to be a string
	  let elgg_nonce = this.createNonce(12);
	  let posthash = '';
	  
	  var hmac = CryptoJS.algo.HMAC;
	  hmac.init(CryptoJS.algo.SHA256, this.secret);

	  hmac.update(elgg_time);
	  hmac.update(elgg_nonce);
	  hmac.update(this.pubkey);
	  hmac.update(getVars); // get variables

	  if (postVars !== '') {
	  	posthash = CryptoJS.SHA256(postVars).toString(CryptoJS.enc.Hex)
	  	hmac.update(posthash);
	  }

	  let hash = hmac.finalize().toString(CryptoJS.enc.Base64);

	  let _headers = new Headers();
	  _headers.append('X-Elgg-apikey', this.pubkey);
	  _headers.append('X-Elgg-time', elgg_time);
	  _headers.append('X-Elgg-nonce', elgg_nonce);
	  _headers.append('X-Elgg-hmac-algo', 'sha256');
	  _headers.append('X-Elgg-hmac', encodeURIComponent(hash));
	  
	  if (postVars !== '') {
		  _headers.append('X-Elgg-posthash-algo', 'sha256');
		  _headers.append('X-Elgg-posthash', posthash);
		  _headers.append('Content-Type', 'application/x-www-form-urlencoded');
	  }
	  
	  return _headers;
  }
  
  /**
   * Create a random string
   */
  createNonce(length) {
	  var text = "";
	  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	  for (var i = 0; i < length; i++) {
		  text += possible.charAt(Math.floor(Math.random() * possible.length));
	  }
	  return text;
  }
}


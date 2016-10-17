import { Component } from '@angular/core';

import {TranslateService} from 'ng2-translate';
import { ElggAPI } from '../../providers/elgg-api/elgg-api';
//import { PDFDocument } from 'pdfkit';
//import { pdfMake } from 'pdfmake';


@Component({
  templateUrl: 'home.html'
})
export class HomePage {
  constructor(
        public translate: TranslateService,
        public elggAPI: ElggAPI
    ) {
    
  }
  
    callElgg(): void {
        console.log('calling elgg');
        console.log(this.elggAPI);
    
        let params = {"test":"test"};
        this.elggAPI.post('gssitest', params).then(
            (res) => {
                console.log('res');
                console.log(res);
            },
            (err) => {
                console.log('err');
                console.log(err);
            }
        );
    }
}

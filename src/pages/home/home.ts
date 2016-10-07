import { Component } from '@angular/core';

import {TranslateService} from 'ng2-translate';
import { ElggAPI } from '../../providers/elgg-api/elgg-api';

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
  }
  
}

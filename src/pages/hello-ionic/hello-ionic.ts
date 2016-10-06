import { Component } from '@angular/core';
import Moment from 'moment';


@Component({
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
  constructor() {
    console.log(Moment([2007, 0, 29]).fromNow()); console.log('yea');
  }
}

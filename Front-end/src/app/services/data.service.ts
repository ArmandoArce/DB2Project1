import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'

import { Dataset } from '../interfaces/dataset';

@Injectable({
  providedIn: 'root'
})

export class DataService{

  mongoURI = 'http://localhost:5000/api/datasets';

  constructor(private http: HttpClient) { }

 
 
}
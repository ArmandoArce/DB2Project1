import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {Router} from '@angular/router'
import { DataService } from 'src/app/services/data.service';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-dataset-form',
  templateUrl: './dataset-form.component.html',
  styleUrls: ['./dataset-form.component.scss']
})
export class DatasetFormComponent {

  constructor(private dataService: DataService, private router: Router) { }

  
  images: any =[];
  allfile: File[] =[];
  selectedDate: string = new Date().toISOString().substring(0, 10);

  ngOnInit() {
    this.UploadPhoto();
    console.log(this.selectedDate);

  }

onFileSelected(event:any){
  const files = event.target.files;

  for (let i = 0; i <files.length; i++) {
    const image = {
      name: '',
      type: '',
      size: '',
      url: ''
    };
    this.allfile.push(<File>files[i]);

    image.name = files[i].name;
    image.type = files[i].type;
    image.size =files[i].size;
    
    const reader = new FileReader();

    reader.onload = (filedata) => {
    image.url = reader.result + '';
    this.images.push(image);
    console.log(image.type);
    };
    reader.readAsDataURL(files[i]);
  }
  event.srcElement.value = null;
}

UploadPhoto(){
  console.log("Hey")
}

}
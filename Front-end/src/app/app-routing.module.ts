import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatasetFormComponent } from './components/dataset-form/dataset-form.component';
import { DatasetsHomeComponent } from './components/datasets-home/datasets-home.component';
import { LoginComponent } from './components/login/login.component';
const routes: Routes = [
  {
    path: 'dataset/new',
    component:DatasetFormComponent
  },

  {
    path: 'dataset/home',
    component:DatasetsHomeComponent
  },
  { path: 'dataset/login', 
  component: LoginComponent },
  {
    path: '',
    redirectTo: 'dataset/home',
    pathMatch: 'full'
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Component, Input } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';

import { User } from '../../../user';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

import * as htmlToImage from 'html-to-image';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  registerForm: FormGroup = new FormGroup({});
  updateForm: FormGroup = new FormGroup({});

  private url = "https://server-ticket.onrender.com/tickets";

  data: any[] = [];

  isEditMode: boolean = false;
  isSubmitMode: boolean = true;

  First = '';
  Grade = '';
  Number = '';

  id = '';

  base64String: string = '';

  imageUrl: any;

  @Input()
  initialState: BehaviorSubject<User> = new BehaviorSubject({});

  constructor(private formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.group({
      first: '',
      last: '',
      dni: '',
      numberphone: '',
      grade: ''
    });
  }

  async onSubmit() {
    const { first, last, dni, numberphone, grade } = this.registerForm.value;
    if (this.isEditMode) {
      await this.updateData(this.id, first, last, dni, numberphone, grade);
      await this.fetchData();
      this.registerForm.reset();
      this.isEditMode = false;
      this.isSubmitMode = true;
    } else {
      await this.postData(first, last, dni, numberphone, grade);
      await this.fetchData();
      this.registerForm.reset();
    }
  }

  async ngOnInit() {
    await this.fetchData();
  }

  async postData(first: string, last: string, dni: string, numberphone: string, grade: string){
    await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        first,
        last,
        dni,
        numberphone,
        grade
      })
    });
  }

  async updateData(id: string, first: string, last: string, dni: string, numberphone: string, grade: string){
    await fetch(`${this.url}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        first,
        last,
        dni,
        numberphone,
        grade
      })
    });
  }

  async fetchData() {
    try {
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const data = await response.json();
      this.data = data;
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }

  openShow(row: any) {
    this.First = row.first;
    this.Grade = row.grade;
    this.Number = row.dni;
  }

  async deleteUser(id: any) {
    await fetch(`${this.url}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    await this.fetchData();

  }

  openEditForm(id: any) {
    this.isEditMode = true;
    this.isSubmitMode = false;
    this.id = id;
  }

  refresh(){
    this.registerForm.reset();
    this.isEditMode = false;
    this.isSubmitMode = true;
  }

  download(index: string) {
    var node:any = document.getElementById('ticket');
    htmlToImage.toPng(node)
      .then(function (dataUrl) {
        var link = document.createElement('a');
        link.download = `${index}`;
        link.href = dataUrl;
        link.click();

      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error);
      });
  }

}

import { Component, ElementRef, Input, Renderer2 } from '@angular/core';

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
  amount_index: any[] = [];

  value_index: any;

  isEditMode: boolean = false;
  isSubmitMode: boolean = true;

  First = '';
  Grade = '';
  Number = '';
  Amount = '';

  id = '';

  ID = '';
  NOMBRES = '';
  APELLIDOS = '';
  DNI = '';
  TELEFONO = '';
  GRADO = '';
  CANTIDAD = '';


  base64String: string = '';

  imageUrl: any;

  bgColor: string = 'dark';

  @Input()
  initialState: BehaviorSubject<User> = new BehaviorSubject({});

  constructor(private formBuilder: FormBuilder, private renderer: Renderer2, private elementRef: ElementRef) {
    this.registerForm = this.formBuilder.group({
      first: '',
      last: '',
      dni: '',
      numberphone: '',
      grade: '',
      amount: ''
    });
  }

  async onSubmit() {
    const { first, last, dni, numberphone, grade, amount } = this.registerForm.value;
    if (this.isEditMode) {
      await this.updateData(this.id, first, last, dni, numberphone, grade, amount);
      await this.fetchData();
      this.registerForm.reset();
      this.isEditMode = false;
      this.isSubmitMode = true;
    } else {
      await this.postData(first, last, dni, numberphone, grade, amount);
      await this.fetchData();
      this.registerForm.reset();
    }
  }

  async ngOnInit() {
    await this.fetchData();
  }

  async postData(first: string, last: string, dni: string, numberphone: string, grade: string, amount: string){
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
        grade,
        amount
      })
    });
  }

  async updateData(id: string, first: string, last: string, dni: string, numberphone: string, grade: string, amount: string){
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
        grade,
        amount
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

      this.amount_index = [];

      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < parseInt(data[i].amount); j++){
          this.amount_index.push(i);
        }
      }

      console.log(this.amount_index);

    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }

  openShow(row: any) {
    this.First = row.first;
    this.Grade = row.grade;
    this.Number = row.dni;
    this.Amount = row.amount
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
    let node:any = document.getElementById('ticket');
    htmlToImage.toPng(node)
      .then(function (dataUrl) {
        let link = document.createElement('a');
        link.download = `${index}`;
        link.href = dataUrl;
        link.click();

      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error);
      });
  }

  sortOut(){

      // repetir con el intervalo de 2 segundos
      let timerId = setInterval(() => {

        const all = this.elementRef.nativeElement.querySelectorAll(".all");

        all.forEach((item: HTMLElement) => {
          this.renderer.setStyle(item, 'background-color', 'green');
        });

        this.value_index = Math.floor(Math.random() * (this.amount_index.length - 0) + 0);

        const elements = this.elementRef.nativeElement.querySelectorAll(`.c${this.amount_index[this.value_index]}`);

        elements.forEach((element: HTMLElement) => {
          this.renderer.setStyle(element, 'background-color', 'red');
        });

      }, 300);

      // después de 5 segundos parar
      setTimeout(() => {
        clearInterval(timerId);
        const elements = this.elementRef.nativeElement.querySelectorAll(`.c${this.amount_index[this.value_index]}`);

        elements.forEach((element: HTMLElement) => {
          this.renderer.setStyle(element, 'background-color', 'red');
        });

        this.ID = this.amount_index[this.value_index];
        this.NOMBRES = this.data[this.amount_index[this.value_index]].first;
        this.APELLIDOS = this.data[this.amount_index[this.value_index]].last;
        this.DNI = this.data[this.amount_index[this.value_index]].dni;
        this.TELEFONO = this.data[this.amount_index[this.value_index]].numberphone;
        this.GRADO = this.data[this.amount_index[this.value_index]].grade;
        this.CANTIDAD = this.data[this.amount_index[this.value_index]].amount;

      }, 10000);
  }

}

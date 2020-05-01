import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Place } from 'src/app/places/place.model';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;
  @Input() selectedMode: 'select' | 'random';
  @ViewChild('f', {static:true}) form: NgForm;
  startDate: string;
  endDate: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    const availableFrom = new Date(this.selectedPlace.availableFrom);
    const availableTo = new Date(this.selectedPlace.availableTo);
    if (this.selectedMode == 'random') {
      this.startDate = new Date(
        availableFrom.getTime() + Math.random()*
          (availableTo.getTime() - 7*24*60*60*1000 - availableFrom.getTime()) 
      ).toISOString();
      this.endDate = new Date(
        new Date(this.startDate).getTime() + Math.random()*6*24*60*60*1000
      ).toISOString();
    }
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onBookPlace() {
    if (!this.form.valid || !this.datesValid) {
      return;
    }
    console.log(this.form.value);
    this.modalCtrl.dismiss({
      bookingData: {
        price: +this.form.value['price'],
        guestNumber: +this.form.value['guest-number'],
        startDate: new Date(this.form.value['date-from']),
        endDate: new Date(this.form.value['date-to']),
        firstName: this.form.value['first-name'],
        lastName: this.form.value['last-name'],
        email: this.form.value['email'],
        dateOfBirth: new Date(this.form.value['birthday']),
        location: this.form.value['location'],
        gender: this.form.value['gender']
    }}, 'confirm');
  }

  datesValid() {
    const startDate = new Date(this.form.value['date-from']);
    const endDate = new Date(this.form.value['date-to']);
    return endDate > startDate
  }
}

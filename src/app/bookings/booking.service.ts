import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';

import { Booking } from './booking.model';
import { AuthService } from '../auth/auth.service';
import { tokenName } from '@angular/compiler';

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
  price: number;
  email: string;
  location: string;
  gender: string;
  dateOfBirth: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
    private _bookings = new BehaviorSubject<Booking[]>([]);

    constructor(
        private authService: AuthService,
        private http: HttpClient
    ) {}

    get bookings() {
        return this._bookings.asObservable();
    }

    addBooking(
        placeId: string,
        placeTitle: string,
        placeImage: string,
        firstName: string,
        lastName: string,
        guestNumber: number,
        dateFrom: Date,
        dateTo: Date,
        price: number,
        email: string,
        dateOfBirth: Date,
        location: string,
        gender: string
    ){
        let generatedId: string;
        let newBooking: Booking;
        let fetchedUserId: string;
        return this.authService.userId.pipe(
            take(1), 
            switchMap(userId => {
                if (!userId) {
                    throw new Error('No user id found!');
                }
                fetchedUserId = userId;
                return this.authService.token;
            }),
            take(1),
            switchMap(token => {
                newBooking = new Booking(
                    Math.random().toString(),
                    placeId,
                    fetchedUserId,
                    placeTitle,
                    placeImage,
                    guestNumber,
                    dateFrom,
                    dateTo,
                    price,
                    firstName,
                    lastName,
                    email,
                    dateOfBirth,
                    location,
                    gender
                );
                return this.http.post<{name: string }>(
                    `https://ionic-angular-course-e842a.firebaseio.com/bookings.json?auth=${token}`,
                    { ...newBooking, id: null }
                )
        }),
        switchMap(resData => {
            generatedId = resData.name;
            return this.bookings;
        }),
        take(1),
        tap(bookings => {
            newBooking.id = generatedId;
            this._bookings.next(bookings.concat(newBooking));
        })
      );
    }

    cancelBooking(bookingId: string){
        return this.authService.token.pipe( 
            take(1),
            switchMap(token => {
                return this.http.delete(
                    `https://ionic-angular-course-e842a.firebaseio.com/bookings/${bookingId}.json?auth=${token}`
                )
            }),
            switchMap(() => {
                return this.bookings;
            }),
            take(1),
            tap(bookings => {
                this._bookings.next(bookings.filter(b => b.id !== bookingId));
            })
        );
    }

    fetchBookings() {
      let fetchedUserId: string;
      return this.authService.userId.pipe(
        switchMap(userId => {
            if (!userId) {
                throw new Error('User not found!');
            }
            fetchedUserId = userId;
            return this.authService.token;
        }),
        take(1),
        switchMap(token=> {
            return this.http.get<{[key: string]: BookingData }>(
                `https://ionic-angular-course-e842a.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${
                    fetchedUserId
                }"&auth=${token}`
            ); 
        }), 
        map(bookingData => {
            const bookings = [];
            for (const key in bookingData){
                if (bookingData.hasOwnProperty(key)) {
                    bookings.push(new Booking(
                        key,
                        bookingData[key].placeId,
                        bookingData[key].userId,
                        bookingData[key].placeTitle,
                        bookingData[key].placeImage,
                        bookingData[key].guestNumber,
                        new Date(bookingData[key].bookedFrom),
                        new Date(bookingData[key].bookedTo),
                        bookingData[key].price,
                        bookingData[key].firstName,
                        bookingData[key].lastName,
                        bookingData[key].email,
                        new Date(bookingData[key].dateOfBirth),
                        bookingData[key].location,
                        bookingData[key].gender
                    ));
                }
            }
            return bookings;
        }),
        take(1),
        tap(bookings => {
            this._bookings.next(bookings);
        })
      );
    }
}
export class Booking {
    constructor(
        public id: string,
        public placeId: string,
        public userId: string,
        public placeTitle: string,
        public placeImage: string,
        public guestNumber: number,
        public bookedFrom: Date,
        public bookedTo: Date,
        public price: number,
        public firstName: string,
        public lastName: string,
        public email: string,
        public dateOfBirth: Date,
        public location: string,
        public gender: string
    ) { }
}
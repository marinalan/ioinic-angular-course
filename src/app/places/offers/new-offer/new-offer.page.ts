import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { switchMap } from 'rxjs/operators';

import { PlacesService } from '../../places.service';
import { PlaceLocation } from '../../location.model';

function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

var dataURLtoBlob = function(dataurl) {
    var parts = dataurl.split(','), mime = parts[0].match(/:(.*?);/)[1]
    if(parts[0].indexOf('base64') !== -1) {
        var bstr = atob(parts[1]), n = bstr.length, u8arr = new Uint8Array(n)
        while(n--){
            u8arr[n] = bstr.charCodeAt(n)
        }

        return new Blob([u8arr], {type:mime})
    } else {
        var raw = decodeURIComponent(parts[1])
        return new Blob([raw], {type: mime})
    }
}

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]  
      }), 
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required] 
      }),
      location: new FormControl(null, {
        validators: [Validators.required] 
      }),
      image: new FormControl(null)
    });
  }

  onLocationPicked(location: PlaceLocation) {
    this.form.patchValue({location: location});
  }

  onImagePicked(imageData: string | File) {
    console.log('onImagePicked');
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        /*
        imageFile = base64toBlob(
          imageData.replace('data:image/jpeg;base64',''), 
          'image/jpeg'
        );
        */
       console.log('from onImagePicked');
       console.log(imageData);
       imageFile = dataURLtoBlob(imageData);  
      } catch(error) {
        /*DOMException: Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.
    at base64toBlob (http://localhost/new-offer-new-offer-module-es2015.js:136:28)
    at NewOfferPage.onImagePicked (http://localhost/new-offer-new-offer-module-es2015.js:193:29)
    */
        console.log(error);
        return;
      }
    } else {
      imageFile = imageData;
    }
    console.log(imageFile);
    this.form.patchValue({ image: imageFile });
  }

  onCreateOffer() {
    if (!this.form.valid || !this.form.get('image').value) {
      console.log('not valid', this.form);
      return;
    }
    console.log(this.form.value);
    this.loadingCtrl.create({
      message: 'Creating place...'
    }).then(loadingEl => {
      loadingEl.present();
      this.placesService
        .uploadImage(this.form.get('image').value)
        .pipe(
          switchMap(uploadRes => {
            return this.placesService.addPlace(
              this.form.value.title, 
              this.form.value.description,
              +this.form.value.price,
              new Date(this.form.value.dateFrom),
              new Date(this.form.value.dateTo),
              this.form.value.location,
              uploadRes.imageUrl
            );  
          })
      )
      .subscribe(() => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigate(['/places/tabs/offers']);
      });
    });
  }
}

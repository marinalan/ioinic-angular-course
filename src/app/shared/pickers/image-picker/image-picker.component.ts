import { 
  Component, 
  OnInit, 
  Output, 
  EventEmitter, 
  ViewChild, 
  ElementRef, 
  Input,
  SecurityContext } from '@angular/core';
import { Plugins, Capacitor, CameraSource, CameraResultType } from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from'@angular/platform-browser';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @ViewChild('filePicker', {static: false}) filePickerRef: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string | File>();
  @Input() showPreview = false;

  selectedImage: string;
  usePicker = false;

  constructor(
    private platform: Platform, 
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    console.log('Mobile:', this.platform.is('mobile'));
    console.log('Hybrid:', this.platform.is('hybrid'));
    console.log('iOS:', this.platform.is('ios'));
    console.log('Android:', this.platform.is('android'));
    console.log('Desktop:', this.platform.is('desktop'));

    if ((this.platform.is('mobile') && !this.platform.is('hybrid')) ||
        this.platform.is('desktop') ) {

      this.usePicker = true;
    }
  }

  onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera') || this.usePicker) {
      this.filePickerRef.nativeElement.click();
      return;
    }
    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      /*
      correctOrientation: true,
      height: 320,
      width: 200,
      */
      resultType: CameraResultType.DataUrl
    }).then(image => {
      //this.selectedImage = image.dataUrl; // .dataUrl; // base64Data
      this.selectedImage = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl)))
      console.log(this.selectedImage);
      console.log('from onPickImage');
      this.imagePick.emit(this.selectedImage);
    }).catch(error => {
      console.log(error);
      if (this.usePicker){
        this.filePickerRef.nativeElement.click();
      }
      return false;
    });
  }

 onFileChange (event) {
    console.log('onFileChange', event);
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
    };
    fr.readAsDataURL(pickedFile);


  }
}

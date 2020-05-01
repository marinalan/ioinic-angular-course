import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantPlaces: Place[];
  private filter = 'all';
  private placesSub: Subscription;
  isLoading = false;

  constructor(
    private placesService: PlacesService,
    private menuCtrl: MenuController,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.onFilterUpdate(this.filter);
    })
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.placesSub){
      this.placesSub.unsubscribe();
    }
  }
 
  onFilterUpdate(filter: string) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      const isShown = place=> {
        return filter === 'all' || 
              place.userId !== userId;
      };
      this.relevantPlaces = this.loadedPlaces.filter(isShown);
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
    this.filter = filter;
  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

}

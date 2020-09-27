import { Module } from '@nestjs/common';
import { CoffeeRatingService } from './coffee-rating.service';
import { CoffeesModule } from '../coffees/coffees.module';
import appConfig from 'src/config/app.config';

@Module({
  imports: [CoffeesModule],
  providers: [
    CoffeeRatingService,
    { provide: appConfig.KEY, useValue: appConfig },
  ],
  exports: [CoffeeRatingService, appConfig.KEY],
})
export class CoffeeRatingModule {}

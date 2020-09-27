import { Module, Injectable } from '@nestjs/common';
import { CoffesController } from './coffes.controller';
import { CoffeesService } from './coffees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from '../events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { Connection } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import appConfig from 'src/config/app.config';

Injectable();
export class CoffeeBrandsFactory {
  constructor(private readonly connection: Connection) {}

  async create(): Promise<string[]> {
    // const coffeeBrands = await connection.query('Select *...);
    const coffeeBrands = await Promise.resolve(['buddy brew', 'nescafe']);
    return coffeeBrands;
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Coffee, Flavor, Event]),
    // ConfigModule.forFeature(appConfig),
  ],
  controllers: [CoffesController],
  providers: [
    CoffeesService,
    CoffeeBrandsFactory,
    {
      provide: COFFEE_BRANDS,
      useFactory: (brandsFactory: CoffeeBrandsFactory) =>
        brandsFactory.create(),
      inject: [CoffeeBrandsFactory],
    },
  ],
  exports: [CoffeesService],
})
export class CoffeesModule {}

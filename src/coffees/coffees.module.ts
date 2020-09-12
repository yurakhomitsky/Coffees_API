import { Module } from '@nestjs/common';
import { CoffesController } from './coffes.controller';
import { CoffeesService } from './coffees.service';

@Module({
  controllers: [CoffesController],
  providers: [CoffeesService],
})
export class CoffeesModule {}

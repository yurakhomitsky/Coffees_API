import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';

@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'Shipwrect Roast',
      brand: 'Buddy Brew',
      flavors: ['chocolate', 'vanilla'],
    },
  ];

  findAll(): Coffee[] {
    return this.coffees;
  }

  findOne(id: number): Coffee {
    const coffee = this.coffees.find(coffee => coffee.id === id);
    if (!coffee) {
      // throw new HttpException(`Coffe #${id} not found`, HttpStatus.NOT_FOUND);
      throw new NotFoundException(`Coffe #${id} not found`);
    }
    return coffee;
  }

  create(createCoffeDto: any) {
    this.coffees = [...this.coffees, createCoffeDto];
    return createCoffeDto;
  }

  update(id: number, updateCoffeeDto: any) {
    const existingCoffee = this.findOne(id);

    if (existingCoffee) {
      this.coffees = this.coffees.map(coffee =>
        coffee.id === id ? { ...coffee, ...updateCoffeeDto } : coffee,
      );
    }
  }

  remove(id: number) {
    this.coffees = this.coffees.filter(coffee => coffee.id !== id);
  }
}

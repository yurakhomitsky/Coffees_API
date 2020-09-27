// nest g class coffees/dto/update-coffee.dto --no-spec

// npm i @nestjs/mapped-types
// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';
import { CreateCoffeeDto } from './create-coffee.dto';

// export class UpdateCoffeeDto {
//   readonly name?: string;
//   readonly brand?: string;
//   readonly flavors?: string[];
// }

// PartialType is returning the type of the class we pass into to it with all properties set to optional
// Also inherit all validation decorators
export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto) {}

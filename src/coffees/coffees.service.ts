import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import appConfig from '../config/app.config';
import { Connection, In, Repository } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Event } from '../events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly connection: Connection,
    @Inject(COFFEE_BRANDS) coffeeBrands: string[],
    private readonly configService: ConfigService,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {
    // with this approach we are getting config info from .env file
    // const databaseHost = this.configService.get<string>('DATABASE_HOST');

    // with this approach we are getting config info from app.config.ts I think it's because we imported it into ConfigModule
    // const databaseHost = this.configService.get('app');
    // console.log(databaseHost);

    console.log(appConfiguration);
    console.log(coffeeBrands);
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<Coffee[]> {
    const { limit, offset } = paginationQuery;

    return this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number): Promise<Coffee> {
    const coffee = await this.coffeeRepository.findOne(id, {
      relations: ['flavors'],
    });
    if (!coffee) {
      // throw new HttpException(`Coffe #${id} not found`, HttpStatus.NOT_FOUND);
      throw new NotFoundException(`Coffe #${id} not found`);
    }
    return coffee;
  }

  async create(createCoffeDto: CreateCoffeeDto): Promise<Coffee> {
    // we loop through array of flavors in createCoffeeDto in order to get or create flavor object

    const flavors = await Promise.all(
      createCoffeDto.flavors.map(flavor => this.preloadFlavorByName(flavor)),
    );

    // const flavors = await this.getFlavors(createCoffeDto.flavors);

    const coffee = await this.coffeeRepository.create({
      ...createCoffeDto,
      flavors,
    });
    return this.coffeeRepository.save(coffee);
  }

  async update(id: number, updateCoffeeDto: UpdateCoffeeDto): Promise<Coffee> {
    // checking flavors field because it's optional
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map(flavor => this.preloadFlavorByName(flavor)),
      ));

    const coffee = await this.coffeeRepository.preload({
      id,
      ...updateCoffeeDto,
      flavors,
    });

    if (!coffee) {
      throw new NotFoundException(`Coffe #${id} not found`);
    }
    return this.coffeeRepository.save(coffee);
  }

  async remove(id: number): Promise<Coffee> {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  async recommendCoffe(coffee: Coffee) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffee.recommendations++;
      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({ name });
    if (existingFlavor) {
      return existingFlavor;
    }
    return this.flavorRepository.create({ name });
  }

  private async getFlavors(flavors: string[]): Promise<Flavor[]> {
    const existingFlavors = await this.flavorRepository.find({
      where: { name: In(flavors) },
    });

    const notExistingFlavors = flavors.filter(
      name => !existingFlavors.find(flavor => flavor.name === name),
    );

    if (notExistingFlavors.length > 0) {
      const createdFlavors = await Promise.all(
        notExistingFlavors.map(name => this.flavorRepository.create({ name })),
      );
      return [...existingFlavors, ...createdFlavors];
    }

    return existingFlavors;
  }
}

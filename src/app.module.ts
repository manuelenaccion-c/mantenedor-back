import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entitys/user.entity';
import { UserServices } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { JwtModule } from '@nestjs/jwt';
import { Client } from './entitys/client.entity';
import { ClientController } from './controllers/client.controller';
import { ClientServices } from './services/client.services';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Client],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Client]),
    JwtModule.register({secret: process.env.JWT_SECRET, signOptions: {expiresIn: '1d'}})
  ],
  controllers: [ UserController, ClientController],
  providers: [ UserServices, ClientServices ],

})
export class AppModule {}

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entitys/user.entity';
import {  JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserServices {

    constructor(
        @InjectRepository(User) 
        private userRepository: Repository<User>,
        private jwtService: JwtService
      ) {}

    async create(body: any): Promise<User> {
        const { email, password } = body
        const newUser = new User();      
        newUser.email = email;
            
        const hashpassword = await bcrypt.hash(password, 10)
        newUser.password = hashpassword;
   
        return this.userRepository.save(newUser);
    }

    async login(body: any ): Promise<{ access_token: string}>{
        const { email, password } = body;
  
        const user = await this.userRepository.findOne({ where: { email } });
        
        if (!user) {
           throw new BadRequestException('Usuario Invalido')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Error en credenciales. Por favor, verifica tu usuario y contraseña.');
        }

        const payload = { sub: user.id, email: user.email }

        return  {
            access_token: await this.jwtService.signAsync(payload),
          }
    }
    
  
}

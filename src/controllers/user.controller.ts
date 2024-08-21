import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guard/auth.guard';
import { UserServices } from 'src/services/user.service';

@Controller('/user')
export class UserController {
  constructor(
    private  userService: UserServices
) {}

 
  @Post()
  create(@Body() body: any) {
    return this.userService.create(body);
  }

  @Post('/login')
  login(@Body() body: any){
    return this.userService.login(body)
  } 

  @UseGuards(AuthGuard)
  @Get('/validate-token')
  validateToken() {
      return true;
  }

}


import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Client } from 'src/entitys/client.entity';
import { AuthGuard } from 'src/guard/auth.guard';
import { ClientServices } from 'src/services/client.services';


@Controller('/client')
@UseGuards(AuthGuard)
export class ClientController {
  constructor(
    private  clientService: ClientServices
) {}


  @Post()
  createClient(@Body() body: any) {
  
    return this.clientService.createCliente(body);
  }

  @Get()
  async filterClient(
    @Query('filter') filter?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('gender') gender?: 'Masculino' | 'Femenino',
    @Query('status') status?: string 
  ): Promise<Client[]> {

    const sortByParsed = sortBy ? sortBy : null;
    const orderParsed = (order && (order === 'ASC' || order === 'DESC')) ? order : 'DESC';
    const statusParsed = status === 'true' ? true : (status === 'false' ? false : undefined);
  
    const clients = await this.clientService.filterClient({ filter, sortBy: sortByParsed, order: orderParsed, gender, status: statusParsed });
  
    if (clients.length === 0) {
      statusCode: 200  
      data: []
      message: 'No se encontraron clientes que coincidan con los criterios'
    }
  
    return clients;
  }

  @Get()
  getClients() {
    return this.clientService.getClients()
  }

  @Put(':id')
  updateClient(@Param('id') id: number, @Body() body: any){
    return this.clientService.updateClient(id, body)
  }

  @Delete(':id')
  deleteClient(@Param('id') id: number){
    return this.clientService.deleteClient(id)
  }





}

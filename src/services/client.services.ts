import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Client } from 'src/entitys/client.entity';
import { validateRut } from '@fdograph/rut-utilities';
import { formatDate, getMonthDate, validateEmail } from 'src/utils/utils';
import { log } from 'console';


@Injectable()
export class ClientServices {

    constructor(
        @InjectRepository(Client) 
        private clientRepository: Repository<Client>,
    ) {}
    
    
    private validateClientData(name: string, last_name: string, rut: string, email: string) {
    if (!validateRut(rut)) {
        throw new BadRequestException('RUT no es válido');
    }
    if (!validateEmail(email)) {
        throw new BadRequestException('Correo electrónico no es válido');
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
        throw new BadRequestException('El nombre solo puede contener letras y números');
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(last_name)) {
        throw new BadRequestException('El apellido solo puede contener letras y números');
    }
    }

    async getClients(): Promise<Client[]> {
        const users = await this.clientRepository.find()
        return users
    }

    async createCliente(body: any): Promise<Client>{
        const {name, last_name, rut, email, gender} = body
 
        const newClient = new Client();

        // Validar RUT
        this.validateClientData(name, last_name, rut, email);
    
        newClient.name = name;
        newClient.last_name = last_name;
        newClient.rut = rut;
        newClient.email = email;
        newClient.gender = gender;
    
        try {
            return await this.clientRepository.save(newClient);
          } catch (error) {
            if (error.code === '23505') {  // Código de error de violación de unicidad en PostgreSQL
              throw new BadRequestException('Este usuario ya ha sido registrado');
            }
          }
    }

    async updateClient(id: number, body: any): Promise<Client>{
        const { name, last_name, rut, email, gender, status} = body
    
        const existingClient = await this.clientRepository.findOne({ where: { id } });
        if (!existingClient) {
        throw new BadRequestException('Cliente no encontrado');
        }

        // Validar los datos
        this.validateClientData(name, last_name, rut, email);

        // Actualizar solo los campos necesarios
        existingClient.name = name || existingClient.name;
        existingClient.last_name = last_name || existingClient.last_name;
        existingClient.rut = rut || existingClient.rut;
        existingClient.email = email || existingClient.email;
        existingClient.gender = gender || existingClient.gender;
        existingClient.status = status !== undefined ? status : existingClient.status;

        try {
        return await this.clientRepository.save(existingClient);
        } catch (error) {
        if (error.code === '23505') {  // Código de error de violación de unicidad en PostgreSQL
            throw new BadRequestException('Este usuario ya ha sido registrado');
        }
        throw error; 
        }
    }

    async deleteClient(id: number): Promise<Client>{
        const existingClient = await this.clientRepository.findOne({ where: { id } });
        if (!existingClient) {
            throw new NotFoundException('Cliente no encontrado');
        }
        await this.clientRepository.delete(id);
        return existingClient;
    }

    async filterClient(params: { filter?: string; sortBy?: string; order?: 'ASC' | 'DESC', gender?:'Masculino' | 'Femenino', status?: boolean;}): Promise<Client[]> {
      const { filter, sortBy, order, gender, status } = params;
    
      const query = this.clientRepository.createQueryBuilder('client');
    
      if (filter) {
        query.andWhere(
          '(client.name ILIKE :filter OR client.last_name ILIKE :filter OR client.email ILIKE :filter OR client.rut ILIKE :filter)',
          { filter: `%${filter}%` }
        );
      }
    
      if (gender) {
        query.andWhere('client.gender = :gender', { gender });
      }
    
      if (status !== undefined) {
        query.andWhere('client.status = :status', { status });
      }
    
      if (sortBy) {
        query.addOrderBy(`client.${sortBy}`, order);
      }

      const clients = await query.getMany();
      if (clients.length === 0) {
        statusCode: 200  
        data: []
        message: 'No se encontraron clientes que coincidan con los criterios'
      }
    
      return clients;
    }

    async dashboardData() {
      const totalClients = await this.clientRepository.count();
      const activeClients = await this.clientRepository.count({ where: { status: true } });
      const inactiveClients = totalClients - activeClients;
      const genderMale = await this.clientRepository.count({where: {gender: "Masculino"}});
      const genderFemale = await this.clientRepository.count({where: {gender: "Femenino"}});
      const clientByMonth = await this.clientRepository.createQueryBuilder("client")
      .select("TO_CHAR(client.created_at, 'Month')", "month")
      .addSelect("COUNT(*)", "count")
      .groupBy("TO_CHAR(client.created_at, 'Month')")
      .orderBy("TO_CHAR(client.created_at, 'Month')")
      .getRawMany();

      const recentClients = await this.clientRepository.find({
        order: { created_at: 'DESC' },
        take: 3, // Limitar a los 3 clientes más recientes
      });

      const formatRecentClient = recentClients.map(element =>  (
          {
            name: element.name,
            last_name: element.last_name,
            created_at: formatDate(element.created_at)

          }
         ))
       
      const inactiveClientsData = await this.clientRepository.find({
        where: { status: false },
        order: { created_at: 'DESC' }
      });

      const orderClientsMonth = clientByMonth.length !== 0 ? clientByMonth.map(monthData => ({
        month: monthData.month.trim(),
        count: parseInt(monthData.count, 10)
      })) : [{month: getMonthDate(), count: 0}]

      return {
        statistics_clients: [
          { total: totalClients, title: "Clientes totales" },
          { total: activeClients, title: "Clientes activos" },
          { total: inactiveClients, title: "Clientes Inactivos" }
        ],
        gender_distribution: [
          {gender: "Masculino", count: genderMale},
          {gender: "Femenino", count: genderFemale}
        ],
        client_month: orderClientsMonth,
        recent_clients: formatRecentClient,
        inactive_clients_data: inactiveClientsData
      };
  }

  
}

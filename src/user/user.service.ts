import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { grade, classNumber, studentNumber } = createUserDto;
    
    // 중복 확인
    const existingUser = await this.userRepository.findOne({
      where: { grade, classNumber, studentNumber },
    });

    if (existingUser) {
      return existingUser; // 이미 존재하는 사용자면 기존 사용자 반환
    }

    const user = this.userRepository.create({
      grade,
      classNumber,
      studentNumber,
    });

    return await this.userRepository.save(user);
  }

  async findUserById(id: number): Promise<User> {
  const user = await this.userRepository.findOne({
    where: { id },
    relations: ['leftoverRecords'],
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

  async getUserStats(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['leftoverRecords'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const records = user.leftoverRecords;
    const total = records.length;
    
    if (total === 0) {
      return {
        total: 0,
        lowLeftover: 0,
        mediumLeftover: 0,
        highLeftover: 0,
      };
    }

    const lowLeftover = records.filter(r => r.leftoverLevel === 'LOW').length;
    const mediumLeftover = records.filter(r => r.leftoverLevel === 'MEDIUM').length;
    const highLeftover = records.filter(r => r.leftoverLevel === 'HIGH').length;

    return {
      total,
      lowLeftover,
      mediumLeftover,
      highLeftover,
    };
  }
}
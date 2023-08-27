import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
//   import { PostsEntity } from '../posts/posts.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UsersEntity } from './user.entity';

@Entity('Company')
export class CompanyEntity extends BaseEntity {
  @ApiProperty({
    example: 1,
    description: '회사 고유번호(추후 UUID로 변경)',
  })
  @PrimaryGeneratedColumn()
  company_id: number;

  @ApiProperty({
    example: 1,
    description: 'User테이블의 고유한 user_id로 Company와 1:1연결',
  })
  @Column()
  user_id: number;

  @ApiProperty({
    example: '123-34-56789',
    description: '사업자 등록번호',
  })
  @Column()
  eid: string;

  @ApiProperty({
    example: 'Basic',
    description: '사용자 등급/추후 등급별 권한 부여',
  })
  @Column({ default: 'Basic' })
  grade: string;

  @ApiProperty({
    example: '생략',
    description: '생성날짜 및 시간',
  })
  @CreateDateColumn()
  createdAt: Date;

  
  @ApiProperty({
    example: '생략',
    description: '업데이트 날짜 및 시간',
  })
  @CreateDateColumn()
  updatedAt: Date;


  @OneToOne(() => UsersEntity, (users) => users.user_id)
  users: UsersEntity[];
}

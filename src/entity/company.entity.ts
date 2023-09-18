import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
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
    example: '스파르파스타',
    description: '회사명',
  })
  @Column({ nullable: true })
  companyName: string;

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
  @Column({ nullable: true })
  eid: string;

  @ApiProperty({
    example: 'Trial',
    description: '사용자 등급/추후 등급별 권한 부여',
  })
  @Column({ default: 'Trial' })
  plan: string;

  @ApiProperty({
    example: '생략',
    description: '생성날짜 및 시간',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: ' 2023-09-16T11:28:03.889Z',
    description: '결제후 사용 시작되는 날짜',
  })
  @CreateDateColumn({ nullable: true })
  paymentStartDate: string;

  @ApiProperty({
    example: ' 2023-09-30T11:28:03.889Z',
    description: '결제후 만료되는 날짜',
  })
  @CreateDateColumn({ nullable: true })
  paymentExpirationDate: string;

  @ApiProperty({
    example: '생략',
    description: '생성날짜 및 시간',
  })
  @Column({ default: false, nullable: true })
  isPaid: boolean;

  @ApiProperty({
    example: '생략',
    description: '업데이트 날짜 및 시간',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UsersEntity, (users) => users.user_id)
  users: UsersEntity[];
}

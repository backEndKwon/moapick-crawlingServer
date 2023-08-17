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
import { ApplicantEntity } from './applicant.entity';

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

  // 그리팅 계정
  @ApiProperty({
    example: 'sparta123',
    description: '의뢰회사 원티드 계정',
  })
  @Column({ nullable: true })
  greeting_id: string;

  @ApiProperty({
    example: '123qwe',
    description: '의뢰회사 그리팅 계정 비밀번호',
  })
  @Column({ nullable: true })
  greeting_password: string;

  @ApiProperty({
    example: '132bksadbvl489yelkjhjasl90121209',
    description: '의뢰회사 그리팅 계정 API Key',
  })
  @Column({ nullable: true })
  greeting_apiKey: string;

  // 원티드 계정
  @ApiProperty({
    example: 'wantedId',
    description: '원티드 계정',
  })
  @Column({ nullable: true })
  wanted_id: string;

  @ApiProperty({
    example: 'wantedPassword',
    description: '원티드 계정 비밀번호',
  })
  @Column({ nullable: true })
  wanted_password: string;

  @OneToOne(() => UsersEntity, (users) => users.user_id)
  users: UsersEntity[];
  @OneToMany(() => ApplicantEntity, (applicant) => applicant.company_id)
  applicant: ApplicantEntity[];
}

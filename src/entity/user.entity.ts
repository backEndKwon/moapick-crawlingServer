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
import { CompanyEntity } from './company.entity';

@Entity('Users')
export class UsersEntity extends BaseEntity {
  @ApiProperty({
    example: 1,
    description: '사용자 고유번호(추후 UUID로 변경)',
  })
  @PrimaryGeneratedColumn()
  user_id: number;

  @ApiProperty({
    example: 'robot@naver.com',
    description: '사용자 이메일',
  })
  @Column()
  email: string;

  @ApiProperty({
    example: '123qwe!!',
    description: '사용자 비밀번호',
  })
  @Column({ nullable: true })
  password: string;

  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
  })
  @Column() //국내 이름 최대 길이 64자, 3byte * 64자 = 192
  name: string;

  @ApiProperty({
    example: '01012345678',
    description: '사용자 전화번호',
  })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({
    example: 'TRUE',
    description: 'TRUE = 로그인된 상태',
  })
  @Column({ default: false })
  isLogin: Boolean;

  @ApiProperty({
    example: '약관동의서',
    description: '약관동의서 확인여부',
  })
  @Column({ nullable: true, default: false })
  isTermsAgreement: Boolean;

  @ApiProperty({
    example: '약관동의서2',
    description: '약관동의서2 확인여부',
  })
  @Column({ nullable: true, default: false })
  isPrivacyPolicyAgreement: Boolean;

  @ApiProperty({
    example: '마케팅동의서',
    description: '마케팅동의서 확인여부',
  })
  @Column({ nullable: true, default: false })
  isMarketingAgreement: Boolean;

  @ApiProperty({
    example: '2023-08-13 16:04:47.60107',
    description: '사용자 계정 생성 일시',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2022-11-21',
    description: '사용자 계정 업데이트 일시',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => CompanyEntity, (company) => company.user_id)
  company: CompanyEntity[];
}

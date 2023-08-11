import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    CreateDateColumn,
    OneToMany,
    UpdateDateColumn
  } from 'typeorm';
//   import { PostsEntity } from '../posts/posts.entity';
import { ApiProperty } from '@nestjs/swagger';

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
    @Column({nullable: true})
    password: string;
  
    @ApiProperty({
      example: '홍길동',
      description: '사용자 이름',
    })
    @Column()//국내 이름 최대 길이 64자, 3byte * 64자 = 192
    name: string;
  
    @ApiProperty({
      example: '010-1234-5678',
      description: '사용자 전화번호',
    })
    @Column()
    phone: string;
  
    @ApiProperty({
      example: '2021-01-01',
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
  
    // @OneToMany(() => PostsEntity, (posts) => posts.users)
    // posts: PostsEntity[];
  }
  
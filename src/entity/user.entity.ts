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
  
  @Entity('Users')
  export class UsersEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    user_id: number;
  
    @Column()
    email: string;
  
    @Column()
    password: string;
  
    @Column()
    name: string;
  
    @Column()
    phone: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // @OneToMany(() => PostsEntity, (posts) => posts.users)
    // posts: PostsEntity[];
  }
  
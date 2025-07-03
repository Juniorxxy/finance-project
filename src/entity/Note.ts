import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./User.js";

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  content!: string;

  @Column()
  userId!: number;

  @Column()
  recipientId!: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "userId" })
  user?: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "recipientId" })
  recipient?: User;

  @CreateDateColumn()
  createdAt!: Date;
}

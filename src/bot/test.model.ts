import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class Test extends Model<Test> {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  question: string;

  @Column
  subject: string;

  @Column
  answers: string;

  @Column
  correctAnswer: string;

  @Column
  createdAt: Date;

  @Column
  updatedAt: Date;
}

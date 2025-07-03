var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, } from "typeorm";
import { User } from "./User.js";
let Note = class Note {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Note.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Note.prototype, "title", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Note.prototype, "content", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Note.prototype, "userId", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Note.prototype, "recipientId", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.id),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], Note.prototype, "user", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.id),
    JoinColumn({ name: "recipientId" }),
    __metadata("design:type", User)
], Note.prototype, "recipient", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Note.prototype, "createdAt", void 0);
Note = __decorate([
    Entity()
], Note);
export { Note };

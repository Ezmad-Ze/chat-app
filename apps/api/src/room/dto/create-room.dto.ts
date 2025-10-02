import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MinLength(3, { message: 'Room name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Room name cannot exceed 50 characters' })
  name: string;
}
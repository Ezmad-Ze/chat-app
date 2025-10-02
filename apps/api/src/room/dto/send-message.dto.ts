import { IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  roomId: string;

  @IsString()
  @MinLength(1, { message: 'Message cannot be empty' })
  content: string;
}
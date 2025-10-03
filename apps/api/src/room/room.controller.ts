import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Request,
  UsePipes,
  ValidationPipe 
} from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  async getRooms() {
    return this.roomService.getRooms();
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createRoom(@Body() createRoomDto: CreateRoomDto, @Request() req) {
    return this.roomService.createRoom(createRoomDto.name, req.user.sub);
  }
}
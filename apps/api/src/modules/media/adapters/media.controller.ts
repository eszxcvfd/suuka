import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MediaService } from '../application/media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  list(@Query('ownerUserId') ownerUserId = 'demo-user') {
    return this.mediaService.list(ownerUserId);
  }

  @Post()
  upload(@Body() body: { ownerUserId?: string; filename: string }) {
    return this.mediaService.upload(body.ownerUserId ?? 'demo-user', body.filename);
  }
}

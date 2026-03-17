import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../application/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() body: { email: string; password: string; displayName: string }) {
    return this.authService.signUp(body.email, body.displayName);
  }

  @Post('sign-in')
  signIn(@Body() body: { email: string; password: string }) {
    return this.authService.signIn(body.email);
  }
}

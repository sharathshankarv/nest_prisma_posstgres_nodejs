import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.auth_token,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const reqId = req.headers['x-request-id'] || 'N/A';
    this.logger.log(
      `Validating JWT for userId: ${payload.sub} , request ID: ${reqId}`,
    );
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        role: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') 
{
		constructor(private prisma: PrismaService) {
			super(
                {
				jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      			secretOrKey: process.env.JWT_SECRET,
			});
		}

		async validate(payload: {sub: string;})
        {
			const user : User = await this.prisma.user.findUnique(
                {
				where:
                {
					id: payload.sub
				},
			});
			return user;
		}
}
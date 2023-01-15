import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from "../../prisma/prisma.service";
import { JwtPayload } from "../interface/jwtpayload.dto";

@Injectable()
export class FirstStepAuthStrategy extends PassportStrategy(Strategy, 'first-step') 
{
		constructor(private prisma: PrismaService) {
			super(
                {
				jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      			secretOrKey: process.env.JWT_SECRET,
			});
		}

		async validate(payload: JwtPayload)
        {
			const user : User = await this.prisma.user.findUnique(
                {
				where:
                {
					id: payload.id
				},
			});
			if (!user) {
                throw new UnauthorizedException()
            }
			return user;
		}
}
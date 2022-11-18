import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from "../../prisma/prisma.service";
import { JwtPayload } from "../interface/jwtpayload.dto";

@Injectable()
export class TwoFaStrategy extends PassportStrategy(Strategy, 'twofa') 
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
            if (!user.twoFaEnabled) {
                return user;
            }
            if (payload.isTwoFaAuthenticated) {
                return user;
            }
		}
}
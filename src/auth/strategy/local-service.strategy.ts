


//인증 전략을 생성할 때 사용하는 클래스 = passportstrategy
import { Injectable, HttpStatus } from "@nestjs/common";
import { Strategy } from "passport-local";
import { AuthException } from "src/exceptions/authException";
import { AuthService } from "../auth.service";
import { PassportStrategy } from "@nestjs/passport";
@Injectable()
export class LocalServiceStrategy extends PassportStrategy(Strategy, 'local-service'){
    constructor(private authService: AuthService){
        super({
            usernameField:'email',
            passwordField:'password',
        })
    }
    //함수명은 무조건 validate
    async validate(email:string,password:string):Promise<any>{
        const user = await this.authService.validateUser(email,password);
        if(!user){
            throw new AuthException('인증되지 않았습니다.',HttpStatus.UNAUTHORIZED);
        }
        return user;
    }
}
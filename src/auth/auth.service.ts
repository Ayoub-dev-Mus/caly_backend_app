import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signin.dto';
import * as nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';
import serviceAccount from '../../src/config/mykey.json';

@Injectable()
export class AuthService {
  private otpStore: Map<string, string> = new Map();
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }

  async signUp(
    createUserDto: SignUpDto,
  ): Promise<{ token: string; refreshToken: string; User: Partial<User> }> {
    try {
      createUserDto.email = createUserDto.email.toLowerCase();
      Logger.log(createUserDto);
      const existingUser = await this.usersService.findOneByEmail(
        createUserDto.email,
      );
      Logger.warn(existingUser);
      const hash = await this.hashData(createUserDto.password);

      const newUser = await this.usersService.create({
        ...createUserDto,
        password: hash,
        role: Role.USER,
        profilePicture: null,
      });

      if (!newUser) {
        throw new Error('User creation failed.');
      }

      const tokens = await this.getTokens(
        newUser.id,
        newUser.email,
        newUser.role,
        newUser.firstName,
        newUser.lastName,
        newUser.state,

        newUser.address,
        newUser.zipCode,
        newUser.phoneNumber,
      );

      // Prepare response object
      const response = {
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        User: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          zipCode: newUser.zipCode,
          state: newUser.state,
          address: newUser.address,
          phone: newUser.phoneNumber,
          role: newUser.role,
        },
      };

      // Update the refresh token in the database
      await this.updateRefreshToken(newUser.id, tokens.refreshToken);

      return response;
    } catch (error) {
      console.error('Error during sign-up:', error);
      throw error;
    }
  }


  async signIn(data: SignInDto) {
    try {
      const EXPIRE_TIME = 15 * 60 * 1000;
      const emailLowerCase = data.email.toLowerCase();
      const user = await this.usersService.findOneByEmail(emailLowerCase);



      const passwordMatches = await bcrypt.compare(
        data.password,
        user.password,
      );



      if (!passwordMatches) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      if (user.role === Role.STORE_OWNER || user.role === Role.STORE_STAFF) {
        const tokens = await this.getTokens(
          user.id,
          user.email,
          user.role,
          user.firstName,
          user.lastName,
          user.state,
          user.zipCode,
          user.address,
          user.phoneNumber,
          user.profilePicture,
          user.store.id,
        );

       
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        const response = {
          token: tokens.token,
          refreshToken: tokens.refreshToken,
          expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
          User: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            zipCode: user.zipCode,
            address: user.address,
            state: user.state,
            profilePicture: user.profilePicture,
            role: user.role,
            storeId: user.store.id,
          },
        };
        return response;
      } else if (user.role === Role.USER) {
        const tokens = await this.getTokens(
          user.id,
          user.email,
          user.role,
          user.firstName,
          user.lastName,
          user.state,
          user.zipCode,
          user.address,
          user.phoneNumber,
          user.profilePicture,

        );


        await this.updateRefreshToken(user.id, tokens.refreshToken);

        const response = {
          token: tokens.token,
          refreshToken: tokens.refreshToken,
          expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
          User: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            zipCode: user.zipCode,
            address: user.address,
            state: user.state,
            profilePicture: user.profilePicture,
            role: user.role,


          },
        };

        return response;
      }


    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async logout(id: string) {
    return this.usersService.update(id, { refreshToken: null });
  }

  private async hashData(data: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(data, saltRounds);
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    await this.usersService.update(id, {
      refreshToken: refreshToken,
    });
  }

  async getTokens(
    id: string,
    email: string,
    role: string,
    firstName: string,
    lastName: string,
    zipCode: string,
    state: string,
    address: string,
    phoneNumber: string,
    profilePicture: string = null,
    storeId: number = null,

  ) {
    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: id,
          email,
          firstName,
          lastName,
          zipCode,
          state,
          address,
          phoneNumber,
          profilePicture,
          role,
          storeId
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          id: id,
          email,
          firstName,
          lastName,
          zipCode,
          state,
          address,
          phoneNumber,
          profilePicture,
          role,
          storeId
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      token,
      refreshToken,
    };
  }

  async refreshToken(user: User): Promise<{
    token: string;
    refreshToken: string;
    expiresIn: number;
    User: Partial<User>;
  }> {
    const EXPIRE_TIME = 15 * 60 * 1000;

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.firstName,
      user.lastName,
      user.state,
      user.zipCode,
      user.address,
      user.phoneNumber,

    );

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const myuser = await this.usersService.findOneById(user.id);

    const response = {
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      expiresIn: new Date().getTime() + EXPIRE_TIME,
      User: {
        id: myuser.id,
        email: myuser.email,
        firstName: myuser.firstName,
        lastName: myuser.lastName,
        zipCode: myuser.zipCode,
        state: myuser.state,
        role: myuser.role,
      },
    };

    return response;
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const user = await this.usersService.findOneByEmail(email.toLowerCase());

      if (!user) {
        throw new BadRequestException('User with this email does not exist');
      }

      const otp = this.generateNumericOTP(6);

      await this.sendPasswordResetEmail(user.email, otp);

      // Store the OTP in the in-memory store
      this.otpStore.set(user.id, otp);
    } catch (error) {
      Logger.error('Error during forgot password:', error);
      throw error;
    }
  }
  generateNumericOTP(length: number): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await this.usersService.findOneByEmail(email.toLowerCase());
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    const storedOTP = this.otpStore.get(user.id);

    Logger.log(storedOTP);

    if (storedOTP === otp) {
      return true;
    } else {
      throw new BadRequestException('Invalid OTP');
    }
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const user = await this.usersService.findOneByEmail(email.toLowerCase());

      if (!user) {
        throw new BadRequestException('User with this email does not exist');
      }

      if (!this.otpStore.has(user.id)) {
        throw new ForbiddenException('OTP expired');
      }

      const hashedPassword = await this.hashData(newPassword);

      await this.usersService.update(user.id, { password: hashedPassword });

      this.otpStore.delete(user.id);
    } catch (error) {
      Logger.error('Error resetting password:', error.message);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'ayoub.wahid.28.2000@gmail.com',
          pass: 'hzjm gmtp sfes pguw',
        },
      });

      const mailOptions = {
        from: 'caly22@gmail.com',
        to: email,
        subject: 'Password Reset OTP - Caly',
        text: `Your OTP for password reset is : ${otp}`,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      Logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async googleLogin(token: string): Promise<any> {
    try {
      const { email, firstName, lastName, picture } =
        await this.verifyFirebaseToken(token);

      let user = await this.usersService.findOneByEmail(email);

      if (!user) {
        user = await this.usersService.create({
          email,
          firstName,
          lastName,
          role: Role.USER,
          address: '',
          phoneNumber: '',
          zipCode: '',
          state: '',
          password: '',
          profilePicture: picture,
        });
      } else {

        const tokens = await this.getTokens(
          user.id,
          user.email,
          user.role,
          user.firstName,
          user.lastName,
          user.state,
          user.zipCode,
          user.address,
          user.phoneNumber,
          user.profilePicture,
        );
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        const response = {
          token: tokens.token,
          refreshToken: tokens.refreshToken,
          User: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            zipCode: user.zipCode,
            address: user.address,
            state: user.state,
            profilePicture: user.profilePicture,
            role: user.role,
          },
        };

        return response;
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async verifyFirebaseToken(idToken: string): Promise<any> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      // Assuming decodedToken includes 'name' and 'picture'
      const fullName = decodedToken.name;
      let firstName = '',
        lastName = '';
      if (fullName) {
        const names = fullName.split(' ');
        firstName = names[0];
        lastName = names.slice(1).join(' ');
      }
      // Return all needed details including email, first name, last name, and picture if available
      return {
        email: decodedToken.email,
        firstName,
        lastName,
        picture: decodedToken.picture,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to verify Firebase ID Token ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

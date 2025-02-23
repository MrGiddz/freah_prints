import { Base, Document } from "../data/config/base-model";
import bcrypt from "bcrypt";

export interface AuthInfo {
  resetPasswordOTP?: string;
  resetPasswordOTPExpires?: Date;
  recoveryToken?: string;
  recoveryTokenExpires?: Date;
}

export interface UserInt {
  name: string;
  email: string;
  password: string;
  auth?: AuthInfo;
  id?: string;
}

export interface UserDocument extends Document<UserInt> {
  comparePassword(password: string): Promise<boolean>;
  setPasswordResetToken(token: string, expiry: Date): Promise<void>;
  setRefreshToken(token: string, expiry: Date): Promise<void>;
}

export class User extends Base<UserInt> {
  constructor() {
    super("users", ["email"]);
  }

  /**
   * Creates a new user with a hashed password.
   */
  async create(data: UserInt): Promise<UserDocument> {
    data.password = await bcrypt.hash(data.password, 10);
    const user = await super.create(data);

    // Convert plain object to a UserDocument instance
    return this.attachMethods(user);
  }

  /**
   * Finds a user by a given condition and returns a UserDocument instance.
   */
  async findOne(
    condition: Partial<UserInt>
  ): Promise<UserDocument | undefined> {
    const user = await super.findOne(condition);
    return user ? this.attachMethods(user) : undefined;
  }

  private attachMethods(user: Document<UserInt>): UserDocument {
    return {
      ...user,
      comparePassword: async function (password: string): Promise<boolean> {
        const isMatch = await bcrypt.compare(password, this.password);
        console.log({ isMatch, password });
        return isMatch;
      },
      setPasswordResetToken: async function (
        token: string,
        expiry: Date
      ): Promise<void> {
        await UserModel.update(
          { id: this.id },
          { auth: { resetPasswordOTP: token, resetPasswordOTPExpires: expiry } }
        );
      },
      setRefreshToken: async function (
        token: string,
        expiry: Date
      ): Promise<void> {
        await UserModel.update(
          { id: this.id },
          { auth: { recoveryToken: token, recoveryTokenExpires: expiry } }
        );
      },
    } as UserDocument;
  }
}

const UserModel = new User();
export default UserModel;

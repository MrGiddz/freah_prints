import { Base } from "../data/config/base-model";

export interface ApparelSize {
  size?: string;
  sizeId?: string;
  quantity?: number;
  price: number;
}

export interface ApparelInt {
  code: string;
  name: string;
  variants: ApparelSize[];
  added_by: string;
}

class Apparel extends Base<ApparelInt> {
  constructor() {
    super("apparel", ["code"]);
  }
}

export default new Apparel();

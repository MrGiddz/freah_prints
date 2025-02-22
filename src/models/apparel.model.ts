import { Base } from "../db/config/base-model";

export interface ApparelColor {
  color: string;
  quantity: number;
  price: number;
}

export interface ApparelSize {
  size: string;
  sizeId: string;
  colors: ApparelColor[];
}

export interface ApparelInt {
  code: string;
  name: string;
  totalQuantity: number;
  variants: ApparelSize[];
  added_by: string;
}

class Apparel extends Base<ApparelInt> {
  constructor() {
    super("apparel", ["code"]);
  }
}

export default new Apparel();

import { StatusInterface } from "./status.interface";

export class SuccessStatusClass implements StatusInterface {
  public status = "success";
  public message;
  constructor(message: string) {
    this.message = message;
  }
}

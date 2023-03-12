import { StatusInterface } from "./status.interface";

export class DBErrorStatusClass implements StatusInterface {
  public status = "db_error";
  public message;
  constructor(message: string) {
    this.message = message;
  }
}

export class NotFoundErrorStatusClass implements StatusInterface {
  public status = "not_found_error";
  public message;
  constructor(message: string) {
    this.message = message;
  }
}

export class MoreThanOneWordErrorStatusClass implements StatusInterface {
  public status = "more_than_one_word_error";
  public message;
  constructor(message: string) {
    this.message = message;
  }
}

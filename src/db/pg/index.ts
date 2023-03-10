import { Pool } from "pg";
import postgresConfig from "./db.config";
import * as dotenv from "dotenv";

dotenv.config();

class postgresDriver {
  private _client;
  private _config: postgresConfig;
  constructor(
    config: postgresConfig = {
      user: <string>process.env.PG_USER,
      password: <string>process.env.PG_PASSWORD,
      host: <string>process.env.PG_HOST,
      database: <string>process.env.PG_DATABASE,
      port: +(<string>process.env.PORT),
    }
  ) {
    this._config = config;
    this._client = new Pool(this._config);
  }

  public async connect() {
    try {
      this._client = new Pool(this._config);
      await this._client.connect();
    } catch (error) {
      throw new Error(`Error while connecting to database: ${error}`);
    }
  }

  public async closeConnection() {
    try {
      await this._client.end();
    } catch (error) {
      throw new Error(`Error while connecting to database: ${error}`);
    }
  }

  public async executeQuery(query: any) {
    try {
      return await this._client.query(query);
    } catch (error) {
      throw new Error(`Error while connecting to database: ${error}`);
    }
  }
}

const dbHandler = new postgresDriver();

export default dbHandler;

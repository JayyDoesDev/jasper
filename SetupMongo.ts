import mongoose, { ConnectOptions } from "mongoose";
export interface Mongo {
	uri: string;
	config?: ConnectOptions
}

export function SetupMongo(options: Mongo): void {
	mongoose.connect(options.uri, options.config);

	mongoose.connection.on('connected', () => {
		console.log("Database connected");
	})

	mongoose.connection.on("disconnected", () => {
		console.log("Database disconnected")
	})
}
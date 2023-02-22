import { Server } from "../utils/server";
import { registerHanlder } from "./rollHandler";

export function registerHanlders(server:Server){
    registerHanlder(server)
}
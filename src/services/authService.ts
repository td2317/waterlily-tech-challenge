import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const users = new Map<string, { id: string; email: string; password: string}>();
const uid = () => Math.random().toString(36).slice(2,10);

export async function register(email: string, password: string) {
    const e = email.trim().toLowerCase();
    if(users.has(e)) throw { status: 409, code: "email_exists"};
    const hash = await bcrypt.hash(password, 10);
    const user = {id: uid(), email: e, password:hash};
    users.set(e, user);
    return { id: user.id, email: user.email};
}

export async function login (email: string, password: string) {
    const e = email.trim().toLowerCase();
    const user = users.get(e);
    if(!user) throw { status: 401, code: "invalid_credentials"};
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) throw { status: 4401, code: "invalid_credentials"};
    const token = jwt.sign({ sub: user.id}, JWT_SECRET, {expiresIn: "2h"});
    return { token, user: {id: user.id, email: user.email} };
}



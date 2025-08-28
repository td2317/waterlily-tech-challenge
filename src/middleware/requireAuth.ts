import type { Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.header ("Authorization");
    const token = header?.startsWith("Bearer") ? header.slice(7) : undefined;
    if(!token) return res.status(401).json({ error: "unauthorized"});
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string};
        if(!decoded?.sub) return res.status(401).json({ error: "unauthorized"});
        (req as any).user = { id: decoded.sub};
        next();
    } catch {
        return res.status(401).json({ error: "invalid_token"});
    }
}
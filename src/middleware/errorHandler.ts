import {ZodError, type ZodIssue} from "zod";
import type { Request, Response, NextFunction} from "express";

export function errorHandler (err: any, _req: Request, res: Response, _next: NextFunction) {
    if( err instanceof ZodError) {
        return res.status(400).json({
            error: "validation_error",
            issues: err.issues.map((e: ZodIssue) => ({ path: e.path, message: e.message})),
        });
    }
    if(err && typeof err === "object" && "status" in err) {
        const status = (err.status as number) ?? 500;
        const payload: any = { error: (err as any).code ?? "unknown_error"};
        if((err as any).issues) payload.issues = (err as any).issues;
        return res.status(status). json(payload);
    }
    console.error(err);
    return res.status(500).json({ error: "internal_error"});
}
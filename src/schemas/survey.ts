import {z} from "zod";

export const CreateSurveySchema = z.object({
    title:z.string().min(1, "title is required"),
    questions:z.array(
        z.object({
            text:z.string().min(1, "questions text is required"),
            description: z.string().optional()
        })
    ).min(1, "atleast one questions is required")
});

export const SubmitResponseSchema = z.object({
            surveyId:z.string().min(1, "surveyId is required"),
            answers:z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
});

export type CreateSurveyInput = z.infer<typeof CreateSurveySchema>;
export type SubmitResponseInput = z.infer<typeof SubmitResponseSchema>;


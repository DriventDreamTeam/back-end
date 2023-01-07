import { ApplicationError } from "@/protocols";

export function timeConflictError(): ApplicationError {
  return {
    name: "timeConflictError",
    message: "This activity conflicts whith another one",
  };
}

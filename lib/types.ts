export interface NavLink {
  readonly href: string;
  readonly label: string;
}

export interface BadgeItem {
  readonly title: string;
  readonly desc: string;
}

export interface ProblemItem {
  readonly num: string;
  readonly title: string;
  readonly text: string;
}

export interface StepItem {
  readonly n: string;
  readonly title: string;
  readonly text: string;
}

export interface ContactFormData {
  readonly name: string;
  readonly biz: string;
  readonly phone: string;
  readonly msg: string;
}

export interface ContactFieldErrors {
  name?: string;
  biz?: string;
  phone?: string;
  msg?: string;
  form?: string;
}

export type ContactFieldName = keyof ContactFormData;

export type ContactInputFieldName = Exclude<ContactFieldName, "msg">;

export interface FieldProps {
  readonly id: ContactInputFieldName;
  readonly label: string;
  readonly placeholder: string;
  readonly type: "text" | "tel";
  readonly error?: string;
  readonly maxLength: number;
  readonly required?: boolean;
}

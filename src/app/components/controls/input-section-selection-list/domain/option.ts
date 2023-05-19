export interface Option<T = any> {
  label: string;
  value: T;
  searches: string[];
  section: string;
  checked?: boolean;
}

export interface Renderable {
  id: string;
  type: string;
  visible?: boolean;
  render(context: unknown): void;
}

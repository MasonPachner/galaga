export abstract class GalagaScreen {
    public abstract readonly screenName: string;
    public abstract initialize(): void;
    public abstract run(args?: any): void;
}
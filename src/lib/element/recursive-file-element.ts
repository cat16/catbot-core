import FileElement from "./file-element";

export abstract class RecursiveFileElement<T extends RecursiveFileElement<any>> extends FileElement {

    private parent?: T;
    private children: T[];

    constructor(path: string, parent?: T) {
        super(path);
        this.parent = parent;
        this.children = [];
    }

    public getParent(): T {
        return this.parent;
    }

    public getChildren(): T[] {
        return this.children;
    }

    public addChildren(...children: T[]): void {
        this.children.push(...children);
    }

    public removeChild(child: T): void {
        const childIndex = this.children.findIndex((c) => c.getPath() === child.getPath());
        if (childIndex === -1) {
            return;
        }
        this.children.splice(childIndex, 1);
    }

    public replaceChild(child: T): T {
        const index = this.children.findIndex((c) => c.getPath() === child.getPath());
        if (index === -1) {
            return null;
        } else {
            const oldChild = this.children[index];
            this.children[index] = child;
            return oldChild;
        }
    }

}

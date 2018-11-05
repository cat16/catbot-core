export interface FlatLoadOptions {
  targetFile?: string;
}

export default class FlatDirLoader<E extends FileElement> {
  constructor(
    directory: string,
    generator: FileElementFactory<E>,
    options: FlatLoadOptions = {}
  ) {
    const targetFile = options.targetFile;
    const files = targetFile
      ? getDirectories(directory).filter(dir =>
          getFiles(dir).includes(`${targetFile}.js`)
        )
      : getFiles(directory).filter(file => file.endsWith("js"));
    const elements = new Map<string, E | Error>();
    requireFiles(
      files.map(file => (targetFile ? `${file}/${targetFile}` : file))
    ).forEach((rawElement, fileName) => {
      if (targetFile) {
        fileName = fileName.slice(fileName.indexOf("/") + 1);
      }
      let element;
      try {
        element =
          rawElement instanceof Error
            ? rawElement
            : generator.generate(rawElement, fileName);
      } catch (err) {
        element = err;
      }
      elements.set(fileName, element);
    });
    return elements;
  }
}
